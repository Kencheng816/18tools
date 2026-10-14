# 步驟 2 報告 05：18節 A 系三工具（暖正MS V0.5／暖身BN V5.11／正式BN V7.4）

比對來源（bash 沙箱）：
- 18節：`暖正MS/18節Tool_暖正MS_V0.5`（core 4743 行）、`暖身BN/18節_暖身BN_Tool_V5.11`（4789 行）、`正式BN/18節_正式BN_Tool_V7.4`（5160 行）
- 25節 原版：`暖正MS/25節Tool_暖正MS_V0.5`（6652）、`暖身BN/25節Tool_暖身BN_V1.5`（6871）、`正式BN/25節Tool_正式BN_V0.8`（6949）、以及 **`KV/25節_KV_V0.2`（6203）**
- 25節 整合版：`25節Tool_整合版/core/app.core.js`（14780，`pickLineage(X_A, X_B)` 雙實作）、`config/profiles/*`、`docs/core-diff/02/04/05/06`
- 方法：頂層 `const Xxx = {` 切模組 → 每模組再以 4 空格縮排切方法 → 去空白 md5 指紋 → 只對指紋不同的方法做語意 diff。

> **先講最重要的結論（會推翻原本的假設）**
> 1. 18節 的「A 系」三支 core **不是** 25節 A 系（正式BN/暖身BN/MS V1.x）的舊版，而是 **25節 KV（祖先系）的直接前身**：`PriceLayerFactory`、`PriceTransformEngine.syncPriceLayer`、`PriceRuleEngine.resolveLayoutForAnchor/resolveTemplateRule`、`PriceCouponManager.applyForAnchor`、`Geometry`、`product-engine.js`、`template-rules.loader.js`（merge 模式）、預覽／匯出「切換 AppState 再畫」路徑，全部與 25節 KV 逐字或近乎逐字相同；25節 KV 的註解甚至寫著「V1.0 開源版：移除頭巾／HBN／MALL SKBN／DEFAULT_TEMPLATE…」，移除的正是 18節 這三支還在用的東西。
> 2. 因此整合時 **不要** 用 `family: 'a'`（25節 A 系旗標值會把 TextBaselineModel、AssetLookup、PriceTypographyResolver、snapshot 匯出等全部打開，像素必變）。應以 **`family: 'ancestor'`（KV 那組實作＝core 內的 `_B` 分支）為底**，再補 18節 專有的東西。
> 3. 但「以 KV 為底」仍有 **約 30 個會改輸出的差異**（下表），其中 8 個是 25節 整合版完全沒有的模組／函式（頭巾標題排版、MS L1 解析器、MS 陰影繪製、Word 補丁、DDcard VIP 群組寬度、C2C SKBN 切圖、MALL SKBN 三欄價格、內建價格預設座標）。這些都必須「加法」補回 core 才可能零誤差。
> 4. 三支 18節 之間：共同基底佔 ~75%（MS↔暖身 1242 行、暖身↔正式 1159 行 去空白 diff），差異集中在 Renderer 文字引擎（3 種）、TemplateLoader 素材查找（3 種）、BatchManager 家族專用區塊（MS L1／頭巾／MALL SKBN／SCBN）與 Price 顏色解析（2 種）。

---

## 0. 模組矩陣（頂層物件；行數＝原始行；指紋＝去空白 md5 前 8 碼）

| 模組 | MS18 | 暖身18 | 正式18 | KV25（最近親戚） | 25節整合版 | 判讀 |
|---|---|---|---|---|---|---|
| `normStr / escapeHtml / SVG / DOM / PreviewZoom / PriceParser / PriceLayoutResolver / activeLayer*` | 同 | 同 | 同 | 同 | 同 | 逐字相同 |
| `getRuleSection` | 12 行（自帶 registry 查找＋`window.*TemplateRules` 舊全域 fallback） | 1 行 | 1 行 | 1 行 | 1 行 | MS 多舊全域 fallback（rules 已不用，可視為死碼） |
| `DEFAULT_TEMPLATE`（內嵌 DDcard 保底範本） | 有 | 有 | 有 | **無** | **無** | 只在「沒載入 DD Card 公版」時生效（見 §A.7） |
| `HEADBAND_SHEET_ROUTES / TEMPLATE_ROUTING_CELLS` | 有（讀 `config/template-routing.js`） | 有 | 有 | **無** | **無** | 頭巾工單固定欄位分流 → 必補 |
| `AppState` | 26 行（`assetFiles`、`assetFilesByFolder` Map） | 同 | 同 | 33 行（`AssetStore`） | 超集 | 欄位超集 (a) |
| `HistoryManager` | 24（純 clone 陣列） | 同 | 同 | 88 | tx／legacyExtras | UI (a) |
| `TemplateLoader` | 243 | 330 | 285 | 469 | `_A/_B` | **素材查找 3 種實作**（§A.3） |
| `Geometry` | 71 | 71 | 71 | 133 | `_A/_B` | 18節＝KV 子集：`applyBox` 只對 image 同步 center、認 `ddcardHeightPriorityNoWidthLimit` |
| `SpecOverlayManager` | 185 | 189 | 189 | 162 | 有 | 規格線 UI，不進匯出 |
| `CapsuleRuleEngine` | 174（多 `isMSL1` 分支） | 142 | 155（多 `ddcardVipGroupProxy`） | 147 | 有 | **預設 padding 25 vs 55**、MS L1 膠囊、DDcard VIP 群組寬（§A.4） |
| `LayoutRuleEngine` | 246 | 246 | 246 | 119 | 有 | 18節多 `applyHeadbandShopeeTitleLine / applyHeadbandVipTitleLine / resolveHeadbandBackgroundWidth / handleLayerBoxApplied`（25節「開源版已移除」）→ 必補 |
| `TextBaselineModel` | **無** | 無 | 無 | 無 | 有 | KV 也沒有 → `render.textEngine=legacy` 系 |
| `Renderer` | 305（多陰影 pass） | 310（`richTextRuns`） | 349（`textStyleRanges` 只認 color） | 777 | `_A/_B` | **文字引擎 3 變體＋MS 陰影 pass**（§A.2） |
| `LayerManager / Inspector / TextEditor / LoadingOverlay / TemplateFilter / TemplateList` | 小 | 小 | 小 | 大 | 超集 | UI |
| `ExportManager` | 182 | 182 | 253（多 C2C SKBN 切圖） | 296 | `_A/_B` | §A.6 |
| `BUILT_IN_PRICE_RULES_BY_FAMILY` | 有（讀 `window.DDCardTemplateRules` 等舊全域） | 無 | 無 | 無 | 無 | 死碼（18節 MS rules 不再掛這些全域） |
| `PriceRuleEngine` | 216 | 210 | 207 | 253 | `_A/_B` | **內建 `defaultLayouts` 7 組座標**、HBN 空規則特例（§A.5） |
| `PriceColorResolver` | 36（`defaultRules`＋`buildMatcher`，rules 覆蓋內建） | 39 | 44（＝KV：外部規則先、內建後） | 54 | `_A/_B` | **兩種語意**（§A.5） |
| `PriceLayerFactory / PriceTransformEngine` | ＝KV | ＝KV | ＝KV | — | `_B` | 逐字相同（KV 少 4 支 A 系才有的方法） |
| `PriceCouponManager` | 105 | 108 | 186（`applyMallSkbnColumns`） | 220 | `_A/_B` | apply 無「重建回填記憶」、rebuild 後 hook 行為 3 種（§A.5） |
| `BatchManager` | 1511（`parseMSL1Rows`…） | 1413 | 1601（MALL SKBN／SCBN） | 1754 | `_A/_B` | 無 `sheetToRowsWithMergedFill`、無矩陣工單、無 project；有頭巾 8 支函式（§A.1） |
| `Interaction` | 97 | 97 | 97 | 290 | `_A/_B` | UI（無 SmartAsset／Hub 同步） |
| `App` | 101 | 154 | 144 | 177 | `_A/_B` | init 是否等 rules ready（§A.8） |
| `rulesReady`（檔尾啟動） | 直接 `App.init()` | `App.init()` 內 `await TemplateRulesLoader.ready`，失敗 alert 並停止 | `rulesReady.catch(warn).then(App.init)` | 同正式 | 有旗標 | `boot.abortOnRuleLoadFailure` |
| 25節 才有：`AssetStore / AssetLookup / AssetSyncHub / ManualOverrideManager / DynamicLayoutManager / SnapshotManager / ManualAssetUpload / LayerDefaults / BatchDiagnostics / LinkSync / PriceTypographyResolver / TextBaselineModel / classifyAssetRole / showToast / scheduleBlobRevoke` | — | — | — | 部分 | 有 | 18節 皆無；靠旗標關閉即可 |

外掛檔：18節 三支都 **沒有** `smart-assets/`、`modules/`、`dom-editor-plugins/`、`core/work-order-export-planner.js`；`product-engine.js` 三支同一份（87 行）；`shape-renderer.js` MS＝正式（450 行），暖身 490 行（多四角各自半徑＋`layer.rotation` 優先）。

---

## A. 「18節 A 系共同基底」 vs 25節（整合版 core 現況）

### A.1 工單解析與套版（BatchManager）

