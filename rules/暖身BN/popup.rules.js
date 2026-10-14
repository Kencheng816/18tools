/* POPUP template rules – V4.17 */
(function () {
  'use strict';

const KEYWORD_VIP = 'VIP';
  const KEYWORD_SCS = '蝦皮直營';
  const TEMPLATE_BASE = '05_POPUP';
  const TEMPLATE_VIP = '05_POPUP_VIP';
  const TEMPLATE_SCS = '05_POPUP_SCS';
  const GAP_PX = 8;

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  function resolvePopupVariant(title) {
    const rawTitle = toText(title);
    if (rawTitle.includes(KEYWORD_SCS)) {
      return {
        key: 'popup_scs',
        family: 'popup',
        label: 'POPUP 蝦皮直營',
        templateId: TEMPLATE_SCS,
        templateFile: `${TEMPLATE_SCS}.json`,
        outputPrefix: 'POPUP',
        popupVariant: 'scs',
      };
    }
    if (rawTitle.includes(KEYWORD_VIP)) {
      return {
        key: 'popup_vip',
        family: 'popup',
        label: 'POPUP VIP',
        templateId: TEMPLATE_VIP,
        templateFile: `${TEMPLATE_VIP}.json`,
        outputPrefix: 'POPUP',
        popupVariant: 'vip',
      };
    }
    return {
      key: 'popup',
      family: 'popup',
      label: 'POPUP',
      templateId: TEMPLATE_BASE,
      templateFile: `${TEMPLATE_BASE}.json`,
      outputPrefix: 'POPUP',
      popupVariant: 'default',
    };
  }

  function splitOnce(value, keyword) {
    const raw = toText(value);
    const index = raw.indexOf(keyword);
    if (index < 0) return { before: raw, after: '' };
    return {
      before: raw.slice(0, index).trim(),
      after: raw.slice(index + keyword.length).trim(),
    };
  }

  function setText(layer, value) {
    if (!layer) return;
    layer.text = toText(value);
    layer.hidden = !layer.text;
  }

  function setImage(layer, filename) {
    if (!layer) return;
    layer.assetFilename = filename;
    layer.hidden = false;
    layer.keepAspectRatio = true;
  }

  function setLayerX(layer, x, width) {
    if (!layer) return;
    if (Number.isFinite(width)) layer.width = round(Math.max(0, width));
    layer.x = round(x);
    layer.centerX = round(layer.x + Number(layer.width || 0) / 2);
  }

  function measure(layer, helpers) {
    if (!layer || layer.hidden) return 0;
    return Math.max(0, Number(helpers.measureTextWidth(layer) || layer.width || 0));
  }

  function calculateCapsuleWidth({ titleWidth, subtitleWidth, rules }) {
    const basePadding = Number(rules.horizontalPaddingPx ?? 25);
    const titlePadding = Number(rules.titleWiderPaddingPx ?? basePadding);
    const subtitlePadding = Number(rules.subtitleWiderPaddingPx ?? basePadding);
    const diff = Math.abs(Number(titleWidth || 0) - Number(subtitleWidth || 0));

    if (subtitleWidth > titleWidth) {
      const limit = rules.subtitleWiderPaddingMaxDiffPx;
      const shouldPad = limit === null || limit === undefined || diff < Number(limit);
      return subtitleWidth + (shouldPad ? subtitlePadding * 2 : 0);
    }

    if (titleWidth > subtitleWidth) {
      const limit = rules.titleWiderPaddingMaxDiffPx;
      const shouldPad = limit === null || limit === undefined || diff < Number(limit);
      return titleWidth + (shouldPad ? titlePadding * 2 : 0);
    }

    return Math.max(titleWidth, subtitleWidth);
  }

  function updateSubtitleCapsule({ template, titleWidth, centerX, helpers, rules }) {
    const subtitleEntry = helpers.findLayerEntry(template, rules.subtitleLayers || ['subtitle', '副標題'], { type: 'text' });
    if (!subtitleEntry?.layer) return;

    const subtitle = subtitleEntry.layer;
    const subtitleWidth = Math.max(1, measure(subtitle, helpers));
    const verticalPadding = Number(rules.verticalPaddingPx ?? 13);
    const capsuleWidth = Math.max(
      Number(rules.minWidthPx || 1),
      calculateCapsuleWidth({ titleWidth, subtitleWidth, rules })
    );
    const capsuleHeight = round(Number(subtitle.height || 0) + verticalPadding * 2);
    const capsuleX = round(centerX - capsuleWidth / 2);

    subtitle.width = round(capsuleWidth);
    subtitle.x = capsuleX;
    subtitle.centerX = round(centerX);

    const bgEntry = helpers.findLayerEntry(template, rules.backgroundLayers || ['副標題_BG', 'subtitle_frame'], { type: 'shape' });
    if (bgEntry?.layer) {
      const bg = bgEntry.layer;
      bg.type = 'shape';
      bg.fill = rules.fill || bg.fill || '#0053D1';
      bg.useDynamicBounds = true;
      bg.x = capsuleX;
      bg.width = round(capsuleWidth);
      bg.height = capsuleHeight;
      bg.y = round(Number(subtitle.y || 0) - verticalPadding);
      bg.centerX = round(centerX);
      bg.centerY = round(bg.y + bg.height / 2);
      bg.radius = bg.height / 2;
      bg.hidden = false;

      // SCS/VIP 模板本身已有「副標題_BG」，移除 generated subtitle_frame 避免藍色膠囊重疊繪製。
      template.renderOrder = (template.renderOrder || []).filter((key) => key !== 'subtitle_frame');
      helpers.insertBefore(template, bgEntry.key, [subtitleEntry.key]);
    }

    const legalEntry = helpers.findLayerEntry(template, rules.legalLayers || ['legal', '法務', '法務小字'], { type: 'text' });
    if (legalEntry?.layer) helpers.setLayerCenterX(legalEntry.layer, centerX);
  }

  function resolveTemplateLayoutKey(template) {
    return String(
      template?.pricePresetMeta?.templateId ||
      template?.batchSourceName ||
      template?.templateId ||
      template?.sheetTemplateRoute?.templateId ||
      template?.sheetTemplateRoute?.sourceTemplateId ||
      template?.source?.templateId ||
      ''
    ).trim();
  }

  function applyEditedVipLogoY(template, logoLayer, rules) {
    if (!logoLayer) return;

    const assetName = String(logoLayer.assetFilename || '').trim();
    const vipAssetName = String(rules.vipLogoAsset || '蝦皮VIP_LOGO.svg').trim();
    if (assetName && assetName !== vipAssetName) return;

    const templateKey = resolveTemplateLayoutKey(template);
    const logoLayouts = rules.vipLogoPositionLayouts || {};
    const editedLayout = logoLayouts[templateKey] || logoLayouts.default;
    if (!editedLayout) return;

    if (Number.isFinite(Number(editedLayout.y))) {
      logoLayer.y = round(Number(editedLayout.y));
    }

    if (Number.isFinite(Number(editedLayout.height))) {
      logoLayer.height = round(Number(editedLayout.height));
    }

    logoLayer.centerY = round(Number(logoLayer.y || 0) + Number(logoLayer.height || 0) / 2);
  }

  function layoutVipTitle(template, helpers, rules) {
    const leftEntry = helpers.findLayerEntry(template, ['主標題_左'], { type: 'text' });
    const logoEntry = helpers.findLayerEntry(template, ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO']);
    const rightEntry = helpers.findLayerEntry(template, ['主標題_右'], { type: 'text' });
    if (!leftEntry?.layer || !logoEntry?.layer) return 0;

    setImage(logoEntry.layer, rules.vipLogoAsset || '蝦皮VIP_LOGO.svg');
    applyEditedVipLogoY(template, logoEntry.layer, rules);

    const leftWidth = measure(leftEntry.layer, helpers);
    const rightWidth = measure(rightEntry?.layer, helpers);
    const logoWidth = Number(logoEntry.layer.width || 0);
    const gap = Number(rules.logoGapPx ?? GAP_PX);
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const hasLeftTitle = leftWidth > 0;
    const hasRightTitle = rightWidth > 0;

    // POPUP VIP 主標採用 Photoshop 較穩定的排版方式：
    // 左文字以「右對齊」貼齊 VIP 左側，右文字以「左對齊」從 VIP 右側展開。
    // Canvas 繪字不使用 maxWidth，因此文字生成不會被文字框寬度裁切。
    leftEntry.layer.align = 'right';
    leftEntry.layer.textAlign = 'right';
    if (rightEntry?.layer) {
      rightEntry.layer.align = 'left';
      rightEntry.layer.textAlign = 'left';
    }

    const leftGap = hasLeftTitle ? gap : 0;
    const rightGap = hasRightTitle ? gap : 0;

    // 主標題_右不再固定最小 120px，改為依照文字真實寬度排版。
    // 若像 POPUP_05 只有主標題_左、沒有主標題_右，則「主標題_左 + 8px + VIP Logo」整組置中。
    const groupWidth = leftWidth + leftGap + logoWidth + rightGap + rightWidth;
    let x = centerX - groupWidth / 2;

    setLayerX(leftEntry.layer, x, leftWidth);
    x += leftWidth + leftGap;

    setLayerX(logoEntry.layer, x);
    x += logoWidth + rightGap;

    if (rightEntry?.layer) {
      setLayerX(rightEntry.layer, x, rightWidth);
      rightEntry.layer.hidden = !hasRightTitle;
    }

    return groupWidth;
  }

  function layoutScsTitle(template, helpers, rules) {
    const logoEntry = helpers.findLayerEntry(template, ['蝦皮直營_LOGO', '蝦皮直營 LOGO']);
    const titleEntry = helpers.findLayerEntry(template, ['title', '主標題'], { type: 'text' });
    if (!logoEntry?.layer || !titleEntry?.layer) return 0;

    setImage(logoEntry.layer, rules.scsLogoAsset || '蝦皮直營_LOGO-01.svg');

    const titleWidth = measure(titleEntry.layer, helpers);
    const logoWidth = Number(logoEntry.layer.width || 0);
    const gap = Number(rules.logoGapPx ?? GAP_PX);
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const groupWidth = logoWidth + gap + titleWidth;
    let x = centerX - groupWidth / 2;

    setLayerX(logoEntry.layer, x);
    x += logoWidth + gap;
    setLayerX(titleEntry.layer, x, titleWidth);
    return groupWidth;
  }

  function layoutDefaultTitle(template, helpers) {
    const titleEntry = helpers.findLayerEntry(template, ['title', '主標題'], { type: 'text' });
    if (!titleEntry?.layer) return 0;
    const width = measure(titleEntry.layer, helpers);
    const centerX = Number(template.canvas?.width / 2 ?? 290);
    titleEntry.layer.width = round(width);
    helpers.setLayerCenterX(titleEntry.layer, centerX);
    return width;
  }

  const RULES = {
    capsuleRules: {
      horizontalPaddingPx: 25,
      subtitleWiderPaddingPx: 25,
      subtitleWiderPaddingMaxDiffPx: null,
      titleWiderPaddingPx: 25,
      titleWiderPaddingMaxDiffPx: 70,
      verticalGapPx: 13,
      verticalPaddingPx: 13,
      legalGapPx: 11,
      fill: '#0053D1',
      radius: 'capsule',
      minWidthPx: 1,
    },

    priceRules: {
      "enabled": true,
      "coordinateMode": "absolute",
      "positioningMode": "absolute",
      "lockToEditedJson": true,
      "productFirst": false,
      "resolvePriority": "templateFirst",
      "templateLayouts": {
            "POPUP_01": {
                  "productImageBox": {
                        "x": 76.7,
                        "y": 310.0,
                        "width": 423.6,
                        "height": 269.3,
                        "targetWidth": 423.6,
                        "targetHeight": 269.3,
                        "maxTargetHeight": 269.3,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "single",
                              "psdName": "價格",
                              "x": 177.4,
                              "y": 419.6,
                              "width": 318.0,
                              "height": 117.0,
                              "centerX": 336.4,
                              "centerY": 478.1,
                              "rotation": 12.0,
                              "fontSizePx": 70.0,
                              "fontSizePt": 70.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 75.6,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_02": {
                  "productImageBox": {
                        "x": 105.0,
                        "y": 309.8,
                        "width": 377.0,
                        "height": 295.3,
                        "targetWidth": 377.0,
                        "targetHeight": 295.3,
                        "maxTargetHeight": 295.3,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "bottom",
                              "psdName": "價格1（下券）",
                              "x": 222.3,
                              "y": 468.7,
                              "width": 231.4,
                              "height": 102.7,
                              "centerX": 338.0,
                              "centerY": 520.05,
                              "rotation": 2.0,
                              "fontSizePx": 90.0,
                              "fontSizePt": 90.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 102.59,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        },
                        {
                              "slot": "top",
                              "psdName": "價格2（上券）",
                              "x": 217.3,
                              "y": 344.6,
                              "width": 231.4,
                              "height": 102.7,
                              "centerX": 333.0,
                              "centerY": 395.95,
                              "rotation": -6.0,
                              "fontSizePx": 90.0,
                              "fontSizePt": 90.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 102.59,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_03": {
                  "productImageBox": {
                        "x": 100.6,
                        "y": 311.7,
                        "width": 399.5,
                        "height": 275.7,
                        "targetWidth": 399.5,
                        "targetHeight": 275.7,
                        "maxTargetHeight": 275.7,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "single",
                              "psdName": "價格",
                              "x": 265.6,
                              "y": 464.4,
                              "width": 231.4,
                              "height": 85.8,
                              "centerX": 381.3,
                              "centerY": 507.3,
                              "rotation": -10.0,
                              "fontSizePx": 80.0,
                              "fontSizePt": 80.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 85.94,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_04": {
                  "productImageBox": {
                                    "x": 106.5,
                                    "y": 310,
                                    "width": 367.9,
                                    "height": 316.9,
                                    "centerX": 290.4,
                                    "centerY": 468.4,
                                    "targetWidth": 367.9,
                                    "targetHeight": 316.9,
                                    "maxTargetHeight": 316.9,
                                    "sizingMode": "containByPBox",
                                    "keepAspectRatio": true
                  },
                  "layouts": [
                                    {
                                                      "slot": "single",
                                                      "psdName": "價格",
                                                      "x": 164.59,
                                                      "y": 489.28,
                                                      "width": 264.97,
                                                      "height": 116.59,
                                                      "centerX": 297.08,
                                                      "centerY": 547.57,
                                                      "rotation": 8,
                                                      "fontSizePx": 84.79,
                                                      "fontSizePt": 84.79,
                                                      "letterSpacing": 0,
                                                      "lineHeight": 91.57,
                                                      "lineHeightMultiplier": 1.08,
                                                      "color": "#ee4d2d",
                                                      "positioningMode": "absolute",
                                                      "lockToEditedJson": true,
                                                      "disableAnchorSync": false,
                                                      "followProduct": true,
                                                      "preserveExactSize": true,
                                                      "skipAutoScale": true,
                                                      "disableContentScale": true,
                                                      "baseHeight": 110,
                                                      "baseWidth": 250,
                                                      "baseFontSizePx": 80,
                                                      "rotationOffset": 8,
                                                      "offsetX": 6.3,
                                                      "offsetY": 74.7
                                    }
                  ]
},
            "POPUP_05": {
                  "productImageBox": {
                        "x": 76.5,
                        "y": 313.0,
                        "width": 423.1,
                        "height": 269.0,
                        "targetWidth": 423.1,
                        "targetHeight": 269.0,
                        "maxTargetHeight": 269.0,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "single",
                              "psdName": "價格",
                              "x": 177.0,
                              "y": 422.0,
                              "width": 329.0,
                              "height": 121.0,
                              "centerX": 341.5,
                              "centerY": 482.5,
                              "rotation": 12.0,
                              "fontSizePx": 70.0,
                              "fontSizePt": 70.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 78.22,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_06": {
                  "productImageBox": {
                        "x": 108.0,
                        "y": 312.0,
                        "width": 377.0,
                        "height": 292.9,
                        "targetWidth": 377.0,
                        "targetHeight": 292.9,
                        "maxTargetHeight": 292.9,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "bottom",
                              "psdName": "價格1（下券）",
                              "x": 219.3,
                              "y": 465.1,
                              "width": 231.4,
                              "height": 113.7,
                              "centerX": 335.0,
                              "centerY": 521.95,
                              "rotation": 2.0,
                              "fontSizePx": 104.99,
                              "fontSizePt": 104.99,
                              "letterSpacing": 0.0,
                              "lineHeight": 113.39,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        },
                        {
                              "slot": "top",
                              "psdName": "價格2（上券）",
                              "x": 211.3,
                              "y": 342.0,
                              "width": 231.4,
                              "height": 113.7,
                              "centerX": 327.0,
                              "centerY": 398.85,
                              "rotation": -6.0,
                              "fontSizePx": 104.99,
                              "fontSizePt": 104.99,
                              "letterSpacing": 0.0,
                              "lineHeight": 113.39,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_07": {
                  "productImageBox": {
                        "x": 102.7,
                        "y": 318.8,
                        "width": 423.4,
                        "height": 261.4,
                        "targetWidth": 423.4,
                        "targetHeight": 261.4,
                        "maxTargetHeight": 261.4,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "single",
                              "psdName": "價格",
                              "x": 205.1,
                              "y": 473.2,
                              "width": 153.6,
                              "height": 60.1,
                              "centerX": 281.9,
                              "centerY": 503.25,
                              "rotation": -6.0,
                              "fontSizePx": 46.0,
                              "fontSizePt": 46.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 52.47,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            },
            "POPUP_08": {
                  "productImageBox": {
                        "x": 108.0,
                        "y": 312.0,
                        "width": 377.0,
                        "height": 292.9,
                        "targetWidth": 377.0,
                        "targetHeight": 292.9,
                        "maxTargetHeight": 292.9,
                        "sizingMode": "containByPBox",
                        "keepAspectRatio": true
                  },
                  "layouts": [
                        {
                              "slot": "bottom",
                              "psdName": "價格1（下券）",
                              "x": 219.3,
                              "y": 468.1,
                              "width": 231.4,
                              "height": 113.7,
                              "centerX": 335.0,
                              "centerY": 524.95,
                              "rotation": 2.0,
                              "fontSizePx": 90.0,
                              "fontSizePt": 90.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 102.6,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        },
                        {
                              "slot": "top",
                              "psdName": "價格2（上券）",
                              "x": 210.3,
                              "y": 342.0,
                              "width": 231.4,
                              "height": 113.7,
                              "centerX": 326.0,
                              "centerY": 398.85,
                              "rotation": -6.0,
                              "fontSizePx": 90.0,
                              "fontSizePt": 90.0,
                              "letterSpacing": 0.0,
                              "lineHeight": 102.6,
                              "positioningMode": "absolute",
                              "lockToEditedJson": true,
                              "disableAnchorSync": true,
                        }
                  ]
            }
      },
      "productLayouts": {}
},

    layoutRules: {
      centerX: 290,
      logoGapPx: GAP_PX,
      vipLogoAsset: '蝦皮VIP_LOGO.svg',
      vipLogoPositionLayouts: {
        POPUP_01: { y: 93, height: 76 },
        POPUP_05: { y: 93, height: 76 },
        POPUP_06: { y: 93, height: 76 },
        default: { y: 93, height: 76 },
      },
      scsLogoAsset: '蝦皮直營_LOGO-01.svg',
      subtitleLayers: ['subtitle', '副標題'],
      backgroundLayers: ['副標題_BG', 'subtitle_frame'],
      legalLayers: ['legal', '法務', '法務小字'],
      horizontalPaddingPx: 25,
      subtitleWiderPaddingPx: 25,
      subtitleWiderPaddingMaxDiffPx: null,
      titleWiderPaddingPx: 25,
      titleWiderPaddingMaxDiffPx: 70,
      verticalPaddingPx: 13,
      fill: '#0053D1',
      minWidthPx: 1,

      applyProgrammaticLayout({ template, helpers }) {
        if (!template?.layers) return;
        const rules = this;
        const label = String(template.sheetTemplateRoute?.templateId || template.templateId || template.source?.psdName || '').toLowerCase();
        const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
        let titleWidth = 0;

        const routeKey = String(template.sheetTemplateRoute?.key || '').toLowerCase();
        const isVipRoute = routeKey === 'popup_vip' || label.includes('vip');
        const isScsRoute = routeKey === 'popup_scs' || label.includes('scs');

        if (isVipRoute || template.layers['主標題_左'] || template.layers['主標題_右']) {
          titleWidth = layoutVipTitle(template, helpers, rules);
        } else if (isScsRoute) {
          titleWidth = layoutScsTitle(template, helpers, rules);
        } else {
          const scsLogo = template.layers?.['蝦皮直營_LOGO'];
          if (scsLogo) scsLogo.hidden = true;
          titleWidth = layoutDefaultTitle(template, helpers);
        }

        updateSubtitleCapsule({ template, titleWidth, centerX, helpers, rules });
      },
    },

    resolveRecordTemplateRoute({ block, record }) {
      const blockName = toText(block?.name);
      if (!/popup/i.test(blockName)) return null;
      return resolvePopupVariant(record?.['主標']);
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      const rawTitle = toText(record?.['主標']);
      if (!rawTitle) return;

      if (rawTitle.includes(KEYWORD_SCS)) {
        const title = rawTitle.replace(KEYWORD_SCS, '').trim();
        record['主標'] = title;
        setImage(template.layers?.['蝦皮直營_LOGO'], '蝦皮直營_LOGO-01.svg');
        diagnostics.push({ field: '主標', status: 'ok', value: rawTitle, target: 'POPUP SCS 標題拆解' });
        return;
      }

      const scsLogo = template.layers?.['蝦皮直營_LOGO'];
      if (scsLogo) scsLogo.hidden = true;

      if (rawTitle.includes(KEYWORD_VIP)) {
        const { before, after } = splitOnce(rawTitle, KEYWORD_VIP);
        setText(template.layers?.['主標題_左'], before);
        setText(template.layers?.['主標題_右'], after);
        setImage(template.layers?.['蝦皮VIP_LOGO'], '蝦皮VIP_LOGO.svg');
        record['主標'] = '';
        diagnostics.push({ field: '主標', status: 'ok', value: rawTitle, target: 'POPUP VIP 標題拆解' });
      }
    },
  };

  window.TemplateRuleRegistry?.register?.('popup', {
    family: 'popup',
    label: 'POPUP',
    priority: 18,
    tokens: ['popup', 'pop up', '05_popup'],
    targets: ['popup', '05_popup'],
    rules: RULES,
  });
})();