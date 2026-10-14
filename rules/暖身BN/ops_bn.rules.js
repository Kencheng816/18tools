/* OPS_BN template rules – 獨立公版規則，不共用/不影響其他公版。
 * 對應範本：templates/15_OPS BN.json
 * 對應工單分頁：新增製作物_OSP BN(42發單)
 *
 * 規則摘要：
 * 1) 樣式（VIP券/全站券/商城券/免運券）→ 切換對應 KV_BG_*，其餘隱藏。
 * 2) 大標題 若含「VIP」→ 拆成 蝦皮VIP_LOGO + 大標題_右，並群組置中；否則使用 大標題 單一文字。
 * 3) 大標題_BG → 彈性寬度：量測大標題（或群組）實際寬度，左右各 +20px。
 * 4) 副標題_線框 → 彈性寬度：量測 副標題／法務小字 視覺寬度取最大值（獨立實作，不共用 ar_large_bn）。
 * 5) 副標題 → 中心點 X 對齊 副標題_線框 中心點 X。
 * 6) 主標題／副標題_線框／法務小字 → 左側 X 對齊 主標題 X（主標題 X 固定不變）。
 * 7) CTA_案型 文字已由 app.core.js 通用 textMap 自動帶入 Excel「CTA」欄位，本檔不重複處理。
 * 8) 關閉全域藍色膠囊（generatedLayers.subtitle_frame），僅影響 OPS_BN，不影響其他公版。
 */
