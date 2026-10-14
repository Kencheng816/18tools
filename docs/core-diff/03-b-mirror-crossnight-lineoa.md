# 03-b — 18節 鏡面／跨夜直播宣傳圖／LineOA 差異分析（2026-09-16）

比對對象與方法（依 `_brief.md`）：
- 18節 原工具：`鏡面/18節Tool_鏡面_V0.1`、`跨夜直播宣傳圖/18節Tool_跨夜直播宣傳圖_V0.9`、`LineOA/18節Tool_LineOA_V0.4`
- 25節 同名原版：`鏡面/25節Tool_鏡面_V0.2`、`跨夜直播宣傳圖/25節Tool_跨夜直播宣傳圖_V0.5`、`Line OA/25節Tool_LineOA_V0.5`；最近親戚 `KV/25節_KV_V0.2`
- 25節 整合版：`25節Tool_整合版/core/app.core.js`（int25）＋ `config/profiles/*`
- 方法：core 先切成頂層模組（忽略空白指紋），只對指紋不同的模組做逐行語意 diff；非 core 檔用去空白 diff；黃金樣本 `tests/golden/<工具>/<分頁>/session.json` 反查資料實際有沒有走到那條分支。

## 0. 一頁總結

| 工具 | 血緣 | 一句話 |
|---|---|---|
| 鏡面 V0.1 | **KV 系（ancestor）**：core ＝ 25節 KV V0.2 core ＋ 13 處修改（其中 6 處影響輸出）。**不是** 25節 鏡面 V0.2 的親戚（25節 鏡面 是 LineOA 系 B core，差 2713 行） | 拿 25節 整合版的 **KV profile 當底**，再蓋鏡面的匯出旗標（kLimit／mirror 診斷／白底 jpg／略過缺素材），並新增 4 個旗標（公版同名資料夾素材查找、clone 縮圖、診斷 workflow 鍵、單張匯出不受影響）。 |
| 跨夜 V0.9 | 與 18節 鏡面 **同一份 core**，只差 4 行（2 處字串／條件，見 B-0） | 同上；額外要一份「無描邊內縫、忽略 fillEnabled、但有自訂多邊形頂點＋pathBounds 優先」的 shape-renderer 變體，以及 `record.__ctaMode='text'` 跳過 CTA 圖層的加法邏輯。 |
| LineOA V0.4 | **＝ 25節 LineOA V0.5 core ＋ 120 行純加法**（8 個功能點，0 刪改） | 拿 25節 整合版 **LineOA profile 直接用**，加 3 個素材查找旗標（VIP 特例改字幹精準、去副檔名字幹模糊、圖層級 assetProject 優先）；其餘 5 點是 opt-in 或 UI，直接加進 core 不需旗標。 |

黃金樣本覆蓋：鏡面 8 張（全 JPG）、跨夜 21 張（jpg/png 混合、含 K 數壓縮）、LineOA 9 張（選單 jpg／推文 png；POPUP_RESIZE 兩筆 unmatched）。

---

## A. 鏡面（`鏡面/18節Tool_鏡面_V0.1`）

### A-1 架構摘要

core 6623 行，56 個頂層模組。模組清單與行數（★＝與 25節 KV V0.2 不同）：

```
$ qs qsa clone round normStr getRuleSection escapeHtml encodeAssetPath scheduleBlobRevoke showToast
decodeHashUnicode normalizeAssetStemExact normalizeLayerIdentifier SVG GLOBAL_VECTOR_RULES EMBEDDED_ASSETS
★AppState(32)  ALL_PROJECTS_VALUE ASSET_POLICY classifyAssetRole getAssetPolicy imageLoadCache
★AssetStore(69)  activeLayerKey activeLayer DOM ctx
★HistoryManager(107)  ★TemplateLoader(546)  Geometry(113)  AssetSyncHub(21)  ★SpecOverlayManager(231)
CapsuleRuleEngine(166) LayoutRuleEngine(135)  ★Renderer(648)  LayerManager(68)  ★Inspector(118)  ★TextEditor(136)
PreviewZoom(45)  ★ExportManager(473)  TemplateFilter(141)  ★TemplateList(24)  LoadingOverlay(111)
PriceRuleEngine(224) PriceColorResolver(49) PriceLayoutResolver(26) PriceParser(22) PriceLayerFactory(75)
PriceTransformEngine(129) PriceCouponManager(207)  ★BatchManager(2014)  ★Interaction(274)  ★App(220)  rulesReady(12)
```

| 相比 | 多的模組 | 少的模組 | 備註 |
|---|---|---|---|
| 25節 KV V0.2（最近親戚，忽略空白 diff 1034 行） | 無（同 56 個模組） | 無 | 13 個模組指紋不同，逐一看過：**只有 6 處改變輸出**（A-2），其餘是 UI／互動／重構 |
| 25節 鏡面 V0.2（同名工具，diff 2713 行） | 無 | `TextBaselineModel`、`SnapshotManager`、`normalizeIdentityLoose`、`resolveTemplateFolderName`、`getAssetLookupScope`、`TOOL_NAME`、`OUTPUT_NAME` | 25節 鏡面 是 LineOA 系（B）core；18節 鏡面 是 KV 系。文字引擎、價格、素材查找、公版載入全都不同版本，**不能拿 25節 鏡面 profile 當底** |
| 25節 整合版 core | 無 | — | int25 已含 KV 全部分支（ancestor family）。18節 鏡面 需要 int25 **沒有的**東西見 A-4 |

不在 core 的檔案：`renderers/shape-renderer.js`(626)、`core/product-engine.js`(87)、`smart-assets/*`(1349+21)、`modules/*`(191+353+160)、`dom-editor-plugins/*`、`core/png-quality-compressor.js`(385)。實際使用狀況見 A-5。

### A-2 會影響輸出的行為差異（以「int25 ＋ KV profile」為對照）

