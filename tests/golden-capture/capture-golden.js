#!/usr/bin/env node
'use strict';

/**
 * 黃金樣本擷取器：用 headless Chromium 跑「原工具」，走與使用者相同的操作路徑
 * （上傳公版 → 上傳素材 → 上傳工單 → 選分頁/專案 → 預覽檔案 → 下載圖片），
 * 把輸出圖與批次 JSON 存進 tests/golden/<工具>/。原工具檔案不做任何修改。
 *
 * 用法：
 *   node capture-golden.js discover --tool 正式BN                       列出分頁與偵測到的專案
 *   node capture-golden.js probe    --tool 正式BN [--sheets "分頁A|分頁B"]  每個分頁試產一次，回報產出數（不匯出）；--sheets 用 | 分隔完整分頁名，只試指定分頁
 *   node capture-golden.js capture  --tool 正式BN --sheet "正式BN(319發單)" [--project 名稱|__ALL__]
 *   共用選項：--config <檔>（預設 tools.config.json；整合版回歸用 tools.integrated.json）、--out <資料夾>（擷取結果輸出位置，預設 tests/golden）
 *
 * 環境變數：
 *   GOLDEN_SOURCE_ROOT   #整合版本 資料夾（含 18節 13 個原工具）
 *   GOLDEN_WORK_DIR      工具複本暫存位置（路徑須為純 ASCII，CDP 檔案上傳對 # 與中文路徑失效）
 *   NODE_PATH            puppeteer-core / @sparticuz/chromium / jszip / xlsx 所在的 node_modules
 *                        （不在此資料夾 npm install，避免把 Chromium 二進位塞進 repo）
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { startStaticServer } = require('./lib/static-server');
const { launchBrowser, interceptCdn } = require('./lib/browser');
const driver = require('./lib/tool-driver');

const HERE = __dirname;
const GOLDEN_DIR = path.join(HERE, '..', 'golden');
/** 擷取結果輸出位置：預設寫進 tests/golden；回歸時用 --out 指到別處（如 tests/regression-out），不覆蓋黃金樣本。 */
let outputRoot = GOLDEN_DIR;

/** 進度訊息走 stderr，stdout 只留 JSON 結果，方便呼叫端直接解析。 */
function log(message) {
  process.stderr.write(`[${new Date().toISOString().slice(11, 19)}] ${message}\n`);
}

function parseArgs(argv) {
  const [mode, ...rest] = argv;
  const args = { mode };
  for (let i = 0; i < rest.length; i += 2) args[rest[i].replace(/^--/, '')] = rest[i + 1];
  return args;
}

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`缺少環境變數 ${name}`);
  return process.env[name];
}

/**
 * 把工具複製到純 ASCII 路徑（內容不變），只為了讓 CDP 檔案上傳可用。
 * 兩種佈局：
 *   - 原工具（預設）：工具資料夾就是網站根目錄，字型在 <tool>/fonts/。
 *   - 整合版（config.fontsDir 有值）：網站根目錄＝<root>/，工具在 <root>/tools/<id>/，共用字型在 <root>/fonts/
 *     （工具頁用 ../../fonts/ 相對路徑）。
 * 回傳 { siteRoot, toolDir, indexPath }。
 */
function prepareWorkCopy(toolName, config) {
  const sourceRoot = requireEnv('GOLDEN_SOURCE_ROOT');
  const siteRoot = path.join(requireEnv('GOLDEN_WORK_DIR'), asciiSlug(toolName));
  fs.rmSync(siteRoot, { recursive: true, force: true });
  if (!config.fontsDir) {
    fs.cpSync(path.join(sourceRoot, config.sourceDir), siteRoot, { recursive: true });
    return { siteRoot, toolDir: siteRoot, indexPath: '/index.html' };
  }
  const toolDir = path.join(siteRoot, 'tools', 'tool');
  fs.cpSync(path.join(sourceRoot, config.sourceDir), toolDir, { recursive: true });
  fs.cpSync(path.join(sourceRoot, config.fontsDir), path.join(siteRoot, 'fonts'), { recursive: true });
  return { siteRoot, toolDir, indexPath: '/tools/tool/index.html' };
}

/** 工單檔位置：整合版把工單移到 tests/golden-inputs/<id>/（config.workbookDir），原工具則在工具資料夾內。 */
function workbookPath(toolDir, config) {
  return config.workbookDir
    ? path.join(requireEnv('GOLDEN_SOURCE_ROOT'), config.workbookDir, config.workbook)
    : path.join(toolDir, config.workbook);
}

function asciiSlug(text) {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 8);
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function listFilesRecursive(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFilesRecursive(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  }).sort();
}

function inputManifest(toolDir, config) {
  const { templates, assets } = config.uploads;
  const hashDir = (dir) => Object.fromEntries(listFilesRecursive(path.join(toolDir, dir)).map((rel) => [rel, sha256(path.join(toolDir, dir, rel))]));
  return {
    workbook: { file: config.workbook, sha256: sha256(workbookPath(toolDir, config)) },
    templates: hashDir(templates.dir),
    assets: hashDir(assets.dir),
  };
}

async function openTool(toolName, config) {
  const { siteRoot, toolDir, indexPath } = prepareWorkCopy(toolName, config);
  const server = await startStaticServer(siteRoot);
  const { browser, version } = await launchBrowser();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => { if (response.status() >= 400) consoleErrors.push(`HTTP ${response.status()} ${response.url()}`); });
  page.on('dialog', (dialog) => dialog.dismiss());
  await interceptCdn(page, config.cdn, (file) => require.resolve(file));
  await page.goto(`${server.origin}${indexPath}`, { waitUntil: 'load' });
  const rules = await driver.waitForAppReady(page);
  log(`${toolName}: app ready, uploading templates / assets / workbook ...`);
  const uploaded = await driver.uploadInputs(page, toolDir, workbookPath(toolDir, config), config);
  log(`${toolName}: templates ${uploaded.templateCount}, assets ${uploaded.assetCount}, sheets ${uploaded.sheetNames.length}`);
  const close = async () => { await browser.close(); server.close(); };
  return { page, toolDir, version, rules, uploaded, consoleErrors, close };
}

