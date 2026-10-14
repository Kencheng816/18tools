/* POPUP template rules – V4.21.3 exact text-width capsule layout */
(function () {
  'use strict';

  const KEYWORD_VIP = 'VIP';
  const KEYWORD_SCS = '蝦皮直營';
  const TEMPLATE_BASE = '05_POPUP';
  const TEMPLATE_VIP = '05_POPUP_VIP';
  const TEMPLATE_SCS = '05_POPUP_SCS';
  const GAP_PX = 8;
  const CAPSULE_LAYER_KEY = '__popup_subtitle_capsule';

  const toText = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

  const norm = (value) => toText(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');

  const isVisible = (layer) => !!layer && layer.hidden !== true;

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

  function stripKeyword(value, keyword) {
    const safeKeyword = String(keyword || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return toText(value)
      .replace(new RegExp(safeKeyword, 'i'), '')
      .replace(/^\s*[+＋｜|／/・,，、-]+\s*/g, '')
      .replace(/\s*[+＋｜|／/・,，、-]+\s*$/g, '')
      .trim();
  }

  function setLayerVisible(layer, visible) {
    if (!layer) return;
    layer.hidden = !visible;
    layer.visible = !!visible;
  }

  function setText(layer, value) {
    if (!layer) return;
    layer.text = toText(value);
    setLayerVisible(layer, !!layer.text);
  }

  function setImage(layer, filename) {
    if (!layer) return;
    layer.assetFilename = filename;
    layer.assetCandidates = [filename].filter(Boolean);
    layer.keepAspectRatio = true;
    setLayerVisible(layer, true);
  }

  function setLayerX(layer, x, width) {
    if (!layer) return;
    if (Number.isFinite(Number(width))) layer.width = round(Math.max(1, Number(width)));
    layer.x = round(x);
    layer.centerX = round(layer.x + Number(layer.width || 0) / 2);
  }

  function setLayerY(layer, y, height) {
    if (!layer) return;
    if (Number.isFinite(Number(height))) layer.height = round(Math.max(1, Number(height)));
    layer.y = round(y);
    layer.centerY = round(layer.y + Number(layer.height || 0) / 2);
  }

  function findLayerEntry(template, candidates = [], options = {}) {
    const wanted = candidates.map(norm).filter(Boolean);
    const type = options.type || '';
    return Object.entries(template?.layers || {})
      .map(([key, layer]) => ({ key, layer }))
      .find(({ key, layer }) => {
        if (type && layer?.type !== type) return false;
        const label = norm(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
        return wanted.some((word) => label === word || label.includes(word));
      }) || null;
  }

  function cloneLayer(layer = {}) {
    try { return JSON.parse(JSON.stringify(layer || {})); }
    catch (_) { return { ...(layer || {}) }; }
  }

  function ensureLayer(template, key, baseLayer = {}) {
    if (!template?.layers || !key) return null;
    if (!template.layers[key]) template.layers[key] = cloneLayer(baseLayer);
    return template.layers[key];
  }

  function syncRenderOrder(template, baseKey, childKeys = []) {
    if (!template?.layers) return;
    const children = childKeys.filter(Boolean);
    const order = (template.renderOrder || Object.keys(template.layers))
      .filter((key) => !children.includes(key));
    const index = order.indexOf(baseKey);
    order.splice(index >= 0 ? index : order.length, 0, ...children);
    template.renderOrder = order.filter((key) => template.layers[key] || template.generatedLayers?.[key] || key === 'subtitle_frame');
  }

  function insertBefore(template, layerKey, beforeKeys = []) {
    template.renderOrder = (template.renderOrder || []).filter((key) => key !== layerKey && key !== 'subtitle_frame');
    const index = template.renderOrder.findIndex((key) => beforeKeys.includes(key));
    template.renderOrder.splice(index >= 0 ? index : template.renderOrder.length, 0, layerKey);
  }

  function measureActualText(layer, helpers) {
    if (!layer || layer.type !== 'text' || !toText(layer.text)) return 0;

    // Always measure a clean text-only clone. Never let Photoshop text-box width,
    // generated group proxy width, or hidden state participate in capsule sizing.
    const measureLayer = {
      ...layer,
      hidden: false,
      visible: true,
      width: 10000,
    };
    delete measureLayer.popupGroupProxy;
    delete measureLayer.popupGroupWidth;
    delete measureLayer.popupGroupHeight;
    delete measureLayer.popupGroupChildren;

    const width = Number(helpers.measureTextWidth(measureLayer) || 0);
    return Math.max(0, Math.ceil(width));
  }

  function groupWidthFromParts({ logoLayer, textLayer, helpers, gap = GAP_PX }) {
    const logoWidth = isVisible(logoLayer) ? Number(logoLayer.width || 0) : 0;
    const textWidth = measureActualText(textLayer, helpers);
    if (!logoWidth && !textWidth) return 0;
    return logoWidth + (logoWidth && textWidth ? Number(gap || 0) : 0) + textWidth;
  }

  function clearProxy(layer) {
    if (!layer) return;
    delete layer.popupGroupProxy;
    delete layer.popupGroupWidth;
    delete layer.popupGroupHeight;
    delete layer.popupGroupChildren;
  }

  function setProxy(layer, box, children = []) {
    if (!layer || !box) return;
    Object.assign(layer, {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      centerX: box.centerX,
      centerY: box.centerY,
      popupGroupProxy: true,
      popupGroupWidth: box.width,
      popupGroupHeight: box.height,
      popupGroupChildren: children,
    });
    setLayerVisible(layer, false);
  }

  function combinedBox(layers = []) {
    const items = layers.filter(isVisible);
    if (!items.length) return null;
    const left = Math.min(...items.map((layer) => Number(layer.x || 0)));
    const top = Math.min(...items.map((layer) => Number(layer.y || 0)));
    const right = Math.max(...items.map((layer) => Number(layer.x || 0) + Number(layer.width || 0)));
    const bottom = Math.max(...items.map((layer) => Number(layer.y || 0) + Number(layer.height || 0)));
    return {
      x: round(left),
      y: round(top),
      width: round(Math.max(1, right - left)),
      height: round(Math.max(1, bottom - top)),
      centerX: round(left + (right - left) / 2),
      centerY: round(top + (bottom - top) / 2),
    };
  }

  function ensureCapsuleLayer(template) {
    if (!template?.layers) return null;
    if (!template.layers[CAPSULE_LAYER_KEY]) {
      template.layers[CAPSULE_LAYER_KEY] = {
        type: 'shape',
        psdName: '副標題_BG',
        source: 'generated_popup_capsule',
        fill: '#0053D1',
        radius: 'capsule',
      };
    }
    return template.layers[CAPSULE_LAYER_KEY];
  }

  function applyVipLogoLayout(template, logoLayer, rules) {
    if (!logoLayer) return;
    const templateKey = String(
      template?.pricePresetMeta?.templateId ||
      template?.batchSourceName ||
      template?.templateId ||
      template?.sheetTemplateRoute?.templateId ||
      template?.sheetTemplateRoute?.sourceTemplateId ||
      template?.source?.templateId ||
      ''
    ).trim();
    const logoLayouts = rules.vipLogoPositionLayouts || {};
    const editedLayout = logoLayouts[templateKey] || logoLayouts.default;
    if (!editedLayout) return;
    if (Number.isFinite(Number(editedLayout.y))) logoLayer.y = round(Number(editedLayout.y));
    if (Number.isFinite(Number(editedLayout.height))) logoLayer.height = round(Number(editedLayout.height));
    logoLayer.centerY = round(Number(logoLayer.y || 0) + Number(logoLayer.height || 0) / 2);
  }

  function getTitleEntries(template) {
    const base = findLayerEntry(template, ['title', '主標題'], { type: 'text' });
    const vipLogo = findLayerEntry(template, ['主標題蝦皮VIP_LOGO', '蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO']);
    const vipText = findLayerEntry(template, ['主標題_文字'], { type: 'text' });
    const scsLogo = findLayerEntry(template, ['蝦皮直營_LOGO', '蝦皮直營 LOGO']);
    return { base, vipLogo, vipText, scsLogo };
  }

  function getSubtitleEntries(template) {
    const base = findLayerEntry(template, ['subtitle', '副標題'], { type: 'text' });
    const vipLogo = findLayerEntry(template, ['副標題蝦皮VIP_LOGO', '副標題_蝦皮VIP_LOGO', '副標題蝦皮VIP LOGO', '副標題 VIP LOGO']);
    const vipText = findLayerEntry(template, ['副標題_文字', '副標題文字'], { type: 'text' });
    return { base, vipLogo, vipText };
  }

  function resetTitleLayers(template) {
    const { base, vipLogo, vipText, scsLogo } = getTitleEntries(template);
    clearProxy(base?.layer);
    delete base?.layer?.popupGroupWidth;
    setLayerVisible(vipLogo?.layer, false);
    setLayerVisible(vipText?.layer, false);
    setLayerVisible(template.layers?.['主標題_左'], false);
    setLayerVisible(template.layers?.['主標題_右'], false);
    setLayerVisible(scsLogo?.layer, false);
  }

  function resetSubtitleGroup(template) {
    const { base, vipLogo, vipText } = getSubtitleEntries(template);
    clearProxy(base?.layer);
    setLayerVisible(vipLogo?.layer, false);
    setLayerVisible(vipText?.layer, false);
  }

  function layoutVipTitle(template, helpers, rules) {
    const { base, vipLogo: existingLogo } = getTitleEntries(template);
    if (!base?.layer) return { width: 0, centerX: Number(rules.centerX ?? 290), isGroup: false };

    const logoLayer = ensureLayer(template, '主標題蝦皮VIP_LOGO', existingLogo?.layer || {
      type: 'image',
      psdName: '主標題蝦皮VIP_LOGO',
      assetFilename: rules.vipLogoAsset || '蝦皮VIP_LOGO.svg',
      x: Number(base.layer.x || 0),
      y: Number(base.layer.y || 0),
      width: 180,
      height: 63,
      keepAspectRatio: true,
    });
    const textLayer = ensureLayer(template, '主標題_文字', {
      ...base.layer,
      type: 'text',
      psdName: '主標題_文字',
      align: 'left',
      textAlign: 'left',
    });
    if (!logoLayer || !textLayer) return { width: 0, centerX: Number(rules.centerX ?? 290), isGroup: false };

    setLayerVisible(template.layers?.['蝦皮VIP_LOGO'], false);
    setLayerVisible(template.layers?.['主標題_左'], false);
    setLayerVisible(template.layers?.['主標題_右'], false);
    setImage(logoLayer, rules.vipLogoAsset || '蝦皮VIP_LOGO.svg');
    logoLayer.psdName = '主標題蝦皮VIP_LOGO';
    textLayer.psdName = '主標題_文字';
    textLayer.align = 'left';
    textLayer.textAlign = 'left';
    setLayerVisible(textLayer, !!toText(textLayer.text));
    applyVipLogoLayout(template, logoLayer, rules);

    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const width = groupWidthFromParts({ logoLayer, textLayer, helpers, gap: Number(rules.logoGapPx ?? GAP_PX) });
    let x = centerX - width / 2;
    setLayerX(logoLayer, x);
    x += Number(logoLayer.width || 0) + (measureActualText(textLayer, helpers) ? Number(rules.logoGapPx ?? GAP_PX) : 0);
    setLayerX(textLayer, x, measureActualText(textLayer, helpers));

    const box = combinedBox([logoLayer, textLayer]);
    if (box) setProxy(base.layer, box, ['主標題蝦皮VIP_LOGO', '主標題_文字']);
    syncRenderOrder(template, base.key, ['主標題蝦皮VIP_LOGO', '主標題_文字']);
    return { width, centerX, isGroup: true };
  }

  function layoutScsTitle(template, helpers, rules) {
    const { base, scsLogo } = getTitleEntries(template);
    if (!base?.layer || !scsLogo?.layer) return { width: 0, centerX: Number(rules.centerX ?? 290), isGroup: false };

    setImage(scsLogo.layer, rules.scsLogoAsset || '蝦皮直營_LOGO-01.svg');
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const titleWidth = measureActualText(base.layer, helpers);
    const logoWidth = Number(scsLogo.layer.width || 0);
    const gap = Number(rules.logoGapPx ?? GAP_PX);
    const width = logoWidth + (titleWidth ? gap : 0) + titleWidth;
    let x = centerX - width / 2;

    setLayerX(scsLogo.layer, x);
    x += logoWidth + (titleWidth ? gap : 0);
    setLayerX(base.layer, x, titleWidth);
    base.layer.align = 'left';
    base.layer.textAlign = 'left';
    setLayerVisible(base.layer, true);
    base.layer.popupGroupWidth = width;
    return { width, centerX, isGroup: true };
  }

  function layoutDefaultTitle(template, helpers, rules) {
    const { base } = getTitleEntries(template);
    if (!base?.layer) return { width: 0, centerX: Number(rules.centerX ?? 290), isGroup: false };
    resetTitleLayers(template);
    const width = measureActualText(base.layer, helpers);
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    setLayerX(base.layer, centerX - Math.max(1, width) / 2, Math.max(1, width));
    base.layer.align = 'center';
    base.layer.textAlign = 'center';
    setLayerVisible(base.layer, true);
    return { width, centerX, isGroup: false };
  }

  function layoutVipSubtitle(template, helpers, rules) {
    const { base, vipLogo, vipText } = getSubtitleEntries(template);
    if (!base?.layer || !vipLogo?.layer || !vipText?.layer) {
      return { width: 0, centerX: Number(rules.centerX ?? 290), centerY: 0, isVip: false, beforeKeys: base ? [base.key] : [] };
    }

    setImage(vipLogo.layer, rules.vipLogoAsset || '蝦皮VIP_LOGO.svg');
    vipLogo.layer.psdName = '副標題蝦皮VIP_LOGO';
    vipText.layer.psdName = '副標題_文字';
    vipText.layer.align = 'left';
    vipText.layer.textAlign = 'left';
    setLayerVisible(vipText.layer, !!toText(vipText.layer.text));

    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const gap = Number(rules.logoGapPx ?? GAP_PX);
    const width = groupWidthFromParts({ logoLayer: vipLogo.layer, textLayer: vipText.layer, helpers, gap });
    const groupCenterY = Number(base.layer.centerY ?? ((Number(vipLogo.layer.centerY || 0) + Number(vipText.layer.centerY || 0)) / 2));
    let x = centerX - width / 2;
    setLayerX(vipLogo.layer, x);
    x += Number(vipLogo.layer.width || 0) + (measureActualText(vipText.layer, helpers) ? gap : 0);
    setLayerX(vipText.layer, x, measureActualText(vipText.layer, helpers));

    const box = combinedBox([vipLogo.layer, vipText.layer]);
    if (box) setProxy(base.layer, box, [vipLogo.key, vipText.key]);
    syncRenderOrder(template, base.key, [vipLogo.key, vipText.key]);
    return {
      width,
      centerX,
      centerY: box?.centerY || groupCenterY,
      isVip: true,
      beforeKeys: [vipLogo.key, vipText.key],
    };
  }

  function layoutDefaultSubtitle(template, helpers, rules) {
    const { base } = getSubtitleEntries(template);
    if (!base?.layer) return { width: 0, centerX: Number(rules.centerX ?? 290), centerY: 0, isVip: false, beforeKeys: [] };
    resetSubtitleGroup(template);
    const width = measureActualText(base.layer, helpers);
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    setLayerVisible(base.layer, true);
    base.layer.align = 'center';
    base.layer.textAlign = 'center';
    if (Number.isFinite(Number(rules.defaultSubtitleYPx))) {
      setLayerY(base.layer, Number(rules.defaultSubtitleYPx));
    }
    // Keep the Photoshop / edited JSON text box intact; only the capsule uses actual text width.
    return {
      width,
      centerX,
      centerY: Number(base.layer.centerY ?? (Number(base.layer.y || 0) + Number(base.layer.height || 0) / 2)),
      isVip: false,
      beforeKeys: [base.key],
      layer: base.layer,
    };
  }

  function resolveCapsuleWidth({ titleWidth, subtitleWidth, rules }) {
    const title = Number(titleWidth || 0);
    const subtitle = Number(subtitleWidth || 0);
    const diff = Math.abs(title - subtitle);
    const threshold = Number(rules.widthDiffUseSubtitlePaddingPx ?? 50);
    const padding = Number(rules.subtitleNearMatchPaddingPx ?? 25);

    // POPUP 藍色膠囊以「副標題實際文字寬」為主要伸縮基準：
    // 1) 副標題較寬時，一律用副標題寬 + 左右各 25px。
    // 2) 主副標差距 50px 內，也用副標題寬 + 左右各 25px。
    // 3) 只有主標題明顯較寬且差距超過 50px，才用主標題寬。
    if (subtitle >= title || diff <= threshold) return Math.max(1, subtitle + padding * 2);
    return Math.max(1, title);
  }

  function updateSubtitleCapsule({ template, titleMetrics, subtitleMetrics, rules }) {
    if (!subtitleMetrics?.beforeKeys?.length && !subtitleMetrics?.layer) return;
    const capsuleWidth = resolveCapsuleWidth({
      titleWidth: titleMetrics?.width || 0,
      subtitleWidth: subtitleMetrics?.width || 0,
      rules,
    });
    const fixedHeight = Number(rules.capsuleFixedHeightPx || rules.vipSubtitleHeightPx || 75);
    const capsuleHeight = Number.isFinite(fixedHeight) && fixedHeight > 0 ? fixedHeight : 75;
    const centerX = Number(rules.centerX ?? template.canvas?.width / 2 ?? 290);
    const capsuleX = centerX - capsuleWidth / 2;
    const capsuleY = Number.isFinite(Number(rules.capsuleFixedYPx ?? rules.vipSubtitleCapsuleY))
      ? Number(rules.capsuleFixedYPx ?? rules.vipSubtitleCapsuleY)
      : 275;

    template.__popupCapsuleMetrics = {
      templateId: template.templateId || '',
      titleWidth: round(titleMetrics?.width || 0, 2),
      titleIsGroup: !!titleMetrics?.isGroup,
      subtitleWidth: round(subtitleMetrics?.width || 0, 2),
      subtitleIsVip: !!subtitleMetrics?.isVip,
      widthDiff: round(Math.abs(Number(titleMetrics?.width || 0) - Number(subtitleMetrics?.width || 0)), 2),
      finalCapsuleWidth: round(capsuleWidth, 2),
      finalCapsuleHeight: round(capsuleHeight, 2),
      finalCapsuleX: round(capsuleX, 2),
      finalCapsuleY: round(capsuleY, 2),
      widthSource: 'actual rendered text width; VIP group = logo width + gap + actual text width',
    };
    if (rules.debugCapsuleMetrics === true && typeof console !== 'undefined') {
      console.table?.(template.__popupCapsuleMetrics);
    }

    const capsule = ensureCapsuleLayer(template);
    if (!capsule) return;
    Object.assign(capsule, {
      type: 'shape',
      psdName: '副標題_BG',
      source: 'generated_popup_capsule',
      x: round(capsuleX),
      y: round(capsuleY),
      width: round(capsuleWidth),
      height: round(capsuleHeight),
      centerX: round(centerX),
      centerY: round(capsuleY + capsuleHeight / 2),
      fill: rules.fill || '#0053D1',
      radius: round(capsuleHeight / 2),
      hidden: false,
      visible: true,
    });

    insertBefore(template, CAPSULE_LAYER_KEY, subtitleMetrics.beforeKeys);
    const legal = findLayerEntry(template, rules.legalLayers || ['legal', '法務', '法務小字'], { type: 'text' });
    if (legal?.layer && rules.preserveLegalY !== true) {
      setLayerX(legal.layer, centerX - Number(legal.layer.width || 0) / 2);
    }
  }


  function getCurrentPopupTemplateKey(template) {
    return String(
      template?.pricePresetMeta?.templateId ||
      template?.templateId ||
      template?.sheetTemplateRoute?.templateId ||
      template?.sheetTemplateRoute?.sourceTemplateId ||
      template?.batchSourceName ||
      ''
    ).trim();
  }

  function applyEditedStaticLayout(template, rules) {
    const templateKey = getCurrentPopupTemplateKey(template);
    const layouts = rules.editedLayerLayouts || {};
    const current = layouts[templateKey];
    if (!current || !template?.layers) return;

    Object.entries(current).forEach(([key, values]) => {
      const layer = template.layers[key];
      if (!layer || !values) return;
      ['x', 'y', 'width', 'height', 'centerX', 'centerY', 'fontSizePx', 'fontSizePt', 'lineHeight', 'letterSpacing', 'rotation'].forEach((prop) => {
        if (Number.isFinite(Number(values[prop]))) layer[prop] = Number(values[prop]);
      });
      if (values.assetFilename && layer.type === 'image') {
        layer.assetFilename = values.assetFilename;
        layer.assetCandidates = [values.assetFilename];
      }
    });
  }

  const RULES = {
    capsuleRules: {
      horizontalPaddingPx: 25,
      subtitleWiderPaddingPx: 25,
      subtitleWiderPaddingMaxDiffPx: null,
      titleWiderPaddingPx: 25,
      titleWiderPaddingMaxDiffPx: 70,
      widthDiffUseSubtitlePaddingPx: 50,
      subtitleNearMatchPaddingPx: 25,
      debugCapsuleMetrics: false,
      verticalGapPx: 13,
      verticalPaddingPx: 13,
      legalGapPx: 11,
      vipSubtitleHeightPx: 75,
      capsuleFixedHeightPx: 75,
      vipSubtitleCapsuleY: 275,
      capsuleFixedYPx: 275,
      preserveSubtitleBox: true,
      preserveLegalY: true,
      fill: '#0053D1',
      minWidthPx: 1,
    },

    priceRules: {
          "enabled": true,
          "useDDCardProductImageSizing": true,
          "enforceProductPriceCount": true,
          "colorRules": [
                {
                      "keyword": "VIP",
                      "color": "#FF770F"
                },
                {
                      "keyword": "商城券",
                      "color": "#D0011B"
                },
                {
                      "keyword": "商城",
                      "color": "#D0011B"
                },
                {
                      "keyword": "全站券",
                      "color": "#EE4D2D"
                },
                {
                      "keyword": "全站",
                      "color": "#EE4D2D"
                }
          ],
          "coordinateMode": "absolute",
          "positioningMode": "absolute",
          "lockToEditedJson": true,
          "productFirst": false,
          "resolvePriority": "templateFirst",
          "templateLayouts": {
                "POPUP_01": {
                      "productImageBox": {
                            "x": 97.8,
                            "y": 396.9,
                            "width": 355.6,
                            "height": 226.1,
                            "centerX": 275.6,
                            "centerY": 509.9,
                            "targetWidth": 355.6,
                            "targetHeight": 226.1,
                            "maxTargetHeight": 226.1,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格",
                                  "x": 182.0,
                                  "y": 490.2,
                                  "width": 267.0,
                                  "height": 98.3,
                                  "centerX": 313.5,
                                  "centerY": 535.35,
                                  "rotation": 12.0,
                                  "fontSizePx": 58.77,
                                  "fontSizePt": 58.77,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 63.47,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#FF770F",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "single"
                            }
                      ]
                },
                "POPUP_02": {
                      "productImageBox": {
                            "x": 135.0,
                            "y": 400.0,
                            "width": 295.0,
                            "height": 230.0,
                            "centerX": 282.5,
                            "centerY": 515.0,
                            "targetWidth": 295.0,
                            "targetHeight": 230.0,
                            "maxTargetHeight": 230.0,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格1（下券）",
                                  "x": 208.0,
                                  "y": 518.0,
                                  "width": 218.3,
                                  "height": 96.9,
                                  "centerX": 317.15,
                                  "centerY": 566.45,
                                  "rotation": 2.0,
                                  "fontSizePx": 85.0,
                                  "fontSizePt": 85.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 91.8,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "bottom"
                            },
                            {
                                  "psdName": "價格2（上券）",
                                  "x": 195.0,
                                  "y": 415.0,
                                  "width": 231.4,
                                  "height": 102.7,
                                  "centerX": 310.7,
                                  "centerY": 466.35,
                                  "rotation": -6.0,
                                  "fontSizePx": 85.0,
                                  "fontSizePt": 85.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 91.8,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "top"
                            }
                      ]
                },
                "POPUP_03": {
                      "productImageBox": {
                            "x": 135.0,
                            "y": 400.0,
                            "width": 295.0,
                            "height": 230.0,
                            "centerX": 282.5,
                            "centerY": 515.0,
                            "targetWidth": 295.0,
                            "targetHeight": 230.0,
                            "maxTargetHeight": 230.0,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格1（下券）",
                                  "x": 203.0,
                                  "y": 512.0,
                                  "width": 231.4,
                                  "height": 102.7,
                                  "centerX": 318.7,
                                  "centerY": 563.35,
                                  "rotation": 2.0,
                                  "fontSizePx": 80.0,
                                  "fontSizePt": 80.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 86.4,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "bottom"
                            },
                            {
                                  "psdName": "價格2（上券）",
                                  "x": 199.4,
                                  "y": 413.1,
                                  "width": 231.4,
                                  "height": 102.7,
                                  "centerX": 315.1,
                                  "centerY": 464.45,
                                  "rotation": -6.0,
                                  "fontSizePx": 80.0,
                                  "fontSizePt": 80.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 86.4,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "top"
                            }
                      ]
                },
                "POPUP_04": {
                      "productImageBox": {
                            "x": 136.2,
                            "y": 407.9,
                            "width": 308.8,
                            "height": 213.1,
                            "centerX": 290.6,
                            "centerY": 514.4,
                            "targetWidth": 308.8,
                            "targetHeight": 213.1,
                            "maxTargetHeight": 213.1,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格",
                                  "x": 260.8,
                                  "y": 524.3,
                                  "width": 183.2,
                                  "height": 67.9,
                                  "centerX": 352.4,
                                  "centerY": 558.25,
                                  "rotation": -10.0,
                                  "fontSizePx": 65.0,
                                  "fontSizePt": 65.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 70.2,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "single"
                            }
                      ]
                },
                "POPUP_05": {
                      "productImageBox": {
                            "x": 135.0,
                            "y": 400.0,
                            "width": 295.0,
                            "height": 230.0,
                            "centerX": 282.5,
                            "centerY": 515.0,
                            "targetWidth": 295.0,
                            "targetHeight": 230.0,
                            "maxTargetHeight": 230.0,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格1（下券）",
                                  "x": 204.8,
                                  "y": 512.2,
                                  "width": 231.4,
                                  "height": 102.7,
                                  "centerX": 320.5,
                                  "centerY": 563.55,
                                  "rotation": 2.0,
                                  "fontSizePx": 80.0,
                                  "fontSizePt": 80.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 86.4,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "bottom"
                            },
                            {
                                  "psdName": "價格2（上券）",
                                  "x": 198.8,
                                  "y": 416.1,
                                  "width": 231.4,
                                  "height": 102.7,
                                  "centerX": 314.5,
                                  "centerY": 467.45,
                                  "rotation": -6.0,
                                  "fontSizePx": 80.0,
                                  "fontSizePt": 80.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 86.4,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "top"
                            }
                      ]
                },
                "POPUP_06": {
                      "productImageBox": {
                            "x": 130.4,
                            "y": 400.6,
                            "width": 355.0,
                            "height": 230.0,
                            "centerX": 307.9,
                            "centerY": 515.6,
                            "targetWidth": 355.0,
                            "targetHeight": 230.0,
                            "maxTargetHeight": 230.0,
                            "sizingMode": "heightBased",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格",
                                  "x": 122.9,
                                  "y": 523.3,
                                  "width": 283.0,
                                  "height": 104.2,
                                  "centerX": 264.4,
                                  "centerY": 575.4,
                                  "rotation": 12.0,
                                  "fontSizePx": 60.0,
                                  "fontSizePt": 60.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 64.8,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#ee4d2d",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "single"
                            }
                      ]
                },
                "POPUP_07": {
                      "productImageBox": {
                            "x": 139.0,
                            "y": 406.0,
                            "width": 305.0,
                            "height": 218.0,
                            "centerX": 291.5,
                            "centerY": 515.0,
                            "targetWidth": 305.0,
                            "targetHeight": 218.0,
                            "maxTargetHeight": 218.0,
                            "sizingMode": "heightBased",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格",
                                  "x": 261.7,
                                  "y": 533.0,
                                  "width": 172.6,
                                  "height": 67.5,
                                  "centerX": 348.0,
                                  "centerY": 566.75,
                                  "rotation": -6.0,
                                  "fontSizePx": 55.0,
                                  "fontSizePt": 55.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 59.4,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#d0011b",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "single"
                            }
                      ]
                },
                "POPUP_08": {
                      "productImageBox": {
                            "x": 135.0,
                            "y": 400.0,
                            "width": 295.0,
                            "height": 230.0,
                            "centerX": 282.5,
                            "centerY": 515.0,
                            "targetWidth": 295.0,
                            "targetHeight": 230.0,
                            "maxTargetHeight": 230.0,
                            "sizingMode": "containByPBox",
                            "keepAspectRatio": 1.0
                      },
                      "layouts": [
                            {
                                  "psdName": "價格1（下券）",
                                  "x": 197.0,
                                  "y": 506.0,
                                  "width": 231.4,
                                  "height": 113.7,
                                  "centerX": 312.7,
                                  "centerY": 562.85,
                                  "rotation": 2.0,
                                  "fontSizePx": 85.0,
                                  "fontSizePt": 85.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 91.8,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#d0011b",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "bottom"
                            },
                            {
                                  "psdName": "價格2（上券）",
                                  "x": 191.3,
                                  "y": 409.6,
                                  "width": 231.4,
                                  "height": 113.7,
                                  "centerX": 307.0,
                                  "centerY": 466.45,
                                  "rotation": -6.0,
                                  "fontSizePx": 85.0,
                                  "fontSizePt": 85.0,
                                  "letterSpacing": 0.0,
                                  "lineHeight": 91.8,
                                  "lineHeightMultiplier": 1.08,
                                  "color": "#d0011b",
                                  "positioningMode": "absolute",
                                  "lockToEditedJson": true,
                                  "disableAnchorSync": true,
                                  "followProduct": 1.0,
                                  "preserveExactSize": 1.0,
                                  "skipAutoScale": 1.0,
                                  "disableContentScale": 0.0,
                                  "slot": "top"
                            }
                      ]
                }
          },
          "productLayouts": {
                "VIP_單券_蝦幣": {
                      "useTemplate": "POPUP_01"
                },
                "全站券_雙券": {
                      "useTemplate": "POPUP_02"
                },
                "信用卡加全站券": {
                      "useTemplate": "POPUP_04"
                },
                "免運車加全站券": {
                      "useTemplate": "POPUP_06"
                },
                "商城券加蝦幣": {
                      "useTemplate": "POPUP_07"
                },
                "商城券_雙券": {
                      "useTemplate": "POPUP_08"
                }
          },
          "classifiers": []
    },

    layoutRules: {
      centerX: 290,
      editedLayerLayouts: {
              "POPUP_01": {
                      "title": {
                              "x": 98.0,
                              "y": 202.0,
                              "width": 384.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 124.0,
                              "y": 279.0,
                              "width": 332.0,
                              "height": 57.0,
                              "centerX": 290.0,
                              "centerY": 307.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 98.0,
                              "y": 275.0,
                              "width": 384.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 124.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 206.0,
                              "centerY": 307.5,
                              "hidden": 0.0,
                              "visible": 1.0,
                              "assetFilename": "蝦皮VIP_LOGO.svg"
                      },
                      "副標題_文字": {
                              "x": 296.0,
                              "y": 298.0,
                              "width": 160.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      }
              },
              "POPUP_02": {
                      "title": {
                              "x": 133.0,
                              "y": 202.0,
                              "width": 314.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 104.0,
                              "y": 275.0,
                              "width": 372.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_03": {
                      "title": {
                              "x": 122.5,
                              "y": 202.0,
                              "width": 335.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 55.5,
                              "y": 275.0,
                              "width": 469.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_04": {
                      "title": {
                              "x": 164.0,
                              "y": 202.0,
                              "width": 252.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 135.0,
                              "y": 275.0,
                              "width": 310.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_05": {
                      "title": {
                              "x": 132.5,
                              "y": 202.0,
                              "width": 315.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 132.5,
                              "y": 275.0,
                              "width": 315.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_06": {
                      "title": {
                              "x": 41.5,
                              "y": 202.0,
                              "width": 497.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 41.5,
                              "y": 275.0,
                              "width": 497.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_07": {
                      "title": {
                              "x": 59.0,
                              "y": 202.0,
                              "width": 462.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 59.0,
                              "y": 275.0,
                              "width": 462.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              },
              "POPUP_08": {
                      "title": {
                              "x": 80.5,
                              "y": 202.0,
                              "width": 419.0,
                              "height": 61.0,
                              "centerX": 290.0,
                              "centerY": 232.5,
                              "fontSizePx": 63.0,
                              "fontSizePt": 63.0,
                              "lineHeight": 75.6,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "subtitle": {
                              "x": 108.0,
                              "y": 286.5,
                              "width": 369.0,
                              "height": 48.0,
                              "centerX": 292.5,
                              "centerY": 310.5,
                              "fontSizePx": 50.0,
                              "fontSizePt": 50.0,
                              "lineHeight": 60.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "legal": {
                              "x": 122.0,
                              "y": 363.0,
                              "width": 336.0,
                              "height": 29.0,
                              "centerX": 290.0,
                              "centerY": 377.5,
                              "fontSizePx": 30.0,
                              "fontSizePt": 30.0,
                              "lineHeight": 36.0,
                              "letterSpacing": 0.0,
                              "hidden": 0.0
                      },
                      "__popup_subtitle_capsule": {
                              "x": 80.5,
                              "y": 275.0,
                              "width": 419.0,
                              "height": 75.0,
                              "centerX": 290.0,
                              "centerY": 312.5,
                              "hidden": 0.0,
                              "visible": 1.0
                      },
                      "副標題蝦皮VIP_LOGO": {
                              "x": 127.0,
                              "y": 279.0,
                              "width": 164.0,
                              "height": 57.0,
                              "centerX": 209.0,
                              "centerY": 307.5,
                              "hidden": 1.0,
                              "visible": 0.0,
                              "assetFilename": "POPUP_副標題蝦皮VIP_LOGO.png"
                      },
                      "副標題_文字": {
                              "x": 297.0,
                              "y": 298.0,
                              "width": 158.0,
                              "height": 38.0,
                              "centerX": 376.0,
                              "centerY": 317.0,
                              "fontSizePx": 40.0,
                              "fontSizePt": 40.0,
                              "lineHeight": 48.0,
                              "letterSpacing": 0.0,
                              "hidden": 1.0,
                              "visible": 0.0
                      }
              }
      },
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
      legalLayers: ['legal', '法務', '法務小字'],
      widthDiffUseSubtitlePaddingPx: 50,
      subtitleNearMatchPaddingPx: 25,
      debugCapsuleMetrics: false,
      verticalPaddingPx: 13,
      defaultSubtitleYPx: 286.5,
      vipSubtitleHeightPx: 75,
      capsuleFixedHeightPx: 75,
      vipSubtitleCapsuleY: 275,
      capsuleFixedYPx: 275,
      preserveSubtitleBox: true,
      preserveLegalY: true,
      fill: '#0053D1',
      minWidthPx: 1,

      applyProgrammaticLayout({ template, helpers }) {
        if (!template?.layers) return;
        const rules = RULES.layoutRules;
        const label = norm(`${template.sheetTemplateRoute?.templateId || ''} ${template.templateId || ''} ${template.source?.psdName || ''}`);
        const routeKey = String(template.sheetTemplateRoute?.key || '').toLowerCase();
        const { vipText: titleVipText } = getTitleEntries(template);
        const { vipText: subtitleVipText } = getSubtitleEntries(template);
        const isVipTitle = routeKey === 'popup_vip' || label.includes('vip') || isVisible(titleVipText?.layer);
        const isScsTitle = routeKey === 'popup_scs' || label.includes('scs');
        const isVipSubtitle = isVisible(subtitleVipText?.layer);

        applyEditedStaticLayout(template, rules);

        const titleMetrics = isVipTitle
          ? layoutVipTitle(template, helpers, rules)
          : isScsTitle
            ? layoutScsTitle(template, helpers, rules)
            : layoutDefaultTitle(template, helpers, rules);

        const subtitleMetrics = isVipSubtitle
          ? layoutVipSubtitle(template, helpers, rules)
          : layoutDefaultSubtitle(template, helpers, rules);

        updateSubtitleCapsule({ template, titleMetrics, subtitleMetrics, rules });
      },
    },

    resolveRecordTemplateRoute({ block, record }) {
      const blockName = toText(block?.name);
      if (!/popup/i.test(blockName)) return null;
      return resolvePopupVariant(record?.['主標']);
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      if (!template?.layers) return;
      const rawTitle = toText(record?.['主標']);
      const rawSubtitle = toText(record?.['副標']);

      if (rawSubtitle.includes(KEYWORD_VIP)) {
        const { base, vipLogo, vipText } = getSubtitleEntries(template);
        if (base?.layer && vipLogo?.layer && vipText?.layer) {
          setImage(vipLogo.layer, RULES.layoutRules.vipLogoAsset);
          setText(vipText.layer, stripKeyword(rawSubtitle, KEYWORD_VIP));
          vipLogo.layer.psdName = '副標題蝦皮VIP_LOGO';
          vipText.layer.psdName = '副標題_文字';
          record['副標'] = '';
          diagnostics?.push?.({ field: '副標', status: 'ok', value: rawSubtitle, target: 'POPUP 副標題 VIP 群組' });
        }
      } else {
        resetSubtitleGroup(template);
      }

      if (!rawTitle) return;
      resetTitleLayers(template);

      if (rawTitle.includes(KEYWORD_SCS)) {
        record['主標'] = rawTitle.replace(KEYWORD_SCS, '').trim();
        const { scsLogo } = getTitleEntries(template);
        setImage(scsLogo?.layer, RULES.layoutRules.scsLogoAsset);
        diagnostics?.push?.({ field: '主標', status: 'ok', value: rawTitle, target: 'POPUP 蝦皮直營主標題群組' });
        return;
      }

      if (rawTitle.includes(KEYWORD_VIP)) {
        const { base, vipLogo } = getTitleEntries(template);
        const logoLayer = ensureLayer(template, '主標題蝦皮VIP_LOGO', vipLogo?.layer || {
          type: 'image',
          psdName: '主標題蝦皮VIP_LOGO',
          assetFilename: RULES.layoutRules.vipLogoAsset,
          x: Number(base?.layer?.x || 0),
          y: Number(base?.layer?.y || 0),
          width: 180,
          height: 63,
          keepAspectRatio: true,
        });
        const textLayer = ensureLayer(template, '主標題_文字', {
          ...(base?.layer || {}),
          type: 'text',
          psdName: '主標題_文字',
          align: 'left',
          textAlign: 'left',
        });
        setImage(logoLayer, RULES.layoutRules.vipLogoAsset);
        setText(textLayer, stripKeyword(rawTitle, KEYWORD_VIP));
        record['主標'] = '';
        diagnostics?.push?.({ field: '主標', status: 'ok', value: rawTitle, target: 'POPUP 主標題 VIP 群組' });
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
