# 02 — 祖先群：18節 OM_w1／OM_w2／network 對 25節 整合版 core 的差異（2026-09-16）

比對方法：三份 18節 `core/app.core.js` 先去空白，與 25節 原版（OM_w1 V0.5、OM_w2 V0.4、network V0.7、KV V0.2）及 25節 整合版 `core/app.core.js`（B 系實作）逐模組、逐方法切指紋，只對有差異的方法看語意。rules／templates／renderers／product-engine／smart-assets／index.html 另做逐檔 diff。所有結論都以「會不會改變批次產圖的像素／檔名／資料夾／格式／session.json」為準，重構與註解不算。

## 0. 三個工具的共同結論（先看這裡）

| 項目 | 結論 |
|---|---|
| 血緣 | 三份 core 都是 **25節 KV V0.2 的前一代**（OM 18 ＝ 5611 行、network 18 ＝ 6392 行、KV 25 ＝ 6203 行）。去空白 diff：OM_w1↔OM_w2 **33 行**、network↔KV **485 行**、OM↔KV **744 行**。OM 18 比 KV 更舊（無 AssetSyncHub／AssetSpecEngine／通用文字 range 字級）；network 18 介於兩者之間（已有 KV 的文字引擎與工單 readCell，但素材規格引擎仍叫 `NetworkAffiliateEngine`、鍵名全帶 `__network` 前綴）。 |
| 與 25節 整合版的關係 | 整合版 B 系實作＋KV 旗標組（`render.textEngine=legacy`、`templates.textBaselinePrepare=false`、`price.layerBaselineMode=none`、`smartAsset.engine=kv`、`export.formatSource=specTable`、`export.folderStrategy=specBanner`、`export.stemSource=templateId`、`export.zipPrefix=18SaleTool`、`rules.normalizeLegacy=true`、`rules.loadFailurePolicy=continue`…）已經覆蓋三個工具 **九成以上**的行為：Price*（6 個模組）、CapsuleRuleEngine、LayoutRuleEngine、HistoryManager、TextEditor、App、TemplateFilter、PreviewZoom、LoadingOverlay、`applyRecordToTemplate`、`findTemplateForName`、`resolveSpecFormat`、`resolveBannerSubfolder` 與 KV 25 **逐字相同**。 |
| 三個工具都沒有 `modules/` | 25節 的 `asset-review-modal`／`single-size-asset-sync`／`multi-size-asset-sync` 全是「互動後」才生效（拖曳、上傳、審核彈窗），批次產圖與匯出**不受影響**；18節 這三個 profile 建議**不要載入**這三支（`ui.assetReviewMode=off`）。唯一例外是 network：18節 把跨版位同步寫死在 core 裡（`NetworkSmartObjectSync`），要抽成一支新模組，見 §C.4。 |
| 三個工具都有 `smart-assets/` | OM 18 的 `smart-asset-manager.js` 是 KV 版的**子集**（少 `__placementGuide`／`P_範圍_NN` 判斷與 NetworkSmartObjectSync 掛勾；OM 公版只有 `P_範圍` 一個參考框，結果相同）；network 18 與整合版 `smart-asset-manager.kv.js` **逐字相同**。三者都走 `smartAsset.engine=kv`。`product-shadow.engine.js` 三者與整合版相同。 |
| 需要新增的旗標（會影響像素／檔名） | 共 **5 個**：`render.rangeTypography`（OM_w2 Appier 必要）、`render.emptyImagePlaceholder`（OM 潛在）、`batch.sheetRowsReader`（OM 潛在）、`batch.specEngineAdapter`（network 必要）、`export.specRootFolder`（network 必要）；另 1 個只影響 zip 檔名：`export.specZipName`。 |
| 需要新增的程式 | (1) `rules/shared/template-rule-utils.js` 補 5 支函式（OM 規則會呼叫，整合版沒有）；(2) `modules/network-smart-object-sync.18.js`（從 network 18 core 抽出，互動用）；(3) 18 OM 版 `getTextStyleSegments／measureTextSegments／drawStyledTextLine` 作為 `render.rangeTypography=colorOnly` 分支。 |

---

## A. OM_w1（`外廣OM/18節Tool_外廣OM Wave 1_V3.8`）

### A.1 架構摘要
core 5611 行、32 個頂層模組：`SVG GLOBAL_VECTOR_RULES EMBEDDED_ASSETS AppState ASSET_POLICY AssetStore DOM HistoryManager TemplateLoader Geometry SpecOverlayManager CapsuleRuleEngine LayoutRuleEngine Renderer LayerManager Inspector TextEditor PreviewZoom ExportManager TemplateFilter TemplateList LoadingOverlay PriceRuleEngine PriceColorResolver PriceLayoutResolver PriceParser PriceLayerFactory PriceTransformEngine PriceCouponManager BatchManager Interaction App`。

| 相比 | 少了 | 多了 |
|---|---|---|
| 25節 KV V0.2（最近親戚） | `AssetSyncHub`、頂層 `decodeHashUnicode/normalizeAssetStemExact/normalizeLayerIdentifier`、`scheduleBlobRevoke/showToast`；TemplateLoader 少 `updateSpecAssetWarning/resolveAssetSpec`；Renderer 少 `fontForTextStyle/getTextInkMetrics/shouldCenterStyledTextByFirstSegment/findLayerByCanonicalName/applyImageMask`；Interaction 少 `replaceSpecDrivenImage`；AssetStore 少 `getFileEntries` | 無 |
| 25節 OM_w1 V0.5 | 再少 `TextBaselineModel`、`SnapshotManager`、`SPTextStandard` 呼叫、`fitTextLayerToInk` | 無 |
| 25節 整合版 | 上述全部（整合版皆有旗標可關） | 無新模組 |

