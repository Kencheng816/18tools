/* Template Rule Utils – small shared helpers for new modular rules. */
(function () {
  'use strict';

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const normalize = (value) => toText(value)
    .toLowerCase()
    .replace(/logo/gi, 'logo')
    .replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, '')
    .replace(/[＿－—–]/g, '');

  function findLayer(template, predicate) {
    return Object.values(template?.layers || {}).find(predicate) || null;
  }

  function findLayerByWords(template, { type = '', words = [] } = {}) {
    const wanted = words.map(normalize).filter(Boolean);
    return findLayer(template, (layer) => {
      if (type && layer?.type !== type) return false;
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return wanted.some((word) => label.includes(word));
    });
  }

  function setImageAsset(template, words, assetFilename) {
    const layer = findLayerByWords(template, { type: 'image', words });
    if (!layer) return false;
    layer.assetFilename = assetFilename;
    layer.hidden = false;
    layer.keepAspectRatio = true;
    return true;
  }

  function makeSolidRectFromLayer(layer, fill) {
    if (!layer) return null;
    const x = Number(layer.x || 0);
    const y = Number(layer.y || 0);
    const width = Number(layer.width || 0);
    const height = Number(layer.height || 0);
    return {
      ...layer,
      type: 'shape',
      psdName: layer.psdName || 'KV_BG',
      x,
      y,
      width,
      height,
      centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
      centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
      fill,
      shape: {
        kind: 'rectangle',
        fill,
        stroke: { enabled: false, width: 0, color: fill },
        pathBounds: {
          x,
          y,
          width,
          height,
          centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
          centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
        },
      },
    };
  }

  window.TemplateRuleUtils = Object.freeze({
    toText,
    normalize,
    findLayer,
    findLayerByWords,
    setImageAsset,
    makeSolidRectFromLayer,
  });
})();
