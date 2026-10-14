/* Headband Shopee template rules – V4.18
 * Patch:
 * 1) 蝦皮購物_LOGO 固定使用 assets/01_頭巾/蝦皮購物_LOGO.png。
 * 2) 副標讀到「VIP」時，固定拆成「蝦皮VIP_LOGO.svg + 副標文字」群組。
 * 3) 宣告頭巾 CTA 三版本輸出規格：下單去 / 點我領 / 兌換完畢。
 */
(function () {
  'use strict';

  const HEADBAND_ASSETS = Object.freeze({
    SHOPPING_LOGO: '01_頭巾/蝦皮購物_LOGO.png',
    SHOPEE_VIP_LOGO: '蝦皮VIP_LOGO.svg',
  });

  const VIP_SUBTITLE_LAYOUT = Object.freeze({
    logo: { x: 121, y: 127, width: 130, height: 45 },
    subtitle: { x: 257, y: 141, height: 31 },
    gapPx: 5,
  });

  const HEADBAND_CTA_VARIANTS = Object.freeze([
    { id: 'order_now', label: '下單去', ctaText: '下單去', showCta: true, showSoldOut: false },
    { id: 'claim_now', label: '點我領', ctaText: '點我領', showCta: true, showSoldOut: false },
    { id: 'sold_out', label: '兌換完畢', ctaText: '', showCta: false, showSoldOut: true },
  ]);

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const normalize = (value) => toText(value)
    .toLowerCase()
    .replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, '')
    .replace(/[＿－—–]/g, '');

  function findLayer(template, keys = []) {
    const layers = template?.layers || {};
    for (const key of keys) {
      if (layers[key]) return layers[key];
    }

    const wanted = keys.map(normalize).filter(Boolean);
    return Object.values(layers).find((layer) => {
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''} ${layer?.text || ''}`);
      return wanted.some((word) => label.includes(word));
    }) || null;
  }

  function setLayerVisible(layer, visible) {
    if (!layer) return;
    layer.hidden = !visible;
    layer.visible = visible;
  }

  function ensureShopeeVipLogoLayer(template) {
    const layers = template?.layers || {};
    const existing = findLayer(template, ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO', 'VIP_LOGO']);
    if (existing) return existing;

    const layer = {
      type: 'image',
      psdName: '蝦皮VIP_LOGO',
      x: VIP_SUBTITLE_LAYOUT.logo.x,
      y: VIP_SUBTITLE_LAYOUT.logo.y,
      width: VIP_SUBTITLE_LAYOUT.logo.width,
      height: VIP_SUBTITLE_LAYOUT.logo.height,
      centerX: VIP_SUBTITLE_LAYOUT.logo.x + VIP_SUBTITLE_LAYOUT.logo.width / 2,
      centerY: VIP_SUBTITLE_LAYOUT.logo.y + VIP_SUBTITLE_LAYOUT.logo.height / 2,
      assetFilename: HEADBAND_ASSETS.SHOPEE_VIP_LOGO,
      assetCandidates: [HEADBAND_ASSETS.SHOPEE_VIP_LOGO],
      keepAspectRatio: true,
      hidden: false,
      visible: true,
      text: '',
    };

    layers['蝦皮VIP_LOGO'] = layer;
    const order = template.renderOrder;
    if (Array.isArray(order) && !order.includes('蝦皮VIP_LOGO')) {
      const subtitleIndex = order.findIndex((key) => ['subtitle', '副標題'].includes(key));
      order.splice(subtitleIndex >= 0 ? subtitleIndex + 1 : order.length, 0, '蝦皮VIP_LOGO');
    }

    return layer;
  }


  function applyShoppingLogoAsset(template, diagnostics) {
    const layer = findLayer(template, ['蝦皮購物_LOGO', '蝦皮購物 LOGO', '蝦皮購物logo']);
    if (!layer) {
      diagnostics?.push?.({ field: '蝦皮購物_LOGO', status: 'missing-layer', value: HEADBAND_ASSETS.SHOPPING_LOGO, target: 'Headband Shopee Logo Resolver' });
      return;
    }

    layer.type = 'image';
    layer.assetFilename = HEADBAND_ASSETS.SHOPPING_LOGO;
    layer.assetCandidates = [HEADBAND_ASSETS.SHOPPING_LOGO, '蝦皮購物_LOGO.png'];
    layer.keepAspectRatio = true;
    layer.text = '';
    setLayerVisible(layer, true);

    diagnostics?.push?.({ field: '蝦皮購物_LOGO', status: 'ok', value: HEADBAND_ASSETS.SHOPPING_LOGO, target: 'Headband Shopee Logo Resolver' });
  }

  function applyVipSubtitleLogoRule(template, diagnostics) {
    const subtitle = findLayer(template, ['subtitle', '副標題']);
    if (!subtitle) return;

    const originalText = toText(subtitle.text);
    const hasVip = /VIP/i.test(originalText);

    // 非 VIP 副標不可建立 / 顯示 VIP LOGO。
    // 前一版在判斷 hasVip 前就 ensureShopeeVipLogoLayer()，導致蝦皮購物版也多出蝦皮VIP_LOGO.svg。
    if (!hasVip) {
      const existingVipLogo = findLayer(template, ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO', 'VIP_LOGO']);
      setLayerVisible(existingVipLogo, false);
      diagnostics?.push?.({ field: '副標題', status: 'skip', value: originalText, target: 'Headband VIP Subtitle Logo Rule' });
      return;
    }

    const vipLogo = ensureShopeeVipLogoLayer(template);

    const nextSubtitle = originalText
      .replace(/\bVIP\b/gi, '')
      .replace(/^\s*[+＋｜|／/・,，、-]+\s*/g, '')
      .trim();

    vipLogo.type = 'image';
    vipLogo.psdName = '蝦皮VIP_LOGO';
    vipLogo.assetFilename = HEADBAND_ASSETS.SHOPEE_VIP_LOGO;
    vipLogo.assetCandidates = [HEADBAND_ASSETS.SHOPEE_VIP_LOGO];
    vipLogo.keepAspectRatio = true;
    vipLogo.x = VIP_SUBTITLE_LAYOUT.logo.x;
    vipLogo.y = VIP_SUBTITLE_LAYOUT.logo.y;
    vipLogo.width = VIP_SUBTITLE_LAYOUT.logo.width;
    vipLogo.height = VIP_SUBTITLE_LAYOUT.logo.height;
    vipLogo.centerX = vipLogo.x + vipLogo.width / 2;
    vipLogo.centerY = vipLogo.y + vipLogo.height / 2;
    vipLogo.text = '';
    setLayerVisible(vipLogo, true);

    subtitle.text = nextSubtitle;
    subtitle.x = VIP_SUBTITLE_LAYOUT.subtitle.x;
    subtitle.y = VIP_SUBTITLE_LAYOUT.subtitle.y;
    subtitle.height = subtitle.height || VIP_SUBTITLE_LAYOUT.subtitle.height;
    subtitle.centerY = subtitle.y + subtitle.height / 2;
    subtitle.align = 'center';

    diagnostics?.push?.({
      field: '副標題',
      status: 'ok',
      value: `${HEADBAND_ASSETS.SHOPEE_VIP_LOGO} + ${nextSubtitle}`,
      target: 'Headband VIP Subtitle Logo Rule',
    });
  }

  function resolveCtaVariant(record) {
    const raw = normalize(record?.__headbandCtaVariant || record?._headbandCtaVariant || record?.CTA_案型 || record?.cta || '');
    if (raw.includes('點我領') || raw.includes('claimnow')) return HEADBAND_CTA_VARIANTS[1];
    if (raw.includes('兌換完畢') || raw.includes('soldout')) return HEADBAND_CTA_VARIANTS[2];
    return HEADBAND_CTA_VARIANTS[0];
  }

  function applyCtaVariant(template, record, diagnostics) {
    const variant = resolveCtaVariant(record);
    const ctaText = findLayer(template, ['CTA_案型', 'CTA案型']);
    const ctaBg = findLayer(template, ['CTA_BG', 'CTA BG']);
    const soldOut = findLayer(template, ['兌換完畢']);

    if (ctaText) ctaText.text = variant.ctaText;
    setLayerVisible(ctaText, variant.showCta);
    setLayerVisible(ctaBg, variant.showCta);
    setLayerVisible(soldOut, variant.showSoldOut);

    diagnostics?.push?.({ field: 'CTA_案型', status: 'ok', value: variant.label, target: 'Headband CTA Variant Rule' });
  }

  function createHeadbandVariantRecords(record = {}) {
    return HEADBAND_CTA_VARIANTS.map((variant) => ({
      ...record,
      CTA_案型: variant.ctaText,
      __headbandCtaVariant: variant.id,
      __outputSuffix: variant.label,
    }));
  }

  const RULES = {
    capsuleRules: {},
    variantRules: {
      enabled: true,
      mode: 'duplicate-records',
      variants: HEADBAND_CTA_VARIANTS,
      createVariantRecords: createHeadbandVariantRecords,
    },
    layoutRules: {
      headbandShopeeTitleLine: {
        enabled: true,
        gapPx: VIP_SUBTITLE_LAYOUT.gapPx,
        anchorLogoLayers: ['18號會員日_LOGO', '18號會員日 LOGO'],
        vipLogoLayers: ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO', 'VIP_LOGO'],
        subtitleLayers: ['subtitle', '副標題'],
        legalLayers: ['legal', '法務', '法務小字'],
        backgroundLayerKey: '案型_BG',
        backgroundFill: '#0053D1',
        backgroundPaddingX: 25,
        widthCompareThresholdPx: 70,
        dynamicBackgroundWidth: true,
      },
    },
    textRules: {
      '票券_案型': { lineHeightPx: 43, align: 'center' },
      '票券案型': { lineHeightPx: 43, align: 'center' },
    },
    shapeLayers: {
      '三角形': { renderer: 'asset', asset: '三角形.svg', exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '標籤_底色': { renderer: 'asset', asset: '標籤_底色.svg', exactAsset: true, useLayerBounds: true, assetSizing: 'stretch' },
      '蝦皮VIP_LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPEE_VIP_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPEE_VIP_LOGO], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '蝦皮VIP LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPEE_VIP_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPEE_VIP_LOGO], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      'VIP LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPEE_VIP_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPEE_VIP_LOGO], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      'VIP_LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPEE_VIP_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPEE_VIP_LOGO], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '圓形CTA_BG': { renderer: 'circle', fill: '#000000' },
      'CTA_BG': { renderer: 'roundedRectangle', fill: '#EE4D2D', radius: 5 },
      '蝦皮購物_LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPPING_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPPING_LOGO, '蝦皮購物_LOGO.png'], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '蝦皮購物 LOGO': { renderer: 'asset', asset: HEADBAND_ASSETS.SHOPPING_LOGO, assetCandidates: [HEADBAND_ASSETS.SHOPPING_LOGO, '蝦皮購物_LOGO.png'], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '券面顏色': { renderer: 'rectangle', fill: '#EE4D2D' },
    },
    priceRules: { enabled: false, coordinateMode: 'absolute', templateLayouts: {}, productLayouts: {} },

    createVariantRecords: createHeadbandVariantRecords,
    expandRecordVariants: createHeadbandVariantRecords,

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      applyShoppingLogoAsset(template, diagnostics);
      applyCtaVariant(template, record, diagnostics);
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      applyShoppingLogoAsset(template, diagnostics);
      applyVipSubtitleLogoRule(template, diagnostics);
      applyCtaVariant(template, record, diagnostics);
    },
  };

  window.TemplateRuleRegistry?.register?.('headband_shopee', {
    family: 'headband_shopee',
    label: 'Headband Shopee',
    priority: 31,
    tokens: ['headband_shopee', 'headband shopee', 'hdb shopee', '頭巾蝦皮購物', '頭巾_蝦皮購物', '01_頭巾_蝦皮購物', '頭巾全站', '頭巾_全站', '01_頭巾_全站'],
    targets: ['headband_shopee', 'headband shopee', 'hdb shopee', '頭巾蝦皮購物', '頭巾_蝦皮購物', '01_頭巾_蝦皮購物', '頭巾全站', '頭巾_全站', '01_頭巾_全站'],
    rules: RULES,
  });
})();
