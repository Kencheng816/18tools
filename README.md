# 18節Tool 整合版

把 14 個 18節產圖工具（外廣 OM Wave 1／Wave 2、LineOA、Affiliate network、Line購物 AMS、跨夜 鏡面、跨夜直播宣傳圖、KV、KOL代播圖 第一單／第二單、暖正 MS、暖身 BN、正式 BN、ENG）合成**一份 core、一個入口**，輸出與原工具一致（19 個黃金案例／630 張圖；除 D1 決定的透明像素改存 PNG、以及 2026-10-06 使用者決定在會員日系列開啟的「自動縮小 $ % 折 蝦幣 起」外全部逐 byte 相同；縮小前的樣本保留在 `tests/golden-legacy/`）。

## 使用
1. 直接雙擊 `index.html`（不需伺服器、不需安裝；放到靜態伺服器或 GitHub Pages 也一樣）。
2. 入口頁只有版位卡片（2026-10-29 封測回饋改版，照 SPX 生成器的做法）：點一張卡片就開該工具的獨立頁面。外廣 OM（Wave 1／2）與 KOL代播圖（第一單／第二單）各合成一張卡片，匯入工單時依分頁名自動選定版本。工具頁左上「← 回首頁」回到卡片清單。
3. 工具頁（2026-10-29 改成 Circle 的流程）：公版已內建、開頁自動載好（匯入前不顯示）。頂部列「匯入工單」→ 彈窗拖入工單 Excel（分頁自動打 ✓ 預選）、素材資料夾（可選）→「確認匯入」就一次套用並產生所有版位預覽；要回到上次狀態用彈窗裡的「載入存檔」。頂部列另有「儲存存檔」「下載圖片」（直接依工單規則打包，不再問格式）「重置」，右側 ⚙ 進階模式開啟才會出現「輸出 JSON」。工單有多個專案（ENG）一律全部一起做，右側批次預覽上方用專案分頁切換看。左欄只剩 製作物清單 → 調整 → 圖層。
   - 文字：雙擊進入編輯，游標在插入點、可點擊定位／拖曳選取；Enter 換行、Ctrl+Enter 或點外面確認、Esc 取消；文字框跟著文字長（不自動換行）。編輯中會浮出文字工具列（字級／粗體／顏色／對齊／行距），打字時自動淡出，Ctrl+/ 切換、右鍵文字層也會叫出、可釘選。
   - 素材：右鍵圖片層（或點空槽）→ 素材庫／上傳／清除／連動；素材庫可搜尋、單擊預覽、雙擊或 Enter 套用、Esc 還原，快捷鍵 L。新圖裁掉透明邊、等比放進原外框、外框貼合，之後可自由縮放。
   - 連動：同版型的同名素材一起移動／縮放（工具列「連動」或 D 可單張斷開）；商品圖動時配對的價格等比跟著，價格單獨動不連動。
   - 換票券（正式BN／暖身BN）：替換或在素材庫預覽票券時，價格依新券種規則重算（單／雙券、顏色；位置參考已用同素材的版位）；規則不認得的素材價格維持原樣。
   - 其他：Shift 多選一起拖、方向鍵微調；KV_BG 預設鎖定（圖層清單可解鎖）；主畫布改動後右側縮圖放開滑鼠就更新。
4. 換工具：左上「← 回首頁」重選；「重置專案」會清空目前工具已上傳的東西。直接開 `app.html?profile=<分類 id>`（如 `app.html?profile=正式BN`）可跳過入口頁；舊書籤 `index.html#tool=<id>` 仍會自動轉過去。

> 已知原工具現況（本版照抄、未修）：鏡面規則宣告 PNG 但實際輸出 JPG；AMS 部分輸出檔名含 `*`（Windows 解壓需改名）；LineOA 缺 `templates/POPUP_RESIZE.json`，該類版位會列為未匹配。KOL代播圖 V0.9 原版按下載會出錯（`ExportManager` 缺 `getTemplateFamily`），整合核心以 `export.compressMode=kbColumn` 實作時已補上。