| 差異點 | 18節 行為（三支共同，除註明） | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| 列展開 | `XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',blankrows:true})`，**不做任何合併儲存格補值** | `sheetToRowsWithMergedFill`：`batch.mergeFillMode=rect/vertical` 一定會補值 | pixel／filename（合併格下方空白列會被 25節 補成有值 → 多產圖或文字不同） | **新增旗標值** `batch.mergeFillMode='none'`（18節 A 全部） |
| 專案（project）概念 | 無；沒有 `generateForCurrentProject`、`detectMatrixProjectNames`、`parseMatrixSheet`、`ALL_PROJECTS_VALUE` | 有矩陣工單偵測與 All 模式迴圈 | pixel／filename（矩陣偵測命中會走別的 parser） | `batch.matrixParser=false`、`batch.assetSpecEngineFirst=false`；project 一律 `''` |
| 表頭偵測 `detectColMap` | 錨點＝含「製作內容」或「版位」；有 **blockedHeaderWords**（日期／主題日／頁面／版配／規格／備註／說明…直接排除）；欄位別名固定表（主標 startsWith、副標 含 usp、票券／票券案型、樣式／大標題／小黃標＝暖身 OPS BN 專用） | `readRecordFromRow` 別名表 ＋ `batch.extraHeaderAliases`；無 blockedHeaderWords | pixel（欄位對錯位） | **新增** `batch.headerAliasTable='legacy18'`（含 blocked 清單）；暖身多 3 欄 → `batch.extraFields=['樣式','大標題','小黃標']`；正式多 `商品圖_左/中/右、價格_左/中/右、文案_左/中/右` |
| 表頭有效條件 | `hasCoreFields ‖ 下方 40 列內有「頭巾」製作物` | fields 命中 ∪ SpecialBlockParserPolicy | pixel | 併入 `legacy18` 表頭模式 |
| 製作物列讀取 | 「回溯最近主標列」（V3.7）、數量欄 `數量`、無數量最多掃 80 列、`isOtherProductStart` 規則、已知公版名可接受同列無內容 | KV 版通用區塊解析（結構相近但細節不同：無 80 列上限判斷式寫法、無 headband 判斷） | pixel／filename（多讀或少讀一筆） | 需逐段對照後決定：建議把 18節 `parseRows` 整支以 `batch.genericRowParser='legacy18'` 保留（比對成本 > 旗標拆分成本） |
| 頭巾（headband）區塊 | `isHeadbandBlockName` → `readHeadbandRecords`（票券欄有對應時逐列；否則「兩列一組 F/I/J/K 欄」硬座標讀法）、`splitHeadbandCopy`（小字／法務拆行） | **完全沒有**（25節 KV 註解：開源版已移除） | pixel／filename（頭巾 6 張全靠它） | **新增模組**：BatchManager 8 支（`isHeadbandBlockName / hasRouteKeyword / splitHeadbandCopy / readHeadbandRecords / sheetCell / getRouteLogoValue / resolveSheetTemplateRoute / HEADBAND_SHEET_ROUTES＋TEMPLATE_ROUTING_CELLS`）＋旗標 `batch.headbandRouting=true` |
| 路由 fallback | rule 沒回 route 且是頭巾區塊 → 用 `record['票券']` 對 `HEADBAND_SHEET_ROUTES.logoKeywords`；沒對到回 `headband_unmatched_ticket` | `batch.explicitTemplateIdRoute`（om_wave1／generic／blockFamily／none） | pixel／filename | **新增值** `batch.explicitTemplateIdRoute='headbandTicket'` |
| rule 自訂區塊解析 | `parseRows` 末段跑 registry 每個 family 的 `parseSheetBlocks`，用 `handledProductNames` 把通用區塊剔除（seller_bn 用） | ruleSheetParsers 是「第一個有 blocks 者勝、整表接管」 | pixel／filename（18節是「通用＋自訂並存」） | **新增值** `batch.ruleSheetParserMode='mergeAfterGeneric'`（18節）vs `'firstWins'`（25節） |
| 公版比對 `findTemplateForRoute` | 先 `templateFile` 檔名精準（V5.13）→ id 精準（去前綴數字）→ **includes 模糊取第一個**；找不到回 reason | `strict`（多命中衝突）／`fuzzy`（direct-name、去前綴、includes） | pixel | 沿用 `batch.templateMatchMode='fuzzy'`，但需確認 25節 fuzzy 的順序＝「檔名精準→id 精準→模糊」（KV 版即此，OK） |
| `findTemplateForName` | rule tokens includes；找不到且 label==='DD Card' → **回 `DEFAULT_TEMPLATE`（內嵌 DDcard）** | 找不到 → unmatched | pixel／張數（只在沒載 DD Card 公版時） | `templates.embeddedDefault=true`（18節）／false；黃金樣本有載 DD card，實際不觸發 |
| `ensureTemplatePool` | 沒有 ddcard 公版時把 `DEFAULT_TEMPLATE` 推進池 | 純 clone | 同上 | 同上 |
| `ensureTemplateForRoute` | 找不到就 `fetch ./templates/<templateFile>` | `batch.fetchRouteTemplate` | pixel | 沿用 `true`（後處理＝無 → `templates.prepareHook='none'`、`templates.textBaselinePrepare=false`） |
| 輸出前綴 `makeOutputPrefix` | **硬編碼對照表**：hbn/han→`HBN`、ddcard/ddc→`DDC`、popup→`POPUP`、skbnapp→`SKBN_APP`、skbn→`SKBN_PC`、ig→`IG`、gamebn→`Game_BN`、直播大廳bn→`直播大廳BN`、MS輪播BN；先看公版名再看製作物名；MS 版多 上蓋_VIP／票券_VIP／下蓋_VIP 三筆且無 IG/Game 等 | 直接清理公版名（`03_HBN`→`03_HBN`） | **filename**（黃金樣本 `HBN_01.png`、`DDC_01.png`、`SKBN_PC_01.png` 全靠此表） | **新增** `batch.outputPrefixTable='legacy18Bn'`（暖身＝正式）／`'legacy18Ms'` |
| 素材前綴 `getTemplateAssetPrefix` | 對照表 DDC/HBN/POPUP/SKBN（暖身多 `10_IG / 11_GAME BN / 12_直播大廳BN / 13_MS輪播 BN / ME PAGE / OPS_BN`；正式再多） | 回 `''` | pixel（`findAssetFilename` 用 `<prefix>_<名>` 先找） | **新增** `assets.templatePrefixTable='legacy18Bn'／'legacy18Ms'` |
| `applyRecordToTemplate` textMap | `票券案型／主標／副標／警語／CTA`；主標為 `(logo)` 字樣時隱藏主標圖層（MS 改為「上蓋_全橘 三種 LOGO」規則） | KV 版無 `副標`（改 `文案`），有 `batch.coreSubtitleTextMap` | pixel | `batch.coreSubtitleTextMap=true`；主標 `(logo)` 隱藏 → **新增** `batch.titleLogoTokenHide=true` |
| 商品圖層過濾 | 排除 bg／cta／logo／**`會員日`** | 排除 bg／cta／logo | pixel（含「會員日」字樣的 image 層會被 25節 當商品圖） | **新增** `batch.productLayerExcludeWords=['會員日']` |
| 商品圖套框 | `resolveTemplateProductImageRule(productImageBox)` → 否則 P 圖層自身框；無 P_範圍 guide | 先 `getProductPlacementGuideBox`（P_範圍）；18節 公版無此層 | 否 | (a) |
| 商品圖命中後 | 不寫 `role='product'`、不產 `smartAssetId`、不刪 `__resolvedAsset*` | 寫入 | 否（無 SmartAsset） | `smartAsset.engine='none'`、`batch.smartAssetIdMode='none'` |
| 商品圖選欄 | 單商品層：`img2 ‖ img1`（**正式BN 的 scbn 家族只吃 img1**） | `img2 ‖ img1` | pixel（正式 SCBN） | **新增** `batch.product1OnlyFamilies=['scbn']`（正式BN） |
| 價格入口 | 暖身／MS：`PriceCouponManager.apply`；正式：`c2c_skbn_app`→不產價格（rules 自行處理）、`mall_skbn`→`applyMallSkbnColumns`（左/中/右三欄各自錨點） | 一律 `apply` | pixel（正式 MALL_SKBN 3 張、C2C_SKBN_APP 4 張） | **新增模組** `applyMallSkbnColumns`＋旗標 `price.familyDispatch='legacy18Formal'` |
| Preset／SPTextStandard／SmartAsset | 無 | A 系才有 | — | `batch.placementPreset=false`、`batch.applyNonPriceTextStandard=false`、`batch.smartAssetApplyPhase='none'` |
| 記錄有效判定 | `fields.some(有值)` | `batch.recordContentMode='fields'` | 否 | 沿用 |
| 變體展開 | `expandRecordVariantsForTemplate`（暖身／正式有，**MS 無**）；輸出名 `<prefix>_NN[_<suffix>]` | 有，另支援 `__outputName` | filename（MS 若 rules 回變體會被 25節 展開；MS rules 沒宣告 → 無差） | (a) |
| 預覽管線 `renderPreviewGrid` | 切換 `AppState.activeIndex/template` → `loadImagesForTemplate` → `stabilizeTemplateBeforePreview`（`rebuildFromPricePreset`＋`syncTemplate`＋`LayoutRuleEngine.apply` ×2；**不重跑 `applyRecordToTemplate`**）→ 縮圖；正式BN 在 stabilize 內多「ddcard 家族重跑 afterApplyRecordToTemplate」 | `batch.previewMode='mutating'`（KV）＝切換＋**`refreshTemplateFromBatchRecord` 二次套版**＋stabilize（每張都重跑 after-hook＋SmartAsset） | **pixel**（二次套版與 after-hook 重跑會改幾何） | **新增值** `batch.previewMode='mutatingNoReapply'`；`batch.stabilizeAfterHook='none'`（暖身／MS）／`'ddcardOnly'`（正式）／`'always'`（KV） |
| 產圖前字型暖機 | 暖身BN 有 `ensureFontsReadyForRender`（等 `document.fonts.ready`＋畫一次 10×10 暖機） | 無 | pixel（Headless 首張文字量測穩定度；golden 用它擷取） | **新增** `batch.fontWarmup=true`（暖身；建議三支都開，無害） |
| `applyTemplateRuleHook` helpers | `round / findLayer / normalizeRecordText / norm`（正式多 `getTemplateRuleFamily`） | 超集（多 `measureRenderedTextWidth` 等） | 否 | (a) |
| 縮圖白底 | 無（`makeThumbURL` 直接 jpeg 0.86） | `ui.thumbWhiteOnMultiSize` | UI | `false` |