與 KV 25 有差異的方法（去空白後）：`AssetStore.getFlatForLookup`（只差結尾大括號位置，無語意差）、`TemplateLoader.loadImagesForTemplate/findLocalAssetFile/loadAssetFolder/loadTemplateFolder`、`SpecOverlayManager.getAllowedSpecFilenames/loadImage/loadForActiveTemplate`、`Renderer._drawLayers/drawPlacementGuide/renderSceneTo/drawText/getTextStyleSegments/measureTextSegments/drawStyledTextLine/drawImage`、`LayerManager.*`（`__nonInteractive`）、`Inspector.applyBoxFromInputs`、`ExportManager.exportVisibleBatch/buildZip/createZip`、`BatchManager.sheetToRowsWithMergedFill/generateFromSelectedSheet/resolveRecordTemplateRoute/refreshTemplateFromBatchRecord/makeThumbURLFor`、`Interaction.*`。

### A.2 會影響輸出的行為差異

| 差異點 | 18節 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| 文字 range 字級（`Renderer.getTextStyleSegments` 1517–1557、`drawStyledTextLine` 1565–1588） | `textStyleRanges` **只讀 color**；分段一律用圖層本身的字型字級，`textBaseline='top'`、y 不動、字距用圖層 letterSpacing | `render.textEngine=legacy`（KV 版）會讀每段的 `fontSizePx/fontFamily/fontWeight/italic/letterSpacing/baselineOffset` 並逐段換字型；`usp_上/中/下` 首段置中、`styledTextVerticalAlign=source-baseline` 貼底 | **pixel**（OM_w1 公版 range 字級都等於圖層字級，實際輸出相同；但 OM_w2 Appier 公版有 43.79 vs 43.8 px 的 range，見 B.2） | 新增旗標 `render.rangeTypography = colorOnly`（18 OM／network）／`full`（其餘）。colorOnly 分支直接沿用 18 版三支函式 |
| 空素材圖層佔位框（`Renderer.drawImage` 1661–1694） | 可見 image 圖層 **沒有 assetFilename** 時，不分主畫布／縮圖／匯出，一律畫白色虛線框＋圖層名（14px sans-serif） | 只在 `showMissing`（主畫布、縮圖）時畫；匯出 `renderSceneTo(..., {showMissing:false})` 不畫；另有 `__assetMissing` 紅框（18 無） | **pixel**（只在某張輸出有「可見但沒素材」的圖層時才會顯現；黃金樣本 warnings 為空，機率低但無法排除） | 新增旗標 `render.emptyImagePlaceholder = always`（18 OM）／`uiOnly`（預設）。18 OM 的 `__assetMissing` 紅框永不出現（無此欄位），無需另旗標 |
| 讀工單列（`BatchManager.sheetToRowsWithMergedFill` 3361–3377） | `XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',blankrows:true})`：取原始值 `v`（公式格取快取值、日期格是序號數字）、列／欄索引**相對於 `!ref` 起點** | KV 起 readCell：公式格先取顯示字串 `w`、再 `v`、再解單格參照；文字格先 `w`；列／欄用**絕對索引**；`batch.rowsFromZero/mergeFillMode/numericDisplayValue` 三旗標 | **pixel／json**（工單 `外廣_Wave1` 的 `!ref` 從 A1 起、資料區 94 個公式格都是字串結果、唯一日期格 B3 不在解析欄 → 對黃金樣本**無差**；但換一張工單就可能不同） | 新增旗標 `batch.sheetRowsReader = sheetToJson`（18 OM）／`readCell`（預設）。合併填值邏輯兩邊相同（只補單欄垂直合併） |
| 規則載入失敗／登錄器 | 靜態 `<script>`、merge 模式、normalize 不去數字前綴、不 NFKC | 同 KV | 無差 | 沿用 KV 值：`rules.registryMode=merge`、`rules.normalizeLegacy=true`、`rules.loadFailurePolicy=continue` |
| 公版載入前處理（`loadTemplateFolder` 642–661） | 不呼叫任何 prepare hook | KV：`AssetSpecEngine.prepareTemplate`；有 `templates.prepareHook` | 無差（OM 頁面不會載入任何 AssetSpecEngine） | `templates.prepareHook=none`（保守）；`batch.assetSpecEngineFirst=false` |
| 素材找檔／URL 探測（`loadImagesForTemplate` 417–498、`findLocalAssetFile` 499–592、`loadAssetFolder` 600–641） | 無 `__assetSpec` 分支；`layer.hidden` 的圖層**也會**預載；檔名不做 `#Uxxxx` 解碼、bucket 只放 `file.name` | KV：hidden 圖層不預載；`#Uxxxx` 解碼、bucket 多放 relPath | 無差（hidden 圖層不繪製；規則在載圖前就已決定顯隱；18 素材檔名無 `#U`） | 沿用 KV 值（`assets.lookupEngine=flatFuzzy` 等），不加旗標 |
| 輸出格式／資料夾／檔名（`buildZip` 2145–2246） | `format=auto` → `resolveSpecFormat(__media‖project, WxH)` 查素材規格表，查不到 jpg；資料夾 `專案/Template‖UAC-Pmax-LineLAP/bannerN`；檔名 `templateId.ext`（不剝 `.png/.jpg` 尾綴）；4x 超取樣、無白底、無壓縮 | KV 旗標：`export.formatSource=specTable`、`folderStrategy=specBanner`、`stemSource=templateId`；非 `__multiSizeSync` 項目 4x、無白底、無壓縮；檔名會剝 `.png/.jpe?g` 尾綴 | 無差（18 OM 永遠沒有 `__multiSizeSync`；工單「檔案命名」欄不帶副檔名） | 沿用 KV 值；`export.scaleMode=fixed4x`、`whiteFill=none`、`compressMode=none`、`multiSizeForceJpg=false` 取「忠實」值 |
| 批次 zip 檔名（`exportVisibleBatch` 2090–2100） | 固定 `18SaleTool_batch_<ts>.zip` | `batchTs` ＝ `<prefix>_batch_<ts>` | filename（zip 外層，黃金比對通常不看） | `export.zipPrefix=18SaleTool`、`export.batchZipName=batchTs` |
| `export.transparentToPng`（25 節 2026-09-15 決定全開） | 18 節沒有此功能 | 預設 true | **format**（若某張 jpg 成品含透明像素會被改存 png） | 見 A.7 拍板 |