## 結構
```
index.html               入口頁（只有版位卡片；launcher/ 畫卡片，點了開 app.html）
app.html                 整合核心頁（?profile=<分類 id>，或 ?group=<卡片 id> 由工單分頁在卡片的分類裡自動選定）；頂部列＋左欄（製作物／調整／圖層），舊的「1. 開始／2. 公版與素材／3. 輸出」元素保留在隱藏區塊 #legacyControls 供 core／測試綁定；core/ modules/ renderers/ smart-assets/ vendor/ config/profiles/ 來自 25節 整合版＋18節 旗標；modules/text-editing-ux.js、text-float-toolbar.js 為 18節 新增的文字編輯體驗
theme-18.css             深色主題覆寫層（2026-10-07 回饋 8）：蝦皮橘單一強調色、8px 網格、統一面板、三種字級、按鈕四態、空狀態、快捷鍵卡；載在 style.css 之後，調主題只動這支
modules/                 互動模組（靜態載入、等 __coreScriptsReady 接線）：匯入工單彈窗與一次套用（import-flow）、頂部列／進階模式／直接下載（topbar）、批次預覽專案分頁（project-tabs）、素材庫、票券價格重算、診斷彙整（diagnostics-report，四級分類給 診斷報告.txt）＋面板（diagnostics-panel，2026-10-29 改依版位分卡：有問題的版位／沒做出來的／解析資訊）、快捷鍵卡（shortcut-help）、文字工具、縮圖同步、連動、多選、自動縮小符號…
core/work-order-content-planner.js  下載依「製作內容」分資料夾／檔名規劃（export.folderStrategy=workOrderContent；正式BN／暖身BN／MS）
modules/layer-hygiene.js  公版圖層整理（2026-10-30）：參考用圖層（旗標 layers.guideNameKeywords，預設「規範」、暖身BN 加「範圍」）輸出不畫、圖層清單不列；字距單位校正（text.normalizeRawTracking，只有暖身BN）；文字框貼合文字；圖層精準比對
modules/logo-backdrop-controls.js  KOL 代播圖「LOGO 加底色」控制列（規則 logoBackdrop 設定、預設關；在調整面板的品牌 LOGO 區）
modules/adjust-panel.js  「調整」面板上半段（2026-11-02，參考 Circle 編輯器）：目前製作物的文案欄位（公版文字層自動長出、字數、即時進圖層）、品牌 LOGO／商品兩顆按鈕；左欄順序 調整→製作物清單→圖層（進階才顯示）
modules/logo-editor.js  「編輯 LOGO」視窗（比照 Circle logo2-editor）：縮放／拖移／自動底色／圓角，確認烤成 PNG 放回 LOGO 層；原素材與位置存圖層 logoEdit
modules/multi-product.js  工單商品圖欄「A + B」拆多張（旗標 batch.multiProductSplit，暖身BN）：2 張一大一小、3 張三角、其他並排，第一張用原層、其餘 __multiProductOf 複製層
modules/product-composer.js  「編輯商品」合成視窗：底層用 vendor/circle 三支（拖曳縮放旋轉吸附多選 Ctrl+Z／貼地陰影／去背），組合預設、陰影預設開，確認烤成一張 PNG 放回第一個商品層（productCompose 可重編）；匯入產圖後 ≥2 張商品的製作物自動逐張開
modules/coupon-slots.js  券面價格範圍引擎：定義（config/coupon-price-slots.js ＋ 瀏覽器）→ 依券實際框換算價格位置、字級自動塞進範圍、上券（後面那張）價格以遮罩裁切
modules/coupon-slot-editor.js  進階「定義券面案型範圍」視窗：券原圖＋矩形框選（移動／縮放／旋轉）、範例價格預覽、套用／匯出定義檔
modules/manual-override-guard.js  ①任何手動操作（進 HistoryManager）後該製作物「畫面為準」，下載／縮圖不再重套工單；②手動改過的文字／顏色／字級不被規則每次重畫蓋回（包 LayoutRuleEngine.apply）
modules/kv-bank-logos.js  KV 銀行版：工單任何一格等於素材夾圖檔名（svg／png／jpg／webp）就當銀行 LOGO，不再只認寫死名單
modules/layout-by-record.js  商品框版面依工單「商品圖1＋價格」對到規則檔 productLayouts→templateLayouts（旗標 layout.productBoxSources），不再拿輸出名找
tests/run-golden/run-workbook-mutation.js  工單變更耐受測試（npm run test:mutation）：黃金工單 A 換素材／B 整張下移一列／C 同製作物前兩筆對調 再產圖，抓「改工單就出錯」
vendor/circle/            Circle 編輯器原檔（shadow-plugin.js、shadow-layout-receiver.js、erase-editor.js，sha256 與 ionaaaaa.github.io/Circle 線上版逐 byte 相同；只在開合成視窗時載入）
rules/暖身BN/headband.rules.js  01_頭巾 單一公版規則（VIP／蝦皮購物 只切換圖層組，CTA 三版本，檔名 頭巾_01…）；shared/title-variants.js 為 HBN／DD Card 主標三型態（一般／VIP LOGO／蝦皮直營 LOGO）＋底色
rules/<id>/ templates/<id>/ assets/<id>/   已折入工具的規則／公版／素材（namespace 隔離）；templates/<id>/_bundle.js 是內建公版打包檔（npm run bundle:templates 產生，公版 JSON 改了要重跑）
launcher/                入口頁的 JS／CSS
sw.js、core/sw-register.js  線上版 Service Worker（字型 cache-first、頁面 network-first、程式 stale-while-revalidate＋「有新版本」提示）；file:// 與 localhost 不註冊，?sw=1／?sw=0 可強制
config/tools.js          入口頁卡片登錄表：id、卡片文字、群組、profiles（卡片底下的分類；多個時走 ?group=）
fonts/                   內建字型 TTF（保底）。2026-10-29 起工具頁先抓 GitHub raw 的 WOFF2（config/fonts.js，約 8 MB／個，TTF gzip 後 11 MB／個），抓不到、逾時或離線才用這裡的 TTF；開頁有字型載入進度畫面。網址 ?fonts=local 強制用內建、?fonts=<base>/ 換來源
core/legacy18/           A 系（MS／暖身BN／正式BN／KV）函式級覆寫：<id>.spec.json → <id>.overrides.js（自動抽取，勿手改）
tests/golden/            黃金樣本（images/ + session.json + capture-meta.json）；會員日系列（KOL×2／暖身BN／正式BN／MS／KV）為 2026-10-30 公版整併＋符號重排後的整合版輸出（capture-meta.json 的 rebaselined 記錄原因）
tests/golden-legacy/     自動縮小符號之前的原工具樣本（對照用，回歸不讀）
tests/golden-inputs/     黃金樣本用的工單 xlsx
tests/golden-capture/    擷取器（從原工具或整合版走真實操作路徑產圖）
tests/run-golden/        回歸：整合版重跑 cases.json 並與黃金逐 byte 比對
tests/check-tools.js     不開瀏覽器的靜態檢查
docs/core-diff/          步驟 2：13 工具 core 差異分析（給第二階段合併 core 用）
```

