'use strict';

const path = require('path');
const fs = require('fs');
const { setInputFiles, setInputFilesSorted } = require('./browser');

function listFilesRecursive(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFilesRecursive(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

const ALL_PROJECTS_VALUE = '__ALL__';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 等待 App 啟動完成（rules loader 跑完、App.init 執行過）。
 * 18節 A 系原工具（暖身BN／正式BN／暖正MS）沒有 window.__rulesLoadResult，
 * 改為直接等 TemplateRulesLoader.ready；兩種路徑都回傳同型別的載入結果。
 */
async function waitForAppReady(page) {
  await page.waitForFunction(
    () => window.AppState && window.BatchManager && window.ExportManager,
    { timeout: 60000 },
  );
  const rules = await page.evaluate(async () => {
    if (window.__rulesLoadResult) return window.__rulesLoadResult;
    const loader = window.TemplateRulesLoader;
    if (!loader?.ready) return { loadedRuleFiles: [], failedRuleFiles: [] };
    try {
      return (await loader.ready) || { loadedRuleFiles: loader.loadedRuleFiles || [], failedRuleFiles: loader.failedRuleFiles || [] };
    } catch (error) {
      return { error: String(error?.message || error) };
    }
  });
  if (rules.error) throw new Error(`規則檔載入失敗：${rules.error}`);
  return rules;
}

/** 素材數量：新式工具用 AssetStore，18節 A 系用 AppState.assetFiles（Map）。 */
const readAssetCount = () => (window.AssetStore?.getTotalFileCount?.() ?? window.AppState.assetFiles?.size ?? 0);

/**
 * 等待某個計數「大於 0 且連續 stableMs 毫秒不再變動」。
 * 部分工具（如 network）是逐檔 push 進 AppState.templates，只等 >0 會在載入途中就往下走。
 */
async function waitForStableCount(page, readCount, { stableMs = 1500, timeoutMs = 120000 } = {}) {
  const startedAt = Date.now();
  let last = -1;
  let stableSince = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const current = await page.evaluate(readCount);
    if (current !== last) { last = current; stableSince = Date.now(); }
    else if (current > 0 && Date.now() - stableSince >= stableMs) return current;
    await sleep(200);
  }
  throw new Error(`等待載入完成逾時（最後計數 ${last}）`);
}

/** 依原工具操作順序：上傳公版 → 上傳素材 → 上傳工單。workbookFile 為工單絕對路徑。 */
async function uploadInputs(page, toolDir, workbookFile, config) {
  const { templates, assets, workbook } = config.uploads;

  // 公版與素材以固定排序餵入（見 browser.js setInputFilesSorted），避免作業系統目錄順序影響模糊比對結果。
  // webkitRelativePath 的根資料夾名固定為 templates／assets（使用者實際選取的資料夾名），
  // 因為 B 系模糊比對會拿路徑跟公版名比對，根資料夾名不同（例如 assets/LineOA）會改變命中結果。
  await setInputFilesSorted(page, templates.inputId, templates.dir, listFilesRecursive(path.join(toolDir, templates.dir)), 'templates');
  await waitForStableCount(page, () => (window.AppState.templates || []).length);

  await setInputFilesSorted(page, assets.inputId, assets.dir, listFilesRecursive(path.join(toolDir, assets.dir)), 'assets');
  await waitForStableCount(page, readAssetCount);

  await setInputFiles(page, workbook.inputId, [workbookFile]);
  await page.waitForFunction(() => !!window.AppState.excelWorkbook, { timeout: 60000 });

  return {
    templateCount: await page.evaluate(() => window.AppState.templates.length),
    assetCount: await page.evaluate(readAssetCount),
    sheetNames: await page.evaluate(() => window.AppState.excelWorkbook.SheetNames),
  };
}

/** 切換分頁並回傳該分頁偵測到的矩陣式專案名稱（空陣列＝不需選專案）。 */
async function selectSheet(page, sheetName) {
  return page.evaluate((name) => {
    const select = document.getElementById('excelSheetSelect');
    select.value = name;
    // 部分工具（鏡面等）沒有矩陣式專案偵測，選分頁時不做任何事。
    window.BatchManager.detectAndOfferProjectsFromSheet?.(name);
    return [...(window.AppState.detectedExcelProjects || [])];
  }, sheetName);
}

/**
 * 走「預覽檔案」同一條路徑產生批次，回傳產出數與診斷。
 *
 * 18節 KOL代播圖 在產圖途中會跳出「半身照對不太準，麻煩確認一下」的人工審核視窗（HostFitReviewModal），
 * 使用者不調整、直接按「確認，套用並繼續」就是預設結果；這裡用 MutationObserver 代替使用者按下該按鈕，
 * 並回報按了幾次（hostReviewAutoConfirmed），讓黃金樣本的操作路徑可重現。
 */
async function generate(page, sheetName, project) {
  await selectSheet(page, sheetName);
  return page.evaluate(async (projectValue) => {
    window.AppState.currentProject = projectValue || '';
    window.TemplateLoader.updateCurrentProjectDisplay?.();
    const alerts = [];
    const originalAlert = window.alert;
    window.alert = (message) => alerts.push(String(message));

    let hostReviewAutoConfirmed = 0;
    const autoConfirm = new MutationObserver(() => {
      // 原工具 HostFitReviewModal 是 .host-review-confirm；整合核心的 asset-review-modal 是 .asset-review-confirm（兩者都直接按確認＝接受自動貼合結果）。
      const button = document.querySelector('.v3-modal-backdrop.open .host-review-confirm, .v3-modal-backdrop.open .asset-review-confirm');
      if (!button || button.dataset.autoConfirmed) return;
      button.dataset.autoConfirmed = '1';
      hostReviewAutoConfirmed += 1;
      requestAnimationFrame(() => button.click());
    });
    autoConfirm.observe(document.body, { childList: true });

    let error = null;
    try {
      await window.BatchManager.generateFromSelectedSheet();
    } catch (caught) {
      // 原工具在此會 alert 並停在「產生失敗」；這裡改為記錄，讓擷取器能回報而不是中斷。
      error = String(caught?.message || caught);
    } finally {
      window.alert = originalAlert;
      autoConfirm.disconnect();
    }
    return {
      error,
      generated: error ? 0 : (window.AppState.batchItems || []).length,
      unmatched: (window.AppState.unmatchedBatchItems || []).map((item) => item.name || item.reason || JSON.stringify(item)),
      alerts,
      hostReviewAutoConfirmed,
      diagnostics: window.AppState.batchDiagnostics || null,
    };
  }, project);
}

/**
 * 走「下載圖片」同一條路徑（ExportManager.buildZip(format, true)），只是略過格式選擇的浮動視窗，直接取回 zip 內容。
 * format 由 tools.config.json 的 exportFormat 指定：有「依規格表」按鈕的工具用 'auto'，只有 PNG／JPG 的舊工具用 'png'。
 *
 * 18節 KOL代播圖 V0.9 的 buildZip 呼叫 `this.getTemplateFamily(t)`（JPG 200KB 上限用），但 ExportManager 漏了這個函式，
 * 原工具按下載會直接 TypeError。經使用者確認（2026-09-16），擷取時在頁面內補上與同檔 PriceRuleEngine 一致的寫法，
 * 原工具檔案不動；整合版 core 也採同一修法。其他工具本來就有或用不到，補了也不會改變行為。
 */
async function exportZip(page, format = 'auto') {
  const base64 = await page.evaluate(async (exportFormat) => {
    if (!window.ExportManager.getTemplateFamily && window.CapsuleRuleEngine?.getTemplateFamily) {
      window.ExportManager.getTemplateFamily = (template) => window.CapsuleRuleEngine.getTemplateFamily(template);
    }
    const blob = await window.ExportManager.buildZip(exportFormat, true);
    if (!blob) return null;
    const buffer = await blob.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  }, format);
  return base64 ? Buffer.from(base64, 'base64') : null;
}

/** 取出批次的完整資料（座標/文字/顏色），作為 JSON 層級的黃金樣本。 */
async function dumpSession(page) {
  return page.evaluate(() => ({
    excelFileName: window.AppState.excelFileName,
    sheetName: document.getElementById('excelSheetSelect')?.value || '',
    currentProject: window.AppState.currentProject,
    templates: window.AppState.templates.map((item) => ({
      name: item.name, file: item.file, project: item.project || '', visible: item.visible, data: item.data,
      // 18節 A 系把工單記錄放在 item 層（data 沒有 batchRecord），除錯比對用；黃金 session 沒有此鍵時 run-golden 的比對會忽略。
      itemRecord: item.batchRecord || null,
    })),
    unmatched: window.AppState.unmatchedBatchItems || [],
    diagnostics: window.AppState.batchDiagnostics || null,
  }));
}

module.exports = { ALL_PROJECTS_VALUE, sleep, waitForAppReady, uploadInputs, selectSheet, generate, exportZip, dumpSession };
