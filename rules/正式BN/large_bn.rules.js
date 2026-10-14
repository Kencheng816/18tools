/* Game / Live Lobby / MS Carousel BN template rules – V5.03 isolated layout */
(function () {
  'use strict';

  const FAMILY = 'large_bn_group';

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value || {})); }
    catch (_) { return {}; }
  }

  function getHBNPriceRules() {
    return clone(window.TemplateRuleRegistry?.getRules?.('hbn', 'priceRules') || {});
  }


  function getLargeBNPriceRules() {
    const rules = getHBNPriceRules();
    rules.enabled = true;
    rules.coordinateMode = 'absolute';
    rules.positioningMode = 'absolute';
    rules.lockToEditedJson = true;
    rules.followProduct = true;
    rules.templateLayouts = { ...(rules.templateLayouts || {}) };

    Object.entries(LARGE_BN_LAYOUTS).forEach(([routeKey, layout]) => {
      const priceLayouts = Array.isArray(layout.priceLayouts) ? clone(layout.priceLayouts) : [];
      if (!priceLayouts.length) return;

      const entry = {
        templateId: layout.templateId,
        productName: layout.productName,
        layoutKey: layout.layoutKey,
        rawPriceExample: layout.rawPriceExample,
        isDoubleCoupon: Boolean(layout.isDoubleCoupon),
        layouts: priceLayouts,
        positioningMode: 'absolute',
        coordinateMode: 'absolute',
        lockToEditedJson: true,
        followProduct: true,
      };

      const route = ROUTES.find((item) => item.key === routeKey) || {};
      [
        layout.templateId,
        layout.batchSourceName,
        route.templateId,
        route.label,
        route.token,
        route.outputPrefix,
      ].filter(Boolean).forEach((key) => { rules.templateLayouts[key] = clone(entry); });
    });

    return rules;
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/#u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');
  }

  function getBlockName(block = {}, record = {}) {
    return String(block?.name || record?.['版位'] || record?.['使用公版'] || '').trim();
  }

  const ROUTES = [
    {
      key: 'game_bn',
      label: 'Game BN',
      token: 'Game BN',
      templateId: 'Game BN',
      templateFile: '11_Game BN.json',
      outputPrefix: 'Game_BN',
      ctaAsset: 'Game BN_CTA.png',
      enableCtaByRecord: false,
    },
    {
      key: 'live_lobby_bn',
      label: '直播大廳 BN',
      token: '直播大廳 BN',
      aliases: ['直播大廳BN', '直播大廳 B'],
      templateId: '直播大廳BN',
      templateFile: '12_#U76f4#U64ad#U5927#U5ef3BN.json',
      outputPrefix: '直播大廳BN',
      ctaAsset: '直播大廳BN_CTA.png',
      enableCtaByRecord: true,
    },
    {
      key: 'ms_carousel_bn',
      label: 'MS輪播BN',
      token: 'MS輪播BN',
      aliases: ['MS輪播 BN'],
      templateId: 'MS輪播 BN',
      templateFile: '13_MS#U8f2a#U64ad BN.json',
      outputPrefix: 'MS輪播BN',
      ctaAsset: 'MS輪播 BN_CTA.png',
      enableCtaByRecord: true,
    },
  ];

  const LARGE_BN_LAYOUTS = {
  "game_bn": {
    "templateId": "Game_BN_01",
    "batchSourceName": "Game BN",
    "textLayers": {
      "title": {
        "x": 135,
        "y": 157,
        "width": 192,
        "height": 31,
        "centerX": 231,
        "centerY": 172.5,
        "fontSizePt": 33,
        "fontSizePx": 33,
        "fontSizePtRaw": 39.0905876159668,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 39.6,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.8437310177380586,
          "scaleY": 0.8441929810800604
        },
        "dominantStyleSource": "textStyleRange-dominant",
        "hidden": true
      },
      "subtitle": {
        "x": 135,
        "y": 199,
        "width": 358,
        "height": 58,
        "centerX": 314,
        "centerY": 228,
        "fontSizePt": 60,
        "fontSizePx": 60,
        "fontSizePtRaw": 75.32257080078125,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "left",
        "color": "#FFFF3C",
        "lineHeight": 72,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.7961381097153564,
          "scaleY": 0.7965740147776676
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      },
      "legal": {
        "x": 135,
        "y": 270,
        "width": 310,
        "height": 23,
        "centerX": 290,
        "centerY": 281.5,
        "fontSizePt": 24,
        "fontSizePx": 24,
        "fontSizePtRaw": 28.684879302978516,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 28.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.836219963709853,
          "scaleY": 0.8366778145663037
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      }
    },
    "titleLogoSegments": {
      "__title_logo_segment_01": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO",
        "assetFilename": "蝦皮VIP_LOGO.svg",
        "x": 135,
        "y": 142,
        "width": 128,
        "height": 45,
        "centerX": 199,
        "centerY": 164.5,
        "keepAspectRatio": true,
        "sizingMode": "containByPBox",
        "targetWidth": 128,
        "targetHeight": 45,
        "maxTargetHeight": 45
      },
      "__title_logo_segment_02": {
        "type": "text",
        "psdName": "主標題_獨享18%蝦幣",
        "x": 267,
        "y": 155.5,
        "width": 195,
        "height": 31,
        "centerX": 232.5,
        "centerY": 172.5,
        "fontSizePt": 33,
        "fontSizePx": 33,
        "fontSizePtRaw": 39.0905876159668,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 39.6,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.8437310177380586,
          "scaleY": 0.8441929810800604
        },
        "dominantStyleSource": "textStyleRange-dominant",
        "hidden": false,
        "locked": false
      }
    },
    "priceLayouts": [
      {
        "psdName": "價格",
        "positioningMode": "absolute",
        "x": 634,
        "y": 172,
        "width": 350,
        "height": 100,
        "centerX": 809,
        "centerY": 222,
        "rotation": 12,
        "fontSizePx": 65,
        "fontSizePt": 65,
        "lineHeight": 72.01,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#ff770f",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 634,
        "topY": 172
      }
    ],
    "productName": "VIP_單券_蝦幣",
    "layoutKey": "vip",
    "rawPriceExample": "18%蝦幣",
    "isDoubleCoupon": false
  },
  "live_lobby_bn": {
    "templateId": "直播大廳BN_01",
    "batchSourceName": "直播大廳 BN",
    "textLayers": {
      "title": {
        "x": 97,
        "y": 165,
        "width": 155,
        "height": 26,
        "centerX": 174.5,
        "centerY": 178,
        "fontSizePt": 26.67,
        "fontSizePx": 26.67,
        "fontSizePtRaw": 41.53464889526367,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 32,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.6417631662988235,
          "scaleY": 0.6421145473087007
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": true
      },
      "subtitle": {
        "x": 95.5,
        "y": 199.5,
        "width": 357,
        "height": 58,
        "centerX": 275.5,
        "centerY": 229,
        "fontSizePt": 60.01,
        "fontSizePx": 60.01,
        "fontSizePtRaw": 75.67401885986328,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "left",
        "color": "#FFF100",
        "lineHeight": 72.01,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.7925396324539131,
          "scaleY": 0.7929735672620223
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      },
      "legal": {
        "x": 97,
        "y": 272,
        "width": 310,
        "height": 23,
        "centerX": 252,
        "centerY": 283.5,
        "fontSizePt": 24,
        "fontSizePx": 24,
        "fontSizePtRaw": 28.684879302978516,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 28.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.836219963709853,
          "scaleY": 0.8366778145663037
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      }
    },
    "titleLogoSegments": {
      "__title_logo_segment_01": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO",
        "assetFilename": "蝦皮VIP_LOGO.svg",
        "x": 97,
        "y": 148,
        "width": 121,
        "height": 42.8,
        "centerX": 157.5,
        "centerY": 169.4,
        "keepAspectRatio": true,
        "sizingMode": "containByPBox",
        "targetWidth": 121,
        "targetHeight": 42.8,
        "maxTargetHeight": 42.8
      },
      "__title_logo_segment_02": {
        "type": "text",
        "psdName": "主標題_獨享18%蝦幣",
        "x": 226.5,
        "y": 164,
        "width": 157,
        "height": 26,
        "centerX": 175.5,
        "centerY": 178,
        "fontSizePt": 26.67,
        "fontSizePx": 26.67,
        "fontSizePtRaw": 41.53464889526367,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 32,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.6417631662988235,
          "scaleY": 0.6421145473087007
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false,
        "locked": false
      }
    },
    "priceLayouts": [
      {
        "psdName": "價格",
        "positioningMode": "absolute",
        "x": 601,
        "y": 165,
        "width": 350,
        "height": 100,
        "centerX": 776,
        "centerY": 215,
        "rotation": 12,
        "fontSizePx": 65,
        "fontSizePt": 65,
        "lineHeight": 72.01,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#ff770f",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 601,
        "topY": 165
      }
    ],
    "productName": "VIP_單券_蝦幣",
    "layoutKey": "vip",
    "rawPriceExample": "18%蝦幣",
    "isDoubleCoupon": false
  },
  "ms_carousel_bn": {
    "templateId": "MS輪播BN_01",
    "batchSourceName": "MS輪播BN",
    "textLayers": {
      "title": {
        "x": 96,
        "y": 161,
        "width": 175,
        "height": 29,
        "centerX": 183.5,
        "centerY": 175.5,
        "fontSizePt": 30,
        "fontSizePx": 30,
        "fontSizePtRaw": 38.92295455932617,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 36,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.7703316487959544,
          "scaleY": 0.77075342419054
        },
        "dominantStyleSource": "textStyleRange-dominant",
        "hidden": true
      },
      "subtitle": {
        "x": 95,
        "y": 199,
        "width": 358,
        "height": 58,
        "centerX": 275,
        "centerY": 229,
        "fontSizePt": 60,
        "fontSizePx": 60,
        "fontSizePtRaw": 75.32257080078125,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "left",
        "color": "#FFFF3C",
        "lineHeight": 72,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.7961381097153564,
          "scaleY": 0.7965740147776678
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      },
      "legal": {
        "x": 96,
        "y": 272,
        "width": 310,
        "height": 23,
        "centerX": 251,
        "centerY": 283.5,
        "fontSizePt": 24,
        "fontSizePx": 24,
        "fontSizePtRaw": 28.684879302978516,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 28.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.836219963709853,
          "scaleY": 0.8366778145663037
        },
        "dominantStyleSource": "textStyleRange",
        "hidden": false
      }
    },
    "titleLogoSegments": {
      "__title_logo_segment_01": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO",
        "assetFilename": "蝦皮VIP_LOGO.svg",
        "x": 98,
        "y": 148,
        "width": 119,
        "height": 42,
        "centerX": 157.5,
        "centerY": 169,
        "keepAspectRatio": true,
        "sizingMode": "containByPBox",
        "targetWidth": 119,
        "targetHeight": 42,
        "maxTargetHeight": 42
      },
      "__title_logo_segment_02": {
        "type": "text",
        "psdName": "主標題_獨享18%蝦幣",
        "x": 219.5,
        "y": 160.5,
        "width": 198.9,
        "height": 32.5,
        "centerX": 184.5,
        "centerY": 175.5,
        "fontSizePt": 30,
        "fontSizePx": 30,
        "fontSizePtRaw": 38.92295455932617,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#ffffff",
        "lineHeight": 32.4,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.7703316487959544,
          "scaleY": 0.77075342419054
        },
        "dominantStyleSource": "textStyleRange-dominant",
        "hidden": false,
        "locked": false
      }
    },
    "priceLayouts": [
      {
        "psdName": "價格",
        "positioningMode": "absolute",
        "x": 623.9,
        "y": 154.8,
        "width": 371,
        "height": 106,
        "centerX": 809.4,
        "centerY": 207.8,
        "rotation": 12,
        "fontSizePx": 68.9,
        "fontSizePt": 68.9,
        "lineHeight": 74.41,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#ff770f",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 623.9,
        "topY": 154.8
      }
    ],
    "productName": "VIP_單券_蝦幣",
    "layoutKey": "vip",
    "rawPriceExample": "18%蝦幣",
    "isDoubleCoupon": false
  }
};

  function routeMatches(route, value) {
    const source = normalize(value);
    if (!source) return false;
    const candidates = [route.token, route.templateId, route.label, route.outputPrefix, ...(route.aliases || [])];
    return candidates.some((candidate) => source.includes(normalize(candidate)) || normalize(candidate).includes(source));
  }

  function resolveRoute(block, record) {
    const name = getBlockName(block, record);
    const route = ROUTES.find((item) => routeMatches(item, name));
    return route ? { ...route, family: FAMILY, ruleFile: 'large_bn.rules.js' } : null;
  }

  function getTemplateRoute(template = {}, record = {}) {
    const labels = [
      template?.sheetTemplateRoute?.key,
      template?.sheetTemplateRoute?.label,
      template?.templateId,
      template?.batchSourceName,
      template?.source?.psdName,
      template?.canvas?.templateId,
      record?.['版位'],
      record?.['使用公版'],
    ].filter(Boolean).join(' ');
    return ROUTES.find((route) => routeMatches(route, labels)) || null;
  }

  function findLayerEntry(template, candidates = [], type = '') {
    const wanted = candidates.map(normalize).filter(Boolean);
    return Object.entries(template?.layers || {}).find(([key, layer]) => {
      if (type && layer?.type !== type) return false;
      const label = normalize(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
      return wanted.some((word) => label.includes(word));
    }) || null;
  }

  function getAnchorLogoX(template) {
    const entry = findLayerEntry(template, ['18號會員日_LOGO', '18號會員日 LOGO', '會員日_LOGO'], 'image');
    return Number(entry?.[1]?.x ?? 0);
  }

  function leftAlignTextLayer(layer, x) {
    if (!layer || layer.type !== 'text') return;
    layer.align = 'left';
    if (Number.isFinite(Number(x))) {
      layer.x = Number(x);
      layer.centerX = Number(x) + Number(layer.width || 0) / 2;
    }
  }

  function alignTextToLogoX(template) {
    const anchorX = getAnchorLogoX(template);
    ['title', 'subtitle', 'legal'].forEach((key) => {
      const layer = template?.layers?.[key];
      if (layer) leftAlignTextLayer(layer, anchorX);
    });

    // 只校正原始文字圖層，不直接改 Logo Parser 拆出的主標群組。
    // 主標群組需整組平移，否則「蝦皮VIP_LOGO.svg + 主標題」會被拆開對齊而失去群組關係。
    Object.entries(template?.layers || {}).forEach(([key, layer]) => {
      if (key.startsWith('__title_logo_segment_')) return;
      const label = normalize(layer?.psdName || '');
      if (label.includes(normalize('主標題')) || label.includes(normalize('副標題')) || label.includes(normalize('法務小字'))) {
        leftAlignTextLayer(layer, anchorX);
      }
    });
    return anchorX;
  }

  function getVisibleTitleLogoSegments(template) {
    return Object.entries(template?.layers || {})
      .filter(([key, layer]) => key.startsWith('__title_logo_segment_') && layer && layer.hidden !== true)
      .map(([key, layer]) => ({ key, layer }));
  }

  function alignTitleLogoGroupToLogoX(template, anchorX = getAnchorLogoX(template)) {
    const segments = getVisibleTitleLogoSegments(template);
    if (!segments.length || !Number.isFinite(Number(anchorX))) return false;

    const left = Math.min(...segments.map(({ layer }) => Number(layer.x || 0)));
    const dx = Number(anchorX) - left;
    if (Math.abs(dx) < 0.01) return true;

    segments.forEach(({ layer }) => {
      layer.x = Number((Number(layer.x || 0) + dx).toFixed(2));
      layer.centerX = Number((Number(layer.x || 0) + Number(layer.width || 0) / 2).toFixed(2));
    });

    return true;
  }

  function removeSubtitleCapsule(template) {
    if (!template) return;
    if (Array.isArray(template.renderOrder)) {
      template.renderOrder = template.renderOrder.filter((key) => key !== 'subtitle_frame');
    }
    if (template.generatedLayers?.subtitle_frame) {
      template.generatedLayers.subtitle_frame.hidden = true;
      template.generatedLayers.subtitle_frame.disabled = true;
      template.generatedLayers.subtitle_frame.source = 'disabled_large_bn_rule';
    }
  }

  function getRecordCta(record = {}) {
    return String(record?.CTA || record?.['CTA文案'] || record?.['CTA按鈕'] || record?.['按鈕'] || '').trim();
  }

  function applyRecordCTA(template, record, diagnostics, route, options = {}) {
    if (!route?.enableCtaByRecord) return;
    const ctaText = getRecordCta(record);
    const entry = findLayerEntry(template, ['cta', '按鈕', 'button'], 'image');
    if (!entry) {
      if (ctaText) diagnostics?.push?.({ field: 'CTA', status: 'missing-layer', value: ctaText, target: route.label });
      return;
    }

    const [, layer] = entry;
    if (!ctaText) {
      layer.hidden = true;
      diagnostics?.push?.({ field: 'CTA', status: 'hidden', value: '', target: `${route.label} CTA` });
      return;
    }

    if (options.rewriteRecord) {
      record.__LARGE_BN_ORIGINAL_CTA = record.__LARGE_BN_ORIGINAL_CTA || ctaText;
      record.CTA = route.ctaAsset;
    }

    layer.assetFilename = route.ctaAsset;
    layer.hidden = false;
    diagnostics?.push?.({
      field: 'CTA',
      status: 'ok',
      value: record.__LARGE_BN_ORIGINAL_CTA || ctaText,
      filename: route.ctaAsset,
      target: `${route.label} CTA`,
    });
  }


  function getConfirmedLayoutForRoute(route) {
    return route?.key ? LARGE_BN_LAYOUTS[route.key] : null;
  }

  function applyLayerValues(layer, values, options = {}) {
    if (!layer || !values) return;
    const keepText = options.keepText === true ? layer.text : undefined;
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'text') return;
      if (value === undefined) return;
      layer[key] = clone(value);
    });
    if (options.keepText === true && layer.type === 'text') layer.text = keepText;
  }

  function applyConfirmedTextLayers(template, layout) {
    if (!template?.layers || !layout?.textLayers) return;
    Object.entries(layout.textLayers).forEach(([key, values]) => {
      const layer = template.layers[key];
      if (!layer || layer.type !== 'text') return;
      applyLayerValues(layer, values, { keepText: true });
      layer.align = 'left';

      // Large BN 的副標題與法務小字必須保持顯示。
      // 寫回 edited JSON 幾何資料時，不允許沿用或帶入隱藏狀態。
      if (key === 'subtitle' || key === 'legal') {
        layer.hidden = false;
        layer.visible = true;
        layer.opacity = Number.isFinite(Number(layer.opacity)) ? layer.opacity : 1;
      }
    });
  }

  function applyConfirmedTitleLogoSegments(template, layout) {
    if (!template?.layers || !layout?.titleLogoSegments) return;
    Object.entries(layout.titleLogoSegments).forEach(([key, values]) => {
      const layer = template.layers[key];
      if (!layer) return;
      applyLayerValues(layer, values, { keepText: layer.type === 'text' });
      layer.hidden = false;
      layer.locked = false;
      if (layer.type === 'text') layer.align = 'left';
    });
  }

  function applyConfirmedLargeBNLayout(template, route, options = {}) {
    const layout = getConfirmedLayoutForRoute(route);
    if (!layout) return;
    applyConfirmedTextLayers(template, layout);
    if (options.includeTitleSegments !== false) {
      applyConfirmedTitleLogoSegments(template, layout);
    }
    ensureLargeBNTextVisible(template);
  }

  function ensureLargeBNTextVisible(template) {
    if (!template?.layers) return;
    ['subtitle', 'legal'].forEach((key) => {
      const layer = template.layers[key];
      if (!layer) return;
      layer.hidden = false;
      layer.visible = true;
      if (!Number.isFinite(Number(layer.opacity))) layer.opacity = 1;
    });

    if (!Array.isArray(template.renderOrder)) return;
    const insertBefore = (key, beforeKey) => {
      if (!template.layers[key]) return;
      template.renderOrder = template.renderOrder.filter((item) => item !== key);
      const index = template.renderOrder.indexOf(beforeKey);
      template.renderOrder.splice(index >= 0 ? index : template.renderOrder.length, 0, key);
    };

    // 保持文字圖層在標題群組之前、價格/商品圖之上方，不被移除。
    insertBefore('legal', 'subtitle');
    insertBefore('subtitle', 'title');
  }

  const LargeBNTemplateRules = {
    priceRules: getLargeBNPriceRules(),

    // 不使用全域藍色膠囊；Game / 直播大廳 / MS 輪播 BN 的副標膠囊由本規則獨立控制且預設不顯示。
    capsuleRules: {
      disabledForLargeBN: true,
    },

    resolveRecordTemplateRoute({ block, record }) {
      return resolveRoute(block, record);
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      const route = getTemplateRoute(template, record);
      if (!route) return;
      removeSubtitleCapsule(template);
      applyRecordCTA(template, record, diagnostics, route, { rewriteRecord: true });
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      const route = getTemplateRoute(template, record);
      applyConfirmedLargeBNLayout(template, route, { includeTitleSegments: false });
      const anchorX = alignTextToLogoX(template);
      removeSubtitleCapsule(template);

      const title = template?.layers?.title;
      if (title) {
        title.x = anchorX;
        title.align = 'left';
        title.centerX = Number(anchorX) + Number(title.width || 0) / 2;
      }

      const result = window.TitleLogoParser?.apply?.(template, {
        title: record?.['主標'],
        align: 'left',
        gapPx: 10,
      });

      // TitleLogoParser 產生 Logo + 文字後，套用 edited JSON 確認值，再以「整組」靠左對齊 18號會員日_LOGO 的 X 軸。
      // 副標與法務使用 LARGE_BN_LAYOUTS 的確認座標，不再被全域排版覆寫。
      applyConfirmedLargeBNLayout(template, route, { includeTitleSegments: true });
      alignTitleLogoGroupToLogoX(template, anchorX);
      removeSubtitleCapsule(template);
      ensureLargeBNTextVisible(template);
      if (route) applyRecordCTA(template, record, diagnostics, route, { rewriteRecord: false });

      if (result?.mode === 'logo-group') {
        diagnostics?.push?.({ field: '主標', status: 'ok', value: record?.['主標'], target: 'Logo + 文字群組整組置左' });
      }
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'Game BN / 直播大廳 BN / MS輪播BN',
    priority: 24,
    tokens: ['Game BN', '直播大廳 BN', '直播大廳BN', '直播大廳 B', 'MS輪播BN', 'MS輪播 BN'],
    targets: ['Game BN', '11_Game BN', '直播大廳BN', '12_直播大廳BN', 'MS輪播 BN', '13_MS輪播 BN'],
    rules: LargeBNTemplateRules,
  });
})();