| # | 差異點 | 18節 鏡面 行為 | 25節 整合版目前行為（KV profile） | 影響 | 建議 |
|---|---|---|---|---|---|
| 1 | **素材查找納入「公版同名資料夾」**（`TemplateLoader.resolveTemplateAssetFolders` L537；`findLocalAssetFile` L775 傳 `preferredFolders`；`AssetStore.getFlatForLookup` L207 先加這些 bucket，再 共用素材 → 根目錄 → 其他資料夾） | 從 `sheetTemplateRoute.sourceTemplateId / canvas.templateId / source.psdName / batchSourceTemplateId / templateId`（去副檔名）湊出資料夾名清單，**優先**在 `assets/<公版名>/` 找。黃金樣本素材就放在 `assets/人名標/人名標_KV_BG.png` 這種結構、專案為空字串 → 靠這條才找得到 KV_BG（背景屬專案鎖定角色，KV 不跨資料夾 fallback） | `flatFuzzy`：目前專案 → 共用素材 → 根目錄 → 跨專案 fallback（背景類不 fallback）。**專案為空時找不到 `assets/人名標/…`** | pixel（背景整張缺） | **新增旗標 `assets.templateFolderPreferred=true`**（flatFuzzy 之上加公版資料夾優先，不排除其他來源；與 25節 鏡面 的 `flatFuzzyScoped`「strict 只找同名資料夾」不同，不能共用） |
| 2 | **內建素材 URL 候選多一組 `./assets/<公版名>/<檔>`**（L725–747，`pushUrl` 去重） | 順序：`assets/<專案>/<檔>` → `assets/<專案>/<公版名>/<檔>`（每個公版名）→ `assets/<公版名>/<檔>` → 共用素材 → 根目錄 | 只有 `assets/<專案>/<檔>`、`assets/<專案>/<單一公版名>/<檔>`、共用素材、根目錄；公版名取 `sheetTemplateRoute.sourceTemplateId||templateId`（單一） | pixel（file:// 或 http 開、未上傳素材時） | **新增旗標 `assets.urlTemplateFolderCandidates=true`**；黃金樣本走上傳素材，這條在測試時不會被走到，但整合版雙擊開啟時會 |
| 3 | **匯出格式決策** `ExportManager.resolveTemplateFormat` L2720：手動 png/jpg → `__workflow==='crossnight-live-promo'` 才看 `__specFormat` → `__multiSizeSync`→jpg → 其餘查「素材規格表」（`__media||batchProject`＋尺寸），查不到 **jpg** | 鏡面 record 帶 `__workflow:'mirror-418'`、`__specFormat:'png'`，**但 core 不理 mirror 的 `__specFormat`**，掉到規格表 → 黃金樣本 8 張全是 **JPG**（診斷報告也寫 JPG）。與工具說明「鏡面全部輸出 PNG」矛盾＝18節 鏡面 的既有 bug | `export.formatSource`：KV＝`specTable`（同 18節 實際行為，僅 `item.project` vs `batchProject` 取值來源不同，黃金皆空）；25節 鏡面＝`specFormat`＋`defaultFormat=png` | format | 零誤差要用 **`specTable`＋`multiSizeForceJpg=true`**；是否改成 PNG 見 A-7-1 |
| 4 | **JPG 白底＋不透明畫布**（buildZip：`getContext('2d',{alpha: itemFormat!=='jpg'})`＋jpg 才 `fillRect('#fff')`） | jpg 白底；png 保留透明 | KV＝`export.whiteFill=multiSize`（只多尺寸白底） | pixel | 沿用 **`export.whiteFill=jpg`**（25節 鏡面 值） |
| 5 | **K 數壓縮** `compressCanvasToLimit` L2878：PNG 一律無損、超限只警告；JPG 品質 0.92–1 二分，壓不到就**該張不輸出**寫失敗 | 如左 | KV＝`multiSize150k`；`kLimit` 實作已在 int25（移植自 18節 跨夜 V0.9，逐行相同） | pixel／檔案數 | 沿用 **`export.compressMode=kLimit`** |
| 6 | **缺素材整張略過＋自有診斷報告一律附檔**（`findMissingVisibleAssets` L2764、`buildDiagnosticText` L2859、標題 `'18節鏡面－診斷報告'`；沒有任何成功也照樣產 zip） | 如左 | int25 `export.diagnostics=mirror`＋`export.skipMissingAssets=true` 已有；報告格式逐行核對相同，只差【略過／未匹配】區：18節「無 unmatched 就先印『無』再列 skippedRows」，int25「unmatched 與 skippedRows 都空才印『無』」 | filename（zip 內 診斷報告.txt）／文字 | 沿用 `export.diagnostics=mirror`、`export.skipMissingAssets=true`、**`export.diagnosticsTitle='18節鏡面'`**；「無」那一行差異建議 int25 改回 18節 寫法或加旗標（報告內含時間戳，本來就不能逐位元比對，優先度低） |
| 7 | **zip 檔名** `exportVisibleBatch`：非跨夜 → `specDriven ? '18節Tool_network_輸出.zip' : \`18SaleTool_batch_${ts}.zip\``；單張 → `18SaleTool_<tid>_<ts>.zip` | 鏡面實際：`18SaleTool_batch_<ts>.zip` | KV：`zipPrefix=18SaleTool`＋`batchZipName=specDrivenOrBatchTs` → 相同（specDriven 分支 int25 寫死 `25節Tool_network_輸出.zip`，18節 是 `18節Tool_network_輸出.zip`；鏡面不會走到） | filename | 沿用 KV 兩值；specDriven 字串建議改讀 `export.zipPrefix`（屬 KV／network 報告範圍） |
| 8 | **`hasAnyContent`** L4371：`Boolean(record.__workflow) || 標準欄位有值` | 鏡面 sheetParser 每筆都帶 `__workflow` → 全部算有內容 | `batch.recordContentMode`：KV＝`fields`（鏡面 record 沒有標準欄位 → **一筆都不會產**）；`anyField`＝`__workflow` 或任一非 `__` 欄位 | pixel（產不產圖） | 沿用 **`anyField`**（對鏡面資料完全等價；理論差異：沒有 `__workflow` 但有非標準欄位的列 anyField 會產、18節 不會——鏡面規則不會產出這種列）。要絕對精準可加值 `workflowOrFields` |
| 9 | **診斷 `workflow` 鍵** L4349：`diagnostics.workflow = parseResult.workflow || (區塊 templateType 為 crossnight → 'crossnight-live-promo')` | session.json `diagnostics.workflow: 'mirror-418'` | int25 diagnostics 沒有 `workflow` 鍵 | json（session.json） | **新增旗標 `batch.diagnosticsWorkflowKey=true`**（不能無條件加：25節 鏡面 規則也回 workflow，會改 25節 session.json）。run-golden 目前只比圖片，優先度中 |
| 10 | **規則 sheetParser 回 `handled:true` 但 0 筆** L4614：`if (parsed?.handled === true || parsed?.blocks?.length) return parsed` | 鏡面規則對「是鏡面分頁但全被略過」回 `handled:true, blocks:[]` → 直接結束、寫 skippedRows | int25 只看 `blocks.length` → 會再退回通用「製作內容／版位」解析（`batch.genericRowParser=true`），可能產出垃圾記錄或不同的錯誤訊息 | pixel／json（只在全略過的分頁） | **加法修正**：int25 也尊重 `handled===true`（其他工具的 parser 沒回 handled，無影響） |
| 11 | **預覽縮圖不動正式資料** `renderPreviewGrid` L5978 用 `renderThumbnailForTemplate(item.data)` L6086：clone → `refreshTemplateFromBatchRecord(clone)` → 載圖 → 等一幀 → 價格重建＋after hook（skipExactLayout）＋SmartAsset＋PriceTransform＋Layout → 再等一幀 → PriceTransform＋Layout 再跑一次 → 縮圖 | 正式 template 只在「生成」時套版一次，**匯出時** `buildZip` 再 `refreshTemplateFromBatchRecord` 一次（第 2 次套版） | `batch.previewMode`：KV＝`mutating`（切 activeIndex、對正式 template 跑 refresh＋stabilize，匯出時第 3 次套版）；`mutatingGuarded*` 有 Snapshot 保護；`snapshot` 只載圖不套版 | pixel（理論上：規則 hook 若非冪等，套版次數不同會差；`skipExactLayout/preserveGeometry` 設計上是冪等） | **新增值 `batch.previewMode=cloneGrid`** 保險；步驟 5 黃金比對若 `mutating` 也全綠可再合併 |
| 12 | **透明像素改 PNG**（int25「回饋 1」`export.transparentToPng`，預設 true） | 18節 沒有此功能：jpg 就是 jpg | int25 依規則輸出時掃透明像素改存 PNG | format／pixel | 18節 三工具 profile 一律 **`export.transparentToPng=false`**（除非使用者拍板 18節 也要，見 A-7-3） |