### A.2 繪製（Renderer／CapsuleRuleEngine／LayoutRuleEngine／Geometry／shape-renderer／product-engine）

| 差異點 | 18節 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|
| 文字引擎 | `textBaseline='top'`、`startY = y + max(0,(h − n×lh)/2)`、`lh = lineHeight ‖ 1.05×字級`、無 `fontKerning/textRendering`、無 TextBaselineModel；`textRule.lineHeightPx` 覆寫；旋轉以框中心 | `render.textEngine='legacy'`（KV）骨架相同，但 **styled ranges 會依 `fontSizePx/fontWeight/fontFamily/baselineOffset` 換字級並做 usp／source-baseline 對齊** | **pixel** | 見下一列 |
| 大小字／分色 | **MS**：完全不看 `textStyleRanges`／`richTextRuns`（整層單色單字級）。**暖身BN**：只認 rules 寫入的 `richTextRuns`（`splitRichTextRunsByLine/drawRichTextLine`，只換 **color**），忽略 `textStyleRanges`。**正式BN**：只認 `textStyleRanges` 的 **color**（`getTextStyleSegments` 只取 color），忽略 fontSizePx 等 | legacy 引擎會用 ranges 的字級：實測 18節 `ar_large_bn.rules.js` 的 EDITED_LAYOUT 層 `fontSizePx 76` 而 range `68`；`c2c_skbn_pc.rules.js` 層 32／range 38；暖身 `02_Seller BN_*.json` 有 27 處 range color ≠ 層色（18節暖身根本不畫） | **pixel（確定）** | **新增值** `render.textEngine='legacy18'` ＋ `render.styledTextSource='none'`（MS）／`'richTextRuns'`（暖身）／`'rangesColorOnly'`（正式） |
| 文字換行正規化 | `_x000d_ / \r\n / \r` → `\n` | legacy 多 `  ` | pixel（極少） | 併入 `legacy18` |
| MS 陰影 pass | `layer.shadow/dropShadow.enabled` 的 text＋image 層：**先在暫存 canvas 畫全部陰影（含 destination-out 挖掉本體）→ 以 multiply 一次貼回 → 再畫圖層**（`getLayerShadow / shadowColorToRgba / getShadowBlendMode / applyLayerShadow / hasShadowLayer / drawAllLayerShadows / drawShadowSource / drawTextContent / drawImageContent`）。MS 公版 `上蓋_獨享／上蓋_銀行` JSON 內帶 `shadow`，`ms_l1.rules.js` 也會寫入 | 只有 `drawImageShadow(layer.dropShadow ‖ 自動 LOGO 白陰影)`，逐張 image、無文字陰影、鍵名 `angleDeg/distancePx/blurPx`（18節是 `angle/distance/blur`） | **pixel（MS）** | **新增模組** MS 陰影 pass（來源 `ms18 app.core.js` L1189–1330）＋ `render.layerShadowMode='ms18Pass'`；`render.autoLogoShadow=false` |
| 缺圖佔位 | image 層 **沒有 `assetFilename`** 時，白色虛線框＋psdName **一律畫**（含匯出） | 只在 `showMissing`（預覽 UI）才畫；匯出不畫 | pixel（黃金樣本 0 個此類圖層，實際不觸發） | (c) 見 §7-1，建議不保留（接受偏離） |
| 未就緒圖片 | `keepAspectRatio` 且 `naturalWidth` 未就緒 → 不畫 | 同（KV 起） | 否 | (a) |
| 形狀 CTA 箭頭 | **正式BN**：`shape.kind` 為 triangle／ctaArrow 時以 corners 或框硬畫向右三角形（`Renderer.drawShape`）；暖身／MS 無 | `render.shapeLegacyTriangleOverride` | pixel | 正式＝true、暖身／MS＝false |
| 形狀圓角 | MS／正式 `shape-renderer` 單一半徑 4×`arcTo`；暖身多 `keyOriginRRectRadii` 四角各自半徑、`layer.rotation` 優先於 `transform.rotationDeg` | 25節 有 `render.shapePsdCornerRadii`、`render.shapeRotationSource`；四角路徑改 `lineTo+arcTo`（幾何等價） | pixel（低風險：路徑幾何相同） | 暖身：`shapePsdCornerRadii=true`、`shapeRotationSource='corners'`；MS／正式 false／transform；`fillEnabledMode='ignore'`、`cornerCurve='arcTo'`、`strokeInset=false`、`boxSource='bboxFirst'` |
| 膠囊預設 padding | `CapsuleRuleEngine.defaultRules.horizontalPaddingPx / subtitleWiderPaddingPx / titleWiderPaddingPx = 25` | **55** | **pixel**（rules 沒覆寫的家族：18節 `hbn.rules.js` 有寫 25，其餘沿用預設） | **新增** `render.capsuleDefaultPaddingPx=25` |
| 膠囊寬度 | 暖身／正式：`isolatedIGCapsule` 分支（＝25節）；**MS**：`isMSL1` 分支（讀 `generatedLayers.subtitle_frame.rules` 的 `titleWidthSource / subtitleWidthSource / fixedHeight / centerYOffset / radius`，用 `__msL1LogoTitleGroupWidth` 等） | 無 MS L1 分支 | **pixel（MS 中標／上蓋）** | **新增** MS L1 膠囊分支（`ms18` L713–905 `buildLayer` 前半） |
| `measureTextWidth`（膠囊） | 正式：`ddcardVipGroupProxy===true` 時直接回 `ddcardVipGroupWidth`（`ddcard.rules.js` 寫入 371／469） | 無 | pixel（正式 DDC 含 VIP 時） | **新增**（superset：只在 rules 設旗標時生效） |
| `LayoutRuleEngine.apply` | `applyProgrammaticLayout` hook ＋ `headbandShopeeTitleLine.enabled` → `applyHeadbandShopeeTitleLine`；`headbandVipTitleLine.enabled` → `applyHeadbandVipTitleLine`；`resolveHeadbandBackgroundWidth`；`handleLayerBoxApplied`（互動） | 只有 hook（註解：開源版已移除頭巾） | **pixel（頭巾 6 張）** | **新增模組**（`wbn18` L971–1253 三支 ＋ `handleLayerBoxApplied`）；`applyProgrammaticCapsule` 的 `source` 字串 `generated_headband_layout` vs `generated_layout`（只是標記，不影響像素） |
| `Renderer.render/renderSceneTo` | 每次先 `PriceTransformEngine.syncTemplate`＋`LayoutRuleEngine.apply` | `render.appliesLayout=true` | — | 沿用 true |
| `Geometry.applyBox` | 只 image 同步 center；`ddcardHeightPriorityNoWidthLimit` | 有旗標 | — | `render.applyBoxSyncCenterForAllTypes=false`、`render.applyBoxDdcardHeightRule=true`、`applyBoxCoverSyncHeight=false` |
| `product-engine.js` | 87 行：`heightbased ‖ layer.targetHeight` 就高優先 | `render.productSizingHeightPriority='legacy'` 即此 | — | 沿用 `legacy`；`useProductEngineSizing=true` |
| 遮罩 | 無 | `render.maskScope` 只在層有 `__maskLayerName` 才生效 | 否（18節 公版無） | (a) |

### A.3 素材載入／查找（TemplateLoader）

三支各一套，都不是 25節 的 `AssetLookup`（A）也不是 `AssetStore.getFlatForLookup` 扁平表（B）：

