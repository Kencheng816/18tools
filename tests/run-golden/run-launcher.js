/* 入口頁與匯入流程回歸：卡片 → 獨立工具頁 → 匯入工單彈窗（modules/import-flow.js）
 *
 * 1. 入口頁：config/tools.js 每張卡片都畫出來、連結正確（單一分類 → app.html?profile=；多分類 → app.html?group=）。
 * 2. 單一分類卡片：點卡片 → 工具頁分類直接啟用、內建公版載好、畫布蓋著「尚未匯入工單」空狀態、左上有「← 回首頁」、匯入彈窗自動跳出（關掉不再跳）、版面健檢。
 * 3. 多分類卡片（外廣 OM）：點卡片 → 彈窗選工單與分頁 → 確認匯入 → 依分頁啟用 OM_w1／OM_w2、載入公版、產生預覽、空狀態收起。
 *    工單同時有 Wave1／Wave2 分頁時，彈窗兩個都打 ✓、預選第一個；群組外的分頁（LineOA_wave1）不打 ✓。
 * 4. KOL 群組：彈窗分頁判別（第一單／第二單各自對到正確分類），不實際產圖（KOL 產圖會跳人工審核視窗）。
 * http 與 file:// 各跑一次（使用者多半是雙擊 index.html 開啟）。
 *
 * 用法：node run-launcher.js   環境變數同 run-core-golden.js（GOLDEN_WORK_DIR、NODE_PATH）；LAUNCHER_SCHEMES=http 或 file 可只跑一種。 */
'use strict';

const path = require('path');
const { pathToFileURL } = require('url');
const { startStaticServer } = require('../golden-capture/lib/static-server');
const { launchBrowser, setInputFiles } = require('../golden-capture/lib/browser');
const { prepareWorkCopy } = require('./run-core-golden');

const TIMEOUT_MS = 90000;
const OM_WORKBOOK = 'tests/golden-inputs/OM_w2/2026.4.18 會員日_Timeline&入稿表.xlsx'; // 同名但內容是 Wave2 版本（OM_w1 資料夾那份的 Wave2 分頁對不到公版）
const KOL_WORKBOOK = 'tests/golden-inputs/KOL_第一單/2026【美術需求】直播賣版封面圖-4.18 KOL代播版型.xlsx';

async function checkIndex(page, baseUrl) {
  await page.goto(`${baseUrl}index.html`, { waitUntil: 'load' });
  return page.evaluate(() => {
    const problems = [];
    const cards = [...document.querySelectorAll('.tool-card')];
    for (const tool of window.TOOL_REGISTRY) {
      const card = cards.find((el) => el.dataset.id === tool.id);
      if (!card) { problems.push(`缺少卡片 ${tool.id}`); continue; }
      const expected = tool.profiles.length === 1 ? `app.html?profile=${encodeURIComponent(tool.profiles[0])}` : `app.html?group=${encodeURIComponent(tool.id)}`;
      if (card.getAttribute('href') !== expected) problems.push(`${tool.id} 連結「${card.getAttribute('href')}」，預期「${expected}」`);
      if (card.textContent.trim() !== tool.label) problems.push(`${tool.id} 文字「${card.textContent.trim()}」`);
    }
    if (cards.length !== window.TOOL_REGISTRY.length) problems.push(`卡片 ${cards.length} 張，登錄 ${window.TOOL_REGISTRY.length} 張`);
    if (document.querySelector('select, input[type=file], iframe')) problems.push('入口頁不該有下拉／上傳／iframe');
    return problems;
  });
}

async function openCard(page, baseUrl, cardId) {
  await page.goto(`${baseUrl}index.html`, { waitUntil: 'load' });
  await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click(`.tool-card[data-id="${cardId}"]`)]);
  // 開頁字型進度畫面蓋在最上層，字型載完才會消失（file:// 讀 54 MB 內建 TTF 要幾秒），等它收掉再操作
  await page.waitForFunction(() => Array.isArray(window.__fontSources) && !document.getElementById('fontBoot'), { timeout: TIMEOUT_MS });
}

const waitForProfile = (page, id) => page.waitForFunction((expected) => window.ProfileLoader?.active?.id === expected && window.__coreScriptsReady === true, { timeout: TIMEOUT_MS }, id);

/** 把工作目錄裡的工單餵給彈窗的 <input>（CDP 直接給路徑，http 與 file:// 都通；路徑需為純 ASCII 工作目錄）。 */
async function feedWorkbook(page, workDir, workbookRel) {
  await setInputFiles(page, 'importExcelInput', [path.join(workDir, workbookRel)]);
  await page.waitForFunction(() => document.querySelectorAll('#importSheetSelect option').length > 0, { timeout: TIMEOUT_MS });
}