**沒有差異、直接沿用 KV profile 值的軸**（m18 與 kv25 指紋相同或差異不影響）：文字引擎 `render.textEngine=legacy`（Renderer 唯一差異是 kv25 **多**了 `styledTextVerticalAlign='source-baseline'` 混合字級分段對齊，18節 資料完全沒有這個屬性，不會走到）、`templates.textBaselinePrepare=false`、`templates.snapshotRestore=false`、Price* 全部（`price.layerBaselineMode=none`、`rebuildMemoryMode=text`、`specialCharRanges82=false`）、`smartAsset.engine=kv`、`batch.smartAssetIdMode=plain`、`batch.smartAssetApplyPhase=beforeLayout`、`render.useProductEngineSizing=true`（`Geometry.getRenderedImageBox` 對**所有** image 圖層都經 ProductEngine，鏡面圖層無 sizing 欄位，結果等於 fallback 但仍要載入）、`rules.normalizeLegacy=true`、`rules.loadFailurePolicy=continue`、`export.stemSource=templateId`（批次時 templateId 已被改成輸出名）、`export.folderStrategy=specBanner`、`export.scaleMode=multiSize2x`、`export.jsonMode=raw`、`batch.explicitTemplateIdRoute=omWave1`、`assets.urlCommonFolder=always`、`ui.assetReviewMode=live`。

### A-3 只是超集或 UI 的差異（直接取超集）

| 模組 | 內容 | 說明 |
|---|---|---|
| `HistoryManager` L290–396 | 每個版位各自一組 undo/redo 堆疊（WeakMap）、`pushSnapshot`、`restore(direction)`、同步舊欄位 `syncLegacyState`；復原後只重畫目前版位縮圖（`markTemplatePreviewDirty`）不整批重跑 | 互動 |
| `TextEditor`／`Inspector` | `AppState.editingOriginalTemplate` 記編輯前快照；文字實際變更才 `HistoryManager.push` 並標 `layer.__manualTextEdited=true`；`Inspector.applyTextFromInputs` 改成先算 next 再比對 changed | 互動；`__manualTextEdited` 由 `mirror.rules.js` L190 讀（重套時保留手改），int25 已有同名旗標（跨夜 `markManualTextEdited`），**只需把 18節 在 Inspector／TextEditor 兩處也設旗標補上** |
| `BatchManager.notifyTextMetricsChanged` L5275 | 使用者改字級／拖曳／對齊後呼叫規則 hook `afterManualTextMetricsChanged`（`{layerKey, skipExactLayout:true}`）；`applyLabeledFields` 遇 `__manualTextEdited` 記 `manual-override` | 互動；int25 只在改字時觸發同名 hook，建議補齊觸發點（Interaction mouseup／align 按鈕／B I U／字級） |
| `BatchManager.markTemplatePreviewDirty` L5799／`cancelPendingPreviewRefresh` L5793／`getTemplateIndex` L5789 | 180ms 防抖，縮圖加 `.is-stale` 後只重畫髒的版位 | UI |
| `SpecOverlayManager` L1077–1307 | 規範圖改依「原始公版 ID」找 `assets/<公版名>/<公版名>_規範.png`，加 `loadUrl`、`img.decode()`、依公版資料夾鎖定同名檔 | UI（規範圖不匯出）；黃金 consoleErrors 的 404 就是它 |
| `generateFromSelectedSheet`／Excel 上傳 | 上傳後必須手動選分頁（`<option value="">請選擇分頁</option>`、按鈕 disabled）；不再在上傳當下 `detectAndOfferProjectsFromSheet` | UI |
| `Renderer.drawPlacementGuide` | 參考框標籤用圖層名（不寫死 P_範圍） | UI |
| `TemplateList.select` | 先 `TextEditor.commit()`、`HistoryManager.syncLegacyState()` | UI |
| `App.bind` | 對齊／字級／B I U 快捷鍵補 `HistoryManager.push` 與縮圖刷新 | UI |
| `index.html` | 標題／brand「18節鏡面生成工具」；`<script>` 直接列規則檔（無 rules.manifest）；多 `excelBatchBody` 折疊區（core 不用） | `ui.toolName='18節鏡面生成工具'` |

### A-4 需要新增進 core 的模組／函式（int25 完全沒有）

| 來源（`18節Tool_鏡面_V0.1/core/app.core.js`） | 內容 | 放哪 |
|---|---|---|
| `TemplateLoader.resolveTemplateAssetFolders` L537–555 | 由 route／canvas／psdName／templateId 湊「公版資料夾名」清單 | TemplateLoader（共用） |
| `AssetStore.getFlatForLookup` L207–247 的 `preferredFolders` 參數與 `addedFolders` 去重 | 查找優先序插入公版資料夾 | AssetStore，受 `assets.templateFolderPreferred` 控制 |
| `TemplateLoader.loadImagesForTemplate` L722–747 的 `pushUrl`／`templateFolders` 兩段 | URL 候選 | 受 `assets.urlTemplateFolderCandidates` 控制 |
| `BatchManager.renderPreviewGrid` L5978–6060 clone 版＋`renderThumbnailForTemplate` L6086–6100（含 `waitForPreviewFrame` 兩次同步） | 預覽不動正式資料 | `batch.previewMode=cloneGrid` 分支 |
| `BatchManager.generateForCurrentProject` L4349 `workflow` 鍵；L4614 `handled===true` | 診斷／解析流程 | 前者旗標、後者加法 |
| `HistoryManager` 整份 L290–396、`BatchManager.notifyTextMetricsChanged/markTemplatePreviewDirty/cancelPendingPreviewRefresh/getTemplateIndex` L5275–5285、L5789–5815、`Interaction.captureTransformState/hasTransformChanged` L6120–6137 | 互動超集 | 直接加（不影響輸出） |
| `SpecOverlayManager.getSourceTemplateId/getTemplateSpecFolder/loadUrl` L1119–1210 | 規範圖查找 | 直接加（UI） |