| 項目 | MS18 | 暖身18 | 正式18 | 25節 整合版 |
|---|---|---|---|---|
| 儲存 | `AppState.assetFiles = Map(file.name → File)`（**同名檔互相覆蓋，取最後一個**） | 同 MS ＋ `assetFilesByFolder = Map(父資料夾名 → Map(name→File))` | `Map` 同時放 `file.name` 與 `webkitRelativePath` 兩把 key（first-wins） | `AssetStore` 依專案 bucket |
| 查找順序 | 完整檔名精準 → **VIP LOGO 嚴格只吃 `蝦皮VIP_LOGO.svg`**（`MS_L1_VIP_LOGO_FILENAME`）→ 清理後相等 → 模糊含（`includes` 雙向）取「長度最接近」 | `getTemplateAssetFolderHints(template)`（公版名去編號 vs 資料夾名去編號：相等／前綴表 `getTemplateAssetPrefix`／模糊）→ 依序在該資料夾內 `pickBestAssetKey`（精準 → 蝦皮VIP 特例 → 精準優先、再長度最近的模糊）→ 全域扁平表同法 | 完整／basename 精準 → **「basename 相等 且 路徑含公版名」優先** → basename 相等 → 蝦皮VIP 特例（優先路徑含公版名）→ 清理後相等 → 路徑含公版名的模糊 → 全體模糊取長度最近 | `assets.lookupEngine='flatFuzzy'`（KV）：bucket 順序 `<project>→共用素材→root→其他資料夾`，policy 禁模糊（background/product/ticket）等 |
| KV_BG 慣例檔名 | 無 | `getLayerAssetFilenameCandidates`：`kv_bg` 層先試 `<公版名去編號>_KV_BG.png`（頭巾子版型共用 `頭巾_KV_BG.png`），成功才改寫 `assetFilename` | 無 | 無 |
| URL fallback（無本機檔） | `./assets/素材/f`、`assets/素材/f`、`./assets/f`、`./f`、`assets/f`、`f` | `./assets/f`、`./f`、`assets/f`、`f` | 同暖身（檔名先 `encodeAssetPath`） | `assets.urlCommonFolder / urlTemplateSubfolderSource…` |
| 載圖前 | — | — | — | — |
| MS 特有 | `loadImagesForTemplate` 開頭先 `LayoutRuleEngine.apply(template)`（讓 ms_l1 動態產生的 VIP LOGO／主標圖層先進 layers 再載圖） | — | — | 無 |
| 公版載入 `loadTemplateFolder` | `JSON.parse`，name＝`templateId ‖ 檔名`；無 identity 衝突處理、無 prepareTemplate、無 AssetSpecEngine | 同 | 同 | `templates.identityConflict=keepAll`、`snapshotRestore=false`、`prepareHook='none'`、`textBaselinePrepare=false`（皆既有值） |
| 上傳素材後 | `loadImagesForActiveTemplate`＋`Renderer.render`（不重套工單、不重畫縮圖） | 同 | 同 | `assets.afterUploadRefresh` 兩個既有值都會重畫縮圖 → **新增值** `'activeOnly'` |

影響：素材（選到不同檔）→ pixel。**建議**：`assets.lookupEngine` 新增三個值 `'legacy18Flat'`（MS）、`'legacy18FolderHint'`（暖身）、`'legacy18PathPref'`（正式），三支函式原樣搬入 `TemplateLoader_B` 旁（來源：`ms18` L157–420、`wbn18` L148–512、`fbn18` L153–461）。共同：`assets.roleClassify=false`、`assets.crossProjectFallback` 不適用、`assets.missingDiagnostics='none'`、`assets.waitFontsBeforeLoad=false`。

> 注意：黃金樣本擷取時素材是以 `assets/<子資料夾>/<檔>` 的 `webkitRelativePath` 且依 Unicode 排序餵入，因此三種查找在黃金樣本下是決定性的；整合版必須用同一份餵入順序重跑，否則暖身／MS 的「Map 後蓋前」與模糊取第一個會不穩定。

### A.4 rules 載入器與 family 判定

| 差異點 | 18節 | 25節 整合版 | 影響 | 建議 |
|---|---|---|---|---|
| `template-rules.loader.js` register | 重複 register **合併**（tokens／targets 聯集、rules 淺合併） | `rules.registryMode='merge'` | — | `merge` |
| detectFamily | 依 priority 降冪取第一個「相等或互含」 | merge 模式即此 | — | 同上 |
| normalize | 小寫、去副檔名、去空白／符號；**不去編號前綴、不 NFKC** | `rules.normalizeLegacy=true`（KV） | pixel（family 判定） | `true` |
| 載入失敗 | MS：`document.write` 同步注入、無 ready；暖身：任一失敗 reject → `App.init` alert 並**停止**；正式：warn 後繼續 | `rules.loadFailurePolicy`、`boot.abortOnRuleLoadFailure` | 啟動 | MS／正式 `continue`＋`abort=false`；暖身 `reject`＋`abort=true` |
| `CapsuleRuleEngine.getTemplateFamily` | `ruleFamily ‖ sheetTemplateRoute.family` → **硬編碼 `頭巾vip/headbandvip/hdbvip`→`headband_vip`、`頭巾蝦皮購物/頭巾全站/…`→`headband_shopee`** → registry.detectFamily → 硬編碼 ddcard/hbn/headband → **預設 `'ddcard'`** | registry → **`null`** | **pixel**：18節暖身沒有 `ms_carousel_bn` rules，`MS輪播BN_01` 會落到 `'ddcard'` family（套 ddcard 的 capsuleRules／priceRules／textRules）；25節回 null → 無規則 | **新增** `rules.familyFallback='ddcard'`（18節 A）／`null`（其餘）＋ `rules.headbandFamilyHardcode=true` |
| `PriceRuleEngine.getRules` | `hbn` 家族：registry 沒有有效規則 → 回「空 absolute 規則」（不會退到 ddcard／內建） | 無此特例（KV 也移除） | pixel（只在 hbn rules 沒載到時） | 併入 `rules.familyFallback` 實作 |

### A.5 價格（Price*）

| 差異點 | 18節 | 25節 整合版（KV 值） | 影響 | 建議 |
|---|---|---|---|---|
| `PriceRuleEngine.defaultLayouts` | **內建 7 組座標**（doubleCoupon 上下券、vip、creditCardCoupon、freeShippingCoupon、couponCoin、singleCoupon＝centerX 328/centerY 520/rot 12/80px）；rules 沒命中就用它產生價格層 | 空表 → 沒命中就 **不產生** 價格層（console.warn） | **pixel／多一層** | **新增** `price.builtInDefaultLayouts='legacy18'`（表原樣搬入） |
| `PriceColorResolver` | **MS／暖身**：rules `colorRules` 非空時 **完全取代** 內建 4 色（VIP #FF770F／SCS／商城券 #D0011B／全站 #EE4D2D），支援 `keywords[]`，沒對到用 `rules.defaultColor`。**正式**（＝KV）：外部規則先試、再試內建 5 條（多 `全站券`）、支援 `allKeywords` | KV 語意 | **pixel**（商品名含 VIP 但 colorRules 沒列 VIP：暖身用 defaultColor，KV 給橘色） | **新增** `price.colorRulesMode='replace'`（MS／暖身）／`'extend'`（正式／KV） |
| `PriceCouponManager.apply` | 砍掉重建，**無** previousBySlot 記憶 | KV：同 slot 且文字相同時回填舊幾何（含 anchor） | **pixel**：18節 stabilize 的 `rebuildFromPricePreset` 會依「載圖後的商品實際框」重算；KV 會把「產圖當下（未載圖、用 P 框）」算的幾何回填 | **新增值** `price.rebuildMemoryMode='none'` |
| `rebuildFromPricePreset` | MS／暖身：只重建價格，不重跑 hook；正式：重建後重跑 `afterApplyRecordToTemplate`（**不帶** `skipExactLayout`），mall_skbn 走三欄 | KV：重跑 hook 並帶 `{skipExactLayout:true}` | pixel | **新增** `price.rebuildAfterHook='none'`（MS／暖身）／`'full'`（正式）／`'skipExactLayout'`（KV） |
| `findAnchorLayerKey` | isLogo 多判 `會員日` | 只 `logo` | pixel（錨點選錯） | 併入 `batch.productLayerExcludeWords` |
| `applyMallSkbnColumns` | 正式：左／中／右三欄各自 `applyForAnchor`，臨時覆蓋 `defaultLayouts` 為 mall 專用比例座標（51px、lineHeight 55.08） | 無（開源版移除） | **pixel（MALL_SKBN）** | **新增模組**（`fbn18` L2905–3118） |
| `classify` | 沒命中且無內建 → 仍回 `defaultLayouts.singleCoupon` | 同，但表為空 | 同第一列 | 同第一列 |
| 其餘（`PriceLayerFactory / PriceTransformEngine / PriceLayoutResolver / PriceParser / resolveLayoutForAnchor / resolveTemplateRule`） | ＝KV 逐字 | `_B` 分支 | 否 | `price.typographyResolver=false`、`doubleCouponAuto=false`、`inheritAnchorRotation=false`、`layerBaselineMode='none'`、`specialCharRanges82=false`、`fitBoxToInk=false`、`syncSeparatePositionScale=false`、`anchorBaseLineHeight=false`、`normalizeDecimalPercent=false`、`rotationHook=false`（全部＝KV 現值） |

### A.6 匯出（ExportManager）

