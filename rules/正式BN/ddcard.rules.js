/* DD Card template rules – V4.20.8
 * Patch:
 * 1) price color/count rules are resolved by 商品圖1 filename.
 * 2) 主標題/副標題遇到 VIP 時，只在 afterApplyRecordToTemplate 執行，避免被 Excel 寫回流程覆蓋。
 * 3) DDcard VIP LOGO 只在 record 主標/副標含 VIP 時建立，並依主標/副標使用固定尺寸。
 * 4) 主標題_蝦皮VIP_LOGO=224x78；副標題_蝦皮VIP_LOGO=150x52，素材皆為蝦皮VIP_LOGO.svg。
 * 5) 主標/副標的 VIP 群組代理改由 rules/ddcard.rules.js 在 after hook 最後收尾。
 * 6) 商品圖1為「免運車加商城券.png」時，價格旋轉角度固定為 -8 度。
 * 7) 副標題含 VIP 時，藍色膠囊高度固定為 67px。
 * 8) VIP 拆分後的主標/副標 LOGO 與文字子圖層，以 DDC_XX_edited.json 寫回數值作為最後排版。
 * 9) DDcard 採固定座標模式，subtitle/legal 不再因主標題高度重新推算。
 * 10) DDC_01 膠囊 Y 對齊 DDC_02，但不移動副標題 VIP LOGO / 文字子圖層。
 */
