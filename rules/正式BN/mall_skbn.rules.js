/* MALL SKBN template rules – three-column Mall SKBN layout. */
(function () {
  'use strict';

  const FAMILY = 'mall_skbn';
  const TEMPLATE_ID = '06_MALL_SKBN';
  const TEMPLATE_FILE = '06_MALL_SKBN.json';
  const TEMPLATE_ASSET_DIRS = Object.freeze(['06_Mall SKBN', '06_MALL_SKBN', '素材', 'assets/素材']);
  const BASE_LAYERS = Object.freeze({"18號會員日_LOGO":{"type":"image","psdName":"18號會員日_LOGO","x":921,"y":36,"width":201,"height":42,"centerX":1021.5,"centerY":57,"assetFilename":"MALL_SKBN_18號會員日_LOGO.png"},"18號會員日_LOGO_2":{"type":"image","psdName":"18號會員日_LOGO","x":482,"y":27,"width":236,"height":50,"centerX":600,"centerY":52,"assetFilename":"MALL_SKBN_18號會員日_LOGO.png"},"18號會員日_LOGO_3":{"type":"image","psdName":"18號會員日_LOGO","x":78,"y":36,"width":201,"height":42,"centerX":178.5,"centerY":57,"assetFilename":"MALL_SKBN_18號會員日_LOGO.png"},"文案_右":{"type":"text","psdName":"文案_右","x":943,"y":89,"width":157,"height":36,"centerX":1021.5,"centerY":107,"text":"商城95折","fontSizePt":37,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0,"textTransform":{"scaleX":0.5140617287614043,"scaleY":0.5132956556248396},"textStyleRanges":[{"from":0,"to":6,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0}],"dominantStyleSource":"textStyleRange"},"文案_中":{"type":"text","psdName":"文案_中","x":420,"y":85,"width":361,"height":45,"centerX":600.5,"centerY":107.5,"text":"全站大免運$99起","fontSizePt":46,"fontSizePx":46,"fontSizePtRaw":72.89372253417969,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFC00","lineHeight":55.2,"letterSpacing":0,"textTransform":{"scaleX":0.6319975301158655,"scaleY":0.6310557048386499},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":46,"fontSizePtRaw":72.89372253417969,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":55.2,"letterSpacing":0},{"from":5,"to":6,"fontSizePx":46,"fontSizePtRaw":72.89372253417969,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":55.2,"letterSpacing":0},{"from":6,"to":10,"fontSizePx":46,"fontSizePtRaw":72.89372253417969,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":55.2,"letterSpacing":0}],"dominantStyleSource":"textStyleRange-dominant"},"文案_左":{"type":"text","psdName":"文案_左","x":40,"y":89,"width":279,"height":36,"centerX":179.5,"centerY":107,"text":"商城滿千折$200","fontSizePt":37,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0,"textTransform":{"scaleX":0.5140617287614044,"scaleY":0.5132956556248396},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0},{"from":5,"to":6,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0},{"from":6,"to":10,"fontSizePx":37,"fontSizePtRaw":72.08321380615234,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFC00","lineHeight":44.4,"letterSpacing":0}],"dominantStyleSource":"textStyleRange-dominant"},"商品圖_左":{"type":"image","psdName":"商品圖_左","x":32.4,"y":139.4,"width":226.5,"height":176,"centerX":145.7,"centerY":227.4,"assetFilename":"MALL_SKBN_商品圖_左.png","targetWidth":226.5,"targetHeight":176,"maxTargetHeight":176,"sizingMode":"containByPBox","keepAspectRatio":true},"商品圖_中":{"type":"image","psdName":"商品圖_中","x":454,"y":142,"width":270,"height":204,"centerX":589,"centerY":244,"assetFilename":"MALL_SKBN_商品圖_中.png","targetWidth":270,"targetHeight":204,"maxTargetHeight":204,"sizingMode":"containByPBox","keepAspectRatio":true},"商品圖_右":{"type":"image","psdName":"商品圖_右","x":872.1,"y":139.4,"width":226.5,"height":176,"centerX":985.4,"centerY":227.4,"assetFilename":"MALL_SKBN_商品圖_右.png","targetWidth":226.5,"keepAspectRatio":true,"sizingMode":"containByPBox","targetHeight":176,"maxTargetHeight":176},"kv_bg":{"type":"image","psdName":"KV_BG","x":0,"y":0,"width":1200,"height":360,"centerX":600,"centerY":180,"assetFilename":"MALL_SKBN_KV_BG.png"}});
  const PRICE_LAYOUTS = Object.freeze({"doubleCoupon":[{"slot":"bottom","psdName":"價格1（下券）","positioningMode":"product-image-ratio","anchorRatioX":0.603801,"anchorRatioY":0.708641,"width":122.3,"height":59.7,"rotation":2,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":122.3,"baseHeight":59.7,"baseFontSizePx":51,"rotationOffset":2},{"slot":"top","psdName":"價格2（上券）","positioningMode":"product-image-ratio","anchorRatioX":0.589092,"anchorRatioY":0.289483,"width":115.5,"height":56.3,"rotation":-6,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":115.5,"baseHeight":56.3,"baseFontSizePx":51,"rotationOffset":-6}],"singleCoupon":[{"slot":"single","psdName":"價格","positioningMode":"product-image-ratio","anchorRatioX":0.5,"anchorRatioY":0.5,"width":130,"height":60,"rotation":0,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true}]});
  const PRICE_LAYOUTS_BY_COLUMN = Object.freeze({"left":{"doubleCoupon":[{"slot":"bottom","psdName":"價格1（下券）","positioningMode":"product-image-ratio","anchorRatioX":0.603801,"anchorRatioY":0.708641,"width":122.3,"height":59.7,"rotation":2,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":122.3,"baseHeight":59.7,"baseFontSizePx":51,"rotationOffset":2},{"slot":"top","psdName":"價格2（上券）","positioningMode":"product-image-ratio","anchorRatioX":0.589092,"anchorRatioY":0.289483,"width":115.5,"height":56.3,"rotation":-6,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":115.5,"baseHeight":56.3,"baseFontSizePx":51,"rotationOffset":-6}],"singleCoupon":[{"slot":"single","psdName":"價格","positioningMode":"product-image-ratio","anchorRatioX":0.5,"anchorRatioY":0.5,"width":130,"height":60,"rotation":0,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true}]},"middle":{"doubleCoupon":[{"slot":"bottom","psdName":"價格1（下券）","positioningMode":"product-image-ratio","anchorRatioX":0.603801,"anchorRatioY":0.708641,"width":122.3,"height":59.7,"rotation":2,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":122.3,"baseHeight":59.7,"baseFontSizePx":51,"rotationOffset":2},{"slot":"top","psdName":"價格2（上券）","positioningMode":"product-image-ratio","anchorRatioX":0.589092,"anchorRatioY":0.289483,"width":115.5,"height":56.3,"rotation":-6,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":115.5,"baseHeight":56.3,"baseFontSizePx":51,"rotationOffset":-6}],"singleCoupon":[{"slot":"single","psdName":"價格","positioningMode":"product-image-ratio","anchorRatioX":0.5,"anchorRatioY":0.5,"width":130,"height":60,"rotation":0,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true}]},"right":{"doubleCoupon":[{"slot":"bottom","psdName":"價格1（下券）","positioningMode":"product-image-ratio","anchorRatioX":0.602119,"anchorRatioY":0.714341,"width":122.3,"height":59.7,"rotation":2,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":122.3,"baseHeight":59.7,"baseFontSizePx":51,"rotationOffset":2},{"slot":"top","psdName":"價格2（上券）","positioningMode":"product-image-ratio","anchorRatioX":0.586976,"anchorRatioY":0.283784,"width":115.5,"height":56.3,"rotation":-6,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true,"baseWidth":115.5,"baseHeight":56.3,"baseFontSizePx":51,"rotationOffset":-6}],"singleCoupon":[{"slot":"single","psdName":"價格","positioningMode":"product-image-ratio","anchorRatioX":0.5,"anchorRatioY":0.5,"width":130,"height":60,"rotation":0,"fontSizePx":51,"lineHeight":55.08,"lineHeightMultiplier":1.08,"letterSpacing":0,"followProduct":true,"skipAutoScale":true,"preserveExactSize":true,"disableContentScale":true,"skipLocalStoragePreset":true}]}});
  const BASE_RENDER_ORDER = Object.freeze(["kv_bg","商品圖_右","商品圖_中","商品圖_左","文案_左","文案_中","文案_右","18號會員日_LOGO_3","18號會員日_LOGO_2","18號會員日_LOGO"]);
  const COLUMNS = Object.freeze([
    { key: 'left', label: '左', copyField: '文案_左', productField: '商品圖_左', layerName: '商品圖_左' },
    { key: 'middle', label: '中', copyField: '文案_中', productField: '商品圖_中', layerName: '商品圖_中' },
    { key: 'right', label: '右', copyField: '文案_右', productField: '商品圖_右', layerName: '商品圖_右' },
  ]);

  // 價格改由 core/app.core.js 的 Auto Price V2 共用引擎處理；本規則只處理文案與左/中/右商品圖。

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));

  function clone(value) {
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

  function syncTextRange(layer, text) {
    if (!layer || !Array.isArray(layer.textStyleRanges)) return;
    const length = String(text || '').length;
    layer.textStyleRanges.forEach((range) => {
      range.from = 0;
      range.to = length;
      range.color = layer.color || range.color || '#FFFFFF';
      range.fill = layer.color || range.fill || '#FFFFFF';
    });
  }

  function setHidden(layer, hidden, options = {}) {
    if (!layer) return;
    layer.hidden = Boolean(hidden);
    layer.visible = !layer.hidden;
    if (layer.hidden && options.clearText === true && layer.type === 'text') {
      layer.text = '';
      syncTextRange(layer, '');
    }
  }


  function removeAutoPriceLayers(template) {
    Object.entries(template?.layers || {}).forEach(([key, layer]) => {
      if (String(key).startsWith('__mall_skbn_price_') || layer?.source === 'mall_skbn_price') delete template.layers[key];
    });
    if (Array.isArray(template?.renderOrder)) {
      template.renderOrder = template.renderOrder.filter((key) => !String(key).startsWith('__mall_skbn_price_') && template.layers?.[key]?.source !== 'mall_skbn_price');
    }
  }

  function resetBaseLayers(template) {
    if (!template?.layers) return;
    Object.entries(BASE_LAYERS).forEach(([key, layer]) => {
      template.layers[key] = { ...clone(layer), ...(template.layers[key] || {}), ...clone(layer) };
    });
    removeAutoPriceLayers(template);
  }

  function resetRenderOrder(template) {
    const order = BASE_RENDER_ORDER.filter((key) => template.layers?.[key]);
    const priceSlotWeight = { top: 1, single: 2, bottom: 3 };

    COLUMNS.forEach((column) => {
      const columnPriceKeys = Object.keys(template.layers || {})
        .filter((key) => {
          const layer = template.layers[key];
          if (!layer) return false;

          // MALL SKBN 舊版自產價格：用 priceField 對應。
          if (layer.source === 'mall_skbn_price') {
            return layer.priceField === column.priceField;
          }

          // Auto Price V2 多組 Price Slot：用 anchor.layerKey 對應左 / 中 / 右商品圖。
          // 這是關鍵：afterApplyRecordToTemplate 會重排 renderOrder，
          // 若沒有把 auto_price_v2 插回來，畫面會只剩單一或沒有價格可見。
          if (layer.source === 'auto_price_v2') {
            return layer.anchor?.layerKey === column.layerName;
          }

          return false;
        })
        .sort((a, b) => {
          const layerA = template.layers[a] || {};
          const layerB = template.layers[b] || {};
          const slotA = priceSlotWeight[layerA.priceSlot || 'single'] || 99;
          const slotB = priceSlotWeight[layerB.priceSlot || 'single'] || 99;
          return slotA - slotB;
        });

      if (!columnPriceKeys.length) return;
      const productIndex = order.indexOf(column.layerName);
      const insertAt = productIndex >= 0 ? productIndex + 1 : order.length;
      order.splice(insertAt, 0, ...columnPriceKeys);
    });

    template.renderOrder = [...new Set(order)];
  }

  function withPng(value) {
    const clean = toText(value).replace(/\.(png|jpg|jpeg|webp)$/i, '');
    return clean ? `${clean}.png` : '';
  }

  function buildAssetCandidates(productName) {
    const filename = withPng(productName);
    if (!filename) return [];
    return [...new Set([
      filename,
      `MALL_SKBN_${filename}`,
      `Mall SKBN_${filename}`,
      ...TEMPLATE_ASSET_DIRS.map((dir) => `${dir}/${filename}`),
      ...TEMPLATE_ASSET_DIRS.map((dir) => `${dir}/MALL_SKBN_${filename}`),
      ...TEMPLATE_ASSET_DIRS.map((dir) => `${dir}/Mall SKBN_${filename}`),
    ])];
  }

  function setCopyLayer(template, column, record, diagnostics) {
    const layer = template.layers?.[column.copyField];
    if (!layer) return;
    const text = findRecordValue(record, [column.copyField, `文案${column.label}`]);
    layer.type = 'text';
    layer.text = text;
    layer.align = layer.align || 'center';
    layer.textAlign = layer.textAlign || layer.align;
    syncTextRange(layer, text);
    setHidden(layer, !text, { clearText: true });
    if (text) diagnostics?.push?.({ field: column.copyField, status: 'ok', value: text, target: column.copyField });
  }

  function setProductLayer(template, column, record, diagnostics) {
    const layer = template.layers?.[column.layerName];
    if (!layer) return null;
    const productName = findRecordValue(record, [column.productField, `商品圖${column.label}`, `商品圖_${column.label}`]);
    layer.type = 'image';
    layer.psdName = column.layerName;
    layer.keepAspectRatio = true;
    if (!productName) {
      setHidden(layer, true);
      return null;
    }
    const filename = withPng(productName);
    layer.assetFilename = filename;
    layer.assetCandidates = buildAssetCandidates(productName);
    layer.productName = productName;
    setHidden(layer, false);
    diagnostics?.push?.({ field: column.productField, status: 'ok', value: productName, target: filename });
    return { productName, layer };
  }

  function applyProgrammaticLayout(template, record = {}, diagnostics) {
    if (!template?.layers) return;
    resetBaseLayers(template);
    const productStates = {};
    COLUMNS.forEach((column) => {
      setCopyLayer(template, column, record, diagnostics);
      productStates[column.key] = setProductLayer(template, column, record, diagnostics);
    });
    resetRenderOrder(template);
  }

  function isMallSkbnBlock(blockName) {
    const key = normalize(blockName);
    return key === 'mallskbn' || key === '06mallskbn' || key === '06mallskbnjson';
  }

  const MallSkbnRules = {
    resolveRecordTemplateRoute({ block }) {
      if (!isMallSkbnBlock(block?.name)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'MALL SKBN',
        templateId: TEMPLATE_ID,
        templateFile: TEMPLATE_FILE,
        outputPrefix: 'MALL_SKBN',
      };
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'MALL SKBN',
    priority: 86,
    tokens: ['mall skbn', 'mall_skbn', '06_mall_skbn', '06_mall skbn'],
    targets: ['06_mall_skbn', '06_mall skbn', 'mall skbn', 'mall_skbn'],
    rules: {
      ...MallSkbnRules,
      priceRules: {
        enabled: true,
        customPairPrice: true,
        classifiers: [],
        mallLayouts: PRICE_LAYOUTS,
        columnLayouts: PRICE_LAYOUTS_BY_COLUMN,
      },
    },
  });
})();
