/* SKBN_PC template rules – V4.17 */
(function () {
  'use strict';

const FAMILY = 'skbn_pc';
  const TEMPLATE_BASE = '06_SKBN_PC';
  const TEMPLATE_VIP = '06_SKBN_PC_VIP';
  const KEYWORD_VIP = 'VIP';
  const VIP_LOGO_ASSET = '06_SKBN_PC/VIP_LOGO.svg';
  const VIP_TEXT_GAP_PX = 2;

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  function containsVip(value) {
    return toText(value).toUpperCase().includes(KEYWORD_VIP);
  }

  function removeVipText(value) {
    return toText(value).replace(/VIP\s*/i, '').trim();
  }

  function setLayerX(layer, x) {
    if (!layer) return;
    layer.x = round(x);
    layer.centerX = round(layer.x + Number(layer.width || 0) / 2);
  }

  function findLayerByWords(template, type, words = [], helpers) {
    if (!template?.layers) return null;
    const norm = helpers?.norm || ((value) => String(value || '').toLowerCase());
    const normalizedWords = words.map(norm).filter(Boolean);
    return Object.values(template.layers).find((layer) => {
      if (type && layer?.type !== type) return false;
      const label = norm(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return normalizedWords.some((word) => label.includes(word));
    }) || null;
  }

  function getSubtitleLayer(template, helpers) {
    return template?.layers?.subtitle
      || findLayerByWords(template, 'text', ['副標題', '副標', 'subtitle'], helpers);
  }

  function getVipLogoLayer(template, helpers) {
    return template?.layers?.VIP_LOGO
      || findLayerByWords(template, 'image', ['VIP_LOGO', 'VIP LOGO', 'viplogo'], helpers);
  }

  function getPriceLayers(template) {
    const explicitLayers = ['價格', '價格_2']
      .map((name) => template?.layers?.[name])
      .filter(Boolean);
    if (explicitLayers.length) return explicitLayers;
    return Object.values(template?.layers || {}).filter((layer) => {
      if (layer?.type !== 'text') return false;
      const label = String(`${layer?.psdName || ''} ${layer?.role || ''}`).toLowerCase();
      return label.includes('價格') || label.includes('price');
    });
  }

  function alignAllTextLeft(template) {
    Object.values(template?.layers || {}).forEach((layer) => {
      if (layer?.type !== 'text') return;
      if (layer?.source === 'auto_price_v2') return;
      layer.align = 'left';
      layer.textAlign = 'left';
    });
  }

  function hidePlaceholderPriceLayers(template) {
    getPriceLayers(template).forEach((layer) => {
      if (layer?.source === 'auto_price_v2') return;
      layer.text = '';
      layer.hidden = true;
    });
  }

  function applyVipSubtitleLayout(template, helpers, diagnostics) {
    const subtitle = getSubtitleLayer(template, helpers);
    const vipLogo = getVipLogoLayer(template, helpers);
    if (!subtitle || !vipLogo) return;
    vipLogo.assetFilename = VIP_LOGO_ASSET;
    vipLogo.hidden = false;
    vipLogo.keepAspectRatio = true;
    subtitle.align = 'left';
    subtitle.textAlign = 'left';
    setLayerX(subtitle, Number(vipLogo.x || 0) + Number(vipLogo.width || 0) + VIP_TEXT_GAP_PX);
    diagnostics?.push?.({
      field: '副標',
      status: 'ok',
      value: subtitle.text,
      target: `VIP_LOGO.svg + ${VIP_TEXT_GAP_PX}px + 副標靠左`,
    });
  }

  function normalizeRouteHint(value) {
    return toText(value)
      .toLowerCase()
      .replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '')
      .replace(/[＿－—–]/g, '');
  }

  function hasVipSubtitle(record = {}) {
    return containsVip(record?.['副標']);
  }

  function resolveRoute(record) {
    const isVip = hasVipSubtitle(record);
    const templateId = isVip ? TEMPLATE_VIP : TEMPLATE_BASE;
    return {
      key: isVip ? 'skbn_pc_vip' : 'skbn_pc',
      family: FAMILY,
      label: isVip ? 'SKBN_PC VIP' : 'SKBN_PC',
      templateId,
      templateFile: `${templateId}.json`,
      outputPrefix: 'SKBN_PC',
      skbnVariant: isVip ? 'vip' : 'default',
    };
  }

  const SKBNPCTemplateRules = {
    priceRules: {
      enabled: true,
      productFirst: false,
      resolvePriority: 'templateFirst',
      coordinateMode: 'absolute',
      positioningMode: 'absolute',
      anchorLayerName: '商品圖1',
      anchorLayerNames: ['商品圖1', 'P1', '曝品', 'product_1', 'product', 'P'],
      defaultColor: '#D0011B',
      templateLayouts: {
        "SKBN_PC_01": {
  "layoutKey": "productOnly",
  "productName": "VIP_單券_蝦幣_有價格",
  "productImageBox": {
    "x": 223.2,
    "y": 20.4,
    "width": 109.3,
    "height": 68.1,
    "centerX": 277.8,
    "centerY": 54.4,
    "targetWidth": 109.3,
    "targetHeight": 68.1,
    "maxTargetHeight": 68.1
  },
  "suppressPrice": true,
  "sourceTemplateId": "SKBN_PC_01_edited"
},
        "SKBN_PC_02": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 210,
    "y": 14,
    "width": 116,
    "height": 83,
    "centerX": 268,
    "centerY": 55.5,
    "targetWidth": 116,
    "targetHeight": 83,
    "maxTargetHeight": 83
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 233.3,
      "topY": 23.3,
      "width": 84,
      "height": 28,
      "centerX": 275.3,
      "centerY": 37.3,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 244,
      "topY": 60,
      "width": 84,
      "height": 28,
      "centerX": 286,
      "centerY": 74,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_03": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 225.2,
    "y": 17.1,
    "width": 101.9,
    "height": 73.8,
    "centerX": 276.1,
    "centerY": 54,
    "targetWidth": 101.9,
    "targetHeight": 73.8,
    "maxTargetHeight": 73.8
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 239.4,
      "topY": 24.4,
      "width": 84,
      "height": 28,
      "centerX": 281.4,
      "centerY": 38.4,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28.08,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 249.6,
      "topY": 57.2,
      "width": 84,
      "height": 28,
      "centerX": 291.6,
      "centerY": 71.2,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_04": {
  "layoutKey": "productOnly",
  "productName": "蝦幣堆",
  "productImageBox": {
    "x": 201.6,
    "y": 24.1,
    "width": 130.3,
    "height": 70.9,
    "centerX": 266.8,
    "centerY": 59.6,
    "targetWidth": 130.3,
    "targetHeight": 70.9,
    "maxTargetHeight": 70.9
  }
},
        "SKBN_PC_05": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 210,
    "y": 14,
    "width": 116,
    "height": 83,
    "centerX": 268,
    "centerY": 55.5,
    "targetWidth": 116,
    "targetHeight": 83,
    "maxTargetHeight": 83
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 231.5,
      "topY": 23.2,
      "width": 84,
      "height": 28,
      "centerX": 273.5,
      "centerY": 37.2,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 243.6,
      "topY": 60,
      "width": 84,
      "height": 28,
      "centerX": 285.6,
      "centerY": 74,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_06": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 227.2,
    "y": 14.4,
    "width": 101.9,
    "height": 73.8,
    "centerX": 278.1,
    "centerY": 51.3,
    "targetWidth": 101.9,
    "targetHeight": 73.8,
    "maxTargetHeight": 73.8
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 240.8,
      "topY": 21.5,
      "width": 84,
      "height": 28,
      "centerX": 282.8,
      "centerY": 35.5,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 252,
      "topY": 53.7,
      "width": 84,
      "height": 28,
      "centerX": 294,
      "centerY": 67.7,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_07": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 210,
    "y": 14,
    "width": 116,
    "height": 83,
    "centerX": 268,
    "centerY": 55.5,
    "targetWidth": 116,
    "targetHeight": 83,
    "maxTargetHeight": 83
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 233.3,
      "topY": 23.3,
      "width": 84,
      "height": 28,
      "centerX": 275.3,
      "centerY": 37.3,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 244,
      "topY": 60,
      "width": 84,
      "height": 28,
      "centerX": 286,
      "centerY": 74,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_08": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 210,
    "y": 14,
    "width": 116,
    "height": 83,
    "centerX": 268,
    "centerY": 55.5,
    "targetWidth": 116,
    "targetHeight": 83,
    "maxTargetHeight": 83
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 233.3,
      "topY": 23.3,
      "width": 84,
      "height": 28,
      "centerX": 275.3,
      "centerY": 37.3,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 244,
      "topY": 60,
      "width": 84,
      "height": 28,
      "centerX": 286,
      "centerY": 74,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_09": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 225.2,
    "y": 17.1,
    "width": 101.9,
    "height": 73.8,
    "centerX": 276.1,
    "centerY": 54,
    "targetWidth": 101.9,
    "targetHeight": 73.8,
    "maxTargetHeight": 73.8
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 239.4,
      "topY": 24.4,
      "width": 84,
      "height": 28,
      "centerX": 281.4,
      "centerY": 38.4,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28.08,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 249.6,
      "topY": 57.2,
      "width": 84,
      "height": 28,
      "centerX": 291.6,
      "centerY": 71.2,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_10": {
  "layoutKey": "productOnly",
  "productName": "蝦幣堆",
  "productImageBox": {
    "x": 201.6,
    "y": 24.1,
    "width": 130.3,
    "height": 70.9,
    "centerX": 266.8,
    "centerY": 59.6,
    "targetWidth": 130.3,
    "targetHeight": 70.9,
    "maxTargetHeight": 70.9
  }
},
        "SKBN_PC_11": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 210,
    "y": 14,
    "width": 116,
    "height": 83,
    "centerX": 268,
    "centerY": 55.5,
    "targetWidth": 116,
    "targetHeight": 83,
    "maxTargetHeight": 83
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 231.5,
      "topY": 23.2,
      "width": 84,
      "height": 28,
      "centerX": 273.5,
      "centerY": 37.2,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 243.6,
      "topY": 60,
      "width": 84,
      "height": 28,
      "centerX": 285.6,
      "centerY": 74,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        "SKBN_PC_12": {
  "layoutKey": "doubleCoupon",
  "productName": "全站_雙券",
  "productImageBox": {
    "x": 227.2,
    "y": 14.4,
    "width": 101.9,
    "height": 73.8,
    "centerX": 278.1,
    "centerY": 51.3,
    "targetWidth": 101.9,
    "targetHeight": 73.8,
    "maxTargetHeight": 73.8
  },
  "isDoubleCoupon": true,
  "layouts": [
    {
      "slot": "top",
      "psdName": "價格2（上券）",
      "positioningMode": "absolute",
      "leftX": 240.8,
      "topY": 21.5,
      "width": 84,
      "height": 28,
      "centerX": 282.8,
      "centerY": 35.5,
      "rotation": -6,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    },
    {
      "slot": "bottom",
      "psdName": "價格1（下券）",
      "positioningMode": "absolute",
      "leftX": 252,
      "topY": 53.7,
      "width": 84,
      "height": 28,
      "centerX": 294,
      "centerY": 67.7,
      "rotation": 2,
      "fontSizePx": 26,
      "fontSizePt": 26,
      "lineHeight": 28,
      "letterSpacing": 0,
      "color": "#EE4D2D",
      "preserveExactSize": true,
      "skipAutoScale": true,
      "lockToEditedJson": true,
      "followProduct": true,
      "disableContentScale": true
    }
  ]
},
        SKBN_PC_DOUBLE_COUPON_FALLBACK: {
          layoutKey: 'doubleCoupon',
          isDoubleCoupon: true,
          productName: '全站_雙券',
          layouts: [
            { slot: 'top', psdName: '價格2（上券）', positioningMode: 'absolute', leftX: 233.3, topY: 23.3, width: 84, height: 28, centerX: 275.3, centerY: 37.3, rotation: -6, fontSizePx: 26, fontSizePt: 26, lineHeight: 28, letterSpacing: 0, color: '#EE4D2D', preserveExactSize: true, skipAutoScale: true, lockToEditedJson: true, followProduct: true, disableContentScale: true },
            { slot: 'bottom', psdName: '價格1（下券）', positioningMode: 'absolute', leftX: 244, topY: 60, width: 84, height: 28, centerX: 286, centerY: 74, rotation: 2, fontSizePx: 26, fontSizePt: 26, lineHeight: 28, letterSpacing: 0, color: '#EE4D2D', preserveExactSize: true, skipAutoScale: true, lockToEditedJson: true, followProduct: true, disableContentScale: true },
          ],
        },
      },
      productLayouts: {
        'VIP_單券_蝦幣_有價格': { productName: 'VIP_單券_蝦幣_有價格', useTemplate: 'SKBN_PC_01' },
        '全站_雙券': { productName: '全站_雙券', useTemplate: 'SKBN_PC_DOUBLE_COUPON_FALLBACK' },
        '全站雙券': { productName: '全站_雙券', useTemplate: 'SKBN_PC_DOUBLE_COUPON_FALLBACK' },
      },
    },

    resolveRecordTemplateRoute({ block, record }) {
      const blockName = toText(block?.name);
      if (!/SKBN[\s_-]*PC/i.test(blockName) && !/SKBN.*PC/i.test(blockName)) return null;
      return resolveRoute(record);
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics, helpers }) {
      alignAllTextLeft(template);
      hidePlaceholderPriceLayers(template);

      if (!hasVipSubtitle(record)) return;

      record['副標'] = removeVipText(record['副標']);

      const subtitle = getSubtitleLayer(template, helpers);
      if (subtitle) {
        subtitle.text = record['副標'];
        subtitle.hidden = !subtitle.text;
        subtitle.align = 'left';
        subtitle.textAlign = 'left';
      }

      const vipLogo = getVipLogoLayer(template, helpers);
      if (vipLogo) {
        vipLogo.assetFilename = VIP_LOGO_ASSET;
        vipLogo.hidden = false;
        vipLogo.keepAspectRatio = true;
      }

      diagnostics?.push?.({ field: '副標', status: 'ok', value: record['副標'], target: '副標含 VIP，使用 SKBN_PC_VIP 公版與 VIP_LOGO.svg' });
    },

    afterApplyRecordToTemplate({ template, diagnostics, helpers }) {
      hidePlaceholderPriceLayers(template);
      alignAllTextLeft(template);
      if (template?.sheetTemplateRoute?.key === 'skbn_pc_vip') {
        applyVipSubtitleLayout(template, helpers, diagnostics);
      }
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'SKBN_PC',
    priority: 22,
    tokens: ['skbn_pc', 'skbnpc', 'skbn pc', 'c2cskbnpc', 'C2C SKBN PC', 'SKBN (NUZ) PC', 'SKBN_PC', '06_SKBN_PC'],
    targets: ['skbn_pc', 'skbnpc', 'skbn pc', 'c2cskbnpc', 'C2C SKBN PC', 'SKBN (NUZ) PC', '06_SKBN_PC', '06_SKBN_PC_VIP'],
    rules: SKBNPCTemplateRules,
  });
})();