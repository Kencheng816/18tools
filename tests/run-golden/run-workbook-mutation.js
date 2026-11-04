#!/usr/bin/env node
/* 工單變更耐受測試（2026-11-03 封測第二輪）
 *
 * 問題背景：Seller BN 的小票券欄位不管填什麼都報「素材缺少」——檔案都在，是規則寫錯圖層名；只要工單內容跟黃金工單不一樣就會露出來。
 * 這支測試把每個工具的黃金工單「改一改」再產圖，抓這類「改了工單就出錯、但素材其實都在」的隱藏問題：
 *   變更 A「換素材」：工單裡每一格「指到素材夾某個檔案」的值，換成同一資料夾裡同前綴的另一個檔（小票券_全站_$40 → 小票券_全站_95折；
 *                    商品名 吹風機 → 同資料夾另一個檔）。產圖後，診斷裡新出現的「素材缺少／找不到公版／找不到圖層」，只要那個值對得到
 *                    素材夾裡的檔案，就是程式的問題，列出來。
 *   變更 B「整張下移一列」：工單最上面插一列空白（所有列往下移、合併儲存格一起移）。產圖張數或診斷跟原本不一樣＝有程式認「固定儲存格」。
 *   變更 C「同一製作物內前兩筆對調」（2026-11-03 批次 ⑨）：每個製作物區塊的第 1、2 筆工單內容互換（只換內容欄，不動製作內容／數量／尺寸）。
 *                    輸出張數要一樣，而且匯出的圖「整組」要一樣（只是編號對調、每張 bytes 都找得到對應）；
 *                    有哪張圖對不上＝有設定表拿「輸出編號（第幾筆）」當鍵，工單一換順序版面就錯位。
 *                    bytes 不同但像素差在 0.1% 以內的（瀏覽器畫字的次像素飄移，圖層數值完全一樣）列「微小」不算問題。
 * 每個案例：原本工單先跑一次當基準，再各跑一次變更 A、B、C，報告只列「跟基準不一樣」的部分。
 *
 * 用法：node run-workbook-mutation.js [--profiles a,b] [--case "<id>"] [--only A|B|C]
 * 環境變數同 run-core-golden.js（GOLDEN_WORK_DIR、NODE_PATH）。報告寫到 tests/golden-diff/mutation/<case>.json 與 summary.md。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { startStaticServer } = require('../golden-capture/lib/static-server');
const { launchBrowser } = require('../golden-capture/lib/browser');
const driver = require('../golden-capture/lib/tool-driver');
const { CASES, REPO_ROOT, parseArgs, prepareWorkCopy, openWithProfile, extractZip, sha256, pixelDiff } = require('./run-core-golden');

const OUT_ROOT = path.join(REPO_ROOT, 'tests', 'golden-diff', 'mutation');
const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif)$/i;
const PROBLEM_TAGS = ['素材缺少', '找不到公版', '找不到圖層', '欄位空白', '解析警告', '略過的列'];

const norm = (value) => String(value || '').toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[\s 　_\-()（）\[\]【】.]+/g, '');
const basename = (file) => path.basename(file).replace(IMAGE_EXT, '');

function listAssets(dir) {
  const out = [];
  const walk = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (IMAGE_EXT.test(entry.name)) out.push({ file: full, folder: path.dirname(full), base: basename(entry.name), norm: norm(basename(entry.name)) });
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

/** 工單某一格對到哪個素材：完全等於 > 檔名結尾等於（公版前綴＋格值） */
function matchAsset(value, assets) {
  const key = norm(value);
  if (!key || key.length < 2) return null;
  const exact = assets.find((a) => a.norm === key);
  if (exact) return exact;
  // 單一詞（商品名、VIP、18號…）只認完全等於，免得「VIP」對到「小票券_VIP」這種尾巴
  if (!String(value).includes('_')) return null;
  return assets.find((a) => a.norm.endsWith(key) && a.norm.length - key.length >= 2) || null;
}