(function () {
  'use strict';



  const DD_CARD_VIP_LOGO_ASSET = '蝦皮VIP_LOGO.svg';
  const DD_CARD_VIP_LOGO_ASSET_CANDIDATES = Object.freeze([
    '蝦皮VIP_LOGO.svg',
    '04_DD Card/蝦皮VIP_LOGO.svg',
  ]);

  const DD_CARD_VIP_LOGO_SIZE_BY_FIELD = Object.freeze({
    title: { width: 224, height: 78, psdName: '主標題_蝦皮VIP_LOGO', textPsdName: '主標題_文字', groupPsdName: '主標題' },
    subtitle: { width: 150, height: 52, psdName: '副標題_蝦皮VIP_LOGO', textPsdName: '副標題_文字', groupPsdName: '副標題' },
  });

  const DD_CARD_VIP_TEXT_RULES = Object.freeze({
    defaultGapPx: 3,
    specialGapPx: 3,
    specialTextFontSizePx: 37,
    specialText: 'VIP獨享18%蝦幣',
  });

  const DD_CARD_VIP_LAYER_LAYOUTS = Object.freeze({
    DDC_01: {
      subtitle: {
        group: {
          x: 80,
          y: 220,
          width: 371,
          height: 52,
          centerX: 265.5,
          centerY: 246,
          ddcardVipGroupWidth: 371,
        },
        logo: {
          x: 80,
          y: 210,
          width: 150,
          height: 52,
          centerX: 155,
          centerY: 236,
          targetWidth: 150,
        },
        text: {
          x: 233,
          y: 226,
          width: 220,
          height: 35,
          centerX: 343,
          centerY: 240,
          fontSizePx: 37,
          fontSizePt: 37,
          lineHeight: 39.96,
          letterSpacing: 0,
          align: 'left',
          color: '#FFFF3C',
        },
      },
    },
    DDC_04: {
      title: {
        group: {
          x: 31,
          y: 126,
          width: 469,
          height: 78,
          centerX: 265.5,
          centerY: 165,
          ddcardVipGroupWidth: 469,
        },
        logo: {
          x: 39,
          y: 114.4,
          width: 224,
          height: 79.1,
          centerX: 151,
          centerY: 153.9,
          targetWidth: 224,
        },
        text: {
          x: 265,
          y: 136,
          width: 244,
          height: 60,
          centerX: 380,
          centerY: 165,
          fontSizePx: 59,
          fontSizePt: 59,
          lineHeight: 63.72,
          letterSpacing: 0,
          align: 'left',
          color: '#ffffff',
        },
      },
    },
  });


  const toText = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const normalizeText = (value) => toText(value)
    .toLowerCase()
    .replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, '')
    .replace(/[＿－—–]/g, '');

  function pickRecordText(record, candidates = []) {
    if (!record) return '';
    const wanted = candidates.map(normalizeText).filter(Boolean);
    const directKeys = candidates.filter(Boolean);

    for (const key of directKeys) {
      const value = record[key];
      if (toText(value)) return toText(value);
    }

    for (const [key, value] of Object.entries(record)) {
      const normalizedKey = normalizeText(key);
      if (wanted.some((word) => normalizedKey === word || normalizedKey.includes(word))) {
        const text = toText(value);
        if (text) return text;
      }
    }

    return '';
  }

  function findTextLayerEntry(template, candidates = []) {
    const wanted = candidates.map(normalizeText).filter(Boolean);
    const blocked = ['價格', 'price', '票券', '案型', 'cta', 'button', '法務', '警語', 'legal']
      .map(normalizeText)
      .filter(Boolean);

    const entries = Object.entries(template?.layers || {})
      .filter(([, layer]) => layer?.type === 'text')
      // VIP 拆出的「主標題_文字 / 副標題_文字」是子圖層，不能再被當成主標/副標入口，
      // 否則下一次 after hook 會找錯圖層，導致 LOGO 不再被套用。
      .filter(([, layer]) => layer?.source !== 'generated_ddcard_vip_text_logo')
      .map(([key, layer]) => {
        const label = normalizeText(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
        if (blocked.some((word) => label.includes(word))) return null;
        const matchedIndex = wanted.findIndex((word) => label === word || label.includes(word));
        if (matchedIndex < 0) return null;
        const exactScore = wanted.some((word) => label === word) ? 0 : 10;
        const keyScore = normalizeText(key) === wanted[matchedIndex] ? -5 : 0;
        return { key, layer, score: exactScore + keyScore + matchedIndex };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score);

    const hit = entries[0];
    return hit ? [hit.key, hit.layer] : null;
  }

  function getCanvasMeasureContext() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    return canvas.getContext('2d');
  }

  function getFont(layer) {
    const weight = layer?.fontWeight || 500;
    const size = Number(layer?.fontSizePx || layer?.fontSizePt || 24);
    const family = layer?.fontFamily || 'ShopeeNotoSans Content';
    return `${weight} ${size}px "${family}", "ShopeeNotoSans Content", "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
  }

  function measureTextWidth(layer, text) {
    const ctx = getCanvasMeasureContext();
    const content = String(text || '');
    if (!content) return 1;
    if (!ctx) return Math.max(1, content.length * Number(layer?.fontSizePx || 24) * 0.62);
    ctx.save();
    ctx.font = getFont(layer);
    const letterSpacing = Number(layer?.letterSpacing || 0);
    const chars = [...content];
    const width = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0)
      + Math.max(0, chars.length - 1) * letterSpacing;
    ctx.restore();
    return Math.ceil(Math.max(1, width));
  }

  function getGroupKeys(logoOptions = {}, sourceKey = '') {
    const groupName = logoOptions.groupPsdName || sourceKey || '主標題';
    return {
      logoKey: `${groupName}_蝦皮VIP_LOGO`,
      textKey: `${groupName}_文字`,
      oldLogoKey: `__ddcard_vip_logo_${sourceKey}`,
      oldTextKey: `__ddcard_vip_text_${sourceKey}`,
    };
  }

  function cloneTextLayer(sourceLayer, psdName) {
    const next = JSON.parse(JSON.stringify(sourceLayer || {}));
    return {
      ...next,
      type: 'text',
      psdName: psdName || sourceLayer?.psdName || '文字',
      source: 'generated_ddcard_vip_text_logo',
      hidden: true,
      visible: false,
      locked: false,
    };
  }

  function removeLegacyGeneratedLayers(template, sourceKey, keepKeys = []) {
    if (!template?.layers) return;
    const keep = new Set(keepKeys.filter(Boolean));
    const legacyKeys = [`__ddcard_vip_logo_${sourceKey}`, `__ddcard_vip_text_${sourceKey}`];
    legacyKeys.forEach((key) => {
      if (key && !keep.has(key) && template.layers[key]) delete template.layers[key];
    });
    template.renderOrder = (template.renderOrder || []).filter((key) => template.layers?.[key]);
  }

  function ensureGeneratedTextLayer(template, textKey, sourceLayer, textOptions = {}) {
    const layers = template?.layers || {};
    const psdName = textOptions.textPsdName || `${sourceLayer?.psdName || textKey}_文字`;
    if (!layers[textKey]) layers[textKey] = cloneTextLayer(sourceLayer, psdName);
    return layers[textKey];
  }

  function ensureVipLogoLayer(template, logoKey, sourceLayer, logoOptions = {}) {
    const layers = template?.layers || {};
    if (!layers[logoKey]) {
      layers[logoKey] = {
        type: 'image',
        psdName: logoOptions.psdName || (sourceLayer?.psdName ? `${sourceLayer.psdName}_蝦皮VIP_LOGO` : '蝦皮VIP_LOGO'),
        source: 'generated_ddcard_vip_text_logo',
        assetFilename: DD_CARD_VIP_LOGO_ASSET,
        assetCandidates: [...DD_CARD_VIP_LOGO_ASSET_CANDIDATES],
        keepAspectRatio: true,
        hidden: true,
        visible: false,
        text: '',
        x: sourceLayer?.x || 0,
        y: sourceLayer?.y || 0,
        width: 1,
        height: 1,
      };
    }
    return layers[logoKey];
  }

  function ensureVipRenderOrder(template, sourceKey, logoKey, textKey) {
    const isRenderableKey = (key) =>
      !!(template.layers?.[key] || template.generatedLayers?.[key] || key === sourceKey || key === 'subtitle_frame');
    const order = (template.renderOrder || [])
      .filter((key) => key !== logoKey && key !== textKey)
      .filter(isRenderableKey);
    const sourceIndex = order.indexOf(sourceKey);
    const insertAt = sourceIndex >= 0 ? sourceIndex : order.length;
    order.splice(insertAt, 0, logoKey, textKey);
    template.renderOrder = order;
  }

  function setLayerVisible(layer, visible) {
    if (!layer) return;
    layer.hidden = !visible;
    layer.visible = !!visible;
  }

  function removeVipText(rawText) {
    return toText(rawText)
      .replace(/\bVIP\b/gi, '')
      .replace(/^\s*[+＋｜|／/・,，、-]+\s*/g, '')
      .trim();
  }

  function syncSpecialTextStyle(textLayer) {
    textLayer.fontSizePx = DD_CARD_VIP_TEXT_RULES.specialTextFontSizePx;
    textLayer.fontSizePt = DD_CARD_VIP_TEXT_RULES.specialTextFontSizePx;
    textLayer.lineHeight = Math.round(DD_CARD_VIP_TEXT_RULES.specialTextFontSizePx * 1.08 * 100) / 100;
    if (Array.isArray(textLayer.textStyleRanges)) {
      textLayer.textStyleRanges = textLayer.textStyleRanges.map((range) => ({
        ...range,
        fontSizePx: DD_CARD_VIP_TEXT_RULES.specialTextFontSizePx,
        fontSizePt: DD_CARD_VIP_TEXT_RULES.specialTextFontSizePx,
        lineHeight: textLayer.lineHeight,
      }));
    }
  }

  function restoreGroupProxyAsNormalText(template, sourceKey, sourceLayer, logoOptions = {}) {
    if (!sourceLayer) return;
    const { logoKey, textKey, oldLogoKey, oldTextKey } = getGroupKeys(logoOptions, sourceKey);
    [logoKey, textKey, oldLogoKey, oldTextKey].forEach((key) => setLayerVisible(template?.layers?.[key], false));
    delete sourceLayer.ddcardVipGroupProxy;
    delete sourceLayer.ddcardVipGroupChildren;
    delete sourceLayer.ddcardVipGroupWidth;
    delete sourceLayer.ddcardVipLogoKey;
    delete sourceLayer.ddcardVipTextKey;
    setLayerVisible(sourceLayer, true);
  }


  function copyNumericLayout(targetLayer, preset = {}) {
    if (!targetLayer || !preset) return;
    Object.entries(preset).forEach(([prop, value]) => {
      targetLayer[prop] = typeof value === 'number'
        ? Math.round(Number(value) * 100) / 100
        : value;
    });
  }

  function syncTextStyleRangesFromLayer(textLayer) {
    if (!textLayer || !Array.isArray(textLayer.textStyleRanges)) return;
    textLayer.textStyleRanges = textLayer.textStyleRanges.map((range) => ({
      ...range,
      fontSizePx: textLayer.fontSizePx,
      fontSizePt: textLayer.fontSizePt,
      lineHeight: textLayer.lineHeight,
      letterSpacing: textLayer.letterSpacing ?? range.letterSpacing,
      color: textLayer.color || range.color,
    }));
  }

  function applyEditedVipLayerLayout(template, fieldKey, groupLayer, logoLayer, textLayer) {
    const templateId = resolveDdCardTemplateId(template);
    const preset = DD_CARD_VIP_LAYER_LAYOUTS?.[templateId]?.[fieldKey];
    if (!preset) return false;

    copyNumericLayout(groupLayer, preset.group);
    copyNumericLayout(logoLayer, preset.logo);
    copyNumericLayout(textLayer, preset.text);

    if (logoLayer) {
      logoLayer.assetFilename = DD_CARD_VIP_LOGO_ASSET;
      logoLayer.assetCandidates = [...DD_CARD_VIP_LOGO_ASSET_CANDIDATES];
      logoLayer.keepAspectRatio = true;
      logoLayer.hidden = false;
      logoLayer.visible = true;
      logoLayer.targetWidth = Number(logoLayer.targetWidth || logoLayer.width || 1);
      logoLayer.centerX = Number.isFinite(Number(logoLayer.centerX))
        ? logoLayer.centerX
        : Math.round((Number(logoLayer.x || 0) + Number(logoLayer.width || 0) / 2) * 100) / 100;
      logoLayer.centerY = Number.isFinite(Number(logoLayer.centerY))
        ? logoLayer.centerY
        : Math.round((Number(logoLayer.y || 0) + Number(logoLayer.height || 0) / 2) * 100) / 100;
    }

    if (textLayer) {
      textLayer.hidden = false;
      textLayer.visible = true;
      textLayer.locked = false;
      syncTextStyleRangesFromLayer(textLayer);
    }

    if (groupLayer) {
      groupLayer.ddcardVipGroupProxy = true;
      groupLayer.ddcardVipGroupWidth = Number(preset.group?.ddcardVipGroupWidth || preset.group?.width || groupLayer.width || 1);
      groupLayer.hidden = true;
      groupLayer.visible = false;
    }

    return true;
  }



  function ensureDdCardSubtitleFrame(template) {
    if (!template?.generatedLayers?.subtitle_frame) return;
    const order = Array.isArray(template.renderOrder) ? template.renderOrder : [];
    const cleaned = order.filter((key) => key !== 'subtitle_frame');
    const beforeKeys = [
      '主標題_蝦皮VIP_LOGO',
      '主標題_文字',
      'title',
      '副標題_蝦皮VIP_LOGO',
      '副標題_文字',
      'subtitle',
      'legal',
      'cta',
    ];
    const insertAt = cleaned.findIndex((key) => beforeKeys.includes(key));
    cleaned.splice(insertAt >= 0 ? insertAt : cleaned.length, 0, 'subtitle_frame');
    template.renderOrder = cleaned;
  }

  function applyVipLogoToTextLayer(template, sourceKey, layer, diagnostics, overrideText = '', logoOptions = {}) {
    const originalText = toText(overrideText || layer?.text);
    const hasVip = /VIP/i.test(originalText);

    if (!hasVip) {
      restoreGroupProxyAsNormalText(template, sourceKey, layer, logoOptions);
      return;
    }

    const groupKeys = getGroupKeys(logoOptions, sourceKey);
    const { logoKey, textKey } = groupKeys;
    removeLegacyGeneratedLayers(template, sourceKey, [logoKey, textKey]);

    const originalBox = {
      x: Number(layer.x || 0),
      y: Number(layer.y || 0),
      width: Number(layer.width || 0),
      height: Number(layer.height || 0),
      centerX: Number(layer.centerX ?? (Number(layer.x || 0) + Number(layer.width || 0) / 2)),
      centerY: Number(layer.centerY ?? (Number(layer.y || 0) + Number(layer.height || 0) / 2)),
    };
    const nextText = removeVipText(originalText);
    const isSpecial = normalizeText(originalText) === normalizeText(DD_CARD_VIP_TEXT_RULES.specialText);
    const gap = isSpecial ? DD_CARD_VIP_TEXT_RULES.specialGapPx : DD_CARD_VIP_TEXT_RULES.defaultGapPx;
    const logoWidth = Number(logoOptions.width || 1);
    const logoHeight = Number(logoOptions.height || 1);

    const logoLayer = ensureVipLogoLayer(template, logoKey, layer, logoOptions);
    const textLayer = ensureGeneratedTextLayer(template, textKey, layer, logoOptions);
    ensureVipRenderOrder(template, sourceKey, logoKey, textKey);

    const nextTextLayer = cloneTextLayer(layer, logoOptions.textPsdName || `${layer.psdName || sourceKey}_文字`);
    Object.assign(textLayer, nextTextLayer, {
      text: nextText,
      align: 'left',
      source: 'generated_ddcard_vip_text_logo',
      hidden: false,
      visible: true,
      locked: false,
    });

    if (isSpecial) syncSpecialTextStyle(textLayer);

    const textWidth = measureTextWidth(textLayer, nextText);
    const groupWidth = logoWidth + gap + textWidth;
    const groupX = originalBox.centerX - groupWidth / 2;
    const groupCenterY = originalBox.centerY;

    Object.assign(logoLayer, {
      type: 'image',
      psdName: logoOptions.psdName || `${layer.psdName || sourceKey}_蝦皮VIP_LOGO`,
      source: 'generated_ddcard_vip_text_logo',
      assetFilename: DD_CARD_VIP_LOGO_ASSET,
      assetCandidates: [...DD_CARD_VIP_LOGO_ASSET_CANDIDATES],
      keepAspectRatio: true,
      x: Math.round(groupX * 100) / 100,
      y: Math.round((groupCenterY - logoHeight / 2) * 100) / 100,
      width: logoWidth,
      height: logoHeight,
      centerX: Math.round((groupX + logoWidth / 2) * 100) / 100,
      centerY: Math.round(groupCenterY * 100) / 100,
      text: '',
      hidden: false,
      visible: true,
    });

    textLayer.x = Math.round((groupX + logoWidth + gap) * 100) / 100;
    textLayer.width = Math.ceil(textWidth + 2);
    textLayer.centerX = Math.round((textLayer.x + textLayer.width / 2) * 100) / 100;
    textLayer.centerY = Math.round(groupCenterY * 100) / 100;
    textLayer.y = Math.round((groupCenterY - Number(textLayer.height || originalBox.height || textLayer.lineHeight || textLayer.fontSizePx || 24) / 2) * 100) / 100;

    // 原主標題 / 副標題保留為「群組代理」。
    // 重要：仍維持 type=text，讓 app.core 的既有 findLayer / capsule 流程能找到它；
    // 但 hidden=true，不直接繪製文字。實際輸出由「*_蝦皮VIP_LOGO」與「*_文字」兩個子圖層負責。
    const groupHeight = Math.max(
      logoHeight,
      Number(textLayer.height || originalBox.height || textLayer.lineHeight || textLayer.fontSizePx || 24)
    );
    layer.psdName = logoOptions.groupPsdName || layer.psdName || sourceKey;
    layer.text = nextText;
    layer.x = Math.round(groupX * 100) / 100;
    layer.y = Math.round((groupCenterY - groupHeight / 2) * 100) / 100;
    layer.width = Math.round(groupWidth * 100) / 100;
    layer.height = Math.round(groupHeight * 100) / 100;
    layer.centerX = Math.round(originalBox.centerX * 100) / 100;
    layer.centerY = Math.round(groupCenterY * 100) / 100;
    layer.align = 'center';
    layer.source = 'ddcard_vip_group_proxy';
    layer.ddcardVipGroupProxy = true;
    layer.ddcardVipGroupWidth = Math.round(groupWidth * 100) / 100;
    layer.ddcardVipLogoKey = logoKey;
    layer.ddcardVipTextKey = textKey;
    layer.ddcardVipGroupChildren = [logoLayer.psdName, textLayer.psdName];
    setLayerVisible(layer, false);

    const fieldKey = logoOptions.groupPsdName === '主標題' ? 'title'
      : logoOptions.groupPsdName === '副標題' ? 'subtitle'
        : sourceKey;
    applyEditedVipLayerLayout(template, fieldKey, layer, logoLayer, textLayer);

    diagnostics?.push?.({
      field: layer.psdName || sourceKey,
      status: 'ok',
      value: `${DD_CARD_VIP_LOGO_ASSET} + ${gap}px + ${nextText}`,
      target: 'DD Card VIP Text Logo Rule',
    });
  }

  function applyDdCardVipTextLogoRule(template, record, diagnostics) {
    const targets = [
      {
        fallbackKey: 'title',
        field: '主標',
        logoSizeKey: 'title',
        recordKeys: ['主標', '主標題', '主標題文案', 'title'],
        layerWords: ['title', '主標', '主標題', '主標題文字', '主標文字'],
      },
      {
        fallbackKey: 'subtitle',
        field: '副標',
        logoSizeKey: 'subtitle',
        recordKeys: ['副標', '副標題', '副標題文案', 'subtitle', 'USP', 'USP/副標', 'usp副標'],
        layerWords: ['subtitle', '副標', '副標題', '副標題文字', '副標文字', 'usp'],
      },
    ];

    targets.forEach((target) => {
      const recordText = pickRecordText(record, target.recordKeys);
      const logoOptions = DD_CARD_VIP_LOGO_SIZE_BY_FIELD[target.logoSizeKey] || DD_CARD_VIP_LOGO_SIZE_BY_FIELD.subtitle;
      const hasVipInRecord = /VIP/i.test(recordText);
      const entry = findTextLayerEntry(template, target.layerWords);

      if (!hasVipInRecord) {
        if (entry) restoreGroupProxyAsNormalText(template, entry[0] || target.fallbackKey, entry[1], logoOptions);
        return;
      }

      if (!entry) {
        diagnostics?.push?.({
          field: target.field,
          status: 'missing-layer',
          value: recordText,
          target: 'DD Card VIP Text Logo Rule',
        });
        return;
      }

      applyVipLogoToTextLayer(
        template,
        entry[0] || target.fallbackKey,
        entry[1],
        diagnostics,
        recordText,
        logoOptions
      );
    });
  }

  const DD_CARD_TEXT_LAYER_LAYOUTS = Object.freeze({
    "DDC_01": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 27,
            "y": 220,
            "width": 477,
            "height": 52,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 285,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_02": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 27,
            "y": 220,
            "width": 477,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_03": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 79.5,
            "y": 220,
            "width": 372,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_04": {
        "title": {
            "x": 31,
            "y": 126,
            "width": 469,
            "height": 78,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 64.5,
            "y": 220,
            "width": 402,
            "height": 42,
            "centerX": 265.5,
            "centerY": 241,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 297.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_05": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 35,
            "y": 220,
            "width": 461,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_06": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 80.5,
            "y": 220,
            "width": 370,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_07": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 105,
            "y": 220,
            "width": 321,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_08": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 27,
            "y": 220,
            "width": 477,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_09": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 27,
            "y": 220,
            "width": 477,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_10": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 27,
            "y": 220,
            "width": 477,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_11": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 44,
            "y": 220,
            "width": 443,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    },
    "DDC_12": {
        "title": {
            "x": 41,
            "y": 136,
            "width": 449,
            "height": 58,
            "centerX": 265.5,
            "centerY": 165,
            "fontSizePx": 60.45,
            "fontSizePt": 60.45,
            "lineHeight": 72.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF"
        },
        "subtitle": {
            "x": 64.5,
            "y": 220,
            "width": 402,
            "height": 42,
            "centerX": 265.5,
            "centerY": 240,
            "fontSizePx": 44.62,
            "fontSizePt": 44.62,
            "lineHeight": 53.54,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C"
        },
        "legal": {
            "x": 110,
            "y": 286,
            "width": 310,
            "height": 23,
            "centerX": 265,
            "centerY": 296.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 28.8,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366"
        }
    }
});

  function resolveDdCardTemplateId(template = {}) {
    const labels = [
      template?.templateId,
      template?.pricePresetMeta?.templateId,
      template?.sheetTemplateRoute?.sourceTemplateId,
      template?.batchSourceName,
      template?.source?.psdName,
    ].filter(Boolean).map(String);
    return Object.keys(DD_CARD_TEXT_LAYER_LAYOUTS).find((id) =>
      labels.some((label) => normalizeText(label).includes(normalizeText(id)))
    ) || '';
  }

  function applyDdCardTextLayerLayout({ template, helpers }) {
    const templateId = resolveDdCardTemplateId(template);
    const rules = DD_CARD_TEXT_LAYER_LAYOUTS[templateId];
    if (!template?.layers || !rules) return;
    const roundValue = helpers?.round || ((value) => Math.round(Number(value || 0) * 100) / 100);
    ['title', 'subtitle', 'legal'].forEach((key) => {
      const layer = template.layers[key];
      const preset = rules[key];
      if (!layer || !preset) return;
      // VIP 拆分後的主標/副標是群組代理，子圖層由 core 依 VIP 規則定位，避免在 render 階段二次覆蓋。
      if (layer.ddcardVipGroupProxy === true && (key === 'title' || key === 'subtitle')) return;
      Object.entries(preset).forEach(([prop, value]) => {
        layer[prop] = typeof value === 'number' ? roundValue(value, 2) : value;
      });
    });
  }

const RULES = {
  "capsuleRules": {
    "subtitleVipFixedHeightPx": 67,
    "preserveTextLayerLayout": true,
    "preserveSubtitleY": true,
    "preserveLegalY": true,
    "preserveSubtitleBox": true
  },
  "layoutRules": {
    applyProgrammaticLayout: applyDdCardTextLayerLayout
  },
  "priceRules": {
    "enabled": true,
    "productFirst": false,
    "resolvePriority": "templateFirst",
    "coordinateMode": "absolute",
    "anchorLayerName": "商品圖1",
    "anchorLayerNames": [
      "商品圖1",
      "P1",
      "曝品",
      "product_1",
      "product",
      "P"
    ],
    "defaultColor": "#D0011B",
    "templateLayouts": {
      "DDC_01": {
            "templateId": "DDC_01",
            "productName": "VIP_單券_蝦幣",
            "productKey": "VIP_單券_蝦幣",
            "layoutKey": "vip",
            "rawPriceExample": "18%蝦幣",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 45,
                  "y": 357.7,
                  "width": 410,
                  "height": 260.7,
                  "centerX": 250,
                  "centerY": 488,
                  "targetWidth": 410,
                  "targetHeight": 260.7,
                  "maxTargetHeight": 260.7,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 45,
                  "y": 357.7,
                  "width": 410,
                  "height": 260.7,
                  "centerX": 250,
                  "centerY": 488,
                  "targetWidth": 410,
                  "targetHeight": 260.7,
                  "maxTargetHeight": 260.7,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 139,
                        "y": 461,
                        "width": 318,
                        "height": 117,
                        "centerX": 298,
                        "centerY": 519.5,
                        "rotation": 12,
                        "fontSizePx": 70,
                        "fontSizePt": 70,
                        "lineHeight": 75.56,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ff770f",
                        "leftX": 139,
                        "topY": 461,
                        "baseHeight": 117,
                        "baseWidth": 318,
                        "baseFontSizePx": 70,
                        "rotationOffset": 12,
                        "offsetY": 31.5,
                        "offsetX": 48,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_02": {
            "templateId": "DDC_02",
            "productName": "全站券_雙券",
            "productKey": "全站券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "$100",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75.6,
                  "y": 347.9,
                  "width": 372.8,
                  "height": 296.2,
                  "centerX": 262,
                  "centerY": 496,
                  "targetWidth": 372.8,
                  "targetHeight": 296.2,
                  "maxTargetHeight": 296.2,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75.6,
                  "y": 347.9,
                  "width": 372.8,
                  "height": 296.2,
                  "centerX": 262,
                  "centerY": 496,
                  "targetWidth": 372.8,
                  "targetHeight": 296.2,
                  "maxTargetHeight": 296.2,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 189.8,
                        "y": 376.3,
                        "width": 218.3,
                        "height": 112.5,
                        "centerX": 297.95,
                        "centerY": 423.55,
                        "rotation": -6,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ee4d2d",
                        "leftX": 189.8,
                        "topY": 376.3,
                        "baseHeight": 112.5,
                        "baseWidth": 218.3,
                        "baseFontSizePx": 95,
                        "rotationOffset": -6,
                        "offsetY": -63.45,
                        "offsetX": 36.95,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 193.3,
                        "y": 498.3,
                        "width": 231.4,
                        "height": 119.3,
                        "centerX": 308,
                        "centerY": 548.95,
                        "rotation": 2,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ee4d2d",
                        "leftX": 193.3,
                        "topY": 498.3,
                        "baseHeight": 119.3,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": 2,
                        "offsetY": 61.95,
                        "offsetX": 47,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_03": {
            "templateId": "DDC_03",
            "productName": "全站券_雙券",
            "productKey": "全站券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "93折",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 185.3,
                        "y": 374.9,
                        "width": 231.4,
                        "height": 119.3,
                        "centerX": 301,
                        "centerY": 434.55,
                        "rotation": -6,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ee4d2d",
                        "leftX": 185.3,
                        "topY": 374.9,
                        "baseHeight": 119.3,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": -6,
                        "offsetY": -63.45,
                        "offsetX": 40,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 194.3,
                        "y": 498.3,
                        "width": 231.4,
                        "height": 119.3,
                        "centerX": 310,
                        "centerY": 557.95,
                        "rotation": 2,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ee4d2d",
                        "leftX": 194.3,
                        "topY": 498.3,
                        "baseHeight": 119.3,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": 2,
                        "offsetY": 59.95,
                        "offsetX": 49,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_04": {
            "templateId": "DDC_04",
            "productName": "VIP_單券_蝦幣",
            "productKey": "VIP_單券_蝦幣",
            "layoutKey": "vip",
            "rawPriceExample": "18%蝦幣",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 45,
                  "y": 357.7,
                  "width": 410,
                  "height": 260.7,
                  "centerX": 250,
                  "centerY": 488,
                  "targetWidth": 410,
                  "targetHeight": 260.7,
                  "maxTargetHeight": 260.7,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 45,
                  "y": 357.7,
                  "width": 410,
                  "height": 260.7,
                  "centerX": 250,
                  "centerY": 488,
                  "targetWidth": 410,
                  "targetHeight": 260.7,
                  "maxTargetHeight": 260.7,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 138,
                        "y": 461,
                        "width": 318,
                        "height": 117,
                        "centerX": 297,
                        "centerY": 519.5,
                        "rotation": 12,
                        "fontSizePx": 70,
                        "fontSizePt": 70,
                        "lineHeight": 75.56,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#ff770f",
                        "leftX": 138,
                        "topY": 461,
                        "baseHeight": 117,
                        "baseWidth": 318,
                        "baseFontSizePx": 70,
                        "rotationOffset": 12,
                        "offsetY": 31.5,
                        "offsetX": 47,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_05": {
            "templateId": "DDC_05",
            "productName": "商城券_雙券",
            "productKey": "商城券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "$200",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 176.3,
                        "y": 380.1,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 292,
                        "centerY": 436.95,
                        "rotation": -6,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 176.3,
                        "topY": 380.1,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 90,
                        "rotationOffset": -6,
                        "offsetY": -61.05,
                        "offsetX": 31,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 185.3,
                        "y": 502.2,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 301,
                        "centerY": 559.05,
                        "rotation": 2,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 185.3,
                        "topY": 502.2,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 90,
                        "rotationOffset": 2,
                        "offsetY": 61.05,
                        "offsetX": 40,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_06": {
            "templateId": "DDC_06",
            "productName": "商城券_雙券",
            "productKey": "商城券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "92折",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 182.3,
                        "y": 380.1,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 298,
                        "centerY": 436.95,
                        "rotation": -6,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 182.3,
                        "topY": 380.1,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": -6,
                        "offsetY": -61.05,
                        "offsetX": 37,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 187.3,
                        "y": 501.2,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 303,
                        "centerY": 558.05,
                        "rotation": 2,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 187.3,
                        "topY": 501.2,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": 2,
                        "offsetY": 60.05,
                        "offsetX": 42,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_07": {
            "templateId": "DDC_07",
            "productName": "商城券_雙券",
            "productKey": "商城券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "93折",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 177.3,
                        "y": 380.1,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 293,
                        "centerY": 436.95,
                        "rotation": -6,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 177.3,
                        "topY": 380.1,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": -6,
                        "offsetY": -61.05,
                        "offsetX": 32,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 187.3,
                        "y": 502.2,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 303,
                        "centerY": 559.05,
                        "rotation": 2,
                        "fontSizePx": 95,
                        "fontSizePt": 95,
                        "lineHeight": 102.6,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 187.3,
                        "topY": 502.2,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 95,
                        "rotationOffset": 2,
                        "offsetY": 61.05,
                        "offsetX": 42,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_08": {
            "templateId": "DDC_08",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "92折",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 206.1,
                        "y": 521.2,
                        "width": 250,
                        "height": 110,
                        "centerX": 331.1,
                        "centerY": 576.2,
                        "rotation": -8,
                        "fontSizePx": 80,
                        "fontSizePt": 80,
                        "lineHeight": 86.4,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 206.1,
                        "topY": 521.2,
                        "baseHeight": 110,
                        "baseWidth": 250,
                        "baseFontSizePx": 80,
                        "rotationOffset": -8,
                        "offsetY": 75.2,
                        "offsetX": 72.6,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_09": {
            "templateId": "DDC_09",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "$200",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 206.1,
                        "y": 521.2,
                        "width": 250,
                        "height": 110,
                        "centerX": 331.1,
                        "centerY": 576.2,
                        "rotation": -8,
                        "fontSizePx": 80,
                        "fontSizePt": 80,
                        "lineHeight": 86.4,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 206.1,
                        "topY": 521.2,
                        "baseHeight": 110,
                        "baseWidth": 250,
                        "baseFontSizePx": 80,
                        "rotationOffset": -8,
                        "offsetY": 75.2,
                        "offsetX": 72.6,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_10": {
            "templateId": "DDC_10",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "95折",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 60,
                  "y": 344,
                  "width": 397,
                  "height": 314,
                  "centerX": 258.5,
                  "centerY": 501,
                  "targetWidth": 397,
                  "targetHeight": 314,
                  "maxTargetHeight": 314,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 207.1,
                        "y": 522.2,
                        "width": 250,
                        "height": 110,
                        "centerX": 332.1,
                        "centerY": 577.2,
                        "rotation": -8,
                        "fontSizePx": 80,
                        "fontSizePt": 80,
                        "lineHeight": 86.4,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 207.1,
                        "topY": 522.2,
                        "baseHeight": 110,
                        "baseWidth": 250,
                        "baseFontSizePx": 80,
                        "rotationOffset": -8,
                        "offsetY": 76.2,
                        "offsetX": 73.6,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_11": {
            "templateId": "DDC_11",
            "productName": "商城券加蝦幣",
            "productKey": "商城券加蝦幣",
            "layoutKey": "couponCoin",
            "rawPriceExample": "20%",
            "isDoubleCoupon": false,
            "productImageBox": {
                  "x": 72,
                  "y": 370,
                  "width": 390,
                  "height": 280,
                  "centerX": 267,
                  "centerY": 510,
                  "targetWidth": 390,
                  "targetHeight": 280,
                  "maxTargetHeight": 280,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 72,
                  "y": 370,
                  "width": 390,
                  "height": 280,
                  "centerX": 267,
                  "centerY": 510,
                  "targetWidth": 390,
                  "targetHeight": 280,
                  "maxTargetHeight": 280,
                  "sizingMode": "heightBased",
                  "keepAspectRatio": 1,
                  "widthLimitPolicy": "none",
                  "productImageSizingRule": "ddcardHeightPriorityNoWidthLimit"
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 237.7,
                        "y": 532,
                        "width": 205.6,
                        "height": 80.4,
                        "centerX": 340.5,
                        "centerY": 572.2,
                        "rotation": -6,
                        "fontSizePx": 75,
                        "fontSizePt": 75,
                        "lineHeight": 81,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 237.7,
                        "topY": 532,
                        "baseHeight": 80.23,
                        "baseWidth": 205.16,
                        "baseFontSizePx": 74.84,
                        "rotationOffset": -6,
                        "offsetY": 62.07,
                        "offsetX": 73.34,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      },
      "DDC_12": {
            "templateId": "DDC_12",
            "productName": "商城券_雙券",
            "productKey": "商城券_雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "9折",
            "isDoubleCoupon": true,
            "productImageBox": {
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "anchorSource": {
                  "layerKey": "product_1",
                  "x": 75,
                  "y": 350,
                  "width": 372,
                  "height": 296,
                  "centerX": 261,
                  "centerY": 498,
                  "targetWidth": 372,
                  "targetHeight": 296,
                  "maxTargetHeight": 296,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 182.3,
                        "y": 381.1,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 298,
                        "centerY": 437.95,
                        "rotation": -6,
                        "fontSizePx": 105,
                        "fontSizePt": 105,
                        "lineHeight": 113.4,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 182.3,
                        "topY": 381.1,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 105,
                        "rotationOffset": -6,
                        "offsetY": -60.05,
                        "offsetX": 37,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  },
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 184.3,
                        "y": 502.2,
                        "width": 231.4,
                        "height": 113.7,
                        "centerX": 300,
                        "centerY": 559.05,
                        "rotation": 2,
                        "fontSizePx": 105,
                        "fontSizePt": 105,
                        "lineHeight": 113.4,
                        "letterSpacing": 0,
                        "lineHeightMultiplier": 1.08,
                        "color": "#d0011b",
                        "leftX": 184.3,
                        "topY": 502.2,
                        "baseHeight": 113.7,
                        "baseWidth": 231.4,
                        "baseFontSizePx": 105,
                        "rotationOffset": 2,
                        "offsetY": 61.05,
                        "offsetX": 39,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                        "disableContentScale": true
                  }
            ],
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "coordinateMode": "absolute",
            "disableAnchorSync": false,
            "disableContentScale": true,
      }
},
    "productLayouts": {},
    "positioningMode": "absolute",
    "lockToEditedJson": true,
    "followProduct": true,
    "disableAnchorSync": false,
    "disableContentScale": true,
    "priceDecisionRules": {
      "colorSource": "商品圖1檔名",
      "colorKeywords": [
        {
          "keyword": "VIP",
          "color": "#FF770F"
        },
        {
          "keyword": "商城",
          "color": "#D0011B"
        },
        {
          "keyword": "全站",
          "color": "#EE4D2D"
        }
      ],
      "priceCountRule": "商品圖1檔名包含「雙券」才使用兩個價格；其他皆為單一價格",
      "rotationOverrides": [
        {
          "productFilename": "免運車加商城券.png",
          "rotation": -8
        }
      ]
    }
  },

  // DDcard 最後排版收尾：Excel / 商品圖 / 價格都套完後，最後才處理 VIP → 蝦皮VIP_LOGO.svg。
  // 這裡是 DDcard 專屬規則，不會影響頭巾、HBN、POPUP、SKBN 等其他製作物。
  afterApplyRecordToTemplate({ template, record, diagnostics }) {
    applyDdCardVipTextLogoRule(template, record, diagnostics);
    ensureDdCardSubtitleFrame(template);
  }
};

  window.TemplateRuleRegistry?.register?.("ddcard", {
    family: "ddcard",
    label: "DD Card",
    priority: 10,
    tokens: ["ddcard", "ddc", "dd card"],
    targets: ["ddcard", "ddc", "dd card"],
    rules: RULES,
  });
})();