| 差異點 | 18節 | 25節 整合版 | 影響 | 建議 |
|---|---|---|---|---|
| 格式選單 | 只有 **PNG／JPG** 兩顆（無「依規格表」） | 三顆（auto／png／jpg） | UI；但若使用者按 auto 會走 `formatSource` | **新增** `export.formatChoices='pngJpg'`（隱藏 auto）；或 auto→png（§7-2 拍板） |
| 渲染路徑 | 切換 `AppState.activeIndex/template` → `loadImagesForActiveTemplate` → `renderSceneTo(superCtx)`（內含 syncTemplate＋Layout）；**不呼叫 `refreshTemplateFromBatchRecord`** | `activeSwitch`＝切換＋`refreshTemplateFromBatchRecord`（二次套版）；`snapshot`＝clone | **pixel** | **新增值** `export.renderPath='activeSwitchNoReapply'` |
| 超採樣 | 4x 畫 → `drawImage` 縮回 1x（`imageSmoothingQuality='high'`）→ `toBlob(mime, 1)` | 同機制；`export.scaleMode` | 否 | `scaleMode='fixed4x'` |
| 白底／壓縮 | 無；JPG 透明處由瀏覽器補黑 | `whiteFill`、`compressMode` | — | `whiteFill='none'`、`compressMode='none'`、`transparentToPng`：18節沒有此邏輯 → **設 false**（使用者 2026-09-15 決定全開；18節若開會把 PNG 選項下的透明成品… 不影響；只影響 auto，18節無 auto，可維持 true） |
| 檔名 | `<templateId>.<ext>` 放 **zip 根目錄**（無資料夾、無 project、無尺寸後綴） | `export.folderStrategy` 7 種 | folder | **新增值** `export.folderStrategy='flat'`；`stemSource='templateId'`、`multiOutputSizeSuffix=false`、`dedupeOutputName=false` |
| zip 名 | 單張 `18SaleTool_<id>_<ts>.zip`；批次 `18SaleTool_batch_<ts>.zip` | 既有 | filename | `export.zipPrefix='18SaleTool'`、`export.batchZipName='batchTs'` |
| 切圖 | **正式BN**：`C2C_SKBN_APP_NN.jpg` → 追加 `_左/中/右.jpg`（358/484/358 ×360，`alpha:false`）；`C2C_SKBN_PC_NN.jpg` → 400×3 ×110；**只在 JPG 時**、只依檔名 regex | `export.slices` 走 rules `exportConfig.slices`＋`exportCfg.folder` | filename／張數（黃金樣本用 PNG，未覆蓋） | **新增** `export.legacyC2cSkbnSlices=true`（正式BN）；或搬到 rules exportConfig（§7-3） |
| 診斷報告／JSON | 無報告；`exportJSON` 原樣 stringify | 既有 | — | `diagnostics='none'`、`jsonMode='raw'` |
| 匯出後 | 還原 activeIndex、`loadImagesForActiveTemplate`、`App.sync()` | 同 | 否 | (a) |

### A.7 只是超集或 UI（不需旗標）

`HistoryManager`（純 clone 堆疊 ⊂ 25節 tx 模型）、`Inspector / TextEditor / LayerManager / LoadingOverlay / TemplateFilter / TemplateList / SpecOverlayManager / PreviewZoom / Interaction`（無同步引擎，25節以 `interaction.syncMode='none'`、`dropUpload='none'`、`dblclickReplace='none'`、`replaceAssetImpl='none'`、`text.afterEditHook='none'`、`ui.textToolbarMode='plain'` 關閉即可）、`AppState` 欄位、`applyTemplateRuleHook` helpers、`expandRecordVariantsForTemplate`、`renderBatchUI / getBatchGroupTitle`（正式／暖身多 DDM／MS輪播 分組標題，UI）、`getRuleSection` MS 舊全域 fallback（死碑）、`BUILT_IN_PRICE_RULES_BY_FAMILY`（死碼）、正式BN `rules/template-rule-manager.js`（**未被 index.html／manifest 載入，死檔**）、`applyDdCardVipLogoGroup`（正式BN core 內 100 行，**無呼叫端**，死碼；`ddcardVipGroupProxy` 由 rules 寫入、由 CapsuleRuleEngine 讀，這部分要保留）、`shared.rules.js`（4 行空物件）、`themes/ar.theme.js`（`TemplateThemes.AR.background='#FFA200'`，rules 讀）、`style.css`（18節 465/511 行 ⊂ 25節 531）、`index.html`（DOM id 與 25節一致；標題「18節生成工具」→ `ui.toolName`）。

### A.8 需新增進 core 的模組／函式（25節 整合版完全沒有）

| # | 名稱 | 來源檔與行號 | 用途 | 守衛旗標 |
|---|---|---|---|---|
| 1 | 頭巾工單分流：`HEADBAND_SHEET_ROUTES`、`TEMPLATE_ROUTING_CELLS`（讀 `config/template-routing.js`）、`BatchManager.isHeadbandBlockName / hasRouteKeyword / splitHeadbandCopy / readHeadbandRecords / sheetCell / getRouteLogoValue / resolveSheetTemplateRoute` | 暖身BN `core/app.core.js` L55–73（常數）、L3424–3690（8 支函式） | 頭巾 VIP／蝦皮購物 6 張 | `batch.headbandRouting` |
| 2 | `LayoutRuleEngine.applyHeadbandShopeeTitleLine / applyHeadbandVipTitleLine / resolveHeadbandBackgroundWidth / handleLayerBoxApplied` | 暖身BN `core/app.core.js` L971–1253（正式BN L933–1215、MS L906–1188 三支相同） | 頭巾 LOGO＋副標置中、動態底色寬 | rules `headband*TitleLine.enabled`（存在性即可） |
| 3 | `CapsuleRuleEngine.defaultRules` padding 25 ＋ `isMSL1` 膠囊分支 ＋ `ddcardVipGroupProxy` 量寬 | 暖正MS L713–905；正式BN L759–932（各自 CapsuleRuleEngine） | 副標膠囊 | `render.capsuleDefaultPaddingPx`；MS／正式家族判斷 |
| 4 | MS 陰影 pass（Renderer 9 支） | 暖正MS `core/app.core.js` L1189–1330 | 上蓋 VIP LOGO 等陰影 | `render.layerShadowMode='ms18Pass'` |
| 5 | 文字引擎 `legacy18` 三變體（`drawText`＋`splitRichTextRunsByLine/drawRichTextLine`＋color-only `getTextStyleSegments`） | 暖身BN L1254–1580；正式BN L1216–1582；暖正MS L1189–1511（各自 `core/app.core.js` 的 Renderer） | 全部文字 | `render.textEngine='legacy18'`＋`render.styledTextSource` |
| 6 | 素材查找三實作（含 `getTemplateAssetFolderHints`、`pickBestAssetKey`、`getLayerAssetFilenameCandidates`、MS `MS_L1_VIP_LOGO_FILENAME` 嚴格規則、正式 path-pref） | 暖身BN L148–512＋L4117–4150（`getTemplateAssetFolderHints`）；正式BN L153–461；暖正MS L157–420（各自 TemplateLoader） | 素材對應 | `assets.lookupEngine='legacy18*'` |
| 7 | `BatchManager.parseMSL1Rows / extractMSL1FreeShippingTableFields / applyMSRecordFieldsToTemplate / isMSL1TopFullOrangeLogoTitle`（含 `__msFields / __msTemplateName / __msStartRow` 記錄欄位、票券文案拆主副標、VIP LOGO＋LOGO_案型 置中群組） | 暖正MS `core/app.core.js` L3009–3200（`parseMSL1Rows`、`extractMSL1FreeShippingTableFields`）、L3906–3914、L4051–4180 | MS L1 工單（G 欄「名稱」／H 欄「使用公版」表頭） | `batch.msL1Parser=true` |
| 8 | `PriceCouponManager.applyMallSkbnColumns`＋`applyRecordToTemplate` 家族分派（c2c_skbn_app 不產價格） | 正式BN `core/app.core.js` L2982–3040（`applyMallSkbnColumns`）、L3041–3118（`rebuildFromPricePreset`）、`applyRecordToTemplate` 內價格分派段 | 正式 MALL_SKBN／C2C SKBN APP | `price.familyDispatch='legacy18Formal'` |
| 9 | `PriceRuleEngine.defaultLayouts` 7 組內建座標；`getRules` hbn 空規則特例 | 暖身BN `core/app.core.js` L2283–2330 | 沒命中規則時的價格 | `price.builtInDefaultLayouts` |
| 10 | `PriceColorResolver`（replace 語意版） | 暖身BN `core/app.core.js` L2526–2571 | 價格顏色 | `price.colorRulesMode` |
| 11 | `ExportManager.appendC2cSkbnAppSlices / appendC2cSkbnPcSlices` | 正式BN `core/app.core.js` L1989–2060 | JPG 切圖 | `export.legacyC2cSkbnSlices` |
| 12 | `BatchManager.ensureFontsReadyForRender`（字型暖機） | 暖身BN `core/app.core.js` L2986–3008 | 首張文字量測穩定 | `batch.fontWarmup` |
| 13 | `DEFAULT_TEMPLATE`（內嵌 DDcard）＋`ensureTemplatePool / findTemplateForName` 保底 | 暖身BN `core/app.core.js` L38–54 | 沒載 DD Card 時 | `templates.embeddedDefault`（建議 false，見 §7） |
| 14 | `core/word-editor.patch.js`（MS，316 行；覆寫 `Renderer.font / drawText`（有 `letterSpacing` 的層改走逐字繪製、**不處理 rotation 與 textRule.lineHeightPx**）、`Inspector.render / applyTextFromInputs`、Word 工具列事件） | `暖正MS/.../core/word-editor.patch.js` | MS `票券_VIP` CTA_案型（−1.9）、`表格_免運` 兩層（+1）有 letterSpacing → 走補丁路徑 | MS profile `scripts:['core/word-editor.patch.js']`（載在 core 之後；補丁只在 `window.Renderer` 存在時生效） |

---

## B. 暖正MS V0.5（`暖正MS/18節Tool_暖正MS_V0.5`）

### B.1 架構摘要
- core 4743 行、29 個頂層模組（§0）。相對「18節 A 系共同基底」**多**：`BUILT_IN_PRICE_RULES_BY_FAMILY`（死碼）、`MS_L1_VIP_LOGO_FILENAME`、`getRuleSection` 舊全域 fallback、Renderer 陰影 pass 9 支＋`drawTextContent/drawImageContent`、CapsuleRuleEngine `isMSL1` 分支、BatchManager `parseMSL1Rows / extractMSL1FreeShippingTableFields / applyMSRecordFieldsToTemplate / isMSL1TopFullOrangeLogoTitle`；**少**：`expandRecordVariantsForTemplate / normalizeOutputSuffix`（無變體）、`ensureFontsReadyForRender`、`getTemplateAssetFolderHints`、`Renderer.splitRichTextRunsByLine/drawRichTextLine/getTextStyleSegments`（純單色文字）、`ExportManager.canvasToBlob`、`Inspector` 少 24 行（Word 工具列交給補丁）。
- 相對 25節 MS V0.5（6652 行）：25節 MS 是 A 系（`AssetStore/AssetLookup/TextBaselineModel/PriceTypographyResolver/WorkOrderExportArchivePlanner/smart-assets`），與 18節 MS 幾乎無共同方法（去空白 diff 5109 行）；25節 MS 的「上蓋→下蓋歸檔」、`assets.templatePrefixVariants`、`urlExtensionExpand` 等 18節 MS 都沒有。**兩者只有名字相同。**