### A.3 只是超集或 UI 的差異（直接取整合版，不需旗標）
- `_drawLayers` 參考框改成最後畫、`drawPlacementGuide` 顏色／線寬（藍 2px vs 青 1.5px）：只在 `ui=true` 或縮圖出現，匯出不畫。
- `LayerManager` 的 `__nonInteractive`、`toggleVisible` 重載圖、`Interaction.onDoubleClick/replaceSpecDrivenImage`、`AssetSyncHub.begin/update/finish` 呼叫、`Inspector.applyBoxFromInputs` 同步：互動後才有影響。
- `SpecOverlayManager.loadForActiveTemplate` 競態保護、`scheduleBlobRevoke`、`showToast`、`createZip` 的 `platform:'UNIX'` 與 UTF-8 flag（zip 中繼資料；JSZip 存在時本來就會設）。
- `drawTextLegacy` 多把 `  ` 當換行：18 公版與工單都沒有這些字元。
- `Renderer.applyImageMask/findLayerByCanonicalName`：OM 公版無 `maskLayerName`。
- `shape-renderer.js`（OM18 vs KV 98 行）：KV 多四角各自半徑 `cornerRadii` 與 `clipJsonShape`；OM 公版沒有 `cornerRadii`，四角同半徑時 `lineTo+arcTo` 與 18 的四段 `arcTo` 幾何路徑相同。
- `product-engine.js`：與 KV 逐字相同；整合版多 `cover/coverByPBox`，18 公版只用 `widthBased`／無。
- `index.html`／`style.css`：只差 `<title>18節生成工具`、smart-asset css 位置、規則 script 清單。

### A.4 需要新增進 core 的模組／函式
| 內容 | 來源 | 用途 |
|---|---|---|
| `TemplateRuleUtils.findLayerEntryByExactName / setLayerVisibility / setLayerCenterX / resizeCapsuleLayer / resolveSubtitleVariant` | `外廣OM/18節Tool_外廣OM Wave 2_V0.5/rules/shared/template-rule-utils.js` 134–229（w2 版 `resizeCapsuleLayer` 多 `cornerRadius` 參數，是 w1 版超集）；匯出表 230–246 | 18 OM 兩支規則檔直接呼叫 `U.findLayerEntryByExactName／U.setLayerVisibility／U.resizeCapsuleLayer／U.resolveSubtitleVariant`，整合版 `rules/shared/template-rule-utils.js`（330 行）**沒有**這 5 支 → 必須補進共用檔（純加法，不動既有函式） |
| `Renderer.getTextStyleSegments / measureTextSegments / drawStyledTextLine`（18 版） | `外廣OM/18節Tool_外廣OM Wave 1_V3.8/core/app.core.js` 1517–1588 | `render.rangeTypography=colorOnly` 分支 |
| `Renderer.drawImage` 佔位框 else 分支 | 同上 1681–1690 | `render.emptyImagePlaceholder=always` 分支 |
| `BatchManager.sheetToRowsWithMergedFill`（sheet_to_json 版） | 同上 3361–3377 | `batch.sheetRowsReader=sheetToJson` 分支 |

