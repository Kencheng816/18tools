/* Seller Banner Rules
 * 支援 Excel「暖身BN(311發單)」的三列式合併儲存格區塊。
 * 公版分流與文案/票券解析集中於此檔，app.core.js 只提供通用自訂區塊解析接點。
 */
(function () {
  'use strict';

  const FAMILY = 'seller_bn';
  const BLOCK_NAME = 'Seller Banner';
  const SIDES = ['左', '中', '右'];


  const SELLER_TEXT_COLORS = Object.freeze({
    default: '#2b2b2b',
    highlight: '#d0011b',
  });

  // 越前面的規則優先權越高，避免「93折券」先被拆成「93折」。
  const SELLER_HIGHLIGHT_RULES = Object.freeze([
    Object.freeze({ pattern: /(?<![$\d,])\d{1,2}折券/g, color: SELLER_TEXT_COLORS.highlight }),
    Object.freeze({ pattern: /18%/g, color: SELLER_TEXT_COLORS.highlight }),
    Object.freeze({ pattern: /(?<![$\d,])\d{1,2}折(?!券)/g, color: SELLER_TEXT_COLORS.highlight }),
    // 「折」維持預設色，只標示後方金額，例如：折$200。
    Object.freeze({ pattern: /折(\$[\d,]+)/g, group: 1, color: SELLER_TEXT_COLORS.highlight }),
  ]);

  const TEMPLATE_REGISTRY = Object.freeze({
    'Mall+SV': Object.freeze({
      key: 'seller_bn_mall_sv',
      templateId: 'Seller BN_Mall+SV',
      templateFile: '02_Seller BN_Mall+SV.json',
      outputPrefix: 'Seller_BN_Mall_SV',
      assetPrefix: 'Seller BN_Mall+SV',
      ticketLayers: Object.freeze({
        左: ['小票券_VIP'],
        中: ['小票券_商城_2', '小票券_賣場'],
        右: ['小票券_商城'],
      }),
    }),
    Mall: Object.freeze({
      key: 'seller_bn_mall',
      templateId: 'Seller BN_Mall',
      templateFile: 'Seller BN_Mall.json',
      outputPrefix: 'Seller_BN_Mall',
      assetPrefix: 'Seller BN_Mall',
      ticketLayers: Object.freeze({ 左: ['小票券_VIP'], 中: ['小票券_商城'], 右: ['小票券_商城_2'] }),
    }),
    'C2C+SV': Object.freeze({
      key: 'seller_bn_c2c_sv',
      templateId: 'Seller BN_C2C+SV',
      templateFile: '02_Seller BN_C2C+SV.json',
      outputPrefix: 'Seller_BN_C2C_SV',
      assetPrefix: 'Seller BN_C2C+SV',
      ticketLayers: Object.freeze({ 左: ['小票券_VIP'], 中: ['小票券_賣場'], 右: ['小票券_全站'] }),
    }),
    C2C: Object.freeze({
      key: 'seller_bn_c2c',
      templateId: 'Seller BN_C2C',
      templateFile: 'Seller BN_C2C.json',
      outputPrefix: 'Seller_BN_C2C',
      assetPrefix: 'Seller BN_C2C',
      ticketLayers: Object.freeze({ 左: ['小票券_VIP'], 中: ['小票券_商城'], 右: ['小票券_全站'] }),
    }),
  });

  const clean = (value) => String(value == null ? '' : value).trim();
  const normalize = (value) => clean(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '');

  function exactVariant(value) {
    const raw = clean(value);
    return Object.prototype.hasOwnProperty.call(TEMPLATE_REGISTRY, raw) ? raw : '';
  }

  function findHeaderIndex(row, names) {
    const wanted = names.map(normalize);
    return (row || []).findIndex((cell) => wanted.includes(normalize(cell)));
  }

  function parseMainText(rawValue) {
    const lines = clean(rawValue).split(/\r\n?|\n/).map(clean).filter(Boolean);
    const result = {
      raw: clean(rawValue),
      mode: lines.length > 1 ? 'split' : 'single',
      top: lines[0] || '',
      bottom: lines[1] || '',
      showVipLogo: false,
      diagnostics: [],
    };

    if (lines.length > 2) {
      result.bottom = lines.slice(1).join(' ');
      result.diagnostics.push(`主文案超過兩行，第二行之後已合併：${result.raw}`);
    }

    // 僅在「日期 + VIP + 文案」格式成立時隱藏日期、以 Logo 取代 VIP。
    const special = result.top.match(/^\s*\d{1,2}\s*[\/.\-]\s*\d{1,2}\s*VIP\s*(.+)$/i);
    if (special) {
      result.top = clean(special[1]);
      result.showVipLogo = true;
      result.mode = result.bottom ? 'split' : 'single';
    }
    return result;
  }

  function parseTickets(rawValue) {
    return clean(rawValue)
      .split('+')
      .map(clean)
      .filter(Boolean);
  }

  function makeRecord(variant, rowIndex, headerMap, rows) {
    const row0 = rows[rowIndex] || [];
    const row1 = rows[rowIndex + 1] || [];
    const row2 = rows[rowIndex + 2] || [];
    const record = {
      '製作內容': BLOCK_NAME,
      '版配': variant,
      '宣傳案型': clean(row0[headerMap.promo]),
      CTA: clean(row0[headerMap.cta]),
      __sellerVariant: variant,
      __sellerSourceRow: rowIndex + 1,
      __sellerDiagnostics: [],
    };

    SIDES.forEach((side) => {
      const col = headerMap[side];
      const mainRaw = clean(row0[col]);
      const ticketRaw = clean(row1[col]);
      const supplement = clean(row2[col]);
      const parsedText = parseMainText(mainRaw);
      const tickets = parseTickets(ticketRaw);

      record[`${side}_文案原始`] = mainRaw;
      record[`${side}_文案_上`] = parsedText.top;
      record[`${side}_文案_下`] = parsedText.bottom;
      record[`${side}_文案模式`] = parsedText.mode;
      record[`${side}_顯示VIP_LOGO`] = parsedText.showVipLogo;
      record[`${side}_小票券`] = ticketRaw;
      record[`${side}_小票券清單`] = tickets;
      record[`${side}_補充說明`] = supplement;

      parsedText.diagnostics.forEach((message) => record.__sellerDiagnostics.push(`${side}欄：${message}`));
      if (tickets.length > 2) record.__sellerDiagnostics.push(`${side}欄票券超過兩張：${ticketRaw}`);
    });

    return record;
  }

  function parseSheetBlocks({ rows = [] } = {}) {
    const blocks = [];
    const warnings = [];
    const skippedRows = [];
    const handledProductNames = [];

    for (let headerRow = 0; headerRow < rows.length; headerRow += 1) {
      const header = rows[headerRow] || [];
      const productCol = findHeaderIndex(header, ['製作內容']);
      const quantityCol = findHeaderIndex(header, ['數量']);
      // Seller Banner 的實際版型值位於「版型」欄；「版配」可能只是上層合併標題。
      // 優先精準讀取「版型」，僅在舊工單沒有該欄時才回退「版配」。
      const explicitVariantCol = findHeaderIndex(header, ['版型']);
      const variantHeaderCol = explicitVariantCol >= 0
        ? explicitVariantCol
        : findHeaderIndex(header, ['版配']);
      const promoCol = findHeaderIndex(header, ['宣傳案型']);
      const leftCol = findHeaderIndex(header, ['左']);
      const centerCol = findHeaderIndex(header, ['中']);
      const rightCol = findHeaderIndex(header, ['右']);
      const ctaCol = findHeaderIndex(header, ['CTA']);

      const required = [productCol, variantHeaderCol, promoCol, leftCol, centerCol, rightCol, ctaCol];
      if (required.some((index) => index < 0)) continue;

      for (let productRow = headerRow + 1; productRow < Math.min(rows.length, headerRow + 20); productRow += 1) {
        const row = rows[productRow] || [];
        if (normalize(row[productCol]) !== normalize(BLOCK_NAME)) continue;

        handledProductNames.push(BLOCK_NAME);
        const quantity = quantityCol >= 0 ? Math.max(0, Math.floor(Number(row[quantityCol]) || 0)) : 0;
        const records = [];

        // 優先直接讀取明確的「版型」欄，避免被左側合併標題「版配」截斷。
        // 舊工單若只有「版配」而沒有「版型」，才在版配到下一個表頭之間搜尋。
        const nextHeaderBoundary = header.findIndex((cell, index) => index > variantHeaderCol && clean(cell));
        const variantEndCol = nextHeaderBoundary > variantHeaderCol ? nextHeaderBoundary : promoCol;
        const usesExplicitVariantColumn = explicitVariantCol >= 0;

        for (let r = productRow; r < rows.length && records.length < (quantity || 999); r += 1) {
          const current = rows[r] || [];
          let variant = usesExplicitVariantColumn ? exactVariant(current[variantHeaderCol]) : '';
          if (!variant && !usesExplicitVariantColumn) {
            for (let c = variantHeaderCol; c < variantEndCol; c += 1) {
              variant = exactVariant(current[c]);
              if (variant) break;
            }
          }
          if (!variant) {
            if (r > productRow && clean(current[productCol])) break;
            continue;
          }

          const headerMap = { promo: promoCol, 左: leftCol, 中: centerCol, 右: rightCol, cta: ctaCol };
          records.push(makeRecord(variant, r, headerMap, rows));
          r += 2; // 每個版型固定佔三列：主文案、票券、補充說明。
        }

        if (quantity && records.length !== quantity) {
          warnings.push(`第 ${productRow + 1} 列 Seller Banner 數量為 ${quantity}，實際解析到 ${records.length} 個版型區塊`);
        }
        if (!records.length) warnings.push(`第 ${productRow + 1} 列 Seller Banner 沒有解析到 Mall+SV／Mall／C2C+SV／C2C`);

        blocks.push({
          name: BLOCK_NAME,
          headerRow,
          startRow: productRow,
          quantity,
          records,
          templateType: FAMILY,
        });
        break;
      }
    }

    return { blocks, warnings, skippedRows, handledProductNames };
  }

  function getLayer(template, name) {
    return template?.layers?.[name] || null;
  }

  function setVisible(layer, visible) {
    if (!layer) return;
    layer.visible = !!visible;
    layer.hidden = !visible;
  }

  function setText(template, name, text, visible = true, options = {}) {
    const layer = getLayer(template, name);
    if (!layer) return false;
    const value = clean(text);
    layer.text = value;

    if (options.highlight === true && window.TextHighlightEngine?.buildRuns) {
      layer.color = SELLER_TEXT_COLORS.default;
      layer.richTextRuns = window.TextHighlightEngine.buildRuns(value, {
        defaultColor: SELLER_TEXT_COLORS.default,
        rules: SELLER_HIGHLIGHT_RULES,
      });
    } else {
      delete layer.richTextRuns;
    }

    setVisible(layer, visible && !!value);
    return true;
  }

  function setImage(template, name, filename, visible = true) {
    const layer = getLayer(template, name);
    if (!layer) return false;
    layer.type = 'image';
    layer.assetFilename = clean(filename);
    layer.src = clean(filename);
    layer.image = clean(filename);
    setVisible(layer, visible && !!clean(filename));
    return true;
  }

  function hideSideTextLayers(template, side) {
    [`${side}_文案`, `${side}_文案_上`, `${side}_文案_下`].forEach((name) => setVisible(getLayer(template, name), false));
  }

  function applySideText(template, record, side) {
    hideSideTextLayers(template, side);
    const mode = record[`${side}_文案模式`];
    const top = clean(record[`${side}_文案_上`]);
    const bottom = clean(record[`${side}_文案_下`]);
    const singleLayer = getLayer(template, `${side}_文案`);

    if (mode === 'single' && singleLayer) {
      setText(template, `${side}_文案`, top, true, { highlight: true });
      return;
    }
    setText(template, `${side}_文案_上`, top, true, { highlight: true });
    setText(template, `${side}_文案_下`, bottom, true, { highlight: true });
  }

  function applyTickets(template, record, config, side, diagnostics) {
    const targetLayers = config.ticketLayers?.[side] || [];
    targetLayers.forEach((layerName) => setVisible(getLayer(template, layerName), false));

    const tickets = Array.isArray(record[`${side}_小票券清單`]) ? record[`${side}_小票券清單`] : [];
    tickets.slice(0, targetLayers.length).forEach((ticket, index) => {
      const layerName = targetLayers[index];
      const filename = `${config.assetPrefix}_${ticket}.png`;
      if (!setImage(template, layerName, filename, true)) {
        diagnostics.push({ field: `${side}_小票券`, status: 'missing-layer', value: ticket, target: layerName });
      } else {
        diagnostics.push({ field: `${side}_小票券`, status: 'mapped', value: ticket, filename, target: layerName });
      }
    });

    if (tickets.length > targetLayers.length) {
      diagnostics.push({ field: `${side}_小票券`, status: 'overflow', value: tickets.join('+'), target: `最多 ${targetLayers.length} 張` });
    }
  }

  function applyRecord(template, record, diagnostics = []) {
    const variant = exactVariant(record?.__sellerVariant || record?.['版配']);
    const config = TEMPLATE_REGISTRY[variant];
    if (!config || !template) return template;

    setText(template, '宣傳案型', record['宣傳案型']);
    setText(template, 'CTA_文案', record.CTA || record['CTA']);

    SIDES.forEach((side) => {
      applySideText(template, record, side);
      setText(template, `${side}_補充說明`, record[`${side}_補充說明`]);
      applyTickets(template, record, config, side, diagnostics);
    });

    const showVipLogo = SIDES.some((side) => !!record[`${side}_顯示VIP_LOGO`]);
    setImage(template, '蝦皮VIP_LOGO_橘色', '蝦皮VIP_LOGO_橘色.svg', showVipLogo);

    (record.__sellerDiagnostics || []).forEach((message) => diagnostics.push({ field: 'Seller Banner', status: 'warning', value: message }));
    diagnostics.push({ field: 'Seller Banner', status: 'ok', value: variant, target: config.templateFile });
    return template;
  }

  function resolveRecordTemplateRoute({ block, record } = {}) {
    if (normalize(block?.name) !== normalize(BLOCK_NAME)) return null;
    const variant = exactVariant(record?.__sellerVariant || record?.['版配']);
    const config = TEMPLATE_REGISTRY[variant];
    if (!config) return null;
    return {
      key: config.key,
      family: FAMILY,
      label: `${BLOCK_NAME} ${variant}`,
      templateId: config.templateId,
      templateFile: config.templateFile,
      ruleFile: 'seller_bn.rules.js',
      outputPrefix: config.outputPrefix,
    };
  }

  const rule = {
    id: FAMILY,
    name: 'Seller Banner Rules',
    templateRegistry: TEMPLATE_REGISTRY,
    parseSheetBlocks,
    resolveRecordTemplateRoute,
    applyRecord,
    validate(record) {
      const variant = exactVariant(record?.__sellerVariant || record?.['版配']);
      const messages = [];
      if (!variant) messages.push('⚠ 未辨識 Seller Banner 版型');
      else messages.push(`✓ 版型：${variant}`);
      SIDES.forEach((side) => {
        if (!clean(record?.[`${side}_文案原始`])) messages.push(`⚠ ${side}欄缺少主文案`);
        if (!clean(record?.[`${side}_小票券`])) messages.push(`⚠ ${side}欄缺少小票券`);
        if (!clean(record?.[`${side}_補充說明`])) messages.push(`⚠ ${side}欄缺少補充說明`);
      });
      return messages;
    },
  };

  window.TemplateRules = window.TemplateRules || {};
  window.TemplateRules[FAMILY] = rule;
  window.TemplateRules[BLOCK_NAME] = rule;

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: BLOCK_NAME,
    priority: 95,
    tokens: ['Seller Banner', 'Seller BN'],
    targets: ['Seller Banner', 'Seller BN'],
    rules: {
      parseSheetBlocks,
      resolveRecordTemplateRoute,
      afterApplyRecordToTemplate({ template, record, diagnostics }) {
        applyRecord(template, record || {}, diagnostics || []);
      },
      validate: rule.validate,
      templateRegistry: TEMPLATE_REGISTRY,
    },
  });
})();
