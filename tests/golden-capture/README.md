# 黃金樣本擷取器（golden-capture）— 18節

用 headless Chromium 跑**原始工具**，走與使用者相同的操作路徑（上傳公版 → 上傳素材 → 上傳工單 → 選分頁/專案 → 預覽檔案 → 下載圖片），把輸出存進 `tests/golden/<工具>/<分頁>[__<專案>]/`。原工具檔案不做任何修改。

沿用 25節 整合版的擷取器，針對 18節 原工具做了以下調整（都只在測試端，見程式內註解）：

| 調整 | 原因 |
|---|---|
| `waitForAppReady` 改等 `TemplateRulesLoader.ready` | 18節 A 系（暖身BN／正式BN／暖正MS）是較舊 core，沒有 `window.__rulesLoadResult` |
| 素材數改讀 `AssetStore` 或 `AppState.assetFiles` | A 系沒有 `AssetStore` |
| `exportFormat` 每工具可設 `auto`／`png` | 5 個工具只有 PNG／JPG 按鈕，`png` 等同使用者按 PNG |
| 自動按下「半身照對不太準」審核視窗的「確認，套用並繼續」 | KOL代播圖 產圖途中會等使用者確認；不調整直接確認＝預設結果，次數記在 `hostReviewAutoConfirmed` |
| 匯出前補 `ExportManager.getTemplateFamily` | KOL代播圖 V0.9 原工具漏了這個函式，按下載會 TypeError（使用者 2026-09-16 確認採此修法，整合版 core 同步修） |
| 新增 `probe` 模式 | 每個分頁試產一次不匯出，用來找有效分頁 |

## 輸出結構

```
tests/golden/<工具>/<分頁>[__<專案>]/
├─ images/            下載 zip 解壓後的原始輸出（含工具附帶的 診斷報告.txt）
├─ session.json       批次全部 template 資料（圖層座標／文字／顏色），供 JSON 層級 diff
└─ capture-meta.json  Chromium 版本、載入的 rule 檔、產出數、警告、審核視窗次數、輸入檔 sha256
```

黃金案例清單在 `tests/run-golden/cases.json`（18 case／625 圖）。

## 執行

```bash
# 相依套件放在 repo 外（避免把 Chromium 二進位塞進 repo）
mkdir -p ~/pw && (cd ~/pw && npm i puppeteer-core@25 @sparticuz/chromium@152.0.0 jszip@3.10.1 xlsx@0.18.5)

export GOLDEN_SOURCE_ROOT=/path/to/#整合版本      # 含 18節 13 個原工具的資料夾
export GOLDEN_WORK_DIR=/tmp/golden-work            # 純 ASCII 路徑（CDP 檔案上傳對 # 與中文路徑失效）
export NODE_PATH=~/pw/node_modules

node capture-golden.js discover --tool 正式BN                              # 列出分頁與偵測到的專案
node capture-golden.js probe    --tool 正式BN --sheets "正式BN(319發單)"      # 試產、回報產出數（不匯出）
node capture-golden.js capture  --tool 正式BN --sheet "正式BN(319發單)"       # 擷取一個分頁
node capture-golden.js capture  --tool ENG --sheet "17th + 18 day KV" --project __ALL__
```

## 渲染環境固定條件

- `@sparticuz/chromium` 152.0.0（HeadlessChrome/152.0.7977.0）、SwiftShader 軟體渲染
- `--disable-gpu --font-render-hinting=none --disable-lcd-text`
- 字型：工具自帶 `fonts/`
- CDN（jszip 3.10.1、xlsx 0.18.5）由攔截器改餵 npm 同版本檔案；只影響工單解析與打包，不影響像素
- 公版／素材以 Unicode 碼位排序餵入，避免作業系統目錄順序影響模糊比對

已驗證同輸入重跑兩次 images 與 session.json 逐 byte 一致（KV_第一單、LineOA）。回歸比對（步驟 5）必須在同一組條件下執行。
