/* Game BN template rules – independent banner layout with edited JSON layout presets. */
(function () {
  'use strict';

  const FAMILY = 'game_bn';
  const TEMPLATE_ID = '10_Game BN';

  const TITLE_LOGO_GAP_PX = 5;
  const VIP_LOGO_ASSET = '蝦皮VIP_LOGO.svg';

  const EDITED_LAYOUT = Object.freeze({
    titleVipLogo: { x: 206, y: 142, width: 142, height: 50.2, centerX: 277, centerY: 167.1, assetFilename: '蝦皮VIP_LOGO.svg', targetWidth: 142, keepAspectRatio: true },
    titleLeft: { x: 135, y: 159, width: 66, height: 31, centerX: 168, centerY: 174.5 },
    titleRight: { x: 353, y: 159, width: 66, height: 31, centerX: 386, centerY: 174.5 },
    subtitle: { x: 135, y: 199, width: 358, height: 58, centerX: 314, centerY: 228 },
    legal: { x: 135, y: 270, width: 310, height: 23, centerX: 290, centerY: 281.5 },
    product: { x: 561.8, y: 50, width: 429.4, height: 273, centerX: 776.5, centerY: 186.5, targetWidth: 429.4, targetHeight: 273, maxTargetHeight: 273, sizingMode: 'containByPBox', alignX: 'custom', keepAspectRatio: true },
    price: { x: 711.3, y: 181.07, width: 231.4, height: 77.76, centerX: 827, centerY: 219.95, rotation: 12, fontSizePx: 72, fontSizePt: 72, lineHeight: 77.76 },
  });

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000_\-+()（）\[\]【】.]+/g, ''));
  const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

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

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureTextLayer(template, key, sourceLayer, psdName) {
    if (!template?.layers || !sourceLayer) return null;
    if (!template.layers[key]) {
      const cloned = clonePlain(sourceLayer);
      cloned.psdName = psdName;
      cloned.hidden = true;
      cloned.text = '';
      template.layers[key] = cloned;
    }
    return template.layers[key];
  }

  function setHidden(layer, hidden) {
    if (layer) layer.hidden = Boolean(hidden);
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

  function getLogoAnchorX(template) {
    const campaignLogo = findLayer(template, ['18號會員日_LOGO', '18號_LOGO', '18號會員日 LOGO']);
    const title = findLayer(template, ['title', '主標題']);
    return Number(campaignLogo?.x ?? title?.x ?? 0);
  }

  function splitVipTitle(title) {
    const raw = toText(title);
    const match = raw.match(/^(.*?)(VIP)(.*)$/i);
    if (!match) return null;
    return {
      left: match[1].trim(),
      right: match[3].trim(),
    };
  }

  function syncTextRange(layer, text) {
    if (!layer || !Array.isArray(layer.textStyleRanges)) return;
    layer.textStyleRanges.forEach((range) => {
      range.from = 0;
      range.to = String(text || '').length;
    });
  }

  function applyGeometry(layer, geometry = {}, options = {}) {
    if (!layer || !geometry) return;
    ['x', 'y', 'width', 'height', 'centerX', 'centerY', 'fontSizePx', 'fontSizePt', 'lineHeight', 'rotation'].forEach((key) => {
      if (Number.isFinite(Number(geometry[key]))) layer[key] = round(Number(geometry[key]));
    });
    if (geometry.assetFilename) layer.assetFilename = geometry.assetFilename;
    if (Number.isFinite(Number(geometry.targetWidth))) layer.targetWidth = round(Number(geometry.targetWidth));
    if (Number.isFinite(Number(geometry.targetHeight))) layer.targetHeight = round(Number(geometry.targetHeight));
    if (Number.isFinite(Number(geometry.maxTargetHeight))) layer.maxTargetHeight = round(Number(geometry.maxTargetHeight));
    if (geometry.sizingMode) layer.sizingMode = geometry.sizingMode;
    if (geometry.alignX) layer.alignX = geometry.alignX;
    if (geometry.keepAspectRatio !== undefined) layer.keepAspectRatio = Boolean(geometry.keepAspectRatio);
    if (options.syncCenter !== false) {
      if (Number.isFinite(Number(layer.x)) && Number.isFinite(Number(layer.width))) layer.centerX = round(Number(layer.x) + Number(layer.width) / 2);
      if (Number.isFinite(Number(layer.y)) && Number.isFinite(Number(layer.height))) layer.centerY = round(Number(layer.y) + Number(layer.height) / 2);
    }
  }

  function prepareTextLayer(layer, text, align) {
    if (!layer) return;
    layer.text = text;
    layer.hidden = !text;
    layer.align = align;
    layer.textAlign = align;
    syncTextRange(layer, text);
  }

  function placeLayerLeft(layer, x, width = null) {
    if (!layer) return x;
    const nextWidth = Math.max(1, Number(width ?? layer.width ?? 1));
    if (width !== null) layer.width = round(nextWidth);
    layer.x = round(x);
    layer.centerX = round(x + nextWidth / 2);
    return x + nextWidth;
  }

  function fitTextLayerToContent(layer, helpers) {
    if (!layer || layer.hidden) return 0;
    const measuredWidth = Math.max(1, measureTextWidth(layer, helpers));
    layer.width = round(measuredWidth);
    layer.centerX = round(Number(layer.x || 0) + measuredWidth / 2);
    return measuredWidth;
  }

  function layoutVipTitleGroup({ template, record, helpers, diagnostics }) {
    const rawTitle = getTitleText(record, template);
    const vipParts = splitVipTitle(rawTitle);
    const titleLayer = findLayer(template, ['title', '主標題']);
    const vipLogoLayer = findLayer(template, ['蝦皮VIP_LOGO', 'VIP_LOGO']);
    const leftLayer = ensureTextLayer(template, '主標題_左', titleLayer, '主標題_左');
    const rightLayer = ensureTextLayer(template, '主標題_右', titleLayer, '主標題_右');
    const anchorX = getLogoAnchorX(template);

    if (!titleLayer) return;

    applyGeometry(vipLogoLayer, EDITED_LAYOUT.titleVipLogo);
    applyGeometry(leftLayer, EDITED_LAYOUT.titleLeft);
    applyGeometry(rightLayer, EDITED_LAYOUT.titleRight);

    if (!vipParts) {
      titleLayer.hidden = false;
      titleLayer.text = rawTitle || titleLayer.text;
      titleLayer.align = 'left';
      titleLayer.textAlign = 'left';
      syncTextRange(titleLayer, titleLayer.text);
      const titleWidth = fitTextLayerToContent(titleLayer, helpers);
      placeLayerLeft(titleLayer, anchorX, titleWidth);
      setHidden(vipLogoLayer, true);
      setHidden(leftLayer, true);
      setHidden(rightLayer, true);
      diagnostics?.push?.({ field: '主標題', status: 'ok', value: rawTitle, target: '主標題靠左對齊18號會員日_LOGO，文字框依實際寬度縮放' });
      return;
    }

    titleLayer.hidden = true;
    if (vipLogoLayer) {
      vipLogoLayer.hidden = false;
      vipLogoLayer.assetFilename = VIP_LOGO_ASSET;
      vipLogoLayer.keepAspectRatio = true;
    }

    prepareTextLayer(leftLayer, vipParts.left, 'left');
    prepareTextLayer(rightLayer, vipParts.right, 'left');

    let cursorX = anchorX;
    if (leftLayer && !leftLayer.hidden) {
      const leftWidth = Math.max(Number(EDITED_LAYOUT.titleLeft?.width || 0), fitTextLayerToContent(leftLayer, helpers));
      cursorX = placeLayerLeft(leftLayer, cursorX, leftWidth) + TITLE_LOGO_GAP_PX;
    }

    if (vipLogoLayer && !vipLogoLayer.hidden) {
      cursorX = placeLayerLeft(vipLogoLayer, cursorX) + TITLE_LOGO_GAP_PX;
    }

    if (rightLayer && !rightLayer.hidden) {
      const rightWidth = Math.max(Number(EDITED_LAYOUT.titleRight?.width || 0), fitTextLayerToContent(rightLayer, helpers));
      placeLayerLeft(rightLayer, cursorX, rightWidth);
    }

    diagnostics?.push?.({
      field: '主標題',
      status: 'ok',
      value: rawTitle,
      target: '主標題_左 + 蝦皮VIP_LOGO.svg + 主標題_右 靠左對齊18號會員日_LOGO，文字框依實際寬度縮放',
    });
  }

  function hideSubtitleFrame(template) {
    if (template?.generatedLayers?.subtitle_frame) {
      template.generatedLayers.subtitle_frame.hidden = true;
      template.generatedLayers.subtitle_frame.ruleHidden = true;
    }
    const subtitleFrame = findLayer(template, ['subtitle_frame', '副標題_BG', '副標題_膠囊']);
    if (subtitleFrame) subtitleFrame.hidden = true;
  }

  function alignTextLayerToLayout(template, layerNames, geometry) {
    const layer = findLayer(template, layerNames);
    if (!layer) return;
    applyGeometry(layer, geometry);
    layer.align = 'left';
    layer.textAlign = 'left';
  }

  function applyEditedLayoutValues(template) {
    alignTextLayerToLayout(template, ['subtitle', '副標題'], EDITED_LAYOUT.subtitle);
    alignTextLayerToLayout(template, ['legal', '法務小字'], EDITED_LAYOUT.legal);
    applyGeometry(findLayer(template, ['product', 'P', '商品圖1']), EDITED_LAYOUT.product);

    const priceLayer = findLayer(template, ['__auto_price_v2_single', '價格']);
    if (priceLayer) {
      applyGeometry(priceLayer, EDITED_LAYOUT.price);
      priceLayer.lockToEditedJson = true;
      priceLayer.preserveExactSize = true;
      priceLayer.skipAutoScale = true;
      // 修正：canFollowProduct() 只看 followProduct 是否為 false，不會看 disableAnchorSync。
      // 這裡的價格位置是已經確認的固定值（EDITED_LAYOUT.price），不應該讓
      // PriceTransformEngine 在畫面重繪時，用「建立當下算出的舊偏移量」把座標蓋掉
      // ——之前 followProduct:true 會讓每次重繪都用錯誤的舊偏移量，
      // 把價格拉回商品圖的預設(DDCard硬編碼)相對位置，而不是這裡設定的座標。
      priceLayer.followProduct = false;
      priceLayer.disableAnchorSync = true;
      priceLayer.priceLayoutKey = priceLayer.priceLayoutKey || 'vip';
    }
  }

  function ensureRenderOrder(template) {
    if (!template?.layers || !Array.isArray(template.renderOrder)) return;
    ['__auto_price_v2_single', '主標題_左', '主標題_右'].forEach((key) => {
      if (!template.layers[key] || template.renderOrder.includes(key)) return;
      const titleIndex = template.renderOrder.indexOf('title');
      const productIndex = template.renderOrder.indexOf('product');
      const insertIndex = key === '__auto_price_v2_single' && productIndex >= 0 ? productIndex + 1 : (titleIndex >= 0 ? titleIndex + 1 : template.renderOrder.length);
      template.renderOrder.splice(insertIndex, 0, key);
    });
  }

  function applyProgrammaticLayout(template, record, diagnostics, helpers) {
    hideSubtitleFrame(template);
    layoutVipTitleGroup({ template, record: record || {}, helpers, diagnostics });
    applyEditedLayoutValues(template);
    ensureRenderOrder(template);
  }

  const TemplateRules = {
    resolveRecordTemplateRoute({ block }) {
      const blockName = toText(block?.name);
      if (!/Game\s*BN|遊戲\s*BN/i.test(blockName)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'Game BN',
        templateId: TEMPLATE_ID,
        templateFile: '10_Game BN.json',
        outputPrefix: 'Game BN',
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
    label: 'Game BN',
    priority: 80,
    tokens: ['game bn', 'game_bn', '10_game bn', '遊戲bn'],
    targets: ['10_game bn', 'game bn', 'game_bn', '遊戲bn'],
    rules: TemplateRules,
  });
})();