| id | 工具 | 原版 |
|---|---|---|
| OM_w1／OM_w2 | 外廣 OM Wave 1／2 | V3.8／V0.5 |
| LineOA | LineOA | V0.4 |
| network／AMS | Affiliate network／Line購物 AMS | V0.5／V0.5 |
| 鏡面／跨夜 | 跨夜 鏡面／跨夜直播宣傳圖 | V0.1／V0.9 |
| KV | KV（Logo+KV 版配） | V1.2 |
| KOL_第一單／KOL_第二單 | KOL代播圖 | V0.9（core 相同，素材不同） |
| MS／暖身BN／正式BN | 暖正 MS／暖身 BN／正式 BN | V0.5／V5.11／V7.4 |
| ENG | ENG | V0.9 |

## 這一版的做法與進度
- **第一階段（完成，已被第二階段取代）**：單一入口＋各工具原 core。
- **第二階段（完成，2026-10-01）**：14 份 core 合併成一份（`app.html`＋`core/`，以 25節 整合版為底）。B 系／V4 世代 10 個工具用旗標控制差異（新增旗標 25 個，見 `config/profiles/flags.registry.json`）；A 系 4 個（暖正 MS、暖身 BN、正式 BN、KV）差異太大，依決策 D2 改用「函式級分支」：`tests/tools/extract-legacy18.js` 依 `core/legacy18/<id>.spec.json` 從原 core 抽出方法原文產生 `core/legacy18/<id>.overrides.js`，core 載入後 Object.assign 蓋到 B 系物件。**19 個黃金案例全部通過**（`npm run test:core-golden`）。14 個工具在整合核心裡都有 25節 的三項功能：`.zip` 存檔／載回、任一圖層清除／手動上傳、票券型錄。
- **封測第一輪（2026-10-29～30）**：入口頁改 SPX 式卡片；工具頁改「公版內建、匯入工單＋素材一次套用」彈窗，舊側欄區塊收進 #legacyControls；頂部列直接下載、進階模式（輸出 JSON／格線／診斷）；字型改抓遠端 WOFF2（內建 TTF 保底）＋Service Worker；自動縮小符號改真正重排。使用者重做 暖身BN 01_頭巾／03_HBN／04_DD Card 與 KOL 公版後逐題確認 18 題（結論見 `rules/暖身BN/headband.rules.js`、`shared/title-variants.js`、`modules/layer-hygiene.js` 檔頭）；黃金重拍，19 案例＋launcher＋click-export＋roundtrip 全綠。順手修正：AMS profile 誤設 `export.folderStrategy=workOrderContent`（改回 rootFolder，輸出檔名回到工單「檔名」欄）。
- **封測第二輪（2026-11-02）**：「調整」面板改 Circle 式（文案／編輯 LOGO／編輯商品）、左欄順序調整→製作物清單、圖層進進階；工單「A + B」多商品自動排版（一大一小／三角／並排）＋商品合成視窗（Circle 的拖曳／陰影／去背原檔，烤成一張圖）、匯入後自動逐張確認。五套回歸全綠。
- **第二輪續（2026-11-03）**：合成視窗五項反饋；Seller BN C2C／Mall 小票券中右對應修正（原工具寫錯，黃金重拍）；工單變更清查→KV 銀行 LOGO 動態、診斷新類別「公版沒有這個圖層」與「刻意略過」（旗標 diagnostics.skipBlocks）、CTA 誤報放寬。
- 2026-11-03 正式BN POPUP 改單一公版（使用者重做 `04_POPUP.json`）：VIP／蝦皮直營 依關鍵字在主標或副標切換 LOGO 組、蝦皮直營 POPUP 開始產出；`popup.rules.js` 拿掉以輸出編號當鍵的 editedLayerLayouts／templateLayouts（改依商品＋價格），黃金重拍。
- **批次 ⑨（2026-11-03）「不使用輸出編號當鍵」**：所有規則檔裡以 HBN_06／DDC_01／POPUP_03／SCBN_01／SKBN_PC_02／IG_01 這種「第幾張輸出」當鍵的設定表，全部改成內容型鍵（`layout_<商品>_<價格>`、`default`／`vipSubtitle`、C2C SKBN 的 `商品圖_左|價格_左|商品圖_右|價格_右`），由工單內容查表（`modules/layout-by-record.js`、各 rules 的 productLayouts variants）；同商品同價格重複的版面併成一組。工單多一筆、少一筆、換順序都不會錯位。順手修到：正式BN 330 HBN-C2C 副標膠囊原本因輸出名誤對到 VIP 版面而空白。新增變更 C「前兩筆對調」耐受測試，一列一筆的工單（暖身BN／正式BN／AMS）全部通過。黃金重拍（311：4 張 1～3px 微調；319：DD card_04；330：HBN-C2C_01 副標修正）。
- **2026-11-04 封測回報**：①進工具頁沒有自動跳出匯入彈窗 → `modules/import-flow.js` 公版載好（群組頁一進來）就自動開一次，關掉不再跳；②匯入後畫面空白 → `app.html` 左欄多了一個 `</div>`，整個 `<main>` 被包進左欄、畫布跑到視窗外（黃金測試只比輸出圖看不出來），已拿掉；`run-launcher` 加版面健檢（左欄／主畫布／縮圖欄要是 `.app-shell` 直接子元素、畫布在視窗內）與「彈窗自動跳出」檢查。
- **2026-11-04 封測回報 批次 ①「調整」面板**：一般模式只留 製作物名稱 → 主標／副標／警語／其他文字（每格附色票）→ 品牌 LOGO → 商品；「文案」小標、「內容」欄拿掉；「選取的圖層／X Y 寬 高／字型／字級」收進進階模式（`#layerFineTune`，標題「圖層微調（進階）」）。順手修：DD card／POPUP 這類規則每次重畫會把主副標顏色、字級寫回預設，面板或畫布工具列改了會跳回去 → `modules/manual-override-guard.js` 把手動改過的字型類屬性在規則跑完後寫回。
- **2026-11-04 批次 ②「編輯商品後價格跟著券」**：價格只跟「券」有關——合成前記下每個價格層相對券的位置／字級比例，確認後依券在合成圖裡的新框等比貼回（`MultiProduct.capturePriceRel／applyPriceRel／rebaseAnchor`，合成視窗與多商品共用）；「還原自動排版」也貼回。多張商品含券（「吹風機 + SCS_雙券」）：先用券那一張跑 core（才會產生價格），排好後價格貼到券的格子、錨點掛在券那一層（拖券價格跟著走）；暖身BN 預覽前會從 pricePresetMeta 重建價格，重建後再貼一次。單一商品的還原改回第一次合成前的素材與框（原本只會還原多張的）。
  順手修到的大洞：**手動改過的東西到下載時全部跳回工單原樣**（core 下載前會重套工單：改字、換素材、合成商品都被洗掉）→ `modules/manual-override-guard.js` 把任何進 HistoryManager 的手動操作標成「畫面為準」（沿用存檔載回的 `__restoreSnapshot` 機制），沒動過的製作物不受影響。新增 `npm run test:edit-flows`（改主標進下載／單一票券合成與還原／多張含券）。
