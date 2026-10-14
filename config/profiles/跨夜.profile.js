/* 分類設定：跨夜（18節 跨夜直播宣傳圖 V0.9）— 以 25節 KV profile（family ancestor）為底，再蓋 18節 該工具的差異（見 docs/core-diff/03-b §A／§B）。
 * 由 core/profile-loader.js 以 <script> 載入。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["profile:跨夜"] = {
  "id": "跨夜",
  "label": "18節 跨夜直播宣傳圖 V0.9",
  "family": "ancestor",
  "sheetHints": [
    "跨夜_線上宣傳圖"
  ],
  "rulesNamespace": "rules/跨夜/",
  "_comment": "同 鏡面（兩者 core 只差 4 行）。",
  "flags": {
    "render.shapeStrokeInset": false,
    "render.shapeFillEnabledMode": "ignore",
    "render.shapeBoxSource": "pathBoundsFirstOverlap",
    "assets.templateFolderPreferred": true,
    "batch.smartAssetIdMode": "plain",
    "batch.smartAssetApplyPhase": "beforeLayout",
    "batch.previewMode": "mutating",
    "render.textEngine": "legacy",
    "templates.snapshotRestore": false,
    "templates.textBaselinePrepare": false,
    "export.zipPrefix": "18SaleTool",
    "export.batchZipName": "specDrivenOrBatchTs",
    "export.autoLabel": "依工單規則",
    "export.formatSource": "specTable",
    "export.multiSizeForceJpg": true,
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
    "batch.recordContentMode": "anyField",
    "export.whiteFill": "jpg",
    "export.compressMode": "kLimit",
    "export.skipMissingAssets": true,
    "export.diagnostics": "mirror",
    "export.diagnosticsTitle": "18節跨夜直播宣傳圖"
  },
  "_inapplicable": [
    "assets.moduleCommonFolder",
    "smartAsset.multiProductLink",
    "smartAsset.skipHiddenProduct",
    "ui.manualUploadExcludeLocked"
  ],
  "_todo": [],
  "coreScripts": [
    "core/product-engine.js",
    "renderers/shape-renderer.crossnight.js",
    "core/app.core.js",
    "smart-assets/product-shadow.engine.js",
    "smart-assets/smart-asset-manager.kv.js",
    "modules/asset-review-modal.b.js",
    "modules/single-size-asset-sync.js",
    "modules/multi-size-asset-sync.js"
  ],
  "templatesDir": "templates/跨夜",
  "assetsDir": "assets/跨夜"
};
