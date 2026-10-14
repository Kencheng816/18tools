# 18節Tool 整合版

把 14 個 18節產圖工具（外廣 OM Wave 1／Wave 2、LineOA、Affiliate network、Line購物 AMS、跨夜 鏡面、跨夜直播宣傳圖、KV、KOL代播圖 第一單／第二單、暖正 MS、暖身 BN、正式 BN、ENG）合成**一份 core、一個入口**，輸出與原工具一致（19 個黃金案例／630 張圖；除 D1 決定的透明像素改存 PNG、以及 2026-10-06 使用者決定在會員日系列開啟的「自動縮小 $ % 折 蝦幣 起」外全部逐 byte 相同；縮小前的樣本保留在 `tests/golden-legacy/`）。

## 使用
1. 直接雙擊 `index.html`（不需伺服器、不需安裝；放到靜態伺服器或 GitLab Pages 也一樣）。
2. 上方「工具」選單挑一個，或按「上傳工單自動判別」：系統依工單分頁名判斷是哪個工具，開工具後這份工單會直接帶進「1. 開始」並選好分頁，不必再上傳一次；同一份工單含多個工具的分頁時（例如外廣工單同時有 Wave1／Wave2／LineOA），會把符合的工具卡片標橘框，請點其中一個。
3. 工具載入後，照 25節 整合版的三區流程操作：1. 開始（工單）→ 2. 公版與素材 → 3. 輸出（預覽、下載、存檔／載回、手動素材、票券型錄）。
   - 文字：雙擊進入編輯，游標在插入點、可點擊定位／拖曳選取；Enter 換行、Ctrl+Enter 或點外面確認、Esc 取消；文字框跟著文字長（不自動換行）。編輯中會浮出文字工具列（字級／粗體／顏色／對齊／行距），打字時自動淡出，Ctrl+/ 切換、右鍵文字層也會叫出、可釘選。
   - 素材：右鍵圖片層（或點空槽）→ 素材庫／上傳／清除／連動；素材庫可搜尋、單擊預覽、雙擊或 Enter 套用、Esc 還原，快捷鍵 L。新圖裁掉透明邊、等比放進原外框、外框貼合，之後可自由縮放。
   - 連動：同版型的同名素材一起移動／縮放（工具列「連動」或 D 可單張斷開）；商品圖動時配對的價格等比跟著，價格單獨動不連動。
   - 換票券（正式BN／暖身BN）：替換或在素材庫預覽票券時，價格依新券種規則重算（單／雙券、顏色；位置參考已用同素材的版位）；規則不認得的素材價格維持原樣。
   - 其他：Shift 多選一起拖、方向鍵微調；KV_BG 預設鎖定（圖層清單可解鎖）；主畫布改動後右側縮圖放開滑鼠就更新。
4. 換工具：上方選單重選；「重新開始」會清空目前工具已上傳的東西；「另開分頁」可把工具頁單獨開在新分頁。網址加 `#tool=<id>`（如 `index.html#tool=正式BN`）可直接開某工具。

> 已知原工具現況（本版照抄、未修）：鏡面規則宣告 PNG 但實際輸出 JPG；AMS 部分輸出檔名含 `*`（Windows 解壓需改名）；LineOA 缺 `templates/POPUP_RESIZE.json`，該類版位會列為未匹配。KOL代播圖 V0.9 原版按下載會出錯（`ExportManager` 缺 `getTemplateFamily`），整合核心以 `export.compressMode=kbColumn` 實作時已補上。