- **2026-11-04 批次 ③「定義券面案型範圍」（進階）**：價格位置改以「券」為準——每一種券（素材檔名）定義一次價格範圍（佔券圖寬高的比例＋角度），產圖、拖動、縮放、合成都依券實際畫出來的框換算，不再靠各公版規則檔的座標（沒有定義的券照舊）。進階模式 → 調整面板商品區「定義券面案型範圍」→ 視窗放券的原圖，矩形工具框出 單券：價格範圍／雙券：上券範圍、下券範圍、上券遮罩（上券＝畫面上方疊在後面那張、下券＝畫面下方疊在前面那張；遮罩框住前面那張蓋到上券的區域，上券價格被蓋到的部分像實際疊券一樣被遮住），可拖動、拉角縮放、旋轉或直接打角度，範例價格即時預覽。「套用」存瀏覽器並立刻重貼所有用這張券的製作物；「匯出定義檔」下載 `config/coupon-price-slots.js` 放進專案一起上 GitHub。`modules/coupon-slots.js`（引擎：包 PriceCouponManager.apply／stabilize 之後套用、Renderer.drawText 做遮罩裁切）、`modules/coupon-slot-editor.js`（視窗）。edit-flows 加第 4 條。
- 2026-11-05：自動縮小符號——價格層的「蝦幣」只在「數字%蝦幣」（18%蝦幣）時縮「%蝦幣」，「蝦幣山」「蝦幣18%」這種不縮（`modules/sp-text-shrink.js`；暖身BN 黃金 3 張重拍）。AMS 輸出檔名 `1029*357` → `1029x357`（旗標 `batch.outputNameSanitize=windowsSafe`）；黃金檔名一律 Windows 安全（`*`→`＊`）；CI 改 ubuntu-22.04＋同一組字型。
- **待處理**：P0-3 工單編號欄位；Seller BN C2C 工單票券欄（全站_95折）由使用者改工單。
- **待補**：票券型錄內容仍是 25節 的（需 18節 票券清單）；正式BN C2C SKBN 的 JPG 匯出切圖（D8，黃金為 PNG 未覆蓋）；25節 的存檔／手動素材／票券三套 E2E 尚未對 18節 profile 跑。`tools/` 與第一階段回歸 `test:golden` 已於 2026-10-01 移除（原工具仍在 `#整合版本/` 原資料夾）；重抽 A 系覆寫檔時用 `LEGACY18_SOURCE_ROOT` 指向該資料夾。決策紀錄（D1–D14）在 `docs/core-diff/00-總覽.md` 表 4。

