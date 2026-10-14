/* 跨夜直播宣傳圖：工單解析、模板分流與套版規則。 */
(function registerCrossnightLivePromoRules() {
  'use strict';

  const FAMILY = 'crossnight_live_promo';
  const PNG_TEMPLATE_IDS = new Set([
    'Floating icon',
    'Game BN',
    'OA_MSBN BAU',
    'OA_MSBN DD',
    'POPUP',
    '直播間POPUP',
    '首頁A1 Floating icon',
  ]);

  const HOST_MASK_TEMPLATE_IDS = new Set([
    'OA_MSBN DD',
    'OA_MSBN BAU',
    'POPUP',
    '直播間POPUP',
    'Game BN',
  ]);

  const CUSTOM_HOST_MASK_CORNER_TEMPLATE_IDS = new Set([
    'OA_MSBN DD',
    'OA_MSBN BAU',
  ]);

  const CENTERED_HOST_META_TEMPLATE_IDS = new Set([
    'IG',
    '開播字卡_1080x1920',
  ]);

  const OA_HOST_MASK_CORNER_RADII = Object.freeze({
    topLeft: 30,
    topRight: 30,
    bottomRight: 0,
    bottomLeft: 0,
  });

  const OA_TITLE_BACKGROUND_TEMPLATE_IDS = new Set([
    'OA_MSBN DD',
    'OA_MSBN BAU',
  ]);

  const OA_TITLE_BACKGROUND_PADDING_PX = 35;
  const OA_TITLE_BACKGROUND_CORNER_RADII = Object.freeze({
    topLeft: 0,
    topRight: 0,
    bottomRight: 50,
    bottomLeft: 50,
  });

  const HOST_DROP_SHADOW = Object.freeze({
    enabled: true,
    color: '#ab2222',
    blendMode: 'multiply',
    opacity: 1,
    angleDeg: 57,
    distancePx: 15,
    spreadPx: 0,
    blurPx: 40,
  });

  const text = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n?/g, '\n')
    .trim();

  const normalize = (value) => text(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');

  const normalizeHeader = (value) => text(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s_\-()（）【】\[\]：:]+/g, '');

  const splitNonEmptyLines = (value) => text(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const compactLine = (value) => text(value).replace(/[\s\u00a0\u3000]+/g, '');
  const characterCount = (value) => Array.from(compactLine(value)).length;

  function parseDimensions(value) {
    const match = text(value).normalize('NFKC').match(/(\d{2,4})\s*(?:px)?\s*[x×＊*]\s*(\d{2,4})\s*(?:px)?/i);
    if (!match) return null;
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    return { width, height, label: `${width}x${height}` };
  }

  function parseKLimit(value) {
    const raw = text(value).normalize('NFKC');
    if (!raw || /^x$/i.test(raw)) return null;
    if (parseDimensions(raw)) return null;
    const match = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const kiloBytes = Number(match[1]);
    return Number.isFinite(kiloBytes) && kiloBytes > 0 ? Math.floor(kiloBytes * 1000) : null;
  }

  function parseHosts(value) {
    return text(value)
      .split(/[、,，;；]+/)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  function stripLogoHint(line) {
    const value = text(line);
    return /^[\[【].*logo.*[\]】]$/i.test(value) ? '' : value;
  }

  function stripCtaArrow(value) {
    const cleaned = text(value).replace(/[\s▸▶►>]+$/g, '').trim();
    return /^x$/i.test(cleaned) ? '' : cleaned;
  }

  function parseStandardCopy(rawCopy) {
    const result = { 主標: '', 副標: '', 時間: '', hosts: [] };
    splitNonEmptyLines(rawCopy).forEach((line) => {
      if (!stripLogoHint(line)) return;
      const match = line.match(/^\s*(主標題?|副標題?|時間|主持人)\s*[:：]\s*(.*)$/i);
      if (!match) return;
      const label = normalizeHeader(match[1]);
      const value = text(match[2]);
      if (label === normalizeHeader('主標') || label === normalizeHeader('主標題')) result.主標 = value;
      else if (label === normalizeHeader('副標') || label === normalizeHeader('副標題')) result.副標 = value;
      else if (label === normalizeHeader('時間')) result.時間 = value;
      else if (label === normalizeHeader('主持人')) result.hosts = parseHosts(value);
    });
    return result;
  }

  function parseOaDdCopy(rawCopy) {
    const lines = splitNonEmptyLines(rawCopy).filter((line) => stripLogoHint(line));
    const hostLineIndex = lines.findIndex((line) => /^\s*主持人\s*[:：]/.test(line));
    const hosts = hostLineIndex >= 0
      ? parseHosts(lines[hostLineIndex].replace(/^\s*主持人\s*[:：]\s*/, ''))
      : [];
    const contentLines = lines.filter((_, index) => index !== hostLineIndex);
    return {
      主標: text(contentLines[0]),
      副標: text(contentLines[1]),
      時間: text(contentLines[2]),
      hosts,
    };
  }

  function routeFor(position, dimensions) {
    const key = normalize(position);
    const size = dimensions?.label || '';
    const route = (templateId, outputPrefix, extra = {}) => ({
      key: FAMILY,
      family: FAMILY,
      label: position,
      templateId,
      templateFile: `${templateId}.json`,
      outputPrefix,
      ...extra,
    });

    if (key.includes(normalize('OA MSBN')) && key.includes(normalize('BAU版'))) {
      return route('OA_MSBN BAU', '01.OA_MSBN_BAU');
    }
    if (key.includes(normalize('OA MSBN')) && key.includes(normalize('DD版'))) {
      return route('OA_MSBN DD', '01.OA_MSBN_DD');
    }
    if (key.includes(normalize('01.MSBN')) || key === normalize('MSBN')) {
      return route('MSBN', '01.MSBN_輪播');
    }
    if (key.includes(normalize('02.HBN')) || key === normalize('HBN')) {
      if (size === '531x792') return route('DD Banner Card', '02.HBN');
      if (size === '1200x360') return route('HBN', '02.HBN');
      return null;
    }
    if (key.includes(normalize('直播大廳 LP BN'))) {
      const showImmediateCta = key.includes(normalize('立即看'));
      return route('直播大廳_LPBN', showImmediateCta ? '03.直播大廳_LP_BN_立即看' : '03.直播大廳_LP_BN', { showImmediateCta });
    }
    if (key.includes(normalize('04.直播時縮圖'))) return route('直播時縮圖', '04.直播時縮圖');
    if (key.includes(normalize('5.PN/AR')) || key.includes(normalize('PN/AR'))) return route('AR', '5.PN_AR');
    if (key.includes(normalize('06.GAME BN')) || key.includes(normalize('GAME BN'))) return route('Game BN', '06.GAME_BN');
    if (key.includes(normalize('08.coins page')) && key.includes(normalize('BAU'))) return route('Coin page BN_BAU', '08.coins_page_BAU');
    if (key.includes(normalize('08.coins page')) || key.includes(normalize('coins page'))) return route('Coin page BN', '08.coins_page');
    if (key.includes(normalize('09.POPUP')) || key === normalize('POPUP')) {
      if (size === '580x720') return route('POPUP', '09.POPUP');
      if (size === '870x1160') return route('直播間POPUP', '09.POPUP');
      return null;
    }
    if (key.includes(normalize('10.Floating Icon')) || key.includes(normalize('Floating Icon'))) {
      if (size === '336x120') return route('Floating icon', '10.Floating_Icon');
      if (size === '360x360') return route('首頁A1 Floating icon', '10.Floating_Icon');
      return null;
    }
    if (key.includes(normalize('11.IG')) || key === normalize('IG')) return route('IG', '11.IG');
    if (key.includes(normalize('12.開播字卡')) || key.includes(normalize('開播字卡'))) return route('開播字卡_1080x1920', '12.開播字卡');
    if (key.includes(normalize('13.FB POST')) || key.includes(normalize('FB POST'))) return route('FB POST', '13.FB_POST');
    return null;
  }

  function fallbackDimensions(position) {
    const key = normalize(position);
    if (key.includes(normalize('11.IG')) || key === normalize('IG')) return { width: 900, height: 1600, label: '900x1600' };
    if (key.includes(normalize('12.開播字卡'))) return { width: 1080, height: 1920, label: '1080x1920' };
    return null;
  }

  function findHeader(rows) {
    const aliases = {
      position: new Set(['位置', '使用位置'].map(normalizeHeader)),
      kLimit: new Set(['k數', 'k数', '容量', '檔案大小'].map(normalizeHeader)),
      size: new Set(['尺寸', 'size'].map(normalizeHeader)),
      copy: new Set(['文案', '文字'].map(normalizeHeader)),
      cta: new Set(['cta', '按鈕'].map(normalizeHeader)),
      note: new Set(['備註', '說明'].map(normalizeHeader)),
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      const columnMap = {};
      row.forEach((cell, columnIndex) => {
        const normalized = normalizeHeader(cell);
        if (!normalized) return;
        Object.entries(aliases).forEach(([field, values]) => {
          if (columnMap[field] === undefined && values.has(normalized)) columnMap[field] = columnIndex;
        });
      });
      const hasRequired = columnMap.position !== undefined && columnMap.copy !== undefined;
      const hasSupporting = columnMap.kLimit !== undefined || columnMap.size !== undefined || columnMap.cta !== undefined;
      if (hasRequired && hasSupporting) return { rowIndex, columnMap };
    }
    return null;
  }

  function buildRecord({ row, rowIndex, position, dimensions, kLimitRaw, rawCopy, rawCta, route }) {
    const record = {
      主標: '',
      副標: '',
      文案: '',
      CTA: stripCtaArrow(rawCta),
      版位: position,
      __workflow: 'crossnight-live-promo',
      __rawCopy: text(rawCopy),
      __sourceRow: rowIndex + 1,
      __position: position,
      __width: dimensions.width,
      __height: dimensions.height,
      __size: dimensions.label,
      __kLimitBytes: parseKLimit(kLimitRaw),
      __route: route,
      __templateId: route.templateId,
      __showImmediateCta: route.showImmediateCta === true,
      __specFormat: PNG_TEMPLATE_IDS.has(route.templateId) ? 'png' : 'jpg',
      __ctaMode: 'text',
      __sourceCells: row,
    };

    const positionKey = normalize(position);
    if (route.templateId === 'AR') {
      const lines = splitNonEmptyLines(rawCopy).map(compactLine);
      record.__copyLines = lines;
      record.__arLayout = `${characterCount(lines[0])}/${characterCount(lines[1])}`;
      return record;
    }

    if (route.templateId === 'Floating icon' || route.templateId === '首頁A1 Floating icon') {
      record.__copyLines = splitNonEmptyLines(rawCopy).map(compactLine);
      record.__compactCopy = record.__copyLines.join('');
      return record;
    }

    const parsed = positionKey.includes(normalize('OA MSBN')) && positionKey.includes(normalize('DD版'))
      ? parseOaDdCopy(rawCopy)
      : parseStandardCopy(rawCopy);
    record.主標 = parsed.主標;
    record.副標 = parsed.副標;
    record.時間 = parsed.時間;
    record.__hosts = parsed.hosts;

    if (route.templateId === 'Game BN') record.CTA = '';
    return record;
  }

  function parseSheet({ rows }) {
    const header = findHeader(rows || []);
    if (!header) return null;

    const { rowIndex: headerRow, columnMap } = header;
    const blocks = [];
    const warnings = [];
    const skippedRows = [];
    const counters = new Map();
    const lastSizeByPosition = new Map();
    let currentPosition = '';

    for (let rowIndex = headerRow + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      const explicitPosition = text(row[columnMap.position]);
      if (explicitPosition) currentPosition = explicitPosition;
      if (!currentPosition) continue;

      const rawCopy = text(row[columnMap.copy]);
      const rawCta = columnMap.cta === undefined ? '' : text(row[columnMap.cta]);
      const rawSize = columnMap.size === undefined ? '' : text(row[columnMap.size]);
      const rawKLimit = columnMap.kLimit === undefined ? '' : text(row[columnMap.kLimit]);
      if (!rawCopy && !rawCta && !rawSize && !rawKLimit) continue;

      const kLimitIsDimension = !!parseDimensions(rawKLimit);
      const kLimitIsUnlimited = !rawKLimit || /^x$/i.test(rawKLimit.normalize('NFKC'));
      if (!kLimitIsDimension && !kLimitIsUnlimited && parseKLimit(rawKLimit) === null) {
        skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: `K數格式無法解析：「${rawKLimit}」，已略過` });
        continue;
      }

      const positionKey = normalize(currentPosition);
      let dimensions = parseDimensions(rawSize) || parseDimensions(rawKLimit);
      if (!dimensions) dimensions = lastSizeByPosition.get(positionKey) || fallbackDimensions(currentPosition);
      if (!dimensions) {
        skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: '讀不到有效尺寸，已略過' });
        continue;
      }
      lastSizeByPosition.set(positionKey, dimensions);

      const route = routeFor(currentPosition, dimensions);
      if (!route) {
        skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: `找不到 ${dimensions.label} 對應公版，已略過` });
        continue;
      }

      const record = buildRecord({
        row,
        rowIndex,
        position: currentPosition,
        dimensions,
        kLimitRaw: kLimitIsDimension ? '' : rawKLimit,
        rawCopy,
        rawCta,
        route,
      });

      const hostCount = Array.isArray(record.__hosts) ? record.__hosts.length : 0;
      if (hostCount > 2) {
        skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: '公版最多支援兩位主持人，已略過' });
        continue;
      }

      if (route.templateId === 'AR') {
        const supportedLayouts = new Set(['3/2', '2/3', '2/2']);
        if (record.__copyLines.length < 2 || !supportedLayouts.has(record.__arLayout)) {
          skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: `AR 尚未設定「${record.__arLayout || '無法判斷'}」字數組合，已略過` });
          continue;
        }
      }

      if (route.templateId === '首頁A1 Floating icon' && record.__copyLines.length < 2) {
        skippedRows.push({ row: rowIndex + 1, name: currentPosition, reason: '首頁 A1 Floating Icon 需要上下兩行文案，已略過' });
        continue;
      }

      const sequence = (counters.get(route.outputPrefix) || 0) + 1;
      counters.set(route.outputPrefix, sequence);
      record.__outputName = `${route.outputPrefix}_${String(sequence).padStart(2, '0')}_${dimensions.label}`;

      blocks.push({
        name: currentPosition,
        headerRow,
        startRow: rowIndex,
        quantity: 1,
        records: [record],
        colMap: columnMap,
        templateType: FAMILY,
      });
    }

    if (!blocks.length && !skippedRows.length) warnings.push('已找到工單標題列，但下方沒有可產圖資料。');
    return { handled: true, workflow: 'crossnight-live-promo', blocks, warnings, skippedRows, anchorCount: 1 };
  }

  function getLayer(template, key) {
    return template?.layers?.[key] || null;
  }

  function setTextLayer(template, key, value, { hideWhenEmpty = false, preserveManualText = false } = {}) {
    const layer = getLayer(template, key);
    if (!layer || layer.type !== 'text') return false;
    if (preserveManualText && layer.__manualTextEdited === true) return true;
    const content = text(value);
    if (!content && hideWhenEmpty) {
      layer.hidden = true;
      return true;
    }
    if (content) {
      layer.text = content;
      layer.hidden = false;
    }
    return true;
  }

  function setImageLayer(template, key, assetFilename, assetProject = '') {
    const layer = getLayer(template, key);
    if (!layer || layer.type !== 'image') return false;
    layer.assetFilename = assetFilename;
    if (assetProject) layer.assetProject = assetProject;
    else delete layer.assetProject;
    layer.hidden = false;
    layer.keepAspectRatio = true;
    return true;
  }

  function setCommonAssets(template) {
    setImageLayer(template, '跨夜直播派對_LOGO', '跨夜直播派對_LOGO.png');
    setImageLayer(template, '蝦皮直播_LOGO_白', '蝦皮直播_LOGO_白.svg');
    setImageLayer(template, '直式_蝦皮購物_LOGO_白', '直式_蝦皮購物_LOGO_白.svg');
  }

  function captureHostLayout(template) {
    if (template.__crossnightHostLayout) return template.__crossnightHostLayout;
    const capture = (layer) => layer ? {
      x: Number(layer.x || 0),
      y: Number(layer.y || 0),
      width: Number(layer.width || 0),
      height: Number(layer.height || 0),
      centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : Number(layer.x || 0) + Number(layer.width || 0) / 2,
      centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : Number(layer.y || 0) + Number(layer.height || 0) / 2,
    } : null;
    template.__crossnightHostLayout = {
      A: capture(getLayer(template, '主持人_A')),
      B: capture(getLayer(template, '主持人_B')),
    };
    return template.__crossnightHostLayout;
  }

  function restoreBox(layer, box) {
    if (!layer || !box) return;
    Object.assign(layer, box);
  }

  function hostAssetFilename(name) {
    const key = normalize(name);
    if (key === normalize('Sunny')) return 'SUNNY.png';
    if (key === normalize('亞莎')) return '亞莎.png';
    return `${text(name)}.png`;
  }

  function configureHostMask(template, sourceTemplateId) {
    if (!HOST_MASK_TEMPLATE_IDS.has(sourceTemplateId)) return;

    const maskLayer = getLayer(template, 'P_範圍');
    if (!maskLayer) return;

    maskLayer.__placementGuide = true;

    // OA MSBN 的遮罩只有上方兩角需要圓角；POPUP / 直播間 POPUP / Game BN
    // 保留各自 JSON 內原始的 P_範圍形狀與圓角設定，只共用遮罩關係。
    if (CUSTOM_HOST_MASK_CORNER_TEMPLATE_IDS.has(sourceTemplateId)) {
      maskLayer.cornerRadii = { ...OA_HOST_MASK_CORNER_RADII };
      maskLayer.shape = {
        ...(maskLayer.shape || {}),
        kind: 'roundedRectangle',
        cornerRadius: 30,
        cornerRadii: { ...OA_HOST_MASK_CORNER_RADII },
      };
    }

    ['主持人_A', '主持人_B'].forEach((key) => {
      const layer = getLayer(template, key);
      if (layer?.type === 'image') layer.__maskLayerName = 'P_範圍';
    });
  }

  function configureHostVisualEffects(template) {
    ['主持人_A', '主持人_B'].forEach((key) => {
      const layer = getLayer(template, key);
      if (layer?.type !== 'image') return;
      layer.dropShadow = { ...HOST_DROP_SHADOW };
    });
  }

  function getTextVisualCenterX(layer, measuredWidth) {
    const x = Number(layer?.x || 0);
    const boxWidth = Math.max(0, Number(layer?.width || 0));
    const visualWidth = Math.max(0, Number(measuredWidth || boxWidth));
    const align = String(layer?.align || 'left').toLowerCase();

    if (align === 'right') return x + boxWidth - visualWidth / 2;
    if (align === 'center') {
      return Number.isFinite(Number(layer?.centerX))
        ? Number(layer.centerX)
        : x + boxWidth / 2;
    }
    return x + visualWidth / 2;
  }

  function configureOaTitleBackground(template, sourceTemplateId, helpers = {}) {
    if (!OA_TITLE_BACKGROUND_TEMPLATE_IDS.has(sourceTemplateId)) return;

    const title = getLayer(template, 'title');
    const background = getLayer(template, '主標題_BG');
    const leftTriangle = getLayer(template, '主標題_BG_三角形_左');
    const rightTriangle = getLayer(template, '主標題_BG_三角形_右');
    if (!title || !background || !leftTriangle || !rightTriangle) return;

    const hasTitle = title.hidden !== true && text(title.text).length > 0;
    [background, leftTriangle, rightTriangle].forEach((layer) => { layer.hidden = !hasTitle; });
    if (!hasTitle) return;

    const measuredWidth = Math.max(1, Number(helpers.measureTextWidth?.(title) || title.width || 1));
    const visualCenterX = getTextVisualCenterX(title, measuredWidth);
    const backgroundWidth = measuredWidth + OA_TITLE_BACKGROUND_PADDING_PX * 2;

    background.width = backgroundWidth;
    background.x = visualCenterX - backgroundWidth / 2;
    background.centerX = visualCenterX;
    background.centerY = Number(background.y || 0) + Number(background.height || 0) / 2;
    background.useDynamicBounds = true;
    background.cornerRadii = { ...OA_TITLE_BACKGROUND_CORNER_RADII };
    background.shape = {
      ...(background.shape || {}),
      kind: 'roundedRectangle',
      cornerRadius: 50,
      cornerRadii: { ...OA_TITLE_BACKGROUND_CORNER_RADII },
    };

    const positionTriangle = (layer, side) => {
      const width = Math.max(1, Number(layer.width || 19));
      const height = Math.max(1, Number(layer.height || 24));
      layer.width = width;
      layer.height = height;
      layer.y = Number(background.y || layer.y || 0);
      layer.x = side === 'left'
        ? background.x - width
        : background.x + background.width;
      layer.centerX = layer.x + width / 2;
      layer.centerY = layer.y + height / 2;
      layer.useDynamicBounds = true;
      layer.shape = {
        ...(layer.shape || {}),
        kind: 'polygon',
        pointsNormalized: true,
        points: side === 'left'
          ? [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
          : [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      };
    };

    positionTriangle(leftTriangle, 'left');
    positionTriangle(rightTriangle, 'right');
  }

  function centerHostMetaGroup(template, sourceTemplateId, helpers = {}) {
    if (!CENTERED_HOST_META_TEMPLATE_IDS.has(sourceTemplateId)) return;

    // IG / 開播字卡的主持資訊是固定置中群組。文字內容、字級、字體或對齊方式改變時，
    // 必須使用「實際量測後的文字寬度」計算視覺邊界，不能沿用 JSON 內的舊文字框寬度。
    const groupLayers = ['主持', '白色直線', '主持人名稱']
      .map((key) => getLayer(template, key))
      .filter((layer) => layer && layer.hidden !== true);
    if (!groupLayers.length) return;

    const canvasWidth = Number(template?.canvas?.width || 0);
    if (!Number.isFinite(canvasWidth) || canvasWidth <= 0) return;

    const getVisualBounds = (layer) => {
      const x = Number(layer.x || 0);
      const boxWidth = Math.max(0, Number(layer.width || 0));
      if (layer.type !== 'text') return { left: x, right: x + boxWidth };

      const measuredWidth = Math.max(0, Number(helpers.measureTextWidth?.(layer) || 0));
      const visualWidth = measuredWidth > 0 ? measuredWidth : boxWidth;
      const align = String(layer.align || 'left').toLowerCase();
      if (align === 'right') {
        const right = x + boxWidth;
        return { left: right - visualWidth, right };
      }
      if (align === 'center') {
        const centerX = Number.isFinite(Number(layer.centerX))
          ? Number(layer.centerX)
          : x + boxWidth / 2;
        return { left: centerX - visualWidth / 2, right: centerX + visualWidth / 2 };
      }
      return { left: x, right: x + visualWidth };
    };

    const visualBounds = groupLayers.map(getVisualBounds);
    const left = Math.min(...visualBounds.map((bounds) => bounds.left));
    const right = Math.max(...visualBounds.map((bounds) => bounds.right));
    const groupCenterX = (left + right) / 2;
    const deltaX = canvasWidth / 2 - groupCenterX;
    if (!Number.isFinite(deltaX) || Math.abs(deltaX) < 0.001) return;

    groupLayers.forEach((layer) => {
      const currentX = Number(layer.x || 0);
      const currentCenterX = Number.isFinite(Number(layer.centerX))
        ? Number(layer.centerX)
        : currentX + Number(layer.width || 0) / 2;
      layer.x = currentX + deltaX;
      layer.centerX = currentCenterX + deltaX;
      if (layer.type === 'shape') layer.useDynamicBounds = true;
    });
  }

  function applyHosts(template, hosts, { preserveGeometry = false, preserveManualText = false } = {}) {
    const names = Array.isArray(hosts) ? hosts.filter(Boolean).slice(0, 2) : [];
    const hostA = getLayer(template, '主持人_A');
    const hostB = getLayer(template, '主持人_B');
    const layout = captureHostLayout(template);
    const relatedKeys = ['主持', '主持人名稱', '主持人名稱_BG'];

    if (!names.length) {
      if (hostA) hostA.hidden = true;
      if (hostB) hostB.hidden = true;
      relatedKeys.forEach((key) => { const layer = getLayer(template, key); if (layer) layer.hidden = true; });
      return;
    }

    // 第一次套版時使用 JSON / Rule 的基準位置；預覽刷新、縮圖重繪與切換版位時
    // 必須保留使用者已經手動調整的幾何資料，不能再次回填初始位置。
    if (!preserveGeometry) {
      if (hostA && layout.A) restoreBox(hostA, layout.A);
      if (hostB && layout.B) restoreBox(hostB, layout.B);
    }
    setImageLayer(template, '主持人_A', hostAssetFilename(names[0]), '主持人圖素');

    if (names.length === 1) {
      if (hostB) hostB.hidden = true;
      if (!preserveGeometry && hostA && layout.A && layout.B) {
        const groupLeft = Math.min(layout.A.x, layout.B.x);
        const groupRight = Math.max(layout.A.x + layout.A.width, layout.B.x + layout.B.width);
        const groupCenterX = (groupLeft + groupRight) / 2;
        hostA.x = groupCenterX - layout.A.width / 2;
        hostA.centerX = groupCenterX;
      }
    } else {
      setImageLayer(template, '主持人_B', hostAssetFilename(names[1]), '主持人圖素');
    }

    const hostLabel = names.join('、');
    setTextLayer(template, '主持人名稱', hostLabel, { preserveManualText });
    const hostTitle = getLayer(template, '主持');
    if (hostTitle) hostTitle.hidden = false;
    const hostNameBackground = getLayer(template, '主持人名稱_BG');
    if (hostNameBackground) hostNameBackground.hidden = false;
  }

  function applyArCopy(template, record, { preserveManualText = false } = {}) {
    ['AR_01_文案_上', 'AR_01_文案_下', 'AR_02_文案_上', 'AR_02_文案_下'].forEach((key) => {
      const layer = getLayer(template, key);
      if (layer) layer.hidden = true;
    });
    const [upper = '', lower = ''] = record.__copyLines || [];
    const mapping = {
      '3/2': ['AR_01_文案_上', 'AR_01_文案_下'],
      '2/3': ['AR_02_文案_上', 'AR_02_文案_下'],
      '2/2': ['AR_02_文案_上', 'AR_01_文案_下'],
    }[record.__arLayout];
    if (!mapping) return;
    setTextLayer(template, mapping[0], upper, { preserveManualText });
    setTextLayer(template, mapping[1], lower, { preserveManualText });
    const guide = getLayer(template, '文案範圍');
    if (guide) guide.__placementGuide = true;
  }

  function applyFloatingCopy(template, record, sourceTemplateId, { preserveManualText = false } = {}) {
    const lines = record.__copyLines || [];
    if (sourceTemplateId === '首頁A1 Floating icon') {
      setTextLayer(template, 'A1_Floating_文案_上', lines[0] || '', { preserveManualText });
      setTextLayer(template, 'A1_Floating_文案_下', lines[1] || '', { preserveManualText });
      return;
    }

    setTextLayer(template, 'Floating_icon_文案', record.__compactCopy || lines.join(''), { preserveManualText });
    const useCoinIcons = (record.__compactCopy || '').includes('蝦幣');
    ['蝦幣_icon_01', '蝦幣_icon_02'].forEach((key) => { const layer = getLayer(template, key); if (layer) layer.hidden = !useCoinIcons; });
    ['優惠券_icon_01', '優惠券_icon_02'].forEach((key) => { const layer = getLayer(template, key); if (layer) layer.hidden = useCoinIcons; });
  }

  function applyRecord({ template, record, diagnostics, skipExactLayout = false, helpers = {} }) {
    const sourceTemplateId = String(
      template?.sheetTemplateRoute?.sourceTemplateId
      || record?.__route?.templateId
      || template?.canvas?.templateId
      || template?.source?.psdName
      || ''
    ).replace(/\.psd$/i, '');

    const preserveManualText = skipExactLayout === true;
    setCommonAssets(template);
    configureHostMask(template, sourceTemplateId);
    configureHostVisualEffects(template);

    if (sourceTemplateId === 'AR') {
      applyArCopy(template, record, { preserveManualText });
      diagnostics.push({ field: '文案', status: 'ok', value: record.__rawCopy, target: record.__arLayout });
      return;
    }

    if (sourceTemplateId === 'Floating icon' || sourceTemplateId === '首頁A1 Floating icon') {
      applyFloatingCopy(template, record, sourceTemplateId, { preserveManualText });
      diagnostics.push({ field: '文案', status: 'ok', value: record.__rawCopy, target: sourceTemplateId });
      return;
    }

    setTextLayer(template, 'title', record.主標, { preserveManualText });
    setTextLayer(template, 'subtitle', record.副標, { hideWhenEmpty: true, preserveManualText });
    setTextLayer(template, '時間', record.時間, { preserveManualText });
    configureOaTitleBackground(template, sourceTemplateId, helpers);
    applyHosts(template, record.__hosts || [], { preserveGeometry: skipExactLayout === true, preserveManualText });
    centerHostMetaGroup(template, sourceTemplateId, helpers);

    if (sourceTemplateId === '直播時縮圖') {
      const titleLayer = getLayer(template, 'title');
      if (titleLayer) titleLayer.hidden = true;
    }

    if (sourceTemplateId === '直播大廳_LPBN') {
      const immediateCta = getLayer(template, 'CTA_立即看_白');
      if (immediateCta) immediateCta.hidden = record.__showImmediateCta !== true;
    }

    diagnostics.push({ field: '套版', status: 'ok', value: record.__position, target: sourceTemplateId });
  }

  function afterManualTextMetricsChanged({ template, layerKey, helpers = {} }) {
    const sourceTemplateId = String(
      template?.sheetTemplateRoute?.sourceTemplateId
      || template?.batchRecord?.__route?.templateId
      || template?.canvas?.templateId
      || template?.source?.psdName
      || ''
    ).replace(/\.psd$/i, '');

    if (layerKey === '主持人名稱') centerHostMetaGroup(template, sourceTemplateId, helpers);
    if (layerKey === 'title') configureOaTitleBackground(template, sourceTemplateId, helpers);
  }

  window.TemplateRuleRegistry.register(FAMILY, {
    label: '跨夜直播宣傳圖',
    priority: 1000,
    targets: [
      'MSBN', 'OA_MSBN DD', 'OA_MSBN BAU', 'DD Banner Card', 'HBN',
      '直播大廳_LPBN', '直播時縮圖', 'AR', 'Game BN', 'Coin page BN',
      'Coin page BN_BAU', 'POPUP', '直播間POPUP', 'Floating icon',
      '首頁A1 Floating icon', 'IG', '開播字卡_1080x1920', 'FB POST',
    ],
    tokens: [
      'MSBN', 'OA MSBN', 'HBN', '直播大廳 LP BN', '直播時縮圖',
      'PN/AR', 'GAME BN', 'coins page', 'POPUP', 'Floating Icon',
      'IG', '開播字卡', 'FB POST',
    ],
    sheetParser: parseSheet,
    rules: {
      resolveRecordTemplateRoute({ record }) {
        if (!record?.__route) return null;
        return {
          ...record.__route,
          outputName: record.__outputName,
        };
      },
      afterApplyRecordToTemplate: applyRecord,
      afterManualTextMetricsChanged,
    },
  });

  window.CrossnightLivePromoRules = Object.freeze({
    normalize,
    parseDimensions,
    parseKLimit,
    parseStandardCopy,
    parseOaDdCopy,
    routeFor,
    parseSheet,
    PNG_TEMPLATE_IDS,
  });
})();