## 結構
```
index.html               單一入口（工具清單、工單自動判別、iframe 載入工具）
app.html                 整合核心頁（?profile=<id>）；core/ modules/ renderers/ smart-assets/ vendor/ config/profiles/ 來自 25節 整合版＋18節 旗標；modules/text-editing-ux.js、text-float-toolbar.js 為 18節 新增的文字編輯體驗
theme-18.css             深色主題覆寫層（2026-10-07 回饋 8）：蝦皮橘單一強調色、8px 網格、統一面板、三種字級、按鈕四態、空狀態、快捷鍵卡；載在 style.css 之後，調主題只動這支
modules/                 互動模組（靜態載入、等 __coreScriptsReady 接線）：素材庫、票券價格重算、診斷彙整（diagnostics-report）＋面板（diagnostics-panel）、快捷鍵卡（shortcut-help）、文字工具、縮圖同步、連動、多選、自動縮小符號…
core/work-order-content-planner.js  下載依「製作內容」分資料夾／檔名規劃（export.folderStrategy=workOrderContent）
rules/<id>/ templates/<id>/ assets/<id>/   已折入工具的規則／公版／素材（namespace 隔離）
launcher/                入口頁的 JS／CSS
config/tools.js          工具登錄表：id、名稱、版本、群組、sheetHints（分頁名關鍵字）
fonts/                   共用字型（14 個工具原本各帶一份、內容相同；工具頁改用 ../../fonts/）
core/legacy18/           A 系（MS／暖身BN／正式BN／KV）函式級覆寫：<id>.spec.json → <id>.overrides.js（自動抽取，勿手改）
tests/golden/            黃金樣本（images/ + session.json + capture-meta.json）；會員日系列為開啟自動縮小符號後的整合版輸出
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
- **待補**：票券型錄內容仍是 25節 的（需 18節 票券清單）；正式BN C2C SKBN 的 JPG 匯出切圖（D8，黃金為 PNG 未覆蓋）；25節 的存檔／手動素材／票券三套 E2E 尚未對 18節 profile 跑。`tools/` 與第一階段回歸 `test:golden` 已於 2026-10-01 移除（原工具仍在 `#整合版本/` 原資料夾）；重抽 A 系覆寫檔時用 `LEGACY18_SOURCE_ROOT` 指向該資料夾。決策紀錄（D1–D14）在 `docs/core-diff/00-總覽.md` 表 4。

## 回歸測試
```bash
npm install                     # 只裝測試相依（工具本身是純靜態網頁，不需建置）
export NODE_PATH=$PWD/node_modules GOLDEN_WORK_DIR=/tmp/golden-work   # 工作目錄須為純 ASCII 路徑
npm run check                   # 不開瀏覽器：工具登錄／字型／黃金案例設定
npm run test:launcher           # 入口頁：上傳工單自動判別 → 工單帶進工具「1. 開始」（http 與 file:// 各一次）
npm run test:click-export       # 互動回歸：A 系＋KOL 逐一點過每張縮圖再下載，確認點選不改變輸出
npm run test:roundtrip          # 存檔往返：儲存存檔 → 新分頁載回 → 再下載，與第一次下載逐 byte 相同
npm run test:core-golden        # 已折入整合核心的案例（有意改輸出時加 --update-golden --update-reason "原因" 重拍基準）（tests/run-golden/cases-core.json）用 app.html 重跑 → 逐 byte／pixelmatch 比對；D1 的 JPG→PNG 另比不透明區
```
比對規則：images/ 每個檔 sha256 相同、檔案清單相同（診斷報告去時間戳後比）；session.json 逐鍵比對，忽略 `role`／`smartAssetId`／`specDriven`／`loadedRuleFiles`／`elapsedMs`。
重做黃金樣本：`tests/golden-capture/README.md`。

## 上傳到 GitHub／GitLab
- **不用 Git LFS**（2026-10-14 起）：字型／素材一旦變成 LFS 指標檔，程式會悄悄用替代字型，輸出就錯了。步驟與「已推過 LFS 怎麼換回來」見 `docs/上傳步驟.md`。
- 防呆：`npm run check` 會掃出任何 LFS 指標檔；工具頁字型載不到時會跳紅色攔截視窗，不會默默用替代字型產圖。
- `.gitlab-ci.yml`：每次 push 跑 `check`；main 分支自動跑 `golden`（其他分支手動）。