### A.5 rules／templates／renderers／product-engine／smart-assets／modules／plugins 檔案差異
| 檔案 | 對 18 OM_w2 | 對 25節 OM_w1 原版 | 對 25節 整合版 | 結論 |
|---|---|---|---|---|
| `rules/om-wave1-subtitle_rules.js`（800 行） | w2 版多 `resolveFamilyCapsuleRule`、`comparisonLayer/centerX/contentGap` 讀取（只在 family 規則提供 `resolveSubtitleCapsuleRule` 時生效 → w2 是 w1 **嚴格超集**） | 25節 完全重寫：`om-wave1-router_rules.js`＋`shared/om-wave1-parser.js／template-matcher.js／layout.js／initial-placements.js`，按媒體拆 5 個 family（`om_wave1_template/uac_pmax_linelap/rtbhouse/appier/dpa_frame_mau`），受 `rules.omWaveProfile` 控制 | 無對應 | **有行為差異**，必須獨立命名空間 `rules/18_OM/`，`rules.omWaveProfile=none` |
| `rules/shared/template-rule-utils.js`（246 行） | 差 `resizeCapsuleLayer` 的 `cornerRadius` 參數（超集） | — | 整合版少 5 支函式、多 `computeAlphaBBox/fitImageByAlpha*/computeFitIoU`；其餘 9 支相同 | **只多不少**（補 5 支後） |
| `rules/template-rules.loader.js` | 只差 `loadedRuleFiles` 清單 | 25 OM 用 manifest 動態載入＋strict | 與 KV 25 版差 14 行（排序／label），行為同 KV | 沿用整合版 `core/template-rules.loader.js`＋KV 三旗標 |
| `config/template-routing.js` | 相同 | 相同 | — | 空設定，不需要 |
| `templates/*.json`（17 份） | 完全不同的集合（w1：Template/UAC-Pmax-LineLAP/DPA Frame/line point/pixnet/Rtbhouse；w2：17 份 Appier） | 同名 10 份**內容都不同**，另 7 份只有 18 有（`DPA Frame`、`LinePoint_960x540`、`UAC-Pmax-LineLAP_960x1200`、`line point_*`、`pixnet_*`） | — | 放 `templates/18_OM_w1/`；13 份含 `assetPlacementPresets`（18 的精準定位資料放在 JSON 內，25 改放 `om-wave1-initial-placements.js`） |
| `assets/`（38 檔） | 不同（w2 只有 Appier） | 25 節檔名改 `UAC_Pmax_LineLAP`、`DPA Frame_MAU` | — | 放 `assets/18_OM_w1/`；規則 `MEDIA_ASSET_FOLDER_MAP` 依媒體名找子資料夾 |
| `renderers/shape-renderer.js` | 相同 | — | 整合版為超集（見 A.3） | 沿用整合版 |
| `core/product-engine.js` | 相同 | — | 超集，`render.productSizingHeightPriority=legacy` | 沿用整合版 |
| `smart-assets/smart-asset-manager.js` | 相同 | — | 是 `smart-asset-manager.kv.js` 子集（少 84 行 Network 掛勾與 `P_範圍_NN` 判斷） | `smartAsset.engine=kv` |
| `smart-assets/product-shadow.engine.js`、`smart-asset-editor.css` | 相同 | — | 相同 | 沿用 |
| `modules/`、`dom-editor-plugins/` | 無 | 25 有 | 25 有 | 不載入（見 §0） |

**18節 的公版比對／分流邏輯在哪裡**：全部在 `rules/om-wave1-subtitle_rules.js`。
1. `parseOmWave1Sheet`（625–722）用固定欄位（B 欄曝光媒體、D 欄 Layout No.、E 欄尺寸、F 欄檔案命名、I 欄製作內容）逐列產生 block，`resolveTemplateId(media,size)`（611–624）直接把媒體＋尺寸拼成公版 id（`Template_1200x1200`、`pixnet_672x560`、`LinePoint_960x540`、`DPA Frame`…），`VideoElements` 略過。
2. `resolveRecordTemplateRoute`（723–735）回 `{family:'om_wave1_subtitle', templateFile:'<id>.json', outputName, outputPrefix:__media}`；core 再用 `findTemplateForRoute`（fuzzy）＋`fetchRouteTemplate` 找公版。
3. `beforeApplyRecordToTemplate`（528–610）依媒體換 `KV_BG` 底圖檔名、600x400 移除商品層；`afterApplyRecordToTemplate`（457–527）套副標膠囊（VIP／直營／一般三變體）、LOGO 陰影、以及 `assetPlacementPresets` 精準定位。
與 25節 的差別：25 節把「解析」「比對」「排版」「初始定位」拆成 4 支 shared 模組＋5 個媒體 family，並用 `rules.omWaveProfile=wave1/wave2` 切換 priceRules 注入與單品掉圖行為；18 節只有一個 family，Appier 另由 `appier-wave2_rules.js`（priority 200）以自己的 `sheetParser` 接管，靠 `TemplateRuleRegistry.getSheetParsers()` 依 priority 先問 Appier、再問 om_wave1_subtitle。

### A.6 建議 profile
```
id: OM18_w1   label: 18節 外廣OM Wave1 V3.8   family: ancestor
sheetHints: ["外廣_Wave1", "Wave1"]
rulesNamespace: rules/18_OM/   templatesDir: templates/18_OM_w1/   assetsDir: assets/18_OM_w1/
flags（在 defaults＋ancestor 之上，先整組沿用 KV.profile 的 21 個旗標，再改以下）:
  batch.assetSpecEngineFirst=false   templates.prepareHook=none
  export.batchZipName=batchTs   export.scaleMode=fixed4x   export.whiteFill=none   export.compressMode=none   export.multiSizeForceJpg=false
  ui.assetReviewMode=off   interaction.syncMode=smartOnly   interaction.dblclickReplace=none   interaction.replaceAssetImpl=none
  rules.omWaveProfile=none   ui.toolName=18節生成工具
  ★新增 render.rangeTypography=colorOnly   ★新增 render.emptyImagePlaceholder=always   ★新增 batch.sheetRowsReader=sheetToJson
coreScripts: core/product-engine.js, renderers/shape-renderer.js, core/app.core.js,
             smart-assets/product-shadow.engine.js, smart-assets/smart-asset-manager.kv.js
（不載 modules/asset-review-modal.b.js、single-size-asset-sync.js、multi-size-asset-sync.js）
```

