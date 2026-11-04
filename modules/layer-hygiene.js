/* 整合版（18節）— 公版圖層整理：參考圖層不輸出、文字框貼合文字、圖層精準比對
 *
 * 2026-10-30 公版整併（templates/暖身BN 等由使用者重做）後的通用規則，四件事：
 *   1. 參考用圖層（名稱含「規範」的規範圖；暖身BN 再加含「範圍」的參考框，旗標 layers.guideNameKeywords；「範圍_底色」不算）：hidden＋locked＋__internal——
 *      輸出不畫、圖層清單不列；規範圖另外登記成「規範」開關的疊圖來源（SpecOverlayManager），畫布上仍看得到。
 *      規則檔可再用 window.LayerHygiene.markGuide(layer) 把特定圖層（例：HBN 的 副標題_藍底）也標成參考用。
 *   1b. 字距單位校正（旗標 text.normalizeRawTracking，只有暖身BN 開）：PSD 匯出沒換算成 px 的字距（千分之一 em 原始值）換成 px。
 *   2. 文字框貼合文字（封測回饋 P1-2 第 16 題）：產圖後每個文字層的框寬改成實際文字寬度，置中保持中心、靠右保持右邊、
 *      靠左保持左邊——畫出來的位置一個像素都不變（渲染是以 x＋width／2 當中心），只是框不再比字短或長。
 *      價格層（auto_price_v2）已有自己的貼合邏輯，略過；旋轉過的也略過。
 *   3. 圖層精準比對：core 的 BatchManager.findLayer 用「名稱包含關鍵字」找第一個，公版新增 蝦皮VIP_主標題_左 這類圖層後
 *      會搶走「主標」。改成先找「名稱完全等於關鍵字」的圖層（key 或 psdName），沒有才退回原本的包含比對。
 *
 * 純加法：包住 TemplateLoader.loadTemplateFolder／BatchManager.generateFromSelectedSheet／findLayer／LayerManager.render，
 * 不改 core；黃金回歸驗證輸出不變（會動輸出的是各公版規則，不在這裡）。
 */
