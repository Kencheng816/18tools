/* Shared Title Logo Parser – V5.02
 * 文字混合 Logo 的共用排版工具。
 * - 蝦皮直營 → 蝦皮直營_LOGO.svg
 * - VIP → 蝦皮VIP_LOGO.svg
 * - segments 以固定 gap 並依需求整組置中/置左
 */
(function initTitleLogoParser() {
  'use strict';

  const LOGO_RULES = [
    { keyword: '蝦皮直營', key: 'shopee_direct', psdName: '蝦皮直營_LOGO', assetFilename: '蝦皮直營_LOGO.svg', ratio: 2.7 },
    { keyword: 'VIP', key: 'shopee_vip', psdName: '蝦皮VIP_LOGO', assetFilename: '蝦皮VIP_LOGO.svg', ratio: 2.84 },
  ];

  function round(value, digits = 2) {
    const n = Number(value || 0);
    const base = 10 ** digits;
    return Math.round(n * base) / base;
  }

  function toText(value) {
    return String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  }

  function font(layer = {}) {
    const style = layer.fontStyle === 'italic' ? 'italic ' : '';
    const weight = layer.fontWeight || 400;
    const size = layer.fontSizePx || 24;
    const family = layer.fontFamily
      ? `"${layer.fontFamily}","ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif`
      : '"ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif';
    return `${style}${weight} ${size}px ${family}`;
  }

  const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const measureContext = measureCanvas ? measureCanvas.getContext('2d') : null;

  function measureTextWidth(text, baseLayer = {}) {
    if (!measureContext) return Math.max(1, [...String(text || '')].length * Number(baseLayer.fontSizePx || 24));
    measureContext.save();
    measureContext.font = font(baseLayer);
    const letterSpacing = Number(baseLayer.letterSpacing || 0);
    const width = [...String(text || '')].reduce((sum, ch) => sum + measureContext.measureText(ch).width, 0)
      + letterSpacing * Math.max(0, [...String(text || '')].length - 1);
    measureContext.restore();
    return Math.ceil(width);
  }

  function findLayerEntry(template, candidates = [], type = '') {
    const normalized = (value) => String(value || '').toLowerCase().replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');
    const wanted = candidates.map(normalized).filter(Boolean);
    return Object.entries(template?.layers || {}).find(([key, layer]) => {
      if (type && layer?.type !== type) return false;
      const label = normalized(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
      return wanted.some((word) => label.includes(word));
    }) || null;
  }

  function splitTitle(value) {
    const raw = toText(value);
    const segments = [];
    let cursor = 0;

    while (cursor < raw.length) {
      const remaining = raw.slice(cursor);
      let match = null;
      LOGO_RULES.forEach((rule) => {
        const index = remaining.toLowerCase().indexOf(rule.keyword.toLowerCase());
        if (index < 0) return;
        if (!match || index < match.index || (index === match.index && rule.keyword.length > match.rule.keyword.length)) {
          match = { index, rule };
        }
      });

      if (!match) {
        const text = raw.slice(cursor);
        if (text) segments.push({ type: 'text', text });
        break;
      }

      if (match.index > 0) segments.push({ type: 'text', text: remaining.slice(0, match.index) });
      segments.push({ type: 'logo', ...match.rule });
      cursor += match.index + match.rule.keyword.length;
    }

    return segments.filter((segment) => segment.type === 'logo' || String(segment.text || '').trim());
  }

  function removeGeneratedTitleLayers(template) {
    Object.keys(template?.layers || {}).forEach((key) => {
      if (key.startsWith('__title_logo_segment_')) delete template.layers[key];
    });
    if (Array.isArray(template?.renderOrder)) {
      template.renderOrder = template.renderOrder.filter((key) => !key.startsWith('__title_logo_segment_'));
    }
  }

  function buildLogoLayer(segment, baseLayer, dimensions = {}) {
    const height = round(Number(dimensions.height || baseLayer.height || baseLayer.fontSizePx || 24));
    const width = round(Number(dimensions.width || height * Number(segment.ratio || 2.6)));
    return {
      type: 'image',
      psdName: segment.psdName,
      assetFilename: segment.assetFilename,
      x: 0,
      y: round(Number(baseLayer.y || 0) + (Number(baseLayer.height || height) - height) / 2),
      width,
      height,
      centerX: width / 2,
      centerY: round(Number(baseLayer.y || 0) + Number(baseLayer.height || height) / 2),
      keepAspectRatio: true,
      sizingMode: 'containByPBox',
      targetWidth: width,
      targetHeight: height,
      maxTargetHeight: height,
    };
  }

  function buildTextLayer(segment, baseLayer, width) {
    return {
      ...baseLayer,
      type: 'text',
      psdName: `${baseLayer.psdName || '主標題'}_${segment.text}`,
      text: segment.text,
      x: 0,
      width: round(width),
      align: 'left',
      hidden: false,
      locked: false,
    };
  }

  function getExistingLogoDimensions(template, segment, fallbackLayer) {
    const entry = findLayerEntry(template, [segment.psdName, segment.keyword], 'image');
    const layer = entry?.[1];
    if (layer && Number(layer.width) > 0 && Number(layer.height) > 0) {
      return { width: Number(layer.width), height: Number(layer.height) };
    }
    const height = Number(fallbackLayer.fontSizePx || fallbackLayer.height || 24) * 1.08;
    return { width: height * Number(segment.ratio || 2.6), height };
  }

  function apply(template, options = {}) {
    if (!template?.layers) return null;
    const titleEntry = findLayerEntry(template, ['主標題', 'title'], 'text');
    if (!titleEntry) return null;

    const [titleKey, titleLayer] = titleEntry;
    const rawTitle = toText(options.title ?? titleLayer.text);
    if (!rawTitle) return null;

    removeGeneratedTitleLayers(template);

    const segments = splitTitle(rawTitle);
    const hasLogo = segments.some((segment) => segment.type === 'logo');
    const canvasWidth = Number(template.canvas?.width || 0);
    const align = options.align === 'left' ? 'left' : 'center';
    const gap = Number(options.gapPx ?? 10);

    Object.entries(template.layers).forEach(([key, layer]) => {
      if (layer?.type !== 'image') return;
      const label = `${key} ${layer.psdName || ''}`;
      if (/蝦皮VIP_LOGO|蝦皮直營_LOGO/i.test(label)) layer.hidden = true;
    });

    if (!hasLogo) {
      titleLayer.hidden = false;
      titleLayer.text = rawTitle;
      titleLayer.align = align === 'left' ? 'left' : 'center';
      if (align === 'center' && canvasWidth) {
        titleLayer.x = 0;
        titleLayer.width = canvasWidth;
        titleLayer.centerX = canvasWidth / 2;
      }
      return { mode: 'text', segments };
    }

    titleLayer.hidden = true;

    const built = segments.map((segment) => {
      if (segment.type === 'text') {
        const width = measureTextWidth(segment.text, titleLayer);
        return { segment, width, layer: buildTextLayer(segment, titleLayer, width) };
      }
      const dimensions = getExistingLogoDimensions(template, segment, titleLayer);
      const layer = buildLogoLayer(segment, titleLayer, dimensions);
      return { segment, width: layer.width, layer };
    });

    const totalWidth = built.reduce((sum, item) => sum + item.width, 0) + gap * Math.max(0, built.length - 1);
    const startX = align === 'left'
      ? Number(titleLayer.x || 0)
      : round((canvasWidth || (Number(titleLayer.x || 0) + Number(titleLayer.width || totalWidth))) / 2 - totalWidth / 2);

    let cursorX = startX;
    built.forEach((item, index) => {
      const key = `__title_logo_segment_${String(index + 1).padStart(2, '0')}`;
      const layer = item.layer;
      layer.x = round(cursorX);
      layer.centerX = round(cursorX + Number(layer.width || 0) / 2);
      template.layers[key] = layer;
      cursorX += Number(layer.width || 0) + gap;
    });

    const order = Array.isArray(template.renderOrder) ? template.renderOrder.filter((key) => !key.startsWith('__title_logo_segment_')) : Object.keys(template.layers);
    const titleIndex = order.indexOf(titleKey);
    const segmentKeys = built.map((_, index) => `__title_logo_segment_${String(index + 1).padStart(2, '0')}`);
    if (titleIndex >= 0) order.splice(titleIndex + 1, 0, ...segmentKeys);
    else order.push(...segmentKeys);
    template.renderOrder = order;

    return { mode: 'logo-group', align, totalWidth: round(totalWidth), segments };
  }

  window.TitleLogoParser = Object.freeze({ apply, splitTitle, measureTextWidth });
})();
