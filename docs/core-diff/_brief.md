# 步驟 2 分析共用說明（給分析代理與日後讀者）

## 目標
把 18節 13 個原工具整合成單一入口，**產圖結果零誤差**。整合版以 25節 整合版（`25節Tool_整合版`）為樣板：一份 `core/app.core.js`＋每工具一份 `config/profiles/<代號>.profile.js` 旗標，行為差異全部旗標化，core 只做「加法合併」不刪既有行為。

步驟 2 要回答的問題：**每個 18節 工具，相對於 25節 整合版 core 已經支援的行為，多了什麼、少了什麼、哪裡不同**，其中哪些會影響輸出（像素／檔名／資料夾／格式／session.json），哪些只是 UI 或重構。

## 路徑（bash 沙箱）
- 18節 原工具根目錄：`/sessions/brave-eager-faraday/mnt/#18節專案--#整合版本/`
- 25節 原工具根目錄：`/sessions/brave-eager-faraday/mnt/#25節專案--#整合版本/`
- 25節 整合版：`/sessions/brave-eager-faraday/mnt/#25節專案--#整合版本/25節Tool_整合版/`
  - core：`core/app.core.js`（14780 行，A／B 雙實作＋旗標）、`core/profile-loader.js`、`core/bootstrap.js`
  - 旗標：`config/profiles/_defaults.js`、`config/profiles/<代號>.profile.js`、`config/profiles/flags.registry.json`（120 筆，唯一真相）、`config/profiles/README.md`
  - 25節 步驟 2 報告（旗標命名、模組切法可參考）：`docs/core-diff/00-總覽.md`～`06-price-shared.md`
- 18節 整合版（報告輸出位置）：`/sessions/brave-eager-faraday/mnt/#18節專案--#整合版本/18節Tool_整合版/docs/core-diff/`
- 黃金樣本（含 session.json 可看實際輸出結構）：`18節Tool_整合版/tests/golden/<工具>/<分頁>/`

## 18節 工具 → 25節 最近親戚（core 忽略空白 diff 行數，越小越近）
| 18節 工具 | 資料夾 | 最近親戚 | 備註 |
|---|---|---|---|
| OM_w1 | `外廣OM/18節Tool_外廣OM Wave 1_V3.8` | 18_OM_w2（35）→ 25_KV（766） | OM w1/w2 幾乎同一份 core |
| OM_w2 | `外廣OM/18節Tool_外廣OM Wave 2_V0.5` | 同上 | |
| LineOA | `LineOA/18節Tool_LineOA_V0.4` | 25_LineOA（120） | 幾乎等於 25節 LineOA V0.5 |
| network | `Affiliate/18節Tool_network_V0.5` | 25_KV（491） | |
| AMS | `Affiliate/18節Tool_Line 購物AMS_V0.5` | 18_ENG（401） | 有 `plugins/product-shadow.plugin.js` |
| 鏡面 | `鏡面/18節Tool_鏡面_V0.1` | 18_跨夜（4）→ 25_KV（1034） | 鏡面／跨夜 同一份 core |
| 跨夜 | `跨夜直播宣傳圖/18節Tool_跨夜直播宣傳圖_V0.9` | 同上 | |
| KV（KOL代播圖） | `KOL代播圖/18節Tool_KOL代播圖_第一單_V0.9` | 18_ENG（797） | 第二單 core 相同；有 HostFitReviewModal／PortraitSyncEngine／200KB 壓縮 |
| ENG | `ENG/18節_ENG_Tool_V0.9` | 18_AMS（401） | 25節 沒有對應工具 |
| MS | `暖正MS/18節Tool_暖正MS_V0.5` | 18_暖身BN（1322） | A 系舊 core（無 AssetStore／__rulesLoadResult） |
| 暖身BN | `暖身BN/18節_暖身BN_Tool_V5.11` | 18_正式BN（1247） | 同上 |
| 正式BN | `正式BN/18節_正式BN_Tool_V7.4` | 18_暖身BN（1247） | 同上；有 `rules/template-rule-manager.js` |

25節 親戚對應資料夾：`外廣OM/25節Tool_外廣OM_wave1_V0.5`、`外廣OM/25節Tool_外廣OM_wave2_V0.4`、`Line OA/25節Tool_LineOA_V0.5`、`Affiliate/25節Tool_network_V0.7`、`Affiliate/25節Tool_Line 購物AMS_V0.6`、`鏡面/25節Tool_鏡面_V0.2`、`跨夜直播宣傳圖/25節Tool_跨夜直播宣傳圖_V0.5`、`KV/25節_KV_V0.2`、`暖正MS/25節Tool_暖正MS_V0.5`、`暖身BN/25節Tool_暖身BN_V1.5`、`正式BN/25節Tool_正式BN_V0.8`。

## 每份報告的固定格式（繁體中文、白話、表格為主）
1. **架構摘要**：該工具 core 的模組清單（頂層 `const Xxx = {` 物件）與行數；與最近親戚／25節 整合版相比多了哪些模組、少了哪些模組。
2. **會影響輸出的行為差異**（必須旗標化或新增進 core）：表格欄位＝`差異點｜18節 行為｜25節 整合版目前行為｜影響（pixel／filename／folder／format／json）｜建議（沿用現有旗標值／新增旗標 名稱＝值／新增模組）`。判斷依據是**實際程式邏輯**，不是行數；重構、註解、變數改名不算。
3. **只是超集或 UI 的差異**（可直接取超集、不需旗標）。
4. **需要新增進 core 的模組／函式**（25節 整合版完全沒有的東西），附來源檔與行號範圍。
5. **rules／templates／renderers／product-engine／smart-assets／modules／plugins 檔案差異**：每個檔案「相同／只多不少／有行為差異（列出）」。
6. **建議 profile**：`family`（a／b／ancestor／新）、`sheetHints`（從該工具工單的有效分頁名推，見 `tests/run-golden/cases.json`）、`rulesNamespace`、需載入的 `coreScripts`。
7. **需要使用者拍板的事**（兩邊行為衝突、無法同時保留、或看不出原意的地方）。

## 注意
- 只讀、不改任何原工具檔案。報告寫到 `docs/core-diff/<編號>-<名稱>.md`。
- 25節 整合版 core 已含 25節 11 工具的所有行為分支；「18節 行為＝某個 25節 工具行為」時，直接指出對應的既有旗標值即可，不必再新增。
- 用 `diff`／`grep`／小型 node 或 python 腳本做機械比對，再對有差異的函式做語意判讀；比對前先去空白。核心函式（`BatchManager.generateFromSelectedSheet`、`applyRecordToTemplate`、`Renderer.render*`、`ExportManager.buildZip`、`TemplateLoader.load*`、`AssetStore`／`AssetLookup`、`sheetToRowsWithMergedFill`、`parseRows`、`findTemplateForName`、格式／檔名／資料夾決策）務必逐一看。