(function initLayerHygiene() {
  'use strict';

  // 參考用圖層名稱關鍵字（旗標 layers.guideNameKeywords）：預設只有「規範」；暖身BN 另加「範圍」（P_範圍 在 A 系會被畫成實心框）。
  // B 系工具（AMS／OM／network／跨夜）的 P_範圍 是商品圖的位置框、由 core 自己處理，不能藏。
  // 「範圍_底色」這類跟著參考框走的底色（KOL 的 LOGO_範圍_底色）是會輸出的圖層，不算參考用。
  const guideKeywords = () => {
    const value = window.ProfileLoader?.getFlag?.('layers.guideNameKeywords', undefined);
    return Array.isArray(value) && value.length ? value : ['規範'];
  };
  const isGuideName = (key, layer) => {
    const label = `${key} ${layer?.psdName || ''}`;
    return guideKeywords().some((keyword) => label.includes(keyword)) && !/範圍_?底色/.test(label);
  };
  const core = () => ({ AppState: window.AppState, TemplateLoader: window.TemplateLoader, BatchManager: window.BatchManager, Renderer: window.Renderer, LayerManager: window.LayerManager, SpecOverlayManager: window.SpecOverlayManager });
  const clean = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n?/g, '\n');
  const norm = (value) => String(value || '').toLowerCase().replace(/\s+/g, '').replace(/[\-_()（）\[\]【】]/g, '');

  // ── 1. 參考用圖層 ──

  function markGuide(layer) {
    if (!layer) return;
    layer.hidden = true;
    layer.locked = true;
    layer.__internal = true;
    layer.__guide = true;
  }


  /** 一份公版：標參考圖層，並把規範圖的檔名記在公版上（給規範疊圖用）。 */
  function hygieneTemplate(template) {
    if (!template?.layers) return;
    const specAssets = [];
    Object.values(template.layers).forEach(normalizeLetterSpacing);
    Object.entries(template.layers).forEach(([key, layer]) => {
      if (!isGuideName(key, layer)) return;
      markGuide(layer);
      if (/規範/.test(`${key} ${layer.psdName || ''}`) && layer.assetFilename) specAssets.push(String(layer.assetFilename));
    });
    if (specAssets.length) template.__specOverlayAssets = specAssets;
  }

  function hygieneAll() {
    const { AppState } = core();
    (AppState?.templates || []).forEach((item) => hygieneTemplate(item?.data));
    (AppState?.sourceTemplates || []).forEach((item) => hygieneTemplate(item?.data));
  }

  /** 規範疊圖：除了原本的「前綴_規範.png」，也接受公版自己帶的規範圖檔名與「公版 id_規範.png」。 */
  function wireSpecOverlay() {
    const { SpecOverlayManager } = core();
    if (!SpecOverlayManager || SpecOverlayManager.__hygieneWired) return;
    SpecOverlayManager.__hygieneWired = true;
    const original = SpecOverlayManager.getAllowedSpecFilenames;
    SpecOverlayManager.getAllowedSpecFilenames = function getAllowedSpecFilenamesWithGuides(template = core().AppState?.template, ...rest) {
      const base = original.call(this, template, ...rest) || [];
      const extra = [...(template?.__specOverlayAssets || [])];
      const templateId = String(template?.templateId || template?.canvas?.templateId || '').trim();
      if (templateId) extra.push(`${templateId}_規範.png`, `${templateId} 規範.png`);
      return [...new Set([...base, ...extra])];
    };
  }

  // ── 1b. 字距單位校正 ──
  // PSD 匯出的字距大多已換算成 px（例：字距 50 ‰ × 29px 字 → 1.45），但少數圖層會留著 Photoshop 原始的千分之一 em 值
  // （例：01_頭巾 subtitle 的 -10、鏡面 人名標 主持人 的 10），工具當成 px 畫就會擠在一起或拉太開。
  // 判斷：|字距| 超過字級的 15%（150 ‰）就不可能是 px，視為千分之一 em 換算：px = 值 ÷ 1000 × 字級。換算後打標記，不重複換算。
  // 旗標 text.normalizeRawTracking=true 的分類才做（目前只有暖身BN；鏡面 人名標 使用者決定維持原樣）。
  const RAW_TRACKING_RATIO = 0.15;
  const trackingEnabled = () => window.ProfileLoader?.getFlag?.('text.normalizeRawTracking', false) === true;

  function normalizeTracking(value, fontSize) {
    const spacing = Number(value) || 0;
    const size = Number(fontSize) || 0;
    if (!spacing || !size || Math.abs(spacing) / size <= RAW_TRACKING_RATIO) return spacing;
    return Math.round((spacing / 1000) * size * 100) / 100;
  }

  function normalizeLetterSpacing(layer) {
    if (!trackingEnabled() || !layer || layer.type !== 'text' || layer.__letterSpacingNormalized) return false;
    layer.__letterSpacingNormalized = true;
    const before = Number(layer.letterSpacing) || 0;
    layer.letterSpacing = normalizeTracking(layer.letterSpacing, layer.fontSizePx);
    (Array.isArray(layer.textStyleRanges) ? layer.textStyleRanges : []).forEach((range) => {
      if (range && range.letterSpacing !== undefined) range.letterSpacing = normalizeTracking(range.letterSpacing, range.fontSizePx || layer.fontSizePx);
    });
    return before !== layer.letterSpacing;
  }

  // ── 2. 文字框貼合文字 ──

  function fitTextBox(layer, probe) {
    const { Renderer } = core();
    if (!layer || layer.type !== 'text' || layer.hidden || layer.__guide) return false;
    if (layer.source === 'auto_price_v2' || Number(layer.rotation)) return false;
    const text = clean(layer.text);
    if (!text.trim() || typeof Renderer?.measureRenderedTextWidth !== 'function') return false;
    const width = text.split('\n').reduce((max, line) => Math.max(max, Number(Renderer.measureRenderedTextWidth({ ...layer, text: line }, probe)) || 0), 0);
    if (!(width > 0)) return false;
    const oldWidth = Number(layer.width) || 0;
    const oldX = Number(layer.x) || 0;
    if (Math.abs(width - oldWidth) < 0.5) return false;
    // 置中：中心不動；靠右：右邊不動；靠左：左邊不動（與渲染取錨點的方式一致，畫出來的位置不變）
    const align = layer.align || 'center';
    const nextX = align === 'left' ? oldX : align === 'right' ? oldX + oldWidth - width : oldX + (oldWidth - width) / 2;
    layer.x = nextX;
    layer.width = width;
    if (layer.centerX !== undefined) layer.centerX = nextX + width / 2;
    return true;
  }

  function fitAllTextBoxes() {
    const { AppState } = core();
    const probe = document.createElement('canvas').getContext('2d');
    let count = 0;
    (AppState?.templates || []).forEach((item) => {
      Object.values(item?.data?.layers || {}).forEach((layer) => { try { if (fitTextBox(layer, probe)) count += 1; } catch (_) { /* 量不到就不動 */ } });
    });
    return count;
  }

  // ── 3. 圖層精準比對 ──

  function wireFindLayer() {
    const { BatchManager } = core();
    if (!BatchManager?.findLayer || BatchManager.findLayer.__hygieneWired) return;
    const original = BatchManager.findLayer;
    const exactFirst = function findLayerExactFirst(template, type, words, allowFallback = false) {
      const wanted = (words || []).map(norm).filter(Boolean);
      const exact = Object.entries(template?.layers || {}).find(([key, layer]) =>
        layer && layer.type === type && !layer.__guide && (wanted.includes(norm(key)) || wanted.includes(norm(layer.psdName))));
      if (exact) return exact[1];
      return original.call(this, template, type, words, allowFallback);
    };
    exactFirst.__hygieneWired = true;
    BatchManager.findLayer = exactFirst;
  }

  // ── 接線 ──

  function wireTemplateLoader() {
    const { TemplateLoader } = core();
    if (!TemplateLoader?.loadTemplateFolder || TemplateLoader.loadTemplateFolder.__hygieneWired) return;
    const original = TemplateLoader.loadTemplateFolder;
    const wrapped = async function loadTemplateFolderWithHygiene(...args) {
      const result = await original.apply(this, args);
      hygieneAll();
      core().LayerManager?.render?.();
      return result;
    };
    wrapped.__hygieneWired = true;
    TemplateLoader.loadTemplateFolder = wrapped;
  }

  function wireGenerate() {
    const { BatchManager } = core();
    if (!BatchManager?.generateFromSelectedSheet || BatchManager.generateFromSelectedSheet.__hygieneWired) return;
    const original = BatchManager.generateFromSelectedSheet;
    const wrapped = async function generateWithHygiene(...args) {
      hygieneAll(); // 產圖前先標好（公版池是從目前的公版複製出來的；內建公版若在接線前就載完，這裡補上）
      const result = await original.apply(this, args);
      hygieneAll();
      fitAllTextBoxes();
      core().LayerManager?.render?.();
      return result;
    };
    wrapped.__hygieneWired = true;
    BatchManager.generateFromSelectedSheet = wrapped;
  }

  /** 圖層清單：__internal 的不列（core 沒有這個過濾，KOL 規則也是靠它）。 */
  function wireLayerList() {
    const { LayerManager } = core();
    if (!LayerManager?.render || LayerManager.render.__hygieneWired) return;
    const original = LayerManager.render;
    const wrapped = function renderWithoutInternal(...args) {
      const result = original.apply(this, args);
      const layers = core().AppState?.template?.layers || {};
      document.querySelectorAll('#layerList .layerItem[data-key]').forEach((el) => { if (layers[el.dataset.key]?.__internal) el.remove(); });
      return result;
    };
    wrapped.__hygieneWired = true;
    LayerManager.render = wrapped;
  }

  function wire() {
    wireTemplateLoader();
    wireGenerate();
    wireFindLayer();
    wireLayerList();
    wireSpecOverlay();
    hygieneAll();
  }

  function main() {
    const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
    whenReady();
  }

  window.LayerHygiene = Object.freeze({ markGuide, hygieneTemplate, normalizeLetterSpacing, fitTextBox, fitAllTextBoxes });

  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', main, { once: true });
  else main();
})();
