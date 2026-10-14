/* C2C_SKBN(NUZ)_PC template rules – independent subtitle logo grouping. */
(function () {
  'use strict';

  const FAMILY = 'c2c_skbn_nuz_pc';
  const TEMPLATE_ID = '12_C2C_SKBN(NUZ)_PC';
  const SUBTITLE_GROUP_CENTER_X = 236.5;
  const SUBTITLE_LOGO_GAP_PX = 5;

  const ASSETS = Object.freeze({
    vipLogo: '蝦皮VIP_LOGO.svg',
    officialLogo: '蝦皮直營_LOGO.svg',
    saleIcon: '18號_icon.svg',
    cta: 'C2C_SKBN(NUZ)_PC_CTA.png',
    kvBg: 'C2C_SKBN(NUZ)_PC_KV_BG.png',
  });

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function getSubtitleText(record = {}, template = null) {
    return findRecordValue(record, ['副標題', '副標', 'subtitle']) || toText(template?.layers?.subtitle?.text);
  }

  function findLayerKey(template, keys = []) {
    const layers = template?.layers || {};
    for (const key of keys) if (layers[key]) return key;

    const wanted = keys.map(normalize).filter(Boolean);
    return Object.entries(layers).find(([key, layer]) => {
      const label = normalize(`${key} ${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return wanted.some((word) => label.includes(word));
    })?.[0] || '';
  }

  function findLayer(template, keys = []) {
    const key = findLayerKey(template, keys);
    return key ? template.layers[key] : null;
  }

  function setHidden(layer, hidden) {
    if (layer) layer.hidden = Boolean(hidden);
  }

  function setImageAsset(layer, assetFilename) {
    if (!layer || !assetFilename) return;
    layer.assetFilename = assetFilename;
    layer.assetCandidates = [assetFilename, `${TEMPLATE_ID}/${assetFilename}`];
    layer.keepAspectRatio = true;
  }

  function syncTextRange(layer, text) {
    if (!layer || !Array.isArray(layer.textStyleRanges)) return;
    layer.textStyleRanges.forEach((range) => {
      range.from = 0;
      range.to = String(text || '').length;
    });
  }

  function measureTextWidth(layer, helpers) {
    if (!layer) return 0;
    if (typeof helpers?.measureTextWidth === 'function') {
      const measured = Number(helpers.measureTextWidth(layer));
      if (Number.isFinite(measured) && measured > 0) return measured;
    }
    if (typeof helpers?.measureText === 'function') {
      const measured = Number(helpers.measureText(layer?.text || '', layer));
      if (Number.isFinite(measured) && measured > 0) return measured;
    }

    const text = toText(layer.text);
    const fontSize = Number(layer.fontSizePx || layer.fontSizePt || 24);
    const cjkCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
    const otherCount = Math.max(0, text.length - cjkCount);
    return Math.max(1, cjkCount * fontSize + otherCount * fontSize * 0.55);
  }

  function fitTextLayerToContent(layer, helpers) {
    if (!layer || layer.hidden) return 0;
    const measuredWidth = Math.max(1, measureTextWidth(layer, helpers));
    layer.width = round(measuredWidth);
    layer.centerX = round(Number(layer.x || 0) + measuredWidth / 2);
    syncTextRange(layer, layer.text);
    return measuredWidth;
  }

  function placeLayerLeft(layer, x, width = null) {
    if (!layer) return x;
    const nextWidth = Math.max(1, Number(width ?? layer.targetWidth ?? layer.width ?? 1));
    if (width !== null) layer.width = round(nextWidth);
    layer.x = round(x);
    layer.centerX = round(x + nextWidth / 2);
    return x + nextWidth;
  }

  function setTextLayer(layer, text, align = 'left') {
    if (!layer) return;
    layer.text = text;
    layer.hidden = !text;
    layer.align = align;
    layer.textAlign = align;
    syncTextRange(layer, text);
  }

  function getBrandSubtitleParts(text) {
    const raw = toText(text);
    if (/VIP/i.test(raw)) {
      return {
        type: 'vip',
        rightText: raw.replace(/VIP/ig, '').trim(),
      };
    }
    if (raw.includes('蝦皮直營')) {
      return {
        type: 'official',
        rightText: raw.replace(/蝦皮直營/g, '').trim(),
      };
    }
    return { type: 'plain', rightText: raw };
  }

  function applyStaticAssets(template) {
    setImageAsset(findLayer(template, ['18號_icon']), ASSETS.saleIcon);
    setImageAsset(findLayer(template, ['cta', 'CTA', '按鈕']), ASSETS.cta);
    setImageAsset(findLayer(template, ['kv_bg', 'KV_BG']), ASSETS.kvBg);
  }

  function layoutSubtitleGroup(template, record, helpers, diagnostics) {
    const rawSubtitle = getSubtitleText(record, template);
    const parts = getBrandSubtitleParts(rawSubtitle);
    const subtitleLayer = findLayer(template, ['subtitle', '副標題']);
    const vipLogoLayer = findLayer(template, ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP_LOGO']);
    const officialLogoLayer = findLayer(template, ['蝦皮直營_LOGO', '蝦皮直營 LOGO']);
    const officialRightLayer = findLayer(template, ['副標題_右']);
    const vipRightLayer = findLayer(template, ['副標題_右_2']);

    [vipLogoLayer, officialLogoLayer, officialRightLayer, vipRightLayer].forEach((layer) => setHidden(layer, true));

    if (parts.type === 'plain') {
      if (subtitleLayer) {
        subtitleLayer.hidden = false;
        subtitleLayer.text = parts.rightText;
        subtitleLayer.align = 'center';
        subtitleLayer.textAlign = 'center';
        subtitleLayer.x = 0;
        const width = fitTextLayerToContent(subtitleLayer, helpers);
        subtitleLayer.x = round(SUBTITLE_GROUP_CENTER_X - width / 2);
        subtitleLayer.centerX = round(SUBTITLE_GROUP_CENTER_X);
      }
      diagnostics?.push?.({ field: '副標題', status: 'ok', value: rawSubtitle, target: '副標題單一文字置中 X=236.5' });
      return;
    }

    setHidden(subtitleLayer, true);
    const logoLayer = parts.type === 'vip' ? vipLogoLayer : officialLogoLayer;
    const rightLayer = parts.type === 'vip' ? vipRightLayer : officialRightLayer;
    const asset = parts.type === 'vip' ? ASSETS.vipLogo : ASSETS.officialLogo;

    if (logoLayer) {
      logoLayer.hidden = false;
      setImageAsset(logoLayer, asset);
    }
    setTextLayer(rightLayer, parts.rightText, 'left');

    const logoWidth = Number(logoLayer?.targetWidth || logoLayer?.width || 0);
    const textWidth = fitTextLayerToContent(rightLayer, helpers);
    const visibleLogoWidth = logoLayer && !logoLayer.hidden ? logoWidth : 0;
    const gap = visibleLogoWidth && textWidth ? SUBTITLE_LOGO_GAP_PX : 0;
    const groupWidth = visibleLogoWidth + gap + textWidth;
    let cursorX = SUBTITLE_GROUP_CENTER_X - groupWidth / 2;

    if (logoLayer && !logoLayer.hidden) cursorX = placeLayerLeft(logoLayer, cursorX, logoWidth) + gap;
    if (rightLayer && !rightLayer.hidden) placeLayerLeft(rightLayer, cursorX, textWidth);

    diagnostics?.push?.({
      field: '副標題',
      status: 'ok',
      value: rawSubtitle,
      target: `${parts.type === 'vip' ? '蝦皮VIP_LOGO.svg' : '蝦皮直營_LOGO.svg'} + 副標題_右 群組置中 X=236.5`,
    });
  }

  function ensureRenderOrder(template) {
    if (!template?.layers || !Array.isArray(template.renderOrder)) return;
    ['18號_icon', '蝦皮直營_LOGO', '副標題_右', '蝦皮VIP_LOGO', '副標題_右_2', 'subtitle'].forEach((key) => {
      if (template.layers[key] && !template.renderOrder.includes(key)) template.renderOrder.push(key);
    });
  }

  function applyProgrammaticLayout(template, record, diagnostics, helpers) {
    applyStaticAssets(template);
    layoutSubtitleGroup(template, record || {}, helpers, diagnostics);
    ensureRenderOrder(template);
  }

  const DOUBLE_COUPON_LAYOUT = Object.freeze({
    layoutKey: 'doubleCoupon',
    productImageBox: {
      "x": 398.7,
      "y": 11,
      "width": 114.9,
      "height": 90,
      "centerX": 456.1,
      "centerY": 56,
      "targetWidth": 114.9,
      "targetHeight": 90,
      "maxTargetHeight": 90
},
    layouts: [
      {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "x": 419.1,
      "y": 56.6,
      "width": 101.1,
      "height": 33.7,
      "centerX": 469.65,
      "centerY": 73.45,
      "rotation": 2,
      "fontSizePx": 28,
      "fontSizePt": 28,
      "lineHeight": 30.24,
      "lineHeightMultiplier": 1.08,
      "letterSpacing": 0,
      "color": "#d0011b",
      "positioningMode": "absolute",
      "lockToEditedJson": true,
      "preserveExactSize": true,
      "skipAutoScale": true,
      "disableContentScale": true,
      "followProduct": true
},
      {
      "slot": "top",
      "psdName": "價格2（上券）",
      "x": 430.3,
      "y": 21.5,
      "width": 75.6,
      "height": 25.2,
      "centerX": 468.1,
      "centerY": 34.1,
      "rotation": -5,
      "fontSizePx": 28,
      "fontSizePt": 28,
      "lineHeight": 30.24,
      "lineHeightMultiplier": 1.08,
      "letterSpacing": 0,
      "color": "#d0011b",
      "positioningMode": "absolute",
      "lockToEditedJson": true,
      "preserveExactSize": true,
      "skipAutoScale": true,
      "disableContentScale": true,
      "followProduct": true
},
    ],
  });

  const PRICE_RULES = Object.freeze({
    enabled: true,
    coordinateMode: 'absolute',
    positioningMode: 'absolute',
    lockToEditedJson: true,
    productFirst: true,
    anchorLayerNames: ['product', 'P', '曝品'],
    templateLayouts: {
      [TEMPLATE_ID]: DOUBLE_COUPON_LAYOUT,
      'C2C_SKBN(NUZ)_PC': DOUBLE_COUPON_LAYOUT,
      'C2C SKBN (NUZ) PC': DOUBLE_COUPON_LAYOUT,
      'C2C_SKBN(NUZ)_PC_03': DOUBLE_COUPON_LAYOUT,
    },
    productLayouts: {
      'SCS_雙券': { useTemplate: TEMPLATE_ID, layoutKey: 'doubleCoupon' },
      'SCS雙券': { useTemplate: TEMPLATE_ID, layoutKey: 'doubleCoupon' },
      'SCS_雙券.png': { useTemplate: TEMPLATE_ID, layoutKey: 'doubleCoupon' },
    },
  });
const TemplateRules = {
    resolveRecordTemplateRoute({ block }) {
      const blockName = toText(block?.name);
      if (!/C2C\s*[_-]?\s*SKBN\s*\(?\s*NUZ\s*\)?\s*[_-]?\s*PC|C2C_SKBN\(NUZ\)_PC/i.test(blockName)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'C2C_SKBN(NUZ)_PC',
        templateId: TEMPLATE_ID,
        templateFile: `${TEMPLATE_ID}.json`,
        outputPrefix: 'C2C_SKBN(NUZ)_PC',
      };
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics, helpers }) {
      applyProgrammaticLayout(template, record || {}, diagnostics, helpers);
    },

    afterApplyRecordToTemplate({ template, record, diagnostics, helpers }) {
      applyProgrammaticLayout(template, record || {}, diagnostics, helpers);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'C2C_SKBN(NUZ)_PC',
    priority: 84,
    tokens: ['c2c skbn nuz pc', 'c2c_skbn(nuz)_pc', 'c2c_skbn_nuz_pc', '12_c2c_skbn(nuz)_pc'],
    targets: ['12_c2c_skbn(nuz)_pc', 'c2c skbn nuz pc', 'c2c_skbn(nuz)_pc', 'c2c_skbn_nuz_pc'],
    rules: {
      ...TemplateRules,
      priceRules: PRICE_RULES,
    },
  });
})();
