/* MS輪播 BN template rules – independent banner layout. */
(function () {
  'use strict';

  const FAMILY = 'ms_carousel_bn';
  const TEMPLATE_ID = '10_MS輪播BN';

  const TITLE_LOGO_GAP_PX = 5;
  const VIP_LOGO_ASSET = '蝦皮VIP_LOGO.svg';

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));
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
      const leftWidth = fitTextLayerToContent(leftLayer, helpers);
      cursorX = placeLayerLeft(leftLayer, cursorX, leftWidth) + TITLE_LOGO_GAP_PX;
    }

    if (vipLogoLayer && !vipLogoLayer.hidden) {
      cursorX = placeLayerLeft(vipLogoLayer, cursorX) + TITLE_LOGO_GAP_PX;
    }

    if (rightLayer && !rightLayer.hidden) {
      const rightWidth = fitTextLayerToContent(rightLayer, helpers);
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

  function alignSubtitleToLogoLeft(template) {
    const subtitle = findLayer(template, ['subtitle', '副標題']);
    if (!subtitle) return;
    const anchorX = getLogoAnchorX(template);
    subtitle.x = round(anchorX);
    subtitle.centerX = round(anchorX + Number(subtitle.width || 0) / 2);
    subtitle.align = 'left';
    subtitle.textAlign = 'left';
  }

  function ensureRenderOrder(template) {
    if (!template?.layers || !Array.isArray(template.renderOrder)) return;
    ['主標題_左', '主標題_右'].forEach((key) => {
      if (template.layers[key] && !template.renderOrder.includes(key)) {
        const titleIndex = template.renderOrder.indexOf('title');
        const insertIndex = titleIndex >= 0 ? titleIndex + 1 : template.renderOrder.length;
        template.renderOrder.splice(insertIndex, 0, key);
      }
    });
  }

  function applyProgrammaticLayout(template, record, diagnostics, helpers) {
    hideSubtitleFrame(template);
    alignSubtitleToLogoLeft(template);
    layoutVipTitleGroup({ template, record: record || {}, helpers, diagnostics });
    ensureRenderOrder(template);
  }

  const TemplateRules = {
    resolveRecordTemplateRoute({ block }) {
      const blockName = toText(block?.name);
      if (!/MS\s*輪播\s*BN|MS\s*Carousel\s*BN/i.test(blockName)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'MS輪播 BN',
        templateId: TEMPLATE_ID,
        templateFile: '10_MS輪播BN.json',
        outputPrefix: 'MS輪播 BN',
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
    label: 'MS輪播 BN',
    priority: 80,
    tokens: ['ms輪播bn', 'ms輪播 bn', 'ms carousel bn', 'ms_carousel_bn', '10_ms輪播bn'],
    targets: ['10_ms輪播bn', 'ms輪播bn', 'ms輪播 bn', 'ms carousel bn', 'ms_carousel_bn'],
    rules: TemplateRules,
  });
})();
