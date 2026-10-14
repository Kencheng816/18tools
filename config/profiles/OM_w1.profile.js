/* 分類設定：OM_w1（18節 外廣OM Wave 1 V3.8）— 以 25節 KV profile（family ancestor）為底，再蓋 18節 差異（docs/core-diff/02）。
 * 由 core/profile-loader.js 以 <script> 載入。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["profile:OM_w1"] = {
  "id": "OM_w1",
  "label": "18節 外廣OM Wave 1 V3.8",
  "family": "ancestor",
  "sheetHints": [
    "外廣_Wave1"
  ],
  "rulesNamespace": "rules/OM_w1/",
  "_comment": "18節 OM 是 25節 KV 前一代；不載 modules/*（互動用）。",
  "flags": {
    "assets.bucketRelPathKeys": false,
    "render.rangeTypography": "colorOnly",
    "batch.smartAssetIdMode": "plain",
    "batch.smartAssetApplyPhase": "beforeLayout",
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
    "export.folderStrategy": "specBanner",
    "export.jsonMode": "raw",
    "price.layerBaselineMode": "none",
    "price.specialCharRanges82": false,
    "price.rebuildMemoryMode": "text",
    "smartAsset.engine": "kv",
    "ui.toolName": "18節生成工具",
    "rules.normalizeLegacy": true,
    "rules.loadFailurePolicy": "continue",
    "batch.assetSpecEngineFirst": false,
    "templates.prepareHook": "none",
    "export.scaleMode": "fixed4x",
    "export.whiteFill": "none",
    "export.compressMode": "none",
    "ui.assetReviewMode": "off",
    "interaction.syncMode": "smartOnly",
    "interaction.dblclickReplace": "none",
    "interaction.replaceAssetImpl": "none",
    "rules.omWaveProfile": "none"
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
    "core/app.core.js",
    "smart-assets/product-shadow.engine.js",
    "smart-assets/smart-asset-manager.kv.js"
  ],
  "templatesDir": "templates/OM_w1",
  "assetsDir": "assets/OM_w1"
};
