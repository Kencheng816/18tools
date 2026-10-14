# 04-b — 18節 AMS／ENG／KV（KOL代播圖）core 差異報告（2026-09-16）

比對對象與路徑（bash 沙箱）：
- 18節 AMS：`Affiliate/18節Tool_Line 購物AMS_V0.5`（core 5344 行）
- 18節 ENG：`ENG/18節_ENG_Tool_V0.9`（core 5045 行）
- 18節 KV（KOL代播圖）：`KOL代播圖/18節Tool_KOL代播圖_第一單_V0.9`（core 5758 行）；`第二單` 與 `KV/` 兩份資料夾的 core／rules／templates／index.html／style.css **全部逐位元相同**，只有 `assets/KOL代播/` 內的直播主照片與 LOGO 不同（第一單 18 個、第二單 17 個檔）。
- 25節 對照：`Affiliate/25節Tool_Line 購物AMS_V0.6`（6962 行）、`KV/25節_KV_V0.2`（6203 行）、`外廣OM/25節Tool_外廣OM_wave1_V0.5`（6721 行）、25節 整合版 `core/app.core.js`（14780 行）＋ `config/profiles/*`。
- 方法：頂層 `const Xxx = {` 切模組、再切方法，去空白後 md5 指紋比對，只對指紋不同的方法做語意 diff。

## 0. 三個工具的共同基底（先看這段，後面三節只寫各自的差異）

**最重要的發現：這三份 core 都是同一份「18節Tool V4.20.3 重構版」舊 core**，比 25節 所有 11 份 core（V5.0.0「通用開源版，以 V4.25.0 為底」）都還舊一代。去空白 diff 行數：18ENG↔18AMS 384、18KV↔18ENG 754、18AMS↔18KV 1116；對 25節 最近的都是 25KV（18ENG 1439、18AMS 1785、18KV 2011），對 25AMS／25OM_w1 反而更遠（2571／1968）。所以：

- 25節 整合版 KV profile（family＝ancestor）的旗標值是最好的起點，但仍有一批 **V4→V5 之間的行為變化** 沒有任何現有旗標涵蓋（見 0.2）。
- 建議在 `_defaults.js` 新增一個 family（暫名 **`v4`**），放三工具共用的值；其他 18節 工具若同屬 V4.20.3 血緣（brief 表中 network／OM／鏡面／跨夜 最近親戚也都是 25KV），可一起沿用。

### 0.1 三份 core 共同「沒有」的 25節 模組（用現有旗標關掉即可）
`TextBaselineModel`、`SnapshotManager`、`AssetSyncHub`（KV 用自家 PortraitSyncEngine 取代）、`ManualAssetUpload`、`LayerDefaults`、`AssetSpecEngine` 前置、`showToast`（KV 有 `showPortraitToast`）、`normalizeLayerIdentifier`、`imageLoadCache`、`decodeHashUnicode`（各處自帶 inline 版）、smart-assets（**三個 index.html 都沒載入** `smart-assets/`；KV 資料夾裡雖有 1349 行的 `smart-asset-manager.js`＝25KV 同檔，但沒有 `<script>`）。

### 0.2 三工具共同、且 25節 整合版目前旗標「蓋不到」的輸出差異（都要新增旗標或新值）

| # | 差異點 | 18節（V4.20.3）行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|---|
| C1 | 讀 Excel 分頁 `sheetToRowsWithMergedFill` | `XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',blankrows:true})` 一次讀完（原始值 v；公式格取快取值；列索引從範圍起點算 0；合併儲存格用絕對座標補值，range 不從 A1 起時會補到錯的列——這是原工具現況，要照抄） | 逐格 `readCell`：公式格先取顯示字串 w、再解單格參照；文字格優先 w；`batch.rowsFromZero` 控制起點 | pixel／json（`__sourceRow`、skippedRows 列號、百分比／日期顯示值） | 新增 `batch.sheetReader`＝`sheetToJson`（v4）／`cellWalk`（現行） |
| C2 | 錨點列判定 `isAnchor` | `norm(cell).includes('製作內容') \|\| ===版位 \|\| includes('版位')` | `===製作內容 \|\| startsWith('製作內容') \|\| ===版位` | pixel（哪一列算表頭） | 新增 `batch.anchorMatch`＝`includes`（v4）／`exactOrPrefix` |
| C3 | core 內建文字對映 `textMap` | 有 `副標`（副標/副標題/subtitle），**沒有 `文案`** | 固定有 `{field:'文案', words:['文案','dpa文案']}`，`副標` 由 `batch.coreSubtitleTextMap` 控制 | pixel（AMS 的 `回饋文案` 圖層名含「文案」，會先被整格 `文案` 覆寫，規則 hook 找不到符合行時就留下錯字） | `batch.coreSubtitleTextMap=true`＋新增 `batch.coreCopyTextMap`＝false（v4） |
| C4 | 樣式分段文字 `getTextStyleSegments／measureTextSegments／drawStyledTextLine` | `textStyleRanges` **只取顏色**；所有分段用 `layer` 的字級／字重／字距量測與繪製；`textBaseline` 沿用 drawText 的 `top` | `render.textEngine=legacy`（＝25KV）會讀 range 的 `fontSizePx/fontFamily/fontWeight/letterSpacing/baselineOffset`，分段各自 `fontForTextStyle`；`hasRangeTypography` 判斷 | **pixel**（AMS 規則把 `LINE POINTS` 圖層 `fontSizePx` 改成 21，但 PSD range 仍是 28，25 版會用 28 畫；ENG／KV 公版 range 齊全，只要文字被規則改字級就會出現） | `render.textEngine` 新增值 **`legacy18`**（顏色分段版，來源 18ENG 1437–1508 行） |
| C5 | `drawImage` 佔位框 | image 圖層 `assetFilename` 為空且未 hidden 時，**匯出也畫**白色虛線框＋圖層名 | 只在 `options.showMissing`（UI）才畫 | pixel（商品圖找不到素材時；黃金樣本目前沒有這種列，但屬行為差） | 新增 `render.exportMissingPlaceholder`＝true（v4） |
| C6 | `TemplateLoader.loadImagesForTemplate` 對 hidden 圖層 | `layer.type!=='image' \|\| !layer.assetFilename` 才跳過 → **hidden 圖層也載圖** | `layer.hidden` 直接跳過 | pixel／json（KV 的 `__半身照參考輪廓` 是 hidden:true 卻要載圖算 IoU；25 版永遠算不到 → 不跳審核、`__hostPhotoFitIoU` 不寫） | 新增 `assets.loadHiddenLayerImages`＝true（v4） |
| C7 | `findLocalAssetFile` 模糊比對守門 | 沒有 `allowFuzzyMatch` 檢查：背景／商品／票券也會進 includes 模糊搜尋 | `ASSET_POLICY` 帶 `allowFuzzyMatch:false` → 精準沒中就回 null | asset（找不找得到素材） | 新增 `assets.fuzzyRoleGuard`＝false（v4） |
| C8 | `loadAssetFolder` 建索引 | bucket 只放 `file.name` 一個 key、不解 `#Uxxxx` | 多放 `relPath` key、並 `decodeUnicodeName` → `pathMatchesTemplate` 才有路徑可比、`preferredHit` 才會命中 | asset（同名檔在不同公版子資料夾時選到的檔不同） | 新增 `assets.bucketRelPathKeys`＝false（v4） |
| C9 | 商品圖框來源 `applyImage` | `templateRule.productImageBox \|\| getProductImageBoxFromLayer(layer)` | 先 `getProductPlacementGuideBox(template)`（找名為 `P_範圍` 的圖層，用它當商品框，**無旗標**） | **pixel**（AMS 的 `P_範圍` 就是實際商品圖層，會被自己的 rendered box 蓋掉規則給的 `productImageBox`） | 新增 `batch.productPlacementGuide`＝false（v4） |
| C10 | `layer.role='product'`、`smartAssetId` 回寫 | 不寫 | 命中商品圖一律寫 `role`、`smartAssetId`（engine none 時為 ''） | json（session.json 多兩鍵） | 比對忽略或新增 `batch.tagProductRole`＝false；建議忽略（同決策 7） |
| C11 | `PriceCouponManager.apply` 重建記憶 | 砍掉重建、不回填舊層 | `price.rebuildMemoryMode` 只有 productLayout／text／textRanges，都會回填 | pixel（僅互動後） | `price.rebuildMemoryMode` 新增值 `none`（v4） |
| C12 | `CapsuleRuleEngine.defaultRules` | `horizontalPaddingPx/subtitleWiderPaddingPx/titleWiderPaddingPx`＝25 | 55 | pixel（只有 `generatedLayers.subtitle_frame.hidden===false` 的公版才畫；ENG 7 個公版有 subtitle_frame 但都沒開 → 黃金樣本不受影響） | 新增 `render.capsulePaddingPx`＝25（v4） |
| C13 | 匯出 zip 內檔名／格式 | 主幹 `templateId \|\| item.name`（**不去 .png/.jpg 尾碼**）；資料夾 `item.project/`；無診斷報告；4x 固定；不填白（AMS jpg 例外，見 §1） | 主幹會 `.replace(/\.(png\|jpe?g)$/i,'')`；`export.transparentToPng` 預設 **true**（依規則輸出時有透明像素改存 PNG） | filename／format | `export.folderStrategy=project`、`export.scaleMode=fixed4x`、`export.whiteFill=none`、`export.compressMode=none`、`export.diagnostics=none`、`export.stemSource=templateId`、`export.zipPrefix=18SaleTool`、`export.batchZipName=batchTs`、`export.jsonMode=raw`；**`export.transparentToPng` 三工具建議 false**（需拍板，見 §7） |
| C14 | `normalizeRecordText`／drawText 換行字元 | 只把 `_x000d_`、`\r\n`、`\r` 當換行 | 多把 `    ` 當換行（回饋修正，所有工具都開） | pixel（黃金樣本 session.json 掃過沒有這三個字元 → 目前無影響） | 記錄即可；若要 100% 同源可加 `text.extraLineBreakChars=false` |
| C15 | `refreshTemplateFromBatchRecord` | `applyRecordToTemplate(template, record)` 每次重套商品框 | 帶 `skipExactLayout/preserveProductGeometry` 保留手動幾何 | pixel（僅互動後；批次流程結果相同） | 可選 `batch.refreshPreserveGeometry`＝false（v4），優先度低 |

