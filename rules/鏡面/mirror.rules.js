/* 18節鏡面：工單解析、模板分流與人名標套版規則。 */
(function registerMirrorRules() {
  'use strict';

  const FAMILY = 'mirror_418';
  const EXPECTED_SIZE = Object.freeze({ width: 1080, height: 1920, label: '1080x1920' });
  const POSITION_ROUTES = Object.freeze({
    人名標: { templateId: '人名標', outputPrefix: '人名標' },
    天空bar: { templateId: '天空Bar', outputPrefix: '天空Bar' },
    底bar: { templateId: '底Bar', outputPrefix: '底Bar' },
    開框留底字卡: { templateId: '開框留底字卡', outputPrefix: '開框留底字卡' },
    循環動畫底圖: { templateId: '循環動畫底圖', outputPrefix: '循環動畫底圖' },
  });

  const text = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n?/g, '\n')
    .trim();

  const normalize = (value) => text(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');

  const normalizeHeader = (value) => normalize(value).replace(/[：:]/g, '');

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
    if (!raw || /^(?:x|-|－|—)$/i.test(raw) || parseDimensions(raw)) return null;
    const match = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const kiloBytes = Number(match[1]);
    return Number.isFinite(kiloBytes) && kiloBytes > 0 ? Math.floor(kiloBytes * 1000) : null;
  }

  function parseHostTitle(rawCopy) {
    const source = text(rawCopy).normalize('NFKC');
    const match = source.match(/title\s*[:：]\s*([^\r\n]+)/i);
    if (!match) return '';
    return text(match[1]).replace(/[。；;，,]+$/g, '').trim();
  }

  function findHeader(rows) {
    const aliases = {
      position: new Set(['位置', '使用位置'].map(normalizeHeader)),
      kLimit: new Set(['k數', 'k数', '容量', '檔案大小'].map(normalizeHeader)),
      size: new Set(['尺寸', 'size'].map(normalizeHeader)),
      copy: new Set(['文案', '文字'].map(normalizeHeader)),
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      const columnMap = {};
      row.forEach((cell, columnIndex) => {
        const key = normalizeHeader(cell);
        if (!key) return;
        Object.entries(aliases).forEach(([field, values]) => {
          if (columnMap[field] === undefined && values.has(key)) columnMap[field] = columnIndex;
        });
      });
      if (columnMap.position !== undefined && columnMap.size !== undefined && columnMap.copy !== undefined) {
        return { rowIndex, columnMap };
      }
    }
    return null;
  }

  function routeFor(position) {
    const normalized = normalize(position);
    const route = POSITION_ROUTES[normalized];
    if (!route) return null;
    return {
      key: FAMILY,
      family: FAMILY,
      label: position,
      templateId: route.templateId,
      templateFile: `${route.templateId}.json`,
      outputPrefix: route.outputPrefix,
    };
  }

  function parseSheet({ rows }) {
    const header = findHeader(rows || []);
    if (!header) return null;

    const blocks = [];
    const warnings = [];
    const skippedRows = [];
    const counters = new Map();
    const { rowIndex: headerRow, columnMap } = header;

    for (let rowIndex = headerRow + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      const position = text(row[columnMap.position]);
      if (!position) continue; // 鏡面工單空白列不繼承上一個位置。

      const route = routeFor(position);
      if (!route) {
        skippedRows.push({ row: rowIndex + 1, name: position, reason: '位置名稱沒有精準對應公版，已略過' });
        continue;
      }

      const dimensions = parseDimensions(row[columnMap.size]);
      if (!dimensions) {
        skippedRows.push({ row: rowIndex + 1, name: position, reason: '讀不到有效尺寸，已略過' });
        continue;
      }
      if (dimensions.width !== EXPECTED_SIZE.width || dimensions.height !== EXPECTED_SIZE.height) {
        skippedRows.push({ row: rowIndex + 1, name: position, reason: `尺寸 ${dimensions.label} 與公版 ${EXPECTED_SIZE.label} 不符，已略過` });
        continue;
      }

      const rawCopy = text(row[columnMap.copy]);
      const hostName = route.templateId === '人名標' ? parseHostTitle(rawCopy) : '';
      if (route.templateId === '人名標' && !hostName) {
        skippedRows.push({ row: rowIndex + 1, name: position, reason: '文案中找不到 title：姓名，已略過' });
        continue;
      }

      const sequence = (counters.get(route.outputPrefix) || 0) + 1;
      counters.set(route.outputPrefix, sequence);
      const outputName = `${route.outputPrefix}_${String(sequence).padStart(2, '0')}_${EXPECTED_SIZE.label}`;
      const record = {
        __workflow: 'mirror-418',
        __sourceRow: rowIndex + 1,
        __position: position,
        __width: EXPECTED_SIZE.width,
        __height: EXPECTED_SIZE.height,
        __size: EXPECTED_SIZE.label,
        __kLimitBytes: parseKLimit(columnMap.kLimit === undefined ? '' : row[columnMap.kLimit]),
        __specFormat: 'png',
        __route: route,
        __templateId: route.templateId,
        __outputName: outputName,
        __rawCopy: rawCopy,
        __hostName: hostName,
        __sourceCells: row,
      };

      blocks.push({
        name: position,
        headerRow,
        startRow: rowIndex,
        quantity: 1,
        records: [record],
        colMap: columnMap,
        templateType: FAMILY,
      });
    }

    if (!blocks.length && !skippedRows.length) warnings.push('已找到鏡面工單標題列，但下方沒有可產圖資料。');
    return {
      handled: true,
      workflow: 'mirror-418',
      blocks,
      warnings,
      skippedRows,
      anchorCount: 1,
    };
  }

  function applyRecord({ template, record, diagnostics, skipExactLayout = false }) {
    const sourceTemplateId = String(
      template?.sheetTemplateRoute?.sourceTemplateId
      || template?.canvas?.templateId
      || template?.templateId
      || '',
    ).trim();

    if (sourceTemplateId !== '人名標') {
      diagnostics.push({ field: '套版', status: 'ok', value: record.__position, target: sourceTemplateId });
      return;
    }

    const layer = template?.layers?.['主持人名稱'];
    if (!layer || layer.type !== 'text') {
      diagnostics.push({ field: '主持人名稱', status: 'missing-layer', value: record.__hostName, target: '找不到主持人名稱圖層' });
      return;
    }

    if (skipExactLayout === true && layer.__manualTextEdited === true) {
      diagnostics.push({ field: '主持人名稱', status: 'manual-override', value: layer.text, target: layer.psdName || '主持人名稱' });
      return;
    }

    layer.text = text(record.__hostName);
    layer.hidden = false;
    diagnostics.push({ field: '主持人名稱', status: 'ok', value: layer.text, target: layer.psdName || '主持人名稱' });
  }

  window.TemplateRuleRegistry.register(FAMILY, {
    label: '18節鏡面',
    priority: 1000,
    targets: ['人名標', '天空Bar', '底Bar', '開框留底字卡', '循環動畫底圖'],
    tokens: ['人名標', '天空Bar', '底Bar', '開框留底字卡', '循環動畫底圖'],
    sheetParser: parseSheet,
    rules: {
      resolveRecordTemplateRoute({ record }) {
        if (!record?.__route) return null;
        return { ...record.__route, outputName: record.__outputName };
      },
      afterApplyRecordToTemplate: applyRecord,
    },
  });

  window.MirrorRules = Object.freeze({
    normalize,
    parseDimensions,
    parseHostTitle,
    routeFor,
    parseSheet,
  });
})();