### B.2 會影響輸出的行為差異（MS 專有；共同基底見 §A）

| 差異點 | 18節 MS | 25節 整合版（MS profile＝A 系） | 影響 | 建議 |
|---|---|---|---|---|
| 工單解析 | `parseMSL1Rows(rows) ‖ parseRows(rows)`：找表頭列「G=名稱、H=使用公版」；每列 H 欄有值開新製作物；A 欄值以 G 欄標籤存進 `fields`；票券列（C 欄券文案／F 欄 CTA／A 欄「小藍標：」）；下一列 A 欄 `logo` 字樣存 LOGO；`表格_免運` 收 `tableRows` 再抽物流價格（蝦皮店到店／隔日到貨／環保無包裝／店到家宅配、蝦皮VIP 列 `｜` 拆左右）；`中標_全橘` 只取「中標題」；下蓋不需文字；記錄帶 `__msFields/__msTemplateName/__msStartRow` | 25節 MS 走 rules sheetParser（`ms-template-rules.js`）＋ AssetSpec | **pixel／filename／json**（`batchRecord` 結構不同） | **新增模組**（A.8-7）＋ `batch.msL1Parser=true` |
| 套版 | `applyMSRecordFieldsToTemplate`：依 `__msFields` 設主標題／中標題／副標題／法務小字／價格／小藍標／CTA 文字；票券文案拆行；`LOGO` 欄含「(蝦皮VIP LOGO)」→ 找 `蝦皮VIP_LOGO.svg`、把 LOGO 與 `LOGO_案型` 文字以 gap 5 整組置中（用臨時 canvas 量寬，字型 `Shopee Noto Sans…` fallback） | 無 | **pixel** | 同上 |
| 主標 `(LOGO)` | `上蓋_全橘` 且主標為 `(蝦皮短影音_LOGO)/(蝦皮直播_LOGO)/(Shopee Prizes_LOGO)` → 保留文字、隱藏交給 rules；其餘 `(logo)` 隱藏主標 | 無 | pixel | `batch.titleLogoTokenHide='ms18'` |
| 輸出前綴表 | HBN／DDC／POPUP／SKBN_PC／上蓋_VIP／票券_VIP／下蓋_VIP，其餘 `templateName` 清理（黃金：`上蓋_全橘_01`、`中標_全橘_01`、`票券_VIP_01`） | 清理公版名 | filename | `batch.outputPrefixTable='legacy18Ms'`（多數落到「清理公版名」，與 25節 相同，但 `票券_VIP`／`上蓋_VIP` 硬表仍需保留） |
| 素材前綴表 | DDC／HBN／POPUP／SKBN | `''` | pixel（MS 公版名不含這些 → 實際 `''`） | 可視為無差 |
| 素材查找 | `legacy18Flat`＋VIP LOGO 嚴格（`findAssetFilename` 與 `findLocalAssetFile` 都有）；URL fallback 多 `assets/素材/` | A 系 `AssetLookup` | pixel | `assets.lookupEngine='legacy18Flat'` |
| 載圖前 Layout | `loadImagesForTemplate` 先 `LayoutRuleEngine.apply` | 無 | pixel（ms_l1 動態圖層才有圖） | **新增** `assets.preApplyLayoutBeforeLoad=true`（MS） |
| 膠囊 | `isMSL1` 分支（`generatedLayers.subtitle_frame.rules`） | 無 | pixel | A.8-3 |
| 陰影 | 陰影 pass | `drawImageShadow` | pixel | A.8-4 |
| 文字 | 純單色、無 ranges；`letterSpacing` 層走 `word-editor.patch.js`（無 rotation／textRule） | A 系 baselineModel | pixel | `render.textEngine='legacy18'`、`styledTextSource='none'`、載入補丁 |
| 價格顏色 | replace 語意 | A 系 | pixel | `price.colorRulesMode='replace'` |
| 預覽／匯出 | `mutatingNoReapply`／`activeSwitchNoReapply`、stabilize 不重跑 hook | snapshot | pixel | §A.1／A.6 |
| 啟動 | `document.write` 同步載 rules、`App.init()` 不等 ready | — | 啟動 | `rules.loadFailurePolicy='continue'`、`boot.abortOnRuleLoadFailure=false` |

### B.3 rules／templates／其他檔案
| 檔 | 判讀 |
|---|---|
| `rules/ms_l1.rules.js`（1720 行，family `ms_l1`，17 個 register 呼叫：上蓋_VIP／常態／獨享／免運／全橘／底橘／蝦皮直營／銀行、下蓋×4、中標_全橘、票券_VIP、表格_免運） | 25節 `rules/MS/ms-template-rules.js` 完全不同（不同活動、不同公版、不同 API：18節用 `resolveRecordTemplateRoute + before/afterApplyRecordToTemplate + applyProgrammaticLayout + textStyleRanges(EDITED_LAYOUT)`）；**只能以 `rules/MS18/` 命名空間另放**，不能合併 |
| `rules/shared.rules.js` | 4 行空物件 `window.SharedTemplateRules`，無行為 |
| `rules/rules.manifest.js` | 只列 `ms_l1.rules.js` |
| `rules/template-rules.loader.js`（118 行） | merge 模式、`document.write` 同步注入、無 `ready` → 整合版用統一 loader＋`rules.registryMode='merge'`、`normalizeLegacy=true` |
| `config/template-routing.js` | 與暖身／正式同一份（頭巾路由）；MS 工單不會命中 |
| `core/word-editor.patch.js` | 見 A.8-14；25節 無對應（25節 MS core 已內建 Word 工具列） |
| `core/product-engine.js`、`renderers/shape-renderer.js` | ＝18節 正式；25節 為超集（product-engine 以 `legacy` 旗標覆蓋；shape-renderer 幾何等價） |
| `templates/*.json`（15 支＋`manifest.json`） | 全部 18節 活動專用；`上蓋_獨享／上蓋_銀行` 帶 `shadow/dropShadow` |
| `assets/` | 有 `素材/` 共用資料夾（URL fallback 用） |

### B.4 建議 profile
```
id: MS18（或 暖正MS_18）, label: 18節 暖正MS V0.5
family: ancestor          ← 以 KV（_B）實作為底，不是 a
sheetHints: ['L1_暖正GD做圖列表', '暖正L1 MS', '新增製作物_暖正L1 MS']
rulesNamespace: rules/MS18/
templatesDir: templates/MS18, assetsDir: assets/MS18
scripts: ['core/word-editor.patch.js']（在 app.core 之後）
flags（與 ancestor 不同者）:
  batch.mergeFillMode=none, batch.matrixParser=false, batch.assetSpecEngineFirst=false,
  batch.genericRowParser=legacy18, batch.headerAliasTable=legacy18, batch.msL1Parser=true,
  batch.headbandRouting=true, batch.explicitTemplateIdRoute=headbandTicket,
  batch.ruleSheetParserMode=mergeAfterGeneric, batch.templateMatchMode=fuzzy, batch.fetchRouteTemplate=true,
  batch.outputPrefixTable=legacy18Ms, assets.templatePrefixTable=legacy18Ms,
  batch.coreSubtitleTextMap=true, batch.titleLogoTokenHide=ms18, batch.productLayerExcludeWords=['會員日'],
  batch.previewMode=mutatingNoReapply, batch.stabilizeAfterHook=none, batch.fontWarmup=true(建議),
  batch.smartAssetIdMode=none, batch.smartAssetApplyPhase=none, smartAsset.engine=none,
  render.textEngine=legacy18, render.styledTextSource=none, render.layerShadowMode=ms18Pass, render.autoLogoShadow=false,
  render.capsuleDefaultPaddingPx=25, render.shapeLegacyTriangleOverride=false, render.shapePsdCornerRadii=false,
  render.productSizingHeightPriority=legacy, render.applyBoxSyncCenterForAllTypes=false,
  assets.lookupEngine=legacy18Flat, assets.preApplyLayoutBeforeLoad=true, assets.afterUploadRefresh=activeOnly, assets.missingDiagnostics=none,
  templates.identityConflict=keepAll, templates.snapshotRestore=false, templates.prepareHook=none, templates.textBaselinePrepare=false, templates.embeddedDefault=false(拍板),
  rules.registryMode=merge, rules.normalizeLegacy=true, rules.familyFallback=ddcard, rules.headbandFamilyHardcode=true, rules.loadFailurePolicy=continue, boot.abortOnRuleLoadFailure=false,
  price.builtInDefaultLayouts=legacy18, price.colorRulesMode=replace, price.rebuildMemoryMode=none, price.rebuildAfterHook=none,
  price.layerBaselineMode=none, price.typographyResolver=false, price.syncSeparatePositionScale=false, price.specialCharRanges82=false,
  export.formatChoices=pngJpg, export.renderPath=activeSwitchNoReapply, export.scaleMode=fixed4x, export.whiteFill=none, export.compressMode=none,
  export.folderStrategy=flat, export.stemSource=templateId, export.zipPrefix=18SaleTool, export.batchZipName=batchTs, export.diagnostics=none, export.jsonMode=raw,
  interaction.*=none/plain, text.afterEditHook=none, ui.toolName=18節生成工具
```