### 0.3 三工具共同、可直接沿用現有旗標值的部分（＝25節 KV／ancestor 值為主）
`batch.assetSpecEngineFirst=false`、`batch.matrixParser=true`、`batch.genericRowParser=true`、`batch.specialParserPolicy=false`、`batch.mergeFillMode=vertical`、`batch.explicitTemplateIdRoute=none`（18節 `resolveRecordTemplateRoute` 沒有 `__templateId` 相容路由）、`batch.templateMatchMode=fuzzy`（AMS 例外見 §1）、`batch.fetchRouteTemplate=true`、`batch.ctaMode=legacy`、`batch.smartAssetIdMode=none`、`batch.smartAssetApplyPhase=none`、`batch.missingProductAssetMode=clear`、`batch.placementPreset=false`、`batch.applyNonPriceTextStandard=false`、`batch.previewMode=mutating`（KV 值；18節 `renderPreviewGrid` 沒有世代守衛）、`batch.recordContentMode=fields`；
`render.appliesLayout=true`、`render.autoLogoShadow=false`、`render.shapeLegacyTriangleOverride=true`（三份 core 的 `drawShape`＋`GLOBAL_VECTOR_RULES` 與 25KV 逐字相同）、`render.useProductEngineSizing=true`、`render.applyBoxSyncCenterForAllTypes=false`、`render.applyBoxCoverSyncHeight=false`、`render.applyBoxDdcardHeightRule=true`、`render.loadShapeRenderer=true`、`render.shapeFillEnabledMode=ignore`、`render.shapeRotationSource=transform`、`render.shapeBoxSource=bboxFirst`、`render.shapeStrokeInset=false`、`render.productSizingHeightPriority=legacy`（`core/product-engine.js` 三份＝25KV 同檔）；
`assets.lookupEngine=flatFuzzy`、`assets.lookupProjectMode=explicit`、`assets.roleClassify=true`、`assets.shopeeVipGuard=true`、`assets.crossProjectFallback=true`、`assets.urlCommonFolder=always`、`assets.urlExtensionExpand=false`、`assets.templatePrefixVariants=false`、`assets.missingDiagnostics=none`、`assets.waitFontsBeforeLoad=false`、`assets.captureRenderModel=false`、`assets.afterUploadRefresh=reapplyRecordsRegrid`；
`templates.variant=none`、`templates.identityConflict=keepAll`、`templates.snapshotRestore=false`、`templates.prepareHook=none`、`templates.textBaselinePrepare=false`、`templates.layerDefaults=false`；
`price.*`＝KV 值（typographyResolver／doubleCouponAuto／inheritAnchorRotation／specialCharRanges82／fitBoxToInk／syncSeparatePositionScale／anchorBaseLineHeight／normalizeDecimalPercent／rotationHook 全 false，`layerBaselineMode=none`；`PriceRuleEngine／PriceLayerFactory／PriceTransformEngine／PriceParser／PriceColorResolver` 三份都與 25KV 逐字相同）；
`smartAsset.engine=none`、`text.afterEditHook=none`、`text.priceRecalcOnCommit=none`、`text.editSnapshot=false`、`ui.rotateHandleAnchor=topRight`、`ui.toolName=18節生成工具`、`rules.registryMode=merge`、`rules.normalizeLegacy=true`（三份 `template-rules.loader.js` 的 normalize＝25KV 版，不去編號、不 NFKC）、`rules.loadFailurePolicy=continue`、`boot.abortOnRuleLoadFailure=false`、`export.formatSource=specTable`、`export.defaultFormat=jpg`、`export.multiSizeForceJpg=false`、`export.renderPath=activeSwitch`、`export.jsonMode=raw`。

逐字相同（忽略空白）的模組：`$ qs qsa clone round normStr getRuleSection escapeHtml EMBEDDED_ASSETS GLOBAL_VECTOR_RULES DOM ctx activeLayer* PreviewZoom TemplateFilter TemplateList LayoutRuleEngine PriceRuleEngine PriceColorResolver PriceLayoutResolver PriceParser PriceLayerFactory PriceTransformEngine rulesReady`；`Geometry` 三份只差「多一個 images 參數」的重構（`applyBox` 邏輯同 25KV）。

---

## 1. AMS（Line購物AMS V0.5）

### 1.1 架構摘要
模組清單（頂層 `const`，行數）：`SVG 9、AppState 31、ASSET_POLICY 9、classifyAssetRole 20、getAssetPolicy 6、AssetStore 64、HistoryManager 25、TemplateLoader 414、Geometry 104、SpecOverlayManager 190、CapsuleRuleEngine 166、LayoutRuleEngine 135、Renderer 526、LayerManager 47、Inspector 68、TextEditor 113、PreviewZoom 45、ExportManager 284、TemplateFilter 141、TemplateList 22、LoadingOverlay 100、PriceRuleEngine 224、PriceColorResolver 49、PriceLayoutResolver 26、PriceParser 22、PriceLayerFactory 75、PriceTransformEngine 129、PriceCouponManager 155、BatchManager 1724、Interaction 136、App 193、rulesReady 12`。
- 對 18ENG（最近親戚，384 行）多：`AssetStore.normalizeFolderName`＋`preferredFolders`、`Renderer.findClipLayer／applyLayerClip／getTintedImageForShadow／drawImageDropShadow`、`BatchManager.normalizeTemplatePlacementName`；`fields` 多 `檔名／店名／LINE_POINTS_PERCENT`。
- 對 25節 AMS V0.6 少：`AssetSyncHub、ManualAssetUpload、LayerDefaults、TextBaselineModel、SnapshotManager、showToast、imageLoadCache`、`modules/multi-size-asset-sync.js`、`smart-assets/`、`rules/shared/line-shopping-ams.js`；規則檔結構完全不同（18 版每支 148–281 行自帶路由與版面邏輯；25 版 51 行＋共用 421 行）。
- 多 25節 沒有的：`plugins/product-shadow.plugin.js`（644 行）＋`.css`（61 行）——**純互動功能**（畫布右鍵選單「產生商品陰影」，patch `TemplateLoader.loadImagesForTemplate` 重載已產生的陰影 dataURL、patch hitTest／linked transform），批次產圖與匯出不會用到；25節 改用 smart-assets（`isProduct/ensureShadow`），18AMS 沒有任何 smart-assets 載入。

