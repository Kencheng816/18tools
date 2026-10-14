/* LINE購物 OAPush（分眾）1040x1040 專屬規則 */
(function () {
  'use strict';

  const FAMILY = 'line_shopping_oa_push_segmented_1040x1040';
  const TEMPLATE_ID = 'LINE購物OAPush (分眾)_1040x1040';
  const SLOT_NAMES = ['左上1', '中上2', '右上3', '左下4', '中下5', '右下6'];

  const normalizeText = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n?/g, '\n')
    .trim();

  const normalizeKey = (value) => normalizeText(value)
    .toLowerCase()
    .replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');

  const getCell = (row, columnIndex) => columnIndex === undefined ? '' : normalizeText(row?.[columnIndex]);

  function findColumn(headerRow, aliases) {
    const wanted = aliases.map(normalizeKey);
    return (headerRow || []).findIndex((cell) => {
      const key = normalizeKey(cell);
      return wanted.some((alias) => key === alias || key.includes(alias));
    });
  }

  function detectSlot(value) {
    const key = normalizeKey(value);
    return SLOT_NAMES.find((slot) => key.startsWith(normalizeKey(slot))) || '';
  }

  function normalizePercent(value) {
    const raw = normalizeText(value);
    if (!raw) return '';
    const number = Number(raw.replace('%', '').trim());
    if (!Number.isFinite(number)) return raw;
    const normalized = number > 0 && number < 1 ? number * 100 : number;
    return `${Math.round(normalized * 100) / 100}%`;
  }

  function parseProductCopy(value, fallbackPercent) {
    const lines = normalizeText(value).split('\n').map((line) => line.trim()).filter(Boolean);
    let percent = '';
    const copyLines = [];

    lines.forEach((line) => {
      const match = line.match(/line\s*points?\s*([0-9]+(?:\.[0-9]+)?)\s*%/i);
      if (match) percent = `${match[1]}%`;
      else copyLines.push(line);
    });

    return {
      upper: copyLines[0] || '',
      lower: copyLines.slice(1).join(' ') || '',
      percent: percent || normalizePercent(fallbackPercent),
    };
  }

  function findLayerByName(template, helpers, name) {
    return Object.values(template?.layers || {}).find((layer) =>
      helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm(name)
    ) || null;
  }

  window.TemplateRuleRegistry.register(FAMILY, {
    label: TEMPLATE_ID,
    priority: 180,
    targets: [TEMPLATE_ID, 'LINE購物OAPush (分眾)'],
    tokens: ['LINE購物OAPush (分眾)', 'OAPush分眾'],

    rules: {
      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm('LINE購物OAPush (分眾)')) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: TEMPLATE_ID,
          templateId: TEMPLATE_ID,
          templateFile: `${TEMPLATE_ID}.json`,
        };
      },

      blockParser({ rows, header, rowIndex, nextHeaderRow, productName }) {
        if (normalizeKey(productName) !== normalizeKey('LINE購物OAPush (分眾)')) return null;

        const headerRow = rows?.[header?.headerRow] || [];
        const infoCol = findColumn(headerRow, ['商品資訊提供']);
        const copyCol = findColumn(headerRow, ['短文案+回饋%']);
        const imageCol = findColumn(headerRow, ['GD摳圖LINK', 'GD摳圖連結']);
        const percentCol = findColumn(headerRow, ['LINE POINTS %', 'LINE POINTS%']);
        if ([infoCol, copyCol, imageCol].some((index) => index < 0)) return null;

        const baseRow = rows?.[rowIndex] || [];
        const record = {
          '版位': productName,
          '檔名': getCell(baseRow, header?.colMap?.['檔名']),
          '主標': getCell(baseRow, header?.colMap?.['主標']),
          '文案': getCell(baseRow, header?.colMap?.['文案']),
          '商品圖1': '',
          '商品圖2': '',
          __sourceRow: rowIndex + 1,
        };

        const foundSlots = new Set();
        let consumedUntilRow = rowIndex;
        for (let row = rowIndex; row < Math.min(nextHeaderRow, rowIndex + 12); row += 1) {
          const source = rows?.[row] || [];
          const slot = detectSlot(source[infoCol]);
          if (!slot || foundSlots.has(slot)) continue;

          const parsedCopy = parseProductCopy(source[copyCol], percentCol >= 0 ? source[percentCol] : '');
          record[`${slot}_短文案_上`] = parsedCopy.upper;
          record[`${slot}_短文案_下`] = parsedCopy.lower;
          record[`${slot}_LINE_POINTS_PERCENT`] = parsedCopy.percent;
          record[`${slot}_商品圖`] = getCell(source, imageCol);
          foundSlots.add(slot);
          consumedUntilRow = row;
        }

        if (foundSlots.size !== SLOT_NAMES.length) return null;
        return { records: [record], quantity: 1, templateType: 'oa-push-grid', consumedUntilRow };
      },

      beforeApplyRecordToTemplate({ record }) {
        record['商品圖1'] = '';
        record['商品圖2'] = '';
        const filename = String(record?.['檔名'] || '').trim();
        if (filename) record.__outputName = filename;
      },

      afterApplyRecordToTemplate({ template, record, diagnostics, helpers }) {
        const setText = (name, value) => {
          const layer = findLayerByName(template, helpers, name);
          if (!layer) return;
          layer.text = String(value || '').trim();
          layer.hidden = !layer.text;
        };

        SLOT_NAMES.forEach((slot) => {
          setText(`${slot}_短文案_上`, record[`${slot}_短文案_上`]);
          setText(`${slot}_短文案_下`, record[`${slot}_短文案_下`]);
          setText(`${slot}_LINE POINTS %`, record[`${slot}_LINE_POINTS_PERCENT`]);

          const productLayer = findLayerByName(template, helpers, `${slot}_P_範圍`);
          if (!productLayer) return;

          // P_範圍原本是 Shape。先複製一份不可見 Shape 作為遮罩，
          // 再把原圖層改成商品圖片；避免 Shape 路徑因 type=image 而遺失。
          const maskKey = `${slot}_P_遮罩`;
          if (!template.layers[maskKey]) {
            template.layers[maskKey] = {
              ...JSON.parse(JSON.stringify(productLayer)),
              name: maskKey,
              psdName: maskKey,
              type: 'shape',
              hidden: true,
              locked: true,
              role: 'mask',
              assetFilename: '',
              effects: {},
            };
          }

          const rawAsset = String(record[`${slot}_商品圖`] || '').trim();
          productLayer.type = 'image';
          productLayer.role = 'product';
          productLayer.keepAspectRatio = true;
          productLayer.sizingMode = 'containByPBox';
          productLayer.targetWidth = Number(productLayer.width || 0);
          productLayer.targetHeight = Number(productLayer.height || 0);
          productLayer.maxTargetHeight = Number(productLayer.height || 0);
          productLayer.widthLimitPolicy = 'pBox';
          productLayer.effects = { ...(productLayer.effects || {}), maskBy: maskKey, shadow: { enabled: false } };
          delete productLayer.dropShadow;
          delete productLayer.shadow;

          const match = helpers.findAssetFilename(rawAsset, {
            template,
            layer: productLayer,
            layerKey: `${slot}_P_範圍`,
          });
          productLayer.assetFilename = match.found ? match.filename : '';
          diagnostics.push({
            field: `${slot}_商品圖`,
            status: match.found ? 'ok' : 'missing',
            value: rawAsset,
            filename: match.filename || '',
            attempts: match.attempts || [],
          });
        });

        const logoShadow = {
          enabled: true,
          color: '#f26602',
          angle: 117,
          opacity: 0.51,
          distance: 2,
          size: 6,
        };
        const logoAssets = {
          '蝦皮購物18號會員日_LOGO_白': '蝦皮購物18號會員日_LOGO_白.svg',
          '蝦皮購物_純文字LOGO_橘': '蝦皮購物_純文字LOGO_橘.svg',
          '蝦皮商城_純文字LOGO_紅': '蝦皮商城_純文字LOGO_紅.svg',
          '蝦皮直營_純文字LOGO_紅': '蝦皮直營_純文字LOGO_紅.svg',
        };

        Object.entries(logoAssets).forEach(([name, filename]) => {
          const layer = findLayerByName(template, helpers, name);
          if (!layer) return;
          const match = helpers.findAssetFilename(filename, { template, layer, layerKey: name });
          if (match.found) layer.assetFilename = match.filename;
          layer.opacity = 1;
          layer.blendMode = 'normal';
          delete layer.dropShadow;
          delete layer.shadow;

          if (name === '蝦皮購物18號會員日_LOGO_白') {
            layer.effects = { ...(layer.effects || {}), shadow: { ...logoShadow } };
          } else {
            layer.effects = { ...(layer.effects || {}), shadow: { enabled: false } };
            layer.renderQuality = 'clean-logo';
          }
        });
      },
    },
  });
})();