/** 版面健檢（2026-11-04：app.html 多一個 </div> 讓 <main> 被包進左欄，畫布跑到畫面外，黃金測試看不出來）：
 *  左欄／主畫布／右側縮圖欄要都是 .app-shell 的直接子元素，而且畫布要在視窗裡看得到。 */
async function layoutProblems(page, { expectCanvas = false } = {}) {
  return page.evaluate((expectCanvas) => {
    const problems = [];
    const shell = document.querySelector('.app-shell');
    const kids = shell ? [...shell.children] : [];
    if (!kids.some((el) => el.matches('main.workspace'))) problems.push('主畫布 <main class="workspace"> 不是 .app-shell 的直接子元素（HTML 標籤沒關好）');
    if (!kids.some((el) => el.matches('aside.sidebar'))) problems.push('左欄不是 .app-shell 的直接子元素');
    const side = document.querySelector('aside.sidebar')?.getBoundingClientRect();
    const main = document.querySelector('main.workspace')?.getBoundingClientRect();
    if (side && main && main.left < side.right - 1) problems.push(`主畫布沒有排在左欄右邊（left=${Math.round(main.left)}，左欄 right=${Math.round(side.right)}）`);
    if (main && (main.top >= window.innerHeight || main.height < 200)) problems.push(`主畫布不在視窗內（top=${Math.round(main.top)}，高 ${Math.round(main.height)}）`);
    if (expectCanvas) {
      const canvas = document.querySelector('#canvas')?.getBoundingClientRect();
      if (!canvas || canvas.width === 0) problems.push('畫布沒有畫出來');
      else if (canvas.top >= window.innerHeight || canvas.bottom <= 0) problems.push(`畫布在視窗外（top=${Math.round(canvas.top)}）`);
      const thumb = document.querySelector('.batch-thumb')?.getBoundingClientRect();
      if (!thumb) problems.push('右側沒有縮圖');
      else if (thumb.top >= window.innerHeight || thumb.left < (main?.right || 0) - 1) problems.push(`縮圖欄位置不對（top=${Math.round(thumb.top)} left=${Math.round(thumb.left)}）`);
    }
    return problems;
  }, expectCanvas);
}

/** 2026-11-04：進工具頁會自動跳出匯入彈窗；等它自己開（沒開就記一筆問題，再手動按「匯入工單」）。 */
async function expectAutoOpenedModal(page, problems) {
  const opened = await page.waitForFunction(() => { const modal = document.getElementById('importModal'); return !!modal && !modal.classList.contains('hidden'); }, { timeout: 10000 }).then(() => true).catch(() => false);
  if (opened) return;
  problems.push('進工具頁後匯入彈窗沒有自動跳出');
  await page.click('#importWorkbookBtn');
}

const sheetOptions = (page) => page.$$eval('#importSheetSelect option', (els) => els.map((el) => ({ value: el.value, matched: el.textContent.startsWith('✓ ') })));

async function caseSingleProfile(page, baseUrl, workDir) {
  const problems = [];
  await openCard(page, baseUrl, '暖身BN');
  await waitForProfile(page, '暖身BN');
  await page.waitForFunction(() => (window.AppState?.templates || []).length > 0, { timeout: TIMEOUT_MS });
  if (!(await page.$('.topbar-home'))) problems.push('工具頁缺少「← 回首頁」');
  const emptyHidden = await page.$eval('#importEmptyState', (el) => el.hidden).catch(() => null);
  if (emptyHidden !== false) problems.push('匯入前應顯示「尚未匯入工單」空狀態');
  // 空狀態提示每 500ms 更新一次，等它反映「公版已載好」
  await page.waitForFunction(() => /已內建 \d+ 個公版/.test(document.getElementById('importEmptyHint')?.textContent || ''), { timeout: 10000 })
    .catch(async () => problems.push(`空狀態提示「${await page.$eval('#importEmptyHint', (el) => el.textContent)}」`));
  problems.push(...await layoutProblems(page));
  await expectAutoOpenedModal(page, problems);
  // 關掉之後不會再自己跳出來
  await page.click('#importCloseBtn');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (await page.$eval('#importModal', (el) => !el.classList.contains('hidden'))) problems.push('關掉彈窗後又自己跳出來');
  return problems;
}