### 1.2 會影響輸出的行為差異（§0.2 共同項之外）

| 差異點 | 18節 AMS 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| 工單欄位別名 | `檔名/文案/店名/LINE POINTS %/GD摳圖LINK→商品圖1`（parseRows 3753–3768；readRecordFromRow 4051–4104） | `batch.extraHeaderAliases=ams` 同一套 | — | 沿用 `batch.extraHeaderAliases=ams`、`batch.extraFields=lineShoppingAms` |
| 表頭「標題（10字內）」 | `startsWith('標題')` 也對到 `主標`（3769 行） | 只認 `主標…`／title（25AMS 刻意拿掉） | json（AMS 公版沒有主標文字層，不影響像素；session.json 的 `batchRecord.主標` 會多值） | 新增 `batch.amsTitleHeaderAlias`＝true，或比對時忽略 |
| 逐列模式 `isLineShoppingRowMode` | 同 25 版條件；`blockParser` 呼叫時 `quantity: 0` | 25 版傳實際 `quantity`（沒有數量欄時也是 0） | 無（同值） | — |
| 公版比對 | `normalizeTemplatePlacementName`（去 `.json`、去「01_」前綴、去尾端 `_1029x357`／`1029*264` 尺寸）後 **完全相等**才算命中；`findTemplateRuleForName／findTemplateForName／findTemplateByDirectName／normalizeTemplateIdentity` 全改用它（4199–4273） | `fuzzy`＝includes；`strict`＝A 系另一套 | pixel（低風險：9 支規則都有 `resolveRecordTemplateRoute` 直接路由，只有 parseRows 找 `blockParser` 時走這裡） | `batch.templateMatchMode` 新增值 `placementStrict`；或接受 fuzzy（需驗證 OAPush 六宮格 blockParser 仍命中） |
| 輸出檔名來源 | `generateForCurrentProject`：`variantRecord.__outputName \|\| variantRecord['檔名']` → 去副檔名 → `[\\/:?"<>\|]`→`_`（**保留 `*`**；3445–3523） | `ruleOutputName \|\| route.outputName \|\| variantRecord.__outputName`，`[\/:*?"<>\|]+`→`-`、空白壓成一個；且 18 版規則是在 `beforeApplyRecordToTemplate` 才寫 `__outputName`，在整合版讀取時還不存在 | **filename**（黃金樣本檔名 `0325_APP首頁Top banner_1029*357.png` 含 `*`） | 新增 `batch.outputNameSource`＝`recordFilenameColumn`（讀 `檔名` 欄）＋ `batch.outputNameSanitize`＝`legacyUnderscore` |
| 素材查找：公版同名資料夾優先 | `findLocalAssetFile／findAssetFilename` 把 `canvas.templateId／sheetTemplateRoute.sourceTemplateId／batchSourceTemplateId／source.psdName` 當 `preferredFolders` 先加進扁平表；`AssetStore.getBucket` 用 `normalizeFolderName`（解 `#Uxxxx`、去 .json、去符號、小寫）模糊對資料夾名（128–191、491–590、4599–4690） | 只有 `assetLookup.scope==='strict'`（LineOA／鏡面）才加 `templateFolder`；`getBucket` 精準比對 | asset | 新增 `assets.preferTemplateFolders`＝true、`assets.bucketNameNormalize`＝true（AMS） |
| 素材查找：URL 檔名 | `findAssetFilename` 的 `basename` 會 `new URL()` 解析、`decodeURIComponent`、去 `?#`（GD摳圖LINK 是完整網址，黃金樣本 `P_範圍.assetFilename='tw-…webp'`） | `split(/[\\/]/).pop()`（25AMS 也拿掉了） | asset（帶 query 的網址才會不同） | 新增 `assets.urlBasename`＝true（AMS） |
| 打包 URL 備援順序 | 巢狀 `assets/<專案>/<公版>/` **優先**，再扁平 `assets/<專案>/`，再 `assets/<公版>/`；公版名取 `canvas.templateId \|\| sourceTemplateId \|\| batchSourceTemplateId \|\| templateId \|\| activeIndex.name`（410–490） | 扁平優先、巢狀在後；公版名依 `assets.urlTemplateSubfolderSource` | asset（只影響沒上傳素材夾、走打包 URL 的情況） | `assets.urlTemplateSubfolderSource` 新增值 `canvasIdNestedFirst` |
| 遮罩 | `_drawLayers` 對**每個圖層**（shape/image/text）先 `applyLayerClip`：讀 `effects.maskBy/clipBy/layer.clipBy/maskBy/clipPathLayer`，用 `getRuleShape(clipLayer) \|\| ShapeRenderer.createRuleFromJsonLayer` 取規則、`ShapeRenderer.tracePath(ctx, clipLayer, rule)` 建路徑（用規則的 `cornerRadii`、`geometry.bbox` 靜態框）（1293–1338） | `render.maskScope=all` 已涵蓋「所有型別都套」，但實作是 `ShapeRenderer.clipJsonShape(mask,{useLayerBounds:true})`（layer 即時框＋PSD 四角半徑，不看規則 `shapeLayers` 的 cornerRadii） | **pixel**（`右_上方Bar` 規則角半徑 20/20/0/0 vs PSD 半徑；框來源不同） | `render.maskScope=all`＋新增 `render.maskClipImpl`＝`ruleTracePath`（需 shape-renderer 提供 `tracePath`，見 1.5） |
| 圖片陰影 | `drawImageDropShadow`：讀 `layer.effects.shadow \|\| dropShadow \|\| shadow`，鍵名 `angle/distance/size/opacity/color/blendMode`；先在**原圖自然尺寸**染色（`getTintedImageForShadow` 快取）再縮放＋`filter:blur`；商品圖（role product 或 `P_範圍`）一律不畫陰影；畫原圖前重設 filter/composite/alpha/shadow（1635–1723） | `drawImageShadow(layer.dropShadow \|\| automaticLogoShadow)`：鍵名 `angleDeg/distancePx/blurPx`、`enabled===true` 才畫、在 rendered 尺寸＋pad 染色 | **pixel**（規則檔 `afterApplyRecordToTemplate` 幫 `18號會員日_LOGO_白／蝦皮購物_LOGO_白` 寫 `effects.shadow={enabled,color:#f26602,angle:117,opacity:.51,distance:2,size:6}`，整合版讀不到 `effects.shadow`） | 新增 `render.imageShadowSource`＝`effectsShadowLegacy`（AMS），並把 `getTintedImageForShadow／drawImageDropShadow` 加進 core；`render.autoLogoShadow=false` |
| JPG 匯出 | 先把 RGBA 畫到 `alpha:false` 白底畫布再 `toBlob`（2103–2237）；另有 `willReadFrequently`、`hasVisiblePixels` 全透明時重畫一次（防競態，像素不變） | `export.whiteFill=jpg`（鏡面）：`alpha:false` ctx 填白再畫 | pixel（理論等價：都是 source-over 疊白；黃金樣本用 PNG 匯出，未驗證 JPG） | `export.whiteFill=jpg`；建議補一次 JPG 匯出比對 |
| shape-renderer | 自家版本（596 行）：Bezier 圓角（kappa）、`readPsdCornerRadii` 三個來源（rawShapeDescriptor／geometry.raw／shape.keyOriginRRectRadii）、`getCornerRadii` 有 `radiusMode:'psd'／'capsule'`、旋轉只看 `geometry.transform.rotationDeg`、**沒有 fillEnabled**（永遠填色）、匯出 `tracePath` | `renderers/shape-renderer.ams.js`＝25AMS 版：角點反推旋轉＋未旋轉框、`fillEnabled`、`traceJsonShapePath/clipJsonShape`、無 capsule 模式 | **pixel**（旋轉來源、fillEnabled、capsule、psd 半徑優先序都不同） | 整檔另存 `renderers/shape-renderer.ams18.js` 由 profile `coreScripts` 載入（同 25 版做法）；`render.shape*` 旗標只記錄用 |

