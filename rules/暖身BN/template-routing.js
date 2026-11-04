/* Template Routing Config
 * 工單固定欄位分流設定。
 *
 * 目前讀取邏輯：
 * - placementCell: 判斷版位，例如 B17 = 頭巾
 * - variantHeaderCell: 判斷版配標題，例如 F16 = 版配
 * - logoCells / logoFallback: 判斷 logo 類型，例如 I28 = VIP logo / 蝦皮 logo
 *
 * 2026-10-30 公版整併：頭巾只剩一支公版 01_頭巾.json（family＝headband、規則 headband.rules.js），
 * VIP／蝦皮購物 兩條路由都指到它，差別只在 key（規則用 key 判斷要顯示 VIP 組還是蝦皮購物組）。
 * 輸出檔名不分版本：頭巾_01_下單去、頭巾_02_點我領…依工單順序編號。
 */
window.TemplateRoutingConfig = {
  sheetCells: {
    placementCell: 'B17',
    variantHeaderCell: 'F16',
    placementKeywords: ['頭巾'],
    variantHeaderKeywords: ['版配'],
    logoCells: ['I28', 'I29', 'I27', 'I30'],
    logoFallbackColumn: 'I',
    logoFallbackStartRow: 25,
    logoFallbackEndRow: 35,
  },

  headbandSheetRoutes: [
    {
      key: 'headband_vip',
      family: 'headband',
      label: '頭巾 VIP',
      logoKeywords: ['vip logo', 'viplogo', 'VIP logo', 'VIP', '蝦皮VIP logo', '蝦皮VIP'],
      templateId: '01_頭巾',
      templateFile: '01_頭巾.json',
      ruleFile: 'headband.rules.js',
      outputPrefix: '頭巾',
    },
    {
      key: 'headband_shopee',
      family: 'headband',
      label: '頭巾 蝦皮購物',
      logoKeywords: ['蝦皮 logo', '蝦皮logo', '蝦皮購物', 'shopee logo', 'shopeelogo', 'shopee'],
      templateId: '01_頭巾',
      templateFile: '01_頭巾.json',
      ruleFile: 'headband.rules.js',
      outputPrefix: '頭巾',
    },
  ],
};
