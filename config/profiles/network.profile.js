/* 分類設定：network（18節 Affiliate network V0.5）— 以 25節 KV profile 為底＋規格引擎別名轉接（docs/core-diff/02 §C）。
 * 由 core/profile-loader.js 以 <script> 載入。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["profile:network"] = {
  "id": "network",
  "label": "18節 Affiliate network V0.5",
  "family": "ancestor",
  "sheetHints": [
    "Network_"
  ],
  "rulesNamespace": "rules/network/",
  "_comment": "18節 network＝25節 KV 前一代＋自家規格引擎（NetworkAffiliateEngine）；由 core/spec-engine-adapter.js 接別名（D4）。",
  "flags": {
    "assets.bucketRelPathKeys": false,
    "batch.smartAssetIdMode": "plain",
    "batch.smartAssetApplyPhase": "beforeLayout",
    "batch.previewMode": "mutating",
    "render.textEngine": "legacy",
    "templates.snapshotRestore": false,
    "templates.textBaselinePrepare": false,
    "export.zipPrefix": "18SaleTool",
    "export.autoLabel": "依工單規則",
    "export.formatSource": "specTable",
    "export.stemSource": "templateId",
    "export.folderStrategy": "specBanner",
    "export.jsonMode": "raw",
    "price.layerBaselineMode": "none",
    "price.specialCharRanges82": false,
    "price.rebuildMemoryMode": "text",
    "smartAsset.engine": "kv",
    "ui.toolName": "18節生成工具",
    "rules.normalizeLegacy": true,
    "rules.loadFailurePolicy": "continue",
    "batch.specEngineAdapter": "network18",
    "batch.assetSpecEngineFirst": true,
    "templates.prepareHook": "assetSpecEngine",
    "export.scaleMode": "multiSize2x",
    "export.whiteFill": "multiSize",
    "export.compressMode": "multiSize150k",
    "export.multiSizeForceJpg": true,
    "export.specRootFolder": "Network_4.5-4.18",
    "export.specZipName": "18節Tool_network_輸出.zip",
    "export.diagnostics": "assetSpec",
    "ui.assetReviewMode": "off"
  },
  "_inapplicable": [
    "assets.moduleCommonFolder",
    "smartAsset.multiProductLink",
    "smartAsset.skipHiddenProduct",
    "ui.manualUploadExcludeLocked"
  ],
  "_todo": [],
  "coreScripts": [
    "core/spec-engine-adapter.js",
    "core/product-engine.js",
    "renderers/shape-renderer.js",
    "core/app.core.js",
    "smart-assets/product-shadow.engine.js",
    "smart-assets/smart-asset-manager.kv.js",
    "modules/multi-size-asset-sync.network.js"
  ],
  "templatesDir": "templates/network",
  "assetsDir": "assets/network"
};
