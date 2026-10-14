/* Network / Affiliate workflow engine.
 * JSON is the only layout source. This module handles Network parsing, routing,
 * asset specifications, visibility, guide mapping, diagnostics and export metadata.
 */
(function initNetworkAffiliateEngine() {
  'use strict';

  const REQUIRED_HEADERS = ['曝光媒體', '尺寸', '檔案命名', '店家', 'LOGO'];
  const IMAGE_EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg'];

  const clean = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();
  const decodeUnicodeEscapes = (value) => clean(value)
    .replace(/#U([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const normalize = (value) => decodeUnicodeEscapes(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[\s\u00a0\u3000_\-()（）\[\]【】.]+/g, '');
  const normalizeLayerName = (value) => decodeUnicodeEscapes(value)
    .replace(/\u3000/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  const stripExtension = (value) => clean(value).replace(/\.(png|jpe?g|webp|gif|svg)$/i, '');
  const safeName = (value) => stripExtension(decodeUnicodeEscapes(value))
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  const normalizeSize = (value) => {
    const match = clean(value).match(/(\d+)\s*[xX×＊*]\s*(\d+)/);
    return match ? `${Number(match[1])}x${Number(match[2])}` : '';
  };
  const getExtension = (value) => (clean(value).match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
  const extensionRank = (value) => {
    const rank = IMAGE_EXTENSIONS.indexOf(getExtension(value));
    return rank < 0 ? IMAGE_EXTENSIONS.length : rank;
  };
  const filenameStem = (value) => stripExtension(clean(value).split(/[\\/]/).pop() || '');

  function basenameFromUrl(value) {
    const raw = clean(value);
    if (!/^https?:\/\//i.test(raw)) return '';
    try {
      const url = new URL(raw);
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
    } catch (_) {
      try { return decodeURIComponent(raw.split(/[?#]/)[0].split('/').pop() || ''); }
      catch (_) { return raw.split(/[?#]/)[0].split('/').pop() || ''; }
    }
  }

  function parseCombination(value) {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
    const text = clean(value);
    if (/^[1-9]\d*$/.test(text)) return Number(text);
    return null;
  }

  function formatPercentNumber(value) {
    if (!Number.isFinite(value) || value < 0) return '';
    const rounded = Math.round(value * 10000) / 10000;
    return `${String(rounded).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}%`;
  }

  function percentText(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return formatPercentNumber(value >= 0 && value <= 1 ? value * 100 : value);
    }
    const text = clean(value).replace(/,/g, '');
    if (!text) return '';
    const percentMatch = text.match(/^([+-]?\d+(?:\.\d+)?)\s*%$/);
    if (percentMatch) return formatPercentNumber(Number(percentMatch[1]));
    if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) {
      const number = Number(text);
      return formatPercentNumber(number >= 0 && number <= 1 ? number * 100 : number);
    }
    return '';
  }

  function findHeader(rows) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const map = {};
      (rows[rowIndex] || []).forEach((value, columnIndex) => {
        const header = REQUIRED_HEADERS.find((name) => normalize(value) === normalize(name));
        if (header) map[header] = columnIndex;
      });
      if (REQUIRED_HEADERS.every((name) => map[name] !== undefined)) return { row: rowIndex, map };
    }
    return null;
  }

  function findColumn(headerRow, aliases) {
    for (const alias of aliases) {
      const index = (headerRow || []).findIndex((value) => normalize(value) === normalize(alias));
      if (index >= 0) return index;
    }
    return -1;
  }

  function parse(rows) {
    const header = findHeader(rows);
    if (!header) return null;

    const headerRow = rows[header.row] || [];
    const columns = {
      media: header.map['曝光媒體'],
      size: header.map['尺寸'],
      filename: header.map['檔案命名'],
      shop: header.map['店家'],
      logo: header.map.LOGO,
      combination: findColumn(headerRow, ['組合', 'Combination']),
    };
    const records = [];
    const warnings = [];
    const errors = [];

    for (let rowIndex = header.row + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || [];
      if (!row.some((value) => clean(value))) continue;
      if (normalize(row[columns.media]) !== normalize('Affiliate')) continue;

      const filename = clean(row[columns.filename]);
      const size = normalizeSize(row[columns.size]);
      const filenameSize = normalizeSize(filename);
      if (!size) {
        errors.push(`第 ${rowIndex + 1} 列尺寸格式無效`);
        continue;
      }
      if (filenameSize && filenameSize !== size) {
        warnings.push(`第 ${rowIndex + 1} 列尺寸欄 ${size} 與檔名尺寸 ${filenameSize} 不一致；使用尺寸欄選擇公版`);
      }

      const lowerFilename = filename.toLowerCase();
      const rowKind = lowerFilename.startsWith('affiliate_ia_')
        ? 'ia'
        : lowerFilename.startsWith('biggo_') ? 'biggo' : 'general';

      records.push({
        __sourceRow: rowIndex + 1,
        __rowKind: rowKind,
        media: 'Affiliate',
        size,
        filename,
        shop: clean(row[columns.shop]),
        logo: row[columns.logo],
        combination: columns.combination >= 0 ? parseCombination(row[columns.combination]) : null,
      });
    }

    return { header, columns, records, warnings, errors };
  }

  function templateById(sourceTemplates, templateId) {
    const wanted = normalize(templateId);
    return (sourceTemplates || []).find((template) => {
      const candidates = [
        template?.data?.templateId,
        template?.data?.canvas?.templateId,
        template?.name,
        template?.file,
      ];
      return candidates.some((candidate) => normalize(String(candidate || '').replace(/\.json$/i, '')) === wanted);
    }) || null;
  }

  function layerEntries(template) {
    return Object.entries(template?.layers || {});
  }

  function canonicalLayerName(key, layer) {
    return clean(layer?.psdName || layer?.name || key);
  }

  function findLayerEntry(template, requestedName) {
    const wanted = normalizeLayerName(requestedName);
    const entries = layerEntries(template);
    return entries.find(([key, layer]) => normalizeLayerName(layer?.psdName) === wanted)
      || entries.find(([key]) => normalizeLayerName(key) === wanted)
      || null;
  }

  function setVisible(template, requestedName, visible) {
    const entry = findLayerEntry(template, requestedName);
    if (!entry) return false;
    const layer = entry[1];
    layer.hidden = !visible;
    layer.visible = Boolean(visible);
    return true;
  }

  function setAssetSpec(template, requestedName, spec) {
    const entry = findLayerEntry(template, requestedName);
    if (!entry) return false;
    const [key, layer] = entry;
    layer.__networkAssetSpec = { ...spec };
    layer.__networkCanonicalName = canonicalLayerName(key, layer);
    layer.assetFilename = '';
    layer.assetProject = spec.preferredFolder || '';
    layer.__assetMissing = !spec.stem;
    layer.hidden = false;
    if (/^P(?:_02)?$/i.test(clean(requestedName))) layer.role = 'product';
    return true;
  }

  function markGuides(template) {
    layerEntries(template).forEach(([key, layer]) => {
      const name = canonicalLayerName(key, layer);
      if (!/^P_範圍(?:_\d+)?$/i.test(name)) return;
      layer.locked = true;
      layer.__nonInteractive = true;
      layer.__placementGuide = true;
      layer.guideColor = '#0066FF';
      layer.guideOpacity = 0.5;
      layer.guideDash = 2;
    });
  }

  function bindAssetLayerToGuide(template, assetName, guideName) {
    const assetEntry = findLayerEntry(template, assetName);
    const guideEntry = findLayerEntry(template, guideName);
    if (!assetEntry || !guideEntry) return false;
    const asset = assetEntry[1];

    // JSON remains the only source for the image's initial x/y/width/height. The guide is a clipping
    // boundary and a relative-coordinate reference only; it must never overwrite the image box.
    asset.x = Number(asset.x || 0);
    asset.y = Number(asset.y || 0);
    asset.width = Math.max(1, Number(asset.width || 1));
    asset.height = Math.max(1, Number(asset.height || 1));
    asset.centerX = Number.isFinite(Number(asset.centerX)) ? Number(asset.centerX) : asset.x + asset.width / 2;
    asset.centerY = Number.isFinite(Number(asset.centerY)) ? Number(asset.centerY) : asset.y + asset.height / 2;
    asset.keepAspectRatio = true;
    asset.fitMode = 'contain';
    asset.sizingMode = 'containByPBox';
    asset.targetWidth = asset.width;
    asset.targetHeight = asset.height;
    asset.maxTargetHeight = asset.height;
    asset.maskLayerName = guideName;
    asset.__networkMaskLayerName = guideName;
    asset.__networkSmartObjectEligible = true;
    delete asset.maskBounds;
    return true;
  }

  function shapeCornerRadius(layer) {
    return Math.max(0, Number(layer?.shape?.cornerRadius ?? layer?.cornerRadius ?? layer?.radius ?? 0));
  }

  function setDirectionalCorners(template, requestedName, pattern) {
    const entry = findLayerEntry(template, requestedName);
    if (!entry || entry[1]?.type !== 'shape') return false;
    const layer = entry[1];
    const radius = shapeCornerRadius(layer);
    layer.cornerRadii = {
      topLeft: pattern.top ? radius : 0,
      topRight: pattern.top ? radius : 0,
      bottomRight: pattern.bottom ? radius : 0,
      bottomLeft: pattern.bottom ? radius : 0,
    };
    return true;
  }

  function directionalCornerExcluded(sourceTemplateId) {
    const size = normalizeSize(sourceTemplateId);
    return (/^affiliate_ia_/i.test(clean(sourceTemplateId)) && size === '1200x628')
      || size === '728x90'
      || size === '468x60'
      || size === '1500x200';
  }

  function applyDirectionalCornerRules(template, sourceTemplateId, kind) {
    if (kind === 'biggo') setDirectionalCorners(template, '上方BAR_BG', { top: false, bottom: true });
    if (directionalCornerExcluded(sourceTemplateId)) return;
    layerEntries(template).forEach(([key, layer]) => {
      const name = canonicalLayerName(key, layer);
      if (/^白色色塊(?:_\d+)?$/i.test(name)) setDirectionalCorners(template, name, { top: true, bottom: false });
    });
    setDirectionalCorners(template, 'CTA_BG', { top: false, bottom: true });
  }

  function textLayerWidth(layer) {
    const text = String(layer?.text || '');
    if (!text) return 0;
    const canvas = typeof OffscreenCanvas === 'function'
      ? new OffscreenCanvas(1, 1)
      : (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return Number(layer?.width || 0);
    const sourceRanges = Array.isArray(layer.textStyleRanges) && layer.textStyleRanges.length
      ? [...layer.textStyleRanges].sort((a, b) => Number(a.from || 0) - Number(b.from || 0))
      : [{ from: 0, to: text.length }];
    const measureSegment = (segment, style = {}) => {
      if (!segment) return 0;
      const fontSize = Number(style.fontSizePx || layer.fontSizePx || 24);
      const fontWeight = style.fontWeight || layer.fontWeight || 400;
      const rawFontStyle = String(style.fontStyle || style.fontStyleName || layer.fontStyle || '').toLowerCase();
      const fontStyle = rawFontStyle.includes('italic') ? 'italic' : rawFontStyle.includes('oblique') ? 'oblique' : 'normal';
      const fontFamily = style.fontFamily || layer.fontFamily || 'sans-serif';
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${String(fontFamily).replace(/"/g, '')}"`;
      const spacing = Number(style.letterSpacing ?? layer.letterSpacing ?? 0);
      return ctx.measureText(segment).width + Math.max(0, segment.length - 1) * spacing;
    };
    let width = 0;
    let cursor = 0;
    let previousStyle = sourceRanges[0] || {};
    sourceRanges.forEach((range) => {
      const from = Math.max(cursor, Math.min(text.length, Number(range.from || 0)));
      const to = Math.max(from, Math.min(text.length, Number(range.to ?? text.length)));
      if (from > cursor) width += measureSegment(text.slice(cursor, from), previousStyle);
      width += measureSegment(text.slice(from, to), range);
      cursor = Math.max(cursor, to);
      previousStyle = range;
    });
    if (cursor < text.length) width += measureSegment(text.slice(cursor), previousStyle);
    return width;
  }

  function applyFlexibleBigGoBar(template) {
    const bgEntry = findLayerEntry(template, '上方BAR_BG');
    const textEntry = findLayerEntry(template, '上方BAR_文案');
    if (!bgEntry || !textEntry) return false;
    const bg = bgEntry[1];
    const text = textEntry[1];
    const actualTextWidth = textLayerWidth(text);
    const currentWidth = Number(bg.width || 0);
    const textFrameWidth = Number(text.width || actualTextWidth || 0);
    if (!(actualTextWidth > 0) || Math.abs(currentWidth - textFrameWidth) >= 25) return false;
    const nextWidth = actualTextWidth + 48;
    const textCenterX = Number.isFinite(Number(text.centerX))
      ? Number(text.centerX)
      : Number(text.x || 0) + Number(text.width || 0) / 2;
    bg.width = nextWidth;
    bg.x = textCenterX - nextWidth / 2;
    bg.centerX = textCenterX;
    bg.centerY = Number.isFinite(Number(bg.centerY)) ? Number(bg.centerY) : Number(bg.y || 0) + Number(bg.height || 0) / 2;
    bg.useDynamicBounds = true;
    return true;
  }

  function prepareCommonLayers(template, sourceTemplateId) {
    markGuides(template);
    layerEntries(template).forEach(([key, layer]) => {
      const canonicalName = canonicalLayerName(key, layer);
      layer.__networkCanonicalName = canonicalName;
      if (layer.type !== 'image') return;

      if (normalizeLayerName(canonicalName) === normalizeLayerName('KV_BG')) {
        layer.__networkAssetSpec = {
          kind: 'kv-bg',
          stem: `${sourceTemplateId}_KV_BG`,
          preferredFolder: 'affiliate',
          required: true,
        };
        layer.assetFilename = '';
        layer.assetProject = 'affiliate';
        layer.locked = true;
        layer.__nonInteractive = true;
        layer.__hideFromAssetWorkspace = true;
        layer.hidden = false;
        return;
      }

      const isDynamicIaLogo = /^LOGO_\d+$/i.test(canonicalName);
      if (isDynamicIaLogo) {
        // Source IA templates do not have a shop mapping yet. Clear the PSD-export placeholder filename
        // so loading the raw template never probes nonexistent prefixed PNG files. build() assigns the
        // real dynamic-logo spec after the combination range is known.
        layer.assetFilename = '';
        layer.assetCandidates = [];
        layer.__assetMissing = true;
        return;
      }
      const isFixedLogoOrUsp = /LOGO|USP/i.test(canonicalName);
      if (isFixedLogoOrUsp) {
        layer.__networkAssetSpec = {
          kind: 'fixed',
          stem: canonicalName,
          preferredFolder: 'affiliate',
          required: true,
        };
        layer.assetFilename = '';
        layer.assetProject = 'affiliate';
        layer.hidden = false;
      }
    });
  }

  function prepareTemplate(template) {
    if (!template || !template.layers) return template;
    const sourceTemplateId = clean(template.templateId || template.canvas?.templateId || template.source?.psdName || '');
    if (!/^affiliate(?:_|$)/i.test(sourceTemplateId)) return template;
    template.ruleFamily = 'network-affiliate';
    prepareCommonLayers(template, sourceTemplateId);
    return template;
  }

  function extractFolderFromFilename(filename, fallback = '未分類') {
    const match = clean(filename).replace(/\.(png|jpe?g)$/i, '').match(/_(\d+)$/);
    return match ? String(Number(match[1])).padStart(2, '0') : fallback;
  }

  function parseBigGoGroup(shopText) {
    const match = clean(shopText).match(/第\s*(\d+)\s*(?:間|家)?/);
    return match ? Number(match[1]) : null;
  }

  function parseIaBlockIndex(record) {
    const filenameMatch = clean(record.filename).replace(/\.(png|jpe?g)$/i, '').match(/_(\d+)$/);
    if (filenameMatch) return Number(filenameMatch[1]);
    return record.combination;
  }

  function initializeRenderState(template, clone) {
    delete template.__renderModel;
    delete template.__renderState;
    const initial = clone(template);
    template.__renderModel = initial;
    // The live template object itself is RenderState; keep only lightweight metadata here.
    template.__renderState = { initialized: true, source: 'live-template' };
  }

  function build({ rows, sourceTemplates, clone }) {
    const parsed = parse(rows);
    if (!parsed) return null;

    const warnings = [...parsed.warnings];
    const errors = [...parsed.errors];
    const generated = [];
    const unmatched = [];
    const logoByGroup = new Map();

    // Only ordinary Affiliate rows are allowed to establish combination -> shop LOGO.
    for (const record of parsed.records) {
      if (record.__rowKind !== 'general' || !record.combination) continue;
      const logoFilename = basenameFromUrl(record.logo);
      if (!logoFilename) {
        if (clean(record.logo)) warnings.push(`第 ${record.__sourceRow} 列 LOGO 不是有效網址`);
        continue;
      }
      const stem = filenameStem(logoFilename);
      const current = logoByGroup.get(record.combination);
      if (!current) logoByGroup.set(record.combination, { stem, url: clean(record.logo), sourceRow: record.__sourceRow });
      else if (normalize(current.stem) !== normalize(stem)) {
        warnings.push(`第 ${record.__sourceRow} 列組合 ${record.combination} 有不同 LOGO；使用第 ${current.sourceRow} 列的第一個網址`);
      }
    }

    const usedNames = new Map();
    const uniqueName = (rawName, sourceRow) => {
      let base = safeName(rawName);
      if (!base) base = `未命名_第${String(sourceRow).padStart(2, '0')}列`;
      const count = (usedNames.get(base) || 0) + 1;
      usedNames.set(base, count);
      if (count === 1) return base;
      warnings.push(`第 ${sourceRow} 列檔名重複；自動改為 ${base}_${count}`);
      return `${base}_${count}`;
    };

    for (const record of parsed.records) {
      let kind = record.__rowKind;
      let folder = '未分類';
      let templateId = '';
      let outputName = '';

      if (kind === 'ia') {
        templateId = `Affiliate_IA_NB_${record.size}`;
        folder = 'All';
        const blockIndex = parseIaBlockIndex(record);
        outputName = `Affiliate_IA_${record.size}_${blockIndex || generated.filter((item) => item.data?.__networkMeta?.kind === 'ia').length + 1}`;
      } else if (kind === 'biggo') {
        templateId = `affiliate_${record.size}`;
        folder = extractFolderFromFilename(record.filename);
        outputName = uniqueName(record.filename, record.__sourceRow);
      } else {
        if (!record.combination) {
          errors.push(`第 ${record.__sourceRow} 列組合必須是正整數；未產生`);
          continue;
        }
        const groupLogo = logoByGroup.get(record.combination);
        kind = groupLogo ? 'brand' : 'nobrand';
        templateId = kind === 'brand' ? `affiliate_${record.size}` : `affiliate_${record.size}_無品牌`;
        folder = kind === 'nobrand' ? '無品牌' : extractFolderFromFilename(record.filename);
        outputName = uniqueName(record.filename, record.__sourceRow);
      }

      const sourceTemplate = templateById(sourceTemplates, templateId);
      if (!sourceTemplate) {
        const reason = `第 ${record.__sourceRow} 列缺少公版 ${templateId}`;
        unmatched.push({ name: templateId, reason });
        warnings.push(`第 ${record.__sourceRow} 列模板不存在：${templateId}`);
        continue;
      }

      const data = clone(sourceTemplate.data);
      const sourceTemplateId = clean(data.templateId || data.canvas?.templateId || templateId);
      prepareCommonLayers(data, sourceTemplateId);

      data.templateId = outputName;
      data.ruleFamily = 'network-affiliate';
      data.batchProject = 'affiliate';
      data.batchRecord = {
        ...record,
        __network: true,
        __networkKind: kind,
        __outputFolder: folder,
      };
      data.__networkMeta = {
        kind,
        folder,
        sourceRow: record.__sourceRow,
        outputName,
        sourceTemplateId,
      };

      if (kind === 'brand') {
        const groupLogo = logoByGroup.get(record.combination);
        setAssetSpec(data, 'P', {
          kind: 'dynamic-logo',
          stem: groupLogo?.stem || '',
          preferredFolder: 'LOGO',
          required: true,
          group: record.combination,
        });
        bindAssetLayerToGuide(data, 'P', 'P_範圍');
        setVisible(data, 'P', true);
        setVisible(data, 'P_02', false);
        setVisible(data, '上方BAR_BG', false);
        setVisible(data, '上方BAR_文案', false);
      }

      if (kind === 'biggo') {
        setVisible(data, 'P', false);
        setVisible(data, 'P_02', true);
        setVisible(data, '上方BAR_BG', true);
        setVisible(data, '上方BAR_文案', true);

        const group = parseBigGoGroup(record.shop);
        const groupLogo = group ? logoByGroup.get(group) : null;
        if (!group) warnings.push(`第 ${record.__sourceRow} 列 BigGo 店家欄無法解析第 N 間；素材將顯示缺失`);
        else if (!groupLogo) warnings.push(`第 ${record.__sourceRow} 列 BigGo 找不到組合 ${group} 的 LOGO；素材將顯示缺失`);
        setAssetSpec(data, 'P_02', {
          kind: 'dynamic-logo',
          stem: groupLogo?.stem || '',
          preferredFolder: 'LOGO',
          required: true,
          group,
        });
        bindAssetLayerToGuide(data, 'P_02', 'P_範圍');

        const percent = percentText(record.logo);
        const textEntry = findLayerEntry(data, '上方BAR_文案');
        if (textEntry && percent) {
          const textLayer = textEntry[1];
          textLayer.text = String(textLayer.text || '現金回饋10%').replace(/\d+(?:\.\d+)?\s*%/, percent);
        } else if (!percent) {
          warnings.push(`第 ${record.__sourceRow} 列 BigGo 回饋比例無效；保留預設文字`);
        }
        applyFlexibleBigGoBar(data);
      }

      if (kind === 'ia') {
        if (record.size !== '1200x628') warnings.push(`第 ${record.__sourceRow} 列 Affiliate IA 目前僅支援 1200x628`);
        const blockIndex = parseIaBlockIndex(record);
        const startGroup = blockIndex ? (blockIndex - 1) * 5 + 1 : null;
        for (let index = 1; index <= 5; index += 1) {
          const layerName = `LOGO_0${index}`;
          const group = startGroup ? startGroup + index - 1 : null;
          const groupLogo = group ? logoByGroup.get(group) : null;
          if (group && !groupLogo) warnings.push(`第 ${record.__sourceRow} 列 Affiliate IA 找不到組合 ${group} 的 LOGO；${layerName} 保留缺失位置`);
          setAssetSpec(data, layerName, {
            kind: 'dynamic-logo',
            stem: groupLogo?.stem || '',
            preferredFolder: 'LOGO',
            required: true,
            group,
          });
          bindAssetLayerToGuide(data, layerName, `P_範圍_0${index}`);
        }
      }

      applyDirectionalCornerRules(data, sourceTemplateId, kind);
      initializeRenderState(data, clone);
      generated.push({
        name: outputName,
        file: `${outputName}.generated`,
        visible: true,
        data,
        batchRecord: data.batchRecord,
        project: 'affiliate',
      });
    }

    return {
      generated,
      unmatched,
      emptyBlocks: [],
      diagnostics: {
        network: true,
        parsedBlockCount: 1,
        recordCount: parsed.records.length,
        warnings,
        errors,
        skippedRows: [],
        generatedCount: generated.length,
        unmatchedCount: unmatched.length,
      },
    };
  }

  function diagnosticText(diagnostics, elapsedMs = 0) {
    const warnings = diagnostics?.warnings || [];
    const errors = diagnostics?.errors || [];
    return [
      '【成功】',
      `✓ 共解析 ${diagnostics?.recordCount || 0} 筆資料`,
      `✓ 成功輸出 ${diagnostics?.generatedCount || 0} 張`,
      '',
      '【警告】',
      ...(warnings.length ? warnings.map((message) => `⚠ ${message}`) : ['（無）']),
      '',
      '【失敗】',
      ...(errors.length ? errors.map((message) => `✗ ${message}`) : ['（無）']),
      '',
      '【統計】',
      `成功：${diagnostics?.generatedCount || 0}`,
      `警告：${warnings.length}`,
      `失敗：${errors.length}`,
      `耗時：${(elapsedMs / 1000).toFixed(2)} 秒`,
    ].join('\r\n');
  }

  window.NetworkAffiliateEngine = Object.freeze({
    findHeader,
    parse,
    build,
    diagnosticText,
    safeName,
    normalizeSize,
    normalizeLayerName,
    filenameStem,
    extensionRank,
    prepareTemplate,
    imageExtensions: IMAGE_EXTENSIONS,
    decodeUnicodeEscapes,
  });
})();
