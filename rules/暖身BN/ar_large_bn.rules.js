/* AR Large BN template rules – independent values from AR Large BN_01_edited / AR Large BN_02_edited. */
(function () {
  'use strict';

  const FAMILY = 'ar_large_bn';
  const TEMPLATE_ID = '09_AR Large BN';
  const TITLE_GROUP_CENTER_X = 787;
  const TITLE_LOGO_GAP_PX = 7;

  const ASSETS = Object.freeze({
    shopeeLogo: '09_AR Large BN/蝦皮購物_LOGO.svg',
    verticalVipLogo: '09_AR Large BN/直式_蝦皮VIP_LOGO.svg',
    orangeVipLogo: '09_AR Large BN/蝦皮VIP_LOGO_橘色.svg',
  });

  const SNAPSHOTS = Object.freeze({
  "vip": {
    "layers": {
      "蝦皮VIP_LOGO_橘色": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO_橘色",
        "x": 437,
        "y": 114,
        "width": 282,
        "height": 100,
        "centerX": 578,
        "centerY": 164,
        "assetFilename": "09_AR Large BN/蝦皮VIP_LOGO_橘色.svg",
        "hidden": false,
        "keepAspectRatio": true
      },
      "title": {
        "type": "text",
        "psdName": "主標題",
        "x": 726,
        "y": 148,
        "width": 411,
        "height": 64,
        "centerX": 931.5,
        "centerY": 183,
        "hidden": false,
        "text": "專屬蝦幣18%",
        "fontSizePt": 68,
        "fontSizePx": 68,
        "fontSizePtRaw": 50.98893737792969,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "left",
        "textAlign": "left",
        "color": "#EE4D2D",
        "lineHeight": 81.6,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.3336225544687654,
          "scaleY": 1.333622554468765
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 8,
            "fontSizePx": 68,
            "fontSizePtRaw": 50.98893737792969,
            "fontFamily": "ShopeeNotoSans Content",
            "fontWeight": "700",
            "fontStyleName": "Bold",
            "fontPostScriptName": "ShopeeNotoSanscontent-Bold",
            "color": "#EE4D2D",
            "lineHeight": 81.6,
            "letterSpacing": 0
          }
        ]
      },
      "subtitle": {
        "type": "text",
        "psdName": "副標題",
        "x": 646,
        "y": 251,
        "width": 282,
        "height": 45,
        "centerX": 787,
        "centerY": 276,
        "hidden": false,
        "text": "最高800蝦幣",
        "fontSizePt": 48.5,
        "fontSizePx": 48.5,
        "fontSizePtRaw": 54.23969268798828,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "center",
        "textAlign": "center",
        "color": "#EE4D2D",
        "lineHeight": 58.2,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.8941791248914114,
          "scaleY": 0.8941791248914118
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 8,
            "fontSizePx": 48.5,
            "fontSizePtRaw": 54.23969268798828,
            "fontFamily": "ShopeeNotoSans Content",
            "fontWeight": "500",
            "fontStyleName": "Medium",
            "fontPostScriptName": "ShopeeNotoSanscontent-Medium",
            "color": "#EE4D2D",
            "lineHeight": 58.2,
            "letterSpacing": 0
          }
        ]
      },
      "副標題_線框": {
        "type": "shape",
        "psdName": "副標題_線框",
        "x": 437,
        "y": 237,
        "width": 700,
        "height": 78,
        "centerX": 787,
        "centerY": 276,
        "radius": 3.5,
        "cornerRadius": 3.5,
        "fill": "transparent",
        "fillOpacity": 0,
        "opacity": 100,
        "fillEnabled": false,
        "useDynamicBounds": true,
        "shape": {
          "kind": "roundedRectangle",
          "fill": "transparent",
          "cornerRadius": 3.5,
          "stroke": {
            "enabled": true,
            "width": 1.16,
            "color": "#EE4D2D",
            "opacity": 100
          },
          "pathBounds": {
            "x": 437,
            "y": 237,
            "width": 700,
            "height": 78,
            "centerX": 787,
            "centerY": 276
          },
          "geometry": null,
          "vectorPath": null
        }
      },
      "legal": {
        "type": "text",
        "psdName": "法務小字",
        "x": 535.5,
        "y": 332,
        "width": 503,
        "height": 37,
        "centerX": 787,
        "centerY": 351.5,
        "hidden": false,
        "text": "優惠券詳細規則請見活動說明",
        "fontSizePt": 39,
        "fontSizePx": 39,
        "fontSizePtRaw": 57.56596374511719,
        "fontFamily": "Noto Sans CJK TC",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#464646",
        "lineHeight": 46.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.6781739347697779,
          "scaleY": 0.6774836589059842
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 14,
            "fontSizePx": 39,
            "fontSizePtRaw": 57.56596374511719,
            "fontFamily": "Noto Sans CJK TC",
            "fontWeight": "400",
            "fontStyleName": "Regular",
            "fontPostScriptName": "NotoSansCJKtc-Regular",
            "color": "#464646",
            "lineHeight": 46.8,
            "letterSpacing": 0
          }
        ]
      },
      "CTA_案型": {
        "type": "text",
        "psdName": "CTA_案型",
        "x": 709.5,
        "y": 411,
        "width": 155,
        "height": 50,
        "centerX": 787,
        "centerY": 438,
        "hidden": false,
        "text": "領券去",
        "fontSizePt": 53,
        "fontSizePx": 53,
        "fontSizePtRaw": 45.49166488647461,
        "fontFamily": "Noto Sans CJK TC",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#FFFFFF",
        "lineHeight": 63.6,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.1650485436893203,
          "scaleY": 1.1650485436893203
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 4,
            "fontSizePx": 53,
            "fontSizePtRaw": 45.49166488647461,
            "fontFamily": "Noto Sans CJK TC",
            "fontWeight": "400",
            "fontStyleName": "Regular",
            "fontPostScriptName": "NotoSansCJKtc-Regular",
            "color": "#FFFFFF",
            "lineHeight": 63.6,
            "letterSpacing": 0
          }
        ]
      },
      "CTA_BG": {
        "type": "shape",
        "psdName": "CTA_BG",
        "x": 437,
        "y": 390,
        "width": 700,
        "height": 96,
        "centerX": 787,
        "centerY": 438,
        "radius": 12,
        "cornerRadius": 12,
        "fill": "#EE4D2D",
        "fillOpacity": 100,
        "fillEnabled": true,
        "useDynamicBounds": true,
        "shape": {
          "kind": "roundedRectangle",
          "fill": "#EE4D2D",
          "cornerRadius": 12,
          "stroke": {
            "enabled": false,
            "width": 0,
            "color": null,
            "opacity": null
          },
          "pathBounds": {
            "x": 437,
            "y": 390,
            "width": 700,
            "height": 96,
            "centerX": 787,
            "centerY": 438
          },
          "geometry": null,
          "vectorPath": null
        }
      },
      "蝦皮VIP": {
        "type": "image",
        "psdName": "蝦皮VIP",
        "x": 134,
        "y": 186,
        "width": 188,
        "height": 226,
        "centerX": 228,
        "centerY": 299,
        "assetFilename": "09_AR Large BN/直式_蝦皮VIP_LOGO.svg",
        "hidden": false,
        "keepAspectRatio": true
      },
      "蝦皮購物_LOGO": {
        "type": "image",
        "psdName": "蝦皮購物_LOGO",
        "x": 145,
        "y": 193,
        "width": 156,
        "height": 213,
        "centerX": 223,
        "centerY": 299.5,
        "assetFilename": "09_AR Large BN/蝦皮購物_LOGO.svg",
        "hidden": true,
        "keepAspectRatio": true
      },
      "kv_bg": {
        "type": "image",
        "psdName": "KV_BG",
        "x": 36,
        "y": 42,
        "width": 1128,
        "height": 516,
        "centerX": 600,
        "centerY": 300,
        "assetFilename": "AR Large BN_KV_BG.png"
      }
    },
    "generatedLayers": {
      "subtitle_frame": {
        "type": "shape",
        "x": 787,
        "centerX": 787,
        "hidden": true,
        "radius": "capsule",
        "fill": "#0053D1"
      }
    },
    "renderOrder": [
      "kv_bg",
      "蝦皮購物_LOGO",
      "蝦皮VIP",
      "CTA_BG",
      "CTA_案型",
      "legal",
      "副標題_線框",
      "subtitle",
      "title",
      "蝦皮VIP_LOGO_橘色"
    ]
  },
  "normal": {
    "layers": {
      "蝦皮VIP_LOGO_橘色": {
        "type": "image",
        "psdName": "蝦皮VIP_LOGO_橘色",
        "x": 439,
        "y": 114,
        "width": 282,
        "height": 100,
        "centerX": 580,
        "centerY": 164,
        "assetFilename": "AR Large BN_蝦皮VIP_LOGO_橘色.png",
        "hidden": true
      },
      "title": {
        "type": "text",
        "psdName": "主標題",
        "x": 581.5,
        "y": 142,
        "width": 411,
        "height": 64,
        "centerX": 787,
        "centerY": 183,
        "hidden": false,
        "text": "狂灑全站95折",
        "fontSizePt": 76,
        "fontSizePx": 76,
        "fontSizePtRaw": 50.98893737792969,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Bold",
        "fontWeight": "700",
        "italic": false,
        "align": "center",
        "textAlign": "center",
        "color": "#000000",
        "lineHeight": 82.08,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.3336225544687654,
          "scaleY": 1.333622554468765
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 8,
            "fontSizePx": 68,
            "fontSizePtRaw": 50.98893737792969,
            "fontFamily": "ShopeeNotoSans Content",
            "fontWeight": "700",
            "fontStyleName": "Bold",
            "fontPostScriptName": "ShopeeNotoSanscontent-Bold",
            "color": "#EE4D2D",
            "lineHeight": 81.6,
            "letterSpacing": 0
          }
        ]
      },
      "subtitle": {
        "type": "text",
        "psdName": "副標題",
        "x": 646,
        "y": 251,
        "width": 282,
        "height": 45,
        "centerX": 787,
        "centerY": 276,
        "hidden": false,
        "text": "低消$1,000就能用",
        "fontSizePt": 48.5,
        "fontSizePx": 48.5,
        "fontSizePtRaw": 54.23969268798828,
        "fontFamily": "ShopeeNotoSans Content",
        "fontStyle": "Medium",
        "fontWeight": "500",
        "italic": false,
        "align": "center",
        "textAlign": "center",
        "color": "#EE4D2D",
        "lineHeight": 58.2,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.8941791248914114,
          "scaleY": 0.8941791248914118
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 8,
            "fontSizePx": 48.5,
            "fontSizePtRaw": 54.23969268798828,
            "fontFamily": "ShopeeNotoSans Content",
            "fontWeight": "500",
            "fontStyleName": "Medium",
            "fontPostScriptName": "ShopeeNotoSanscontent-Medium",
            "color": "#EE4D2D",
            "lineHeight": 58.2,
            "letterSpacing": 0
          }
        ]
      },
      "副標題_線框": {
        "type": "shape",
        "psdName": "副標題_線框",
        "x": 535.5,
        "y": 237,
        "width": 503,
        "height": 78,
        "centerX": 787,
        "centerY": 276,
        "radius": 3.5,
        "cornerRadius": 3.5,
        "fill": "transparent",
        "fillOpacity": 0,
        "opacity": 100,
        "fillEnabled": false,
        "useDynamicBounds": true,
        "shape": {
          "kind": "roundedRectangle",
          "fill": "transparent",
          "cornerRadius": 3.5,
          "stroke": {
            "enabled": true,
            "width": 1.16,
            "color": "#EE4D2D",
            "opacity": 100
          },
          "pathBounds": {
            "x": 535.5,
            "y": 237,
            "width": 503,
            "height": 78,
            "centerX": 787,
            "centerY": 276
          },
          "geometry": null,
          "vectorPath": null
        }
      },
      "legal": {
        "type": "text",
        "psdName": "法務小字",
        "x": 535.5,
        "y": 332,
        "width": 503,
        "height": 37,
        "centerX": 787,
        "centerY": 351.5,
        "hidden": false,
        "text": "優惠券詳細規則請見活動說明",
        "fontSizePt": 39,
        "fontSizePx": 39,
        "fontSizePtRaw": 57.56596374511719,
        "fontFamily": "Noto Sans CJK TC",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#464646",
        "lineHeight": 46.8,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 0.6781739347697779,
          "scaleY": 0.6774836589059842
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 14,
            "fontSizePx": 39,
            "fontSizePtRaw": 57.56596374511719,
            "fontFamily": "Noto Sans CJK TC",
            "fontWeight": "400",
            "fontStyleName": "Regular",
            "fontPostScriptName": "NotoSansCJKtc-Regular",
            "color": "#464646",
            "lineHeight": 46.8,
            "letterSpacing": 0
          }
        ]
      },
      "CTA_案型": {
        "type": "text",
        "psdName": "CTA_案型",
        "x": 709.5,
        "y": 411,
        "width": 155,
        "height": 50,
        "centerX": 787,
        "centerY": 438,
        "hidden": false,
        "text": "領券去",
        "fontSizePt": 53,
        "fontSizePx": 53,
        "fontSizePtRaw": 45.49166488647461,
        "fontFamily": "Noto Sans CJK TC",
        "fontStyle": "Regular",
        "fontWeight": "400",
        "italic": false,
        "align": "center",
        "color": "#FFFFFF",
        "lineHeight": 63.6,
        "letterSpacing": 0,
        "textTransform": {
          "scaleX": 1.1650485436893203,
          "scaleY": 1.1650485436893203
        },
        "textStyleRanges": [
          {
            "from": 0,
            "to": 4,
            "fontSizePx": 53,
            "fontSizePtRaw": 45.49166488647461,
            "fontFamily": "Noto Sans CJK TC",
            "fontWeight": "400",
            "fontStyleName": "Regular",
            "fontPostScriptName": "NotoSansCJKtc-Regular",
            "color": "#FFFFFF",
            "lineHeight": 63.6,
            "letterSpacing": 0
          }
        ]
      },
      "CTA_BG": {
        "type": "shape",
        "psdName": "CTA_BG",
        "x": 535.5,
        "y": 390,
        "width": 503,
        "height": 96,
        "centerX": 787,
        "centerY": 438,
        "radius": 12,
        "cornerRadius": 12,
        "fill": "#EE4D2D",
        "fillOpacity": 100,
        "fillEnabled": true,
        "useDynamicBounds": true,
        "shape": {
          "kind": "roundedRectangle",
          "fill": "#EE4D2D",
          "cornerRadius": 12,
          "stroke": {
            "enabled": false,
            "width": 0,
            "color": null,
            "opacity": null
          },
          "pathBounds": {
            "x": 535.5,
            "y": 390,
            "width": 503,
            "height": 96,
            "centerX": 787,
            "centerY": 438
          },
          "geometry": null,
          "vectorPath": null
        }
      },
      "蝦皮VIP": {
        "type": "image",
        "psdName": "蝦皮VIP",
        "x": 134,
        "y": 186,
        "width": 188,
        "height": 226,
        "centerX": 228,
        "centerY": 299,
        "assetFilename": "09_AR Large BN/直式_蝦皮VIP_LOGO.svg",
        "hidden": true,
        "keepAspectRatio": true
      },
      "蝦皮購物_LOGO": {
        "type": "image",
        "psdName": "蝦皮購物_LOGO",
        "x": 145,
        "y": 193,
        "width": 156,
        "height": 213,
        "centerX": 223,
        "centerY": 299.5,
        "assetFilename": "09_AR Large BN/蝦皮購物_LOGO.svg",
        "hidden": false,
        "keepAspectRatio": true
      },
      "kv_bg": {
        "type": "image",
        "psdName": "KV_BG",
        "x": 36,
        "y": 42,
        "width": 1128,
        "height": 516,
        "centerX": 600,
        "centerY": 300,
        "assetFilename": "AR Large BN_KV_BG.png"
      }
    },
    "generatedLayers": {
      "subtitle_frame": {
        "type": "shape",
        "x": 787,
        "centerX": 787,
        "hidden": true,
        "radius": "capsule",
        "fill": "#0053D1"
      }
    },
    "renderOrder": [
      "kv_bg",
      "蝦皮購物_LOGO",
      "蝦皮VIP",
      "CTA_BG",
      "CTA_案型",
      "legal",
      "副標題_線框",
      "subtitle",
      "title",
      "蝦皮VIP_LOGO_橘色"
    ]
  }
});

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function getTitleText(record = {}, template = null) {
    return findRecordValue(record, ['主標題', '主標', 'title']) || toText(template?.layers?.title?.text);
  }

  function isVipTitle(title) {
    return /VIP/i.test(toText(title));
  }

  function isExactVipCoinTitle(title) {
    return normalize(title) === normalize('VIP專屬蝦幣18%');
  }

  function findLayerKey(template, keys = []) {
    const layers = template?.layers || {};
    for (const key of keys) if (layers[key]) return key;

    const wanted = keys.map(normalize).filter(Boolean);
    return Object.entries(layers).find(([, layer]) => {
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return wanted.some((word) => label.includes(word));
    })?.[0] || '';
  }

  function findLayer(template, keys = []) {
    const key = findLayerKey(template, keys);
    return key ? template.layers[key] : null;
  }

  function applyLayerSnapshot(target, source) {
    if (!target || !source) return;
    const preserveText = target.type === 'text' ? target.text : undefined;
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, deepClone(source));
    if (preserveText !== undefined && target.psdName !== '主標題') {
      target.text = preserveText;
    }
    if (target.type === 'shape') {
      target.useDynamicBounds = true;
      target.vectorPath = null;
      if (target.shape) {
        target.shape.geometry = null;
        target.shape.vectorPath = null;
      }
    }
  }

  function applySnapshot(template, variantKey) {
    const snapshot = SNAPSHOTS[variantKey];
    if (!template?.layers || !snapshot) return;

    Object.entries(snapshot.layers || {}).forEach(([snapshotKey, snapshotLayer]) => {
      const targetKey = findLayerKey(template, [snapshotKey, snapshotLayer.psdName]);
      const target = targetKey ? template.layers[targetKey] : null;
      if (target) applyLayerSnapshot(target, snapshotLayer);
      else template.layers[snapshotKey] = deepClone(snapshotLayer);
    });

    if (snapshot.generatedLayers?.subtitle_frame) {
      template.generatedLayers = template.generatedLayers || {};
      template.generatedLayers.subtitle_frame = deepClone(snapshot.generatedLayers.subtitle_frame);
      template.generatedLayers.subtitle_frame.hidden = true;
    }

    if (Array.isArray(snapshot.renderOrder)) {
      template.renderOrder = snapshot.renderOrder.filter((key) => key !== 'subtitle_frame');
    }
  }

  function setLayerCenterX(layer, centerX) {
    if (!layer) return;
    const width = Number(layer.width || 0);
    layer.centerX = round(centerX);
    layer.x = round(centerX - width / 2);
    updateShapeBounds(layer);
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
    return Number(layer.width || 0);
  }

  function updateShapeBounds(layer) {
    if (!layer || layer.type !== 'shape') return;
    layer.centerX = Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : round(Number(layer.x || 0) + Number(layer.width || 0) / 2);
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

  function setLayerWidthCentered(layer, width, centerX = TITLE_GROUP_CENTER_X) {
    if (!layer) return;
    const nextWidth = round(Math.max(1, Number(width || 1)));
    layer.width = nextWidth;
    layer.centerX = round(centerX);
    layer.x = round(centerX - nextWidth / 2);
    updateShapeBounds(layer);
  }

  function getVisualTextWidth(layer, helpers) {
    if (!layer || layer.hidden) return 0;
    return Math.max(1, measureTextWidth(layer, helpers), Number(layer.width || 0));
  }

  function keepVipLogoTitleCentered(template, helpers) {
    const titleLayer = findLayer(template, ['title', '主標題']);
    const orangeVipLogo = findLayer(template, ['蝦皮VIP_LOGO_橘色', 'VIP_LOGO_橘色']);
    if (!titleLayer || !orangeVipLogo || orangeVipLogo.hidden) return 0;

    const logoWidth = Number(orangeVipLogo.width || 0);
    const measuredTitleWidth = Math.max(1, measureTextWidth(titleLayer, helpers));
    titleLayer.width = round(measuredTitleWidth);

    const groupWidth = logoWidth + TITLE_LOGO_GAP_PX + measuredTitleWidth;
    const startX = TITLE_GROUP_CENTER_X - groupWidth / 2;

    orangeVipLogo.x = round(startX);
    orangeVipLogo.centerX = round(startX + logoWidth / 2);

    titleLayer.x = round(startX + logoWidth + TITLE_LOGO_GAP_PX);
    titleLayer.centerX = round(titleLayer.x + measuredTitleWidth / 2);
    return groupWidth;
  }

  function alignSubtitleToFrame(template) {
    const subtitle = findLayer(template, ['subtitle', '副標題']);
    const subtitleFrame = findLayer(template, ['副標題_線框']);
    if (!subtitle || !subtitleFrame) return;
    subtitle.centerX = round(Number(subtitleFrame.centerX || subtitleFrame.x + subtitleFrame.width / 2));
    subtitle.centerY = round(Number(subtitleFrame.centerY || subtitleFrame.y + subtitleFrame.height / 2));
    subtitle.x = round(subtitle.centerX - Number(subtitle.width || 0) / 2);
    subtitle.y = round(subtitle.centerY - Number(subtitle.height || 0) / 2);
    subtitle.align = 'center';
    subtitle.textAlign = 'center';
  }

  function alignCommonLayers(template) {
    [
      ['subtitle', '副標題'],
      ['legal', '法務小字'],
      ['CTA_案型'],
      ['副標題_線框'],
      ['CTA_BG'],
    ].forEach((names) => setLayerCenterX(findLayer(template, names), TITLE_GROUP_CENTER_X));
    alignSubtitleToFrame(template);
  }

  function resizeActionFrames(template, helpers, titleGroupWidth = 0) {
    const subtitle = findLayer(template, ['subtitle', '副標題']);
    const legal = findLayer(template, ['legal', '法務小字']);
    const title = findLayer(template, ['title', '主標題']);
    const subtitleFrame = findLayer(template, ['副標題_線框']);
    const ctaBg = findLayer(template, ['CTA_BG']);

    const snapshotWidth = Math.max(Number(subtitleFrame?.width || 0), Number(ctaBg?.width || 0));
    const maxWidth = Math.max(
      1,
      snapshotWidth,
      Number(titleGroupWidth || 0),
      getVisualTextWidth(title, helpers),
      getVisualTextWidth(subtitle, helpers),
      getVisualTextWidth(legal, helpers)
    );

    setLayerWidthCentered(subtitleFrame, maxWidth, TITLE_GROUP_CENTER_X);
    setLayerWidthCentered(ctaBg, maxWidth, TITLE_GROUP_CENTER_X);
  }

  function applyTitleRule(template, record, helpers, diagnostics) {
    const rawTitle = getTitleText(record, template);
    const hasVip = isVipTitle(rawTitle);
    const variantKey = hasVip ? 'vip' : 'normal';

    applySnapshot(template, variantKey);

    const titleLayer = findLayer(template, ['title', '主標題']);
    const orangeVipLogo = findLayer(template, ['蝦皮VIP_LOGO_橘色', 'VIP_LOGO_橘色']);

    let titleGroupWidth = 0;

    if (titleLayer) {
      if (isExactVipCoinTitle(rawTitle)) {
        titleLayer.text = '專屬蝦幣18%';
        titleGroupWidth = keepVipLogoTitleCentered(template, helpers);
      } else {
        titleLayer.text = rawTitle || titleLayer.text;
        titleLayer.align = hasVip ? 'left' : 'center';
        titleLayer.textAlign = titleLayer.align;
        if (orangeVipLogo) orangeVipLogo.hidden = true;
        setLayerCenterX(titleLayer, TITLE_GROUP_CENTER_X);
        titleGroupWidth = getVisualTextWidth(titleLayer, helpers);
      }
    }

    diagnostics?.push?.({
      field: '主標題',
      status: 'ok',
      value: rawTitle,
      target: hasVip ? '套用 AR Large BN_01_edited.json 數值' : '套用 AR Large BN_02_edited.json 數值',
    });

    return titleGroupWidth;
  }

  function applyProgrammaticLayout(template, record, diagnostics, helpers) {
    const titleGroupWidth = applyTitleRule(template, record, helpers, diagnostics);
    alignCommonLayers(template);
    resizeActionFrames(template, helpers, titleGroupWidth);
    alignSubtitleToFrame(template);
  }

  const ARLargeBNTemplateRules = {
    resolveRecordTemplateRoute({ block }) {
      const blockName = toText(block?.name);
      if (!/AR\s*Large\s*BN/i.test(blockName)) return null;
      return {
        key: 'ar_large_bn',
        family: FAMILY,
        label: 'AR Large BN',
        templateId: TEMPLATE_ID,
        templateFile: `${TEMPLATE_ID}.json`,
        outputPrefix: 'AR Large BN',
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
    label: 'AR Large BN',
    priority: 32,
    tokens: ['ar large bn', 'ar_large_bn', 'ar largebn', '09_ar large bn'],
    targets: ['09_ar large bn', 'ar large bn', 'ar_large_bn'],
    rules: ARLargeBNTemplateRules,
  });
})();