### 1.3 只是超集或 UI 的差異
- `plugins/product-shadow.plugin.js`＋`.css`：右鍵產生陰影（互動）。可作為 AMS(18) profile 的選用模組載入（`coreScripts` 尾端），不需旗標。
- `ExportManager.buildZip` 直接 `loadImagesForTemplate` 並鎖定 `AppState.images`、等 `document.fonts.ready`、`requestAnimationFrame`、`hasVisiblePixels` 重畫：穩定性，不改像素。
- `askImageFormat` 只有 PNG／JPG 兩鍵（無「依規格表」）、`buildZip` 預設 `'png'`；`export()` zip 名 `18SaleTool_<id>_<ts>`。
- 規則載入：`template-rules.loader.js` 多 `additionalRuleFiles`（5 支規則動態 `<script>` 注入，`ready` 回報 loaded/failed）；index.html 只列 4 支。整合版 manifest 直接列 9 支即可。
- `applyTemplateRuleHook` 的 `helpers.findAssetFilename` 不帶 `prefix／project`（整合版會帶）；只在精準命中失敗時才有差，低風險。

### 1.4 需要新增進 core 的模組／函式
| 內容 | 來源（18AMS core 行號） |
|---|---|
| `AssetStore.normalizeFolderName`、`getBucket` 模糊對資料夾、`getFlatForLookup` 的 `preferredFolders` | 128–191 |
| `TemplateLoader.findLocalAssetFile` 的 `sourceTemplateFolders`／`preferredFolders`；`loadImagesForTemplate` 的 URL 順序與 `templateFolderName` | 491–500、410–490 |
| `Renderer.findClipLayer／applyLayerClip`（規則 tracePath 版遮罩）、`_drawLayers` 每層 save/clip/restore | 1293–1338 |
| `Renderer.getTintedImageForShadow／drawImageDropShadow`、`drawImage` 商品圖免陰影＋狀態重設 | 1635–1723 |
| `BatchManager.normalizeTemplatePlacementName` 與四個嚴格比對函式 | 4199–4273 |
| `BatchManager.findAssetFilename` URL-aware `basename` | 4599–4626 |
| `BatchManager.generateForCurrentProject` 的 `requestedOutputName`（讀 `檔名`、`_` 清理） | 3494–3501 |
| `parseRows` 表頭 `標題` 別名 | 3769 |
| `ExportManager.buildZip` JPG 白底合成 | 2185–2196 |
| `renderers/shape-renderer.js` 整檔（→ `shape-renderer.ams18.js`） | 1–596 |
| `plugins/product-shadow.plugin.js`＋`.css`（選用） | 全檔 |

### 1.5 rules／templates／renderers／product-engine／plugins 檔案差異
| 檔案 | 判定 |
|---|---|
| `core/product-engine.js` | 與 25KV／整合版舊版相同（整合版 113 行為加旗標超集） |
| `config/template-routing.js` | 相同 |
| `renderers/shape-renderer.js` | **有行為差異**（見 1.2 末列）；與整合版 `shape-renderer.ams.js` 去空白 diff 306 行 |
| `rules/shared/template-rule-utils.js`（143 行） | 整合版 `rules/shared/template-rule-utils.js`（330 行）為其嚴格超集（多 `computeAlphaBBox／fitImageByAlphaWidth／computeFitIoU`），`PROJECT_TEXT_COLORS` 同為空 → 可直接用 `@shared/` |
| `rules/template-rules.loader.js`（148 行） | normalize／registry 同 25KV；多 `additionalRuleFiles` 動態載入（整合版由 manifest 取代） |
| `rules/*_rules.js` 9 支＋`Example` | 與 25AMS 完全不同的結構（18 版自帶 `resolveRecordTemplateRoute／shapeLayers／productImageBox／TEMPLATE_LAYER_METRICS／效果設定`），**整份照搬到 `rules/AMS/`（18節 namespace）**，不可與 25 版混用 |
| `templates/*.json` 9 支 | 18 版 `P_範圍` 是實際商品圖層（有 assetFilename），與 25AMS 用法不同 |
| `plugins/` | 25 節無對應；選用 |
| `index.html`／`style.css` | 差 60／48 行：標題「18節生成工具」、plugin CSS、規則 `<script>` 清單、無 smart-assets／modules；UI 差異 |

### 1.6 建議 profile（AMS）
```
id: AMS, label: Line購物AMS V0.5, family: v4（新）, rulesNamespace: rules/AMS/, rulesAfterCore: false（原 index 規則在 core 前）
sheetHints: ["2026.4_Line購物_4.5-4.18", "Line購物"]   ← 同一本工單也有 "Network_4.5-4.18"，network profile 會同時命中，需使用者選
flags（v4 之外的差異）:
  batch.extraHeaderAliases=ams, batch.extraFields=lineShoppingAms, batch.amsTitleHeaderAlias=true（新）,
  batch.templateMatchMode=placementStrict（新值）, batch.outputNameSource=recordFilenameColumn（新）, batch.outputNameSanitize=legacyUnderscore（新）,
  assets.preferTemplateFolders=true（新）, assets.bucketNameNormalize=true（新）, assets.urlBasename=true（新）, assets.urlTemplateSubfolderSource=canvasIdNestedFirst（新值）,
  render.maskScope=all, render.maskClipImpl=ruleTracePath（新）, render.imageShadowSource=effectsShadowLegacy（新）,
  render.shapeCornerCurve=bezier, render.shapePsdCornerRadii=true（記錄用；實際由 ams18 renderer 決定）,
  export.whiteFill=jpg
coreScripts: core/product-engine.js, renderers/shape-renderer.ams18.js, core/app.core.js, plugins/product-shadow.plugin.js（選用）
templatesDir: templates/AMS, assetsDir: assets/AMS
```

### 1.7 需要使用者拍板
1. 檔名含 `*`（`1029*357`）：18 版原樣輸出（Windows 解壓會失敗），25AMS 改成 `x`。零誤差要保留 `*`；是否在 18 整合版也改 `x`（黃金樣本檔名比對就要改規則）？
2. `P_範圍` 在 18AMS 是真商品圖層、在 25 版是參考框：`batch.productPlacementGuide=false` 與 `smartAsset.engine=none` 兩者都要，且未來若 AMS 想用 smart-assets 需改公版。
3. JPG 白底兩種實作是否直接視為等價（建議跑一次 JPG 匯出 pixelmatch）。
4. `assets.urlBasename`（網址取檔名）、`preferTemplateFolders` 屬 18 版獨有的「素材找法」，25 版刻意簡化；整合後是否所有 B 系工具都想要（不影響零誤差，只是策略）。

---

## 2. ENG（18節_ENG_Tool V0.9）

### 2.1 架構摘要
模組清單同 AMS 少三組：`AssetStore 38`（無 normalizeFolderName／preferredFolders）、`Renderer 429`（無 clip／shadow 函式）、`BatchManager 1620`（無 placement 嚴格比對；`fields` 為 20 個標準欄）、`TemplateLoader 390`、`ExportManager 236`；其餘與 AMS 同指紋。**與 18AMS 的 401 行差全部是 AMS 加上去的東西**（§1.2 每一列＋`fields`），ENG 自己多的只有：`classifyAssetRole`／`applyRecordToTemplate` productLayers／`PriceCouponManager.findAnchorLayerKey` 三處把 `會員日` 也當 LOGO（102–121、4210、3061）。
- 與 25節 哪個 family 最像：core 本體最接近 25KV（1439 行，ancestor family）；工單型態（矩陣式「專案」欄、`__ALL__` 模式）在 25節 整合版 core 已內建（`parseMatrixSheet／detectMatrixProjectNames` 三份與 25KV、整合版逐字相同，註解直接寫著「17th + 18 day KV」），所以 **不是** 25節 任何一個 family 的行為需要新增，只需 v4 共同旗標。
- 黃金樣本：`tests/golden/ENG/<分頁>____ALL__/session.json`，4 個分頁 80 張；`currentProject='__ALL__'`，每張 `project` 為矩陣欄名（`4.17 直播日／4.18 暖身／4.18 正式`…），檔名 `<專案>_<公版去括號>_01`，zip 內 `<專案>/` 資料夾；`BAU + 快閃日 KV` 有 18 筆 unmatched（`Game 頭巾／Game BN` 沒公版），`紅包雨KV` 2 筆。

