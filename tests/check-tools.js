#!/usr/bin/env node
'use strict';

/**
 * 不開瀏覽器的靜態檢查（npm run check）：
 *   1. config/tools.js 登錄的每個工具都有 config/profiles/<id>.profile.js、rules/<ns>/rules.manifest.js，且 profile 的 coreScripts／templatesDir／assetsDir 都存在。
 *   2. 共用字型檔存在。
 *   3. tests/run-golden/cases-core.json 每個案例的 profile、黃金資料夾、工單都存在。
 *   4. 根目錄有 .nojekyll（GitHub Pages 預設跑 Jekyll，會略過底線開頭的 config/profiles/_defaults.js → 分類啟用失敗）。
 *   5. 專案裡沒有 Git LFS 指標檔（2026-10-14：字型／素材若變成指標檔，程式會悄悄用替代字型，輸出會變）。
 * 有任何一項不符就以非 0 結束，讓 CI 擋下來。
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

function loadRegistryScript(rel, key) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox);
  return key ? (sandbox.window.__profileRegistry || {})[key] : sandbox.window;
}

function checkTools() {
  const tools = loadRegistryScript('config/tools.js').TOOL_REGISTRY || [];
  if (!tools.length) problems.push('config/tools.js 沒有登錄任何工具');
  for (const tool of tools) {
    if (!Array.isArray(tool.sheetHints) || !tool.sheetHints.length) problems.push(`${tool.id}: sheetHints 為空，入口頁無法自動判別`);
    const profileFile = `config/profiles/${tool.id}.profile.js`;
    if (!exists(profileFile)) { problems.push(`${tool.id}: 缺少 ${profileFile}`); continue; }
    const profile = loadRegistryScript(profileFile, `profile:${tool.id}`);
    if (!profile) { problems.push(`${tool.id}: ${profileFile} 沒有登錄 profile:${tool.id}`); continue; }
    if (!exists(`${profile.rulesNamespace}rules.manifest.js`)) problems.push(`${tool.id}: 缺少 ${profile.rulesNamespace}rules.manifest.js`);
    for (const dir of [profile.templatesDir, profile.assetsDir]) if (dir && !exists(dir)) problems.push(`${tool.id}: 缺少 ${dir}`);
    for (const script of profile.coreScripts || []) if (!exists(script)) problems.push(`${tool.id}: coreScripts 找不到 ${script}`);
  }
  return tools.length;
}

function checkFonts() {
  for (const weight of ['Regular', 'Medium', 'Bold']) {
    if (!exists(`fonts/ShopeeNotoSans(content)-${weight}.ttf`)) problems.push(`缺少共用字型 fonts/ShopeeNotoSans(content)-${weight}.ttf`);
  }
}

/** Git LFS 指標檔開頭固定是這一行；真檔（png／ttf／xlsx…）不可能以它開頭。 */
const LFS_POINTER_HEAD = 'version https://git-lfs.github.com/spec/v1';
const SKIP_DIRS = new Set(['node_modules', '.git', 'tests/golden-diff', 'tests/regression-out', 'work']);

function checkNoJekyll() {
  if (!exists('.nojekyll')) problems.push('缺少根目錄 .nojekyll：GitHub Pages 會略過底線開頭的 config/profiles/_defaults.js（2026-10-15 實際踩到）');
}

function checkLfsPointers() {
  const pointers = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) { if (!SKIP_DIRS.has(rel) && !SKIP_DIRS.has(entry.name)) walk(rel); continue; }
      if (!entry.isFile()) continue;
      const stat = fs.statSync(path.join(ROOT, rel));
      if (stat.size > 512) continue; // 指標檔只有一百多 byte
      const head = fs.readFileSync(path.join(ROOT, rel), { encoding: 'utf8', flag: 'r' }).slice(0, LFS_POINTER_HEAD.length);
      if (head === LFS_POINTER_HEAD) pointers.push(rel);
    }
  };
  walk('');
  if (pointers.length) {
    problems.push(`發現 ${pointers.length} 個 Git LFS 指標檔（不是真檔；請照 docs/上傳步驟.md「從 LFS 換回一般檔」處理）：`);
    pointers.slice(0, 10).forEach((rel) => problems.push(`    ${rel}`));
    if (pointers.length > 10) problems.push(`    …另有 ${pointers.length - 10} 個`);
  }
  return pointers.length;
}

function checkGoldenCases() {
  const cases = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/run-golden/cases-core.json'), 'utf8')).cases;
  for (const testCase of cases) {
    if (!exists(`config/profiles/${testCase.profile}.profile.js`)) problems.push(`案例 ${testCase.id}: profile ${testCase.profile} 不存在`);
    if (!exists(`${testCase.goldenDir}/session.json`)) problems.push(`案例 ${testCase.id}: 缺少 ${testCase.goldenDir}/session.json`);
    if (!exists(testCase.workbook)) problems.push(`案例 ${testCase.id}: 工單 ${testCase.workbook} 不存在`);
  }
  return cases.length;
}

const toolCount = checkTools();
checkFonts();
const caseCount = checkGoldenCases();
checkNoJekyll();
checkLfsPointers();

if (problems.length) {
  console.error(`check-tools：${problems.length} 個問題`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}
console.log(`check-tools：${toolCount} 工具 profile、共用字型、${caseCount} 黃金案例設定都齊全，.nojekyll 在、沒有 Git LFS 指標檔`);