### A.7 需要使用者拍板
1. **`export.transparentToPng`**：25 節決定全開，但 18 黃金樣本是在沒有此功能的原工具產出的。OM_w1 有 4 張 png（DPA Frame、pixnet 260x480）、61 張 jpg；若任何 jpg 成品含透明像素，整合版會改存 png → 檔名／格式不同。建議 18 節三個 profile 先設 `false` 跑黃金比對，通過後再由你決定要不要開。
2. **OM_w1／OM_w2 規則是否共用一個命名空間**：w2 的 `om-wave1-subtitle_rules.js` 與 `template-rule-utils.js` 都是 w1 的嚴格超集，可共用 `rules/18_OM/`（載入 w2 版三支）；或照 25 節做法各自一份。建議共用（少一份重複），但要你確認。
3. `batch.sheetRowsReader`：黃金工單下兩種讀法結果相同；是否仍要為忠實度新增這個旗標（成本：core 多一條 17 行分支），或直接接受 KV readCell 版。

---

## B. OM_w2（`外廣OM/18節Tool_外廣OM Wave 2_V0.5`）

### B.1 架構摘要
core 5614 行，模組清單與 OM_w1 完全相同。**與 OM_w1 core 的 35 行差異只有兩處**：
1. 第 1–3 行檔頭註解（V4.21.0 → V4.25.0）。
2. `BatchManager.resolveRecordTemplateRoute`（w1 4065–4097 ／ w2 4065–4096）：w1 **先**看 `record.__templateId` 直接回 `om_wave1_subtitle` 相容路由、才問規則的 `resolveRecordTemplateRoute`；w2 反過來**先問規則**、規則沒回才用 `__templateId` 相容路由（多 3 行註解說明原因：否則 Appier 會被誤標成 `om_wave1_subtitle` family，後續 hook 套錯家族）。
   - 對 w1 工單無差：`om_wave1_subtitle` 規則自己的 `resolveRecordTemplateRoute` 回傳的物件與 core 相容路由逐欄相同。
   - 對 w2 工單是**必要**：Appier 列由 `appier_wave2` family 接管。
   - 25節 整合版 B 系已經是 w2 的順序（`resolveRecordTemplateRoute` 12352–12395，另有 `batch.explicitTemplateIdRoute` 旗標），**不需新增旗標**，w1 用整合版順序結果相同。

### B.2 會影響輸出的行為差異
A.2 的每一項都適用，另加：

| 差異點 | 18節 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| Appier 公版 `textStyleRanges` 帶不同字級 | 17 份 `Appier_*.json` 的 `subtitle`／`副標題_右` 圖層有 3 段 range，其中第 2 段 `fontSizePx` 與圖層差 0.01px（如 43.79 vs 43.8、105.25 vs 105.3、31.37 vs 31.4…）、`lineHeight` 亦異；18 只讀 color → 整行用圖層字級 | `render.textEngine=legacy` 會判定 `hasRangeTypography=true`，逐段換 `canvas.font`（43.79px），逐字 `measureText` 累加 | **pixel**（17 張 Appier 輸出的副標題第 4 個字起位置與抗鋸齒都會不同；4x 超取樣下 175.16 vs 175.2px） | `render.rangeTypography=colorOnly`（同 A.2） |
| `appier-wave2_rules.js` 用到 `U.resizeCapsuleLayer(bg,{width,centerX,cornerRadius})` | 膠囊可自訂圓角 | 整合版 utils 無此函式 | 規則直接報錯 → 整批不產圖 | 補進 utils（A.4） |

### B.3 只是超集或 UI 的差異
同 A.3。另：25節 整合版 `OM_w2` profile 上的 `batch.rowsFromZero=true / render.applyBoxCoverSyncHeight / shapeFillEnabledMode=flag / export.dedupeOutputName / price.fitBoxToInk / text.priceRecalcOnCommit / interaction.dropUpload=uploadSlot / ui.thumbShowUploadPrompt` 是 25 節 wave2 才有的行為，18 節 w2 core 與 w1 相同，**一律不開**。特別是 `export.dedupeOutputName`：18 w2 黃金輸出檔名為 `Appier__1200x627.jpg`（雙底線，`檔案命名` 欄為空時 `outputPrefix_` 拼出），同批無重名，不需要。

### B.4 需要新增進 core 的模組／函式
同 A.4（無額外）。

### B.5 檔案差異
| 檔案 | 對 18 OM_w1 | 對 25節 OM_w2 原版 | 結論 |
|---|---|---|---|
| `rules/appier-wave2_rules.js`（493 行，family `appier_wave2`，priority 200） | w1 沒有 | 25 為 `appier_rules.js`（family `om_wave1_appier`）＋shared 模組，邏輯不同 | **有行為差異**，放 `rules/18_OM/` |
| `rules/om-wave1-subtitle_rules.js` | 超集（+59 行 family capsule hook） | 見 A.5 | 用 w2 版 |
| `rules/shared/template-rule-utils.js` | 超集（+`cornerRadius`） | — | 用 w2 版補進共用檔 |
| `templates/Appier_*.json`（17 份） | 不同集合 | 同名 17 份**內容都不同** | `templates/18_OM_w2/` |
| `assets/Appier/*_KV_BG.png`（17 檔）＋共用 LOGO／券圖 | 部分重疊 | — | `assets/18_OM_w2/` |
| core／shape-renderer／product-engine／smart-assets／index.html／style.css | 相同（core 差 35 行，見 B.1） | — | 同 A |