### 2.2 會影響輸出的行為差異（§0.2 共同項之外）
| 差異點 | 18節 ENG 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| `會員日` 視為 LOGO | `classifyAssetRole`：label 含 `會員日` → role logo（可跨專案、可模糊）；`applyRecordToTemplate` 與價格錨點挑商品層時排除含 `會員日` 的 image 層 | 只認 `logo` | asset／pixel（ENG 10 個公版與素材檔名都沒有「會員日」字樣 → 目前 dormant） | 新增 `batch.memberDayAsLogo`＝true（ENG）；或視為超集直接加（會影響其他工具有「會員日」商品層的情況，故建議旗標） |
| `rules/shared/template-rule-utils.js` | 154 行，`PROJECT_TEXT_COLORS` 有三個專案配色（4.17 直播日 title #feff91／subtitle #fff600；4.18 暖身、4.18 正式 title #feffa0／subtitle #d0011b），且有 `resolveLogoAssetFilename／applyLogoFromRecord`（LOGO 文字含「直播日」→ `直播日_LOGO.svg`、含「蝦皮直播」→ `蝦皮直播_LOGO.svg`）；10 支規則檔每支只呼叫這兩個函式 | 整合版 `rules/shared/template-rule-utils.js` 配色表是空的、沒有 `applyLogoFromRecord` | **pixel**（主副標顏色、LOGO 素材） | ENG 的 shared 檔放 `rules/ENG/shared/template-rule-utils.js`，manifest 用 `rules/shared/template-rule-utils.js`（namespace 版）而不是 `@shared/`，讓它覆寫 `window.TemplateRuleUtils`（Object.freeze 只凍內容，重新指派 window 屬性沒問題） |

### 2.3 只是超集或 UI 的差異
- `renderers/shape-renderer.js`（466 行）＝18KV／25KV 版少「四角各自半徑」（`normalizeCornerRadii／roundRectCornersPath`、`cornerRadii`、`useLayerBounds`、`traceJsonShapePath/clipJsonShape`）；ENG 公版沒有 `cornerRadii／useDynamicBounds／startAngleDeg`，用整合版 `renderers/shape-renderer.js`（＋`render.shapeFillEnabledMode=ignore`）結果相同。
- `readRecordFromRow` 的內嵌「標籤：值」用 `[\s\S]+` 貪婪比對（KV 改逐行）：ENG 工單走 `parseMatrixSheet`，不經這裡。
- 其餘 UI：`askImageFormat` 只有 PNG／JPG、zip 名 `18SaleTool_*`、無 LoadingOverlay 包 `loadTemplateFolder`。

### 2.4 需要新增進 core 的模組／函式
除 §0.2 共同項（來源可取 18ENG：`sheetToRowsWithMergedFill` 3094–3110；`isAnchor` 3521–3524；`textMap` 4147–4155；`getTextStyleSegments／measureTextSegments／drawStyledTextLine` 1437–1508；`drawImage` 1554–1576；`findLocalAssetFile` 450–540；`loadAssetFolder` 548–589；`loadImagesForTemplate` 384–449；`CapsuleRuleEngine.defaultRules` 905–917；`PriceCouponManager.apply` 2934–2947）外，只有 `會員日` 三處（102–121、4204–4212、3055–3085）。

### 2.5 檔案差異
| 檔案 | 判定 |
|---|---|
| `core/product-engine.js`、`config/template-routing.js` | 相同（＝25KV） |
| `renderers/shape-renderer.js` | 整合版 `shape-renderer.js` 為超集（無行為差） |
| `rules/shared/template-rule-utils.js` | **有行為差異**（配色表＋LOGO 判斷），需 ENG 專用副本 |
| `rules/template-rules.loader.js`（117 行） | ＝18KV；＝25KV 少 `getSheetParsers`（整合版 loader 超集） |
| `rules/*_rules.js` 10 支（各 21 行） | 25節 無對應；只做 `register(family,{label,targets})`＋兩個 hook 呼叫；放 `rules/ENG/` |
| `templates/*.json` 10 支 | 7 支有 `generatedLayers.subtitle_frame`（未開 hidden:false）；`C2C BN_360` 有 polygon（CTA_三角形，走 core `GLOBAL_VECTOR_RULES`） |
| `index.html`／`style.css` | 與 AMS 版只差 plugin 與規則清單；UI |

### 2.6 建議 profile（ENG）
```
id: ENG, label: 18節 ENG Tool V0.9, family: v4（新）, rulesNamespace: rules/ENG/, rulesAfterCore: false
sheetHints: ["17th + 18 day KV", "1st + DD day KV", "BAU + 快閃日 KV", "紅包雨KV", "美術工單"]   ← 同本工單另有 "MS (LPBN)"、"OMKV" 分頁，暖正MS／OM hints 不可太短
flags（v4 之外）: batch.memberDayAsLogo=true（新）
manifest: rules/shared/template-rule-utils.js（ENG 版）, rules/Skinny_PC(左右)_rules.js … 10 支（依原 index.html 順序）
coreScripts: core/product-engine.js, renderers/shape-renderer.js, core/app.core.js
templatesDir: templates/ENG, assetsDir: assets/ENG
```
family 判斷：ENG 是 v4 家族「最乾淨」的成員（＝AMS 減去 AMS 專屬、＝KV 減去 KOL 專屬），可當 v4 family 的基準值來源。

### 2.7 需要使用者拍板
1. `會員日` 三處要不要旗標（dormant，但加進共用 core 會改變其他有「會員日」圖層的工具行為）。
2. ENG 專用 `template-rule-utils.js` 用「namespace 副本覆寫」還是把三個專案配色與 LOGO 判斷「合併進共用檔」（後者會讓其他 18／25 工具在專案名剛好是 `4.17 直播日` 等時也套色）。建議副本。
3. 25節 整合版 `export.transparentToPng`（依規則輸出時透明改 PNG）對 ENG 的 `C2C POPUP／直播POPUP` 這類透明公版會改格式；黃金樣本是手動 PNG 不受影響，但「依規則」路徑要不要開？

---

## 3. KV（KOL代播圖 V0.9，第一單／第二單）

### 3.1 架構摘要
模組清單（行數）：`AppState 35（多 portraitAdjustmentByAsset）、scheduleBlobRevoke 11（多 __suspendBlobRevocation）、AssetStore 38、HistoryManager 25、TemplateLoader 427（多 autoSelectCurrentProjectIfNeeded）、Geometry 104、SpecOverlayManager 190、CapsuleRuleEngine 166、LayoutRuleEngine 135、Renderer 468、HostFitReviewModal 141、LayerManager 49、Inspector 113、TextEditor 114、ExportManager 321（多 getMaterialSpecTable／resolveSpecFormat／parseKBValue）、LoadingOverlay 108、Price* 同、PortraitSyncEngine 116、showPortraitToast 15、BatchManager 1768、Interaction 176、App 211`。
- 對 18ENG（797 行）多：`HostFitReviewModal`、`PortraitSyncEngine`、`showPortraitToast`、縮圖刷新佇列（`queueThumbRefresh／_runThumbRefreshLoop／refreshCurrentThumbIfNeeded／makeThumbURLFor`）、`Renderer.renderSceneTo(ctx, template, images)` 純函式版、KOL 通用欄位（`檔名／KB／內容／直播主／時間`）、`drawImage` 的 `logoClipRangeKey` 與 `opacity`、`resizeAnchor:'leftCenter'`、`__internal` 圖層、規格表格式（`getMaterialSpecTable`，＝25KV 同函式）。
- 對 25KV（2011 行）：25KV 的檔頭寫明「以 V4.25.0 為底，整合 KOL 通用機制(半身照確認/單一尺寸同步/去背貼合)」——也就是 **18KV 的三個獨有模組在 25節 已被通用化**：`HostFitReviewModal` → `modules/asset-review-modal.js`（整合版有 `.b.js`，內容幾乎逐行相同）、`PortraitSyncEngine` → `modules/single-size-asset-sync.js`（邏輯逐行相同，只把 `'直播主_人像'`／`__hostPhotoDefaultBox` 改成 `configure({eligibleLayers, defaultBoxKey})`）、`fitImageByAlphaWidth／computeFitIoU` → `rules/shared/template-rule-utils.js`（18KV 的 330 行版**與整合版逐位元相同**）。但 25KV／整合版 core **從來沒有呼叫** `AssetReviewModal.show`（grep 為 0），`ui.assetReviewMode` 旗標目前是死旗標；`SingleSizeAssetSync.configure` 也沒人呼叫。
- 已知 bug：`ExportManager.buildZip` 2367 行 `this.getTemplateFamily(t)`，ExportManager 沒這個函式 → 原工具按下載必 TypeError；黃金樣本擷取時在頁面內補 `= (t) => CapsuleRuleEngine.getTemplateFamily(t)`，整合版採同一修法（已決）。