(function () {
  'use strict';

  const FAMILY = 'ops_bn';
  const TEMPLATE_ID = '15_OPS BN';
  const BG_SIDE_PADDING_PX = 20;
  const TITLE_LOGO_GAP_PX = 9;
  const SUBTITLE_FRAME_MIN_PADDING_PX = 20;

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  // ── 自建量測用 canvas（與 title-logo.parser.js 手法一致，避免依賴 hook helpers）──
  const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const measureContext = measureCanvas ? measureCanvas.getContext('2d') : null;

  function fontString(layer = {}) {
    const style = layer.fontStyle === 'italic' ? 'italic ' : '';
    const weight = layer.fontWeight || 400;
    const size = layer.fontSizePx || 24;
    const family = layer.fontFamily
      ? `"${layer.fontFamily}","ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif`
      : '"ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif';
    return `${style}${weight} ${size}px ${family}`;
  }

  function measureTextWidth(text, baseLayer = {}) {
    const str = String(text || '');
    if (!measureContext) return Math.max(1, [...str].length * Number(baseLayer.fontSizePx || 24));
    measureContext.save();
    measureContext.font = fontString(baseLayer);
    const letterSpacing = Number(baseLayer.letterSpacing || 0);
    const width = [...str].reduce((sum, ch) => sum + measureContext.measureText(ch).width, 0)
      + letterSpacing * Math.max(0, [...str].length - 1);
    measureContext.restore();
    return Math.ceil(width);
  }

  function getVisualTextWidth(layer) {
    if (!layer || layer.hidden) return 0;
    return Math.max(1, measureTextWidth(layer.text, layer));
  }

  function findLayerKey(template, keys = []) {
    const layers = template?.layers || {};
    for (const key of keys) if (layers[key]) return key;
    const normalizedKeys = keys.map(normalize).filter(Boolean);
    const entry = Object.entries(layers).find(([layerKey, layer]) => {
      const label = normalize(`${layerKey} ${layer?.psdName || ''}`);
      return normalizedKeys.some((word) => label.includes(word));
    });
    return entry?.[0] || '';
  }

  function findLayer(template, keys = []) {
    const key = findLayerKey(template, keys);
    return key ? template.layers[key] : null;
  }

  function updateShapeBounds(layer) {
    if (!layer || layer.type !== 'shape') return;
    layer.centerX = round(Number(layer.x || 0) + Number(layer.width || 0) / 2);
    layer.centerY = Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : round(Number(layer.y || 0) + Number(layer.height || 0) / 2);
    layer.useDynamicBounds = true;
    layer.vectorPath = null;
    layer.shape = {
      ...(layer.shape || {}),
      pathBounds: {
        x: Number(layer.x || 0),
        y: Number(layer.y || 0),
        width: Number(layer.width || 0),
        height: Number(layer.height || 0),
        centerX: Number(layer.centerX || 0),
        centerY: Number(layer.centerY || 0),
      },
      geometry: null,
      vectorPath: null,
    };
  }

  function setShapeLeftAligned(layer, leftX, width) {
    if (!layer) return;
    const nextWidth = round(Math.max(1, Number(width || 1)));
    layer.x = round(leftX);
    layer.width = nextWidth;
    updateShapeBounds(layer);
  }

  function setShapeCentered(layer, centerX, width) {
    if (!layer) return;
    const nextWidth = round(Math.max(1, Number(width || 1)));
    layer.width = nextWidth;
    layer.centerX = round(centerX);
    layer.x = round(centerX - nextWidth / 2);
    updateShapeBounds(layer);
  }

  // ── 1) 樣式 → KV_BG_* 顯示切換 ─────────────────────────────────
  const STYLE_BG_RULES = [
    { keywords: ['vip'], layerKeys: ['KV_BG_VIP'] },
    { keywords: ['全站'], layerKeys: ['KV_BG_全站'] },
    { keywords: ['商城'], layerKeys: ['KV_BG_商城'] },
    { keywords: ['免運'], layerKeys: ['KV_BG_免運'] },
  ];
  const ALL_BG_KEYS = STYLE_BG_RULES.flatMap((rule) => rule.layerKeys);

  function applyStyleBackground(template, record, diagnostics) {
    const styleValue = toText(record?.['樣式']);
    const normalizedStyle = normalize(styleValue);
    const matchedRule = STYLE_BG_RULES.find((rule) => rule.keywords.some((keyword) => normalizedStyle.includes(normalize(keyword))));

    ALL_BG_KEYS.forEach((key) => {
      const layer = template.layers?.[key];
      if (!layer) return;
      layer.hidden = !matchedRule || !matchedRule.layerKeys.includes(key);
    });

    if (matchedRule) {
      diagnostics?.push?.({ field: '樣式', status: 'ok', value: styleValue, target: matchedRule.layerKeys.join('、') });
    } else if (styleValue) {
      diagnostics?.push?.({ field: '樣式', status: 'unmatched', value: styleValue, target: 'KV_BG_VIP/全站/商城/免運 皆未命中，已全部隱藏' });
    }
  }

  // ── 2) 大標題 VIP 拆字 + 3) 大標題_BG 彈性寬度 ─────────────────
  function applyHeadlineRule(template, record, diagnostics) {
    const canvasWidth = Number(template.canvas?.width || 0);
    const anchorCenterX = canvasWidth ? canvasWidth / 2 : null;

    const headlineText = toText(record?.['大標題']);
    const headlineLayer = findLayer(template, ['大標題']);
    const logoLayer = findLayer(template, ['蝦皮VIP_LOGO']);
    const rightLayer = findLayer(template, ['大標題_右']);
    const bgLayer = findLayer(template, ['大標題_BG']);
    if (!headlineLayer) return;

    const centerX = anchorCenterX ?? Number(bgLayer?.centerX || headlineLayer.centerX || 0);
    const hasVip = /VIP/i.test(headlineText);
    let groupWidth = 0;

    if (hasVip && logoLayer && rightLayer) {
      // 把「VIP」關鍵字換成 LOGO，剩餘文字進 大標題_右，兩者群組並置中。
      const remainder = headlineText.replace(/VIP/i, '').trim() || headlineText;

      headlineLayer.hidden = true;
      logoLayer.hidden = false;
      rightLayer.hidden = false;
      rightLayer.text = remainder;
      rightLayer.align = 'left';
      rightLayer.textAlign = 'left';

      const logoWidth = Number(logoLayer.width || 0);
      const rightWidth = Math.max(1, measureTextWidth(remainder, rightLayer));
      rightLayer.width = round(rightWidth);

      groupWidth = logoWidth + TITLE_LOGO_GAP_PX + rightWidth;
      const startX = centerX - groupWidth / 2;

      logoLayer.x = round(startX);
      logoLayer.centerX = round(startX + logoWidth / 2);

      rightLayer.x = round(startX + logoWidth + TITLE_LOGO_GAP_PX);
      rightLayer.centerX = round(rightLayer.x + rightWidth / 2);

      diagnostics?.push?.({ field: '大標題', status: 'ok', value: headlineText, target: '蝦皮VIP_LOGO + 大標題_右 群組' });
    } else {
      if (logoLayer) logoLayer.hidden = true;
      if (rightLayer) rightLayer.hidden = true;

      headlineLayer.hidden = false;
      headlineLayer.text = headlineText || headlineLayer.text;
      headlineLayer.align = 'center';
      headlineLayer.textAlign = 'center';

      const textWidth = Math.max(1, measureTextWidth(headlineLayer.text, headlineLayer));
      headlineLayer.width = round(textWidth);
      headlineLayer.centerX = round(centerX);
      headlineLayer.x = round(centerX - textWidth / 2);

      groupWidth = textWidth;
      diagnostics?.push?.({ field: '大標題', status: 'ok', value: headlineText, target: '大標題（單一文字）' });
    }

    if (bgLayer) {
      setShapeCentered(bgLayer, centerX, groupWidth + BG_SIDE_PADDING_PX * 2);
    }
  }

  // ── 4) 副標題_線框 彈性寬度（獨立實作）─────────────────────────
  // ── 5) 副標題 置中對齊線框 ───────────────────────────────────
  // ── 6) 主標題／副標題_線框／法務小字 左側 X 對齊主標題 X ─────────
  function applyFrameAndAlignmentRule(template) {
    const title = findLayer(template, ['title', '主標題']);
    const subtitle = findLayer(template, ['subtitle', '副標題']);
    const subtitleFrame = findLayer(template, ['副標題_線框']);
    const legal = findLayer(template, ['legal', '法務小字']);
    if (!title) return;

    const titleLeftX = Number(title.x || 0);

    if (subtitleFrame) {
      const snapshotWidth = Number(subtitleFrame.width || 0);
      const maxWidth = Math.max(
        1,
        snapshotWidth,
        getVisualTextWidth(subtitle) + SUBTITLE_FRAME_MIN_PADDING_PX * 2,
        getVisualTextWidth(legal) + SUBTITLE_FRAME_MIN_PADDING_PX * 2
      );
      setShapeLeftAligned(subtitleFrame, titleLeftX, maxWidth);
    }

    if (subtitle && subtitleFrame) {
      subtitle.centerX = round(Number(subtitleFrame.centerX || subtitleFrame.x + subtitleFrame.width / 2));
      subtitle.x = round(subtitle.centerX - Number(subtitle.width || 0) / 2);
      subtitle.align = 'center';
      subtitle.textAlign = 'center';
    }

    if (legal) {
      const legalWidth = Number(legal.width || 0);
      legal.x = round(titleLeftX);
      legal.centerX = round(titleLeftX + legalWidth / 2);
      legal.align = 'left';
      legal.textAlign = 'left';
    }
  }

  // ── 8) 關閉全域藍色膠囊，只影響 OPS_BN ─────────────────────────
  function removeSubtitleCapsule(template) {
    if (!template) return;
    if (Array.isArray(template.renderOrder)) {
      template.renderOrder = template.renderOrder.filter((key) => key !== 'subtitle_frame');
    }
    if (template.generatedLayers?.subtitle_frame) {
      template.generatedLayers.subtitle_frame.hidden = true;
      template.generatedLayers.subtitle_frame.disabled = true;
      template.generatedLayers.subtitle_frame.source = 'disabled_ops_bn_rule';
    }
  }

  function applyProgrammaticLayout(template, record, diagnostics) {
    removeSubtitleCapsule(template);
    applyStyleBackground(template, record || {}, diagnostics);
    applyHeadlineRule(template, record || {}, diagnostics);
    applyFrameAndAlignmentRule(template);
    removeSubtitleCapsule(template);
  }

  const OpsBNTemplateRules = {
    // 不使用全域藍色膠囊；OPS_BN 的副標膠囊由本規則獨立控制且預設不顯示，不影響其他公版。
    capsuleRules: {
      disabledForOpsBN: true,
    },

    resolveRecordTemplateRoute({ block }) {
      const blockName = toText(block?.name);
      // Excel 工單分頁「新增製作物_OSP BN(42發單)」的「製作內容」欄位固定填寫 "OSP BN"（拼字順序如此）。
      if (!/^\s*O\s*[SP]{2}\s*BN\b/i.test(blockName) && !/OSP\s*BN/i.test(blockName) && !/OPS\s*BN/i.test(blockName)) return null;
      return {
        key: 'ops_bn',
        family: FAMILY,
        label: 'OPS BN',
        templateId: TEMPLATE_ID,
        templateFile: `${TEMPLATE_ID}.json`,
        outputPrefix: 'OPS BN',
      };
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      // textMap 已在 before/after 之間把 主標題/副標題/法務小字/CTA_案型 文字帶入，
      // 這裡再跑一次版面計算，確保依最終文字內容算出正確的彈性寬度與對齊。
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'OPS BN',
    priority: 32,
    tokens: ['osp bn', 'ops bn', 'osp_bn', 'ops_bn', '15_osp bn', '15_ops bn'],
    targets: ['ops bn', 'ops_bn', '15_ops bn'],
    rules: OpsBNTemplateRules,
  });
})();
