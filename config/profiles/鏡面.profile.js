/* 分類設定：鏡面（18節 鏡面 V0.1）— 以 25節 KV profile（family ancestor）為底，再蓋 18節 該工具的差異（見 docs/core-diff/03-b §A／§B）。
 * 由 core/profile-loader.js 以 <script> 載入。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["profile:鏡面"] = {
  "id": "鏡面",
  "label": "18節 鏡面 V0.1",
  "family": "ancestor",
  "sheetHints": [
    "_鏡面"
  ],
  "rulesNamespace": "rules/鏡面/",
  "_comment": "18節 鏡面／跨夜 core 是 25節 KV 的直系（不是 25節 鏡面）；flags＝KV 值＋鏡面式匯出。",
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
    "export.diagnosticsTitle": "18節鏡面"
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
  "templatesDir": "templates/鏡面",
  "assetsDir": "assets/鏡面"
};