**rules 與 core 的分工（`rules/KOL代播_rules.js` 398 行）**
| 邏輯 | 在哪裡 | core 需提供的 hook／欄位 |
|---|---|---|
| 半身照參考輪廓層 `__半身照參考輪廓`（hidden、locked、opacity .5、插在直播主後） | rules `ensureHostFitGuideLayer` | `loadImagesForTemplate` 要載 hidden 層的圖（§0.2 C6） |
| 兩位直播主檔名例外 `HOST_PHOTO_OVERRIDES` | rules | — |
| `LOGO_範圍`（固定 136×53、x=399、hidden＋`__internal`＋locked）＋ 動態新增 `LOGO` 層（`logoClipRangeKey:'LOGO_範圍'`、`resizeAnchor:'leftCenter'`）、contain 貼合 | rules `ensureLogoLayer／fitLogoContainInRange` | `Renderer.drawImage` 依 `layer.logoClipRangeKey` 用另一層的框做 clip（18KV 1633–1645）；`LayerManager.render／hitTest` 濾 `__internal`；`Interaction.moveSelected` 的 `resizeAnchor` 分支；`window.BatchManager.findAssetFilename(name,{layer,layerKey})`；`images[key].__loadedForFilename` 標記 |
| 直播主人名「直播主 X」6 字省略 | rules | — |
| 半身照自動貼合（寬 390、頂 300、中心 360）＋人工調整快取套用 | rules → `U.fitImageByAlphaWidth`、讀 `AppState.portraitAdjustmentByAsset` | `TemplateRuleUtils.fitImageByAlphaWidth`（整合版已有）；`AppState.portraitAdjustmentByAsset`（Map，需與 `AssetReviewModal.adjustmentCache` 指同一個 Map） |
| IoU 品質檢查（門檻 0.80）→ 寫 `__hostPhotoFitIoU／__hostPhotoNeedsReview／__reviewLayerKey／__reviewGuideKey／__hostPhotoDefaultBox` | rules → `U.computeFitIoU` | `TemplateRuleUtils.computeFitIoU`（已有）；**core 在 `renderPreviewGrid` 每張 `stabilizeTemplateBeforePreview` 之後檢查 `template.__hostPhotoNeedsReview===true` 才 `await` 審核視窗**（18KV 5212–5220），確認後清為 false |
| 群組排版（蝦皮LOGO＋10px＋白色直線＋10px＋LOGO 實際寬）置中；白色直線 `useDynamicBounds=true` | rules `layoutRules.applyProgrammaticLayout`（每次 render 由 `LayoutRuleEngine.apply` 呼叫） | `LayoutRuleEngine` 的 `applyProgrammaticLayout` hook（三份 core 相同）；shape-renderer 認 `useDynamicBounds`（整合版 `shape-renderer.js` 已有） |
| 匯出 KB 上限 `exportConstraints:{maxKB:200}` | rules | `ExportManager.buildZip` 讀 `getRuleSection(family,'exportConstraints').maxKB`（見 3.2） |
| 審核視窗 UI、拖曳／滾輪、確認後寫快取＋同步其他張 | core `HostFitReviewModal` | ＝`modules/asset-review-modal.b.js`（差異：確認鈕 class `host-review-confirm` vs `asset-review-confirm`；快取寫 `AppState.portraitAdjustmentByAsset` vs `AssetReviewModal.adjustmentCache`；預設框寫 `__hostPhotoDefaultBox` vs `SingleSizeAssetSync.config.defaultBoxKey`；同步走 `PortraitSyncEngine` vs `AssetSyncHub`） |
| 同素材直播主同步／還原 | core `PortraitSyncEngine` | ＝`modules/single-size-asset-sync.js` 加 `configure({eligibleLayers:['直播主_人像'], defaultBoxKey:'__hostPhotoDefaultBox'})` |

### 3.2 會影響輸出的行為差異（§0.2 共同項之外）
| 差異點 | 18節 KV 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| KOL 通用工單欄位 | `fields` 多 `檔名／KB／內容／直播主／時間`；`isAnchor` 多認 `檔名`；表頭 `檔名／KB／內容／直播主(含)／時間`；跳過「檔名含範例」與「KB、內容皆空」的列；沒有數量欄時 `takeCount=1`；`readRecordFromRow` 逐行解析「標籤：值」並多 `LOGO／直播主／時間` 別名、壓空白；`parseMatrixSheet` 也認 `直播主／主持人／時間`；`applyRecordToTemplate` 用 `直播主` 欄找 `直播主／人像／主持人` image 層套素材、`時間` 進 textMap、CTA 值 `X/-/—/無` 視為空白（4021–4331、4352–4411、3913–4020、4697–4875） | 都沒有 | **pixel／json** | 新增 `batch.kolWorkOrderFields`＝true（一個旗標涵蓋整組） |
| 匯出檔名 | `檔名` 欄（清 `[\\/:*?"<>\|]+`→`_`）→ `templateId` → `item.name`（2383–2387） | `export.stemSource`＝templateId／outputName | filename（黃金：`01_直播時縮圖.jpg`） | `export.stemSource` 新增值 `recordFilenameColumn` |
| JPG 大小上限 | `maxKB = parseKBValue(record.KB) \|\| rules.exportConstraints.maxKB \|\| 0`；JPEG 且超過 `maxKB*1024` 時 `q∈[0,1]` 二分 12 次取 ≤ 上限的最高畫質（2364–2378） | `multiSize150k`／`kLimit`（q∈[0.92,1]，壓不到就不出）／`none` | **pixel**（30 張全是 200K） | `export.compressMode` 新增值 `kbColumn`；加 `ExportManager.parseKBValue` 與 `getTemplateFamily` 補丁 |
| `format='auto'` 的規格表查詢鍵 | `resolveSpecFormat(item.project \|\| t.templateId, WxH)` | `specTable`：`__media \|\| item.project` | format（工單沒有「素材規格表」分頁時兩者都落到 jpg → 目前無差） | 新增 `export.specTableMediaKey`＝`projectOrTemplateId`（低優先） |
| 審核關卡 | `renderPreviewGrid` 逐張 `if (template.__hostPhotoNeedsReview) { LoadingOverlay.hide(); await HostFitReviewModal.show(template); ... }`；黃金擷取器用 MutationObserver 自動按 `.v3-modal-backdrop.open .host-review-confirm`（第一單 8 次、第二單 13 次） | 沒有任何呼叫；`ui.assetReviewMode=live` 說明寫「有 `__reviewLayerKey` 就開」——但 KOL 規則對**每一張**都寫 `__reviewLayerKey`（黃金 30 張全有，`__hostPhotoNeedsReview` 只有 8 張 true），照說明實作會 30 張全跳 | pixel（人工調整）／流程（不跳視窗批次就直接過，結果等於自動貼合；擷取器計數 `hostReviewAutoConfirmed` 會變 0） | 實作 `ui.assetReviewMode=live` 的關卡為 **`__hostPhotoNeedsReview===true`**（或通用名 `__reviewRequired`，並在 KOL 規則副本改名），呼叫 `AssetReviewModal.show`；modal 確認鈕同時掛 `asset-review-confirm host-review-confirm` 兩個 class 讓擷取器可重現 |
| `__loadedForFilename` | `loadImagesForTemplate` 三條路徑載入成功都寫 `images[key].__loadedForFilename = filename`（429、438、464）；規則靠它判斷「這張圖是為目前 assetFilename 載的」才做自動貼合／IoU | 沒有；且整合版有 `imageLoadCache`，同一 File 共用同一個 Image 物件，標記會被最後載入者覆寫 | **pixel／json**（沒標記 → 規則永遠跳過貼合 → 直播主照片維持 JSON 原始框） | 新增 `assets.tagLoadedFilename`＝true；為避免共用 Image 物件的標記互蓋，KV profile 另設 `assets.imageLoadCache`＝false（18KV 本來就沒有快取） |
| `drawImage` | `layer.opacity<1` → `globalAlpha`；`logoClipRangeKey` → 以 range 層框 clip（世界座標，在 translate 前）（1625–1667） | 無 | **pixel**（LOGO 超出 136×53 的部分要被裁） | 兩項都是「layer 有屬性才生效」，可當超集直接加；掃過 18／25 全部公版，image 層都沒有頂層 `opacity` 欄位，安全 |
| 素材資料夾自動選專案 | `loadAssetFolder／loadTemplateFolder` 後 `autoSelectCurrentProjectIfNeeded`：只有一個非「共用素材」資料夾、或資料夾名＝已載入 templateId 時，自動設 `AppState.currentProject`（578–598） | 無 | asset／folder（改變 lookupProject 與 zip 子資料夾；黃金擷取器有先強制 `currentProject=''`，所以樣本是 `project:''`） | 新增 `assets.autoSelectProject`＝true（KV） |
| `clean()` 多去 `/` `\|` | `findLocalAssetFile` 與 `normalizeAssetKey` 的正規化多去掉 `/`、`\|`（476–566、4893–4901） | 不去 | asset（極低） | 新增 `assets.cleanStripSlashPipe`＝true（KV），或視為可忽略 |
| `resolveSpecFormat` 快取 | `handleExcelFile` 換工單時清 `AppState._materialSpecTable` | 25KV 沒清 | format（換工單才有） | 超集，直接加 |