### A-5 rules／templates／renderers／product-engine／smart-assets／modules 檔案差異

| 檔案 | 對 25節 KV V0.2 | 對 25節 鏡面 V0.2 | 對 25節 整合版 | 判定 |
|---|---|---|---|---|
| `rules/mirror.rules.js` (222) | KV 無 | 25節 版 259 行：多 `isMergedFill` 略過合併儲存格延伸列、`assetLookup:{scope:'strict'}`、常數抽出；family/workflow 名 `mirror_25`/`mirror-25` vs 18節 `mirror_418`/`mirror-418` | 放 `rules/18_鏡面/`（namespace 隔離） | **有行為差異**（merged fill 略過、strict scope）但屬 18節 規則本身，原樣搬 |
| `rules/shared/template-rule-utils.js` (330) | 相同 | 相同 | 相同 | 相同 |
| `rules/template-rules.loader.js` (129) | V5.0 靜態載入（無 manifest、`ready` 立即 resolve、`loadedRuleFiles:[]`）；只差 `getSheetParsers` 回傳多 `priority` 欄位 | 25節 用 manifest 版 (147) | int25 用 `core/template-rules.loader.js`＋rulesNamespace | 由整合版 loader 取代；`rules.loadFailurePolicy=continue` |
| `rules/Example_Template_rules.js` (32) | 相同 | 25節 已墓碑化 | — | 範例，不載 |
| `config/template-routing.js` (14) | 相同（空 `headbandSheetRoutes`） | 25節 墓碑 | — | 死設定 |
| `templates/*.json`（5 個） | KV 無 | 25節 版行數不同（人名標 120→149、循環動畫底圖 59→80）：25節 多 `textBaselineReference` 之類 B 系欄位 | 放 `templates/18_鏡面/` | **只有 text／image 圖層，沒有 shape、沒有 smartAsset／sizing 欄位** → shape-renderer／smart-assets／product-engine 對鏡面輸出**無影響**（但 KV core 會呼叫 `ProductEngine.getRenderedImageBox`，仍需載入 product-engine） |
| `renderers/shape-renderer.js` (626) | 同 跨夜 18節；與 KV 差 90 行（見 B-5） | 25節 鏡面 已移除 | int25 三版皆不等於 | 鏡面資料無 shape → 載不載都零差異；建議沿用跨夜同一份變體 |
| `core/product-engine.js` (87) | 相同 | 25節 鏡面 已移除 | int25 合併版（旗標 `render.productSizingHeightPriority=legacy`） | 相同 |
| `smart-assets/smart-asset-manager.js` (1349) | 只差 `GUIDE_NAMES` 多 `'文案範圍'`（2 行） | 25節 鏡面 已移除 | `smart-asset-manager.kv.js` 同 KV | 鏡面無此圖層 → 相同；跨夜見 B-5 |
| `smart-assets/product-shadow.engine.js` (21) | 相同 | — | 相同 | 相同 |
| `modules/asset-review-modal.js` (191)／`single-size-asset-sync.js` (160)／`multi-size-asset-sync.js` (353) | 相同 | 25節 鏡面 已移除 | `asset-review-modal.b.js`／`single-size-asset-sync.js`／`multi-size-asset-sync.js` 逐字相同 | 相同 |
| `core/png-quality-compressor.js` (385) | KV 無 | — | — | **index.html 未載入、core 無引用 → 死檔**（K 數壓縮由 core 的 `compressCanvasToLimit` 做） |
| `dom-editor-plugins/*`（7 檔 4035 行） | 同 KV | 25節 已墓碑 | — | index.html 未載入 → 死檔 |
| `style.css` (507) | 相同 | 25節 鏡面 497 | — | 相同 |
| `assets/*.svg` | — | — | 放 `assets/18_鏡面/`（循環動畫底圖 用根目錄 `橫式_USP.svg`、`蝦皮購物18號會員日_LOGO_白.svg`） | 資料 |

### A-6 建議 profile（`config/profiles/鏡面.profile.js`）

```
family: "ancestor"           // 與 KV 同血緣；flags 先套 KV.profile 的 21 個值，再蓋下面
sheetHints: ["418_鏡面", "_鏡面", "鏡面"]      // 工單分頁：111_鏡面／225_鏡面／418_鏡面…；注意「88跨夜_線上宣傳圖鏡面」「2026.618_跨夜鏡面」也含「鏡面」
rulesNamespace: "rules/18_鏡面/"
templatesDir: "templates/18_鏡面", assetsDir: "assets/18_鏡面"
coreScripts: core/product-engine.js, renderers/shape-renderer.<18跨夜變體>.js, core/app.core.js,
             smart-assets/product-shadow.engine.js, smart-assets/smart-asset-manager.kv.js,
             modules/asset-review-modal.b.js, modules/single-size-asset-sync.js, modules/multi-size-asset-sync.js
flags（在 KV profile 之上）:
  batch.recordContentMode = "anyField"              （或新值 workflowOrFields）
  batch.previewMode       = "cloneGrid"             （新值）
  batch.diagnosticsWorkflowKey = true               （新旗標，json）
  assets.templateFolderPreferred = true             （新旗標，pixel）
  assets.urlTemplateFolderCandidates = true         （新旗標，pixel）
  export.whiteFill        = "jpg"
  export.compressMode     = "kLimit"
  export.skipMissingAssets = true
  export.diagnostics      = "mirror"
  export.diagnosticsTitle = "18節鏡面"
  export.transparentToPng = false
  ui.toolName             = "18節鏡面生成工具"
  ─ 沿用 KV：export.zipPrefix=18SaleTool、batchZipName=specDrivenOrBatchTs、formatSource=specTable、
    multiSizeForceJpg=true、stemSource=templateId、folderStrategy=specBanner、jsonMode=raw、
    render.textEngine=legacy、templates.textBaselinePrepare=false、smartAsset.engine=kv、rules.normalizeLegacy=true…
_inapplicable: render.shape*（無 shape 圖層）、smartAsset.multiProductLink／skipHiddenProduct
```

### A-7 需要使用者拍板

