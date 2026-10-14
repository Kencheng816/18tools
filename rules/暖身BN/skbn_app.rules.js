/* SKBN_APP template rules – V4.17 */
(function () {
  'use strict';

const FAMILY = 'skbn_app';
  const KEYWORD_VIP = 'VIP';
  const VIP_LOGO_ASSET = '06_SKBN_APP/蝦皮VIP_LOGO.svg';
  const CTA_ASSET = '06_SKBN_APP/SKBN_APP_CTA.png';
  const VIP_TEXT_GAP_PX = 5;
  const WHOLE_SITE_PRICE_COLOR = '#EE4D2D';

  const VIP_LOGO_CONFIRMED_BOX = Object.freeze({
    x: 69.5,
    y: 74.3,
    width: 151,
    height: 53.4,
    centerX: 145,
    centerY: 101,
  });

  const ROUTES = Object.freeze({
    center: {
      key: 'skbn_app_center', family: FAMILY, label: 'SKBN APP 中',
      templateId: 'SKBN_中_APP', templateFile: '06_SKBN_#U4e2d_APP.json',
      ruleFile: 'skbn_app.rules.js', outputPrefix: 'SKBN_APP_中', placement: 'SKBN_中',
    },
    centerVip: {
      key: 'skbn_app_center_vip', family: FAMILY, label: 'SKBN APP 中 VIP',
      templateId: 'SKBN_中_APP_VIP', templateFile: '06_SKBN_#U4e2d_APP_VIP.json',
      ruleFile: 'skbn_app.rules.js', outputPrefix: 'SKBN_APP_中_VIP', placement: 'SKBN_中',
    },
    left: {
      key: 'skbn_app_left', family: FAMILY, label: 'SKBN APP 左',
      templateId: 'SKBN_左_APP', templateFile: '06_SKBN_#U5de6_APP.json',
      ruleFile: 'skbn_app.rules.js', outputPrefix: 'SKBN_APP_左', placement: 'SKBN_左',
    },
    right: {
      key: 'skbn_app_right', family: FAMILY, label: 'SKBN APP 右',
      templateId: 'SKBN_左_APP', templateFile: '06_SKBN_#U5de6_APP.json',
      ruleFile: 'skbn_app.rules.js', outputPrefix: 'SKBN_APP_右', placement: 'SKBN_右',
    },
  });

  const CONFIRMED_PRESETS = Object.freeze({
    "SKBN_APP_中_VIP_01": {
        "routeKey": "skbn_app_center_vip",
        "sourceTemplateId": "SKBN_中_APP_VIP",
        "productName": "VIP_單券_蝦幣_有價格",
        "productImageBox": {
            "x": 30,
            "y": 140,
            "width": 344,
            "height": 192,
            "centerX": 202,
            "centerY": 236,
            "targetWidth": 344,
            "targetHeight": 192,
            "maxTargetHeight": 192
        },
        "layoutKey": "",
        "layouts": []
    },
    "SKBN_APP_中_01": {
        "routeKey": "skbn_app_center",
        "sourceTemplateId": "SKBN_中_APP",
        "productName": "全站_雙券",
        "productImageBox": {
            "x": 97,
            "y": 132,
            "width": 287,
            "height": 207,
            "centerX": 240.5,
            "centerY": 235.5,
            "targetWidth": 287,
            "targetHeight": 207,
            "maxTargetHeight": 207
        },
        "layoutKey": "doubleCoupon",
        "layouts": [
            {
                "slot": "bottom",
                "text": "88折",
                "psdName": "價格1（下券）",
                "leftX": 216.8,
                "topY": 238.77,
                "width": 138.8,
                "height": 77.76,
                "rotation": 2,
                "fontSizePx": 72,
                "lineHeight": 77.76,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 45.7,
                "offsetY": 42.15,
                "rotationOffset": 2,
                "baseFontSizePx": 72,
                "baseWidth": 138.8,
                "baseHeight": 67.7
            },
            {
                "slot": "top",
                "text": "88折",
                "psdName": "價格2（上券）",
                "leftX": 186.8,
                "topY": 149.47,
                "width": 138.8,
                "height": 77.76,
                "rotation": -6,
                "fontSizePx": 72,
                "lineHeight": 77.76,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 15.7,
                "offsetY": -47.15,
                "rotationOffset": -6,
                "baseFontSizePx": 72,
                "baseWidth": 138.8,
                "baseHeight": 67.7
            }
        ]
    },
    "SKBN_APP_中_02": {
        "routeKey": "skbn_app_center",
        "sourceTemplateId": "SKBN_中_APP",
        "productName": "全站_雙券",
        "productImageBox": {
            "x": 97,
            "y": 132,
            "width": 287,
            "height": 207,
            "centerX": 240.5,
            "centerY": 235.5,
            "targetWidth": 287,
            "targetHeight": 207,
            "maxTargetHeight": 207
        },
        "layoutKey": "doubleCoupon",
        "layouts": [
            {
                "slot": "bottom",
                "text": "$40",
                "psdName": "價格1（下券）",
                "leftX": 212.8,
                "topY": 241.3,
                "width": 145,
                "height": 81,
                "rotation": 2,
                "fontSizePx": 72,
                "lineHeight": 77.76,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 44.8,
                "offsetY": 46.3,
                "rotationOffset": 2,
                "baseFontSizePx": 72,
                "baseWidth": 145,
                "baseHeight": 81
            },
            {
                "slot": "top",
                "text": "$40",
                "psdName": "價格2（上券）",
                "leftX": 181.6,
                "topY": 154.6,
                "width": 145,
                "height": 77.8,
                "rotation": -6,
                "fontSizePx": 72,
                "lineHeight": 77.76,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 13.6,
                "offsetY": -42,
                "rotationOffset": -6,
                "baseFontSizePx": 72,
                "baseWidth": 145,
                "baseHeight": 77.8
            }
        ]
    },
    "SKBN_APP_中_03": {
        "routeKey": "skbn_app_center",
        "sourceTemplateId": "SKBN_中_APP",
        "productName": "蝦幣堆",
        "productImageBox": {
            "x": 79.3,
            "y": 147.9,
            "width": 322.5,
            "height": 175.4,
            "centerX": 240.6,
            "centerY": 235.6,
            "targetWidth": 322.5,
            "targetHeight": 175.4,
            "maxTargetHeight": 175.4
        },
        "layoutKey": "",
        "layouts": []
    },
    "SKBN_APP_左_01": {
        "routeKey": "skbn_app_left",
        "sourceTemplateId": "SKBN_左_APP",
        "productName": "全站_雙券",
        "productImageBox": {
            "x": 27,
            "y": 143,
            "width": 246,
            "height": 177,
            "centerX": 150,
            "centerY": 231.5,
            "targetWidth": 246,
            "targetHeight": 177,
            "maxTargetHeight": 177
        },
        "layoutKey": "doubleCoupon",
        "layouts": [
            {
                "slot": "bottom",
                "text": "$500",
                "psdName": "價格1（下券）",
                "leftX": 119.8,
                "topY": 241.8,
                "width": 138.8,
                "height": 67.7,
                "rotation": 2,
                "fontSizePx": 52,
                "lineHeight": 56.16,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 39.2,
                "offsetY": 44.15,
                "rotationOffset": 2,
                "baseFontSizePx": 52,
                "baseWidth": 138.8,
                "baseHeight": 67.7
            },
            {
                "slot": "top",
                "text": "$500",
                "psdName": "價格2（上券）",
                "leftX": 102.9,
                "topY": 164.9,
                "width": 116.5,
                "height": 56.9,
                "rotation": -6,
                "fontSizePx": 52,
                "lineHeight": 56.16,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 11.15,
                "offsetY": -38.15,
                "rotationOffset": -6,
                "baseFontSizePx": 52,
                "baseWidth": 116.5,
                "baseHeight": 56.9
            }
        ]
    },
    "SKBN_APP_右_01": {
        "routeKey": "skbn_app_right",
        "sourceTemplateId": "SKBN_左_APP",
        "productName": "全站_雙券",
        "productImageBox": {
            "x": 27,
            "y": 143,
            "width": 246,
            "height": 177,
            "centerX": 150,
            "centerY": 231.5,
            "targetWidth": 246,
            "targetHeight": 177,
            "maxTargetHeight": 177
        },
        "layoutKey": "doubleCoupon",
        "layouts": [
            {
                "slot": "bottom",
                "text": "$40",
                "psdName": "價格1（下券）",
                "leftX": 118.8,
                "topY": 236.79,
                "width": 138.8,
                "height": 67.72,
                "rotation": 2,
                "fontSizePx": 62.7,
                "lineHeight": 67.72,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 38.2,
                "offsetY": 39.15,
                "rotationOffset": 2,
                "baseFontSizePx": 62.7,
                "baseWidth": 138.8,
                "baseHeight": 67.7
            },
            {
                "slot": "top",
                "text": "$40",
                "psdName": "價格2（上券）",
                "leftX": 89.8,
                "topY": 160.49,
                "width": 138.8,
                "height": 67.72,
                "rotation": -6,
                "fontSizePx": 62.7,
                "lineHeight": 67.72,
                "letterSpacing": 0,
                "lineHeightMultiplier": 1.08,
                "color": "#EE4D2D",
                "followProduct": true,
                "skipAutoScale": true,
                "preserveExactSize": true,
                "disableContentScale": true,
                "offsetX": 9.2,
                "offsetY": -37.15,
                "rotationOffset": -6,
                "baseFontSizePx": 62.7,
                "baseWidth": 138.8,
                "baseHeight": 67.7
            }
        ]
    }
});


  function createTemplateLayoutsFromPresets(presets) {
    const layoutsByTemplate = {};
    Object.values(presets || {}).forEach((preset) => {
      if (!preset?.sourceTemplateId || layoutsByTemplate[preset.sourceTemplateId]) return;
      layoutsByTemplate[preset.sourceTemplateId] = {
        productImageBox: preset.productImageBox,
        layoutKey: preset.layoutKey || 'noPrice',
        layouts: preset.layouts || [],
      };
    });
    Object.entries(presets || {}).forEach(([presetId, preset]) => {
      layoutsByTemplate[presetId] = {
        productImageBox: preset.productImageBox,
        layoutKey: preset.layoutKey || 'noPrice',
        layouts: preset.layouts || [],
      };
    });
    return Object.freeze(layoutsByTemplate);
  }

  const CONFIRMED_TEMPLATE_LAYOUTS = createTemplateLayoutsFromPresets(CONFIRMED_PRESETS);


  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
  const normalize = (value) => String(value || '')
    .toLowerCase()
    .replace(/vip/gi, 'vip')
    .replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '')
    .replace(/[＿－—–]/g, '');

  function containsVip(value) { return toText(value).toUpperCase().includes(KEYWORD_VIP); }
  function removeVipText(value) { return toText(value).replace(/VIP\s*/i, '').trim(); }
  function isSKBNAPPBlock(blockName = '') {
    const name = normalize(blockName);
    return name.includes('skbnapp') || name.includes(normalize('SKBN APP'));
  }
  function isWholeSiteProduct(value) { return /^全站[_\s-]?.+/i.test(toText(value)); }

  function findLayerByWords(template, type, words = [], helpers) {
    if (!template?.layers) return null;
    const norm = helpers?.norm || normalize;
    const normalizedWords = words.map(norm).filter(Boolean);
    return Object.values(template.layers).find((layer) => {
      if (type && layer?.type !== type) return false;
      const label = norm(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return normalizedWords.some((word) => label.includes(word));
    }) || null;
  }

  function getSubtitleLayer(template, helpers) {
    return template?.layers?.subtitle || findLayerByWords(template, 'text', ['副標題', '副標', 'subtitle'], helpers);
  }
  function getVipLogoLayer(template, helpers) {
    // SKBN_APP 的 VIP 副標只能使用「蝦皮VIP_LOGO.svg」，不可退回使用 SKBN_PC 的「VIP_LOGO.svg」。
    return template?.layers?.['蝦皮VIP_LOGO']
      || findLayerByWords(template, 'image', ['蝦皮VIP_LOGO', '蝦皮VIP', '蝦皮VIP LOGO'], helpers);
  }
  function getProductLayerKey(template) {
    const entries = Object.entries(template?.layers || {});
    const matched = entries.find(([key, layer]) => {
      const label = normalize(`${key} ${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return layer?.type === 'image' && (label.includes('product') || label.includes('曝品') || label === 'p');
    });
    return matched?.[0] || (template?.layers?.product ? 'product' : '');
  }

  function measureTextWidth(layer) {
    const text = toText(layer?.text);
    const fontSize = Number(layer?.fontSizePx || layer?.fontSize || 36);
    if (!text) return 0;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const weight = layer?.fontWeight || '500';
      const family = layer?.fontFamily || 'ShopeeNotoSans Content, sans-serif';
      context.font = `${weight} ${fontSize}px ${family}`;
      return Math.ceil(context.measureText(text).width);
    } catch (_) {
      const wideChars = [...text].filter((ch) => /[^\x00-\xff]/.test(ch)).length;
      const narrowChars = text.length - wideChars;
      return Math.ceil((wideChars * fontSize) + (narrowChars * fontSize * 0.58));
    }
  }

  function setLayerX(layer, x) {
    if (!layer) return;
    layer.x = round(x);
    layer.centerX = round(layer.x + Number(layer.width || 0) / 2);
  }

  function assignBox(layer, box) {
    if (!layer || !box) return;
    ['x', 'y', 'width', 'height', 'centerX', 'centerY', 'targetWidth', 'targetHeight', 'maxTargetHeight'].forEach((prop) => {
      if (Number.isFinite(Number(box[prop]))) layer[prop] = Number(box[prop]);
    });
    layer.keepAspectRatio = true;
    layer.sizingMode = 'containByPBox';
  }

  function assignVipLogoBox(layer) {
    if (!layer) return;
    layer.y = VIP_LOGO_CONFIRMED_BOX.y;
    layer.width = VIP_LOGO_CONFIRMED_BOX.width;
    layer.height = VIP_LOGO_CONFIRMED_BOX.height;
    layer.centerY = VIP_LOGO_CONFIRMED_BOX.centerY;
    layer.targetWidth = VIP_LOGO_CONFIRMED_BOX.width;
  }

  function alignVipSubtitleGroup(template, helpers, diagnostics) {
    const subtitle = getSubtitleLayer(template, helpers);
    const vipLogo = getVipLogoLayer(template, helpers);
    if (!subtitle || !vipLogo) return;
    vipLogo.assetFilename = VIP_LOGO_ASSET;
    vipLogo.hidden = false;
    vipLogo.keepAspectRatio = true;
    assignVipLogoBox(vipLogo);
    subtitle.align = 'left';
    subtitle.textAlign = 'left';
    subtitle.hidden = !toText(subtitle.text);
    subtitle.width = round(Math.max(1, measureTextWidth(subtitle)));
    const canvasWidth = Number(template?.canvas?.width || 0);
    const groupWidth = Number(vipLogo.width || 0) + VIP_TEXT_GAP_PX + Number(subtitle.width || 0);
    const groupX = canvasWidth ? (canvasWidth - groupWidth) / 2 : Number(vipLogo.x || 0);
    setLayerX(vipLogo, groupX);
    setLayerX(subtitle, groupX + Number(vipLogo.width || 0) + VIP_TEXT_GAP_PX);
    diagnostics?.push?.({ field: '副標', status: 'ok', value: subtitle.text, target: `蝦皮VIP_LOGO.svg 使用確認版 Y=${VIP_LOGO_CONFIRMED_BOX.y}，${VIP_TEXT_GAP_PX}px + 副標群組置中` });
  }

  function applyUnifiedCta(template, diagnostics) {
    const ctaLayer = template?.layers?.cta || findLayerByWords(template, 'image', ['cta', '按鈕', 'button']);
    if (!ctaLayer) {
      diagnostics?.push?.({ field: 'CTA', status: 'missing-layer', value: CTA_ASSET, target: 'SKBN APP 共用 CTA 圖層' });
      return;
    }
    ctaLayer.assetFilename = CTA_ASSET;
    ctaLayer.hidden = false;
    ctaLayer.keepAspectRatio = true;
    diagnostics?.push?.({ field: 'CTA', status: 'ok', value: CTA_ASSET, target: 'SKBN APP 全版位共用 CTA' });
  }

  function normalizePlacement(value) {
    const placement = normalize(value);
    if (placement.includes(normalize('SKBN_中')) || placement.includes('center') || placement.includes('middle')) return 'center';
    if (placement.includes(normalize('SKBN_左')) || placement.includes('left')) return 'left';
    if (placement.includes(normalize('SKBN_右')) || placement.includes('right')) return 'right';
    return '';
  }

  function resolveRoute(block = {}, record = {}) {
    let placement = normalizePlacement(record['版位'] || block.name);
    const blockLabel = normalize(block.name);
    // Excel sometimes writes only "SKBN APP" / "C2C SKBN APP (需切圖)" without SKBN_中/左/右.
    // APP defaults to center so the block still generates previews.
    if (!placement && isSKBNAPPBlock(block.name)) placement = 'center';
    if (!placement) return null;
    if (placement === 'center') {
      const routeHint = toText(record['版位'] || block.name);
      const isVipRoute = containsVip(record['副標']) || containsVip(routeHint);
      return isVipRoute ? { ...ROUTES.centerVip } : { ...ROUTES.center };
    }
    if (placement === 'left') return { ...ROUTES.left };
    if (placement === 'right') return { ...ROUTES.right };
    return null;
  }

  function resolveConfirmedPreset(template, record = {}) {
    const templateId = template?.templateId || '';
    if (CONFIRMED_PRESETS[templateId]) return CONFIRMED_PRESETS[templateId];
    const routeKey = template?.sheetTemplateRoute?.key || '';
    const rawPrice = toText(record?.['價格'] || template?.pricePresetMeta?.rawPrice || '');
    const productName = normalize(record?.['商品圖1'] || template?.pricePresetMeta?.productName || '');
    return Object.values(CONFIRMED_PRESETS).find((preset) => {
      if (preset.routeKey !== routeKey) return false;
      const presetProduct = normalize(preset.productName || '');
      if (presetProduct && productName && !productName.includes(presetProduct)) return false;
      const priceTexts = (preset.layouts || []).map((layout) => toText(layout.text)).filter(Boolean);
      return priceTexts.length ? priceTexts.includes(rawPrice) : !rawPrice;
    }) || Object.values(CONFIRMED_PRESETS).find((preset) => {
      if (preset.routeKey !== routeKey) return false;
      const presetProduct = normalize(preset.productName || '');
      return !presetProduct || !productName || productName.includes(presetProduct);
    }) || null;
  }

  function applyConfirmedProductPreset(template, record, diagnostics) {
    const preset = resolveConfirmedPreset(template, record);
    if (!preset?.productImageBox) return;
    const productKey = getProductLayerKey(template);
    const productLayer = productKey ? template.layers?.[productKey] : null;
    if (!productLayer) return;
    assignBox(productLayer, preset.productImageBox);
    diagnostics?.push?.({ field: '商品圖1', status: 'ok', value: preset.productName, target: `${template?.templateId || preset.routeKey} 確認版商品圖位置/大小` });
  }

  function applyConfirmedPricePreset(template, record, diagnostics) {
    const preset = resolveConfirmedPreset(template, record);
    if (!preset?.layouts?.length) return;
    const productKey = getProductLayerKey(template);
    const productLayer = productKey ? template.layers?.[productKey] : null;
    const productBox = preset.productImageBox || null;
    preset.layouts.forEach((layout) => {
      const layerKey = `__auto_price_v2_${layout.slot}`;
      const layer = template?.layers?.[layerKey];
      if (!layer) return;
      layer.x = Number(layout.leftX);
      layer.y = Number(layout.topY);
      layer.width = Number(layout.width);
      layer.height = Number(layout.height);
      layer.centerX = round(layer.x + layer.width / 2);
      layer.centerY = round(layer.y + layer.height / 2);
      layer.rotation = Number(layout.rotation || 0);
      layer.fontSizePx = Number(layout.fontSizePx);
      layer.fontSizePt = Number(layout.fontSizePx);
      layer.lineHeight = Number(layout.lineHeight || round(layout.fontSizePx * (layout.lineHeightMultiplier || 1.08)));
      layer.letterSpacing = Number(layout.letterSpacing || 0);
      layer.lineHeightMultiplier = Number(layout.lineHeightMultiplier || 1.08);
      layer.color = isWholeSiteProduct(record?.['商品圖1']) ? WHOLE_SITE_PRICE_COLOR : (layout.color || layer.color || '#D0011B');
      layer.followProduct = true;
      layer.skipAutoScale = true;
      layer.preserveExactSize = true;
      layer.disableContentScale = true;
      layer.anchor = {
        ...(layer.anchor || {}),
        layerKey: productKey || layer.anchor?.layerKey || 'product',
        baseBox: productBox || layer.anchor?.baseBox || null,
        baseRotation: Number(productLayer?.rotation || 0),
        offsetX: Number(layout.offsetX ?? layer.anchor?.offsetX ?? 0),
        offsetY: Number(layout.offsetY ?? layer.anchor?.offsetY ?? 0),
        rotationOffset: Number(layout.rotationOffset ?? layout.rotation ?? 0),
        baseFontSizePx: Number(layout.baseFontSizePx ?? layout.fontSizePx),
        baseWidth: Number(layout.baseWidth ?? layout.width),
        baseHeight: Number(layout.baseHeight ?? layout.height),
      };
    });
    diagnostics?.push?.({ field: '價格', status: 'ok', value: toText(record?.['價格']), target: `${template?.templateId || preset.routeKey} 確認版價格位置/大小/字級` });
  }

  const SKBNAPPTemplateRules = {
    priceRules: {
      enabled: true,
      productFirst: false,
      // V5.04：補上 coordinateMode: 'absolute'。
      // 沒有這個旗標時，若商品名稱/templateId 不在 CONFIRMED_TEMPLATE_LAYOUTS 裡，
      // app.core.js 的 PriceRuleEngine.classify() 會靜默 fallback 到 DDCard 的硬編碼座標
      // （defaultLayouts，是為 531x792 版面設計的），畫在 SKBN_APP 版面上位置一定是錯的。
      // 加上這個旗標後，比對不到會直接印警告、不產生價格，跟 ddcard/hbn/popup/skbn_pc 行為一致。
      coordinateMode: 'absolute',
      lockToEditedJson: true,
      anchorLayerName: '商品圖1',
      anchorLayerNames: ['商品圖1', 'P1', '曝品', 'product', 'P'],
      defaultColor: '#D0011B',
      templateLayouts: CONFIRMED_TEMPLATE_LAYOUTS,
    },

    resolveRecordTemplateRoute({ block, record }) {
      if (!isSKBNAPPBlock(block?.name) && !normalizePlacement(block?.name) && !normalizePlacement(record?.['版位'])) return null;
      return resolveRoute(block, record);
    },

    beforeApplyRecordToTemplate({ record, diagnostics }) {
      if (!containsVip(record?.['副標'])) return;
      record['副標'] = removeVipText(record['副標']);
      diagnostics?.push?.({ field: '副標', status: 'ok', value: record['副標'], target: '移除文字 VIP，改用蝦皮VIP_LOGO.svg' });
    },

    afterApplyRecordToTemplate({ template, record, diagnostics, helpers }) {
      applyUnifiedCta(template, diagnostics);
      applyConfirmedProductPreset(template, record, diagnostics);
      applyConfirmedPricePreset(template, record, diagnostics);
      if (template?.sheetTemplateRoute?.key === 'skbn_app_center_vip') alignVipSubtitleGroup(template, helpers, diagnostics);
      if (isWholeSiteProduct(record?.['商品圖1'])) {
        Object.values(template?.layers || {}).forEach((layer) => {
          if (layer?.source === 'auto_price_v2') layer.color = WHOLE_SITE_PRICE_COLOR;
        });
        diagnostics?.push?.({ field: '價格', status: 'ok', value: WHOLE_SITE_PRICE_COLOR, target: '商品圖1=全站_XX，價格改橘色' });
      }
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'SKBN_APP',
    priority: 23,
    tokens: ['skbn_app', 'skbnapp', 'skbn app', 'SKBN APP', 'C2C SKBN APP', 'SKBN (NUZ) APP', 'SKBN_中', 'SKBN_左', 'SKBN_右'],
    targets: ['skbn_app', 'skbnapp', 'skbn app', 'SKBN APP', 'C2C SKBN APP', 'SKBN (NUZ) APP', 'SKBN_中_APP', 'SKBN_中_APP_VIP', 'SKBN_左_APP', '06_SKBN_中_APP', '06_SKBN_中_APP_VIP', '06_SKBN_左_APP'],
    rules: SKBNAPPTemplateRules,
  });
})();