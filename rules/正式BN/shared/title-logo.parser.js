/* Shared title/subtitle VIP Logo parser – HBN scoped, safe for other templates.
 * 目前只有在各 template rules 明確設定 titleLogoRules.enabled=true 時才會執行。
 */
(function () {
  'use strict';

  const DEFAULT_KEYWORD = 'VIP';

  function normalizeText(value) {
    return String(value ?? '').trim();
  }

  function includesKeyword(text, keyword) {
    return normalizeText(text).toUpperCase().includes(normalizeText(keyword).toUpperCase());
  }

  function removeFirstKeyword(text, keyword) {
    const raw = String(text ?? '');
    const index = raw.toUpperCase().indexOf(String(keyword ?? DEFAULT_KEYWORD).toUpperCase());
    if (index < 0) return raw;
    return (raw.slice(0, index) + raw.slice(index + String(keyword).length)).trim();
  }

  function findLayer(layers, key, psdName) {
    if (!layers) return null;
    if (!Array.isArray(layers)) {
      return layers[key] || Object.values(layers).find((layer) => layer?.psdName === psdName) || null;
    }
    return layers.find((layer) => layer?.key === key || layer?.id === key || layer?.name === key || layer?.psdName === psdName) || null;
  }

  function setVisible(layer, visible) {
    if (!layer) return;
    layer.visible = Boolean(visible);
    layer.hidden = !visible;
    layer.opacity = visible ? (layer.opacity ?? 100) : 0;
  }

  function assignBox(layer, box) {
    if (!layer || !box) return;
    ['x', 'y', 'width', 'height'].forEach((prop) => {
      if (Number.isFinite(box[prop])) layer[prop] = box[prop];
    });
    if (Number.isFinite(layer.x) && Number.isFinite(layer.width)) layer.centerX = layer.x + layer.width / 2;
    if (Number.isFinite(layer.y) && Number.isFinite(layer.height)) layer.centerY = layer.y + layer.height / 2;
  }

  function syncTextLayer(textLayer, text) {
    if (!textLayer) return;
    textLayer.text = text;
    textLayer.value = text;
    textLayer.content = text;
  }

  function syncLogoLayer(logoLayer, assetFilename) {
    if (!logoLayer) return;
    logoLayer.assetFilename = assetFilename;
    logoLayer.src = assetFilename;
    logoLayer.fileName = assetFilename;
  }

  function resolveSourceText(baseLayer, fallbackText) {
    return normalizeText(fallbackText ?? baseLayer?.text ?? baseLayer?.value ?? baseLayer?.content);
  }

  function applyTarget(layers, targetConfig, options) {
    const keyword = options.vipKeyword || DEFAULT_KEYWORD;
    const baseLayer = findLayer(layers, targetConfig.baseLayerKey, targetConfig.basePsdName);
    const logoLayer = findLayer(layers, targetConfig.logoLayerKey, targetConfig.logoPsdName);
    const textLayer = findLayer(layers, targetConfig.textLayerKey, targetConfig.textPsdName);
    const sourceText = resolveSourceText(baseLayer, targetConfig.text);
    const hasVip = includesKeyword(sourceText, keyword);

    if (!hasVip) {
      setVisible(baseLayer, true);
      setVisible(logoLayer, false);
      setVisible(textLayer, false);
      return { hasVip: false, text: sourceText };
    }

    const remainingText = removeFirstKeyword(sourceText, keyword);
    const gapPx = Number.isFinite(options.gapPx) ? options.gapPx : 3;
    const logoBox = targetConfig.layout?.logo;
    const textBox = { ...(targetConfig.layout?.text || {}) };

    if (logoBox && Number.isFinite(logoBox.x) && Number.isFinite(logoBox.width)) {
      textBox.x = logoBox.x + logoBox.width + gapPx;
    }

    setVisible(baseLayer, false);
    setVisible(logoLayer, true);
    setVisible(textLayer, true);
    syncLogoLayer(logoLayer, options.logoAssetFilename || '蝦皮VIP_LOGO.svg');
    syncTextLayer(textLayer, remainingText);
    assignBox(logoLayer, logoBox);
    assignBox(textLayer, textBox);

    return {
      hasVip: true,
      text: remainingText,
      logoAssetFilename: options.logoAssetFilename || '蝦皮VIP_LOGO.svg',
      gapPx,
      groupName: targetConfig.groupName,
    };
  }

  function apply(layersOrTemplate, rules = {}, data = {}) {
    const titleLogoRules = rules.titleLogoRules || rules;
    if (!titleLogoRules?.enabled) return null;

    const layers = layersOrTemplate?.layers || layersOrTemplate;
    const results = {};
    const targets = titleLogoRules.targets || {};

    Object.entries(targets).forEach(([targetName, targetConfig]) => {
      const sourceText = data[targetName] ?? data[targetConfig.baseLayerKey] ?? data[targetConfig.basePsdName];
      results[targetName] = applyTarget(layers, { ...targetConfig, text: sourceText }, titleLogoRules);
    });

    return results;
  }

  window.TitleLogoParser = Object.freeze({
    apply,
    applyTarget,
    parse(text, keyword = DEFAULT_KEYWORD) {
      const sourceText = normalizeText(text);
      return {
        hasVip: includesKeyword(sourceText, keyword),
        text: removeFirstKeyword(sourceText, keyword),
      };
    },
  });
})();
