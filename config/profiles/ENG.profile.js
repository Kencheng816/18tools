/* 分類設定：ENG（18節 ENG Tool V0.9）— docs/core-diff/04 §2。由 core/profile-loader.js 以 <script> 載入。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["profile:ENG"] = {
  "id": "ENG",
  "label": "18節 ENG Tool V0.9",
  "family": "ancestor",
  "sheetHints": [
    "day KV",
    "紅包雨KV",
    "OMKV"
  ],
  "rulesNamespace": "rules/ENG/",
  "_comment": "18節 ENG＝V4.20.3 舊 core 最乾淨的成員（AMS 減 AMS 專屬）；docs/core-diff/04 §2。",
  "flags": {
    "assets.fuzzyRoleGuard": false,
    "batch.coreCopyTextMap": false,
    "batch.coreSubtitleTextMap": true,
    "assets.bucketRelPathKeys": false,
    "render.rangeTypography": "colorOnly",
    "batch.smartAssetIdMode": "none",
    "batch.smartAssetApplyPhase": "none",
    "batch.previewMode": "mutating",
    "render.textEngine": "legacy",
    "templates.snapshotRestore": false,
    "templates.textBaselinePrepare": false,
    "export.zipPrefix": "18SaleTool",
    "export.batchZipName": "batchTs",
    "export.autoLabel": "依工單規則",
    "export.formatSource": "specTable",
    "export.multiSizeForceJpg": false,
    "export.stemSource": "templateId",
    "export.folderStrategy": "project",
    "export.jsonMode": "raw",
    "price.layerBaselineMode": "none",
    "price.specialCharRanges82": false,
    "price.rebuildMemoryMode": "text",
    "smartAsset.engine": "none",
    "ui.toolName": "18節生成工具",
    "rules.normalizeLegacy": true,
    "rules.loadFailurePolicy": "continue",
    "batch.assetSpecEngineFirst": false,
    "templates.prepareHook": "none",
    "export.scaleMode": "fixed4x",
    "export.whiteFill": "jpg",
    "export.compressMode": "none",
    "ui.assetReviewMode": "off",
    "render.autoLogoShadow": false,
    "render.shapeFillEnabledMode": "ignore",
    "export.diagnostics": "none",
    "interaction.syncMode": "dispatch",
    "interaction.dblclickReplace": "none",
    "interaction.replaceAssetImpl": "none"
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
    "renderers/shape-renderer.js",
    "core/app.core.js"
  ],
  "templatesDir": "templates/ENG",
  "assetsDir": "assets/ENG"
};