### 3.3 只是超集或 UI 的差異
- 縮圖刷新佇列（`queueThumbRefresh／_runThumbRefreshLoop／refreshCurrentThumbIfNeeded／makeThumbURLFor`，5296–5354）＋ 在 `onMouseUp／bindKeyboard／applyBoxFromInputs／applyTextFromInputs／TextEditor.commit／對齊／undo／redo／還原` 觸發：只更新縮圖 DOM，不動輸出。整合版有 `scheduleThumbRefresh`，`single-size-asset-sync.js` 呼叫的是 `BatchManager.queueThumbRefresh?.`（可選鏈，缺了只是不刷）。建議把 18KV 的佇列版補進 `BatchManager_B` 並讓 `scheduleThumbRefresh` 走同一條。
- `Interaction.moveSelected` 的 `resizeAnchor:'leftCenter'` 縮放（5470–5518）、`Inspector.applyBoxFromInputs` 改高度時反算 Y 保持垂直中心（1978–1999）：互動。
- `LayerManager.render／hitTest` 濾 `__internal`（1870–1909）：UI（但不濾的話使用者能選到 `LOGO_範圍`）。
- `Inspector.render` 直播主同步控制區、`portraitRestoreBtn`、`showPortraitToast`（＝`showToast` 換 id/class）、`index.html`＋`style.css` 對應區塊：UI。
- `renderPreviewGrid` 沒有 `_previewGeneration` 世代守衛（25KV 有）：`batch.previewMode=mutating` 已表達。
- `HistoryManager` 只 snapshot `AppState.template`（V0.9 說明自承 Undo 不會還原被同步的其他張）：決策 6 已定單一實作。
- `Renderer.renderSceneTo(ctx, template, images)`／`makeThumbURLFor`：25KV／整合版已有同款純函式。

### 3.4 需要新增進 core 的模組／函式
| 內容 | 來源（18KV 行號） | 整合版對應 |
|---|---|---|
| `HostFitReviewModal` | 1724–1868 | `modules/asset-review-modal.b.js` 已等價；差 class 名、快取／預設框鍵名、同步入口（可用 glue 解決，見 3.6） |
| `PortraitSyncEngine` | 2775–2897 | `modules/single-size-asset-sync.js` 已等價；需 `configure` |
| `showPortraitToast` | 2898–2913 | `showToast`（換 id `portraitToast`／class `portrait-toast`，或沿用 toast 樣式） |
| `AppState.portraitAdjustmentByAsset` | 76–79 | 指到 `AssetReviewModal.adjustmentCache` |
| `renderPreviewGrid` 審核關卡 | 5212–5220 | **新增**（`ui.assetReviewMode=live` 實作） |
| 縮圖刷新佇列 | 5296–5354 | 新增（UI） |
| `loadImagesForTemplate` 的 `__loadedForFilename` | 402–475 | 新增（旗標） |
| `drawImage` opacity＋logoClip | 1625–1667 | 新增（超集） |
| `LayerManager` `__internal` 過濾 | 1870–1909 | 新增（超集） |
| `Interaction.moveSelected` resizeAnchor、`Inspector.applyBoxFromInputs` | 5470–5518、1978–1999 | 新增（超集） |
| `ExportManager.parseKBValue`＋KB 壓縮＋`getTemplateFamily` | 2285–2288、2364–2378 | 新增（`export.compressMode=kbColumn`） |
| `TemplateLoader.autoSelectCurrentProjectIfNeeded` | 578–598 | 新增（旗標） |
| KOL 工單欄位（parseRows／readRecordFromRow／parseMatrixSheet／applyRecordToTemplate 各段） | 3594、4021–4331、4352–4411、3913–4020、4697–4875 | 新增（`batch.kolWorkOrderFields`） |
| `scheduleBlobRevoke` 的 `__suspendBlobRevocation` | 100–115 | 整合版已有 |

### 3.5 檔案差異
| 檔案 | 判定 |
|---|---|
| `smart-assets/smart-asset-manager.js`（1349）、`product-shadow.engine.js`、`smart-asset-editor.css` | 與 25KV／整合版 `smart-asset-manager.kv.js` **逐位元相同**，但 18KV index.html **沒有載入** → `smartAsset.engine=none` |
| `core/product-engine.js` | ＝25KV |
| `renderers/shape-renderer.js`（548） | ＝25KV；整合版 `shape-renderer.js` 為其超集（多 hexRectangle、fillEnabled 旗標、startAngleDeg 讀取——KOL 公版沒有 polygon／startAngleDeg，安全） |
| `rules/shared/template-rule-utils.js`（330） | ＝整合版 `rules/shared/template-rule-utils.js`，直接 `@shared/` |
| `rules/template-rules.loader.js`（117） | ＝18ENG；整合版 loader 超集 |
| `rules/KOL代播_rules.js`（398）、`Example_Template_rules.js` | 25節 無對應；放 `rules/KV/`（18節 namespace）；第一單／第二單相同 |
| `templates/KOL代播.json` | 單一公版 720×720；第一單／第二單相同 |
| `config/template-routing.js` | 相同 |
| `index.html`（314）／`style.css`（548） | 對 25KV 差 35／78 行：直播主同步控制區、toast、無 smart-assets／modules `<script>`；UI |
| `V0.9_修改說明.md` | 本報告 §3.1／3.2 已對照其 V0.5–V0.9 每一項 |