1. **鏡面輸出 JPG 還是 PNG？** 18節 鏡面 規則與「套用更新說明」都寫 PNG（`__specFormat:'png'`），但 core 的 `resolveTemplateFormat` 只對跨夜 workflow 讀 `__specFormat`，實際輸出 JPG（黃金 8 張全 .jpg）。零誤差＝維持 JPG（`formatSource=specTable`）；若要修正成 PNG（`formatSource=specFormat`＋`defaultFormat=png`，等於 25節 鏡面 行為）就必須**重做鏡面黃金樣本**。
2. **預覽模式**：`cloneGrid`（18節）vs `mutating`（KV）理論上匯出相同；要不要為此加新值，或先用 `mutating` 跑黃金比對、全綠就不加？建議先加（成本低、可回收）。
3. **`export.transparentToPng`**：25節 決定「所有工具都開」，18節 原工具沒有；13 個 18節 profile 是否一律 false（零誤差），或跟 25節 一起開並接受黃金樣本重做？
4. 診斷報告【略過／未匹配】區「無」的印法兩邊不同（A-2 #6）；報告含時間戳無法逐位元比，是否需要對齊？
5. `png-quality-compressor.js`、`dom-editor-plugins/`、`config/template-routing.js`、`Example_Template_rules.js` 四組死檔：整合版不搬（建議）還是保留？

---

## B. 跨夜直播宣傳圖（`跨夜直播宣傳圖/18節Tool_跨夜直播宣傳圖_V0.9`）

### B-0 與 18節 鏡面 core 只差的 4 行（2 處）

| 行 | 鏡面 V0.1 | 跨夜 V0.9 | 意義 |
|---|---|---|---|
| L2950（`ExportManager.buildDiagnosticText` 標題） | `'18節鏡面－診斷報告'` | `'跨夜直播宣傳圖－診斷報告'` | 診斷報告第一行 → `export.diagnosticsTitle` |
| L4371（`generateForCurrentProject` 的 `hasAnyContent`） | `Boolean(record?.__workflow) \|\| fields…` | `record?.__workflow === 'crossnight-live-promo' \|\| fields…` | 跨夜只認自己的 workflow；因為跨夜工具只載跨夜規則，任何 `__workflow` 都是 crossnight → **對各自資料兩者等價**，一個旗標值即可 |

其餘 6619 行逐字相同，因此 A-2／A-3／A-4 全部適用於跨夜；以下只列跨夜**額外**的東西。

### B-1 架構摘要

core 同 A-1。與 25節 跨夜 V0.5（同名工具，diff 2505 行）相比：25節 跨夜 是 OM_w1 系 B core，多 `BatchDiagnostics`、`LinkSync`、`markManualTextEdited`、`ManualAssetUpload`、`LinkSyncUI`、`TextBaselineModel`、`SnapshotManager`；18節 跨夜 沒有這些，但有 KV 系的舊文字引擎與 `smart-asset-manager`（localStorage 版）。**25節 跨夜 profile（family b）不能當底**，仍以 KV profile 為底。

### B-2 會影響輸出的行為差異（跨夜額外）

| # | 差異點 | 18節 跨夜 行為 | 25節 整合版目前行為 | 影響 | 建議 |
|---|---|---|---|---|---|
| B1 | **`record.__ctaMode==='text'` 跳過 CTA 圖層套素材**（`applyRecordToTemplate` L5454–5472） | 跨夜規則每筆 record 都帶 `__ctaMode:'text'`（CTA 是文字不是圖）→ core 完全不碰 CTA image 圖層、不清 assetFilename、不記 missing | int25 B 路徑沒有 `__ctaMode`：會把工單 CTA 欄文字（如「立即看」）當素材名去找 → 找不到 → **`ctaLayer.assetFilename=''` 把公版 CTA 圖清掉**＋missing 診斷 | pixel（有 CTA image 圖層的公版） | **加法**：B 路徑 `applyRecordToTemplate` 加 `record.__ctaMode==='text'` 判斷（其他工具 record 沒有此鍵，無影響）；不需旗標 |
| B2 | **匯出格式**：`__workflow==='crossnight-live-promo'` → `__specFormat==='png' ? png : jpg` | 黃金：MSBN 輪播 jpg、OA_MSBN png、GAME_BN png、POPUP png、Floating_Icon png、其餘 jpg | `export.formatSource=specFormat`（`__specFormat` jpg/jpeg→jpg、png→png、其他→`defaultFormat`） | format | 沿用 **`specFormat`**＋`defaultFormat=jpg`；`multiSizeForceJpg=true`（18節 `__multiSizeSync`→jpg 在 crossnight 判斷之後，但跨夜 record 不會同時帶兩者） |
| B3 | **K 數上限**：規則 `__kLimitBytes`（140000/200000/245000/300000/450000），jpg 品質 0.92 起二分、png 只警告 | 同 A-2 #5 | `kLimit` | pixel | 沿用 |
| B4 | **zip 檔名**：任一 template 帶 crossnight workflow → 固定 `'18節Tool_跨夜直播宣傳圖_輸出.zip'`；單張匯出 `18SaleTool_<tid>_<ts>.zip` | 如左 | `export.zipPrefix='18節Tool_跨夜直播宣傳圖'`＋`batchZipName=prefixOutput` 可得批次檔名，但單張會變 `18節Tool_跨夜直播宣傳圖_<tid>_<ts>.zip` | filename（僅單張） | 沿用兩旗標；單張差異見 B-7-2 |
| B5 | **shape-renderer**（見 B-5）：自訂多邊形頂點＋`pathBounds` 優先＋不重疊即退回圖層框；**無**描邊內縫、**不**理 `fillEnabled` | 黃金 55 個 shape 圖層：4 個帶 `points`（OA_MSBN 主標題_BG_三角形_左/右，直角三角形）、55 個都有 pathBounds（GAME_BN 的 CTA_BG／CTA_內圈 `geometry.bbox.y≈3200–3500` 錯位，靠 pathBounds 救回）、**CTA_內圈 描邊 6px 白**、1 個 `fillEnabled:false`（CTA_內圈，fill 為 rgba(0,0,0,0) 所以填不填看不出來） | int25 三個 renderer 都不對：`shape-renderer.js`（bboxFirst、無 points → 三角形變正三角、CTA 圓圈畫到畫布外）；`.crossnight.js`（有 points＋pathBounds，但 **`insetBoxForStroke` 會把 6px 描邊圈內縮 3px**，另有 fillEnabled／漸層）；`.ams.js`（貝茲圓角等） | pixel（GAME_BN CTA 圈、OA_MSBN 三角形） | **新增變體或旗標化**：最省事是讓 `shape-renderer.crossnight.js` 讀 `render.shapeStrokeInset`（false 時不內縫）與 `render.shapeFillEnabledMode`（ignore 時照填），並把 `traceJsonShapePath` 的 polygon points 分支補回（18節 有、25節 版沒有；目前遮罩只用 roundedRectangle，補回是超集）。18節 跨夜 profile：`shapeStrokeInset=false`、`shapeFillEnabledMode=ignore`、`shapeBoxSource=pathBoundsFirstOverlap`、`shapeRotationSource=transform`、`shapeCornerCurve=arcTo`、`shapePsdCornerRadii=false` |
| B6 | **`GUIDE_NAMES` 多 `'文案範圍'`**（smart-asset-manager L5；`Renderer._drawLayers` 靠 `SmartAssetManager.isPlacementGuide` 決定「參考框不匯出」） | AR 公版的 `文案範圍`（青色 1px 描邊框）不匯出 | `smart-asset-manager.kv.js` 只認 `P_範圍`；**但 18節 跨夜 規則 L665–666 已對 `文案範圍` 設 `__placementGuide=true`**，`isPlacementGuide` 也認這個旗標 → 走規則就不會畫 | pixel（僅在規則沒跑到時） | 沿用 `smart-asset-manager.kv.js` 即可；若要保險可把 `'文案範圍'` 加進 kv 版 GUIDE_NAMES（25節 KV 公版沒有同名圖層，超集） |

