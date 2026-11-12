/* 整合版（18節）— 手動改主標／副標時，品牌 LOGO 變體跟著切（2026-11-12）
 *
 * 問題：工單匯入時規則檔會依關鍵字切換「蝦皮VIP LOGO」「蝦皮直營 LOGO」三段式（暖身BN rules/shared/title-variants.js、
 * 正式BN C2C SKBN 的副標 LOGO 群組…），但使用者在面板或畫布手動把主標改成「4/18 VIP專屬」「蝦皮直營…」時，
 * 那些規則不會再跑（手動改過的製作物從此「畫面為準」，預覽前不重套工單），LOGO 就不會換。
 *
 * 做法（純加法，不動 core／規則檔）：
 *   1. 包 Inspector.applyTextFromInputs（面板／Inspector 打字）與 TextEditor.commit（畫布雙擊改字），改完去抖動 150ms。
 *   2. 只處理「有品牌 LOGO 變體圖層」的製作物（蝦皮VIP_LOGO／蝦皮直營_LOGO），且改的是主標／副標或變體的左右文字段。
 *   3. 把改過的文字寫回工單欄位（主標／副標…；改的是變體左右段時先拼回「左 VIP 右」整句，也寫回隱藏的 title／subtitle），
 *      再重跑該公版的 afterApplyRecordToTemplate 與 LayoutRuleEngine，規則就會依新關鍵字換 LOGO 組並重新置中。
 *   4. 其他使用者手動改過字的圖層（__manualOverrides.text）在重跑前記下、跑完寫回，不會被工單抄回原文。
 */