---

## C. 暖身BN V5.11（`暖身BN/18節_暖身BN_Tool_V5.11`）

### C.1 架構摘要
- core 4789 行。相對共同基底 **多**：`ensureFontsReadyForRender`、`getTemplateAssetFolderHints`（BatchManager）、`TemplateLoader.getLayerAssetFilenameCandidates / pickBestAssetKey / findLocalAssetFileGlobal`、`AppState.assetFilesByFolder`、`Renderer.splitRichTextRunsByLine / drawRichTextLine`、`App.init` 等 rules ready；`fields` 多 `樣式／大標題／小黃標`（OPS BN）。**少**：正式BN 的 MALL SKBN／SCBN／C2C 切圖／`textStyleRanges` 色段／CTA 箭頭硬畫。
- 相對 25節 暖身BN V1.5（6871 行）：25節版是 A 系（`warmup-placement-presets`、`SpecialBlockParserPolicy`、`AssetLookup`…），去空白 diff 4971 行；**共同的只有 `PriceParser/PriceLayoutResolver/PreviewZoom/DOM` 等小模組**。

### C.2 會影響輸出的行為差異（暖身專有）
| 差異點 | 18節 暖身 | 25節 整合版 | 影響 | 建議 |
|---|---|---|---|---|
| 文字色段 | 只畫 rules 寫入的 `richTextRuns`（`seller_bn.rules.js` 透過 `shared/text-highlight-engine.js` 產生）；**忽略 JSON 內 `textStyleRanges`**（`02_Seller BN_*.json` 27 處、`10_Seller BN_高單券…json`、`ar_large_bn.rules.js` range 68px vs 層 76px） | legacy 引擎會畫 ranges（色＋字級） | **pixel（Seller BN 4 張、AR Large BN 2 張）** | `render.styledTextSource='richTextRuns'` |
| 素材查找 | `legacy18FolderHint`：資料夾提示（公版名去編號 vs 資料夾去編號；前綴表 `10_IG / 11_GAME BN / 12_直播大廳BN / 13_MS輪播 BN / ME PAGE / OPS_BN`）→ `pickBestAssetKey` → 全域 | — | pixel | `assets.lookupEngine='legacy18FolderHint'` |
| KV_BG 慣例 | `kv_bg` 層先試 `<公版名>_KV_BG.png`（頭巾共用 `頭巾_KV_BG.png`） | 無 | pixel（背景換圖） | **新增** `assets.kvBgConventionCandidates=true` |
| 表頭 | 多 `樣式／大標題／小黃標`，`hasCoreFields` 含之 | — | pixel（OPS BN 5 張） | `batch.extraFields=['樣式','大標題','小黃標']` |
| 形狀 | `shape-renderer` 四角各自半徑（`keyOriginRRectRadii`）、`layer.rotation` 優先 | 有旗標 | pixel | `render.shapePsdCornerRadii=true`、`render.shapeRotationSource='corners'` |
| 字型暖機 | 有 | 無 | pixel（穩定度） | `batch.fontWarmup=true` |
| 啟動 | rules 任一失敗 → alert 停止 | — | 啟動 | `rules.loadFailurePolicy='reject'`、`boot.abortOnRuleLoadFailure=true` |
| 家族 fallback | 無 `ms_carousel_bn` rules → `13_MS輪播 BN` 落 `ddcard` 家族 | null | **pixel（MS輪播BN_01）** | `rules.familyFallback='ddcard'` |
| 商品圖選欄 | 單商品層 `img2 ‖ img1` | 同 | 否 | — |

### C.3 rules／templates
| 檔 | 判讀 |
|---|---|
| 13 支 `*.rules.js`（ddcard 1245／hbn 1124／ig／large_bn／popup（4 個 family：popup、popup_vip、popup_scs…）／skbn_pc／skbn_app／headband_VIP／headband_shopee／scbn／ar／ar_large_bn／ops_bn／me_page／seller_bn） | 與 25節 `rules/暖身BN/01_頭巾_rules.js…12_Mepage_rules.js` **同 family 名（ddcard、hbn、popup、headband…）但內容、公版、活動全不同**；且 18節 rules 依賴 core 的 `headbandShopeeTitleLine/headbandVipTitleLine`、`richTextRuns`、`parseSheetBlocks + handledProductNames`、`createVariantRecords`。→ 必須 `rules/暖身BN18/` 命名空間隔離，不能與 25節 暖身BN 同時載入（merge 模式會把兩邊 rules 淺合併！） |
| `rules/shared/template-rule-utils.js`（75 行） | ＝25節 整合版 `rules/shared/template-rule-utils.js` 前 66 行（25節為超集）→ 共用 25節版即可 |
| `rules/shared/text-highlight-engine.js`（82 行，`window.TextHighlightEngine.buildRuns`） | 25節 無 → 放 `rules/暖身BN18/shared/` |
| `rules/shared/title-logo.parser.js`（216 行；正式BN 134 行版本不同） | 25節 無 → 各自放 namespace（兩版 API 不同：暖身多 `splitTitle/measureTextWidth` 匯出） |
| `rules/themes/ar.theme.js` | 9 行常數，兩支相同 → 放 shared |
| `rules/shared.rules.js` | 空 |
| `config/template-routing.js` | 頭巾路由（VIP／蝦皮購物），三支相同 → 整合版需重新讀取 `window.TemplateRoutingConfig`（25節整合版把此檔改成空設定） |
| `templates/*.json` 28 支 | 18節 活動專用；`05_POPUP / 05_POPUP_VIP / 05_POPUP_SCS` 三檔 `templateId` 都是 `POPUP` → 依賴 `findTemplateForRoute` 的「檔名先比」（V5.13） |

### C.4 建議 profile
同 B.4 底稿，差異：`id: 暖身BN18`，`sheetHints: ['暖身BN', '新增製作物_OSP BN']`（黃金分頁 `暖身BN(311發單)`、`新增製作物_OSP BN(42發單)`），`rulesNamespace: rules/暖身BN18/`，`scripts: []`，`batch.msL1Parser=false`、`batch.extraFields=['樣式','大標題','小黃標']`、`batch.outputPrefixTable=legacy18Bn`、`assets.templatePrefixTable=legacy18Bn`、`assets.lookupEngine=legacy18FolderHint`、`assets.kvBgConventionCandidates=true`、`render.styledTextSource=richTextRuns`、`render.layerShadowMode=none`、`render.shapePsdCornerRadii=true`、`render.shapeRotationSource=corners`、`rules.loadFailurePolicy=reject`、`boot.abortOnRuleLoadFailure=true`、`price.colorRulesMode=replace`、`price.rebuildAfterHook=none`、`batch.stabilizeAfterHook=none`、`batch.titleLogoTokenHide=true`。

---

## D. 正式BN V7.4（`正式BN/18節_正式BN_Tool_V7.4`）

### D.1 架構摘要
- core 5160 行。相對共同基底 **多**：`encodeAssetPath`、`rulesReady`（等 loader）、`fields` 多 9 欄（左/中/右 ×3 組）、`readRecordFromRow` 多別名、`Renderer.drawShape` CTA 箭頭硬畫、`getTextStyleSegments / measureTextSegments / drawStyledTextLine`（只認 color）、`CapsuleRuleEngine.measureTextWidth` 的 `ddcardVipGroupProxy`、`PriceColorResolver`＝KV 版、`PriceCouponManager.applyForAnchor / applyMallSkbnColumns`、`rebuildFromPricePreset` MALL 分支＋重跑 after-hook、`BatchManager.applyDdCardVipLogoGroup`（死碼）、`stabilizeTemplateBeforePreview` ddcard 重跑 hook、`ExportManager.canvasToBlob / appendC2cSkbnAppSlices / appendC2cSkbnPcSlices`。**少**：暖身的資料夾提示查找、richTextRuns、字型暖機、四角半徑。
- **這支是 25節 KV V0.2 的直接前身**（Price 系列、`applyRecordToTemplate` 骨架、`renderPreviewGrid`、loader、product-engine 幾乎逐字相同，KV 只多 project／AssetStore／SmartAsset／Snapshot 與「開源版移除」）。
- 相對 25節 正式BN V0.8（A 系）去空白 diff 4900 行，只有名字相同。

