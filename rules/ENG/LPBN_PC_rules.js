/* LPBN_PC 公版規則
 * 這個公版目前只需要兩件事，而且跟其他公版完全共用同一套判斷邏輯，
 * 所以實際邏輯都寫在 rules/shared/template-rule-utils.js，這裡只負責註冊 + 呼叫：
 *   1) 主標題／副標題文字顏色：依「目前專案」（4.17直播日/4.18暖身/4.18正式）套用對應配色
 *   2) LOGO 圖層：依工單「LOGO：xxx」文字內容，判斷要套用「直播日_LOGO.svg」還是「蝦皮直播_LOGO.svg」
 */
(function () {
  'use strict';

  window.TemplateRuleRegistry.register('lpbn_pc', {
    label: 'LPBN_PC',
    targets: ['LPBN_PC'],

    rules: {
      afterApplyRecordToTemplate({ template, record }) {
        window.TemplateRuleUtils.applyProjectTextColors(template);
        window.TemplateRuleUtils.applyLogoFromRecord(template, record);
      },
    },
  });
})();