(function initBrandVariantLive() {
  'use strict';

  const core = () => ({ AppState: window.AppState, BatchManager: window.BatchManager, Inspector: window.Inspector, TextEditor: window.TextEditor, Renderer: window.Renderer, LayerManager: window.LayerManager, LayoutRuleEngine: window.LayoutRuleEngine });
  const BRAND_LOGO = /蝦皮VIP_LOGO|蝦皮直營_LOGO/;
  const VIP_PART = /蝦皮VIP_主標題_(左|右)|副標題_右(_2)?$/;
  const DIRECT_PART = /蝦皮直營_主標題_右/;
  const FIELD_KEYS = { title: ['主標', '主標題', 'title'], subtitle: ['副標', '副標題', 'subtitle'] };
  const clean = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n?/g, '\n').trim();

  function hasBrandVariants(template) {
    return Object.keys(template?.layers || {}).some((key) => BRAND_LOGO.test(`${key} ${template.layers[key]?.psdName || ''}`));
  }
  function kindOf(key, layer) {
    const label = `${key} ${layer?.psdName || ''}`.toLowerCase();
    if (/副標|subtitle/.test(label)) return 'subtitle';
    if (/主標|title/.test(label)) return 'title';
    return null;
  }

  /** 改的是變體的左／右文字段 → 拼回整句（左 ＋ 關鍵字 ＋ 右）；改的是 title／subtitle 本身 → 直接用它。 */
  function rebuildRaw(template, key, layer) {
    const layers = template.layers;
    const text = (k) => { const l = layers[k]; return l && l.hidden !== true ? clean(l.text) : ''; };
    // 使用者在左／右段自己打了 VIP／直營（想換另一組 LOGO）→ 不再插回原本的關鍵字，照打的字重新判斷
    // 右段清空、左段也沒關鍵字 → 當作要回到一般主標（三段式沒有地方可以直接刪掉 LOGO，這是唯一的出口）
    const join = (keyword, parts) => {
      if (parts.some((part) => /VIP|直營/i.test(part))) return parts.filter(Boolean).join(' ');
      if (!parts[1]) return parts[0];
      return [parts[0], keyword, parts[1]].filter(Boolean).join(' ');
    };
    if (DIRECT_PART.test(key)) return { kind: 'title', raw: join('蝦皮直營', [text('蝦皮VIP_主標題_左'), text(key)]) };
    if (/蝦皮VIP_主標題_(左|右)/.test(key)) return { kind: 'title', raw: join('VIP', [text('蝦皮VIP_主標題_左'), text('蝦皮VIP_主標題_右')]) };
    if (/^副標題_右(_2)?$/.test(key)) {
      const vipVisible = Object.entries(layers).some(([k, l]) => /蝦皮VIP_LOGO/.test(k) && l.hidden !== true);
      return { kind: 'subtitle', raw: join(vipVisible ? 'VIP' : '蝦皮直營', ['', clean(layer.text)]) };
    }
    const kind = kindOf(key, layer);
    return kind ? { kind, raw: clean(layer.text) } : null;
  }

  function writeBack(template, kind, raw) {
    const record = template.batchRecord || (template.batchRecord = {});
    const keys = FIELD_KEYS[kind];
    const existing = keys.filter((k) => record[k] !== undefined);
    (existing.length ? existing : [keys[0]]).forEach((k) => { record[k] = raw; });
    // 工單清單那一筆（A 系記在 batchItems）也同步，之後存檔／再套版才一致
    const { AppState } = core();
    const item = (AppState?.templates || []).find((entry) => entry?.data === template);
    if (item?.itemRecord) (existing.length ? existing : [keys[0]]).forEach((k) => { item.itemRecord[k] = raw; });
    // 隱藏中的 title／subtitle 本體也要是整句，規則檔（暖身BN 讀 title.text）才看得到
    const base = template.layers[kind];
    if (base && base.type === 'text') base.text = raw;
  }

  function rerunRules(template, editedKey) {
    const { BatchManager, LayoutRuleEngine, Renderer, Inspector, LayerManager, AppState } = core();
    const keep = Object.entries(template.layers)
      .filter(([key, layer]) => layer?.type === 'text' && layer.__manualOverrides?.text && key !== editedKey)
      .map(([key, layer]) => [layer, layer.text]);
    BatchManager?.applyTemplateRuleHook?.('afterApplyRecordToTemplate', template, template.batchRecord || {}, [], { skipExactLayout: true });
    LayoutRuleEngine?.apply?.(template);
    keep.forEach(([layer, text]) => { layer.text = text; });
    Renderer?.render?.(); LayerManager?.render?.(); Inspector?.render?.();
    const index = AppState?.activeIndex;
    if (index >= 0 && AppState.batchMode) { BatchManager?.markThumbsStale?.([index]); BatchManager?.refreshThumbsForIndexes?.([index]); }
  }

  // ── 連動預設：有 VIP／蝦皮直營 LOGO 在畫面上的製作物，跨版位連動預設斷開（LOGO 位置是這張自己排的，不要推給同版型的別張）──
  // 使用者自己按過連動開關（LinkSyncUI.apply）的那張不再自動改；變體關掉時，只把「我們自動關的」再打開。
  let linkIdSeed = 1;
  function ensureLinkId(template) {
    if (!template.__linkSyncId) template.__linkSyncId = `link-${Date.now().toString(36)}-brand${linkIdSeed++}`;
    return template.__linkSyncId;
  }
  function brandVariantActive(template) {
    return Object.entries(template?.layers || {}).some(([key, layer]) => BRAND_LOGO.test(`${key} ${layer?.psdName || ''}`) && layer?.type === 'image' && layer.hidden !== true && String(layer.assetFilename || '').trim());
  }
  function applyLinkSyncDefault(template) {
    const LinkSync = window.LinkSync;
    if (!template?.layers || !LinkSync?.setEnabled || template.__linkSyncUserSet) return;
    const active = brandVariantActive(template);
    if (active && !template.__linkSyncAutoOff) {
      ensureLinkId(template);
      LinkSync.setEnabled(template, false);
      template.__linkSyncAutoOff = true;
    } else if (!active && template.__linkSyncAutoOff) {
      LinkSync.setEnabled(template, true);
      delete template.__linkSyncAutoOff;
    }
  }
  function applyLinkSyncDefaultToAll() {
    const { AppState } = core();
    (AppState?.templates || []).forEach((item) => { try { applyLinkSyncDefault(item?.data); } catch (_) { /* 單張失敗不影響其他 */ } });
    window.LinkSyncUI?.render?.();
  }

  let timer = null;
  function afterTextEdit(key) {
    const { AppState } = core();
    const template = AppState?.template;
    const layer = key ? template?.layers?.[key] : null;
    if (!template || !layer || layer.type !== 'text' || !hasBrandVariants(template)) return;
    clearTimeout(timer);
    // 延後再讀文字：面板的 applyText 是先呼叫 Inspector.applyTextFromInputs、之後才把 layer.text 寫成新值
    timer = setTimeout(() => {
      try {
        const rebuilt = rebuildRaw(template, key, layer);
        if (!rebuilt) return;
        writeBack(template, rebuilt.kind, rebuilt.raw);
        rerunRules(template, key);
        applyLinkSyncDefault(template); window.LinkSyncUI?.render?.();
      } catch (error) { console.warn('[brand-variant-live] 重跑品牌變體失敗', error); }
    }, 150);
  }

  function wrap(target, method, keyOf) {
    if (!target?.[method] || target[method].__brandVariantWired) return;
    const original = target[method];
    const wrapped = function withBrandVariant(...args) {
      const key = keyOf(args);
      const result = original.apply(this, args);
      try { afterTextEdit(key); } catch (_) { /* 不影響原本的改字 */ }
      return result;
    };
    wrapped.__brandVariantWired = true;
    target[method] = wrapped;
  }

  function wire() {
    const { Inspector, TextEditor, AppState, BatchManager } = core();
    wrap(Inspector, 'applyTextFromInputs', () => AppState?.selectedLayers?.[0]);
    wrap(TextEditor, 'commit', () => AppState?.editingLayerKey);
    // 產圖完（批次 UI 重畫）：把有品牌 LOGO 的製作物連動預設關掉
    if (BatchManager?.renderBatchUI && !BatchManager.renderBatchUI.__brandVariantWired) {
      const original = BatchManager.renderBatchUI;
      const wrapped = function renderBatchUIThenLinkDefault(...args) { const result = original.apply(this, args); try { applyLinkSyncDefaultToAll(); } catch (_) { /* 不影響批次 UI */ } return result; };
      wrapped.__brandVariantWired = true;
      BatchManager.renderBatchUI = wrapped;
    }
    // 使用者自己按連動開關 → 這張之後都尊重使用者
    const LinkSyncUI = window.LinkSyncUI;
    if (LinkSyncUI?.apply && !LinkSyncUI.apply.__brandVariantWired) {
      const originalApply = LinkSyncUI.apply;
      const wrappedApply = function applyByUser(...args) { const template = AppState?.template; if (template) { template.__linkSyncUserSet = true; delete template.__linkSyncAutoOff; } return originalApply.apply(this, args); };
      wrappedApply.__brandVariantWired = true;
      LinkSyncUI.apply = wrappedApply;
    }
    if (LinkSyncUI?.toggle && !LinkSyncUI.toggle.__brandVariantWired) {
      const originalToggle = LinkSyncUI.toggle;
      const wrappedToggle = function toggleByUser(...args) { const template = AppState?.template; if (template) { template.__linkSyncUserSet = true; delete template.__linkSyncAutoOff; } return originalToggle.apply(this, args); };
      wrappedToggle.__brandVariantWired = true;
      LinkSyncUI.toggle = wrappedToggle;
    }
    applyLinkSyncDefaultToAll();
  }

  function main() {
    const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
    whenReady();
  }
  window.BrandVariantLive = Object.freeze({ afterTextEdit, hasBrandVariants, brandVariantActive, applyLinkSyncDefault, applyLinkSyncDefaultToAll });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main, { once: true });
  else main();
})();