### D.2 會影響輸出的行為差異（正式專有）
| 差異點 | 18節 正式 | 25節 整合版 | 影響 | 建議 |
|---|---|---|---|---|
| 文字色段 | `textStyleRanges` 只取 **color**（字級／字重／字型一律用層值）：`c2c_skbn_pc.rules.js` 層 32px／range 38px、`ar_large_bn.rules.js` 層 76／range 68、`05_C2C SKBN PC.json` 3 處色段 | legacy 引擎會換字級 | **pixel（C2C_SKBN_PC 4 張、AR Large BN 5 張）** | `render.styledTextSource='rangesColorOnly'` |
| CTA 箭頭 | `shape.kind` triangle／ctaArrow → corners／框硬畫 | `render.shapeLegacyTriangleOverride` | pixel | `true` |
| MALL SKBN 價格 | `applyMallSkbnColumns`：左/中/右各自錨點、mall 專用 layout（51px／55.08 行高、product-image-ratio） | 無 | **pixel（MALL_SKBN 6 張）** | A.8-8 |
| C2C SKBN APP 價格 | core 不產價格（rules 自行「左圖+左價／右圖+右價」） | core 會 `apply` | pixel（多一層價格） | `price.familyDispatch='legacy18Formal'` |
| SCBN 商品圖 | 單商品層只吃 `商品圖1` | `img2 ‖ img1` | pixel（SCBN 2 張） | `batch.product1OnlyFamilies=['scbn']` |
| DDcard VIP 群組寬 | rules 寫 `ddcardVipGroupProxy/ddcardVipGroupWidth` → 膠囊量寬直接用該值 | 無 | pixel（DDC 含 VIP） | A.8-3 |
| stabilize | `rebuildFromPricePreset`（內含重跑 after-hook，無 skipExactLayout；mall 走三欄）→ ddcard 家族再重跑一次 after-hook | KV：重跑 hook 帶 skipExactLayout | pixel | `price.rebuildAfterHook='full'`、`batch.stabilizeAfterHook='ddcardOnly'` |
| 素材查找 | `legacy18PathPref`（`file.name`＋`webkitRelativePath` 雙 key、路徑含公版名優先） | — | pixel | `assets.lookupEngine='legacy18PathPref'` |
| 價格顏色 | ＝KV `extend` 語意 | KV | 否 | `price.colorRulesMode='extend'` |
| 切圖 | JPG 時 `C2C_SKBN_APP_NN_左/中/右.jpg`、`C2C_SKBN_PC_NN_左/中/右.jpg` | rules exportConfig | filename／張數 | `export.legacyC2cSkbnSlices=true` |
| 表頭欄 | `商品圖_左/中/右、價格_左/中/右、文案_左/中/右` | 25節 `BatchManager_A.fields` 有這些欄，`_B` 沒有 | pixel | `batch.extraFields=[…9 欄]` |
| 啟動 | rules 失敗 warn 後繼續 | — | — | `continue`／`abort=false` |

### D.3 rules／templates
| 檔 | 判讀 |
|---|---|
| 19 支 `*.rules.js`（hbn 2772／ddcard 2288／popup 1776／ar_large_bn 1111／c2c_skbn_pc／c2c_skbn_app／c2c_skbn_nuz_app／c2c_skbn_nuz_pc／mall_skbn／scbn／game_bn／live_lobby_bn／ms_carousel_bn／ig／large_bn／headband_VIP／headband_shopee／ar） | 與 25節 `rules/正式BN/01_HBN_rules.js…06_SKBN NUZ_PC_rules.js` **同 family 名不同內容**（25節 用 `skbn-rule-factory / simple-banner-rule-factory / warmup-placement-presets`，18節 用 EDITED_LAYOUT 內嵌 PSD 圖層快照＋`applyProgrammaticLayout`）→ `rules/正式BN18/` 隔離。與 18節 暖身 也是同名不同內容（hbn 1124 vs 2772、ddcard 1245 vs 2288、popup 708 vs 1776）→ 暖身18／正式18 也必須互相隔離 |
| `rules/template-rule-manager.js`（173 行） | **未載入（index.html／manifest 皆無）**，死檔；其 `TemplateRuleManager` facade 已由 loader 內 11 行 shim 提供。整合版統一 loader 已有 `TemplateRuleManager` |
| `rules/shared/template-rule-utils.js` | ＝暖身＝25節前 66 行 → 共用 |
| `rules/shared/title-logo.parser.js`（134 行） | 與暖身 216 行版 API 不同 → 各自 namespace |
| `rules/themes/ar.theme.js`、`shared.rules.js`、`config/template-routing.js` | 同暖身 |
| `templates/*.json` 17 支＋`manifest.json` | 18節 活動專用 |

### D.4 建議 profile
同 B.4 底稿，差異：`id: 正式BN18`，`sheetHints: ['正式BN', '新增製作物_正式BN']`（黃金 `正式BN(319發單)`、`新增製作物_正式BN(330發單)`），`rulesNamespace: rules/正式BN18/`，`batch.extraFields=['商品圖_左','商品圖_中','商品圖_右','價格_左','價格_中','價格_右','文案_左','文案_中','文案_右']`、`batch.product1OnlyFamilies=['scbn']`、`price.familyDispatch=legacy18Formal`、`price.colorRulesMode=extend`、`price.rebuildAfterHook=full`、`batch.stabilizeAfterHook=ddcardOnly`、`render.styledTextSource=rangesColorOnly`、`render.shapeLegacyTriangleOverride=true`、`assets.lookupEngine=legacy18PathPref`、`export.legacyC2cSkbnSlices=true`、`rules.loadFailurePolicy=continue`、`boot.abortOnRuleLoadFailure=false`、`batch.outputPrefixTable=legacy18Bn`、`assets.templatePrefixTable=legacy18Bn`。

---

## E. 三支 18節 A 系彼此關係（共同基底 vs 各自特有）

```
18節 A 共同基底（≈75%）：
  無合併格補值的 sheet_to_json 解析、頭巾 8 支分流函式、makeOutputPrefix／getTemplateAssetPrefix 硬表、
  DEFAULT_TEMPLATE、切換式預覽／匯出（不二次套版）、4x→1x 匯出、18SaleTool zip、
  KV 版 Price*（+ 7 組內建 defaultLayouts、HBN 空規則特例）、legacy 文字引擎、Capsule padding 25、
  LayoutRuleEngine 頭巾三支、merge 模式 loader、product-engine legacy 高優先。
  ├─ 暖正MS：−變體展開 −richText  +MS L1 parser/套版 +陰影 pass +isMSL1 膠囊 +Flat 素材查找 +Word 補丁 +document.write loader
  ├─ 暖身BN：+richTextRuns +FolderHint 素材查找 +KV_BG 慣例 +字型暖機 +OPS BN 欄 +四角半徑 shape +ready 失敗即停
  └─ 正式BN：+color-only textStyleRanges +CTA 箭頭硬畫 +PathPref 素材查找 +MALL SKBN 三欄價格 +C2C 切圖 +SCBN img1 +ddcardVipGroup
             +PriceColorResolver 改 KV 語意 +rebuild 重跑 hook  → 25節 KV V0.2 由此分支而來
```
共同基底 vs 25節 KV（整合版 `_B` 分支）差異＝§A 各表「新增／新增值」列（約 30 項），其餘以 `family: ancestor` 既有旗標值即可對齊。

---

## 7. 需要使用者拍板的事

1. **缺圖佔位框是否進匯出**：18節 A 系對「沒有 `assetFilename` 的可見 image 層」在匯出圖上也畫白色虛線框＋圖層名；25節 只在預覽畫。三份黃金樣本（195 張）都沒有這種圖層，保留與否不影響零誤差比對。建議：**不保留**（視為 bug），用 25節 `showMissing=false`。
2. **格式選單**：18節 只有 PNG／JPG；整合版有「依規格表」。18節 profile 要 (a) 隱藏 auto 按鈕，或 (b) auto→PNG（黃金樣本等同按 PNG）。建議 (a)。
3. **正式BN C2C SKBN 切圖**：core 內硬編碼（358/484/358、400×3），只在 JPG。要 (a) 原樣搬進 core 加旗標，或 (b) 改寫成 18節 正式BN rules 的 `exportConfig.slices`（但 25節 slices 需 `exportCfg.folder`，會多一層資料夾，檔名路徑會變）。建議 (a) 保零誤差。
4. **內嵌 DDcard 保底範本（`DEFAULT_TEMPLATE`）**：沒載入 DD Card 公版時偷塞一張 531×792 假範本。黃金樣本都有載 DD card。建議 **不搬**（25節 開源版已刻意移除），profile 旗標 `templates.embeddedDefault=false`。
5. **MS `word-editor.patch.js`**：它以 monkey patch 覆寫 `Renderer.drawText`（有 letterSpacing 的層不處理 rotation／textRule.lineHeightPx）。MS 公版 3 個圖層會走這條路。要 (a) 原檔照載（最保險，UI 部分也一起帶進來），或 (b) 只把 drawText 差異併入 `legacy18` 文字引擎的 MS 變體。建議 (a) 先過黃金樣本，再考慮 (b)。
6. **暖身BN 的 rules 載入失敗即停止（alert）** vs 正式／MS 繼續：整合版是否統一為「繼續但顯示警告」？不影響像素，只影響啟動。
7. **`rules.familyFallback='ddcard'`**：18節 找不到家族時一律套 ddcard 規則（例如暖身的 `MS輪播 BN`）。這是 25節 開源版明確移除的行為；要保留（零誤差）還是接受該張改變？建議保留為 18節 A 系旗標值。
8. **第三套實作要不要進 core**：18節 A 系 ≈ KV 前身，可用 `family: ancestor`（`_B`）為底，新增約 30 個旗標值＋14 個模組／函式（A.8）；**不需要**再複製一整套 `_C` 實作。但 Renderer 文字引擎、TemplateLoader 素材查找、BatchManager parseRows 三處差異大，建議以「函式級第三分支」（`drawTextLegacy18`、`findLocalAssetFileLegacy18*`、`parseRowsLegacy18`）掛在 `_B` 內，而非再開一個 lineage。
9. **暖身18／正式18／25節暖身／25節正式 四組 rules 同名 family**（hbn、ddcard、popup、headband_*、scbn、ar…）：merge 模式會把先後載入的同名 family 淺合併 → 必須由 profile 只載自己的 namespace（已有 `rulesNamespace` 機制），並在統一 loader 加「載入前清空 registry」保護。
