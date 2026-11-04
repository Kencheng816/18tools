/* 整合版（18節 暖身BN／正式BN）— 商品框版面依工單內容對應，不看輸出編號（2026-11-03 批次 ⑨）
 *
 * core 的 BatchManager.resolveTemplateProductImageRule 原本拿「輸出名（HBN_06、DDC_01…）」去 priceRules.templateLayouts 找 productImageBox；
 * 規則檔的鍵改成內容型（layout_<商品>_<價格>）之後，這條路要改成：工單 商品圖1＋價格 → productLayouts（含 variants）→ useTemplate → templateLayouts。
 * 跟價格引擎 resolveProductRule 的對應方式一致（商品鍵用相同的 norm 比對、價格用 includes）。找不到就退回 core 原本的找法（公版名）。
 * 純加法：包住 BatchManager.resolveTemplateProductImageRule；正式BN popup 自己那層 wrapper（__popupLayoutKey）照常先跑。
 */
(function initLayoutByRecord() {
  'use strict';

  const norm = (value) => String(value ?? '').toLowerCase().replace(/[\s 　\t\r\n_\-()（）\[\]【】.]+/g, '');

  function recordOf(template) {
    if (template?.__layoutRecord) return template.__layoutRecord;
    if (template?.batchRecord) return template.batchRecord;
    const item = (window.AppState?.templates || []).find((entry) => entry?.data === template);
    return item?.batchRecord || null;
  }

  /** 旗標 layout.productBoxSources：哪些製作物（工單「製作內容」或來源公版名的開頭，'*'＝全部）的商品框要從版面表拿。
   *  原工具是拿「輸出名」去對版面鍵，只有輸出名剛好等於鍵的才套得到（正式BN 全部；暖身BN 只有 HBN_NN；DD card／POPUP／IG／Game BN 名字對不上從沒套過），
   *  為了輸出跟原工具一致，暖身BN 只開 ["HBN"]。 */
  function sourceAllowed(template) {
    const value = window.ProfileLoader?.getFlag?.('layout.productBoxSources', undefined);
    const list = Array.isArray(value) ? value.map(norm).filter(Boolean) : [];
    if (list.includes('*')) return true;
    const labels = [template?.batchSourceName, template?.sheetTemplateRoute?.sourceTemplateId, template?.source?.psdName].map(norm).filter(Boolean);
    return labels.some((label) => list.some((prefix) => label.startsWith(prefix)));
  }

  function resolveByRecord(template) {
    if (!sourceAllowed(template)) return null;
    const rules = window.PriceRuleEngine?.getRules?.(template);
    const record = recordOf(template);
    if (!rules?.templateLayouts || !record) return null;
    const productKey = norm(record['商品圖1']);
    const price = norm(record['價格']);
    if (!productKey) return null;
    const productLayouts = rules.productLayouts || {};
    const key = Object.keys(productLayouts).find((candidate) => norm(candidate) === productKey || norm(productLayouts[candidate]?.productName) === productKey);
    const entry = key ? productLayouts[key] : null;
    if (!entry) return null;
    const variant = (entry.variants || []).find((item) => [].concat(item.priceIncludes || []).filter(Boolean).some((word) => price.includes(norm(word))));
    const useTemplate = variant?.useTemplate || entry.useTemplate;
    const layout = useTemplate ? rules.templateLayouts[useTemplate] : null;
    return layout?.productImageBox ? layout : null;
  }

  /** 暖身BN 的 core 在套版時還沒把工單記在 template 上（也還沒進 AppState.templates），先記一份私有的給上面用。 */
  function wireRecordStash() {
    const BatchManager = window.BatchManager;
    if (!BatchManager?.applyRecordToTemplate || BatchManager.applyRecordToTemplate.__layoutRecordWired) return;
    const original = BatchManager.applyRecordToTemplate;
    const wrapped = function applyRecordWithLayoutRecord(template, record, ...rest) {
      if (template && record) Object.defineProperty(template, '__layoutRecord', { value: record, writable: true, configurable: true, enumerable: false });
      return original.call(this, template, record, ...rest);
    };
    wrapped.__layoutRecordWired = true;
    BatchManager.applyRecordToTemplate = wrapped;
  }

  function wire() {
    wireRecordStash();
    const BatchManager = window.BatchManager;
    if (!BatchManager?.resolveTemplateProductImageRule || BatchManager.resolveTemplateProductImageRule.__layoutByRecordWired) return;
    const original = BatchManager.resolveTemplateProductImageRule;
    const wrapped = function resolveTemplateProductImageRuleByRecord(template, ...rest) {
      return resolveByRecord(template) || original.call(this, template, ...rest);
    };
    wrapped.__layoutByRecordWired = true;
    BatchManager.resolveTemplateProductImageRule = wrapped;
  }

  function main() {
    const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
    whenReady();
  }

  window.LayoutByRecord = Object.freeze({ resolveByRecord });
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', main, { once: true });
  else main();
})();