### B-3 只是超集或 UI（跨夜額外）

- `crossnight-live-promo.rules.js` 用到的 core 介面：`helpers.measureTextWidth`（int25 有）、hook `afterApplyRecordToTemplate`／`afterManualTextMetricsChanged`（int25 有，但觸發點少，見 A-3）、`layer.__maskLayerName='P_範圍'`＋`maskLayer.cornerRadii`（int25 `render.maskScope=image` 路徑有）、`layer.dropShadow`（有）、`record.__showImmediateCta`／`__hosts`／`template.__crossnightHostLayout`（規則自己讀寫，core 不認識）。
- `modules/asset-review-modal.js`、`single-size-asset-sync.js`：25節 跨夜 原版沒有，但 int25 已有逐字相同的 `asset-review-modal.b.js`／`single-size-asset-sync.js`（來自 KV／LineOA），列進 coreScripts 即可；`multi-size-asset-sync.js` 用 int25 根目錄那份（＝KV 版），**不是** `.crossnight.js`。
- index.html：標題「18節生成工具」→ `ui.toolName='18節生成工具'`。

### B-4 需要新增進 core（跨夜額外）

| 來源 | 內容 |
|---|---|
| `core/app.core.js` L5454、L5458、L5471 | `record.__ctaMode !== 'text'` 三處判斷 |
| `renderers/shape-renderer.js` L292–312 `resolvePolygonPoints/tracePolygonPoints`、L317–332 `drawPolygon` 自訂頂點、L454–458 `traceJsonShapePath` polygon 分支、L516–553 `boxesOverlap/resolveExportedBox`、L585–593 `createRuleFromJsonLayer` 的 points／useLayerBounds／bbox | 併入 `shape-renderer.crossnight.js` 並旗標化 strokeInset／fillEnabled（B-2 #B5） |

### B-5 檔案差異（跨夜額外；其餘同 A-5）

| 檔案 | 對 25節 KV V0.2 | 對 25節 跨夜 V0.5 | 對 25節 整合版 | 判定 |
|---|---|---|---|---|
| `rules/crossnight-live-promo.rules.js` (780) | KV 無 | 25節 版 `crossnight-live-promo_rules.js` 1208 行：25節 多 `prepareTemplate` hook、主持人佈局（`resolveHostPlaceholders/configureHostSizing/applyHostCentering`）、名牌漸層 `configureHostNameBackgroundGradient`、`COMMON_ASSETS/HOST_ASSET_PROJECT`、`recomputeTextMetricLayouts`；18節 多 `parseOaDdCopy`、`OA_HOST_MASK_CORNER_RADII/HOST_MASK_TEMPLATE_IDS`；`__ctaMode:'text'` 兩邊都有（25節 core 也沒消費，見 B-7-1） | 放 `rules/18_跨夜/` | **有行為差異**，原樣搬 |
| `renderers/shape-renderer.js` (626, V3.29.2) | 差 90 行：**多** points 多邊形、pathBounds 優先＋重疊檢查 | 差 178 行：25節 V3.30.0 **多** `insetBoxForStroke`、`isFillEnabled/fillIfNeeded`、`createFillGradient`、`startAngleDeg`；**少** `traceJsonShapePath` 的 points 分支 | `shape-renderer.js` 差 142、`.crossnight.js` 差 178 | **有行為差異**（B-2 #B5） |
| `smart-assets/smart-asset-manager.js` (1349) | 差 2 行（GUIDE_NAMES） | 25節 跨夜 1690 行（B 系 session baselineStore 版，差 1203 行） | `.kv.js` 差 2 行 | 只多不少（B-2 #B6） |
| `modules/multi-size-asset-sync.js` (353) | 相同 | 25節 跨夜 390（差 81） | 根目錄版相同 | 相同（用 KV 版） |
| `templates/*.json`（9 個） | — | 25節 版全部行數不同（AR 1675→1698、HBN 2012→2823…） | 放 `templates/18_跨夜/` | 資料 |
| `style.css` (507) | 相同 | 25節 跨夜 532 | — | 相同 |

### B-6 建議 profile（`config/profiles/跨夜.profile.js`）

```
family: "ancestor"；flags 同 A-6 再改：
  export.zipPrefix        = "18節Tool_跨夜直播宣傳圖"
  export.batchZipName     = "prefixOutput"
  export.formatSource     = "specFormat"      export.defaultFormat = "jpg"
  export.diagnosticsTitle = "跨夜直播宣傳圖"
  ui.toolName             = "18節生成工具"
  render.shapeBoxSource   = "pathBoundsFirstOverlap"
  render.shapeStrokeInset = false            render.shapeFillEnabledMode = "ignore"
sheetHints: ["418跨夜_線上宣傳圖", "跨夜_線上宣傳圖", "跨夜"]
rulesNamespace: "rules/18_跨夜/"；templatesDir/assetsDir: 18_跨夜
coreScripts: core/product-engine.js, renderers/shape-renderer.crossnight.js（旗標化後）, core/app.core.js,
             smart-assets/product-shadow.engine.js, smart-assets/smart-asset-manager.kv.js,
             modules/asset-review-modal.b.js, modules/single-size-asset-sync.js, modules/multi-size-asset-sync.js
```

### B-7 需要使用者拍板（跨夜額外）

1. **`__ctaMode='text'`**：25節 跨夜 規則也寫這個鍵、但 25節 core 沒消費（25節 跨夜 的 CTA 圖層若存在，會被清掉再靠規則補）。把判斷加進 B 路徑後，25節 跨夜 的行為也會變（不再清 CTA 圖）→ 需跑 25節 跨夜 黃金確認；或改成 18節 專用旗標 `batch.ctaTextModeSkip=true`。
2. **單張匯出 zip 名**：18節 跨夜 批次固定 `18節Tool_跨夜直播宣傳圖_輸出.zip`、單張 `18SaleTool_<tid>_<ts>.zip`（兩套前綴）。整合版 `zipPrefix` 只有一個：接受單張改名，或加 `export.batchZipFixedName`？黃金只測批次。
3. shape-renderer 走「旗標化 `.crossnight.js`」還是「另存第四份 `.crossnight18.js`」？前者少一份檔但要驗 25節 跨夜 黃金。

