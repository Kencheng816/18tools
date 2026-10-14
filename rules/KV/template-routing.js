/* Template Routing Config
 * 工單固定欄位分流設定。
 *
 * V2.0：原「頭巾 VIP / 頭巾 蝦皮購物」路由（headbandSheetRoutes、sheetCells）
 * 已隨對應規則檔（headband_VIP.rules.js / headband_shopee.rules.js）與公版檔
 * 一併移除。
 *
 * kvSheetRoutes：「Logo+KV」工單分頁的版配路由。
 * 採用「關鍵字掃描」而非固定儲存格座標：
 *   1) 在整張工作表逐格找「版配標題」文字（titleMatch）。
 *   2) 從標題格開始，同一欄往下找第一個「內容包含換行」的資料格
 *      （app.core.js 內的 findKvFormBlocks 負責）。
 *   3) 取換行後的最後一段文字，套用到 templateFile 對應公版的副標題。
 *
 * 好處：工單版面調整（欄位搬到別的列/欄）不需要改這裡的座標，
 * 只要「標題文字」跟「內容格有換行」這兩個特徵還在，就能自動找到。
 *
 * titleMatch 兩種模式：
 *   - { exact: '文字' }                         完全比對（去除頭尾空白後）
 *   - { startsWith: '文字', includes: '文字' }   開頭比對 + 包含比對（用於銀行版這種帶日期區間的標題）
 *
 * noSubtitle: true 表示這個公版不需要從工單讀取任何文字/副標題——
 * 素材檔名（kv_bg / USP 等）已經直接寫在公版 JSON 裡，只要偵測到標題文字
 * 存在，就直接把該公版加進批次輸出。
 *
 * bankLogoList: 銀行版限定。這是一組已知的銀行名稱關鍵字，程式會在整張
 * 工作表裡找出「儲存格內容完全等於清單中任一銀行名稱」的格子，依照
 * 由上到下、由左到右的順序排序後，依序對應到公版的 01~05_銀行 Logo。
 * 不寫死儲存格座標，工單把銀行清單搬到別的欄位/列都還是抓得到。
 */
window.TemplateRoutingConfig = {
  kvSheetRoutes: [
    {
      key: 'kv_warmup_bank',
      family: 'kv_warmup_bank',
      label: '暖身 L1 KV 版配（銀行版）',
      titleMatch: { startsWith: '暖身 L1 KV 版配', includes: '銀行版' },
      templateId: '暖身_銀行版',
      templateFile: '暖身_銀行版.json',
      outputPrefix: '暖身_銀行版',
      bankLogoList: ['國泰世華', '星展銀行', '玉山銀行', '聯邦銀行', '永豐銀行'],
    },
    {
      key: 'kv_warmup_guide',
      family: 'kv_warmup_guide',
      label: '暖身 L1 KV 版配',
      titleMatch: { exact: '暖身 L1 KV 版配' },
      templateId: '暖身_攻略頁',
      templateFile: '暖身_攻略頁.json',
      outputPrefix: '暖身_攻略頁',
    },
    {
      key: 'kv_formal_inner',
      family: 'kv_formal_inner',
      label: '正式日 L1 KV 版配（正式內）',
      titleMatch: { exact: '正式日 L1 KV 版配' },
      templateId: '正式(內)',
      templateFile: '正式(內).json',
      outputPrefix: '正式(內)',
      noSubtitle: true,
    },
    {
      key: 'kv_formal_outer',
      family: 'kv_formal_outer',
      label: '正式日 L1 KV 版配（正式外）',
      titleMatch: { exact: '正式日 L1 KV 版配' },
      templateId: '正式(外)',
      templateFile: '正式(外).json',
      outputPrefix: '正式(外)',
      noSubtitle: true,
    },
    {
      key: 'kv_formal_16x9_outer',
      family: 'kv_formal_16x9_outer',
      label: '正式日 L1 KV 版配（正式16x9外）',
      titleMatch: { exact: '正式日 L1 KV 版配' },
      templateId: '正式(16x9外)',
      templateFile: '正式(16x9外).json',
      outputPrefix: '正式(16x9外)',
      noSubtitle: true,
    },
  ],
};
