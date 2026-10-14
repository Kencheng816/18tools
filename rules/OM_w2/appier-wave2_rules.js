/* Appier Wave 2 rules
 * 專責解析「外廣_Wave2(急件)」的 Appier 區塊，並把 17 個尺寸路由到各自公版。
 * 共用價格、精確定位與刷新生命週期沿用 om_wave1_subtitle；Appier 特例不寫入 app.core.js。
 */
(function registerAppierWave2Rules() {
  'use strict';

  const FAMILY = 'appier_wave2';
  const BASE_FAMILY = 'om_wave1_subtitle';
  const MEDIA = 'Appier';
  const PROJECT = 'Appier';
  const VERTICAL_TEMPLATE_ID = 'Appier_160x600';
  const VERTICAL_CORNER_RADIUS = 11.82;
  const VERTICAL_NEAR_WIDTH_THRESHOLD = 10;
  const VERTICAL_HORIZONTAL_PADDING = 5;
  const U = window.TemplateRuleUtils;
  const registry = window.TemplateRuleRegistry;
  const baseRules = registry?.getRules?.(BASE_FAMILY) || {};
  const baseSubtitleLayout = window.OMWave1SubtitleLayout;

  const SIZES = Object.freeze([
    '600x1200',
    '640x960',
    '600x500',
    '672x560',
    '1200x627',
    '960x640',
    '2048x1536',
    '640x100',
    '640x200',
    '1536x2048',
    '160x600',
    '300x600',
    '320x480',
    '320x50',
    '336x280',
    '480x320',
    '970x250',
  ]);
  const TARGETS = Object.freeze(SIZES.map((size) => `Appier_${size}`));
  const TARGET_SET = new Set(TARGETS);

  function clean(value) {
    return String(value ?? '').trim();
  }

  function nonNegativeNumber(value, fallback) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return fallback;
    return Math.max(0, Number(value));
  }

  function normalizeSize(value) {
    return clean(value).toLowerCase().replace(/[×＊*]/g, 'x').replace(/\s+/g, '');
  }

  function normalized(value) {
    return clean(value).toLowerCase().replace(/[\s_\-()（）\[\]【】.]+/g, '');
  }

  function findHeader(row) {
    const cells = Array.isArray(row) ? row : [];
    const find = (predicate) => cells.findIndex((value) => predicate(clean(value)));
    const mediaCol = find((value) => value === '曝光媒體');
    const kSpecCol = find((value) => value === 'K數');
    const layoutCol = find((value) => /layout\s*no\.?/i.test(value));
    const sizeCol = find((value) => value === '尺寸' || value.includes('所有尺寸'));
    const outputCol = find((value) => value.includes('檔案命名'));
    const contentCol = find((value) => value === '內容' || value === '素材內容');
    if ([mediaCol, kSpecCol, layoutCol, sizeCol, outputCol, contentCol].some((column) => column < 0)) return null;
    return { mediaCol, kSpecCol, layoutCol, sizeCol, outputCol, contentCol };
  }

  function parseContentCell(value) {
    const record = {};
    clean(value).split(/\r?\n/).forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || /^※/.test(line)) return;
      const match = line.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
      if (!match) return;
      const label = match[1].trim();
      const text = match[2].trim();
      if (!text) return;
      if (/^主標(?:題)?$/.test(label)) record['主標'] = text;
      else if (/^副標(?:題)?$/.test(label)) record['副標'] = text;
      else if (/警語|法務/.test(label)) record['警語'] = text;
      else if (/Icon\s*\/\s*曝品|曝品|商品圖/.test(label)) record['商品圖1'] = text;
    });
    return record;
  }

  function parseAppierSheet({ rows }) {
    const headerRows = [];
    (rows || []).forEach((row, index) => {
      const header = findHeader(row);
      if (header) headerRows.push({ index, header });
    });
    if (!headerRows.length) return null;

    const blocks = [];
    const warnings = [];
    const skippedRows = [];

    headerRows.forEach(({ index: headerRow, header }, headerIndex) => {
      const endRow = headerIndex + 1 < headerRows.length ? headerRows[headerIndex + 1].index : rows.length;
      let media = '';
      let layoutNo = '';
      let kSpec = '';
      let inheritedContent = '';

      for (let rowIndex = headerRow + 1; rowIndex < endRow; rowIndex += 1) {
        const row = rows[rowIndex] || [];
        const nextMedia = clean(row[header.mediaCol]);
        if (nextMedia) media = nextMedia;
        const nextLayout = clean(row[header.layoutCol]);
        if (nextLayout) layoutNo = nextLayout;
        const nextKSpec = clean(row[header.kSpecCol]);
        if (nextKSpec) kSpec = nextKSpec;
        const nextContent = clean(row[header.contentCol]);
        if (nextContent) inheritedContent = nextContent;

        if (normalized(media) !== normalized(MEDIA)) continue;

        const size = normalizeSize(row[header.sizeCol]);
        if (!size) continue;
        const templateId = `Appier_${size}`;
        const rawOutputName = clean(row[header.outputCol]);
        const outputName = rawOutputName || `Appier_${layoutNo}_${size}`;

        if (!TARGET_SET.has(templateId)) {
          skippedRows.push({ row: rowIndex + 1, name: outputName, reason: `Appier 尺寸 ${size} 沒有對應公版` });
          continue;
        }

        const contentRecord = parseContentCell(nextContent || inheritedContent);
        if (!Object.keys(contentRecord).length) {
          skippedRows.push({ row: rowIndex + 1, name: outputName, reason: '內容欄讀不到副標題／警語／Icon/曝品' });
          continue;
        }

        const record = {
          ...contentRecord,
          __sourceRow: rowIndex + 1,
          __media: MEDIA,
          __layoutNo: layoutNo,
          __size: size,
          __kSpec: kSpec,
          __outputName: outputName,
          __templateId: templateId,
          __project: PROJECT,
          版位: MEDIA,
        };
        blocks.push({
          name: templateId,
          headerRow,
          startRow: rowIndex,
          quantity: 1,
          records: [record],
          colMap: {},
          templateType: 'appier-wave2',
        });
      }
    });

    if (!blocks.length) return null;
    if (blocks.length !== TARGETS.length) {
      warnings.push(`Appier 預期 ${TARGETS.length} 個尺寸，實際解析 ${blocks.length} 個。`);
    }
    return { blocks, anchorCount: headerRows.length, warnings, skippedRows };
  }

  function findLayerEntries(template, predicate) {
    return Object.entries(template?.layers || {}).filter(([key, layer]) => predicate(key, layer));
  }

  function setCommonLogoAssets(template) {
    const assetsByName = {
      '蝦皮購物_LOGO_白': '蝦皮購物_LOGO_白.svg',
      '18號會員日_LOGO_白': '18號會員日_LOGO_白.svg',
      '直式_18號會員日_LOGO_白': '直式_18號會員日_LOGO_白.svg',
      '蝦皮購物18號會員日_LOGO_白': '蝦皮購物18號會員日_LOGO_白.svg',
      '蝦皮直營_LOGO': '蝦皮直營_LOGO.svg',
    };
    findLayerEntries(template, (_key, layer) => layer?.type === 'image').forEach(([_key, layer]) => {
      const filename = assetsByName[clean(layer.psdName)];
      if (!filename) return;
      layer.assetFilename = filename;
      layer.keepAspectRatio = true;
    });
  }

  function beforeApplyRecordToTemplate(context) {
    baseRules.beforeApplyRecordToTemplate?.(context);
    const { template, record } = context;
    const canvasSize = template?.canvas?.width && template?.canvas?.height
      ? `${template.canvas.width}x${template.canvas.height}`
      : '';
    const size = normalizeSize(record?.__size || canvasSize);
    record.__project = PROJECT;
    template.batchProject = PROJECT;
    setCommonLogoAssets(template);

    const kvEntry = findLayerEntries(template, (key, layer) => (
      layer?.type === 'image' && /kv.?bg/i.test(`${key} ${layer.psdName || ''}`)
    ))[0];
    if (kvEntry && size) {
      kvEntry[1].assetFilename = `Appier_${size}_KV_BG.png`;
      kvEntry[1].assetProject = PROJECT;
    }
  }

  function getSubtitleLayers(template) {
    const textEntries = findLayerEntries(template, (_key, layer) => layer?.type === 'text');
    const byPsdName = (name) => textEntries.filter(([_key, layer]) => clean(layer.psdName) === name);
    return {
      centered: byPsdName('副標題').find(([_key, layer]) => clean(layer.align).toLowerCase() !== 'left')?.[1] || null,
      right: byPsdName('副標題_右')[0]?.[1]
        || byPsdName('副標題').find(([_key, layer]) => clean(layer.align).toLowerCase() === 'left')?.[1]
        || null,
      lower: byPsdName('副標題_下')[0]?.[1] || null,
      directLogo: findLayerEntries(template, (_key, layer) => clean(layer?.psdName) === '蝦皮直營_LOGO')[0]?.[1] || null,
      campaignLogoVertical: findLayerEntries(template, (_key, layer) => clean(layer?.psdName) === '直式_18號會員日_LOGO_白')[0]?.[1] || null,
      background: findLayerEntries(template, (_key, layer) => clean(layer?.psdName) === '副標題_BG')[0]?.[1] || null,
      noSubtitle: findLayerEntries(template, (key, layer) => clean(layer?.psdName || key) === 'T-無副標')[0]?.[1] || null,
    };
  }

  function templateIdOf(template, record) {
    return clean(
      record?.__templateId
      || template?.sheetTemplateRoute?.sourceTemplateId
      || template?.canvas?.templateId
      || template?.templateId
    );
  }

  function getSubtitleCapsuleLayout(template) {
    const layout = template?.subtitleCapsuleLayout;
    if (!layout || Number(layout.schemaVersion) !== 1) return null;
    return layout;
  }

  function resolveLayoutCenterX(template, layout) {
    const center = layout?.center;
    if (!center || typeof center !== 'object') return null;
    if (clean(center.mode) === 'fixed'
      && center.x !== null
      && center.x !== undefined
      && Number.isFinite(Number(center.x))) {
      return Number(center.x);
    }
    if (clean(center.mode) !== 'layer') return null;
    const layerName = clean(center.layerName);
    if (!layerName) return null;
    const target = findLayerEntries(template, (_key, layer) => clean(layer?.psdName) === layerName)[0]?.[1];
    if (!target) return null;
    return Number(target.centerX ?? (Number(target.x || 0) + Number(target.width || 0) / 2));
  }

  function resolveSubtitleCapsuleRule({ template, variantType }) {
    const layout = getSubtitleCapsuleLayout(template);
    if (!layout) return null;
    const padding = nonNegativeNumber(layout.horizontalPaddingPx, 25);
    const tolerance = nonNegativeNumber(layout.tolerancePx, -1);
    const rule = {
      padding,
      threshold: tolerance,
      thresholdPadding: padding,
    };
    if (Object.prototype.hasOwnProperty.call(layout, 'comparisonLayer')) {
      rule.comparisonLayer = layout.comparisonLayer;
    }
    if (clean(variantType) === 'direct') {
      const contentGap = nonNegativeNumber(layout.directContentGapPx, null);
      if (contentGap !== null) rule.contentGap = contentGap;
    }
    const centerX = resolveLayoutCenterX(template, layout);
    if (centerX !== null) rule.centerX = centerX;
    return rule;
  }

  function withTemporaryLayerAliases(template, aliases, callback) {
    const layers = template?.layers || {};
    const snapshots = Object.entries(aliases)
      .filter(([_alias, layer]) => Boolean(layer))
      .map(([alias, layer]) => ({
        alias,
        layer,
        existed: Object.prototype.hasOwnProperty.call(layers, alias),
        previous: layers[alias],
      }));

    snapshots.forEach(({ alias, layer }) => { layers[alias] = layer; });
    try {
      return callback();
    } finally {
      snapshots.forEach(({ alias, existed, previous }) => {
        if (existed) layers[alias] = previous;
        else delete layers[alias];
      });
    }
  }

  function applyV38SubtitleRules(context) {
    const { template } = context;
    const layers = getSubtitleLayers(template);
    if (layers.noSubtitle) layers.noSubtitle.hidden = true;

    // Appier 的視覺圖層名稱與 V3.8 不同；暫時建立名稱別名，直接執行同一份
    // om_wave1_subtitle after hook，避免複製文字量測、padding 與膠囊計算公式。
    return withTemporaryLayerAliases(template, {
      '蝦皮直營_副標題_右': layers.right,
      '蝦皮直營_副標題_BG': layers.background,
    }, () => baseRules.afterApplyRecordToTemplate?.(context));
  }

  function resolveVerticalBackgroundWidth(contentWidth, campaignWidth, options = {}) {
    const widestContent = Math.max(1, Number(contentWidth || 0));
    const verticalCampaign = Math.max(0, Number(campaignWidth || 0));
    const tolerance = nonNegativeNumber(options.tolerancePx, VERTICAL_NEAR_WIDTH_THRESHOLD);
    const padding = nonNegativeNumber(options.horizontalPaddingPx, VERTICAL_HORIZONTAL_PADDING);
    const difference = verticalCampaign - widestContent;
    if (difference > 0 && difference <= tolerance) {
      return widestContent + padding * 2;
    }
    return Math.max(widestContent, verticalCampaign);
  }

  function applyVerticalSubtitleRules({ template, record, diagnostics, helpers }) {
    const raw = clean(record?.['副標'] ?? record?.['副標題']);
    if (!raw) return false;

    const layers = getSubtitleLayers(template);
    const { centered, right, lower, directLogo, campaignLogoVertical, background, noSubtitle } = layers;
    [...new Set([centered, right, lower].filter(Boolean))].forEach((layer) => { layer.hidden = true; });
    if (directLogo) directLogo.hidden = true;
    if (noSubtitle) noSubtitle.hidden = true;
    if (!lower || !background) return false;

    const variant = U.resolveSubtitleVariant(raw);
    const isDirect = variant.type === 'direct';
    lower.text = isDirect ? (variant.suffix || raw) : raw;
    lower.hidden = false;

    if (isDirect && directLogo) {
      directLogo.assetFilename = '蝦皮直營_LOGO.svg';
      directLogo.keepAspectRatio = true;
      directLogo.hidden = false;
    }

    const layout = getSubtitleCapsuleLayout(template);
    const configuredCenterX = resolveLayoutCenterX(template, layout);
    const measuredTextWidth = Math.max(1, Number(helpers?.measureTextWidth?.(lower) || lower.width || 1));
    const centerX = configuredCenterX !== null
      ? configuredCenterX
      : Number.isFinite(Number(background.centerX))
        ? Number(background.centerX)
        : Number(template?.canvas?.width || 0) / 2;
    lower.__measuredContentWidth = measuredTextWidth;
    lower.width = measuredTextWidth;
    lower.x = centerX - measuredTextWidth / 2;
    lower.centerX = centerX;

    const directLogoWidth = Math.max(0, Number(directLogo?.width || 0));
    const contentWidth = Math.max(directLogoWidth, measuredTextWidth);
    const comparisonLayerName = Object.prototype.hasOwnProperty.call(layout || {}, 'comparisonLayer')
      ? clean(layout.comparisonLayer)
      : '直式_18號會員日_LOGO_白';
    const comparisonLayer = comparisonLayerName
      ? findLayerEntries(template, (_key, layer) => clean(layer?.psdName) === comparisonLayerName)[0]?.[1]
      : null;
    const campaignWidth = Math.max(0, Number(comparisonLayer?.width || campaignLogoVertical?.width || 0));
    const tolerancePx = nonNegativeNumber(layout?.tolerancePx, VERTICAL_NEAR_WIDTH_THRESHOLD);
    const horizontalPaddingPx = nonNegativeNumber(layout?.horizontalPaddingPx, VERTICAL_HORIZONTAL_PADDING);
    const backgroundWidth = resolveVerticalBackgroundWidth(contentWidth, campaignWidth, {
      tolerancePx,
      horizontalPaddingPx,
    });
    U.resizeCapsuleLayer(background, {
      width: backgroundWidth,
      centerX,
      cornerRadius: VERTICAL_CORNER_RADIUS,
    });

    diagnostics?.push?.({
      field: '副標',
      status: 'ok',
      value: raw,
      target: `appier:${variant.type}:160x600`,
      measuredTextWidth,
      directLogoWidth,
      campaignWidth,
      backgroundWidth,
      tolerancePx,
      horizontalPaddingPx,
    });
    return true;
  }

  function isAppierTemplate(template) {
    const family = clean(template?.ruleFamily || template?.sheetTemplateRoute?.family);
    return family === FAMILY || TARGET_SET.has(templateIdOf(template));
  }

  function makeManualSubtitleHelpers() {
    const canvasContext = document.createElement('canvas').getContext('2d');
    return {
      measureTextWidth: (layer) => (
        window.CapsuleRuleEngine?.measureTextWidth?.(layer, canvasContext)
        || Number(layer?.width || 0)
      ),
    };
  }

  function refreshAppierSubtitleLayout(template) {
    if (!isAppierTemplate(template)) return baseSubtitleLayout?.refresh?.(template) || false;

    const layers = getSubtitleLayers(template);
    if (layers.noSubtitle) layers.noSubtitle.hidden = true;
    if (templateIdOf(template) !== VERTICAL_TEMPLATE_ID) {
      return withTemporaryLayerAliases(template, {
        '蝦皮直營_副標題_右': layers.right,
        '蝦皮直營_副標題_BG': layers.background,
      }, () => baseSubtitleLayout?.refresh?.(template) || false);
    }

    // Inspector 的文字／字級操作會直接觸發 OMWave1SubtitleLayout.refresh；160x600
    // 必須依畫面當下的文字重算，不能回讀 batchRecord 把使用者剛改的內容蓋回去。
    const visibleText = [layers.lower, layers.right, layers.centered]
      .find((layer) => layer && layer.hidden !== true);
    const fallbackRaw = clean(template?.batchRecord?.['副標'] ?? template?.batchRecord?.['副標題']);
    const currentText = visibleText ? clean(visibleText.text) : '';
    const directVisible = Boolean(layers.directLogo && layers.directLogo.hidden !== true);
    const raw = visibleText
      ? `${directVisible ? '蝦皮直營' : ''}${currentText}`
      : fallbackRaw;
    if (!raw) return false;

    return applyVerticalSubtitleRules({
      template,
      record: { 副標: raw, __templateId: VERTICAL_TEMPLATE_ID },
      diagnostics: [],
      helpers: makeManualSubtitleHelpers(),
    });
  }

  function afterApplyRecordToTemplate(context) {
    if (templateIdOf(context.template, context.record) !== VERTICAL_TEMPLATE_ID) {
      return applyV38SubtitleRules(context);
    }

    // 160x600 是上下堆疊版型，不可使用 V3.8 左右並排的 logo + 副標計算。
    // 共用 hook 只保留 assetPlacementPresets 生命週期，副標由獨立規則處理。
    const placementRecord = { ...(context.record || {}), 副標: '', 副標題: '' };
    baseRules.afterApplyRecordToTemplate?.({ ...context, record: placementRecord });
    return applyVerticalSubtitleRules(context);
  }

  function resolveRecordTemplateRoute({ record }) {
    const templateId = clean(record?.__templateId);
    if (!TARGET_SET.has(templateId)) return null;
    return {
      key: FAMILY,
      family: FAMILY,
      label: templateId,
      templateId,
      templateFile: `${templateId}.json`,
      outputName: clean(record.__outputName),
      outputPrefix: MEDIA,
      ruleFile: 'rules/appier-wave2_rules.js',
    };
  }

  registry.register(FAMILY, {
    label: 'Appier Wave 2',
    priority: 200,
    targets: TARGETS,
    tokens: [MEDIA, ...TARGETS],
    sheetParser: parseAppierSheet,
    rules: {
      ...baseRules,
      beforeApplyRecordToTemplate,
      afterApplyRecordToTemplate,
      resolveRecordTemplateRoute,
      resolveSubtitleCapsuleRule,
    },
  });

  // V3.8 的 Inspector 事件固定呼叫這個全域入口。Appier 在此只做家族分流：
  // 一般尺寸仍執行原 V3.8 refresh，160x600 才走獨立垂直規則。
  if (typeof baseSubtitleLayout?.refresh === 'function') {
    window.OMWave1SubtitleLayout = Object.freeze({ refresh: refreshAppierSubtitleLayout });
  }
})();