/** 同資料夾裡「同前綴、不同尾段」的替代值；單一詞（商品名）則換同資料夾另一個檔 */
function alternativeFor(value, asset, assets) {
  const raw = String(value).trim();
  const siblings = assets.filter((a) => a.folder === asset.folder && a !== asset);
  if (raw.includes('_')) {
    const head = raw.slice(0, raw.lastIndexOf('_'));
    const headKey = norm(head);
    const candidate = siblings.find((a) => a.norm.includes(headKey) && a.norm !== asset.norm);
    if (!candidate) return null;
    // 從替代檔名裡切出「head_ 之後」的尾段，拼回工單格式
    const idx = candidate.base.toLowerCase().indexOf(head.toLowerCase());
    if (idx < 0) return null;
    return candidate.base.slice(idx);
  }
  if (!/^[^_]+$/.test(raw)) return null;
  // 單一詞（商品名／LOGO 名）：換同資料夾另一個檔（跳過背景、規範這類不是拿來換的）
  const candidate = siblings.find((a) => a.base !== asset.base && !/bg|背景|規範|範圍/i.test(a.base));
  return candidate ? candidate.base : null;
}

function mutateAssets(workbookPath, sheetName, assets, outPath) {
  const wb = XLSX.readFile(workbookPath, { cellStyles: false });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`找不到分頁 ${sheetName}`);
  const changes = [];
  const seenFolderSingle = new Set();
  Object.keys(ws).forEach((addr) => {
    if (addr[0] === '!') return;
    const cell = ws[addr];
    if (!cell || cell.t !== 's' || typeof cell.v !== 'string') return;
    const value = cell.v.trim();
    if (!value || value.includes('+') || value.includes('\n') || /^https?:/i.test(value)) return;
    if (/\(logo\)/i.test(value) || /^(vip|蝦皮|shopee)\s*logo$/i.test(value)) return; // 頭巾的 LOGO 類型／主標（logo）是路由文字，不是素材名
    const asset = matchAsset(value, assets);
    if (!asset) return;
    const alt = alternativeFor(value, asset, assets);
    if (!alt || alt === value) return;
    if (!value.includes('_')) { if (seenFolderSingle.has(asset.folder)) return; seenFolderSingle.add(asset.folder); }
    changes.push({ cell: addr, from: value, to: alt, via: path.relative(REPO_ROOT, asset.file) });
    cell.v = alt; delete cell.w; delete cell.r; delete cell.h;
  });
  XLSX.writeFile(wb, outPath);
  return changes;
}