### B.6 建議 profile
```
id: OM18_w2   label: 18節 外廣OM Wave2 V0.5   family: ancestor
sheetHints: ["外廣_Wave2(急件)", "外廣_Wave2", "Wave2"]
rulesNamespace: rules/18_OM/（與 w1 共用，載 om-wave1-subtitle_rules.js＋appier-wave2_rules.js）
templatesDir: templates/18_OM_w2/   assetsDir: assets/18_OM_w2/
flags: 與 OM18_w1 完全相同（不套 25節 OM_w2 profile 的任何 wave2 旗標）
coreScripts: 同 OM18_w1
```

### B.7 需要使用者拍板
1. 同 A.7-1、A.7-2。
2. 若 w1／w2 共用命名空間，w1 頁面也會載入 `appier-wave2_rules.js`；因為 w1 工單沒有 Appier 列、Appier 的 `sheetParser` 對 w1 分頁回 null，行為不變，但 `capture-meta.json` 的 `loadedRuleFiles` 會多一筆。黃金比對若含這個欄位需忽略。

---

## C. network（`Affiliate/18節Tool_network_V0.5`）

### C.1 架構摘要
core 6392 行、33 個頂層模組＝OM 18 的 32 個＋**`NetworkSmartObjectSync`（911–1189，279 行）**；頂層另有 `decodeHashUnicode/normalizeAssetStemExact/normalizeLayerIdentifier`（同 KV）。

| 相比 | 少了 | 多了 |
|---|---|---|
| 25節 KV V0.2（最近親戚，485 行） | `AssetSyncHub`、`scheduleBlobRevoke/showToast`、window 匿名 helper 暴露 | `NetworkSmartObjectSync`；TemplateLoader 用 `updateNetworkAssetWarning/resolveNetworkAssetSpec`（＝KV `updateSpecAssetWarning/resolveAssetSpec` 改名）；Interaction 用 `replaceNetworkImage`（＝KV `replaceSpecDrivenImage` 改名） |
| 25節 network V0.7 | `TextBaselineModel`、`SnapshotManager`、`ManualAssetUpload`、`AssetSyncHub`、`MultiSizeAssetSync` 模組 | `NetworkSmartObjectSync` |
| 25節 整合版 | 上述 | `NetworkSmartObjectSync`（整合版對應物是 `modules/multi-size-asset-sync.network.js`，演算法不同：18 是「差異同步」，見 `NETWORK_修改說明.txt`） |

與 KV 25 有差異的方法：`TemplateLoader.loadImagesForTemplate/loadTemplateFolder`（只差鍵名）、`SpecOverlayManager.getAllowedSpecFilenames/loadImage`、`Renderer.drawStyledTextLine/findLayerByCanonicalName/applyImageMask`（少 `source-baseline` 分支、鍵名）、`Inspector.applyBoxFromInputs`、`ExportManager.exportVisibleBatch/buildZip`、`BatchManager.generateFromSelectedSheet/refreshTemplateFromBatchRecord/makeThumbURLFor`（鍵名）、`Interaction.*`。`sheetToRowsWithMergedFill`、`drawText/getTextStyleSegments/fontForTextStyle`、`resolveRecordTemplateRoute`、Price*、`applyRecordToTemplate` 與 KV **逐字相同**。

**核心發現：network 18 與 KV 25／整合版的差異幾乎全是「同一套素材規格流程，但鍵名不同」**（KV 是把 network 18 這套泛化後的結果）：

| network 18 | KV 25／整合版 | 出現位置（net core 行號） |
|---|---|---|
| `window.NetworkAffiliateEngine` | `window.AssetSpecEngine` | 449、789、4100–4102、2867–2868 |
| `layer.__networkAssetSpec` | `layer.__assetSpec` | 443、538、6077–6105 |
| `layer.__networkManualAsset` | `layer.__manualAsset` | 444、6117 |
| `layer.__networkCanonicalName` | `layer.__canonicalName` | 447、2207 |
| `layer.__networkMaskLayerName` | `layer.__maskLayerName` | 2211 |
| `template.__networkMeta` | `template.__meta` | 446、627 |
| `batchRecord.__network` | `batchRecord.__multiSizeSync` | 924、1254、2760、2780、2790、5723、5893 |
| `batchDiagnostics.network` | `batchDiagnostics.specDriven` | 432、2682、2867 |
| `ruleFamily==='network-affiliate'` | `ruleFamily==='spec-driven'` | 1254（規範圖疊層，UI） |
| 資料夾根 **寫死 `'Network_4.5-4.18'`** | `batchRecord.__outputRoot`（25 規則由分頁名產生） | 2838、2869 |
| zip `18節Tool_network_輸出.zip` | `25節Tool_network_輸出.zip`（整合版寫死） | 2682 |

18 的規則檔 `network-affiliate_rules.js` 只寫 `__network*` 鍵、只掛 `NetworkAffiliateEngine`（644 行；25 版 803 行已改用新鍵名並新增安全區／動態 LOGO 圖層／BigGo 公版／共用素材資料夾）。

### C.2 會影響輸出的行為差異

