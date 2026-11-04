/* 整合版（18節 KOL代播圖）— 「調整」面板的 LOGO 底色控制列（封測第 14 題）
 *
 * 規則檔用 rules.logoBackdrop = { logoKey, backdropKey, defaults, relayout } 宣告哪一層是 LOGO、哪一層是底色；
 * 選到 LOGO 圖層時，面板出現「加底色」開關、顏色、留白比例（0～40%）。設定存在底色圖層的 backdrop 欄位
 * （跟著存檔／讀檔走），改完呼叫規則的 relayout 重算底色框，再重畫畫布與縮圖。
 * 純加法：包住 Inspector.render；沒有 logoBackdrop 規則的工具完全不受影響。
 */
(function initLogoBackdropControls() {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const core = () => ({ AppState: window.AppState, Inspector: window.Inspector, Renderer: window.Renderer, BatchManager: window.BatchManager, HistoryManager: window.HistoryManager, CapsuleRuleEngine: window.CapsuleRuleEngine });

  function configFor(template) {
    const registry = window.TemplateRuleManager || window.TemplateRuleRegistry;
    const family = template?.ruleFamily || template?.sheetTemplateRoute?.family || core().CapsuleRuleEngine?.getTemplateFamily?.(template);
    const config = family ? registry?.getRules?.(family)?.logoBackdrop : null;
    return config && template?.layers?.[config.backdropKey] ? config : null;
  }

  function settingsOf(template, config) {
    const layer = template.layers[config.backdropKey];
    if (!layer.backdrop) layer.backdrop = { ...config.defaults };
    return layer.backdrop;
  }

  function render(key, layer) {
    const box = $('logoBackdropControls');
    if (!box) return;
    const { AppState } = core();
    const template = AppState?.template;
    const config = template ? configFor(template) : null;
    // 2026-11-02：控制列搬到「調整」面板的品牌 LOGO 區，是這張製作物的設定，不再要求先選到 LOGO 圖層。
    const eligible = !!config;
    box.classList.toggle('hidden', !eligible);
    if (!eligible) return;
    const settings = settingsOf(template, config);
    $('logoBackdropEnabled').checked = settings.enabled === true;
    $('logoBackdropColor').value = settings.color || config.defaults.color;
    const pad = Math.round(Number(settings.padRatio ?? config.defaults.padRatio) * 100);
    $('logoBackdropPad').value = pad;
    $('logoBackdropPadValue').textContent = `${pad}%`;
    $('logoBackdropColor').disabled = $('logoBackdropPad').disabled = settings.enabled !== true;
  }

  function applyChange(mutate) {
    const { AppState, Renderer, BatchManager, HistoryManager, Inspector } = core();
    const template = AppState?.template;
    const config = template ? configFor(template) : null;
    if (!config) return;
    HistoryManager?.push?.('logo-backdrop');
    mutate(settingsOf(template, config));
    config.relayout?.(template);
    Renderer?.render?.();
    if (AppState.activeIndex >= 0) { BatchManager?.markThumbsStale?.([AppState.activeIndex]); BatchManager?.refreshThumbsForIndexes?.([AppState.activeIndex]); }
    Inspector?.render?.();
  }

  function bind() {
    $('logoBackdropEnabled')?.addEventListener('change', (event) => applyChange((s) => { s.enabled = event.target.checked; }));
    $('logoBackdropColor')?.addEventListener('input', (event) => applyChange((s) => { s.color = event.target.value; }));
    $('logoBackdropPad')?.addEventListener('input', (event) => {
      $('logoBackdropPadValue').textContent = `${event.target.value}%`;
      applyChange((s) => { s.padRatio = Number(event.target.value) / 100; });
    });
  }

  function wire() {
    const { Inspector } = core();
    if (!Inspector?.render || Inspector.render.__logoBackdropWired) return;
    const original = Inspector.render;
    const wrapped = function renderWithLogoBackdrop(...args) {
      const result = original.apply(this, args);
      const key = core().AppState?.selectedLayers?.[0];
      render(key, key ? core().AppState?.template?.layers?.[key] : null);
      return result;
    };
    wrapped.__logoBackdropWired = true;
    Inspector.render = wrapped;
    bind();
  }

  function main() {
    const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
    whenReady();
  }

  window.LogoBackdropControls = Object.freeze({ render, configFor });
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', main, { once: true });
  else main();
})();