### 3.6 建議 profile（KV／KOL代播）
```
id: KV, label: KOL代播圖 V0.9（第一單／第二單共用）, family: v4（新）, rulesNamespace: rules/KV/, rulesAfterCore: false
sheetHints: ["4.18 第一單", "4.18 第二單", "第一單", "第二單", "KOL代播"]   ← 兩單 core／rules／templates 相同，建議一個 profile；assetsDir 打包哪一單的直播主照片需決定（或兩單都放 assets/KV/KOL代播/）
flags（v4 之外）:
  batch.kolWorkOrderFields=true（新）, batch.previewMode=mutating,
  export.stemSource=recordFilenameColumn（新值）, export.compressMode=kbColumn（新值）, export.formatSource=specTable, export.specTableMediaKey=projectOrTemplateId（新，低優先）,
  assets.tagLoadedFilename=true（新）, assets.imageLoadCache=false（新）, assets.autoSelectProject=true（新）, assets.cleanStripSlashPipe=true（新，可略）,
  ui.assetReviewMode=live（實作關卡改為 __hostPhotoNeedsReview）, interaction.syncMode=both（AssetSyncHub→SingleSizeAssetSync）
coreScripts: core/product-engine.js, renderers/shape-renderer.js, core/app.core.js, modules/asset-review-modal.b.js, modules/single-size-asset-sync.js
glue（建議放 rules/KV/shared/kol-runtime.js，manifest 排在 KOL代播_rules.js 之前、模組之後）:
  SingleSizeAssetSync.configure({ eligibleLayers: ['直播主_人像'], defaultBoxKey: '__hostPhotoDefaultBox' });
  AppState.portraitAdjustmentByAsset = AssetReviewModal.adjustmentCache;
  （或改 profile 增加 moduleConfig 區塊由 bootstrap 統一套用）
templatesDir: templates/KV, assetsDir: assets/KV
```

### 3.7 需要使用者拍板
1. **審核關卡條件**：整合版 `ui.assetReviewMode=live` 要以 `__hostPhotoNeedsReview` 為觸發（KOL 規則實際寫法），還是把 KOL 規則副本改成通用名 `__reviewRequired`（25 版 `asset-review-modal.js` 非 b 版認的名稱）？兩者黃金結果相同，差在規則檔要不要動。
2. `hostReviewAutoConfirmed` 可重現性：整合版 modal 確認鈕是否同時保留 `host-review-confirm` class（擷取器選擇器），或改擷取器。
3. `assets.imageLoadCache=false`（保守、與原工具一致）vs 保留快取但把 `__loadedForFilename` 改成每層記錄（要改 KOL 規則讀法）。建議先關快取拿零誤差。
4. 第一單／第二單合成一個 profile（rules 相同）後，打包的 `assets/` 放哪一單、或兩單合併（檔名不衝突，第一單 18 檔、第二單 17 檔）。
5. `autoSelectProject`：原工具會在上傳素材夾後自動把專案切成資料夾名，改變 zip 子資料夾；黃金擷取時是被強制清空的。整合後要保留這個自動行為嗎（只影響 UI 操作路徑，不影響黃金比對）。
6. `getTemplateFamily` 補丁已決（`= CapsuleRuleEngine.getTemplateFamily`）——確認一起寫進 `ExportManager_B`（其他 B 系工具本來就用不到，無副作用）。

---

## 附：建議新增／擴充的旗標一覽（登錄表用）
| 旗標 | 型別／值 | 影響 | 適用 | 說明 |
|---|---|---|---|---|
| `batch.sheetReader` | enum `sheetToJson`／`cellWalk` | pixel／json | v4=sheetToJson | §0.2 C1 |
| `batch.anchorMatch` | enum `includes`／`exactOrPrefix` | pixel | v4=includes | C2 |
| `batch.coreCopyTextMap` | bool | pixel | v4=false | C3（core 是否內建 `文案` 對映） |
| `batch.productPlacementGuide` | bool | pixel | v4=false | C9（`P_範圍` 當商品框） |
| `batch.tagProductRole` | bool | json | v4=false（或比對忽略） | C10 |
| `batch.refreshPreserveGeometry` | bool | pixel（互動後） | v4=false | C15，低優先 |
| `batch.kolWorkOrderFields` | bool | pixel／json | KV=true | §3.2 |
| `batch.outputNameSource` | enum `ruleOrRecord`／`recordFilenameColumn` | filename | AMS=recordFilenameColumn | §1.2 |
| `batch.outputNameSanitize` | enum `dash`／`legacyUnderscore` | filename | AMS=legacyUnderscore | §1.2 |
| `batch.templateMatchMode` | ＋`placementStrict` | pixel | AMS | §1.2 |
| `batch.amsTitleHeaderAlias` | bool | json | AMS=true | §1.2 |
| `batch.memberDayAsLogo` | bool | asset／pixel | ENG=true | §2.2 |
| `render.textEngine` | ＋`legacy18` | pixel | v4 | C4 |
| `render.exportMissingPlaceholder` | bool | pixel | v4=true | C5 |
| `render.capsulePaddingPx` | number | pixel | v4=25 | C12 |
| `render.imageShadowSource` | enum `dropShadow`／`effectsShadowLegacy` | pixel | AMS=effectsShadowLegacy | §1.2 |
| `render.maskClipImpl` | enum `clipJsonShape`／`ruleTracePath` | pixel | AMS=ruleTracePath | §1.2 |
| `assets.loadHiddenLayerImages` | bool | pixel／json | v4=true | C6 |
| `assets.fuzzyRoleGuard` | bool | asset | v4=false | C7 |
| `assets.bucketRelPathKeys` | bool | asset | v4=false | C8 |
| `assets.preferTemplateFolders` | bool | asset | AMS=true | §1.2 |
| `assets.bucketNameNormalize` | bool | asset | AMS=true | §1.2 |
| `assets.urlBasename` | bool | asset | AMS=true | §1.2 |
| `assets.urlTemplateSubfolderSource` | ＋`canvasIdNestedFirst` | asset | AMS | §1.2 |
| `assets.tagLoadedFilename` | bool | pixel／json | KV=true | §3.2 |
| `assets.imageLoadCache` | bool | none（效能） | KV=false | §3.2 |
| `assets.autoSelectProject` | bool | asset／folder | KV=true | §3.2 |
| `assets.cleanStripSlashPipe` | bool | asset | KV=true | §3.2，可略 |
| `export.stemSource` | ＋`recordFilenameColumn` | filename | KV | §3.2 |
| `export.compressMode` | ＋`kbColumn` | pixel | KV | §3.2 |
| `export.specTableMediaKey` | enum `mediaOrProject`／`projectOrTemplateId` | format | KV=projectOrTemplateId | §3.2，低優先 |
| `export.transparentToPng` | 既有 | format | v4=false（需拍板） | C13 |
| `price.rebuildMemoryMode` | ＋`none` | pixel（互動後） | v4 | C11 |
| `ui.assetReviewMode=live` | 既有，需真正實作 | pixel／流程 | KV | §3.2 |

v4 family 建議值（相對 `_defaults.defaults`，其餘沿用 ancestor／KV 值）：`batch.assetSpecEngineFirst=false, batch.explicitTemplateIdRoute=none, batch.coreSubtitleTextMap=true, batch.coreCopyTextMap=false, batch.smartAssetIdMode=none, batch.smartAssetApplyPhase=none, batch.previewMode=mutating, batch.sheetReader=sheetToJson, batch.anchorMatch=includes, batch.productPlacementGuide=false, render.textEngine=legacy18, render.autoLogoShadow=false, render.applyBoxSyncCenterForAllTypes=false, render.productSizingHeightPriority=legacy, render.exportMissingPlaceholder=true, render.capsulePaddingPx=25, assets.loadHiddenLayerImages=true, assets.fuzzyRoleGuard=false, assets.bucketRelPathKeys=false, assets.missingDiagnostics=none, templates.snapshotRestore=false, templates.prepareHook=none, templates.textBaselinePrepare=false, export.zipPrefix=18SaleTool, export.batchZipName=batchTs, export.formatSource=specTable, export.stemSource=templateId, export.folderStrategy=project, export.scaleMode=fixed4x, export.whiteFill=none, export.compressMode=none, export.diagnostics=none, export.jsonMode=raw, export.transparentToPng=false, price.layerBaselineMode=none, price.specialCharRanges82=false, price.syncSeparatePositionScale=false, price.rebuildMemoryMode=none, smartAsset.engine=none, interaction.syncMode=none, interaction.dblclickReplace=none, text.afterEditHook=none, ui.assetReviewMode=off, ui.toolName=18節生成工具, rules.normalizeLegacy=true, rules.loadFailurePolicy=continue`。