function shiftRows(workbookPath, sheetName, outPath) {
  const wb = XLSX.readFile(workbookPath, { cellStyles: false });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`找不到分頁 ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  const merges = (ws['!merges'] || []).map((m) => ({ s: { r: m.s.r + 1, c: m.s.c }, e: { r: m.e.r + 1, c: m.e.c } }));
  const next = XLSX.utils.aoa_to_sheet([[], ...rows]);
  next['!merges'] = merges;
  wb.Sheets[sheetName] = next;
  XLSX.writeFile(wb, outPath);
}

const BLOCK_HEADERS = ['製作內容', '製作項目', '項目'];
const CONTENT_START_HEADERS = ['日期', '主題日/頁面', '主題', '主標', '主標題'];
const RECORD_HEADERS = ['主標', '主標題', '商品圖1', '副標', '文案'];
const cellText = (value) => String(value ?? '').trim();

/** 找表頭列（有「主標／商品圖1」那種欄名的列）與各欄位置 */
function locateColumns(rows) {
  const headerIndex = rows.findIndex((row) => row.some((cell) => RECORD_HEADERS.includes(cellText(cell))));
  if (headerIndex < 0) return null;
  const header = rows[headerIndex].map(cellText);
  const indexOfAny = (names) => { const found = names.map((name) => header.indexOf(name)).filter((i) => i >= 0); return found.length ? Math.min(...found) : -1; };
  const contentStart = indexOfAny(CONTENT_START_HEADERS);
  const recordColumns = RECORD_HEADERS.map((name) => header.indexOf(name)).filter((i) => i >= 0);
  if (contentStart < 0 || !recordColumns.length) return null;
  // 只做「一列一筆」的工單（有「製作內容」區塊欄，或 AMS 那種有「版位」欄）；LineOA／MS 是直式（一筆佔好幾列）不能對調列
  if (indexOfAny(BLOCK_HEADERS) < 0 && !header.includes('版位')) return null;
  return { headerIndex, blockColumn: indexOfAny(BLOCK_HEADERS), countColumn: header.indexOf('數量'), contentStart, recordColumns };
}

/** 變更 C：每個製作物區塊裡前兩筆內容對調；回傳換了哪些列（0-based） */
function swapFirstTwoRecords(workbookPath, sheetName, outPath) {
  const wb = XLSX.readFile(workbookPath, { cellStyles: false });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`找不到分頁 ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  const columns = locateColumns(rows);
  if (!columns) return null;
  // 一筆記錄＝主標／商品圖那幾欄有填、而且內容欄至少填兩格（只填一格的是「<< CTA 放右下角」這類備註列）
  const filledCount = (row) => (row || []).filter((cell, c) => c >= columns.contentStart && cellText(cell)).length;
  const isRecord = (row) => columns.recordColumns.some((c) => cellText(row?.[c])) && filledCount(row) >= 2;
  // 依「製作內容」欄切區塊；有內容的列數達到「數量」的兩倍＝一筆佔多列（Seller BN 文案列＋票券列），不對調。
  // 區塊尾巴多一兩列是「8字／7字」這類備註列或重複的表頭，對調的是最前面兩筆，不受影響。
  const blocks = [];
  for (let r = columns.headerIndex + 1; r < rows.length; r += 1) {
    const row = rows[r] || [];
    const startsBlock = columns.blockColumn >= 0 && cellText(row[columns.blockColumn]);
    if (startsBlock || !blocks.length) blocks.push({ start: r, count: Number(row[columns.countColumn]) || 0, records: [] });
    if (isRecord(row)) blocks[blocks.length - 1].records.push(r);
  }
  const swaps = []; const skipped = [];
  blocks.forEach((block) => {
    if (block.records.length < 2) return;
    if (block.count > 0 && block.records.length >= block.count * 2) { skipped.push(`第 ${block.start + 1} 列起的區塊一筆佔多列（數量 ${block.count}、有內容 ${block.records.length} 列）`); return; }
    swaps.push([block.records[0], block.records[1]]);
  });
  const lastColumn = XLSX.utils.decode_range(ws['!ref']).e.c; // 用整張的欄寬，表頭外的無名欄（右側商品圖／價格）也要一起換
  swaps.forEach(([a, b]) => {
    for (let c = columns.contentStart; c <= lastColumn; c += 1) {
      const addrA = XLSX.utils.encode_cell({ r: a, c }); const addrB = XLSX.utils.encode_cell({ r: b, c });
      const cellA = ws[addrA]; const cellB = ws[addrB];
      if (cellA) ws[addrB] = cellA; else delete ws[addrB];
      if (cellB) ws[addrA] = cellB; else delete ws[addrA];
    }
  });
  XLSX.writeFile(wb, outPath);
  return { swaps: swaps.map(([a, b]) => `第 ${a + 1}↔${b + 1} 列`), skipped };
}

/** 匯出 zip 裡每個檔的雜湊（不看檔名）：對調前後整組要一樣 */
function hashBag(files) {
  const bag = new Map();
  for (const [name, buffer] of files) { const key = sha256(buffer); bag.set(key, [...(bag.get(key) || []), name]); }
  return bag;
}

const NEAR_RATIO = 0.001; // 像素差 ≤ 0.1% 視為同一張（次像素飄移）

function compareBags(baseline, mutated, baselineFiles, mutatedFiles) {
  const onlyBaseline = []; const onlyMutated = []; const near = [];
  baseline.forEach((names, key) => { if (!mutated.has(key)) onlyBaseline.push(...names); });
  mutated.forEach((names, key) => { if (!baseline.has(key)) onlyMutated.push(...names); });
  // bytes 對不上的，再找一張「幾乎一樣」的基準圖（同尺寸、像素差 ≤ 0.1%）
  const unmatchedBaseline = new Set(onlyBaseline);
  const stillUnmatched = onlyMutated.filter((name) => {
    if (!/\.png$/i.test(name)) return true;
    for (const candidate of unmatchedBaseline) {
      if (!/\.png$/i.test(candidate)) continue;
      let result;
      try { result = pixelDiff(baselineFiles.get(candidate), mutatedFiles.get(name), name, path.join(OUT_ROOT, 'diff', `${name}.png`)); } catch (error) { continue; }
      if (result.mismatch === 'size' || result.pixels > result.total * NEAR_RATIO) continue;
      unmatchedBaseline.delete(candidate);
      near.push(`${name} ≈ 基準 ${candidate}（差 ${result.pixels} px）`);
      return false;
    }
    return true;
  });
  return { onlyBaseline: [...unmatchedBaseline], onlyMutated: stillUnmatched, near };
}