---

## C. LineOA（`LineOA/18節Tool_LineOA_V0.4`）

### C-1 架構摘要

core 7302 行，58 個頂層模組＝25節 LineOA V0.5 的 56 個 ＋ `activeThumbRefreshTimer`、`scheduleActiveThumbRefresh`（L326–334）。忽略空白 diff **120 行、全部是加法**（無刪除、無改寫既有分支）；指紋不同的模組：`ctx`（HistoryManager.push 後掛防抖）、`HistoryManager(+1)`、`TemplateLoader(+44)`、`Renderer(+8)`、`Inspector(+4)`、`TextEditor(+1)`、`ExportManager(+25)`、`BatchManager(+9)`、`App(+1)`。25節 整合版 LineOA profile（family b）可直接當底。

### C-2 會影響輸出的行為差異（8 點逐一判斷）

| # | 差異點（`18節Tool_LineOA_V0.4/core/app.core.js`） | 18節 行為 | 25節 整合版目前行為 | 影響 | 黃金有沒有走到 | 建議 |
|---|---|---|---|---|---|---|
| L1 | **`TemplateLoader.applyCanvasHeightFit`** L539–553，於 `loadImagesForTemplate` 三處載圖成功後呼叫（L765/L780/L824） | 圖層帶 `__fitCanvasHeightToImage:true` → 畫布高＝畫布寬×圖高寬比、圖層鋪滿 | 無 | pixel／json（畫布尺寸） | **沒有**：只有 `POPUP_RESIZE` 公版用，而 `templates/` 裡**沒有 POPUP_RESIZE.json**（黃金 2 筆 unmatched「沒有載入 POPUP_RESIZE 公版」） | 加進 core，圖層旗標 opt-in，不需旗標 |
| L2 | **`findLocalAssetFile` 圖層級 `layer.assetProject` 優先** L853 | `options.layer.assetProject` 非空就用它當查找專案 | 用 `options.project`（`loadImagesForTemplate` 呼叫時已傳 `layer.assetProject||lookupProject`，所以差異只在「沒帶 project 的呼叫」：匯出原檔直出、規則直接呼叫） | asset | 沒有（POPUP_RESIZE 未載入） | 低風險超集；25節 跨夜／A 系規則也會寫 `layer.assetProject`，保守起見 **新增旗標 `assets.layerAssetProjectFirst=true`** |
| L3 | **蝦皮VIP 特例由 includes 改「去副檔名字幹完全相等」** L927–930 | 找 `蝦皮VIP_LOGO_橘色.svg` 不再被素色 `蝦皮VIP_LOGO.svg` 攔截 | `assets.shopeeVipGuard=true`：`wanted.includes('蝦皮viplogo')` 就回素色 VIP | pixel（07_push 橘色 LOGO） | **有**：0418推文3／0418_M-1推文3／0418_M-2推文3 走 07_push | **`assets.shopeeVipGuard` 新增值 `"stemExact"`**（現有 true/false 改為 `"includes"/"off"/"stemExact"` 三值，或另加 bool） |
| L4 | **模糊比對加「去副檔名字幹」雙向包含（字幹 ≥4 字元）＋評分改「字幹重疊長度優先、再比長度差」** L948–988 | 公版烘 `.png`、實際素材 `.svg` 也能對上；同時命中素色與橘色時較特定者贏 | 只用含副檔名的清理字串 includes；排序只看 `lengthDiff` | pixel（哪個素材被選到） | **有**（同上；也影響所有模糊命中的素材） | **新增旗標 `assets.fuzzyStemMatch=true`** |
| L5 | **`Renderer.drawText` 垂直對齊 `textVerticalAlign`** L2114–2122：`top`＝貼框頂、`bottom`＝框底、其餘置中 | 規則對 `商品_XX_品名` 預設 `top` | 只有 `bottom`（走 `isTextBottomAligned` 的 ink 底線邏輯，優先於 defaultStartY）與 `source-baseline`；`top` 會被當置中 | pixel（品名單行位置） | **有**（03_RM／07_RM／09_RM 品名） | **純超集直接加**：`bottom` 分支在 int25 永遠先被 `bottomAligned` 攔走、18節 也一樣（等價）；`top` 25節 沒有任何規則／公版使用（grep 只有 `source-baseline`）→ 不需旗標 |
| L6 | **匯出原檔直出 `record.__passthroughIfWidth`** L3368–3387 | 帶 `__fitCanvasHeightToImage` 圖層的原圖寬＝指定值 → 原始 File 直接進 zip（副檔名照原檔、檔名 `__outputName||templateId`、資料夾 `__outputRoot`） | 無 | filename／format／pixel | 沒有（POPUP_RESIZE） | 加進 `ExportManager_B.buildZip`，record 旗標 opt-in，不需旗標 |
| L7 | **`__userEditedText`** 由 `Inspector.applyTextFromInputs` L2951 與 `TextEditor.commit` L3068 設；`__userAdjustedVAlign` 由 valign 按鈕設 | 規則（`lineoa_rules.js` L572/L615/L670/L780/L879…）遇旗標保留手改字 | 無此旗標（規則會蓋回工單原文） | 互動後 pixel | 沒有（無互動） | 直接加（只在使用者改字時多一個 `__` 鍵） |
| L8 | **縮圖即時同步**：`HistoryManager.push` 掛 500ms 防抖 `BatchManager.refreshActiveThumb` L6560（走 `refreshThumbsForIndexes([activeIndex])`） | 互動停手半秒縮圖同步 | 無 | UI | 沒有 | 直接加（B 路徑；A 系已有 `interaction.markThumbStale`） |

其餘：`Inspector.render` 多 `#valignGroup` active 同步（L2900）、`App.bind` 多 valign 按鈕事件（L7141）、index.html 多 `#valignGroup` 三個按鈕 → UI；`Inspector.applyTextFromInputs` 改成「值不同才寫」→ UI。

### C-3 只是超集或 UI
上表 L5、L7、L8 與 valign UI。zip 檔名仍是 `25節生成工具_批次輸出_<ts>.zip`／`25節生成工具_<tid>_<ts>.zip`（18節 沒改字串）；標題「18節生成工具」→ `ui.toolName`。

### C-4 需要新增進 core
| 來源 | 內容 |
|---|---|
| L326–334、L337 | `scheduleActiveThumbRefresh`＋`HistoryManager.push` 內呼叫 |
| L539–553、L765、L780、L824 | `applyCanvasHeightFit` 及三處呼叫 |
| L853 | `findLocalAssetFile` 的 `layer.assetProject` 優先（旗標） |
| L927–930、L948–988 | VIP 字幹精準、字幹模糊、`stemOverlap` 評分（旗標） |
| L2114–2122 | `textVerticalAlign` top/middle 分支 |
| L2900、L2951–2954、L3068、L7141 | valign UI、`__userEditedText`、`__userAdjustedVAlign` |
| L3363–3387 | `__passthroughIfWidth` 原檔直出 |
| L6557–6565 | `BatchManager.refreshActiveThumb` |