async function discover(toolName, config) {
  const session = await openTool(toolName, config);
  try {
    const sheets = [];
    for (const sheetName of session.uploaded.sheetNames) {
      const projects = await driver.selectSheet(session.page, sheetName);
      sheets.push({ sheetName, projects });
    }
    return { chrome: session.version, rules: session.rules, uploaded: session.uploaded, sheets, consoleErrors: session.consoleErrors };
  } finally { await session.close(); }
}

/**
 * 探測：同一個瀏覽器工作階段內，對工單每個分頁（有專案就選「全部」）各跑一次產生，
 * 只記錄產出數／未命中／錯誤，不匯出圖檔。用來決定哪些分頁值得擷取為黃金樣本。
 */
async function probe(toolName, config, sheetFilter) {
  const session = await openTool(toolName, config);
  try {
    const results = [];
    const wanted = sheetFilter ? sheetFilter.split('|') : null;
    const sheetNames = session.uploaded.sheetNames.filter((name) => !wanted || wanted.includes(name));
    for (const sheetName of sheetNames) {
      const projects = await driver.selectSheet(session.page, sheetName);
      const project = projects.length ? driver.ALL_PROJECTS_VALUE : '';
      log(`probe ${toolName} / ${sheetName} ...`);
      const result = await driver.generate(session.page, sheetName, project);
      log(`  → generated ${result.generated}`);
      results.push({ sheetName, projects, generated: result.generated, unmatched: result.unmatched.length, error: result.error, alerts: result.alerts, hostReviewAutoConfirmed: result.hostReviewAutoConfirmed });
    }
    return { tool: toolName, uploaded: session.uploaded, results };
  } finally { await session.close(); }
}

async function capture(toolName, config, sheetName, project) {
  const session = await openTool(toolName, config);
  try {
    const result = await driver.generate(session.page, sheetName, project);
    if (!result.generated) return { ...result, chrome: session.version, exported: 0 };

    const zipBuffer = await driver.exportZip(session.page, config.exportFormat || 'auto');
    const sessionDump = await driver.dumpSession(session.page);

    const caseDir = path.join(outputRoot, toolName, caseFolderName(sheetName, project));
    const previousFiles = clearCaseDir(caseDir);
    fs.mkdirSync(path.join(caseDir, 'images'), { recursive: true });
    const exported = await extractZip(zipBuffer, path.join(caseDir, 'images'));
    const staleFiles = previousFiles.filter((rel) => !exported.includes(rel));
    fs.writeFileSync(path.join(caseDir, 'session.json'), JSON.stringify(sessionDump, null, 2));
    fs.writeFileSync(path.join(caseDir, 'capture-meta.json'), JSON.stringify({
      tool: toolName, sheetName, project: project || '', capturedAt: new Date().toISOString(),
      chrome: session.version, rules: session.rules, uploaded: session.uploaded,
      generated: result.generated, exported: exported.length, unmatched: result.unmatched, alerts: result.alerts, hostReviewAutoConfirmed: result.hostReviewAutoConfirmed,
      diagnostics: result.diagnostics, consoleErrors: session.consoleErrors,
      staleFiles,
      inputs: inputManifest(session.toolDir, config),
    }, null, 2));
    return { ...result, chrome: session.version, exported: exported.length, files: exported, staleFiles, caseDir };
  } finally { await session.close(); }
}

/**
 * 清空上一次的擷取結果。掛載磁碟可能不允許刪檔（EPERM）；此時改為就地覆寫，
 * 並回傳舊有 images 清單，讓呼叫端能標出「這次沒再產出」的殘留檔。
 */
function clearCaseDir(caseDir) {
  const imagesDir = path.join(caseDir, 'images');
  const previous = fs.existsSync(imagesDir) ? listFilesRecursive(imagesDir) : [];
  try { fs.rmSync(caseDir, { recursive: true, force: true }); return []; }
  catch (error) {
    if (error.code !== 'EPERM') throw error;
    return previous;
  }
}

function caseFolderName(sheetName, project) {
  const clean = (text) => String(text).trim().replace(/[\\/:*?"<>|]+/g, '_');
  return project ? `${clean(sheetName)}__${clean(project)}` : clean(sheetName);
}

async function extractZip(buffer, targetDir) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const written = [];
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const target = path.join(targetDir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, await entry.async('nodebuffer'));
    written.push(name);
  }
  return written.sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configFile = args.config ? path.resolve(args.config) : path.join(HERE, 'tools.config.json');
  const allConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const config = allConfig[args.tool];
  if (!config) throw new Error(`${path.basename(configFile)} 沒有工具「${args.tool}」`);
  if (args.out) outputRoot = path.resolve(args.out);

  const modes = {
    discover: () => discover(args.tool, config),
    probe: () => probe(args.tool, config, args.sheets),
    capture: () => capture(args.tool, config, args.sheet, args.project === '__ALL__' ? driver.ALL_PROJECTS_VALUE : args.project),
  };
  if (!modes[args.mode]) throw new Error(`未知模式「${args.mode}」，可用：${Object.keys(modes).join(' / ')}`);
  const output = await modes[args.mode]();
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