/** 問題行；列號正規化（整張下移一列時「第 82 列」變「第 83 列」不算差異） */
function problemLines(reportText) {
  return reportText.split('\n').map((line) => line.trim().replace(/第 [\d、\s…]+ 列/g, '第 ? 列')).filter((line) => PROBLEM_TAGS.some((tag) => line.includes(`[${tag}]`)));
}

/** 診斷行引用的值（「…」內）是否對得到素材 */
function quotedValues(line) { return [...line.matchAll(/「([^」]+)」/g)].map((m) => m[1]); }

async function runOnce(browser, server, workDir, testCase, workbookRel, { withExport = false } = {}) {
  const page = await browser.newPage();
  page.on('dialog', (dialog) => dialog.dismiss());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await openWithProfile(page, server.origin, testCase.profile);
    await driver.uploadInputs(page, workDir, path.join(workDir, workbookRel), { uploads: { templates: { inputId: 'templateFolderInput', dir: testCase.templatesDir }, assets: { inputId: 'assetInput', dir: testCase.assetsDir }, workbook: { inputId: 'excelInput' } } });
    const result = await driver.generate(page, testCase.sheet, testCase.project || '');
    const report = await page.evaluate(() => window.DiagnosticsReport?.text?.() || '');
    const files = withExport && result.generated ? await extractZip(await driver.exportZip(page, testCase.exportFormat || 'auto')) : null;
    return { generated: result.generated, error: result.error, lines: problemLines(report), errors, files };
  } finally { await page.close(); }
}

