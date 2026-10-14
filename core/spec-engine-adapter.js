/* 整合版 – 素材規格引擎別名轉接（batch.specEngineAdapter）
 *
 * 18節 network V0.5 的規則檔把規格引擎叫 `NetworkAffiliateEngine`，寫進資料的鍵名全帶 `__network` 前綴；
 * 25節 以後的 core 只認 `AssetSpecEngine` 與 `__assetSpec`／`__multiSizeSync`／`specDriven`… 這組通用鍵名。
 * 依決策 D4（2026-09-16）：規則檔一字不改，由 core 這一層接別名。做法是把 NetworkAffiliateEngine 包成 AssetSpecEngine，
 * 在 build()／prepareTemplate() 回傳前把 18 版鍵名「鏡射」成通用鍵名（同一個物件參照，之後的修改兩邊都看得到）。
 *
 * 載入時機：profile.coreScripts 第一支；AssetSpecEngine 以 getter 延遲包裝，規則檔排在 core 前後皆可。旗標值不是 network18 時什麼都不做。
 */
(function initSpecEngineAdapter() {
  'use strict';

  const mode = window.ProfileLoader?.getFlag?.('batch.specEngineAdapter', 'none') || 'none';
  if (mode !== 'network18' || window.AssetSpecEngine) return;

  /** 18節 鍵名 → 通用鍵名（圖層層級） */
  const LAYER_KEYS = [
    ['__networkAssetSpec', '__assetSpec'],
    ['__networkCanonicalName', '__canonicalName'],
    ['__networkMaskLayerName', '__maskLayerName'],
    ['__networkManualAsset', '__manualAsset'],
  ];

  const mirrorKeys = (target, pairs) => {
    if (!target || typeof target !== 'object') return;
    pairs.forEach(([from, to]) => {
      if (from in target && !(to in target)) target[to] = target[from];
    });
  };

  const mirrorTemplate = (template) => {
    if (!template || typeof template !== 'object') return template;
    Object.values(template.layers || {}).forEach((layer) => mirrorKeys(layer, LAYER_KEYS));
    mirrorKeys(template, [['__networkMeta', '__meta']]);
    mirrorKeys(template.batchRecord, [['__network', '__multiSizeSync']]);
    return template;
  };

  const mirrorBuildResult = (result) => {
    if (!result || typeof result !== 'object') return result;
    (result.generated || []).forEach((item) => mirrorTemplate(item?.data));
    mirrorKeys(result.diagnostics, [['network', 'specDriven']]);
    return result;
  };

  const wrap = (legacy) => Object.freeze({
    ...legacy,
    __source: legacy,
    prepareTemplate: (template) => mirrorTemplate(legacy.prepareTemplate(template)),
    build: (input) => mirrorBuildResult(legacy.build(input)),
  });

  // 用 getter 延遲包裝：不管規則檔排在 core 之前或之後（profile.rulesAfterCore），第一次讀 AssetSpecEngine 時才包。
  let wrapped = null;
  Object.defineProperty(window, 'AssetSpecEngine', {
    configurable: true,
    enumerable: true,
    get() {
      const legacy = window.NetworkAffiliateEngine;
      if (!legacy) return undefined;
      if (!wrapped || wrapped.__source !== legacy) wrapped = wrap(legacy);
      return wrapped;
    },
  });
})();