### C-5 檔案差異

| 檔案 | 對 25節 LineOA V0.5 | 對 25節 整合版 | 判定 |
|---|---|---|---|
| `rules/lineoa_rules.js` (1505) | 25節 1254 行。18節 **多** 8 個函式：`applyChargeTitleStyle`（07_RM 案型逐字樣式／雙中心線）、`applyFeatureBannerToggle`（03_RM 強檔優惠切換）、`applyProductNameVerticalDefaults`（品名預設 top）、`applyVipSplitTitles/resolveVipSplitGroup`（07 系 VIP 拆字）、`layoutInfoGroup`（資訊群組排版）、`measureInkClass`、`normalizePriceText`（價格自動 `$` 千分位）；常數 `POPUP_RESIZE_TEMPLATE_ID/PNG_OUTPUT_TEMPLATE_IDS/CHARGE_*`；**改**了 11 個共同函式（`parse`、`afterApplyRecordToTemplate`、`applyCta`、`applyPopupAsset`、`applyPriceDecorations`、`applyPriceStyledText`、`applyProductCta`、`applyTextLayer`、`applyVipMainCaseRule`、`compactCtaText`、`layoutInfoSection`）；路由表 01/03/07/09（25節 01/02/03/04）；`__outputFormat=png` 給 POPUP／01_push／07_push | 放 `rules/18_LineOA/` | **有行為差異**，原樣搬 |
| `rules/rules.manifest.js`、`rules/template-rules.loader.js`、`rules/shared/template-rule-utils.js`、`rules/shared/sp-text-standard.js` | 相同 | 相同 | 相同 |
| `core/product-engine.js`、`renderers/shape-renderer.js`(562)、`smart-assets/*`、`modules/*`(191/353/160)、`style.css` | **逐字相同** | 對應 LineOA profile 的 coreScripts（`shape-renderer.js`、`smart-asset-manager.b.js`、`asset-review-modal.b.js`…） | 相同 |
| `dom-editor-plugins/*` | 兩邊都是 1 行墓碑（V0.2 已移除）；**兩邊 index.html 都沒有載入** | — | 死檔，不搬 |
| `config/template-routing.js`、`rules/Example_Template_rules.js`、`rules/shared/om-wave1-*.js` | 兩邊都是 1 行墓碑 | — | 死檔 |
| `templates/` | 18節：01_push、03_RM、07_RM、07_push、09_RM、POPUP、Example_Template（**缺 POPUP_RESIZE.json**）；25節：01_push、02_RM、03_RM、04_RM、04_push、POPUP；同名檔行數不同（01_push 11268 vs 10252） | 放 `templates/18_LineOA/` | 資料 |
| `assets/` | 18節 多 `18號會員日_LOGO_白.svg`、`直式_18號會員日_LOGO_白.svg`、`蝦皮VIP_LOGO_橘色.svg`、`直式_USP.svg/.ai` 等 | 放 `assets/18_LineOA/` | 資料 |
| `index.html` | 差 4 處：標題／brand「18節生成工具」、`#valignGroup`、註解 | — | UI |

### C-6 建議 profile（`config/profiles/LineOA.profile.js`）

```
family: "b"；flags ＝ 25節 LineOA.profile 全部 26 個值，再加：
  assets.shopeeVipGuard        = "stemExact"     （新值）
  assets.fuzzyStemMatch        = true            （新旗標）
  assets.layerAssetProjectFirst = true           （新旗標，低風險）
  export.transparentToPng      = false
  ui.toolName                  = "18節生成工具"
  export.zipPrefix             = "25節生成工具"  ← 18節 原字串就是這樣（見 C-7-2）
sheetHints: ["LineOA_wave1", "LineOA", "Line OA"]
rulesNamespace: "rules/18_LineOA/"；templatesDir/assetsDir: 18_LineOA
coreScripts: 同 25節 LineOA（product-engine, shape-renderer.js, app.core.js, product-shadow.engine.js,
             smart-asset-manager.b.js, asset-review-modal.b.js, single-size-asset-sync.js, multi-size-asset-sync.js）
```

### C-7 需要使用者拍板

1. **POPUP_RESIZE.json 遺失**：V0.2／V0.3 說明都寫已補回 `templates/POPUP_RESIZE.json`，但交付的 V0.4 資料夾沒有，黃金因此記 2 筆 unmatched。零誤差＝維持沒有；若補回，L1／L2／L6 三個功能才會真的跑到，需另做 POPUP 黃金樣本。
2. **zip 前綴**：18節 LineOA 匯出 zip 仍叫 `25節生成工具_批次輸出_<ts>.zip`。保留（零誤差、只影響檔名）或改成「18節生成工具」？
3. **`assets.shopeeVipGuard`** 型別從 bool 改三值 enum 會動到 registry 與 25節 LineOA／鏡面 profile 的既有值（true→"includes"、false→"off"），或另開 bool `assets.shopeeVipGuardStemExact`？
4. **L5 `textVerticalAlign='top'`** 直接加不設旗標：25節 沒有任何規則用 `top`，但未來 25節 規則若寫了會立刻生效——可接受？

---

## D. 新增旗標彙總（三工具）

| 旗標 | 型別／值 | 用在 | 影響 |
|---|---|---|---|
| `assets.templateFolderPreferred` | bool（新） | 鏡面／跨夜 true | pixel |
| `assets.urlTemplateFolderCandidates` | bool（新） | 鏡面／跨夜 true | pixel |
| `batch.previewMode` | 新值 `cloneGrid` | 鏡面／跨夜 | pixel（理論） |
| `batch.diagnosticsWorkflowKey` | bool（新） | 鏡面／跨夜 true | json |
| `batch.recordContentMode` | 沿用 `anyField`（可選新值 `workflowOrFields`） | 鏡面／跨夜 | pixel |
| `render.shapeStrokeInset`／`render.shapeFillEnabledMode` | 既有旗標，但要讓 `shape-renderer.crossnight.js` 真的讀它 | 跨夜 false／ignore | pixel |
| `assets.shopeeVipGuard` | 新值 `stemExact` | LineOA | pixel |
| `assets.fuzzyStemMatch` | bool（新） | LineOA true | pixel |
| `assets.layerAssetProjectFirst` | bool（新） | LineOA true | asset |
| `export.transparentToPng` | 既有，18節 全設 false | 三工具 | format |
| 加法不設旗標 | `__ctaMode==='text'` 跳過 CTA（待拍板）、`handled===true`、`__fitCanvasHeightToImage`、`__passthroughIfWidth`、`textVerticalAlign='top'`、`__userEditedText`、互動縮圖刷新 | — | opt-in |