| 差異點 | 18節 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| 素材規格引擎鍵名（上表） | 規則寫 `__network*`／`NetworkAffiliateEngine`／`diagnostics.network` | core 只認 `__assetSpec`／`AssetSpecEngine`／`specDriven`／`__multiSizeSync` | **pixel＋folder＋format＋json**：不接上就完全不會走規格表流程（151 張全變一般解析、找不到動態 LOGO、不套 jpg／2x／白底／150KB 壓縮、`refreshTemplateFromBatchRecord` 會誤把規則產生的公版重套） | 新增旗標 `batch.specEngineAdapter = network18`：core 讀取時一律 `layer.__assetSpec ?? layer.__networkAssetSpec`（其餘鍵同理）、`window.AssetSpecEngine ?? window.NetworkAffiliateEngine`、`diagnostics.specDriven ?? diagnostics.network`、`record.__multiSizeSync ?? record.__network`；寫入時（`replaceSpecDrivenImage` 設 `__manualAsset`）兩個鍵都寫。規則檔維持 18 原文不改 |
| zip 內資料夾根（`buildZip` 2836–2838、診斷報告 2867–2869） | 固定 `Network_4.5-4.18/<__outputFolder>/<檔名>`、`Network_4.5-4.18/診斷報告.txt` | `rootFolder`／`specBanner`：`<__outputRoot>/<__outputFolder>/…`；18 規則**不寫** `__outputRoot` → 會變成 `<__outputFolder>/…` 少一層 | **folder**（151 張＋診斷報告） | 新增字串旗標 `export.specRootFolder = "Network_4.5-4.18"`（非空時優先於 `__outputRoot`；預設空） |
| 規格表項目輸出參數 | `__network` 項目：2x 超取樣上限、白底、強制 jpg、≥150000B 二分 12 次壓縮、`refreshTemplateFromBatchRecord` 直接 return true、縮圖白底 | 同 KV，鍵為 `__multiSizeSync` | 接上別名後**無差** | `export.scaleMode=multiSize2x`、`whiteFill=multiSize`、`compressMode=multiSize150k`、`multiSizeForceJpg=true`（＝KV 值） |
| 讀工單列 | readCell 版（與 KV 逐字相同） | 同 | 無差 | `batch.sheetRowsReader=readCell`（預設） |
| 文字引擎 | KV 版（有 range 字級、`usp_` 置中），**無** `source-baseline` 分支 | legacy 含 `source-baseline` | 無差（18 公版／規則沒有 `styledTextVerticalAlign`）；network 公版 21 份的 range 都無字級差 | `render.textEngine=legacy`、`render.rangeTypography=full` |
| 批次 zip 檔名 | `18節Tool_network_輸出.zip` | 寫死 `25節Tool_network_輸出.zip` | filename（zip 外層） | 新增字串旗標 `export.specZipName`（預設 `25節Tool_network_輸出.zip`）或接受差異 |
| 診斷報告 | `NetworkAffiliateEngine.diagnosticText`，抬頭與 25 版不同 | `export.diagnostics=assetSpec` 呼叫 `AssetSpecEngine.diagnosticText` | 接上別名後由 18 規則產生 → 無差（黃金比對本來就排除此檔） | 沿用 |
| `export.transparentToPng` | 無此功能 | 預設 true | 151 張都先填白底再存 jpg，不會有透明像素 → 實際無差 | 同 A.7-1，建議先 false |

### C.3 只是超集或 UI 的差異
- `NetworkSmartObjectSync`：只在拖曳／縮放／旋轉／還原／Ctrl+Z 時同步 `P／P_02／LOGO_01～05`，批次產圖與匯出不經過它（core 呼叫點：Inspector 2432–2435、Interaction 5985/6002/6052–6063/6164/6174–6176；smart-asset-manager 6 處）。
- `AssetSyncHub` 呼叫點在 18 是直呼 `window.NetworkSmartObjectSync?.begin/update/finish`，簽名相同 → 新模組用 `AssetSyncHub.register('network18', NetworkSmartObjectSync)` 即可接回。
- `replaceNetworkImage`（6081–6133）＝`replaceSpecDrivenImage` 改名，互動用。
- `SpecOverlayManager` 規範圖疊層跳過條件（UI）。
- `shape-renderer.js`／`product-engine.js`／`smart-asset-manager.js`／`product-shadow.engine.js`：與 KV 25 及整合版 `.kv.js` **逐字相同**（shape-renderer 與 25 network 原版只差 1 行）。
- `rules/shared/template-rule-utils.js`（143 行）：是整合版共用檔的子集（9 支函式全同）。

### C.4 需要新增進 core 的模組／函式
| 內容 | 來源 | 說明 |
|---|---|---|
| `modules/network-smart-object-sync.18.js`（新選用模組） | `Affiliate/18節Tool_network_V0.5/core/app.core.js` 911–1189 | 差異同步引擎；需 `window.NetworkSmartObjectSync` 全域（整合版 `smart-asset-manager.kv.js` 已直呼它，14 處）並向 `AssetSyncHub` 註冊。依賴 `decodeHashUnicode/normalizeAssetStemExact/normalizeLayerIdentifier/Geometry/ProductEngine/HistoryManager`，整合版都已暴露在 window。互動用，不影響黃金 |
| `batch.specEngineAdapter` 別名讀取 | 對照 C.1 表 | 建議做成 core 內 3 支小 helper：`specEngine()`、`specOf(layer)`、`isSpecRecord(record)`、`isSpecDriven(diagnostics)`，所有 `__assetSpec/__multiSizeSync/specDriven/AssetSpecEngine` 讀取點改經 helper（純加法，預設行為不變） |
| `export.specRootFolder`、`export.specZipName` | `buildZip` 2836–2838、2867–2869；`exportVisibleBatch` 2682 | 兩個字串旗標 |