async function runCase(browser, server, workDir, testCase, only) {
  const assets = listAssets(path.join(REPO_ROOT, testCase.assetsDir));
  const workbookAbs = path.join(REPO_ROOT, testCase.workbook);
  const tmpDir = path.join(workDir, 'tests', 'mutation-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const safe = testCase.id.replace(/[^\w]+/g, '_');
  const out = { id: testCase.id, baseline: null, assetSwap: null, rowShift: null, recordSwap: null };
  const wantSwap = !only || only === 'C';

  out.baseline = await runOnce(browser, server, workDir, testCase, testCase.workbook, { withExport: wantSwap });

  if (!only || only === 'A') {
    const mutated = path.join(tmpDir, `${safe}_A.xlsx`);
    const changes = mutateAssets(workbookAbs, testCase.sheet, assets, mutated);
    if (changes.length) {
      const run = await runOnce(browser, server, workDir, testCase, path.relative(workDir, mutated));
      const newLines = run.lines.filter((line) => !out.baseline.lines.includes(line));
      const suspicious = newLines.filter((line) => quotedValues(line).some((value) => !!matchAsset(value, assets)));
      out.assetSwap = { changes, generated: run.generated, baselineGenerated: out.baseline.generated, newLines, suspicious, error: run.error, errors: run.errors };
    } else out.assetSwap = { changes: [], skipped: '工單裡沒有對得到素材的格子' };
  }
  if (!only || only === 'B') {
    const mutated = path.join(tmpDir, `${safe}_B.xlsx`);
    shiftRows(workbookAbs, testCase.sheet, mutated);
    const run = await runOnce(browser, server, workDir, testCase, path.relative(workDir, mutated));
    const newLines = run.lines.filter((line) => !out.baseline.lines.includes(line));
    out.rowShift = { generated: run.generated, baselineGenerated: out.baseline.generated, newLines, error: run.error, errors: run.errors, changed: run.generated !== out.baseline.generated || newLines.length > 0 };
  }
  if (wantSwap) {
    const mutated = path.join(tmpDir, `${safe}_C.xlsx`);
    const swapped = swapFirstTwoRecords(workbookAbs, testCase.sheet, mutated);
    const swaps = swapped?.swaps || [];
    if (swaps.length) {
      const run = await runOnce(browser, server, workDir, testCase, path.relative(workDir, mutated), { withExport: true });
      const newLines = run.lines.filter((line) => !out.baseline.lines.includes(line));
      const diff = run.files && out.baseline.files ? compareBags(hashBag(out.baseline.files), hashBag(run.files), out.baseline.files, run.files) : { onlyBaseline: [], onlyMutated: [], near: [] };
      out.recordSwap = { swaps, notSwapped: swapped.skipped, generated: run.generated, baselineGenerated: out.baseline.generated, newLines, error: run.error, errors: run.errors, ...diff, changed: run.generated !== out.baseline.generated || diff.onlyBaseline.length > 0 || diff.onlyMutated.length > 0 };
    } else out.recordSwap = { swaps: [], skipped: swapped ? '沒有區塊有兩筆以上' : '不是一列一筆的工單（或認不出表頭）' };
  }
  delete out.baseline.files;
  return out;
}

function summarize(results) {
  const lines = ['# 工單變更耐受測試', ''];
  results.forEach((r) => {
    lines.push(`## ${r.id}`, `- 基準：產出 ${r.baseline.generated} 張，問題行 ${r.baseline.lines.length}`);
    if (r.assetSwap) {
      if (r.assetSwap.skipped) lines.push(`- A 換素材：略過（${r.assetSwap.skipped}）`);
      else {
        lines.push(`- A 換素材：改了 ${r.assetSwap.changes.length} 格，產出 ${r.assetSwap.generated} 張，新問題 ${r.assetSwap.newLines.length} 行，其中「檔案在卻報錯」${r.assetSwap.suspicious.length} 行`);
        r.assetSwap.suspicious.forEach((line) => lines.push(`  - ⚠ ${line}`));
        r.assetSwap.newLines.filter((l) => !r.assetSwap.suspicious.includes(l)).forEach((line) => lines.push(`  - （其他）${line}`));
      }
    }
    if (r.rowShift) {
      lines.push(`- B 下移一列：產出 ${r.rowShift.generated} 張（基準 ${r.rowShift.baselineGenerated}），新問題 ${r.rowShift.newLines.length} 行${r.rowShift.changed ? ' ⚠' : ''}`);
      r.rowShift.newLines.forEach((line) => lines.push(`  - ${line}`));
    }
    if (r.recordSwap) {
      if (r.recordSwap.skipped) lines.push(`- C 前兩筆對調：略過（${r.recordSwap.skipped}）`);
      else {
        lines.push(`- C 前兩筆對調：換了 ${r.recordSwap.swaps.length} 組（${r.recordSwap.swaps.join('、')}），產出 ${r.recordSwap.generated} 張（基準 ${r.recordSwap.baselineGenerated}），對不上的圖 ${r.recordSwap.onlyMutated.length} 張${r.recordSwap.changed ? ' ⚠' : ''}`);
        r.recordSwap.onlyMutated.forEach((name) => lines.push(`  - ⚠ 對調後 ${name} 跟基準任何一張都不一樣（版面可能以輸出編號當鍵）`));
        (r.recordSwap.near || []).forEach((line) => lines.push(`  - （微小）${line}`));
        r.recordSwap.newLines.forEach((line) => lines.push(`  - ${line}`));
      }
    }
    lines.push('');
  });
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.only ? String(args.only).toUpperCase() : null;
  const profiles = args.profiles ? String(args.profiles).split(',') : null;
  const selected = CASES.filter((c) => (!args.case || c.id === args.case) && (!profiles || profiles.includes(c.profile)));
  const workDir = prepareWorkCopy();
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const { browser } = await launchBrowser();
  const server = await startStaticServer(workDir);
  const results = [];
  try {
    for (const testCase of selected) {
      const result = await runCase(browser, server, workDir, testCase, only);
      results.push(result);
      fs.writeFileSync(path.join(OUT_ROOT, `${testCase.id.replace(/[^\w]+/g, '_')}.json`), JSON.stringify(result, null, 2));
      const a = result.assetSwap; const b = result.rowShift; const c = result.recordSwap;
      console.log(`${testCase.id}  基準 ${result.baseline.generated} 張／問題 ${result.baseline.lines.length}` +
        (a ? `　A：${a.skipped ? '略過' : `改 ${a.changes.length} 格→${a.generated} 張，可疑 ${a.suspicious.length}`}` : '') +
        (b ? `　B：${b.generated} 張，新問題 ${b.newLines.length}${b.changed ? ' ⚠' : ''}` : '') +
        (c ? `　C：${c.skipped ? '略過' : `${c.swaps.length} 組→${c.generated} 張，對不上 ${c.onlyMutated.length}${c.near?.length ? `（微小 ${c.near.length}）` : ''}${c.changed ? ' ⚠' : ''}`}` : ''));
    }
  } finally { await browser.close(); server.close(); }
  fs.writeFileSync(path.join(OUT_ROOT, `summary_${Date.now()}.md`), summarize(results));
}

if (require.main === module) main().catch((error) => { console.error(error); process.exit(1); });
module.exports = { mutateAssets, shiftRows, swapFirstTwoRecords, listAssets, matchAsset, alternativeFor };
