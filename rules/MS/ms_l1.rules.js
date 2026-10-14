/* MS L1 專屬規則
 * 讀取「L1_暖正GD做圖列表」：G欄名稱、H欄使用公版。
 * H欄讀到 MS L1 公版名稱時，自動載入同名 JSON 公版並套入資料。
 */
(function initMSL1Rules() {
  'use strict';

  const registry = window.TemplateRuleRegistry;
  if (!registry) return;

  const VIP_LOGO_FILENAME = 'VIP_LOGO.svg';
  const SHOPEE_VIP_LOGO_FILENAME = '蝦皮VIP_LOGO.svg';
  const SUBTITLE_FIXED_WIDTH = 300;

  const routes = {
    '上蓋_VIP': {
      key: 'ms_l1_top_vip',
      family: 'ms_l1',
      label: 'MS L1 上蓋 VIP',
      templateId: '上蓋_VIP',
      templateFile: '上蓋_VIP.json',
      outputPrefix: '上蓋_VIP',
    },
    '上蓋_常態': {
      key: 'ms_l1_top_normal',
      family: 'ms_l1',
      label: 'MS L1 上蓋 常態',
      templateId: '上蓋_常態',
      templateFile: '上蓋_常態.json',
      outputPrefix: '上蓋_常態',
    },
    '上蓋_底橘': {
      key: 'ms_l1_top_orange',
      family: 'ms_l1',
      label: 'MS L1 上蓋 底橘',
      templateId: '上蓋_底橘',
      templateFile: '上蓋_底橘.json',
      outputPrefix: '上蓋_底橘',
    },
    '上蓋_全橘': {
      key: 'ms_l1_top_full_orange',
      family: 'ms_l1',
      label: 'MS L1 上蓋 全橘',
      templateId: '上蓋_全橘',
      templateFile: '上蓋_全橘.json',
      outputPrefix: '上蓋_全橘',
    },
    '上蓋_銀行': {
      key: 'ms_l1_top_bank',
      family: 'ms_l1',
      label: 'MS L1 上蓋 銀行',
      templateId: '上蓋_銀行',
      templateFile: '上蓋_銀行.json',
      outputPrefix: '上蓋_銀行',
    },
    '上蓋_獨享': {
      key: 'ms_l1_top_exclusive',
      family: 'ms_l1',
      label: 'MS L1 上蓋 獨享',
      templateId: '上蓋_獨享',
      templateFile: '上蓋_獨享.json',
      outputPrefix: '上蓋_獨享',
    },
    '上蓋_免運': {
      key: 'ms_l1_top_free_shipping',
      family: 'ms_l1',
      label: 'MS L1 上蓋 免運',
      templateId: '上蓋_免運',
      templateFile: '上蓋_免運.json',
      outputPrefix: '上蓋_免運',
    },
    '上蓋_蝦皮直營': {
      key: 'ms_l1_top_shopee_direct',
      family: 'ms_l1',
      label: 'MS L1 上蓋 蝦皮直營',
      templateId: '上蓋_蝦皮直營',
      templateFile: '上蓋_蝦皮直營.json',
      outputPrefix: '上蓋_蝦皮直營',
    },
    '票券_VIP': {
      key: 'ms_l1_coupon_vip',
      family: 'ms_l1',
      label: 'MS L1 票券 VIP',
      templateId: '票券_VIP',
      templateFile: '票券_VIP.json',
      outputPrefix: '票券_VIP',
    },
    '下蓋_VIP': {
      key: 'ms_l1_bottom_vip',
      family: 'ms_l1',
      label: 'MS L1 下蓋 VIP',
      templateId: '下蓋_VIP',
      templateFile: '下蓋_VIP.json',
      outputPrefix: '下蓋_VIP',
    },
    '下蓋_免運': {
      key: 'ms_l1_bottom_free_shipping',
      family: 'ms_l1',
      label: 'MS L1 下蓋 免運',
      templateId: '下蓋_免運',
      templateFile: '下蓋_免運.json',
      outputPrefix: '下蓋_免運',
    },
    '下蓋_蝦皮直營': {
      key: 'ms_l1_bottom_shopee_direct',
      family: 'ms_l1',
      label: 'MS L1 下蓋 蝦皮直營',
      templateId: '下蓋_蝦皮直營',
      templateFile: '下蓋_蝦皮直營.json',
      outputPrefix: '下蓋_蝦皮直營',
    },
    '下蓋_銀行': {
      key: 'ms_l1_bottom_bank',
      family: 'ms_l1',
      label: 'MS L1 下蓋 銀行',
      templateId: '下蓋_銀行',
      templateFile: '下蓋_銀行.json',
      outputPrefix: '下蓋_銀行',
    },
    '下蓋_底橘': {
      key: 'ms_l1_bottom_orange',
      family: 'ms_l1',
      label: 'MS L1 下蓋 底橘',
      templateId: '下蓋_底橘',
      templateFile: '下蓋_底橘.json',
      outputPrefix: '下蓋_底橘',
    },
    '表格_免運': {
      key: 'ms_l1_free_shipping_table',
      family: 'ms_l1',
      label: 'MS L1 表格 免運',
      templateId: '表格_免運',
      templateFile: '表格_免運.json',
      outputPrefix: '表格_免運',
    },
    '中標_全橘': {
      key: 'ms_l1_middle_full_orange',
      family: 'ms_l1',
      label: 'MS L1 中標 全橘',
      templateId: '中標_全橘',
      templateFile: '中標_全橘.json',
      outputPrefix: '中標_全橘',
    },
  };

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '');
  }

  function resolveRouteName(value) {
    const raw = String(value || '').trim();
    const n = normalize(raw);
    // 中標_全橘 必須與 Excel「使用公版」文字完全一致，避免「中標」等模糊名稱誤路由。
    if (n.includes(normalize('中標'))) return raw === '中標_全橘' ? '中標_全橘' : null;
    return Object.keys(routes).find((name) => n.includes(normalize(name)) || normalize(name).includes(n));
  }

  function eachLayer(template, predicate) {
    return Object.values(template?.layers || {}).find(predicate) || null;
  }

  function findLayerEntry(template, type, names = []) {
    const wanted = names.map(normalize).filter(Boolean);
    return Object.entries(template?.layers || {}).find(([, layer]) => {
      if (!layer || (type && layer.type !== type)) return false;
      const label = normalize(`${layer.psdName || ''} ${layer.role || ''}`);
      return wanted.some((name) => label.includes(name) || name.includes(label));
    }) || null;
  }

  function findLayer(template, type, names = []) {
    return findLayerEntry(template, type, names)?.[1] || null;
  }

  function getCanvasWidth(template) {
    return Number(template?.canvas?.width || template?.width || 1200);
  }

  function getFontFamily(layer) {
    return layer?.fontFamily || 'Shopee Noto Sans, Noto Sans TC, Arial, sans-serif';
  }

  function getFontWeight(layer) {
    const rawWeight = String(layer?.fontWeight || layer?.fontStyle || '').toLowerCase();
    if (rawWeight.includes('bold') || rawWeight.includes('700')) return '700';
    if (rawWeight.includes('medium') || rawWeight.includes('500')) return '500';
    return '400';
  }

  function getFontSize(layer) {
    return Number(layer?.fontSizePx || layer?.fontSizePt || layer?.fontSize || 48);
  }

  const DEFAULT_TOP_COVER_SHADOW_EFFECT = Object.freeze({
    color: '#f26602',
    opacity: 0.88,
    angle: 117,
    blur: 29,
    distance: 0,
    spread: 0,
    blendMode: 'multiply',
  });

  const TOP_COVER_SHADOW_EFFECT_BY_ROUTE = Object.freeze({
    '上蓋_免運': Object.freeze({
      ...DEFAULT_TOP_COVER_SHADOW_EFFECT,
      color: '#177d6b',
    }),
    '上蓋_銀行': Object.freeze({
      ...DEFAULT_TOP_COVER_SHADOW_EFFECT,
      color: '#01265d',
    }),
  });

  const TOP_COVER_SHADOW_TARGETS = Object.freeze([
    VIP_LOGO_FILENAME,
    SHOPEE_VIP_LOGO_FILENAME,
    'VIP_LOGO',
    '蝦皮VIP_LOGO',
    'LOGO_案型',
    '主標題',
    '法務小字',
  ]);

  const TOP_COVER_VIP_LEGAL_POSITION = Object.freeze({
    y: 446.6,
    centerY: 460.5,
  });

  const COUPON_COLOR_RULES = Object.freeze([
    { keyword: '全站', color: '#EE4D2D' },
    { keyword: '商城', color: '#D0011B' },
  ]);

  function getShadowRgba(effect) {
    const hex = String(effect.color || '#000000').replace('#', '');
    const value = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex.padEnd(6, '0').slice(0, 6);
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${effect.opacity})`;
  }

  function getTopCoverShadowEffect(routeName) {
    return {
      ...DEFAULT_TOP_COVER_SHADOW_EFFECT,
      ...(TOP_COVER_SHADOW_EFFECT_BY_ROUTE[routeName] || {}),
    };
  }

  function buildShadowEffect(routeName) {
    const effect = getTopCoverShadowEffect(routeName);
    return {
      ...effect,
      rgba: getShadowRgba(effect),
      cssFilter: `drop-shadow(0px 0px ${effect.blur}px ${getShadowRgba(effect)})`,
    };
  }

  function isTopCoverShadowTarget(layer) {
    if (!layer) return false;
    const label = normalize(`${layer.psdName || ''} ${layer.name || ''} ${layer.role || ''} ${layer.id || ''}`);
    return TOP_COVER_SHADOW_TARGETS.some((target) => {
      const normalizedTarget = normalize(target);
      return label.includes(normalizedTarget) || normalizedTarget.includes(label);
    });
  }

  function applyLayerShadow(layer, routeName) {
    if (!layer) return false;
    const shadow = buildShadowEffect(routeName);
    layer.shadow = { ...shadow, enabled: true };
    layer.dropShadow = { ...shadow, enabled: true };
    layer.effects = {
      ...(layer.effects || {}),
      dropShadow: { ...shadow, enabled: true },
    };
    layer.filter = shadow.cssFilter;
    layer.cssFilter = shadow.cssFilter;
    layer.__msL1ManagedShadow = true;
    return shadow;
  }

  function clearLayerShadow(layer) {
    if (!layer?.__msL1ManagedShadow) return;
    delete layer.shadow;
    delete layer.dropShadow;
    delete layer.filter;
    delete layer.cssFilter;
    delete layer.__msL1ManagedShadow;
    if (layer.effects) {
      delete layer.effects.dropShadow;
      if (!Object.keys(layer.effects).length) delete layer.effects;
    }
  }

  function clearAnyLayerShadow(layer) {
    if (!layer) return;
    delete layer.shadow;
    delete layer.dropShadow;
    delete layer.filter;
    delete layer.cssFilter;
    delete layer.__msL1ManagedShadow;
    if (layer.effects) {
      delete layer.effects.dropShadow;
      if (!Object.keys(layer.effects).length) delete layer.effects;
    }
  }

  function applyTopCoverShadowEffects(template, routeName, diagnostics = []) {
    Object.values(template?.layers || {}).forEach((layer) => {
      if (!isTopCoverShadowTarget(layer)) {
        clearLayerShadow(layer);
        return;
      }
      const shadow = applyLayerShadow(layer, routeName);
      diagnostics.push({
        field: '上蓋陰影',
        status: 'ok',
        value: `${shadow.color} / 88% / 117° / 29px`,
        target: layer.psdName || layer.name || layer.role || 'layer',
      });
    });
  }

  function clearTopCoverShadowEffects(template) {
    Object.values(template?.layers || {}).forEach(clearLayerShadow);
  }

  function clearAllShadowEffects(template) {
    Object.values(template?.layers || {}).forEach(clearAnyLayerShadow);
  }

  function measureText(layer, fallback = '') {
    const text = String(layer?.text || fallback || '').split(/\n/).filter(Boolean).sort((a, b) => b.length - a.length)[0] || '';
    if (!text) return 0;
    if (typeof document === 'undefined') return text.length * getFontSize(layer) * 0.9;
    const canvas = measureText.canvas || (measureText.canvas = document.createElement('canvas'));
    const ctx = canvas.getContext('2d');
    ctx.font = `${getFontWeight(layer)} ${getFontSize(layer)}px ${getFontFamily(layer)}`;
    const letterSpacing = Number(layer?.letterSpacing || layer?.tracking || 0);
    const spacing = Math.max(0, text.length - 1) * letterSpacing;
    return Math.ceil(ctx.measureText(text).width + spacing);
  }

  function centerLayerX(layer, centerX) {
    if (!layer) return;
    const width = Number(layer.width || 0);
    if (!Number.isFinite(width) || width <= 0) return;
    layer.x = Math.round(centerX - width / 2);
    layer.centerX = centerX;
    layer.align = 'center';
  }

  function syncLayerCenterYFromBox(layer) {
    if (!layer) return;
    const y = Number(layer.y || 0);
    const height = Number(layer.height || 0);
    if (!Number.isFinite(y) || !Number.isFinite(height)) return;
    layer.centerY = Math.round((y + height / 2) * 10) / 10;
  }

  function findExactTextLayer(template, names = []) {
    const wanted = names.map(normalize).filter(Boolean);
    return Object.values(template?.layers || {}).find((layer) => {
      if (!layer || layer.type !== 'text') return false;
      const label = normalize(layer.psdName || layer.name || layer.id || '');
      return wanted.some((name) => label === name);
    }) || null;
  }

  function centerTextLayers(template, diagnostics = []) {
    const centerX = getCanvasWidth(template) / 2;
    [
      ['主標題', findExactTextLayer(template, ['主標題', '主標', 'title'])],
      ['副標題', findLayer(template, 'text', ['副標題', '副標', 'subtitle'])],
      ['法務小字', findLayer(template, 'text', ['法務小字', '法務', 'legal'])],
    ].forEach(([field, layer]) => {
      if (!layer) return;
      centerLayerX(layer, centerX);
      syncLayerCenterYFromBox(layer);
      diagnostics.push({ field, status: 'ok', value: `X軸置中 ${Math.round(centerX)}px`, target: layer.psdName || field });
    });
  }

  function applyTopCoverVipLegalPosition(template, diagnostics = []) {
    const legal = findLayer(template, 'text', ['法務小字', '法務', 'legal']);
    if (!legal) return;
    legal.y = TOP_COVER_VIP_LEGAL_POSITION.y;
    legal.centerY = TOP_COVER_VIP_LEGAL_POSITION.centerY;
    diagnostics.push({
      field: '上蓋_VIP 法務小字',
      status: 'ok',
      value: `Y=${TOP_COVER_VIP_LEGAL_POSITION.y}px`,
      target: legal.psdName || '法務小字',
    });
  }

  function hideTemplateSubtitleBackground(template) {
    const bg = findLayer(template, 'shape', ['副標題_BG']);
    if (bg) bg.hidden = true;
    template.renderOrder = (template.renderOrder || []).filter((key) => key !== '副標題_BG');
  }

  function applyFixedSubtitleWidth(template, diagnostics = []) {
    const subtitle = findLayer(template, 'text', ['副標題', '副標', 'subtitle']);
    if (!subtitle) return;
    const centerX = Number(subtitle.centerX || (Number(subtitle.x || 0) + Number(subtitle.width || SUBTITLE_FIXED_WIDTH) / 2) || getCanvasWidth(template) / 2);
    subtitle.width = SUBTITLE_FIXED_WIDTH;
    subtitle.x = Math.round((centerX - SUBTITLE_FIXED_WIDTH / 2) * 10) / 10;
    subtitle.centerX = Math.round(centerX * 10) / 10;
    subtitle.align = 'center';
    syncLayerCenterYFromBox(subtitle);
    diagnostics.push({
      field: '副標題',
      status: 'ok',
      value: `寬度固定 ${SUBTITLE_FIXED_WIDTH}px，藍色膠囊自動寬度邏輯與上蓋_VIP一致`,
      target: subtitle.psdName || '副標題',
    });
  }

  function ensureGeneratedSubtitleFrame(template) {
    template.generatedLayers = template.generatedLayers || {};
    template.generatedLayers.subtitle_frame = {
      type: 'shape',
      source: 'generated',
      fill: '#0053D1',
      radius: 25,
      useDynamicBounds: true,
      shape: {
        kind: 'roundedRectangle',
        cornerRadius: 25,
      },
      rules: {
        dynamicWidth: true,
        widthSource: 'subtitle',
        horizontalPadding: 50,
        fixedHeight: 117,
        radius: 25,
        alignTo: 'layers.subtitle.centerX',
        centerYTo: 'layers.subtitle.centerY',
        centerYOffset: 0,
        compareTitleWidth: true,
        titleWiderThresholdPx: 50,
      },
    };
    const order = (template.renderOrder || []).filter((key) => key !== 'subtitle_frame' && key !== '副標題_BG');
    const subtitleIndex = order.indexOf('subtitle');
    if (subtitleIndex >= 0) {
      order.splice(subtitleIndex, 0, 'subtitle_frame');
    } else {
      order.push('subtitle_frame');
    }
    template.renderOrder = order;
  }

  function getTemplateRouteName(template) {
    const labels = [
      template?.sheetTemplateRoute?.sourceTemplateId,
      template?.templateId,
      template?.batchSourceName,
      template?.source?.psdName,
      template?.canvas?.templateId,
    ];
    const matched = labels.map(resolveRouteName).find(Boolean);
    return matched || '';
  }

  function removeGeneratedSubtitleFrame(template) {
    if (template?.generatedLayers) delete template.generatedLayers.subtitle_frame;
    template.renderOrder = (template.renderOrder || []).filter((key) => key !== 'subtitle_frame');
  }

  function leftAlignCouponTitleLayers(template, diagnostics = []) {
    const titleEntry = findLayerEntry(template, 'text', ['主標題', '主標', 'title']);
    const subtitleEntry = findLayerEntry(template, 'text', ['副標題', '副標', 'subtitle']);
    const title = titleEntry?.[1];
    const subtitle = subtitleEntry?.[1];
    if (!title || !subtitle) return;

    const leftX = Number(title.x || 0);
    title.align = 'left';
    subtitle.align = 'left';
    subtitle.x = leftX;
    subtitle.centerX = leftX + Number(subtitle.width || 0) / 2;
    diagnostics.push({ field: '票券_VIP', status: 'ok', value: `主標/副標靠左，副標 X=${Math.round(leftX)}px`, target: subtitle.psdName || subtitleEntry[0] });
  }

  function setRoundedShapeLayer(layer, radius) {
    if (!layer) return;
    const r = Number(radius || 0);
    layer.radius = r;
    layer.useDynamicBounds = true;
    layer.hidden = false;
    layer.shape = {
      ...(layer.shape || {}),
      kind: 'roundedRectangle',
      cornerRadius: r,
    };
  }

  function applyCouponSmallBlueLabel(template, diagnostics = []) {
    const badge = findLayer(template, 'text', ['小藍標']);
    if (!badge) return;
    badge.italic = true;
    badge.fontStyle = 'Italic';
    diagnostics.push({ field: '小藍標', status: 'ok', value: '斜體', target: badge.psdName || '小藍標' });
  }

  function getCouponVariantText(record = {}, template = {}) {
    const fields = record?.__msFields || {};
    return [
      record?.['票券案型'],
      record?.['案型'],
      record?.['票券'],
      fields['票券案型'],
      fields['案型'],
      fields['小藍標'],
      fields['票券文案'],
      template?.couponVariant,
      template?.pricePresetMeta?.productName,
      findLayer(template, 'text', ['主標題', '主標', 'title'])?.text,
      findLayer(template, 'text', ['副標題', '副標', 'subtitle'])?.text,
    ].filter(Boolean).join(' ');
  }

  function resolveCouponColor(record = {}, template = {}) {
    const text = normalize(getCouponVariantText(record, template));
    const matched = COUPON_COLOR_RULES.find((rule) => text.includes(normalize(rule.keyword)));
    return matched?.color || null;
  }

  function setShapeFill(layer, color) {
    if (!layer || !color) return false;
    layer.fill = color;
    if (layer.shape) {
      layer.shape.fill = color;
      if (layer.shape.rawShapeDescriptor?.adjustment?.[0]?.color) {
        const red = parseInt(color.slice(1, 3), 16);
        const green = parseInt(color.slice(3, 5), 16);
        const blue = parseInt(color.slice(5, 7), 16);
        layer.shape.rawShapeDescriptor.adjustment[0].color.red = red;
        layer.shape.rawShapeDescriptor.adjustment[0].color.grain = green;
        layer.shape.rawShapeDescriptor.adjustment[0].color.blue = blue;
      }
    }
    return true;
  }

  function applyCouponColorByVariant(template, record = {}, diagnostics = []) {
    const color = resolveCouponColor(record, template);
    if (!color) return;

    const couponColorLayer = findLayer(template, 'shape', ['票券顏色', '票券色', '券色']);
    if (setShapeFill(couponColorLayer, color)) {
      diagnostics.push({
        field: '票券顏色',
        status: 'ok',
        value: color,
        target: couponColorLayer.psdName || '票券顏色',
      });
    }
  }


  function applyCouponVipTitleSubtitlePosition(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '票券_VIP') return false;
    const title = findLayer(template, 'text', ['主標題', '主標', 'title']);
    const subtitle = findLayer(template, 'text', ['副標題', '副標', 'subtitle']);
    if (!title || !subtitle) return false;

    Object.assign(title, {
      x: 370,
      y: 129,
      centerX: 600,
      centerY: 153,
      align: 'left',
      hidden: false,
    });
    Object.assign(subtitle, {
      x: 370,
      y: 203,
      centerX: 626,
      centerY: 216,
      align: 'left',
      hidden: false,
    });

    diagnostics.push({
      field: '票券_VIP 主副標位置',
      status: 'ok',
      value: '主標題 X=370 / Y=129；副標題 X=370 / Y=203',
      target: '主標題 + 副標題',
    });
    return true;
  }

  function applyCouponVipLayout(template, diagnostics = [], record = {}) {
    removeGeneratedSubtitleFrame(template);
    leftAlignCouponTitleLayers(template, diagnostics);
    applyCouponVipTitleSubtitlePosition(template, diagnostics);
    applyCouponSmallBlueLabel(template, diagnostics);
    applyCouponColorByVariant(template, record, diagnostics);
    const ctaBg = findLayer(template, 'shape', ['CTA_底色', 'CTA底色', 'cta_bg', 'cta底色']);
    if (ctaBg) {
      setRoundedShapeLayer(ctaBg, 10);
      diagnostics.push({ field: 'CTA_底色', status: 'ok', value: '矩形圓角 10px', target: ctaBg.psdName || 'CTA_底色' });
    }
  }

  function normalizePriceText(value) {
    const raw = String(value || '').trim().replace(/^＄/, '$');
    if (!raw) return '';
    if (/^[$]/.test(raw)) return raw;
    if (/^\d+(?:\.\d+)?\s*起?$/.test(raw)) return `$${raw}`;
    return raw;
  }

  function setTextLayerByExactName(template, layerName, value, diagnostics = []) {
    const cleanValue = String(value || '').trim();
    if (!cleanValue) return false;
    const layer = findLayer(template, 'text', [layerName]);
    if (!layer) {
      diagnostics.push({ field: layerName, status: 'missing-layer', value: cleanValue });
      return false;
    }
    layer.text = cleanValue;
    layer.hidden = false;
    diagnostics.push({ field: layerName, status: 'ok', value: cleanValue, target: layer.psdName || layerName });
    return true;
  }

  function setVisibleLayerByExactName(template, layerName, diagnostics = []) {
    const layer = findLayer(template, null, [layerName]);
    if (!layer) {
      diagnostics.push({ field: layerName, status: 'missing-layer' });
      return false;
    }
    layer.hidden = false;
    diagnostics.push({ field: layerName, status: 'ok', value: '顯示', target: layer.psdName || layerName });
    return true;
  }


  function getSubtitleSplitParts(value = '') {
    const text = String(value || '').trim();
    if (!text) return null;
    const index = text.indexOf('+');
    if (index < 0) return { left: text, plus: '', right: '' };
    return {
      left: text.slice(0, index).trim(),
      plus: '+',
      right: text.slice(index + 1).trim(),
    };
  }

  const BANK_SUBTITLE_LAYER_KEYS = Object.freeze(['副標題_左', '加號', '副標題_右']);

  function isBankSubtitleLayerKey(key = '') {
    return BANK_SUBTITLE_LAYER_KEYS.includes(String(key || ''));
  }

  function getBankSplitSubtitleText(template) {
    const left = findLayer(template, 'text', ['副標題_左']);
    const plus = findLayer(template, 'text', ['加號']);
    const right = findLayer(template, 'text', ['副標題_右']);
    const leftText = String(left?.text || '').trim();
    const plusText = String(plus?.text || '').trim() || '+';
    const rightText = String(right?.text || '').trim();
    if (!leftText && !rightText) return '';
    return rightText ? `${leftText}${plusText}${rightText}` : leftText;
  }

  function ensureBankSubtitleRenderOrder(template) {
    const current = Array.isArray(template.renderOrder) ? template.renderOrder : Object.keys(template.layers || {});
    const subtitleKeys = ['副標題_左', '加號', '副標題_右'];
    const order = current.filter((key) => key !== 'subtitle_frame' && key !== '副標題_BG' && !subtitleKeys.includes(key));
    const titleIndex = order.indexOf('title');
    order.splice(titleIndex >= 0 ? titleIndex : order.length, 0, 'subtitle_frame', ...subtitleKeys);
    template.renderOrder = order;
  }

  function resolveBankRawSubtitle(template, record = {}) {
    const fields = record?.__msFields || {};
    const layerKey = String(record?.layerKey || '');
    const shouldPreserveCurrentSplit = record?.__preserveCurrentBankSplit === true || isBankSubtitleLayerKey(layerKey);

    if (shouldPreserveCurrentSplit) {
      const currentSplitText = getBankSplitSubtitleText(template);
      if (currentSplitText) return currentSplitText;
    }

    const explicitCandidates = [fields['副標題'], fields['副標'], record?.副標題, record?.副標]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    const explicitWithPlus = explicitCandidates.find((value) => value.includes('+'));
    if (explicitWithPlus) return explicitWithPlus;

    const savedRaw = String(template.__msL1BankSubtitleRaw || '').trim();
    if (savedRaw.includes('+')) return savedRaw;

    const splitAlreadyExists = getBankSplitSubtitleText(template);
    if (splitAlreadyExists) return splitAlreadyExists;

    return explicitCandidates[0] || '';
  }

  function applyBankSubtitleSplitLayout(template, record = {}, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_銀行') return false;
    const rawSubtitle = resolveBankRawSubtitle(template, record);
    const parts = getSubtitleSplitParts(rawSubtitle);
    if (!parts) return false;
    template.__msL1BankSubtitleRaw = rawSubtitle;

    const left = findLayer(template, 'text', ['副標題_左']);
    const plus = findLayer(template, 'text', ['加號']);
    const right = findLayer(template, 'text', ['副標題_右']);
    if (!left || !plus || !right) return false;

    left.text = parts.left;
    plus.text = parts.plus || '+';
    right.text = parts.right;
    [left, plus, right].forEach((layer) => { layer.hidden = false; layer.align = 'left'; });

    const gap = 20;
    const leftWidth = Math.max(1, measureText(left, parts.left));
    const plusWidth = parts.plus ? Math.max(1, measureText(plus, '+')) : 0;
    const rightWidth = parts.right ? Math.max(1, measureText(right, parts.right)) : 0;
    const totalWidth = leftWidth + (parts.plus ? gap + plusWidth : 0) + (parts.right ? gap + rightWidth : 0);
    const centerX = getCanvasWidth(template) / 2;
    const startX = Math.round((centerX - totalWidth / 2) * 10) / 10;
    const baseY = Number(left.y || plus.y || right.y || 0);

    Object.assign(left, {
      x: startX,
      y: baseY,
      width: leftWidth,
      centerX,
      align: 'left',
      __msL1SubtitleGroupWidth: totalWidth,
    });
    syncLayerCenterYFromBox(left);

    setLayerPosition(plus, startX + leftWidth + gap, 262);
    plus.width = plusWidth;
    plus.centerX = plus.x + plusWidth / 2;
    plus.hidden = !parts.plus;

    setLayerPosition(right, startX + leftWidth + (parts.plus ? gap + plusWidth : 0) + gap, Number(right.y || baseY));
    right.width = rightWidth;
    right.centerX = right.x + rightWidth / 2;
    right.hidden = !parts.right;

    const frameRules = template?.generatedLayers?.subtitle_frame?.rules;
    if (frameRules) {
      frameRules.widthSource = 'subtitleGroup';
      frameRules.subtitleWidthSource = 'subtitleGroup';
      frameRules.compareTitleWidth = true;
      frameRules.titleWidthSource = 'title';
      frameRules.horizontalPadding = 50;
      frameRules.fixedHeight = 117;
      frameRules.alignTo = 'layers.副標題_左.centerX';
      frameRules.centerYTo = 'layers.副標題_左.centerY';
      frameRules.__msL1BankSubtitleSplit = true;
    }
    ensureBankSubtitleRenderOrder(template);

    diagnostics.push({
      field: '上蓋_銀行 副標題',
      status: 'ok',
      value: `${parts.left}${parts.plus}${parts.right} 拆成副標題_左 / 加號 / 副標題_右，群組置中並作為藍色膠囊寬度`,
      target: '副標題_左 + 加號 + 副標題_右',
    });
    return true;
  }


  function applyBankPriceRotation(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_銀行') return false;
    const price = findLayer(template, 'text', ['價格']);
    if (!price) return false;
    price.x = 95.7;
    price.y = 316.6;
    price.centerX = 163.5;
    price.centerY = 363.5;
    price.rotation = 32;
    price.rotationDeg = 32;
    price.transform = {
      ...(price.transform || {}),
      rotationDeg: 32,
    };
    price.textTransform = {
      ...(price.textTransform || {}),
      rotationDeg: 32,
    };
    diagnostics.push({
      field: '上蓋_銀行 價格',
      status: 'ok',
      value: 'X=95.7 / Y=316.6，旋轉 32°',
      target: price.psdName || '價格',
    });
    return true;
  }


  function applyBankTicketLayerLayout(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_銀行') return false;
    const ticket = findLayer(template, 'image', ['券面']);
    if (!ticket) return false;

    ticket.x = 21;
    ticket.y = 246;
    ticket.width = 232;
    ticket.height = 173;
    ticket.centerX = 137;
    ticket.centerY = 332.5;
    ticket.hidden = false;

    const current = Array.isArray(template.renderOrder) ? template.renderOrder : Object.keys(template.layers || {});
    const order = current.filter((key) => key !== '券面' && key !== '價格');
    if (template.layers?.['券面']) order.push('券面');
    if (template.layers?.['價格']) order.push('價格');
    template.renderOrder = order;

    diagnostics.push({
      field: '上蓋_銀行 票券',
      status: 'ok',
      value: '券面 X=21 / Y=246，票券群組移到最上層',
      target: '券面 + 價格',
    });
    return true;
  }

  function syncRectLayerBounds(layer, box = {}) {
    if (!layer) return;
    const x = Math.round(Number(box.x ?? layer.x ?? 0) * 10) / 10;
    const y = Math.round(Number(box.y ?? layer.y ?? 0) * 10) / 10;
    const width = Math.max(1, Math.round(Number(box.width ?? layer.width ?? 1) * 10) / 10);
    const height = Math.max(1, Math.round(Number(box.height ?? layer.height ?? 1) * 10) / 10);
    const right = Math.round((x + width) * 10) / 10;
    const bottom = Math.round((y + height) * 10) / 10;

    Object.assign(layer, {
      x,
      y,
      width,
      height,
      centerX: Math.round((x + width / 2) * 10) / 10,
      centerY: Math.round((y + height / 2) * 10) / 10,
    });

    if (layer.shape) {
      layer.shape.pathBounds = {
        x,
        y,
        width,
        height,
        centerX: layer.centerX,
        centerY: layer.centerY,
      };
      if (layer.shape.geometry?.bbox) {
        Object.assign(layer.shape.geometry.bbox, {
          x,
          y,
          width,
          height,
          centerX: layer.centerX,
          centerY: layer.centerY,
        });
      }
      if (layer.shape.rawShapeDescriptor?.bounds) {
        const bounds = layer.shape.rawShapeDescriptor.bounds;
        bounds.left = { _unit: 'pixelsUnit', _value: x };
        bounds.top = { _unit: 'pixelsUnit', _value: y };
        bounds.right = { _unit: 'pixelsUnit', _value: right };
        bounds.bottom = { _unit: 'pixelsUnit', _value: bottom };
        bounds.width = { _unit: 'pixelsUnit', _value: width };
        bounds.height = { _unit: 'pixelsUnit', _value: height };
      }
      if (layer.shape.rawShapeDescriptor?.boundsNoEffects) {
        const bounds = layer.shape.rawShapeDescriptor.boundsNoEffects;
        bounds.left = { _unit: 'pixelsUnit', _value: x };
        bounds.top = { _unit: 'pixelsUnit', _value: y };
        bounds.right = { _unit: 'pixelsUnit', _value: right };
        bounds.bottom = { _unit: 'pixelsUnit', _value: bottom };
        bounds.width = { _unit: 'pixelsUnit', _value: width };
        bounds.height = { _unit: 'pixelsUnit', _value: height };
      }
    }
  }

  function applyMiddleTitleBackgroundWidth(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '中標_全橘') return;
    const middleTitle = findLayer(template, 'text', ['中標題']);
    const titleBg = findLayer(template, 'shape', ['中標題_BG']);
    if (!middleTitle || !titleBg) return;

    const titleX = Number(middleTitle.x || 0);
    const titleWidth = Math.max(1, measureText(middleTitle, middleTitle.text));
    middleTitle.width = titleWidth;
    middleTitle.centerX = Math.round((titleX + titleWidth / 2) * 10) / 10;

    const bgX = Number(titleBg.x ?? titleX);
    const bgRight = titleX + titleWidth + 20;
    syncRectLayerBounds(titleBg, {
      x: bgX,
      y: Number(titleBg.y || 0),
      width: bgRight - bgX,
      height: Number(titleBg.height || 0),
    });
    titleBg.hidden = false;

    diagnostics.push({
      field: '中標題_BG',
      status: 'ok',
      value: `右側比中標題多 20px，BG width=${Math.round(titleBg.width)}px`,
      target: titleBg.psdName || '中標題_BG',
    });
  }

  function leftAlignMiddleTitle(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '中標_全橘') return;
    const middleTitle = findLayer(template, 'text', ['中標題']);
    if (!middleTitle) return;
    middleTitle.align = 'left';
    applyMiddleTitleBackgroundWidth(template, diagnostics);
    diagnostics.push({ field: '中標_全橘', status: 'ok', value: '中標文字靠左對齊', target: middleTitle.psdName || '中標題' });
  }

  const TOP_FULL_ORANGE_LOGO_ASSETS = Object.freeze({
    '蝦皮短影音_LOGO': '蝦皮短影音_LOGO.svg',
    '蝦皮直播_LOGO': '蝦皮直播_LOGO.svg',
    'Shopee Prizes_LOGO': 'Shopee Prizes_LOGO.svg',
  });

  function resolveTopFullOrangeTitleLogo(text = '') {
    const raw = String(text || '').trim();
    return Object.entries(TOP_FULL_ORANGE_LOGO_ASSETS).find(([token]) => raw === `(${token})` || raw === `（${token}）`)?.[1] || '';
  }

  function applyTopFullOrangeTitleLogo(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_全橘') return false;
    const title = getPrimaryTitleLayer(template);
    if (!title) return false;
    const assetFilename = resolveTopFullOrangeTitleLogo(title.text);
    const generatedKeys = Object.values(TOP_FULL_ORANGE_LOGO_ASSETS).map((filename) => filename.replace(/\.svg$/i, ''));

    if (!assetFilename) {
      generatedKeys.forEach((key) => { if (template.layers?.[key]?.__msL1GeneratedTopFullOrangeLogo) delete template.layers[key]; });
      template.renderOrder = (template.renderOrder || []).filter((key) => !generatedKeys.includes(key));
      title.hidden = false;
      const frameRules = template?.generatedLayers?.subtitle_frame?.rules;
      if (frameRules && frameRules.titleWidthSource === 'topFullOrangeLogo') {
        frameRules.titleWidthSource = 'title';
      }
      return false;
    }

    template.layers = template.layers || {};
    generatedKeys.forEach((key) => { if (template.layers[key]?.__msL1GeneratedTopFullOrangeLogo) delete template.layers[key]; });
    const logoKey = assetFilename.replace(/\.svg$/i, '');
    template.layers[logoKey] = {
      type: 'image',
      psdName: logoKey,
      x: Number(title.x || 0),
      y: Number(title.y || 0),
      width: Number(title.width || 300),
      height: Number(title.height || 100),
      centerX: Number(title.centerX || (Number(title.x || 0) + Number(title.width || 300) / 2)),
      centerY: Number(title.centerY || (Number(title.y || 0) + Number(title.height || 100) / 2)),
      assetFilename,
      hidden: false,
      keepAspectRatio: true,
      sizingMode: 'containByPBox',
      targetWidth: Number(title.width || 300),
      targetHeight: Number(title.height || 100),
      maxTargetHeight: Number(title.height || 100),
      __msL1GeneratedTopFullOrangeLogo: true,
      __msL1UseAsCapsuleTitleWidth: true,
    };
    title.hidden = true;
    const frameRules = template?.generatedLayers?.subtitle_frame?.rules;
    if (frameRules) {
      frameRules.compareTitleWidth = true;
      frameRules.titleWidthSource = 'topFullOrangeLogo';
      frameRules.widthSource = 'subtitle';
      frameRules.horizontalPadding = Number(frameRules.horizontalPadding ?? 50);
    }
    const order = (template.renderOrder || Object.keys(template.layers)).filter((key) => key !== logoKey && !generatedKeys.includes(key));
    const titleIndex = order.indexOf('title');
    order.splice(titleIndex >= 0 ? titleIndex : order.length, 0, logoKey);
    template.renderOrder = order;
    diagnostics.push({ field: '上蓋_全橘 主標題 LOGO', status: 'ok', value: `只顯示 ${assetFilename}`, target: logoKey });
    return true;
  }

  function applyFreeShippingTableLayout(template, record = {}, diagnostics = []) {
    const fields = record?.__msFields || {};
    const priceMappings = [
      ['蝦皮店到店_價格', '價格_蝦皮店到店'],
      ['隔日到貨_價格', '價格_隔日到貨'],
      ['環保無包裝_價格', '價格_環保無包裝'],
      ['店到家宅配_價格', '價格_店到家宅配'],
      ['價格_蝦皮VIP', '價格_蝦皮VIP'],
    ];

    priceMappings.forEach(([fieldName, layerName]) => {
      setTextLayerByExactName(template, layerName, normalizePriceText(fields[fieldName]), diagnostics);
    });

    setTextLayerByExactName(template, '表格案型_左', fields['表格案型_左'], diagnostics);
    setTextLayerByExactName(template, '表格案型_右', fields['表格案型_右'], diagnostics);
    setTextLayerByExactName(template, '表格案型_下', fields['表格案型_下'], diagnostics);
    setVisibleLayerByExactName(template, '表格案型_格線', diagnostics);
  }


  function getLayerBox(layer) {
    return {
      x: Number(layer?.x || 0),
      y: Number(layer?.y || 0),
      width: Number(layer?.width || 0),
      height: Number(layer?.height || 0),
    };
  }

  function setLayerPosition(layer, x, y) {
    if (!layer) return;
    const width = Number(layer.width || 0);
    const height = Number(layer.height || 0);
    layer.x = Math.round(Number(x || 0) * 10) / 10;
    layer.y = Math.round(Number(y || 0) * 10) / 10;
    layer.centerX = Math.round((layer.x + width / 2) * 10) / 10;
    layer.centerY = Math.round((layer.y + height / 2) * 10) / 10;
  }

  function getCombinedBox(layers = []) {
    const boxes = layers.filter(Boolean).map(getLayerBox);
    if (!boxes.length) return null;
    const left = Math.min(...boxes.map((box) => box.x));
    const top = Math.min(...boxes.map((box) => box.y));
    const right = Math.max(...boxes.map((box) => box.x + box.width));
    const bottom = Math.max(...boxes.map((box) => box.y + box.height));
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      centerX: left + (right - left) / 2,
      centerY: top + (bottom - top) / 2,
    };
  }

  function isVipLogoLayer(layer) {
    if (!layer) return false;
    const label = normalize(`${layer.psdName || ''} ${layer.name || ''} ${layer.role || ''} ${layer.id || ''}`);
    return label.includes(normalize('蝦皮VIP_LOGO'))
      || label.includes(normalize('蝦皮VIP LOGO'))
      || label.includes(normalize('VIP_LOGO'))
      || label.includes(normalize('VIP LOGO'));
  }

  function isShopeeVipLogoLayer(layer) {
    if (!layer) return false;
    const label = normalize(`${layer.psdName || ''} ${layer.name || ''} ${layer.role || ''} ${layer.id || ''}`);
    return label.includes(normalize('蝦皮VIP_LOGO')) || label.includes(normalize('蝦皮VIP LOGO'));
  }

  function getVipLogoAssetFilename(layer) {
    return isShopeeVipLogoLayer(layer) ? SHOPEE_VIP_LOGO_FILENAME : VIP_LOGO_FILENAME;
  }

  function applyTopCoverVipLogoAsset(template, diagnostics = []) {
    Object.values(template?.layers || {}).forEach((layer) => {
      if (layer?.type !== 'image' || !isVipLogoLayer(layer)) return;
      const assetFilename = getVipLogoAssetFilename(layer);
      layer.assetFilename = assetFilename;
      layer.hidden = false;
      diagnostics.push({
        field: 'VIP LOGO素材',
        status: 'ok',
        value: assetFilename,
        target: layer.psdName || layer.name || 'VIP_LOGO',
      });
    });
  }

  function applyTopCoverLogoGroupLayout(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_VIP') return;

    const vipLogo = findLayer(template, 'image', ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO']);
    const logoText = findLayer(template, 'text', ['LOGO_案型', 'logo案型']);
    if (!vipLogo || !logoText) return;
    vipLogo.assetFilename = getVipLogoAssetFilename(vipLogo);
    vipLogo.hidden = false;
    logoText.hidden = false;

    const current = {
      vipX: Number(vipLogo.x || 0),
      vipY: Number(vipLogo.y || 0),
      textX: Number(logoText.x || 0),
      textY: Number(logoText.y || 0),
    };
    const previous = template.__msL1LogoGroupState || null;

    if (previous) {
      const vipDx = current.vipX - Number(previous.vipX || 0);
      const vipDy = current.vipY - Number(previous.vipY || 0);
      const textDx = current.textX - Number(previous.textX || 0);
      const textDy = current.textY - Number(previous.textY || 0);
      const vipMoved = Math.abs(vipDx) > 0.01 || Math.abs(vipDy) > 0.01;
      const textMoved = Math.abs(textDx) > 0.01 || Math.abs(textDy) > 0.01;

      if (vipMoved && !textMoved) {
        setLayerPosition(logoText, Number(logoText.x || 0) + vipDx, Number(logoText.y || 0) + vipDy);
      } else if (textMoved && !vipMoved) {
        setLayerPosition(vipLogo, Number(vipLogo.x || 0) + textDx, Number(vipLogo.y || 0) + textDy);
      }
    }

    const groupBox = getCombinedBox([vipLogo, logoText]);
    if (groupBox) {
      const canvasCenterX = getCanvasWidth(template) / 2;
      const offsetX = canvasCenterX - groupBox.centerX;
      if (Math.abs(offsetX) > 0.01) {
        setLayerPosition(vipLogo, Number(vipLogo.x || 0) + offsetX, Number(vipLogo.y || 0));
        setLayerPosition(logoText, Number(logoText.x || 0) + offsetX, Number(logoText.y || 0));
      }
    }

    template.__msL1LogoGroupState = {
      vipX: Number(vipLogo.x || 0),
      vipY: Number(vipLogo.y || 0),
      textX: Number(logoText.x || 0),
      textY: Number(logoText.y || 0),
    };

    diagnostics.push({
      field: '上蓋_VIP LOGO群組',
      status: 'ok',
      value: '蝦皮VIP_LOGO / LOGO_案型 連動並保持群組 X 軸置中',
      target: '蝦皮VIP_LOGO + LOGO_案型',
    });
  }



  const SHOPEE_DIRECT_LOGO_FILENAME = '蝦皮直營_LOGO.svg';
  const SHOPEE_DIRECT_TITLE_MARKER_PATTERN = /[（(]\s*蝦皮\s*直營\s*logo\s*[)）]/i;
  const SHOPEE_DIRECT_TITLE_GAP = 5;

  function parseLogoTitleText(rawText = '', markerPattern) {
    const text = String(rawText || '').replace(/\s+/g, ' ').trim();
    if (!markerPattern?.test(text)) return null;
    return text.replace(markerPattern, '').trim();
  }

  function ensureLogoTitleRenderOrder(template, logoLayer, titleLayer) {
    if (!template?.layers || !logoLayer || !titleLayer) return;
    const logoKey = Object.entries(template.layers).find(([, layer]) => layer === logoLayer)?.[0];
    const titleKey = Object.entries(template.layers).find(([, layer]) => layer === titleLayer)?.[0];
    if (!logoKey || !titleKey) return;

    const order = (template.renderOrder || Object.keys(template.layers)).filter((key) => key !== logoKey && key !== titleKey);
    const subtitleIndex = order.findIndex((key) => key === 'subtitle_frame' || key === 'subtitle');
    order.splice(subtitleIndex >= 0 ? subtitleIndex : order.length, 0, logoKey, titleKey);
    template.renderOrder = order;
  }

  function applyLogoTitleGroupLayout(template, options = {}, diagnostics = []) {
    const {
      routeName,
      logoLayer,
      titleLayer,
      assetFilename,
      markerPattern,
      gap = 5,
      fieldLabel = 'LOGO + 主標題',
      targetLabel = 'LOGO + 主標題',
      useGroupWidthAsTitleReference = false,
    } = options;

    if (routeName && getTemplateRouteName(template) !== routeName) return false;
    if (!logoLayer || !titleLayer) return false;

    const parsedTitle = parseLogoTitleText(titleLayer.text, markerPattern);
    const titleText = parsedTitle || String(titleLayer.text || '').replace(/\s+/g, ' ').trim();
    if (!titleText) return false;

    const titleWidth = Math.max(1, measureText({ ...titleLayer, text: titleText }, titleText));
    const logoWidth = Number(logoLayer.width || 0);
    const totalWidth = logoWidth + gap + titleWidth;
    const startX = Math.round((getCanvasWidth(template) - totalWidth) / 2);
    const titleX = startX + logoWidth + gap;

    logoLayer.assetFilename = assetFilename || logoLayer.assetFilename;
    logoLayer.hidden = false;
    setLayerPosition(logoLayer, startX, Number(logoLayer.y || titleLayer.y || 0));

    titleLayer.text = titleText;
    titleLayer.hidden = false;

    if (useGroupWidthAsTitleReference) {
      // 讓 app.core 的 subtitle_frame compareTitleWidth 讀到「LOGO + gap + 主標題」整組寬度。
      // 文字本身用 right align，視覺上仍會從 LOGO 右側開始，不會與 LOGO 重疊。
      Object.assign(titleLayer, {
        x: Math.round(startX * 10) / 10,
        width: Math.round(totalWidth * 10) / 10,
        centerX: Math.round((startX + totalWidth / 2) * 10) / 10,
        align: 'right',
        __msL1TitleWidthSource: 'logoTitleGroup',
        __msL1TitleTextWidth: titleWidth,
        __msL1LogoTitleGap: gap,
        __msL1LogoTitleGroupWidth: totalWidth,
      });
    } else {
      Object.assign(titleLayer, {
        x: Math.round(titleX * 10) / 10,
        width: titleWidth,
        centerX: Math.round((titleX + titleWidth / 2) * 10) / 10,
        align: 'left',
      });
      delete titleLayer.__msL1TitleWidthSource;
      delete titleLayer.__msL1TitleTextWidth;
      delete titleLayer.__msL1LogoTitleGap;
      delete titleLayer.__msL1LogoTitleGroupWidth;
    }

    syncLayerCenterYFromBox(titleLayer);
    ensureLogoTitleRenderOrder(template, logoLayer, titleLayer);

    diagnostics.push({
      field: fieldLabel,
      status: 'ok',
      value: `${logoLayer.assetFilename || 'LOGO'} + ${titleText} 群組 X 軸置中${useGroupWidthAsTitleReference ? '，藍色膠囊以整組寬度計算' : ''}`,
      target: targetLabel,
    });
    return true;
  }

  function getShopeeDirectLogoLayer(template) {
    return findLayer(template, 'image', ['蝦皮直營_LOGO', '蝦皮直營 LOGO']);
  }

  function applyShopeeDirectLogoTitleLayout(template, diagnostics = []) {
    return applyLogoTitleGroupLayout(template, {
      routeName: '上蓋_蝦皮直營',
      logoLayer: getShopeeDirectLogoLayer(template),
      titleLayer: getPrimaryTitleLayer(template),
      assetFilename: SHOPEE_DIRECT_LOGO_FILENAME,
      markerPattern: SHOPEE_DIRECT_TITLE_MARKER_PATTERN,
      gap: SHOPEE_DIRECT_TITLE_GAP,
      fieldLabel: '上蓋_蝦皮直營 主標題',
      targetLabel: '蝦皮直營_LOGO + 主標題',
      useGroupWidthAsTitleReference: true,
    }, diagnostics);
  }

  const TOP_COVER_NORMAL_VIP_TITLE_TEXT = '4/18VIP限定';
  const TOP_COVER_NORMAL_VIP_TITLE_GAP = 10;
  const TOP_COVER_NORMAL_VIP_LOGO_SIZE = Object.freeze({ width: 265, height: 95 });
  const TOP_COVER_VIP_LOGO_FIXED_Y = Object.freeze({
    '上蓋_獨享': 108,
    '上蓋_常態': 108,
  });

  function cloneLayerStyle(sourceLayer, overrides = {}) {
    return {
      type: sourceLayer?.type || 'text',
      psdName: sourceLayer?.psdName || '',
      x: Number(sourceLayer?.x || 0),
      y: Number(sourceLayer?.y || 0),
      width: Number(sourceLayer?.width || 0),
      height: Number(sourceLayer?.height || 0),
      centerX: Number(sourceLayer?.centerX || 0),
      centerY: Number(sourceLayer?.centerY || 0),
      text: sourceLayer?.text || '',
      fontSizePt: sourceLayer?.fontSizePt,
      fontSizePx: sourceLayer?.fontSizePx,
      fontSizePtRaw: sourceLayer?.fontSizePtRaw,
      fontFamily: sourceLayer?.fontFamily,
      fontStyle: sourceLayer?.fontStyle,
      fontWeight: sourceLayer?.fontWeight,
      italic: sourceLayer?.italic,
      align: sourceLayer?.align,
      color: sourceLayer?.color,
      lineHeight: sourceLayer?.lineHeight,
      letterSpacing: sourceLayer?.letterSpacing,
      textTransform: sourceLayer?.textTransform ? { ...sourceLayer.textTransform } : undefined,
      textStyleRanges: Array.isArray(sourceLayer?.textStyleRanges)
        ? sourceLayer.textStyleRanges.map((range) => ({ ...range }))
        : undefined,
      dominantStyleSource: sourceLayer?.dominantStyleSource,
      ...overrides,
    };
  }

  function getPrimaryTitleLayer(template) {
    const direct = template?.layers?.title;
    if (direct?.type === 'text') return direct;
    return findLayer(template, 'text', ['主標題', '主標', 'title']);
  }

  function getPrimaryTitleText(template) {
    return String(getPrimaryTitleLayer(template)?.text || '').replace(/\s+/g, '');
  }

  function isNormalVipTitle(template) {
    return getTemplateRouteName(template) === '上蓋_常態'
      && getPrimaryTitleText(template) === TOP_COVER_NORMAL_VIP_TITLE_TEXT;
  }

  function removeNormalVipTitleGroup(template) {
    if (!template?.layers) return;
    const generatedKeys = ['主標題_左', '主標題_右', '蝦皮VIP_LOGO'].filter((key) => template.layers[key]?.__msL1GeneratedNormalVipTitle);
    generatedKeys.forEach((key) => delete template.layers[key]);
    if (generatedKeys.length) {
      template.renderOrder = (template.renderOrder || []).filter((key) => !generatedKeys.includes(key));
      const title = getPrimaryTitleLayer(template);
      if (title) title.hidden = false;
    }
  }

  function ensureNormalVipTitleRenderOrder(template) {
    const order = (template.renderOrder || []).filter((key) => !['主標題_左', '主標題_右', '蝦皮VIP_LOGO'].includes(key));
    const titleIndex = order.indexOf('title');
    const insertAt = titleIndex >= 0 ? titleIndex + 1 : order.length;
    order.splice(insertAt, 0, '主標題_左', '蝦皮VIP_LOGO', '主標題_右');
    template.renderOrder = order;
  }

  function ensureTopCoverVisibleRenderOrder(template) {
    if (!template?.layers) return;
    const desired = ['蝦皮VIP_LOGO', 'LOGO_案型', 'title', '主標題_右', '主標題_左'];
    const current = Array.isArray(template.renderOrder) ? [...template.renderOrder] : Object.keys(template.layers || {});
    const order = current.filter((key) => template.layers?.[key] || template.generatedLayers?.[key]);
    const addIfMissing = (key, beforeKeys = []) => {
      const layer = template.layers?.[key];
      if (!layer || layer.hidden === true || order.includes(key)) return;
      const beforeIndex = order.findIndex((item) => beforeKeys.includes(item));
      order.splice(beforeIndex >= 0 ? beforeIndex : order.length, 0, key);
    };

    // VIP logo 必須在 LOGO_案型 前面，否則圖層存在但 canvas 不會畫出來。
    addIfMissing('蝦皮VIP_LOGO', ['LOGO_案型']);
    addIfMissing('LOGO_案型', ['title', 'subtitle_frame', 'subtitle']);
    addIfMissing('title', ['subtitle_frame', 'subtitle']);
    addIfMissing('主標題_右');
    addIfMissing('主標題_左');
    template.renderOrder = order;
  }

  function ensureNormalVipTitleGroup(template, diagnostics = []) {
    if (!isNormalVipTitle(template)) {
      removeNormalVipTitleGroup(template);
      return false;
    }

    const title = getPrimaryTitleLayer(template);
    if (!title) return false;
    template.layers = template.layers || {};
    title.hidden = true;

    const titleY = Number(title.y || 144);
    const titleHeight = Number(title.height || getFontSize(title));
    const groupCenterY = Number(title.centerY || (titleY + titleHeight / 2));
    const leftText = '4/18';
    const rightText = '限定';
    const leftWidth = Math.max(1, measureText({ ...title, text: leftText }, leftText));
    const rightWidth = Math.max(1, measureText({ ...title, text: rightText }, rightText));
    const logoWidth = TOP_COVER_NORMAL_VIP_LOGO_SIZE.width;
    const logoHeight = TOP_COVER_NORMAL_VIP_LOGO_SIZE.height;
    const totalWidth = leftWidth + TOP_COVER_NORMAL_VIP_TITLE_GAP + logoWidth + TOP_COVER_NORMAL_VIP_TITLE_GAP + rightWidth;
    const startX = Math.round((getCanvasWidth(template) - totalWidth) / 2);
    const leftX = startX;
    const logoX = leftX + leftWidth + TOP_COVER_NORMAL_VIP_TITLE_GAP;
    const rightX = logoX + logoWidth + TOP_COVER_NORMAL_VIP_TITLE_GAP;

    template.layers['主標題_左'] = cloneLayerStyle(title, {
      psdName: '主標題_左',
      text: leftText,
      x: leftX,
      y: titleY,
      width: leftWidth,
      height: titleHeight,
      centerX: leftX + leftWidth / 2,
      centerY: groupCenterY,
      align: 'right',
      hidden: false,
      __msL1GeneratedNormalVipTitle: true,
    });
    template.layers['蝦皮VIP_LOGO'] = {
      type: 'image',
      psdName: '蝦皮VIP_LOGO',
      x: logoX,
      y: Math.round((groupCenterY - logoHeight / 2) * 10) / 10,
      width: logoWidth,
      height: logoHeight,
      centerX: logoX + logoWidth / 2,
      centerY: groupCenterY,
      assetFilename: SHOPEE_VIP_LOGO_FILENAME,
      hidden: false,
      __msL1GeneratedNormalVipTitle: true,
    };
    template.layers['主標題_右'] = cloneLayerStyle(title, {
      psdName: '主標題_右',
      text: rightText,
      x: rightX,
      y: titleY,
      width: rightWidth,
      height: titleHeight,
      centerX: rightX + rightWidth / 2,
      centerY: groupCenterY,
      align: 'left',
      hidden: false,
      __msL1GeneratedNormalVipTitle: true,
    });

    ensureNormalVipTitleRenderOrder(template);
    diagnostics.push({
      field: '上蓋_常態 主標題',
      status: 'ok',
      value: `4/18 + ${SHOPEE_VIP_LOGO_FILENAME} + 限定 群組 X 軸置中`,
      target: '主標題_左 + 蝦皮VIP_LOGO + 主標題_右',
    });
    return true;
  }

  function splitVipTitleText(rawText = '') {
    const text = String(rawText || '').replace(/\s+/g, ' ').trim();
    const match = text.match(/^(.*?)\s*VIP\s*(.*?)$/i);
    if (!match) return null;
    return {
      leftText: match[1].trim(),
      rightText: match[2].trim(),
    };
  }

  function getTopCoverTitleSourceLayer(template) {
    const routeName = getTemplateRouteName(template);
    if (routeName === '上蓋_獨享') {
      return template?.layers?.['主標題_左'] || getPrimaryTitleLayer(template);
    }
    return getPrimaryTitleLayer(template);
  }

  function getVipTitleLogoLayer(template) {
    return findLayer(template, 'image', ['蝦皮VIP_LOGO', 'VIP LOGO']);
  }

  function getVipSplitTitleLayers(template) {
    return {
      left: findLayer(template, 'text', ['主標題_左']),
      right: findLayer(template, 'text', ['主標題_右']),
      logo: getVipTitleLogoLayer(template),
    };
  }

  function positionVipSplitTitleGroup(template, diagnostics = []) {
    const routeName = getTemplateRouteName(template);
    if (!['上蓋_獨享', '上蓋_常態'].includes(routeName)) return false;

    const sourceTitle = getTopCoverTitleSourceLayer(template);
    const split = splitVipTitleText(sourceTitle?.text || '');
    if (!split) return false;

    const { left, right, logo } = getVipSplitTitleLayers(template);
    if (!left || !right || !logo) return false;

    const leftText = split.leftText;
    const rightText = split.rightText;
    const titleY = Number(sourceTitle.y || left.y || right.y || 0);
    const titleHeight = Number(sourceTitle.height || left.height || right.height || getFontSize(sourceTitle));
    const groupCenterY = Number(sourceTitle.centerY || left.centerY || right.centerY || (titleY + titleHeight / 2));
    const gap = routeName === '上蓋_獨享' ? 10 : TOP_COVER_NORMAL_VIP_TITLE_GAP;

    left.text = leftText;
    right.text = rightText;
    logo.assetFilename = getVipLogoAssetFilename(logo);

    [left, right, logo].forEach((layer) => { layer.hidden = false; });

    const leftWidth = Math.max(1, measureText({ ...left, text: leftText }, leftText));
    const rightWidth = Math.max(1, measureText({ ...right, text: rightText }, rightText));
    const logoWidth = Number(logo.width || TOP_COVER_NORMAL_VIP_LOGO_SIZE.width);
    const logoHeight = Number(logo.height || TOP_COVER_NORMAL_VIP_LOGO_SIZE.height);
    const totalWidth = leftWidth + gap + logoWidth + gap + rightWidth;
    const startX = Math.round((getCanvasWidth(template) - totalWidth) / 2);
    const logoX = startX + leftWidth + gap;
    const rightX = logoX + logoWidth + gap;

    Object.assign(left, {
      x: startX,
      y: titleY,
      width: leftWidth,
      height: titleHeight,
      centerX: startX + leftWidth / 2,
      centerY: groupCenterY,
      align: 'right',
    });

    const logoY = TOP_COVER_VIP_LOGO_FIXED_Y[routeName]
      ?? Math.round((groupCenterY - logoHeight / 2) * 10) / 10;

    Object.assign(logo, {
      x: logoX,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
      centerX: logoX + logoWidth / 2,
      centerY: logoY + logoHeight / 2,
    });

    Object.assign(right, {
      x: rightX,
      y: titleY,
      width: rightWidth,
      height: titleHeight,
      centerX: rightX + rightWidth / 2,
      centerY: groupCenterY,
      align: 'left',
    });

    if (routeName === '上蓋_常態' && template.layers?.title) template.layers.title.hidden = true;

    ensureVipSplitTitleRenderOrder(template);
    diagnostics.push({
      field: `${routeName} 主標題拆解`,
      status: 'ok',
      value: `${leftText} + ${logo.assetFilename || getVipLogoAssetFilename(logo)} + ${rightText}`,
      target: '主標題_左 + 蝦皮VIP_LOGO + 主標題_右',
    });
    return true;
  }

  function ensureVipSplitTitleRenderOrder(template) {
    if (!template?.layers) return;
    const keys = ['主標題_左', '蝦皮VIP_LOGO', '主標題_右'];
    const order = (template.renderOrder || Object.keys(template.layers)).filter((key) => !keys.includes(key));
    const subtitleIndex = order.findIndex((key) => key === 'subtitle_frame' || key === 'subtitle');
    order.splice(subtitleIndex >= 0 ? subtitleIndex : order.length, 0, ...keys.filter((key) => template.layers[key] && template.layers[key].hidden !== true));
    template.renderOrder = order;
  }

  function centerExclusiveSubtitle(template, diagnostics = []) {
    if (getTemplateRouteName(template) !== '上蓋_獨享') return;
    const subtitle = findLayer(template, 'text', ['副標題', '副標', 'subtitle']);
    if (!subtitle) return;
    centerLayerX(subtitle, getCanvasWidth(template) / 2);
    subtitle.align = 'center';
    const frameRules = template?.generatedLayers?.subtitle_frame?.rules;
    if (frameRules) {
      frameRules.dynamicWidth = true;
      frameRules.widthSource = 'subtitle';
      frameRules.horizontalPadding = 50;
      frameRules.fixedHeight = 117;
      frameRules.radius = 25;
      frameRules.alignTo = 'layers.subtitle.centerX';
      frameRules.centerYTo = 'layers.subtitle.centerY';
      frameRules.compareTitleWidth = true;
      frameRules.titleWiderThresholdPx = 50;
    }
    diagnostics.push({
      field: '上蓋_獨享 副標題',
      status: 'ok',
      value: '副標題與藍色膠囊固定畫布 X 軸置中，不跟主標題群組連動',
      target: subtitle.psdName || '副標題',
    });
  }

  function applyTopCoverSubtitleFrameOffset(template, routeName, diagnostics = []) {
    const frameRules = template?.generatedLayers?.subtitle_frame?.rules;
    if (!frameRules) return;

    const offsetY = 0;
    frameRules.centerYOffset = offsetY;
    frameRules.dynamicWidth = true;
    frameRules.widthSource = 'subtitle';
    frameRules.horizontalPadding = 50;
    frameRules.fixedHeight = 117;
    frameRules.radius = 25;
    if (routeName === '上蓋_銀行') {
      frameRules.alignTo = 'layers.副標題_左.centerX';
      frameRules.centerYTo = 'layers.副標題_左.centerY';
      frameRules.widthSource = 'subtitleGroup';
      frameRules.subtitleWidthSource = 'subtitleGroup';
      frameRules.titleWidthSource = 'title';
      frameRules.__msL1BankSubtitleSplit = true;
    } else {
      frameRules.alignTo = 'layers.subtitle.centerX';
      frameRules.centerYTo = 'layers.subtitle.centerY';
      frameRules.titleWidthSource = routeName === '上蓋_蝦皮直營' ? 'logoTitleGroup' : 'title';
    }
    frameRules.compareTitleWidth = true;
    frameRules.titleWiderThresholdPx = 50;

    diagnostics.push({
      field: '上蓋藍色膠囊',
      status: 'ok',
      value: `centerYOffset=${offsetY}px`,
      target: routeName || '上蓋',
    });
  }

  function isStandardTopCoverRoute(routeName) {
    return ['上蓋_VIP', '上蓋_常態', '上蓋_底橘', '上蓋_全橘', '上蓋_銀行', '上蓋_免運', '上蓋_獨享', '上蓋_蝦皮直營'].includes(routeName);
  }

  function isTopCoverRoute(routeName) {
    return isStandardTopCoverRoute(routeName) || routeName === '上蓋_獨享';
  }

  function applyTopCoverLayout(template, diagnostics = [], record = {}) {
    const routeName = getTemplateRouteName(template);
    if (isStandardTopCoverRoute(routeName)) {
      hideTemplateSubtitleBackground(template);
      ensureGeneratedSubtitleFrame(template);
      if (routeName === '上蓋_銀行') applyBankSubtitleSplitLayout(template, record, diagnostics);
      else applyFixedSubtitleWidth(template, diagnostics);
      applyTopCoverSubtitleFrameOffset(template, routeName, diagnostics);
    } else {
      removeGeneratedSubtitleFrame(template);
    }
    applyTopCoverVipLogoAsset(template, diagnostics);
    applyTopCoverLogoGroupLayout(template, diagnostics);
    if (routeName === '上蓋_銀行') {
      const title = findExactTextLayer(template, ['主標題', '主標', 'title']);
      if (title) centerLayerX(title, getCanvasWidth(template) / 2);
      const legal = findLayer(template, 'text', ['法務小字', '法務', 'legal']);
      if (legal) centerLayerX(legal, getCanvasWidth(template) / 2);
      applyBankSubtitleSplitLayout(template, record, diagnostics);
      applyBankPriceRotation(template, diagnostics);
      applyBankTicketLayerLayout(template, diagnostics);
    } else {
      centerTextLayers(template, diagnostics);
    }
    applyShopeeDirectLogoTitleLayout(template, diagnostics);
    applyTopFullOrangeTitleLogo(template, diagnostics);
    centerExclusiveSubtitle(template, diagnostics);
    const splitTitleApplied = positionVipSplitTitleGroup(template, diagnostics);
    if (!splitTitleApplied) ensureNormalVipTitleGroup(template, diagnostics);
    ensureTopCoverVisibleRenderOrder(template);
    if (routeName === '上蓋_銀行') applyBankTicketLayerLayout(template, diagnostics);
    applyTopCoverShadowEffects(template, routeName, diagnostics);
  }


  function applyMSL1Layout(template, diagnostics = [], record = {}) {
    const routeName = getTemplateRouteName(template);
    clearTopCoverShadowEffects(template);
    if (routeName === '表格_免運') {
      clearAllShadowEffects(template);
      applyFreeShippingTableLayout(template, record, diagnostics);
      return;
    }
    if (routeName === '票券_VIP') {
      applyCouponVipLayout(template, diagnostics, record);
      return;
    }
    if (routeName === '中標_全橘') {
      removeGeneratedSubtitleFrame(template);
      leftAlignMiddleTitle(template, diagnostics);
      return;
    }
    if (isTopCoverRoute(routeName)) {
      applyTopCoverLayout(template, diagnostics, record);
      if (routeName === '上蓋_VIP') applyTopCoverVipLegalPosition(template, diagnostics);
      return;
    }
    removeGeneratedSubtitleFrame(template);
  }

  registry.register('ms_l1', {
    family: 'ms_l1',
    label: 'MS L1',
    priority: 1000,
    tokens: [...Object.keys(routes), 'ms_l1'],
    targets: Object.keys(routes),
    rules: {
      layoutRules: {
        applyProgrammaticLayout({ template }) {
          const routeName = getTemplateRouteName(template);
          if (!isTopCoverRoute(routeName)) return;
          applyTopCoverLayout(template, [], {});
          if (routeName === '上蓋_VIP') applyTopCoverVipLegalPosition(template, []);
        },
      },
      resolveRecordTemplateRoute({ block }) {
        const routeName = resolveRouteName(block?.name);
        return routeName ? routes[routeName] : null;
      },
      beforeApplyRecordToTemplate({ template, record, diagnostics }) {
        template.ruleFamily = 'ms_l1';
        applyMSL1Layout(template, diagnostics || [], record || {});
      },
      afterApplyRecordToTemplate({ template, record, diagnostics }) {
        // MS 版型只使用模板既有圖層與 MS 專屬規則，不套用 DD/HBN/POPUP/SKBN 商品圖與價格連動規則。
        template.ruleFamily = 'ms_l1';
        applyMSL1Layout(template, diagnostics || [], record || {});
      },
      afterLayerTextChange({ template, record, diagnostics }) {
        // 手動修改文字時保留目前畫面上的文字內容。
        // 尤其「上蓋_銀行」的副標題是拆成 副標題_左 / 加號 / 副標題_右，
        // 不能再用舊的 __msL1BankSubtitleRaw 或空 record 把使用者剛輸入的文字覆蓋掉。
        template.ruleFamily = 'ms_l1';
        const routeName = getTemplateRouteName(template);
        const nextRecord = { ...(record || {}) };
        if (routeName === '上蓋_銀行') nextRecord.__preserveCurrentBankSplit = true;
        applyMSL1Layout(template, diagnostics || [], nextRecord);
      },
    },
  });

  window.MSL1TemplateRules = { routes };
})();