### C.5 檔案差異
| 檔案 | 對 25節 network V0.7 原版 | 對 25節 整合版 `rules/network/` | 結論 |
|---|---|---|---|
| `rules/network-affiliate_rules.js`（644 行） | 25 版 803 行：改新鍵名、`build()` 多 `sheetName→__outputRoot`、`__multiSizeSync/__outputName/__outputFormat`、動態 LOGO 改成規則**新建**圖層＋安全區（18 是綁定 JSON 既有 `P` 圖層 `setAssetSpec/bindAssetLayerToGuide` 189–240）、BigGo 公版 `affiliate_biggo_*`、共用素材資料夾、IA 四角導角、`kvFolder` 品牌／無品牌分資料夾、註冊 `network-affiliate` family、`MultiSizeAssetSync/ManualAssetUpload.configure` | 同左 | **有行為差異**（像素、檔名、圖層結構），放 `rules/18_network/`，維持 18 原文＋core 別名 |
| `rules/Example_Template_rules.js` | 相同 | 相同 | 18 index.html 未載入，不放 |
| `rules/template-rules.loader.js` | 25 為 manifest 動態版 | — | 同 KV 三旗標 |
| `rules/shared/template-rule-utils.js` | 子集 | 子集 | 沿用整合版 |
| `templates/*.json`（21 份） | 同名 21 份**內容都不同**；25 多 3 份 `affiliate_biggo_*` | — | `templates/18_network/` |
| `assets/`（LOGO 15 檔、affiliate 21 檔 KV_BG、USP／LOGO svg） | 25 拆 `affiliate/affiliate_無品牌/共用素材` 三夾 | — | `assets/18_network/`，維持 18 的單一 `affiliate/` 夾（規則 `preferredFolder:'affiliate'`） |
| `core/product-engine.js`、`renderers/shape-renderer.js`、`smart-assets/*` | product-engine 相同；shape-renderer 差 1 行；smart-asset-manager 差 1143 行（25 為 b 版） | 與 `.kv.js` 相同 | 沿用整合版（`smartAsset.engine=kv`） |
| `modules/` | 25 有 `multi-size-asset-sync.js` | 整合版 `multi-size-asset-sync.network.js` | **不載入**（會與 NetworkSmartObjectSync 對同一批 `__multiSizeSync` 項目重複同步） |
| `NETWORK_修改說明.txt` | — | — | 說明 V0.5 的 4 項變更全在 `NetworkSmartObjectSync`（差異同步、P_02 基準、資格判定、群組還原／復原），驗證 151 張；皆為互動行為 |

### C.6 建議 profile
```
id: network18   label: 18節 Affiliate network V0.5   family: ancestor（不是 25節 的 b；18 network 是 KV 血緣）
sheetHints: ["Network_4.5-4.18", "Network_"]
rulesNamespace: rules/18_network/   templatesDir: templates/18_network/   assetsDir: assets/18_network/
rulesAfterCore: false（18 規則不依賴 core 全域，照 18 index 順序在 core 前載入即可）
flags（先整組沿用 KV.profile 的 21 個旗標，再改以下）:
  batch.assetSpecEngineFirst=true   templates.prepareHook=assetSpecEngine
  export.scaleMode=multiSize2x   export.whiteFill=multiSize   export.compressMode=multiSize150k   export.multiSizeForceJpg=true
  export.batchZipName=specDrivenOrBatchTs   export.folderStrategy=specBanner   export.diagnostics=assetSpec
  ui.assetReviewMode=off   interaction.syncMode=both   interaction.dblclickReplace=assetSpec   interaction.replaceAssetImpl=legacy
  render.rangeTypography=full   render.emptyImagePlaceholder=uiOnly   batch.sheetRowsReader=readCell
  ui.toolName=18節生成工具
  ★新增 batch.specEngineAdapter=network18   ★新增 export.specRootFolder="Network_4.5-4.18"   ★新增 export.specZipName="18節Tool_network_輸出.zip"
coreScripts: core/product-engine.js, renderers/shape-renderer.js, core/app.core.js,
             smart-assets/product-shadow.engine.js, smart-assets/smart-asset-manager.kv.js,
             modules/network-smart-object-sync.18.js
（不載 modules/multi-size-asset-sync*.js、asset-review-modal、single-size-asset-sync）
```

### C.7 需要使用者拍板
1. **別名要放哪裡**：(a) core 加 `batch.specEngineAdapter` 旗標，規則檔一字不改（符合「core 加法合併、原工具檔案原樣」原則，但 core 的 ~25 個讀取點要改經 helper）；(b) 在 `rules/18_network/` 多放一支 `network18-compat.js` 包住 `NetworkAffiliateEngine.build/prepareTemplate`，事後補 `__assetSpec/__multiSizeSync/__outputRoot/specDriven` 等新鍵（core 不改，但等於在 18 規則外再包一層，且 `session.json` 的 `diagnostics` 會多出 `specDriven` 鍵）。建議 (a)。
2. **資料夾根**：18 寫死 `Network_4.5-4.18`；25 由分頁名產生。這次黃金分頁剛好也叫 `Network_4.5-4.18`，兩種做法結果相同。要忠實（字串旗標）還是接受「換分頁名就跟著變」的 25 行為？
3. **zip 檔名** `18節Tool_network_輸出.zip` vs 整合版寫死的 `25節Tool_network_輸出.zip`：要不要為此加旗標（黃金比對看的是 zip 內容，不是 zip 檔名）。
4. `session.json` 的 `diagnostics` 物件：18 是 `{network:true,…}`，接別名後 core 會照原樣保留；若 JSON 比對逐鍵，需確認不會多出 `specDriven`。
5. 同 A.7-1（`export.transparentToPng`）。
