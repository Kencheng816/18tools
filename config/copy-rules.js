/* 18節 整合版 — 文案規則設定（2026-11-12 第一期）
 *
 * 來源：GD 的「警語智慧偵測」規則（jimmywu-commits/shopee／警語智慧偵測：warning_inline_demo_v2.html＋警語驗證規則.xlsx），
 * 由 modules/copy-lint.js 讀取。這裡只放「資料」：要改字、加禁用語、調字數上限，直接改這個檔案。
 *
 *   replacements   用字替換（真的會改字）：匯入工單時改工單文字、面板／畫布打字時即時改。價格層不動。
 *   bannedPhrases  禁用語（只進診斷，紅點）。
 *   charLimits     字數上限（只進診斷，橘點）：中文字算 1，其他（英數、半形／全形標點）算 0.5。
 *   headlineAllowedChars  主／副標允許的字元（其餘視為標點，只提示）；1,000 的逗號與 8.5折 的小數點另外放行。
 *   shrimpKeyword／shrimpLegalPattern  主副標提到蝦幣時，警語應補的條件結構（只提示）。
 */
window.CopyRules = Object.freeze({
  replacements: [
    ['撒', '灑'],
  ],
  bannedPhrases: ['限搶', '限量搶購', '手刀搶購'],
  charLimits: { title: 8, subtitle: 7, legal: 14 },
  headlineAllowedChars: '\\u4e00-\\u9fffA-Za-z0-9 $%',
  // 18節工單主標慣用「4/18 刷卡享88折」「4/17 20點搶優惠」：日期 M/D、時間 HH:MM 不當標點，日期後面那一個空格不當「中文旁空格」。
  // （原 demo 沒有這條例外，是整合版加的；不要的話把這個陣列清空即可。）
  headlineAllowedTokens: ['\\d{1,2}/\\d{1,2}', '\\d{1,2}:\\d{2}'],
  shrimpKeyword: '蝦幣',
  shrimpLegalPattern: '需領券|滿\\$[\\d,]+|最高(?:享|回饋|領)?[\\d,]+蝦幣',
  // 數字格式建議（第二期會變成自動校正）：前面接價格字或已有 $ 才補 $；後面接這些單位不補 $；黏著英文／./／ 的數字不動。
  pricePrefixes: '現折|折抵|現抵|立減|下殺|低至|只要|特價|原價|售價|最高|滿|折|省|殺|減|抵|價|享',
  noDollarUnits: '蝦幣|%|折',
  // 2026-11-12 使用者決定：「元」不排除——「數字元」就是金額，改成「$數字」（100元 → $100、1000元 → $1,000）。
  skipAfterUnits: '月|日|號|個|件|組|组|人|次|款|色|天|週|周|年|入|份|吋|寸',
  yuanUnit: '元',
});