async function caseOmGroup(page, baseUrl, workDir) {
  const problems = [];
  await openCard(page, baseUrl, 'OM');
  if (await page.evaluate(() => !!window.ProfileLoader?.active)) problems.push('群組頁一進來不該啟用分類');
  const label = await page.$eval('#profileVersionLabel', (el) => el.textContent);
  if (label !== '外廣 OM') problems.push(`左上顯示「${label}」`);

  await expectAutoOpenedModal(page, problems);
  await feedWorkbook(page, workDir, OM_WORKBOOK);
  const options = await sheetOptions(page);
  const matched = options.filter((o) => o.matched).map((o) => o.value);
  if (matched.join('|') !== '外廣_Wave1|外廣_Wave2(急件)') problems.push(`打 ✓ 的分頁：${matched.join('、')}`);
  if (options.find((o) => o.value === 'LineOA_wave1')?.matched) problems.push('LineOA_wave1 不該打 ✓（群組外）');
  if ((await page.$eval('#importSheetSelect', (el) => el.value)) !== '外廣_Wave1') problems.push('應預選第一個打 ✓ 的分頁');

  await page.select('#importSheetSelect', '外廣_Wave2(急件)');
  await page.click('#importConfirmBtn');
  await waitForProfile(page, 'OM_w2');
  await page.waitForFunction(() => window.AppState?.batchMode && (window.AppState.batchItems || []).length > 0, { timeout: TIMEOUT_MS });
  await page.waitForFunction(() => !document.getElementById('assetLoadingOverlay')?.classList.contains('is-open'), { timeout: TIMEOUT_MS });
  const sheet = await page.$eval('#excelSheetSelect', (el) => el.value);
  if (sheet !== '外廣_Wave2(急件)') problems.push(`core 分頁選到「${sheet}」`);
  if (await page.$eval('#importEmptyState', (el) => !el.hidden)) problems.push('產生預覽後空狀態應收起');
  if (await page.$eval('#importModal', (el) => !el.classList.contains('hidden'))) problems.push('確認匯入後彈窗應關閉');
  problems.push(...await layoutProblems(page, { expectCanvas: true }));
  return problems;
}

async function caseKolGroup(page, baseUrl, workDir) {
  const problems = [];
  await openCard(page, baseUrl, 'KOL');
  await expectAutoOpenedModal(page, problems);
  await feedWorkbook(page, workDir, KOL_WORKBOOK);
  const matched = (await sheetOptions(page)).filter((o) => o.matched).map((o) => o.value);
  if (matched.join('|') !== '4.18 第一單|4.18 第一單 校稿|4.18 第二單|4.18 第二單 校稿') problems.push(`打 ✓ 的分頁：${matched.join('、')}`);
  const detected = await page.evaluate(async () => ({
    first: await window.ToolBootstrap.detectProfiles('4.18 第一單'),
    second: await window.ToolBootstrap.detectProfiles('4.18 第二單'),
    third: await window.ToolBootstrap.detectProfiles('4.18 第三單'),
  }));
  if (detected.first.join() !== 'KOL_第一單' || detected.second.join() !== 'KOL_第二單' || detected.third.length) problems.push(`分頁判別：${JSON.stringify(detected)}`);
  return problems;
}

const CASES = [
  { name: '卡片「暖身BN」→ 直接啟用、公版內建、空狀態', run: caseSingleProfile },
  { name: '卡片「OM」→ 彈窗選 Wave2 → 啟用 OM_w2 並產生預覽', run: caseOmGroup },
  { name: '卡片「KOL」→ 彈窗分頁判別 第一單／第二單', run: caseKolGroup },
];

async function main() {
  const workDir = prepareWorkCopy();
  const { browser } = await launchBrowser();
  const server = await startStaticServer(workDir);
  // LAUNCHER_SCHEMES=http,file（預設兩種都跑；沙箱慢時可分開跑）
  const schemes = String(process.env.LAUNCHER_SCHEMES || 'http,file').split(',').map((s) => s.trim());
  const bases = [schemes.includes('http') && `${server.origin}/`, schemes.includes('file') && pathToFileURL(`${workDir}/`).href].filter(Boolean);
  let failures = 0;
  const report = (ok, scheme, name, problems = []) => {
    if (ok) console.log(`✓ ${scheme} ${name}`);
    else { failures += 1; console.log(`✗ ${scheme} ${name}\n    ${problems.join('\n    ')}`); }
  };
  try {
    for (const baseUrl of bases) {
      const scheme = baseUrl.startsWith('file:') ? 'file://' : 'http';
      const indexPage = await browser.newPage();
      const indexProblems = await checkIndex(indexPage, baseUrl).catch((error) => [error.message]);
      await indexPage.close();
      report(!indexProblems.length, scheme, '入口頁卡片', indexProblems);
      for (const testCase of CASES) {
        const page = await browser.newPage();
        page.on('dialog', (dialog) => { console.log(`    [alert] ${dialog.message()}`); dialog.dismiss(); });
        const problems = await testCase.run(page, baseUrl, workDir).catch((error) => [error.message]);
        await page.close();
        report(!problems.length, scheme, testCase.name, problems);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  const total = (CASES.length + 1) * bases.length;
  console.log(failures ? `run-launcher：${failures} 個失敗` : `run-launcher：${total} 個案例全部通過`);
  process.exit(failures ? 1 : 0);
}

main().catch((error) => { console.error(error); process.exit(1); });
