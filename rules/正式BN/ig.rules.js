/* IG Story template rules – V5.02 confirmed IG layout write-back */
(function () {
  'use strict';

  const FAMILY = 'ig_story';

  const CONFIRMED_IG_LAYOUTS = {
  "IG_01": {
    "templateId": "IG_01",
    "sourceJson": "IG_01_edited.json",
    "textLayers": {
      "title": {
        "x": 0,
        "y": 716,
        "width": 900,
        "height": 61,
        "centerX": 450,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "center",
        "color": "#FFFFFF",
        "lineHeight": 76.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      },
      "subtitle": {
        "x": 162,
        "y": 617,
        "width": 576,
        "height": 63,
        "centerX": 450,
        "centerY": 648.5,
        "fontSizePt": 66,
        "fontSizePx": 66,
        "fontSizePtRaw": 47.92137908935547,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "center",
        "color": "#FFFF3C",
        "lineHeight": 79.2,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.3716313327339573,
          "scaleY": 1.377255780206868
        },
        "dominantStyleSource": "textStyleRange"
      },
      "legal": {
        "x": 300,
        "y": 815,
        "width": 300,
        "height": 38,
        "centerX": 450,
        "centerY": 813,
        "fontSizePt": 40,
        "fontSizePx": 40,
        "fontSizePtRaw": 73.07438659667969,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#113366",
        "lineHeight": 48,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.5470878139230051,
          "scaleY": 0.547387369729126
        },
        "dominantStyleSource": "textStyleRange"
      }
    },
    "productImageBox": {
      "x": 51,
      "y": 889,
      "width": 798,
      "height": 498,
      "centerX": 450,
      "centerY": 1138
    },
    "generatedLayers": {
      "subtitle_frame": {
        "type": "shape",
        "source": "generated",
        "fill": "#0053D1",
        "radius": "capsule",
        "computedBy": "IGTemplateRules.capsuleRules.resolveCapsuleWidth"
      }
    },
    "titleLogoSegments": {
      "__title_logo_segment_01": {
        "type": "text",
        "psdName": "主標題_4/18 ",
        "x": 124.5,
        "y": 737,
        "width": 144,
        "height": 61,
        "centerX": 153.35,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 76.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      },
      "__title_logo_segment_02": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO",
        "assetFilename": "蝦皮VIP_LOGO.svg",
        "x": 264,
        "y": 708,
        "width": 254,
        "height": 90,
        "centerX": 391,
        "centerY": 753,
        "keepAspectRatio": true,
        "sizingMode": "containByPBox",
        "targetWidth": 254,
        "targetHeight": 90,
        "maxTargetHeight": 90
      },
      "__title_logo_segment_03": {
        "type": "text",
        "psdName": "主標題_專屬蝦幣18%",
        "x": 525,
        "y": 737,
        "width": 377,
        "height": 61,
        "centerX": 630.15,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#ffffff",
        "lineHeight": 69.12,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      }
    },
    "renderOrderTail": [
      "__title_logo_segment_01",
      "__title_logo_segment_02",
      "__title_logo_segment_03"
    ],
    "priceLayouts": [
      {
        "slot": "single",
        "psdName": "價格",
        "positioningMode": "absolute",
        "x": 233,
        "y": 1084.8,
        "width": 603.6,
        "height": 222.3,
        "centerX": 534.8,
        "centerY": 1195.95,
        "rotation": 12,
        "fontSizePx": 132.88,
        "fontSizePt": 132.88,
        "lineHeight": 143.51,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#ff770f",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 233,
        "topY": 1084.8
      }
    ],
    "productName": "VIP_單券_蝦幣",
    "productKey": "vip_單券_蝦幣",
    "layoutKey": "vip",
    "rawPriceExample": "18%蝦幣",
    "isDoubleCoupon": false,
    "anchorSource": {
      "x": 51,
      "y": 889,
      "width": 798,
      "height": 498,
      "centerX": 450,
      "centerY": 1138
    }
  },
  "IG_02": {
    "templateId": "IG_02",
    "sourceJson": "IG_02_edited.json",
    "textLayers": {
      "title": {
        "x": 0,
        "y": 715,
        "width": 900,
        "height": 61,
        "centerX": 450,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "center",
        "color": "#FFFFFF",
        "lineHeight": 76.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      },
      "subtitle": {
        "x": 192,
        "y": 617,
        "width": 516,
        "height": 63,
        "centerX": 450,
        "centerY": 648.5,
        "fontSizePt": 66,
        "fontSizePx": 66,
        "fontSizePtRaw": 47.92137908935547,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "center",
        "color": "#FFFF3C",
        "lineHeight": 79.2,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.3716313327339573,
          "scaleY": 1.377255780206868
        },
        "dominantStyleSource": "textStyleRange"
      },
      "legal": {
        "x": 300,
        "y": 793,
        "width": 300,
        "height": 38,
        "centerX": 450,
        "centerY": 813,
        "fontSizePt": 40,
        "fontSizePx": 40,
        "fontSizePtRaw": 73.07438659667969,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#113366",
        "lineHeight": 48,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.5470878139230051,
          "scaleY": 0.547387369729126
        },
        "dominantStyleSource": "textStyleRange"
      }
    },
    "productImageBox": {
      "x": 74,
      "y": 867,
      "width": 726,
      "height": 605,
      "centerX": 437,
      "centerY": 1169.5
    },
    "generatedLayers": {
      "subtitle_frame": {
        "type": "shape",
        "source": "generated",
        "fill": "#0053D1",
        "radius": "capsule",
        "computedBy": "IGTemplateRules.capsuleRules.resolveCapsuleWidth"
      }
    },
    "titleLogoSegments": {},
    "renderOrderTail": [],
    "priceLayouts": [
{
        "slot": "single",
        "psdName": "價格",
        "positioningMode": "absolute",
        "x": 245.9,
        "y": 1242.4,
        "width": 425.5,
        "height": 156.6,
        "centerX": 458.65,
        "centerY": 1320.7,
        "rotation": 12,
        "fontSizePx": 94,
        "fontSizePt": 94,
        "lineHeight": 101.52,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#ee4d2d",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 245.9,
        "topY": 1242.4
}
    ],
    "productName": "鬧鐘加全站券",
    "productKey": "鬧鐘加全站券",
    "layoutKey": "vip",
    "rawPriceExample": "18%蝦幣",
    "isDoubleCoupon": false,
    "anchorSource": {
      "x": 74,
      "y": 867,
      "width": 726,
      "height": 605,
      "centerX": 437,
      "centerY": 1169.5
    }
  },
  "IG_03": {
    "templateId": "IG_03",
    "sourceJson": "IG_03_edited.json",
    "textLayers": {
      "title": {
        "x": 0,
        "y": 716,
        "width": 900,
        "height": 61,
        "centerX": 450,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "center",
        "color": "#FFFFFF",
        "lineHeight": 76.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      },
      "subtitle": {
        "x": 173.5,
        "y": 617,
        "width": 553,
        "height": 63,
        "centerX": 450,
        "centerY": 648.5,
        "fontSizePt": 66,
        "fontSizePx": 66,
        "fontSizePtRaw": 47.92137908935547,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "center",
        "color": "#FFFF3C",
        "lineHeight": 79.2,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.3716313327339573,
          "scaleY": 1.377255780206868
        },
        "dominantStyleSource": "textStyleRange"
      },
      "legal": {
        "x": 300,
        "y": 793,
        "width": 300,
        "height": 38,
        "centerX": 450,
        "centerY": 813,
        "fontSizePt": 40,
        "fontSizePx": 40,
        "fontSizePtRaw": 73.07438659667969,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#113366",
        "lineHeight": 48,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.5470878139230051,
          "scaleY": 0.547387369729126
        },
        "dominantStyleSource": "textStyleRange"
      }
    },
    "productImageBox": {
      "x": 111,
      "y": 889,
      "width": 726,
      "height": 568.7,
      "centerX": 474,
      "centerY": 1173.3
    },
    "generatedLayers": {
      "subtitle_frame": {
        "type": "shape",
        "source": "generated",
        "fill": "#0053D1",
        "radius": "capsule",
        "computedBy": "IGTemplateRules.capsuleRules.resolveCapsuleWidth"
      }
    },
    "titleLogoSegments": {
      "__title_logo_segment_01": {
        "type": "image",
        "psdName": "蝦皮直營_LOGO",
        "assetFilename": "蝦皮直營_LOGO.svg",
        "x": 214,
        "y": 710,
        "width": 341,
        "height": 71,
        "centerX": 384.5,
        "centerY": 745.5,
        "keepAspectRatio": true,
        "sizingMode": "containByPBox",
        "targetWidth": 341,
        "targetHeight": 71,
        "maxTargetHeight": 71
      },
      "__title_logo_segment_02": {
        "type": "text",
        "psdName": "主標題_限定",
        "x": 555,
        "y": 715,
        "width": 128,
        "height": 61,
        "centerX": 548.31,
        "centerY": 746.5,
        "fontSizePt": 64,
        "fontSizePx": 64,
        "fontSizePtRaw": 29.409189224243164,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "left",
        "color": "#FFFFFF",
        "lineHeight": 76.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 2.269991624854645,
          "scaleY": 2.1761906929593318
        },
        "dominantStyleSource": "textStyleRange"
      }
    },
    "renderOrderTail": [
      "__title_logo_segment_01",
      "__title_logo_segment_02"
    ],
    "priceLayouts": [
      {
        "slot": "bottom",
        "psdName": "價格1（下券）",
        "positioningMode": "absolute",
        "x": 441,
        "y": 1197.7,
        "width": 231.4,
        "height": 102.7,
        "centerX": 556.7,
        "centerY": 1249.05,
        "rotation": 2,
        "fontSizePx": 170,
        "fontSizePt": 170,
        "lineHeight": 183.6,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#d0011b",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 441,
        "topY": 1197.7
      },
      {
        "slot": "top",
        "psdName": "價格2（上券）",
        "positioningMode": "absolute",
        "x": 338.1,
        "y": 957.7,
        "width": 414.4,
        "height": 183.8,
        "centerX": 545.3,
        "centerY": 1049.6,
        "rotation": -6,
        "fontSizePx": 170,
        "fontSizePt": 170,
        "lineHeight": 183.6,
        "letterSpacing": 0,
        "lineHeightMultiplier": 1.08,
        "color": "#d0011b",
        "preserveExactSize": true,
        "skipAutoScale": true,
        "disableAnchorSync": false,
        "lockToEditedJson": true,
        "followProduct": true,
        "disableContentScale": true,
        "leftX": 338.1,
        "topY": 957.7
      }
    ],
    "productName": "SCS_雙券",
    "productKey": "scs_雙券",
    "layoutKey": "doubleCoupon",
    "rawPriceExample": "$350",
    "isDoubleCoupon": true,
    "anchorSource": {
      "x": 111,
      "y": 889,
      "width": 726,
      "height": 568.7,
      "centerX": 474,
      "centerY": 1173.3
    }
  }
};

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value || {})); }
    catch (_) { return {}; }
  }

  function norm(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '')
      .replace(/[＿－—–]/g, '');
  }

  function getDDCardPriceRules() {
    const rules = clone(window.TemplateRuleRegistry?.getRules?.('ddcard', 'priceRules') || {});
    rules.enabled = true;
    rules.productFirst = false;
    rules.resolvePriority = 'templateFirst';
    rules.coordinateMode = 'absolute';
    rules.positioningMode = 'absolute';
    rules.anchorLayerName = '商品圖1';
    rules.anchorLayerNames = ['商品圖1', 'P1', '曝品', 'product_1', 'product', 'P'];
    rules.templateLayouts = { ...(rules.templateLayouts || {}) };

    Object.entries(CONFIRMED_IG_LAYOUTS).forEach(([templateId, layout]) => {
      const priceLayouts = Array.isArray(layout.priceLayouts) ? clone(layout.priceLayouts) : [];
      rules.templateLayouts[templateId] = {
        templateId,
        productName: layout.productName,
        productKey: layout.productKey,
        layoutKey: layout.layoutKey,
        rawPriceExample: layout.rawPriceExample,
        isDoubleCoupon: Boolean(layout.isDoubleCoupon),
        productImageBox: clone(layout.productImageBox),
        anchorSource: clone(layout.anchorSource || layout.productImageBox),
        layouts: priceLayouts,
        positioningMode: 'absolute',
        coordinateMode: 'absolute',
        lockToEditedJson: true,
        followProduct: true,
      };
    });

    return rules;
  }

  function getTemplateKey(template) {
    const candidates = [
      template?.templateId,
      template?.pricePresetMeta?.templateId,
      template?.batchSourceName,
      template?.canvas?.templateId,
      template?.source?.psdName,
    ].filter(Boolean);

    for (const value of candidates) {
      if (CONFIRMED_IG_LAYOUTS[value]) return value;
      const key = Object.keys(CONFIRMED_IG_LAYOUTS).find((candidate) => norm(candidate) === norm(value));
      if (key) return key;
    }

    return null;
  }

  function applyValues(target, values, options = {}) {
    if (!target || !values) return;
    Object.entries(values).forEach(([key, value]) => {
      if (options.skipText && key === 'text') return;
      if (value === undefined) return;
      target[key] = clone(value);
    });
  }

  function applyTextLayerValues(template, layout) {
    Object.entries(layout.textLayers || {}).forEach(([key, values]) => {
      const layer = template?.layers?.[key];
      if (!layer || layer.type !== 'text') return;
      const currentText = layer.text;
      const hidden = layer.hidden;
      applyValues(layer, values, { skipText: true });
      layer.text = currentText;
      if (key === 'title') layer.hidden = hidden;
    });
  }

  function applyGeneratedLayerValues(template, layout) {
    if (!layout.generatedLayers?.subtitle_frame) return;
    template.generatedLayers = template.generatedLayers || {};
    template.generatedLayers.subtitle_frame = clone(layout.generatedLayers.subtitle_frame);
  }

  function applyConfirmedTitleSegmentValues(template, layout) {
    const segmentRules = layout.titleLogoSegments || {};
    Object.entries(segmentRules).forEach(([key, values]) => {
      const layer = template?.layers?.[key];
      if (!layer) return;
      const currentText = layer.type === 'text' ? layer.text : undefined;
      applyValues(layer, values, { skipText: true });
      if (layer.type === 'text') layer.text = currentText;
      layer.hidden = false;
      layer.locked = false;
    });
  }

  function syncRenderOrder(template) {
    if (!Array.isArray(template?.renderOrder)) return;
    const layerKeys = Object.keys(template.layers || {});
    const generatedKeys = Object.keys(template.generatedLayers || {});
    const existing = new Set([...layerKeys, ...generatedKeys]);

    // generatedLayers（例如 subtitle_frame）不是 template.layers，
    // 但仍然需要保留在 renderOrder，否則副標膠囊會被 syncRenderOrder 誤刪。
    template.renderOrder = template.renderOrder.filter((key) => existing.has(key));

    if (template.generatedLayers?.subtitle_frame && !template.renderOrder.includes('subtitle_frame')) {
      const subtitleIndex = template.renderOrder.indexOf('subtitle');
      template.renderOrder.splice(subtitleIndex >= 0 ? subtitleIndex : template.renderOrder.length, 0, 'subtitle_frame');
    }

    layerKeys.forEach((key) => {
      if (!template.renderOrder.includes(key)) template.renderOrder.push(key);
    });
  }


  function getLayerBox(layer) {
    if (!layer) return null;
    const x = Number(layer.x || 0);
    const y = Number(layer.y || 0);
    const width = Number(layer.width || 0);
    const height = Number(layer.height || 0);
    return { x, y, width, height, right: x + width, bottom: y + height, centerX: x + width / 2, centerY: y + height / 2 };
  }

  function getTitleLogoGroupLayers(template) {
    return Object.entries(template?.layers || {})
      .filter(([key, layer]) => key.startsWith('__title_logo_segment_') && layer && layer.hidden !== true)
      .map(([, layer]) => layer);
  }

  function getCombinedWidth(layers) {
    const boxes = (layers || []).map(getLayerBox).filter(Boolean);
    if (!boxes.length) return 0;
    const left = Math.min(...boxes.map((box) => box.x));
    const right = Math.max(...boxes.map((box) => box.right));
    return Math.max(0, right - left);
  }

  function centerTitleLogoGroup(template) {
    const layers = getTitleLogoGroupLayers(template);
    if (!layers.length) return;
    const canvasCenterX = Number(template?.canvas?.width || 0) / 2;
    if (!canvasCenterX) return;
    const boxes = layers.map(getLayerBox).filter(Boolean);
    const left = Math.min(...boxes.map((box) => box.x));
    const right = Math.max(...boxes.map((box) => box.right));
    const currentCenterX = left + (right - left) / 2;
    const dx = canvasCenterX - currentCenterX;
    layers.forEach((layer) => {
      layer.x = Number(((Number(layer.x || 0) + dx)).toFixed(2));
      layer.centerX = Number((Number(layer.x || 0) + Number(layer.width || 0) / 2).toFixed(2));
    });
  }

  function centerTextXToCanvas(template, layer) {
    if (!template?.canvas?.width || !layer) return;
    layer.align = 'center';
    layer.centerX = Number(template.canvas.width) / 2;
    layer.x = Number((layer.centerX - Number(layer.width || 0) / 2).toFixed(2));
  }

  function resolveIGCapsuleWidth({ template, title, subtitle, legal, titleTextWidth }) {
    const paddingX = 25;
    const closeThresholdPx = 50;
    const titleGroupWidth = getCombinedWidth(getTitleLogoGroupLayers(template));
    const hasTitleGroup = titleGroupWidth > 0;

    // IG subtitle text uses a Photoshop-exported scaled text box. Canvas
    // measureText() only measures the raw font and can be visibly narrower
    // than the rendered design. Use the confirmed subtitle box width as the
    // subtitle visual width, then add 25px on both sides for the capsule.
    const titleWidth = hasTitleGroup ? titleGroupWidth : Number(titleTextWidth || 0);
    const subtitleWidth = Number(subtitle?.width || 0);
    const legalWidth = Number(legal?.width || 0);
    const subtitlePaddedWidth = subtitleWidth + paddingX * 2;

    if (Math.abs(titleWidth - subtitleWidth) < closeThresholdPx) {
      return Math.max(subtitlePaddedWidth, legalWidth);
    }

    return Math.max(titleWidth, subtitlePaddedWidth, legalWidth);
  }

  const IGTemplateRules = {
    confirmedLayouts: CONFIRMED_IG_LAYOUTS,
    priceRules: getDDCardPriceRules(),

    // IG 專用膠囊：只影響 IG Story。其他公版維持 app.core.js 的 V4 膠囊流程。
    capsuleRules: {
      isolatedIGCapsule: true,
      horizontalPaddingPx: 25,
      subtitleOnlyPaddingPx: 25,
      verticalPaddingPx: 13,
      preserveSubtitleY: true,
      preserveSubtitleBox: true,
      preserveLegalY: true,
      centerSource: 'subtitle',
      fill: '#0053D1',
      resolveCapsuleWidth: resolveIGCapsuleWidth,
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      const templateKey = getTemplateKey(template);
      const layout = templateKey ? CONFIRMED_IG_LAYOUTS[templateKey] : null;

      if (layout) {
        applyTextLayerValues(template, layout);
        applyGeneratedLayerValues(template, layout);
      }

      const result = window.TitleLogoParser?.apply?.(template, {
        title: record?.['主標'],
        align: 'center',
        gapPx: 10,
      });

      if (layout) {
        applyConfirmedTitleSegmentValues(template, layout);
        centerTitleLogoGroup(template);
        centerTextXToCanvas(template, template?.layers?.subtitle);
        centerTextXToCanvas(template, template?.layers?.legal);
        syncRenderOrder(template);
      }

      if (result?.mode === 'logo-group') {
        diagnostics?.push?.({ field: '主標', status: 'ok', value: record?.['主標'], target: 'Logo + 文字群組置中' });
      }
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'IG Story',
    priority: 24,
    tokens: ['IG Story', 'IGStory', '10_IG'],
    targets: ['10_IG', 'IG_01', 'IG_02', 'IG_03', 'IG Story'],
    rules: IGTemplateRules,
  });
})();
