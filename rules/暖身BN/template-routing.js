/* Template Routing Config
 * 工單固定欄位分流設定。
 *
 * 目前讀取邏輯：
 * - placementCell: 判斷版位，例如 B17 = 頭巾
 * - variantHeaderCell: 判斷版配標題，例如 F16 = 版配
 * - logoCells / logoFallback: 判斷 logo 類型，例如 I28 = VIP logo / 蝦皮 logo
 *
 * 未來新增「頭巾 + 某 logo」公版，只需要在 headbandSheetRoutes 新增一筆。
 * 不需要改 index.html / app.core.js。
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
      family: 'headband_vip',
      label: '頭巾 VIP',
      logoKeywords: ['vip logo', 'viplogo', 'VIP logo', 'VIP', '蝦皮VIP logo', '蝦皮VIP'],
      templateId: '01_頭巾_VIP',
      templateFile: '01_頭巾_VIP.json',
      ruleFile: 'headband_VIP.rules.js',
      outputPrefix: '頭巾_VIP',
    },
    {
      key: 'headband_shopee',
      family: 'headband_shopee',
      label: '頭巾 蝦皮購物',
      logoKeywords: ['蝦皮 logo', '蝦皮logo', '蝦皮購物', 'shopee logo', 'shopeelogo', 'shopee'],
      templateId: '01_頭巾_蝦皮購物',
      templateFile: '01_頭巾_蝦皮購物.json',
      ruleFile: 'headband_shopee.rules.js',
      outputPrefix: '頭巾_蝦皮購物',
    },
  ],
};