## 回歸測試
```bash
npm install                     # 只裝測試相依（工具本身是純靜態網頁，不需建置）
export NODE_PATH=$PWD/node_modules GOLDEN_WORK_DIR=/tmp/golden-work   # 工作目錄須為純 ASCII 路徑
npm run check                   # 不開瀏覽器：卡片登錄／字型／黃金案例設定／公版 bundle 同步
npm run bundle:templates        # 公版 JSON 改了之後重新打包 templates/<id>/_bundle.js
npm run test:launcher           # 入口頁：卡片清單與連結；點卡片開工具；?group= 卡片上傳工單後依分頁選定分類（http 與 file:// 各一次；LAUNCHER_SCHEMES=http 可只跑一種）
npm run test:click-export       # 互動回歸：A 系＋KOL 逐一點過每張縮圖再下載，確認點選不改變輸出
npm run test:roundtrip          # 存檔往返：儲存存檔 → 新分頁載回 → 再下載，與第一次下載逐 byte 相同
npm run test:edit-flows         # 手動編輯流程：改主標要進下載；編輯商品把券縮 0.6 倍價格要跟著縮、下載看得到、還原回原狀；多張含券價格貼在券上；券面範圍定義（--only 1|2|3|4 可單跑）
npm run test:mutation           # 工單變更耐受：每案例 原工單／A 換素材／B 下移一列／C 前兩筆對調 各跑一次（--only A|B|C），列「跟基準不一樣」的診斷；C 另比匯出圖整組是否一樣（tests/golden-diff/mutation/）
npm run test:core-golden        # 已折入整合核心的案例（預設 GOLDEN_FONTS=local 只用內建 TTF；GOLDEN_FONTS=<放 WOFF2 的網址>/ 可驗證 WOFF2 輸出零誤差）（有意改輸出時加 --update-golden --update-reason "原因" 重拍基準）（tests/run-golden/cases-core.json）用 app.html 重跑 → 逐 byte／pixelmatch 比對；D1 的 JPG→PNG 另比不透明區
```
比對規則：images/ 每個檔 sha256 相同、檔案清單相同（診斷報告去時間戳後比）；session.json 逐鍵比對，忽略 `role`／`smartAssetId`／`specDriven`／`loadedRuleFiles`／`elapsedMs`。
重做黃金樣本：`tests/golden-capture/README.md`。

## 上傳到 GitHub
- **不用 Git LFS**（2026-10-14 起）：字型／素材一旦變成 LFS 指標檔，程式會悄悄用替代字型，輸出就錯了。步驟與「已推過 LFS 怎麼換回來」見 `docs/上傳步驟.md`。
- 防呆：`npm run check` 會掃出任何 LFS 指標檔；工具頁字型載不到時會跳紅色攔截視窗，不會默默用替代字型產圖。
- `.github/workflows/ci.yml`：每次 push／PR 跑 `check`；main 分支自動跑 `golden`（其他分支到 Actions 頁手動 Run workflow）。GitHub Pages 用 Settings → Pages →「Deploy from a branch」（main / root）。
