/* 18節 正式BN — A 系函式級覆寫（自動抽取，請勿手改；重跑 tests/tools/extract-legacy18.js）
 *
 * 來源：正式BN/18節_正式BN_Tool_V7.4/core/app.core.js
 * 載入時機：profile.coreScripts 排在 core/app.core.js 之後。對 B 系物件做 Object.assign，被蓋掉的 25節 版本仍在 core 內供其他 profile 使用。
 * 這裡的方法原文一字未改；它們以 this.* 互相呼叫，少數全域（AppState、Geometry、Renderer、TemplateLoader、LayoutRuleEngine、CapsuleRuleEngine、PriceRuleEngine、PriceCouponManager、PriceTransformEngine、LoadingOverlay、TemplateFilter、HistoryManager、SpecOverlayManager、App、LayerManager、Inspector、TextEditor、decodeHashUnicode、scheduleBlobRevoke、PreviewZoom、ProductEngine、ShapeRenderer、TemplateRuleRegistry、TemplateRuleManager、XLSX）由下方 const 取自 window。
 */
(function applyLegacy18Overrides() {
  'use strict';
  if (!window.BatchManager || !window.TemplateLoader) { console.error('[legacy18] core 尚未載入，覆寫略過'); return; }
  const AppState = window.AppState;
  const Geometry = window.Geometry;
  const Renderer = window.Renderer;
  const TemplateLoader = window.TemplateLoader;
  const LayoutRuleEngine = window.LayoutRuleEngine;
  const CapsuleRuleEngine = window.CapsuleRuleEngine;
  const PriceRuleEngine = window.PriceRuleEngine;
  const PriceCouponManager = window.PriceCouponManager;
  const PriceTransformEngine = window.PriceTransformEngine;
  const LoadingOverlay = window.LoadingOverlay;
  const TemplateFilter = window.TemplateFilter;
  const HistoryManager = window.HistoryManager;
  const SpecOverlayManager = window.SpecOverlayManager;
  const App = window.App;
  const LayerManager = window.LayerManager;
  const Inspector = window.Inspector;
  const TextEditor = window.TextEditor;
  const decodeHashUnicode = window.decodeHashUnicode;
  const scheduleBlobRevoke = window.scheduleBlobRevoke;
  const PreviewZoom = window.PreviewZoom;
  const ProductEngine = window.ProductEngine;
  const ShapeRenderer = window.ShapeRenderer;
  const TemplateRuleRegistry = window.TemplateRuleRegistry;
  const TemplateRuleManager = window.TemplateRuleManager;
  const XLSX = window.XLSX;
  // 18節 core 的檔頭小工具（原文），覆寫方法會用到：
  const $ = (id) => document.getElementById(id);
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const round = (num, d = 1) => Number(Number(num || 0).toFixed(d));
  const getRuleSection = (family, section) => window.TemplateRuleRegistry?.getRules?.(family, section) || {};
  const normStr = (value) => String(value || '').toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[\s\u00a0\u3000\t\r\n_\-()（）\[\]【】.]+/g, '');
  const encodeAssetPath = (path) => String(path || '').split('/').map((part) => encodeURIComponent(part)).join('/');
  const EMBEDDED_ASSETS = Object.freeze({});
  // DEFAULT_TEMPLATE（內嵌 DD Card 保底範本）依決策 D9 不搬：findTemplateForName 有 typeof 守衛，找不到公版就進 unmatched。
  const DOM = {
    canvas: $('canvas'), loadStatus: $('loadStatus'), batchPreviewGrid: $('batchPreviewGrid'), batchPreviewPanel: $('batchPreviewPanel'),
    batchStatus: $('batchStatus'), excelSheetSelect: $('excelSheetSelect'),
  };
  const ctx = DOM.canvas.getContext('2d');

  // 18節 A 系把素材存成扁平 Map(檔名 → File)（AppState.assetFiles）＋ 暖身另有 assetFilesByFolder；25節 AssetStore 預期 Map(資料夾 → Map)。
  // 這裡讓整合核心其他模組（存檔、手動素材、票券、擷取器）用同一組 API 讀到扁平表，不改 18節 方法本身。
  Object.assign(window.AssetStore, {
    getBucket() { return AppState.assetFiles || new Map(); },
    getTotalFileCount() { return (AppState.assetFiles || new Map()).size; },
    getFolderNames() { return [...(AppState.assetFilesByFolder || new Map()).keys()]; },
    getFlatForLookup() { return AppState.assetFiles || new Map(); },
    getFileEntries() {
      return [...(AppState.assetFiles || new Map())].filter(([, file]) => file instanceof Blob).map(([lookupName, file]) => {
        const manual = !file.webkitRelativePath;
        const relativePath = decodeHashUnicode(file.webkitRelativePath || lookupName || file.name || '');
        return { file, folder: manual ? (String(lookupName || '').includes('/') ? String(lookupName).split('/').slice(0, -1).join('/') : '手動替換') : relativePath.split('/').slice(1, -1).join('/'), filename: decodeHashUnicode(file.name || lookupName), lookupName: manual ? lookupName : relativePath, relativePath };
      });
    },
    // 手動素材直接以查找名放進扁平表（18節 lookup 用完整檔名精準命中）；存檔／載回走同一支。
    registerManualFile(bucketName, lookupName, file) {
      if (!(AppState.assetFiles instanceof Map)) AppState.assetFiles = new Map();
      AppState.assetFiles.set(lookupName, file);
    },
  });

  // 頭巾分流常數（18節 core 檔頭原文；rules/暖身BN/template-routing.js 已先載入 window.TemplateRoutingConfig）
  const HEADBAND_SHEET_ROUTES = Object.freeze(
    window.TemplateRoutingConfig?.headbandSheetRoutes || [
      { key: 'headband_vip', family: 'headband_vip', label: '頭巾 VIP', logoKeywords: ['viplogo', 'vip', '蝦皮viplogo', '蝦皮vip'], templateId: '01_頭巾_VIP', templateFile: '01_頭巾_VIP.json', ruleFile: 'headband_VIP.rules.js', outputPrefix: '頭巾_VIP' },
      { key: 'headband_shopee', family: 'headband_shopee', label: '頭巾 蝦皮購物', logoKeywords: ['蝦皮 logo', '蝦皮logo', '蝦皮購物', 'shopee logo', 'shopeelogo', 'shopee'], templateId: '01_頭巾_蝦皮購物', templateFile: '01_頭巾_蝦皮購物.json', ruleFile: 'headband_shopee.rules.js', outputPrefix: '頭巾_蝦皮購物' },
    ]
  );
  const TEMPLATE_ROUTING_CELLS = Object.freeze({
    placementCell: 'B17', variantHeaderCell: 'F16', placementKeywords: ['頭巾'], variantHeaderKeywords: ['版配'],
    logoCells: ['I28', 'I29', 'I27', 'I30'], logoFallbackColumn: 'I', logoFallbackStartRow: 25, logoFallbackEndRow: 35,
    ...(window.TemplateRoutingConfig?.sheetCells || {}),
  });

  // ── BatchManager（37 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.BatchManager, {
    fields: ['主標', '副標', '警語', '商品圖1', '商品圖2', '商品圖_左', '商品圖_中', '商品圖_右', 'CTA', '價格', '價格_左', '價格_中', '價格_右', '文案_左', '文案_中', '文案_右', '票券', '票券案型', '版位'],
    expandRecordVariantsForTemplate(template, record) {
      const family = template?.ruleFamily || template?.sheetTemplateRoute?.family || CapsuleRuleEngine.getTemplateFamily(template);
      const rules = (window.TemplateRuleManager || window.TemplateRuleRegistry)?.getRules?.(family) || {};
      const variantFactory = rules?.createVariantRecords
        || rules?.expandRecordVariants
        || rules?.variantRules?.createVariantRecords;

      if (typeof variantFactory !== 'function') return [record];

      try {
        const variants = variantFactory({ ...record }, { template, family });
        return Array.isArray(variants) && variants.length ? variants : [record];
      } catch (error) {
        console.warn('[Batch] expandRecordVariants failed:', { family, error });
        return [record];
      }
    },
    normalizeOutputSuffix(value) {
      return String(value || '')
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '')
        .replace(/^_+|_+$/g, '');
    },
    parseRows(rows) {
      const blocks = [];
      const warnings = [];
      const skippedRows = [];
      let anchorCount = 0;

      const clean = (value) => String(value ?? '').trim();
      const isAnchor = (cell) => {
        const normalized = this.norm(cell);
        return normalized.includes(this.norm('製作內容')) || normalized === this.norm('版位') || normalized.includes(this.norm('版位'));
      };
      const hasText = (value) => clean(value) !== '';
      const toNumber = (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const m = clean(value).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
        return m ? Number(m[0]) : 0;
      };
      const rowHasAnchor = (row) => (row || []).some(isAnchor);
      const rowIsMostlyEmpty = (row) => !(row || []).some((cell) => hasText(cell));

      // 依照這份 Excel 的欄位命名做精準對應：
      // 「主標」必須以主標開頭，避免把「主題日/活動」誤抓成主標。
      // 「副標」優先支援 USP/副標、副標；警語/商品圖/CTA 維持容錯。
      const detectColMap = (row) => {
        const colMap = {};
        const setOnce = (field, c) => {
          if (colMap[field] === undefined) colMap[field] = c;
        };
        (row || []).forEach((cell, c) => {
          const raw = clean(cell);
          const normalized = this.norm(raw);
          if (!normalized) return;

          // 明確排除非文案欄位：日期、主題日/頁面、頁面、版配、尺寸等，不參與任何欄位判斷，降低誤抓率。
          const blockedHeaderWords = [
            '日期', '主題日', '主題日頁面', '主題頁面', '頁面', '活動頁', '活動頁面',
            '製作內容', '數量', 'k數', '尺寸', '版配', '規格', '備註', '說明'
          ].map((word) => this.norm(word));
          if (blockedHeaderWords.some((word) => normalized === word || normalized.includes(word))) return;

          // 主標：只接受「主標...」或英文 title，不接受「主題日/活動」。
          if (normalized.startsWith(this.norm('主標')) || normalized === 'title' || normalized.startsWith('title')) {
            setOnce('主標', c);
          }
          // 副標：接受「副標...」、「USP/副標...」、「USP...」與英文 subtitle。
          else if (normalized.startsWith(this.norm('副標')) || normalized.includes(this.norm('usp副標')) || normalized.startsWith('usp') || normalized === 'subtitle' || normalized.startsWith('subtitle')) {
            setOnce('副標', c);
          }
          else if (normalized.includes(this.norm('警語')) || normalized.includes(this.norm('法務')) || normalized.includes('legal')) {
            setOnce('警語', c);
          }
          else if (normalized === this.norm('商品圖_左') || normalized === this.norm('商品圖左') || normalized === this.norm('左商品圖')) {
            setOnce('商品圖_左', c);
            setOnce('商品圖1', c);
          }
          else if (normalized === this.norm('商品圖_中') || normalized === this.norm('商品圖中') || normalized === this.norm('中商品圖')) {
            setOnce('商品圖_中', c);
          }
          else if (normalized === this.norm('商品圖_右') || normalized === this.norm('商品圖右') || normalized === this.norm('右商品圖')) {
            setOnce('商品圖_右', c);
            setOnce('商品圖2', c);
          }
          else if (normalized.includes(this.norm('商品圖1')) || normalized.includes(this.norm('商品圖一')) || normalized.includes('productimage1')) {
            setOnce('商品圖1', c);
          }
          else if (normalized.includes(this.norm('商品圖2')) || normalized.includes(this.norm('商品圖二')) || normalized.includes('productimage2')) {
            setOnce('商品圖2', c);
          }
          else if (normalized === this.norm('票券') || normalized.includes(this.norm('票券類型')) || normalized.includes(this.norm('票券LOGO'))) {
            setOnce('票券', c);
          }
          else if (normalized.includes(this.norm('票券案型')) || normalized.includes(this.norm('案型'))) {
            setOnce('票券案型', c);
          }
          else if (normalized === this.norm('版位') || normalized.includes(this.norm('版位'))) {
            setOnce('版位', c);
          }
          else if (normalized.includes('cta') || normalized.includes(this.norm('按鈕'))) {
            setOnce('CTA', c);
          }
          else if (normalized === this.norm('文案_左') || normalized === this.norm('文案左')) {
            setOnce('文案_左', c);
          }
          else if (normalized === this.norm('文案_中') || normalized === this.norm('文案中')) {
            setOnce('文案_中', c);
          }
          else if (normalized === this.norm('文案_右') || normalized === this.norm('文案右')) {
            setOnce('文案_右', c);
          }
          else if (normalized === this.norm('價格_左') || normalized === this.norm('價格左')) {
            setOnce('價格_左', c);
          }
          else if (normalized === this.norm('價格_中') || normalized === this.norm('價格中')) {
            setOnce('價格_中', c);
          }
          else if (normalized === this.norm('價格_右') || normalized === this.norm('價格右')) {
            setOnce('價格_右', c);
          }
          else if (normalized.includes(this.norm('價格')) || normalized.includes('price')) {
            setOnce('價格', c);
          }
        });
        return colMap;
      };

      const findHeaderCandidates = () => {
        const candidates = [];
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r] || [];
          const anchorCol = row.findIndex(isAnchor);
          if (anchorCol < 0) continue;
          anchorCount += 1;
          const colMap = detectColMap(row);
          const hasCoreFields = this.fields.some((field) => colMap[field] !== undefined);
          const hasHeadbandBlockBelow = (() => {
            for (let rr = r + 1; rr < Math.min(rows.length, r + 40); rr += 1) {
              const nextRow = rows[rr] || [];
              if (rowHasAnchor(nextRow)) break;
              if (this.isHeadbandBlockName(nextRow[anchorCol])) return true;
            }
            return false;
          })();
          if (hasCoreFields || hasHeadbandBlockBelow) candidates.push({ headerRow: r, anchorCol, colMap });
          else warnings.push(`第 ${r + 1} 列找到「製作內容」，但同列沒有主標/副標/警語/商品圖/CTA/票券欄位`);
        }
        return candidates;
      };

      const headerCandidates = findHeaderCandidates();
      for (let hIndex = 0; hIndex < headerCandidates.length; hIndex++) {
        const header = headerCandidates[hIndex];
        const nextHeaderRow = hIndex + 1 < headerCandidates.length ? headerCandidates[hIndex + 1].headerRow : rows.length;
        const qtyCol = (rows[header.headerRow] || []).findIndex((cell) => this.norm(cell) === this.norm('數量'));
        const firstFieldCol = Math.min(...Object.values(header.colMap));

        for (let r = header.headerRow + 1; r < nextHeaderRow; r++) {
          const row = rows[r] || [];
          if (rowHasAnchor(row)) break;
          if (rowIsMostlyEmpty(row)) continue;

          const productName = clean(row[header.anchorCol]);
          if (!productName) {
            const maybeRecord = this.readRecordFromRow(row, header.colMap);
            const hasMaybeContent = this.fields.some((field) => hasText(maybeRecord[field]));
            if (hasMaybeContent) skippedRows.push({ row: r + 1, reason: '製作內容欄空白，但同列有主標/副標/素材資料，無法判斷要套哪個公版' });
            continue;
          }

          // V3.7 Parser 重構：所有公版名稱（HBN / HAN / DD Card / DDC ...）都共用同一套起點判斷。
          // 遇到公版名稱時，不再從公版名稱所在列開始讀；會先往上回溯最近的「主標」列，
          // 再由主標列往下建立該筆製作物，避免 DD Card / HBN 的主標被跳過。
          const quantity = qtyCol >= 0 ? Math.max(0, Math.floor(toNumber(row[qtyCol]))) : 0;
          const currentRecord = this.readRecordFromRow(row, header.colMap);
          const hasCurrentContent = this.fields.some((field) => hasText(currentRecord[field]));
          const isKnownTemplateName = !!this.findTemplateRuleForName(productName);
          const isHeadbandBlock = this.isHeadbandBlockName(productName);
          if (isHeadbandBlock) {
            const records = this.readHeadbandRecords(rows, header, r, nextHeaderRow);
            if (records.length) {
              blocks.push({
                name: productName,
                headerRow: header.headerRow,
                startRow: r,
                quantity,
                records,
                colMap: header.colMap,
                templateType: 'headband',
              });
            } else {
              warnings.push(`第 ${r + 1} 列製作物「${productName}」沒有讀到頭巾票券資料`);
            }
            continue;
          }

          const findNearestMainTitleRow = () => {
            for (let up = r; up > header.headerRow; up--) {
              const upRow = rows[up] || [];
              if (rowHasAnchor(upRow)) break;
              const upProductName = clean(upRow[header.anchorCol]);
              const upQty = qtyCol >= 0 ? toNumber(upRow[qtyCol]) : 0;

              // 如果往上遇到另一個有數量的製作物，就停止，避免跨到上一筆。
              if (up !== r && upProductName && upQty) break;

              const upRecord = this.readRecordFromRow(upRow, header.colMap);
              if (hasText(upRecord['主標'])) return up;
            }
            return r;
          };
          const recordStartRow = findNearestMainTitleRow();
          const hasBacktrackedMainTitle = recordStartRow !== r;

          // 避免把說明列或補充列誤當製作物：
          // 一般列需要有數量或同列內容；但已知公版名稱可接受「同列無內容」，只要上方可回溯到主標。
          if (!quantity && !hasCurrentContent && !(isKnownTemplateName && hasBacktrackedMainTitle)) {
            skippedRows.push({ row: r + 1, name: productName, reason: '沒有數量，也沒有主標/副標/警語/商品圖/CTA，且無法回溯到主標' });
            warnings.push(`第 ${r + 1} 列「${productName}」沒有數量，也沒有可套用欄位，已略過`);
            continue;
          }

          const takeCount = quantity || 9999;
          const records = [];
          let scannedRows = 0;

          for (let dr = recordStartRow; dr < nextHeaderRow && records.length < takeCount; dr++) {
            const dataRow = rows[dr] || [];
            if (rowHasAnchor(dataRow)) break;

            // 同一欄位區塊可能會連續列出多個製作物，並共用後續文案列。
            // 例如：第 89 列 HBN-C2C (DD card)、第 90 列 HBN-Mall，後面 91~110 是共用文案。
            // 讀 HBN-C2C 時不可把 HBN-Mall 那列也算進去；讀 HBN-Mall 時則保留自己的第一列。
            const rowProductName = clean(dataRow[header.anchorCol]);
            const rowQty = qtyCol >= 0 ? toNumber(dataRow[qtyCol]) : 0;
            const isOtherProductStart = dr !== r && rowProductName && rowQty;
            if (isOtherProductStart) {
              if (quantity) continue;
              break;
            }

            if (rowIsMostlyEmpty(dataRow)) {
              // 已開始讀取後遇到連續空白，就結束此製作物區塊，避免掃到下一個區塊的說明文字。
              if (records.length) break;
              continue;
            }

            const record = this.readRecordFromRow(dataRow, header.colMap);
            const hasAny = this.fields.some((field) => hasText(record[field]));
            if (hasAny) records.push(record);
            scannedRows += 1;

            // 沒有明確數量時，遇到下一個有名稱+數量的製作物就停止。
            if (!quantity && dr > r) {
              const nextName = clean(dataRow[header.anchorCol]);
              const nextQty = qtyCol >= 0 ? toNumber(dataRow[qtyCol]) : 0;
              if (nextName && nextQty) break;
            }

            // 保護：無數量時最多掃 80 列。
            if (!quantity && scannedRows >= 80) break;
          }

          if (records.length && quantity && records.length < quantity) {
            warnings.push(`第 ${r + 1} 列製作物「${productName}」數量為 ${quantity}，但只讀到 ${records.length} 筆有效資料`);
          }

          if (records.length) {
            blocks.push({
              name: productName,
              headerRow: header.headerRow,
              startRow: r,
              quantity,
              records,
              colMap: header.colMap,
            });
          } else {
            warnings.push(`第 ${r + 1} 列製作物「${productName}」沒有讀到主標/副標/警語/商品圖/CTA 資料`);
          }
        }
      }

      if (!headerCandidates.length && anchorCount) warnings.push('有找到「製作內容」，但沒有任何同列欄位可解析。');
      return { blocks, anchorCount, warnings, skippedRows };
    },
    isHeadbandBlockName(name) {
      return this.normalizeRouteValue(name).includes(this.normalizeRouteValue('頭巾'));
    },
    hasRouteKeyword(value, keywords = []) {
      const normalized = this.normalizeRouteValue(value);
      return keywords.some((keyword) => normalized.includes(this.normalizeRouteValue(keyword)));
    },
    resolveRecordTemplateRoute(block = {}, record = {}) {
      const templateRule = this.findTemplateRuleForName(block.name);
      const registeredRules = templateRule?.family
        ? window.TemplateRuleRegistry?.getRules?.(templateRule.family)
        : null;
      if (typeof registeredRules?.resolveRecordTemplateRoute === 'function') {
        const route = registeredRules.resolveRecordTemplateRoute({
          block,
          record,
          helpers: {
            normalizeRouteValue: this.normalizeRouteValue.bind(this),
            norm: this.norm.bind(this),
          },
        });
        if (route) return route;
      }

      if (!this.isHeadbandBlockName(block.name)) return null;
      const ticket = String(record['票券'] || '').trim();
      if (!ticket) return null;
      const route = HEADBAND_SHEET_ROUTES.find((item) => this.hasRouteKeyword(ticket, item.logoKeywords || []));
      if (!route) return {
        key: 'headband_unmatched_ticket',
        label: '頭巾 未匹配票券',
        templateId: '',
        templateFile: '',
        ruleFile: '',
        outputPrefix: '頭巾',
        missingReason: `頭巾票券「${ticket}」未對應任何公版，請檢查 config/template-routing.js`,
      };
      return { ...route, ticket };
    },
    splitHeadbandCopy(value) {
      const raw = String(value || '').replace(/_x000d_/gi, '\n').trim();
      if (!raw) return { subtitle: '', legal: '' };
      const parts = raw.split(/\n+/).map((item) => item.trim()).filter(Boolean);
      const legalIndex = parts.findIndex((item) => /小字|法務|legal/i.test(item));
      if (legalIndex >= 0) {
        const legal = parts.slice(legalIndex).join('\n').replace(/^小字\s*[:：]?\s*/i, '').replace(/^法務小字\s*[:：]?\s*/i, '').trim();
        return { subtitle: parts.slice(0, legalIndex).join('\n').trim(), legal };
      }
      return { subtitle: parts.join('\n'), legal: '' };
    },
    readHeadbandRecords(rows, header, startRow, nextHeaderRow) {
      const records = [];
      const clean = (value) => String(value ?? '').trim();
      const baseRecord = this.readRecordFromRow(rows[startRow] || [], header.colMap);
      const hasMappedTicket = header.colMap['票券'] !== undefined;
      const hasMappedTicketCase = header.colMap['票券案型'] !== undefined;

      if (hasMappedTicket || hasMappedTicketCase) {
        for (let r = startRow; r < nextHeaderRow; r += 1) {
          const record = this.readRecordFromRow(rows[r] || [], header.colMap);
          if (!this.normalizeRouteValue(record['票券'])) continue;
          records.push({
            ...baseRecord,
            ...record,
            '主標': record['主標'] || baseRecord['主標'] || '',
            '副標': record['副標'] || baseRecord['副標'] || '',
            __sourceRow: r + 1,
          });
        }
        return records;
      }

      // Backward-compatible fallback for current 18節 BN sheets:
      // 「頭巾」是一組兩列資料：
      // - 上列：F=主標/LOGO、J=票券案型、K=CTA
      // - 下列：F=副標/小字、I=票券（VIP logo / 蝦皮購物）
      const headbandRoutes = HEADBAND_SHEET_ROUTES || [];
      const findTicketInRow = (row = []) => {
        // 現有 18節 BN 頭巾票券放在 I 欄；優先只看 I 欄，避免誤把「VIP+一次領」這類案型文字判斷成票券。
        const preferredCells = [row?.[8]].filter(Boolean);
        const preferred = preferredCells.find((cell) =>
          headbandRoutes.some((route) => this.hasRouteKeyword(cell, route.logoKeywords || []))
        );
        if (preferred) return preferred;

        // 其他欄位只接受明確 logo / 蝦皮購物 字樣，避免一般文案中的 VIP 誤判。
        return (row || []).find((cell) => {
          const normalized = this.normalizeRouteValue(cell);
          const looksLikeTicket = normalized.includes('logo') || normalized.includes(this.normalizeRouteValue('蝦皮購物'));
          return looksLikeTicket && headbandRoutes.some((route) => this.hasRouteKeyword(cell, route.logoKeywords || []));
        }) || '';
      };
      const hasPayload = (row = []) => [5, 8, 9, 10].some((idx) => clean(row[idx] || ''));

      for (let r = startRow + 1; r < nextHeaderRow; r += 1) {
        const topRow = rows[r] || [];
        if (!hasPayload(topRow)) continue;

        const nextRow = rows[r + 1] || [];
        const topTicket = findTicketInRow(topRow);
        const nextTicket = findTicketInRow(nextRow);
        const ticketCandidate = topTicket || nextTicket;
        if (!ticketCandidate) continue;

        const ticketRow = nextTicket ? nextRow : topRow;
        const titleRow = topTicket ? rows[Math.max(startRow, r - 1)] || topRow : topRow;
        const copy = this.splitHeadbandCopy(ticketRow[5] ?? titleRow[5] ?? ''); // F欄
        const title = clean(titleRow[5] ?? baseRecord['主標'] ?? '');
        const ticketCase = clean(titleRow[9] ?? topRow[9] ?? ticketRow[9] ?? ''); // J欄
        const cta = clean(titleRow[10] ?? topRow[10] ?? ticketRow[10] ?? ''); // K欄

        records.push({
          ...baseRecord,
          '主標': title || baseRecord['主標'] || '',
          '票券': clean(ticketCandidate),
          '票券案型': ticketCase,
          '副標': baseRecord['副標'] || copy.subtitle,
          '警語': baseRecord['警語'] || copy.legal,
          'CTA': baseRecord['CTA'] || cta,
          __sourceRow: (nextTicket ? r + 2 : r + 1),
        });

        if (nextTicket) r += 1;
      }

      return records;
    },
    readRecordFromRow(row, colMap) {
      const record = {};
      for (const field of this.fields) {
        const c = colMap[field];
        record[field] = c === undefined ? '' : String(row?.[c] ?? '').trim();
      }

      // V3.6.5：支援 Excel 單格寫法，例如「主標：4/18 領早鳥$40」或「主標: 4/18 刷卡享88折」。
      // 舊版只吃「欄位標題在表頭、內容在同欄下一列」的結構；若 Excel 把欄名與內容放在同一格，
      // 就會造成 DDC/HBN 的主標沒有被套入。這裡會掃描整列並把冒號後的文字抽出來。
      const inlineAliasMap = [
        { field: '主標', aliases: ['主標', '主標題', 'title'] },
        { field: '副標', aliases: ['副標', '副標題', 'usp/副標', 'usp副標', 'usp', 'subtitle'] },
        { field: '警語', aliases: ['警語', '法務', '法務小字', 'legal'] },
        { field: '商品圖1', aliases: ['商品圖1', '商品圖一', 'productimage1'] },
        { field: '商品圖2', aliases: ['商品圖2', '商品圖二', 'productimage2'] },
        { field: '商品圖_左', aliases: ['商品圖_左', '商品圖左', '左商品圖'] },
        { field: '商品圖_中', aliases: ['商品圖_中', '商品圖中', '中商品圖'] },
        { field: '商品圖_右', aliases: ['商品圖_右', '商品圖右', '右商品圖'] },
        { field: 'CTA', aliases: ['cta', '按鈕', 'button'] },
        { field: '價格', aliases: ['價格', 'price'] },
        { field: '價格_左', aliases: ['價格_左', '價格左', 'leftprice'] },
        { field: '價格_中', aliases: ['價格_中', '價格中', 'middleprice', 'centerprice'] },
        { field: '價格_右', aliases: ['價格_右', '價格右', 'rightprice'] },
        { field: '文案_左', aliases: ['文案_左', '文案左', '左文案'] },
        { field: '文案_中', aliases: ['文案_中', '文案中', '中文案'] },
        { field: '文案_右', aliases: ['文案_右', '文案右', '右文案'] },
        { field: '版位', aliases: ['版位', 'placement', 'position'] },
      ];
      const cells = Array.isArray(row) ? row : [];
      cells.forEach((cell) => {
        const raw = String(cell ?? '').trim();
        if (!raw) return;
        const match = raw.match(/^([^:：]{1,32})\s*[:：]\s*([\s\S]+)$/);
        if (!match) return;
        const label = this.norm(match[1]);
        const value = String(match[2] || '').trim();
        if (!value) return;
        for (const item of inlineAliasMap) {
          if (item.aliases.some((alias) => label === this.norm(alias))) {
            record[item.field] = value;
            break;
          }
        }
      });

      return record;
    },
    sheetCell(rows, address) {
      const match = String(address || '').match(/^([A-Z]+)(\d+)$/i);
      if (!match) return '';
      const colLetters = match[1].toUpperCase();
      const rowIndex = Number(match[2]) - 1;
      let colIndex = 0;
      for (const ch of colLetters) colIndex = colIndex * 26 + (ch.charCodeAt(0) - 64);
      colIndex -= 1;
      return String(rows?.[rowIndex]?.[colIndex] ?? '').trim();
    },
    getRouteLogoValue(rows) {
      const exactCells = Array.isArray(TEMPLATE_ROUTING_CELLS.logoCells)
        ? TEMPLATE_ROUTING_CELLS.logoCells
        : ['I28', 'I29', 'I27', 'I30'];
      const exactValue = exactCells.map((addr) => this.sheetCell(rows, addr)).find((value) => value);
      if (exactValue) return exactValue;

      const fallbackColumn = String(TEMPLATE_ROUTING_CELLS.logoFallbackColumn || 'I').toUpperCase();
      let colIndex = 0;
      for (const ch of fallbackColumn) colIndex = colIndex * 26 + (ch.charCodeAt(0) - 64);
      colIndex -= 1;

      const startRow = Math.max(1, Number(TEMPLATE_ROUTING_CELLS.logoFallbackStartRow || 25));
      const endRow = Math.max(startRow, Number(TEMPLATE_ROUTING_CELLS.logoFallbackEndRow || 35));
      for (let excelRow = startRow; excelRow <= endRow; excelRow += 1) {
        const value = String(rows?.[excelRow - 1]?.[colIndex] ?? '').trim();
        const normalized = this.normalizeRouteValue(value);
        if (normalized.includes('logo') || normalized.includes('vip') || normalized.includes('蝦皮')) return value;
      }
      return '';
    },
    resolveSheetTemplateRoute(sheet, rows, sheetName = '') {
      const placementCell = TEMPLATE_ROUTING_CELLS.placementCell || 'B17';
      const variantHeaderCell = TEMPLATE_ROUTING_CELLS.variantHeaderCell || 'F16';
      const placement = this.sheetCell(rows, placementCell);
      const variantHeader = this.sheetCell(rows, variantHeaderCell);
      const logo = this.getRouteLogoValue(rows);
      const normalizedPlacement = this.normalizeRouteValue(placement);
      const normalizedVariantHeader = this.normalizeRouteValue(variantHeader);
      const normalizedLogo = this.normalizeRouteValue(logo);
      const placementKeywords = TEMPLATE_ROUTING_CELLS.placementKeywords || ['頭巾'];
      const variantHeaderKeywords = TEMPLATE_ROUTING_CELLS.variantHeaderKeywords || ['版配'];

      const placementMatched = placementKeywords.some((keyword) =>
        normalizedPlacement.includes(this.normalizeRouteValue(keyword))
      );
      if (!placementMatched) return null;

      const variantMatched = !normalizedVariantHeader || variantHeaderKeywords.some((keyword) =>
        normalizedVariantHeader.includes(this.normalizeRouteValue(keyword))
      );
      if (!variantMatched) return null;

      const route = HEADBAND_SHEET_ROUTES.find((item) =>
        item.logoKeywords.some((keyword) => normalizedLogo.includes(this.normalizeRouteValue(keyword)))
      );
      if (!route) return {
        key: 'headband_unmatched_logo',
        label: '頭巾 未匹配 Logo',
        templateId: '',
        templateFile: '',
        ruleFile: '',
        outputPrefix: '頭巾',
        missingReason: `${placementCell}=頭巾，但 ${Array.isArray(TEMPLATE_ROUTING_CELLS.logoCells) ? TEMPLATE_ROUTING_CELLS.logoCells.join('/') : 'Logo 欄位'} 附近未讀到已設定的 logo 關鍵字（目前讀到：${logo || '空白'}）`,
      };
      return { ...route, placement, variantHeader, logo, sheetName };
    },
    async fetchRouteTemplate(route) {
      if (!route?.templateFile) return null;
      const urls = [`./templates/${route.templateFile}`, `./${route.templateFile}`];
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) continue;
          const data = await res.json();
          data.ruleFamily = route.family || route.key || data.ruleFamily;
          return { name: data.templateId || route.templateId, file: route.templateFile, visible: true, data };
        } catch (_) {}
      }
      return null;
    },
    async ensureTemplateForRoute(route, templates = []) {
      if (!route || !route.templateId) return null;
      const found = this.findTemplateForRoute(route, templates).template;
      if (found) return found;
      return this.fetchRouteTemplate(route);
    },
    findTemplateForRoute(route, templates = []) {
      if (!route?.templateId) return { template: null, reason: route?.missingReason || '頭巾路由缺少 templateId' };

      const normalizeTemplateId = (value) => this.norm(String(value || '')
        .replace(/\.json$/i, '')
        .replace(/^0+\d*[_\-\s]*/, '')
      );

      // 修正：不同變體範本檔案，若 PSD 匯出時內部 templateId 欄位剛好寫成一樣的值，
      // 用 templateId 欄位比對會讓多個檔案「同時命中」，最後變成看範本陣列的
      // 排列順序決定選到哪一個——本機資料夾跟雲端硬碟資料夾的檔案列舉順序不保證一樣。
      // 修法：只要 route 有明確指定 templateFile（實際檔名），一律先用「檔名」做精確比對，
      // 檔名在同一個資料夾裡一定是唯一的，比對結果不會因為陣列順序而改變。
      if (route.templateFile) {
        const wantedFile = this.norm(String(route.templateFile).replace(/\.json$/i, ''));
        const byFilename = (templates || []).find((template) => {
          const fileNorm = this.norm(String(template.file || '').replace(/\.json$/i, ''));
          return fileNorm && fileNorm === wantedFile;
        });
        if (byFilename) return { template: byFilename, reason: '' };
      }

      const routeIds = [route.templateId, route.templateFile]
        .map(normalizeTemplateId)
        .filter(Boolean);
      const routeIdsWithPrefix = [route.templateId, route.templateFile]
        .map((value) => this.norm(String(value || '').replace(/\.json$/i, '')))
        .filter(Boolean);

      const getTemplateIds = (template = {}) => [
        template.name,
        template.data?.templateId,
        template.data?.canvas?.templateId,
        template.data?.source?.psdName,
        template.file,
      ].flatMap((value) => [normalizeTemplateId(value), this.norm(String(value || '').replace(/\.json$/i, ''))]).filter(Boolean);

      // 先做精準命中，避免 06_SKBN_PC 誤命中 06_SKBN_PC_VIP。
      const exact = (templates || []).find((template) => {
        const ids = getTemplateIds(template);
        return ids.some((id) => routeIds.includes(id) || routeIdsWithPrefix.includes(id));
      });
      if (exact) return { template: exact, reason: '' };

      const wanted = routeIdsWithPrefix[0] || this.norm(route.templateId);
      const found = (templates || []).find((template) => {
        const label = this.norm(`${template.name || ''} ${template.data?.templateId || ''} ${template.file || ''}`);
        return label.includes(wanted) || wanted.includes(label);
      });
      if (found) return { template: found, reason: '' };
      const loaded = (templates || []).map((t) => t.name || t.data?.templateId || t.file || '未命名公版').join('、') || '無';
      return { template: null, reason: `讀到 ${route.label}，但目前沒有載入 ${route.templateId} 公版。請確認公版資料夾有 ${route.templateFile}。已載入：${loaded}` };
    },
    findTemplateRuleForName(name) {
      const n = this.norm(name);
      if (!n) return null;
      return this.getTemplateMatchRules().find((item) => item.tokens.some((token) => n.includes(this.norm(token)))) || null;
    },
    findTemplateForName(name, templates) {
      const rule = this.findTemplateRuleForName(name);
      if (!rule) {
        const labels = this.getTemplateMatchRules().map((item) => item.label).filter(Boolean).join(' / ') || 'DD Card / HBN';
        return { template: null, reason: `製作物名稱沒有讀到已設定的公版關鍵字（${labels}）` };
      }

      const found = (templates || []).find((template) => {
        const label = this.norm(`${template.name || ''} ${template.data?.templateId || ''} ${template.file || ''}`);
        return rule.targets.some((target) => label.includes(this.norm(target)));
      });
      if (!found) {
        if (rule.label === 'DD Card' && typeof DEFAULT_TEMPLATE !== 'undefined') {
          return { template: { name: 'DDcard', file: 'embedded-DDcard', visible: true, data: clone(DEFAULT_TEMPLATE) }, reason: '' };
        }
        const loaded = (templates || []).map((t) => t.name || t.data?.templateId || t.file || '未命名公版').join('、') || '無';
        return { template: null, reason: `讀到 ${rule.label} 關鍵字，但目前沒有載入 ${rule.label} 公版。已載入：${loaded}` };
      }
      return { template: found, reason: '' };
    },
    makeOutputPrefix(blockName, templateName) {
      const templateLabel = this.norm(templateName);
      // 先看實際被套用的公版，而不是只看 Excel block 名稱。
      // 例如「HBN / DDcard」同時含有 ddcard 字樣，但若實際套到 HBN 公版，輸出必須是 HBN_06，價格才會命中 hbn.rules.js。
      if (templateLabel.includes('hbn') || templateLabel.includes('han')) return 'HBN';
      if (templateLabel.includes('ddcard') || templateLabel.includes('ddc') || templateLabel.includes('ddcard')) return 'DDC';
      if (templateLabel.includes('popup')) return 'POPUP';
      if (templateLabel.includes('skbnapp') || templateLabel.includes('skbn中app') || templateLabel.includes('skbn左app')) return 'SKBN_APP';
      if (templateLabel.includes('skbnpc') || templateLabel.includes('skbn')) return 'SKBN_PC';
      if (templateLabel.includes('ig') || templateLabel.includes('igstory')) return 'IG';
      if (templateLabel.includes('gamebn')) return 'Game_BN';
      if (templateLabel.includes(this.norm('直播大廳bn'))) return '直播大廳BN';
      if (templateLabel.includes(this.norm('MS輪播BN')) || templateLabel.includes(this.norm('MS輪播 BN'))) return 'MS輪播BN';

      const n = this.norm(blockName);
      if (n.includes('hbn')) return 'HBN';
      if (n.includes('ddcard') || n.includes('ddc')) return 'DDC';
      if (n.includes('popup')) return 'POPUP';
      if (n.includes('skbnapp')) return 'SKBN_APP';
      if (n.includes('skbnpc') || n.includes('skbn')) return 'SKBN_PC';
      if (n.includes('ig') || n.includes('igstory')) return 'IG';
      if (n.includes('gamebn')) return 'Game_BN';
      if (n.includes(this.norm('直播大廳bn'))) return '直播大廳BN';
      if (n.includes(this.norm('MS輪播BN')) || n.includes(this.norm('MS輪播 BN'))) return 'MS輪播BN';
      return String(templateName || blockName || 'IMG').replace(/\.template\.json$/i, '').replace(/[^a-z0-9一-龥]+/ig, '_').replace(/^_+|_+$/g, '') || 'IMG';
    },
    resolveTemplateProductImageRule(template) {
      const rules = window.PriceRuleEngine?.getRules?.(template);
      const layouts = rules?.templateLayouts || {};
      const templateIds = [
        template?.templateId,
        template?.batchSourceName,
        template?.source?.psdName,
        AppState.templates?.[AppState.activeIndex]?.name,
        AppState.templates?.[AppState.activeIndex]?.file,
      ].filter(Boolean);

      for (const id of templateIds) {
        const direct = layouts[id];
        if (direct?.productImageBox) return direct;

        const normalized = window.PriceRuleEngine?.norm
          ? window.PriceRuleEngine.norm(id)
          : this.norm(id);
        const key = Object.keys(layouts).find((candidate) => {
          const candidateKey = window.PriceRuleEngine?.norm
            ? window.PriceRuleEngine.norm(candidate)
            : this.norm(candidate);
          return candidateKey === normalized;
        });
        if (key && layouts[key]?.productImageBox) return layouts[key];
      }

      return null;
    },
    getProductImageBoxFromLayer(layer) {
      if (!layer) return null;
      const width = Number(layer.targetWidth || layer.width || 0);
      const height = Number(layer.maxTargetHeight || layer.targetHeight || layer.height || 0);
      if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return null;

      const x = Number.isFinite(Number(layer.x)) ? Number(layer.x) : Number(layer.centerX || 0) - width / 2;
      const y = Number.isFinite(Number(layer.y)) ? Number(layer.y) : Number(layer.centerY || 0) - height / 2;

      return {
        x,
        y,
        width,
        height,
        centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
        centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
        targetWidth: width,
        targetHeight: height,
        maxTargetHeight: height,
      };
    },
    applyProductImageBox(layer, box, options = {}) {
      if (!layer || !box) return;
      const width = Number(box.targetWidth ?? box.width);
      const heightLimit = Number(box.maxTargetHeight ?? box.targetHeight ?? box.height);
      const x = Number.isFinite(Number(box.x)) ? Number(box.x) : Number(box.centerX || 0) - width / 2;
      const y = Number.isFinite(Number(box.y)) ? Number(box.y) : Number(box.centerY || 0) - heightLimit / 2;
      const centerX = Number.isFinite(Number(box.centerX)) ? Number(box.centerX) : x + width / 2;
      const centerY = Number.isFinite(Number(box.centerY)) ? Number(box.centerY) : y + heightLimit / 2;
      // 商品圖的縮放模式（是否「高度優先、不限寬」）現在直接讀取
      // rules/*.rules.js 的 productImageBox.sizingMode / widthLimitPolicy，
      // 不再用寫死的商品檔名清單判斷——rules 檔案才是唯一真相來源。
      const heightPriorityNoWidthLimit = options.heightPriorityNoWidthLimit !== undefined
        ? Boolean(options.heightPriorityNoWidthLimit)
        : (box.sizingMode === 'heightBased' || box.widthLimitPolicy === 'none');

      layer.x = x;
      layer.y = y;
      layer.width = width;
      layer.height = heightLimit;
      layer.centerX = centerX;
      layer.centerY = centerY;
      layer.keepAspectRatio = true;
      layer.sizingMode = heightPriorityNoWidthLimit ? 'heightBased' : 'containByPBox';
      layer.targetWidth = width;
      layer.targetHeight = heightLimit;
      layer.maxTargetHeight = heightLimit;

      if (heightPriorityNoWidthLimit) {
        delete layer.maxTargetWidth;
        layer.widthLimitPolicy = 'none';
        layer.productImageSizingRule = box.productImageSizingRule || 'heightPriorityNoWidthLimit';
      }
    },
    getTemplateRuleFamily(template) {
      return CapsuleRuleEngine.getTemplateFamily(template);
    },
    getTemplateRules(template) {
      const family = this.getTemplateRuleFamily(template);
      return (window.TemplateRuleManager || window.TemplateRuleRegistry)?.getRules?.(family) || {};
    },
    applyTemplateRuleHook(hookName, template, record, diagnostics = []) {
      const rules = this.getTemplateRules(template);
      const hook = rules?.[hookName];
      if (typeof hook !== 'function') return null;
      return hook({
        template,
        record,
        diagnostics,
        helpers: {
          round,
          findLayer: this.findLayer.bind(this),
          normalizeRecordText: this.normalizeRecordText.bind(this),
          norm: this.norm.bind(this),
          measureTextWidth: (layer) => CapsuleRuleEngine.measureTextWidth(layer, ctx),
        },
      });
    },
    normalizeRecordText(value) {
      return String(value ?? '')
        .replace(/_x000d_/gi, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
    },
    applyDdCardVipLogoGroup(template, record, diagnostics = []) {
      const isDDCard = this.getTemplateRuleFamily(template) === 'ddcard';
      if (!isDDCard || !template?.layers) return;

      const toText = (value) => this.normalizeRecordText(value);
      const normalize = (value) => this.norm(toText(value));
      const measureTextWidth = (layer, text) => {
        if (!layer) return 1;
        ctx.save();
        ctx.font = Renderer.font(layer);
        const letterSpacing = Number(layer.letterSpacing || 0);
        const content = String(text || '');
        const chars = [...content];
        const width = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0)
          + Math.max(0, chars.length - 1) * letterSpacing;
        ctx.restore();
        return Math.ceil(Math.max(1, width));
      };
      const removeVipText = (value) => toText(value)
        .replace(/\bVIP\b/gi, '')
        .replace(/^\s*[+＋｜|／/・,，、-]+\s*/g, '')
        .trim();

      const targets = [
        {
          field: '主標',
          sourceKey: 'title',
          layerWords: ['title', '主標', '主標題', '主標題文字', '主標文字'],
          logoKey: '主標題_蝦皮VIP_LOGO',
          textKey: '主標題_文字',
          groupPsdName: '主標題',
          textPsdName: '主標題_文字',
          logoPsdName: '主標題_蝦皮VIP_LOGO',
          logoWidth: 224,
          logoHeight: 78,
        },
        {
          field: '副標',
          sourceKey: 'subtitle',
          layerWords: ['subtitle', '副標', '副標題', '副標題文字', '副標文字', 'usp'],
          logoKey: '副標題_蝦皮VIP_LOGO',
          textKey: '副標題_文字',
          groupPsdName: '副標題',
          textPsdName: '副標題_文字',
          logoPsdName: '副標題_蝦皮VIP_LOGO',
          logoWidth: 150,
          logoHeight: 52,
        },
      ];

      const findSourceEntry = (target) => {
        const words = target.layerWords.map((word) => this.norm(word)).filter(Boolean);
        const blocked = ['價格', 'price', '票券', '案型', 'cta', 'button', '法務', '警語', 'legal', '蝦皮viplogo']
          .map((word) => this.norm(word))
          .filter(Boolean);

        const entries = Object.entries(template.layers || {})
          .filter(([, layer]) => layer?.type === 'text')
          .filter(([, layer]) => layer?.source !== 'generated_ddcard_vip_text_logo')
          .map(([key, layer]) => {
            const label = this.norm(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
            if (!label || blocked.some((word) => label.includes(word))) return null;
            const idx = words.findIndex((word) => label === word || label.includes(word));
            if (idx < 0) return null;
            const exactScore = words.some((word) => label === word) ? 0 : 10;
            const keyScore = this.norm(key) === this.norm(target.sourceKey) ? -10 : 0;
            return { key, layer, score: exactScore + keyScore + idx };
          })
          .filter(Boolean)
          .sort((a, b) => a.score - b.score);

        return entries[0] || null;
      };

      const setVisible = (layer, visible) => {
        if (!layer) return;
        layer.hidden = !visible;
        layer.visible = !!visible;
      };

      const syncRenderOrder = (sourceKey, logoKey, textKey) => {
        const isRenderableKey = (key) =>
          !!(template.layers?.[key] || template.generatedLayers?.[key] || key === sourceKey || key === 'subtitle_frame');
        const order = (template.renderOrder || [])
          .filter((key) => key !== logoKey && key !== textKey)
          .filter(isRenderableKey);
        const sourceIndex = order.indexOf(sourceKey);
        const insertAt = sourceIndex >= 0 ? sourceIndex : order.length;
        order.splice(insertAt, 0, logoKey, textKey);
        template.renderOrder = order;
      };

      const resetTarget = (target, entry) => {
        const logo = template.layers[target.logoKey];
        const text = template.layers[target.textKey];
        setVisible(logo, false);
        setVisible(text, false);
        if (entry?.layer) {
          delete entry.layer.ddcardVipGroupProxy;
          delete entry.layer.ddcardVipLogoKey;
          delete entry.layer.ddcardVipTextKey;
          setVisible(entry.layer, true);
        }
      };

      targets.forEach((target) => {
        const recordText = toText(record?.[target.field]);
        const hasVip = /VIP/i.test(recordText);
        const entry = findSourceEntry(target);

        if (!hasVip) {
          resetTarget(target, entry);
          return;
        }

        if (!entry?.layer) {
          diagnostics.push({ field: target.field, status: 'missing-layer', value: recordText, target: 'DD Card VIP Group Core' });
          return;
        }

        const sourceLayer = entry.layer;
        const sourceKey = entry.key || target.sourceKey;
        const nextText = removeVipText(recordText);
        const isSpecial = normalize(recordText) === normalize('VIP獨享18%蝦幣');
        const gap = 3;

        const originalCenterX = Number(sourceLayer.centerX ?? (Number(sourceLayer.x || 0) + Number(sourceLayer.width || 0) / 2));
        const originalCenterY = Number(sourceLayer.centerY ?? (Number(sourceLayer.y || 0) + Number(sourceLayer.height || 0) / 2));

        const textLayer = {
          ...clone(sourceLayer),
          type: 'text',
          psdName: target.textPsdName,
          source: 'generated_ddcard_vip_text_logo',
          text: nextText,
          align: 'left',
          hidden: false,
          visible: true,
          locked: false,
        };
        if (isSpecial) {
          textLayer.fontSizePx = 37;
          textLayer.fontSizePt = 37;
          textLayer.lineHeight = round(37 * 1.08, 2);
          if (Array.isArray(textLayer.textStyleRanges)) {
            textLayer.textStyleRanges = textLayer.textStyleRanges.map((range) => ({
              ...range,
              fontSizePx: 37,
              fontSizePt: 37,
              lineHeight: textLayer.lineHeight,
            }));
          }
        }

        const textWidth = measureTextWidth(textLayer, nextText);
        const groupWidth = target.logoWidth + gap + textWidth;
        const groupHeight = Math.max(target.logoHeight, Number(textLayer.height || textLayer.lineHeight || textLayer.fontSizePx || 24));
        const groupX = originalCenterX - groupWidth / 2;

        const logoLayer = template.layers[target.logoKey] || {};
        Object.assign(logoLayer, {
          type: 'image',
          psdName: target.logoPsdName,
          source: 'generated_ddcard_vip_text_logo',
          assetFilename: '蝦皮VIP_LOGO.svg',
          assetCandidates: ['蝦皮VIP_LOGO.svg', '04_DD Card/蝦皮VIP_LOGO.svg', '04_DD Card/#U8766#U76aeVIP_LOGO.svg'],
          keepAspectRatio: true,
          x: round(groupX, 2),
          y: round(originalCenterY - target.logoHeight / 2, 2),
          width: target.logoWidth,
          height: target.logoHeight,
          centerX: round(groupX + target.logoWidth / 2, 2),
          centerY: round(originalCenterY, 2),
          text: '',
          hidden: false,
          visible: true,
          locked: false,
        });

        textLayer.x = round(groupX + target.logoWidth + gap, 2);
        textLayer.y = round(originalCenterY - Number(textLayer.height || sourceLayer.height || textLayer.lineHeight || textLayer.fontSizePx || 24) / 2, 2);
        textLayer.width = Math.ceil(textWidth + 2);
        textLayer.centerX = round(textLayer.x + textLayer.width / 2, 2);
        textLayer.centerY = round(originalCenterY, 2);

        template.layers[target.logoKey] = logoLayer;
        template.layers[target.textKey] = textLayer;

        sourceLayer.psdName = target.groupPsdName;
        sourceLayer.text = nextText;
        sourceLayer.x = round(groupX, 2);
        sourceLayer.y = round(originalCenterY - groupHeight / 2, 2);
        sourceLayer.width = round(groupWidth, 2);
        sourceLayer.height = round(groupHeight, 2);
        sourceLayer.centerX = round(originalCenterX, 2);
        sourceLayer.centerY = round(originalCenterY, 2);
        sourceLayer.align = 'center';
        sourceLayer.source = 'ddcard_vip_group_proxy';
        sourceLayer.ddcardVipGroupProxy = true;
        sourceLayer.ddcardVipLogoKey = target.logoKey;
        sourceLayer.ddcardVipTextKey = target.textKey;
        sourceLayer.ddcardVipGroupChildren = [target.logoPsdName, target.textPsdName];
        setVisible(sourceLayer, false);

        syncRenderOrder(sourceKey, target.logoKey, target.textKey);

        diagnostics.push({
          field: target.groupPsdName,
          status: 'ok',
          value: `蝦皮VIP_LOGO.svg + ${gap}px + ${nextText}`,
          target: 'DD Card VIP Group Core',
        });
      });
    },
    applyRecordToTemplate(template, record) {
      const diagnostics = [];
      template.batchRecord = { ...(record || {}) };
      const templatePrefix = this.getTemplateAssetPrefix(template);
      this.applyTemplateRuleHook('beforeApplyRecordToTemplate', template, record, diagnostics);

      const textMap = [
        { field: '票券案型', words: ['票券_案型', '票券案型', '案型', 'tickettype'] },
        { field: '主標', words: ['主標', '主標題', 'title'] },
        { field: '副標', words: ['副標', '副標題', 'subtitle'] },
        { field: '警語', words: ['警語', '法務', '法務小字', 'legal'] },
        // CTA 只有在模板真的有 CTA/按鈕文字圖層時才套用；不可 fallback 到第一個文字圖層，避免蓋掉主標。
        { field: 'CTA', words: ['cta', '按鈕', 'button', '立即領'] },
      ];
      for (const item of textMap) {
        const value = this.normalizeRecordText(record[item.field]);
        if (!value) continue;
        const layer = this.findLayer(template, 'text', item.words, false);
        if (layer) {
          if (item.field === '主標' && /\(\s*logo\s*\)|（\s*logo\s*）/i.test(value)) {
            layer.hidden = true;
            diagnostics.push({ field: item.field, status: 'ok', value, target: `${layer.psdName || ''} 隱藏` });
          } else {
            layer.text = value;
            layer.hidden = false;
            diagnostics.push({ field: item.field, status: 'ok', value, target: layer.psdName || '' });
          }
        }
      }

      const img1 = String(record['商品圖1'] || '').trim();
      const img2 = String(record['商品圖2'] || '').trim();
      const ctaAsset = String(record['CTA'] || '').trim();

      // 圖片欄位採精準圖層匹配：CTA 圖層只吃 CTA 欄位；商品圖不再誤塞到 CTA / 背景圖。
      const ctaLayer = this.findLayer(template, 'image', ['cta', '按鈕', 'button'], false);
      if (ctaLayer) {
        // 若 Excel 沒有 CTA 欄位，仍會嘗試把模板既有 CTA 檔名智慧匹配成實際素材。
        const sourceCtaName = ctaAsset || String(ctaLayer.assetFilename || '').trim();
        if (sourceCtaName) {
          const match = this.findAssetFilename(sourceCtaName, { prefix: templatePrefix });
          if (match.found) {
            ctaLayer.assetFilename = match.filename;
            diagnostics.push({ field: 'CTA', status: 'ok', value: sourceCtaName, filename: match.filename });
          } else {
            ctaLayer.assetFilename = '';
            diagnostics.push({ field: 'CTA', status: 'missing', value: sourceCtaName, attempts: match.attempts });
          }
        }
      } else if (ctaAsset) {
        diagnostics.push({ field: 'CTA', status: 'missing-layer', value: ctaAsset });
      }

      const productLayers = Object.entries(template.layers || {})
        .filter(([key, layer]) => {
          if (layer.type !== 'image' || layer.locked) return false;
          const label = this.norm(`${key} ${layer.psdName || ''} ${layer.role || ''}`);
          const isBackground = label.includes('bg') || label.includes(this.norm('背景')) || label.includes('kvbg');
          const isCta = label.includes('cta') || label.includes(this.norm('按鈕')) || label.includes('button');
          const isLogo = label.includes('logo') || label.includes(this.norm('會員日'));
          return !isBackground && !isCta && !isLogo;
        })
        .sort(([keyA, layerA], [keyB, layerB]) => {
          const score = ([key, layer]) => {
            const label = this.norm(`${key} ${layer.psdName || ''} ${layer.role || ''}`);
            if (label.includes('product') || label.includes(this.norm('商品圖1')) || label.includes(this.norm('曝品')) || label === 'p') return 0;
            if (label.includes(this.norm('商品圖2'))) return 1;
            return 2;
          };
          return score([keyA, layerA]) - score([keyB, layerB]);
        })
        .map(([, layer]) => layer);

      const applyImage = (layer, rawValue, field) => {
        if (!layer || !rawValue) return;
        const match = this.findAssetFilename(rawValue, { prefix: templatePrefix });
        if (match.found) {
          layer.assetFilename = match.filename;
          // 全域商品圖邏輯：
          // 1) rules/*.js 有 productImageBox 時，使用該筆規則定義的絕對 P 框
          //    （框的 sizingMode / widthLimitPolicy 也是 rules 檔案裡的資料，
          //    applyProductImageBox 會直接讀取，不再靠寫死的商品檔名清單判斷）。
          // 2) 沒有 productImageBox 時，使用模板原本 P 圖層的 x/y/width/height 作為全域 P 框。
          // 3) 實際渲染時一律先符合 P 寬度；若高度超過 P 高度，改以高度符合，並置中 P 框。
          const templateRule = this.resolveTemplateProductImageRule(template);
          const box = templateRule?.productImageBox || this.getProductImageBoxFromLayer(layer);
          if (box) this.applyProductImageBox(layer, box);
          diagnostics.push({ field, status: 'ok', value: rawValue, filename: match.filename, sizingRule: box?.sizingMode });
        } else {
          layer.assetFilename = '';
          diagnostics.push({ field, status: 'missing', value: rawValue, attempts: match.attempts });
        }
      };
      // 商品圖套用 productImageBox 後，更新所有 price layer 的 anchor.baseBox
      // 確保連動計算以新商品圖位置為基準
      const syncPriceAnchorsToCurrentProduct = () => {
        const anchorKey = window.PriceCouponManager?.findAnchorLayerKey?.(template);
        if (!anchorKey) return;
        const anchorLayer = template.layers?.[anchorKey];
        if (!anchorLayer) return;
        const currentBox = window.Geometry?.getLayerBox?.(anchorKey, anchorLayer);
        if (!currentBox) return;
        Object.values(template.layers || {}).forEach((priceLayer) => {
          if (priceLayer?.source === 'auto_price_v2' && priceLayer.anchor?.layerKey === anchorKey) {
            priceLayer.anchor.baseBox = JSON.parse(JSON.stringify(currentBox));
          }
        });
      };

      // SCBN 明確指定「商品圖1」為完整素材檔名來源；商品圖2 可保留給價格/其他欄位，不覆蓋商品圖1。
      // 其他舊版工單維持原本單商品圖時優先使用商品圖2的通用流程。
      if (productLayers.length === 1) {
        const family = CapsuleRuleEngine.getTemplateFamily(template);
        const useProduct1Only = family === 'scbn';
        const asset = useProduct1Only ? img1 : (img2 || img1);
        if (asset) applyImage(productLayers[0], asset, useProduct1Only || !img2 ? '商品圖1' : '商品圖2');
        else if (String(productLayers[0].assetFilename || '').trim() === 'P') productLayers[0].assetFilename = '';
      } else {
        applyImage(productLayers[0], img1, '商品圖1');
        applyImage(productLayers[1], img2, '商品圖2');
        productLayers.forEach((layer) => {
          if (String(layer?.assetFilename || '').trim() === 'P') layer.assetFilename = '';
        });
      }

      syncPriceAnchorsToCurrentProduct();
      const family = CapsuleRuleEngine.getTemplateFamily(template);
      const usesCustomC2cAppPairPrice = family === 'c2c_skbn_app';
      const usesMallSkbnColumnPrice = family === 'mall_skbn';
      const priceKeys = usesCustomC2cAppPairPrice
        ? []
        : usesMallSkbnColumnPrice
          ? PriceCouponManager.applyMallSkbnColumns(template, record)
          : PriceCouponManager.apply(template, record);
      // DDcard 的最終排版資料由 rules/ddcard.rules.js 在 after hook 收尾。
      // core 不再執行 DDcard 專用 VIP 拆圖，避免覆蓋 rules 寫回的座標。
      // C2C SKBN APP 改由 c2c_skbn_app.rules.js 處理「左圖+左價 / 右圖+右價」。
      // MALL SKBN 價格改走 Auto Price V2 共用引擎，但用左/中/右商品圖各自作為錨點。
      this.applyTemplateRuleHook('afterApplyRecordToTemplate', template, record, diagnostics);
      LayoutRuleEngine.apply(template);
      if (usesMallSkbnColumnPrice) {
        const mallPriceSummary = ['左', '中', '右']
          .map((label) => {
            const value = String(record[`價格_${label}`] || '').trim();
            return value ? `價格_${label}=${value}` : '';
          })
          .filter(Boolean)
          .join(' / ');
        if (priceKeys.length) diagnostics.push({
          field: '價格_左/中/右',
          status: 'ok',
          value: mallPriceSummary,
          target: priceKeys.join('、'),
        });
        else if (mallPriceSummary) diagnostics.push({
          field: '價格_左/中/右',
          status: 'missing-layer',
          value: mallPriceSummary,
          target: '找不到左/中/右商品圖錨點或價格規則',
        });
      } else {
        const appliedPriceText = String(record['價格'] || record['價格_左'] || '').trim();
        const appliedPriceField = String(record['價格'] || '').trim() ? '價格' : '價格_左';
        if (priceKeys.length) diagnostics.push({ field: appliedPriceField, status: 'ok', value: appliedPriceText, target: priceKeys.join('、') });
        else if (appliedPriceText && !usesCustomC2cAppPairPrice) diagnostics.push({ field: appliedPriceField, status: 'missing-layer', value: appliedPriceText, target: '找不到商品圖1錨點或價格規則' });
      }

      template.batchDiagnostics = diagnostics;
    },
    findLayer(template, type, words, allowFallback = false) {
      const normWords = words.map((word) => this.norm(word));
      const entries = Object.entries(template.layers || {});
      let found = entries.find(([key, layer]) => layer.type === type && normWords.some((word) => this.norm(`${key} ${layer.psdName || ''} ${layer.role || ''}`).includes(word)));
      if (found) return found[1];
      if (!allowFallback) return null;
      found = entries.find(([, layer]) => layer.type === type);
      return found ? found[1] : null;
    },
    getTemplateAssetPrefix(template) {
      const label = this.norm(`${template?.canvas?.templateId || ''} ${template?.templateId || ''} ${template?.source?.psdName || ''}`);
      if (label.includes('ddcard') || label.includes('ddc')) return 'DDC';
      if (label.includes('hbn')) return 'HBN';
      if (label.includes('popup')) return 'POPUP';
      if (label.includes('mallskbn') || label.includes('06mallskbn')) return 'Mall SKBN';
      if (label.includes('scbn')) return 'SCBN';
      if (label.includes('skbnpc') || label.includes('skbn')) return 'SKBN';
      if (label.includes('ig') || label.includes('igstory')) return '10_IG';
      if (label.includes('gamebn')) return '11_GAME BN';
      if (label.includes(this.norm('直播大廳bn'))) return '12_直播大廳BN';
      if (label.includes(this.norm('MS輪播BN')) || label.includes(this.norm('MS輪播 BN'))) return '13_MS輪播 BN';
      if (label.includes(this.norm('c2cskbnnuzapp')) || label.includes(this.norm('C2C_SKBN(NUZ)_APP'))) return '14_C2C_SKBN(NUZ)_APP';
      if (label.includes(this.norm('c2cskbnnuzpc')) || label.includes(this.norm('C2C_SKBN(NUZ)_PC'))) return '14_C2C_SKBN(NUZ)_PC';
      return '';
    },
    normalizeAssetKey(value) {
      return String(value || '')
        .replace(/#U([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[\s\u00a0\u3000\t\r\n]+/g, '')
        .replace(/[\-_()（）\[\]【】.]/g, '');
    },
    findAssetFilename(name, options = {}) {
      const raw = String(name || '').trim();
      const files = AppState.assetFiles || new Map();
      const keys = [...files.keys()];
      const prefix = String(options.prefix || '').trim();
      const basename = (value) => String(value || '').split(/[\\/]/).pop();
      const rawBase = basename(raw);
      const cleanRaw = raw.replace(/[\s\u00a0\u3000\t\r\n]+/g, '');
      const cleanRawBase = rawBase.replace(/[\s\u00a0\u3000\t\r\n]+/g, '');
      const attempts = [];
      if (!raw) return { found: false, filename: '', attempts };

      const push = (value) => {
        const v = String(value || '').trim();
        if (v && !attempts.includes(v)) attempts.push(v);
      };
      const tryExact = (candidate) => {
        push(candidate);
        if (files.has(candidate)) return candidate;
        const lower = candidate.toLowerCase();
        return keys.find((file) => file.toLowerCase() === lower) || '';
      };

      // 1) 原始值完全匹配；若 assetFilename 帶資料夾，也會先用 basename 精準匹配。
      let hit = tryExact(raw);
      if (hit) return { found: true, filename: hit, attempts };
      hit = tryExact(rawBase);
      if (hit) return { found: true, filename: hit, attempts };

      // 蝦皮 VIP 與一般 VIP 是不同素材；不可將「蝦皮VIP_LOGO.svg」模糊匹配成「VIP_LOGO.svg」。
      const shopeeVipKey = this.normalizeAssetKey('蝦皮VIP_LOGO.svg');
      const wantsShopeeVip = this.normalizeAssetKey(raw).includes(shopeeVipKey) || this.normalizeAssetKey(rawBase) === shopeeVipKey;
      if (wantsShopeeVip) {
        hit = keys.find((file) => this.normalizeAssetKey(basename(file)) === shopeeVipKey);
        return hit ? { found: true, filename: hit, attempts } : { found: false, filename: '', attempts };
      }

      // 2) 沒有副檔名時補常見圖片副檔名。
      const rawHasExt = /\.[a-z0-9]+$/i.test(raw);
      const baseNames = [raw, rawBase, cleanRaw, cleanRawBase];
      if (prefix) {
        baseNames.unshift(`${prefix}_${cleanRaw}`, `${prefix}_${raw}`, `${prefix}_${cleanRawBase}`, `${prefix}_${rawBase}`);
      }
      for (const base of [...new Set(baseNames.filter(Boolean))]) {
        if (/\.[a-z0-9]+$/i.test(base)) {
          hit = tryExact(base);
          if (hit) return { found: true, filename: hit, attempts };
        } else {
          for (const ext of this.imageExts) {
            hit = tryExact(`${base}.${ext}`);
            if (hit) return { found: true, filename: hit, attempts };
          }
        }
      }

      // 3) 標準化完全匹配：忽略空白、大小寫、符號與副檔名。
      const wantedKeys = new Set(baseNames.map((v) => this.normalizeAssetKey(v)).filter(Boolean));
      hit = keys.find((file) => wantedKeys.has(this.normalizeAssetKey(file)));
      if (hit) return { found: true, filename: hit, attempts };

      // 4) 模糊包含：例如 Excel「放心買 安心退」可找到「HBN_放心買安心退.png」。
      const rawKey = this.normalizeAssetKey(raw);
      const cleanKey = this.normalizeAssetKey(cleanRaw);
      hit = keys.find((file) => {
        const fileKey = this.normalizeAssetKey(file);
        return (cleanKey && fileKey.includes(cleanKey)) || (rawKey && fileKey.includes(rawKey));
      });
      if (hit) return { found: true, filename: hit, attempts };

      return { found: false, filename: '', attempts };
    },
    resolveAssetFilename(name, options = {}) {
      const match = this.findAssetFilename(name, options);
      return match.found ? match.filename : String(name || '').trim();
    },
    async stabilizeTemplateBeforePreview(template) {
      if (!template?.layers) return;

      // 先讓已 decode 的圖片進入瀏覽器繪製週期，避免第一次縮圖使用到尚未穩定的 naturalWidth / naturalHeight。
      await this.waitForPreviewFrame();

      // 價格必須在商品圖實際渲染尺寸穩定後重建；否則第一次預覽容易先吃到 P 框尺寸，第二次才校正。
      window.PriceCouponManager?.rebuildFromPricePreset?.(template);
      // 價格重建後，只針對 DDcard 重新執行 rules 的 after hook。
      // 這讓 rules/ddcard.rules.js 成為最後算圖資料來源，且不影響頭巾 / HBN / 其他製作物。
      if (this.getTemplateRuleFamily(template) === 'ddcard') {
        this.applyTemplateRuleHook('afterApplyRecordToTemplate', template, template?.batchRecord || {}, template?.batchDiagnostics || []);
      }
      window.PriceTransformEngine?.syncTemplate?.(template);
      LayoutRuleEngine.apply(template);

      await this.waitForPreviewFrame();

      // LayoutRuleEngine 可能會改動文字膠囊或票券尺寸；最後再同步一次，確保縮圖與主畫布一致。
      window.PriceTransformEngine?.syncTemplate?.(template);
      LayoutRuleEngine.apply(template);
    },
    async renderPreviewGrid(options = {}) {
      if (!DOM.batchPreviewGrid) return;
      const entries = TemplateFilter.getVisibleEntries();
      const items = entries.map(({ item }) => item);
      DOM.batchPreviewPanel?.classList.toggle('hidden', !items.length);
      document.querySelector('.canvas-shell')?.classList.toggle('batch-mode', !!items.length);
      if (!items.length) { DOM.batchPreviewGrid.innerHTML = ''; return; }
      if (!options.revealWhenDone) this.renderPreviewPlaceholders();

      const currentIndex = AppState.activeIndex;
      const currentTemplate = AppState.template;
      const thumbs = [];

      AppState.batchPreviewRendering = true;
      for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        const index = entries[entryIndex].index;
        const itemName = AppState.templates[index]?.name || `Item ${index + 1}`;
        if (options.showProgress) LoadingOverlay.update((entryIndex / Math.max(1, entries.length)) * 100, `正在載入素材 ${entryIndex + 1} / ${entries.length}：${itemName}`);
        try {
          AppState.activeIndex = index;
          AppState.template = AppState.templates[index].data;
          AppState.images = await TemplateLoader.loadImagesForTemplate(AppState.template);
          await this.stabilizeTemplateBeforePreview(AppState.template);

          const url = await this.makeThumbURL();
          thumbs.push({ index, name: itemName, url, ok: true });
        } catch (error) {
          console.warn('[Batch Preview] 縮圖產生失敗:', itemName, error);
          thumbs.push({ index, name: itemName, url: this.makeFallbackThumb(itemName), ok: false });
        }

        if (!options.revealWhenDone) this.paintPreviewThumbs(thumbs, items, currentIndex);
      }
      AppState.batchPreviewRendering = false;
      this.paintPreviewThumbs(thumbs, items, currentIndex);
      if (options.showProgress) LoadingOverlay.update(100, '素材載入完成');

      AppState.activeIndex = currentIndex;
      AppState.template = currentTemplate;
      try { await TemplateLoader.loadImagesForActiveTemplate(); }
      catch (error) { console.warn('[Batch Preview] 還原目前圖檔載入失敗，仍繼續:', error); }
      this.markActiveThumb();
    },
    async makeThumbURL() {
      const t = AppState.template;
      const maxW = 180;
      const scale = Math.max(0.1, maxW / t.canvas.width);
      const off = document.createElement('canvas');
      off.width = Math.round(t.canvas.width * scale);
      off.height = Math.round(t.canvas.height * scale);
      const c = off.getContext('2d', { alpha: true });
      c.save();
      c.scale(scale, scale);
      Renderer.renderSceneTo(c);
      c.restore();
      return off.toDataURL('image/jpeg', 0.86);
    },
    norm(value) { return String(value || '').toLowerCase().replace(/\s+/g, '').replace(/[\-_()（）\[\]【】]/g, ''); },
  });

  // ── TemplateLoader（5 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.TemplateLoader, {
    async loadImagesForActiveTemplate() {
      const seq = ++AppState.imageLoadSeq;
      const images = await this.loadImagesForTemplate(AppState.template);
      // 防止批次縮圖背景載入時覆蓋目前畫布的圖片快取。
      if (seq === AppState.imageLoadSeq) {
        AppState.images = images;
        try { await new Promise(requestAnimationFrame); } catch (_) {}
        // 圖片載入完成後，只讓非 edited-json absolute 的價格圖層重新依圖片實際尺寸同步。
        // edited JSON 寫回的 absolute 價格座標必須先保持原始絕對值；
        // 商品圖若由使用者手動移動 / 縮放，會由 handleLayerBoxApplied 即時連動價格。
        Object.values(AppState.template?.layers || {}).forEach((layer) => {
          if (
            layer?.source === 'auto_price_v2' &&
            layer.anchor?.layerKey &&
            layer.lockToEditedJson !== true &&
            layer.positioningMode !== 'absolute'
          ) {
            layer._anchorDirty = true;
          }
        });
      }
      return images;
    },
    async loadImagesForTemplate(template) {
      const images = {};
      if (!template) return images;

      const entries = Object.entries(template.layers || {});
      await Promise.all(entries.map(async ([key, layer]) => {
        if (layer.type !== 'image' || !layer.assetFilename) return;

        const filename = String(layer.assetFilename || '').trim();
        const candidates = [
          filename,
          ...(Array.isArray(layer.assetCandidates) ? layer.assetCandidates : []),
        ].map((name) => String(name || '').trim()).filter(Boolean);
        const uniqueCandidates = [...new Set(candidates)];

        for (const candidate of uniqueCandidates) {
          const localFile = this.findLocalAssetFile(candidate, template);

          // 1) 使用者手動上傳素材：最穩，使用 blob URL，不會污染 Canvas。
          if (localFile) {
            const objectUrl = URL.createObjectURL(localFile);
            try { images[key] = await this.loadImage(objectUrl); }
            finally { setTimeout(() => URL.revokeObjectURL(objectUrl), 1200); }
            return;
          }

          // 2) 內建素材 fallback：直接用 Data URI，讓本機 file:// 開啟也能正常顯示與下載。
          if (typeof EMBEDDED_ASSETS !== 'undefined' && EMBEDDED_ASSETS[candidate]) {
            images[key] = await this.loadImage(EMBEDDED_ASSETS[candidate]);
            return;
          }

          // 3) 一般路徑載入：適合用 Live Server / http 開啟。
          // zip 內部分中文檔名會保留為 #Uxxxx；URL 需要 encode，否則 # 會被瀏覽器視為 fragment。
          const encodedCandidate = encodeAssetPath(candidate);
          const urls = [`./assets/${encodedCandidate}`, `./${encodedCandidate}`, `assets/${encodedCandidate}`, encodedCandidate];
          for (const url of urls) {
            try { images[key] = await this.loadImage(url); return; }
            catch (_) {}
          }
        }

        console.warn('[Assets] 圖片載入失敗:', key, uniqueCandidates.join(' / '));
        images[key] = null;
      }));
      return images;
    },
    findLocalAssetFile(filename, template = AppState.template) {
      const files = AppState.assetFiles || new Map();
      if (!filename || !files.size) return null;

      const decodeHashUnicode = (value) => String(value || '').replace(/#U([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      const basename = (value) => String(value || '').split(/[\\/]/).pop();
      const keys = [...files.keys()];
      const directName = String(filename || '').trim();
      const directBase = basename(directName);

      if (files.has(directName)) return files.get(directName);
      if (files.has(directBase)) return files.get(directBase);

      const clean = (value) => decodeHashUnicode(value).toLowerCase()
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[\s\u00a0\u3000\t\r\n]+/g, '')
        .replace(/[\-_()（）\[\]【】.]/g, '');

      const templateLabels = [
        template?.canvas?.templateId,
        template?.templateId,
        template?.batchSourceName,
        template?.sheetTemplateRoute?.sourceTemplateId,
        template?.source?.psdName,
        AppState.templates?.[AppState.activeIndex]?.name,
        AppState.templates?.[AppState.activeIndex]?.file,
      ].filter(Boolean);
      const templateKeys = [...new Set(templateLabels.map(clean).filter(Boolean))];
      const fileBaseKey = clean(directBase);
      const fileFullKey = clean(directName);
      const baseMatches = (name) => {
        const keyBase = clean(basename(name));
        return keyBase === fileBaseKey || keyBase === fileFullKey;
      };
      const pathMatchesTemplate = (name) => {
        const path = clean(String(name || '').replace(/[\\/][^\\/]+$/g, ''));
        return templateKeys.some((templateKey) => path.includes(templateKey) || templateKey.includes(path));
      };

      // 公版素材優先：若使用者載入整包 assets，優先命中與目前公版名稱相同/相近的子資料夾。
      const preferredHit = keys.find((name) => baseMatches(name) && pathMatchesTemplate(name));
      if (preferredHit) return files.get(preferredHit);

      const exactBaseHit = keys.find((name) => baseMatches(name));
      if (exactBaseHit) return files.get(exactBaseHit);

      const wanted = clean(directName);
      const wantedBase = clean(directBase);
      const shopeeVipKey = clean('蝦皮VIP_LOGO.svg');

      // 蝦皮 VIP 與一般 VIP 是不同素材：找「蝦皮VIP_LOGO.svg」時不可 fallback 到「VIP_LOGO.svg」。
      if (wanted.includes(shopeeVipKey) || wantedBase === shopeeVipKey) {
        const shopeeVipHit = keys.find((name) => {
          const baseKey = clean(basename(name));
          return baseKey === shopeeVipKey && (!templateKeys.length || pathMatchesTemplate(name));
        }) || keys.find((name) => clean(basename(name)) === shopeeVipKey);
        return shopeeVipHit ? files.get(shopeeVipHit) : null;
      }

      const exactNormalizedHit = keys.find((name) => {
        const key = clean(name);
        const baseKey = clean(basename(name));
        return key === wanted || baseKey === wantedBase;
      });
      if (exactNormalizedHit) return files.get(exactNormalizedHit);

      const fuzzyPreferredHit = keys.find((name) => {
        const baseKey = clean(basename(name));
        return pathMatchesTemplate(name) && (baseKey.includes(wantedBase) || wantedBase.includes(baseKey));
      });
      if (fuzzyPreferredHit) return files.get(fuzzyPreferredHit);

      // 最終備援：完全沒有路徑線索可用時（前面幾層都沒命中），
      // 蒐集所有模糊比對候選，優先選「清理後字串長度跟目標最接近」的，
      // 不再是「陣列裡第一個」——避免結果因檔案列舉順序不同而改變。
      const finalCandidates = keys
        .map((name) => {
          const key = clean(name);
          const baseKey = clean(basename(name));
          const isMatch = key === wanted || baseKey === wantedBase || key.includes(wanted) || wanted.includes(key) || baseKey.includes(wantedBase) || wantedBase.includes(baseKey);
          if (!isMatch) return null;
          const lengthDiff = Math.min(Math.abs(key.length - wanted.length), Math.abs(baseKey.length - wantedBase.length));
          return { name, lengthDiff };
        })
        .filter(Boolean);
      if (!finalCandidates.length) return null;
      finalCandidates.sort((a, b) => a.lengthDiff - b.lengthDiff);
      return files.get(finalCandidates[0].name);
    },
    async loadAssetFolder(fileList) {
      const imageFiles = [...fileList].filter((file) => /^image\//i.test(file.type) || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name));
      AppState.assetFiles = new Map();
      imageFiles.forEach((file) => {
        const names = [file.name, file.webkitRelativePath].filter(Boolean);
        names.forEach((name) => {
          if (!AppState.assetFiles.has(name)) AppState.assetFiles.set(name, file);
        });
      });
      await this.loadImagesForActiveTemplate();
      window.SpecOverlayManager?.refresh?.();
      Renderer.render();
      this.setStatus(`已載入 ${AppState.assetFiles.size} 個素材`);
    },
    async loadTemplateFolder(fileList) {
      const files = [...fileList].filter((file) => file.name.endsWith('.json') && file.name !== 'manifest.json');
      AppState.templates = [];
      for (const file of files) {
        try {
          const data = JSON.parse(await file.text());
          AppState.templates.push({ name: data.templateId || file.name.replace(/\.template\.json$/i, ''), file: file.name, visible: true, data });
        } catch (_) {}
      }
      if (!AppState.templates.length) return;
      AppState.activeIndex = 0;
      AppState.template = AppState.templates[0].data;
      AppState.selectedLayers = [];
      this.setStatus(`已上傳 ${AppState.templates.length} 個公版`);
      await this.loadImagesForActiveTemplate();
      window.SpecOverlayManager?.refresh?.();
      App.sync();
    },
  });

  // ── Renderer（16 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.Renderer, {
    computeGeneratedLayer(key) {
      if (key !== 'subtitle_frame') return null;
      const t = AppState.template;
      if (t?.generatedLayers?.subtitle_frame?.hidden === true) return null;
      const title = t.layers.title;
      const subtitle = t.layers.subtitle;
      const legal = t.layers.legal;
      if (!title || !subtitle) return null;

      const titleTextWidth = CapsuleRuleEngine.measureTextWidth(title, ctx);
      const subtitleTextWidth = CapsuleRuleEngine.measureTextWidth(subtitle, ctx);

      return CapsuleRuleEngine.buildLayer({
        template: t,
        title,
        subtitle,
        legal,
        titleTextWidth,
        subtitleTextWidth,
      });
    },
    getRuleShape(key, layer) {
      const rules = getRuleSection(CapsuleRuleEngine.getTemplateFamily(AppState.template), 'shapeLayers');
      const names = [key, layer?.psdName].filter(Boolean);
      return names.map((name) => rules[name]).find(Boolean) || null;
    },
    drawRuleShape(canvasCtx, key, layer) {
      const rule = this.getRuleShape(key, layer);
      return !!(rule && window.ShapeRenderer?.render?.(canvasCtx, layer, rule));
    },
    getTextRule(key, layer) {
      const rules = getRuleSection(CapsuleRuleEngine.getTemplateFamily(AppState.template), 'textRules');
      const names = [key, layer?.psdName].filter(Boolean);
      return names.map((name) => rules[name]).find(Boolean) || null;
    },
    _drawLayers(canvasCtx, t, ui = false) {
      for (const key of t.renderOrder || []) {
        if (key === 'subtitle_frame') {
          const generatedLayer = this.computeGeneratedLayer(key);
          if (generatedLayer && generatedLayer.hidden !== true) this.drawShape(canvasCtx, generatedLayer);
          continue;
        }
        const layer = t.layers[key];
        if (!layer || layer.hidden) continue;
        if (this.drawRuleShape(canvasCtx, key, layer)) continue;
        if (layer.type === 'shape') this.drawShape(canvasCtx, layer);
        if (layer.type === 'image') this.drawImage(canvasCtx, key, layer);
        if (layer.type === 'text') { this.drawText(canvasCtx, key, layer); if (ui && AppState.editingLayerKey === key) this.drawTextCaret(canvasCtx, key, layer); }
      }
    },
    render(options = { ui: true }, canvasCtx = ctx) {
      const t = AppState.template;
      if (!t) return;
      DOM.canvas.width = t.canvas.width;
      DOM.canvas.height = t.canvas.height;
      window.PriceTransformEngine?.syncTemplate?.(t);
      LayoutRuleEngine.apply(t);
      canvasCtx.clearRect(0, 0, t.canvas.width, t.canvas.height);
      this._drawLayers(canvasCtx, t, options.ui);
      if (options.ui && $('gridToggle')?.checked) this.drawGrid(canvasCtx);
      if (options.ui) this.drawSelection(canvasCtx);
      if (options.ui) SpecOverlayManager.draw(canvasCtx);
      Inspector.syncStatus();
      PreviewZoom.apply();
    },
    renderSceneTo(canvasCtx) {
      const t = AppState.template;
      window.PriceTransformEngine?.syncTemplate?.(t);
      LayoutRuleEngine.apply(t);
      canvasCtx.clearRect(0, 0, t.canvas.width, t.canvas.height);
      this._drawLayers(canvasCtx, t);
    },
    roundRect(canvasCtx, x, y, width, height, radius = 0) {
      const r = Math.max(0, Math.min(radius, width / 2, height / 2));
      canvasCtx.beginPath();
      canvasCtx.moveTo(x + r, y);
      canvasCtx.arcTo(x + width, y, x + width, y + height, r);
      canvasCtx.arcTo(x + width, y + height, x, y + height, r);
      canvasCtx.arcTo(x, y + height, x, y, r);
      canvasCtx.arcTo(x, y, x + width, y, r);
      canvasCtx.closePath();
    },
    drawShape(canvasCtx, layer) {
      if (!layer) return;

      const shapeKind = String(layer.shape?.kind || layer.shape?.geometry?.kind || '').toLowerCase();
      // CTA 箭頭需要固定用程式繪製為向右三角形；優先於 ShapeRenderer，避免被舊向上 path 解析覆蓋。
      if (shapeKind === 'triangle' || shapeKind === 'righttriangle' || shapeKind === 'ctaarrow' || shapeKind === 'ctaarrowright') {
        const corners = Array.isArray(layer.shape?.geometry?.corners) && layer.shape.geometry.corners.length >= 3
          ? layer.shape.geometry.corners
          : [
              { x: Number(layer.x || 0), y: Number(layer.y || 0) },
              { x: Number(layer.x || 0) + Number(layer.width || 0), y: Number(layer.y || 0) + Number(layer.height || 0) / 2 },
              { x: Number(layer.x || 0), y: Number(layer.y || 0) + Number(layer.height || 0) },
            ];
        canvasCtx.save();
        canvasCtx.fillStyle = layer.fill || layer.shape?.fill || '#ffffff';
        canvasCtx.beginPath();
        canvasCtx.moveTo(Number(corners[0].x || 0), Number(corners[0].y || 0));
        corners.slice(1).forEach((point) => canvasCtx.lineTo(Number(point.x || 0), Number(point.y || 0)));
        canvasCtx.closePath();
        canvasCtx.fill();
        canvasCtx.restore();
        return;
      }

      // V3.29.2：PSD 公版小工具 V2.2 / V2.3 匯出的 JSON shape
      // 非 CTA 箭頭的 shape 仍交給 ShapeRenderer 依 shape.kind 繪製。
      if (
        layer.type === 'shape' &&
        layer.shape &&
        window.ShapeRenderer?.renderJsonShape?.(canvasCtx, layer)
      ) {
        return;
      }

      canvasCtx.save();
      canvasCtx.fillStyle = layer.fill || '#ffffff';
      const fallbackRadius = Number(layer.radius ?? layer.shape?.cornerRadius ?? layer.shape?.geometry?.cornerRadius ?? 0) || 0;
      this.roundRect(canvasCtx, layer.x, layer.y, layer.width, layer.height, fallbackRadius);
      canvasCtx.fill();
      canvasCtx.restore();
    },
    font(layer) {
      const style  = layer.fontStyle === 'italic' ? 'italic ' : '';
      const weight = layer.fontWeight || 400;
      const size   = layer.fontSizePx || 24;
      const family = layer.fontFamily
        ? `"${layer.fontFamily}","ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif`
        : '"ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif';
      return `${style}${weight} ${size}px ${family}`;
    },
    drawText(canvasCtx, key, layer) {
      const renderLayer = (AppState.editingLayerKey === key && canvasCtx === ctx)
        ? { ...layer, text: AppState.editingText }
        : layer;
      const drawableLayer = { ...renderLayer };
      const textRule = this.getTextRule?.(key, drawableLayer) || null;
      if (Number.isFinite(Number(textRule?.lineHeightPx))) {
        drawableLayer.lineHeight = Number(textRule.lineHeightPx);
      }
      const rotation = Number(drawableLayer.rotation || 0);

      canvasCtx.save();
      if (rotation) {
        const cx = (drawableLayer.x || 0) + (drawableLayer.width || 0) / 2;
        const cy = (drawableLayer.y || 0) + (drawableLayer.height || 0) / 2;
        canvasCtx.translate(cx, cy);
        canvasCtx.rotate((rotation * Math.PI) / 180);
        drawableLayer.x = -(drawableLayer.width || 0) / 2;
        drawableLayer.y = -(drawableLayer.height || 0) / 2;
      }

      canvasCtx.fillStyle = drawableLayer.color || '#000000';
      canvasCtx.font = this.font(drawableLayer);
      canvasCtx.textAlign = drawableLayer.align || 'center';
      canvasCtx.textBaseline = 'top';
      const textValue = String(drawableLayer.text || '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = textValue.split('\n');
      const fontSize = drawableLayer.fontSizePx || 24;
      const lineHeight = drawableLayer.lineHeight || fontSize * 1.05;
      const letterSpacing = Number(drawableLayer.letterSpacing || 0);
      const startY = drawableLayer.y + Math.max(0, (drawableLayer.height - lines.length * lineHeight) / 2);
      const x = drawableLayer.align === 'left'
        ? drawableLayer.x
        : drawableLayer.align === 'right'
          ? drawableLayer.x + drawableLayer.width
          : drawableLayer.x + drawableLayer.width / 2;

      let charOffset = 0;
      lines.forEach((line, i) => {
        const segments = this.getTextStyleSegments(drawableLayer, line, charOffset);
        if (segments.length > 1 || (segments[0]?.color && segments[0].color !== (drawableLayer.color || '#000000'))) {
          this.drawStyledTextLine(canvasCtx, segments, x, startY + i * lineHeight, drawableLayer.align || 'center', letterSpacing, drawableLayer.color || '#000000');
        } else {
          this.drawTextLine(canvasCtx, line, x, startY + i * lineHeight, drawableLayer.align || 'center', letterSpacing);
        }
        // +1 accounts for the newline removed by split(). It is harmless for the last line.
        charOffset += String(line || '').length + 1;
      });

      // 底線
      if (drawableLayer.textDecoration?.includes('underline')) {
        canvasCtx.strokeStyle = drawableLayer.color || '#000000';
        canvasCtx.lineWidth = Math.max(1, fontSize * 0.06);
        lines.forEach((line, i) => {
          const w = canvasCtx.measureText(line).width;
          const x0 = drawableLayer.align === 'right'  ? x - w
                   : drawableLayer.align === 'center' ? x - w / 2
                   : x;
          const y0 = startY + i * lineHeight + fontSize + 2;
          canvasCtx.beginPath(); canvasCtx.moveTo(x0, y0); canvasCtx.lineTo(x0 + w, y0); canvasCtx.stroke();
        });
      }

      canvasCtx.restore();
    },
    getTextStyleSegments(layer, line, lineStartOffset = 0) {
      const text = String(line || '');
      if (!text) return [{ text: '', color: layer?.color || '#000000' }];

      const ranges = Array.isArray(layer?.textStyleRanges)
        ? layer.textStyleRanges
            .map((range) => ({
              from: Math.max(0, Number(range?.from ?? 0)),
              to: Math.max(0, Number(range?.to ?? 0)),
              color: range?.color || range?.fill || range?.style?.color || range?.style?.fill || layer?.color || '#000000',
            }))
            .filter((range) => range.to > range.from)
            .sort((a, b) => a.from - b.from)
        : [];

      if (!ranges.length) return [{ text, color: layer?.color || '#000000' }];

      const lineEndOffset = lineStartOffset + text.length;
      const boundaries = new Set([0, text.length]);
      ranges.forEach((range) => {
        const from = Math.max(lineStartOffset, range.from) - lineStartOffset;
        const to = Math.min(lineEndOffset, range.to) - lineStartOffset;
        if (from > 0 && from < text.length) boundaries.add(from);
        if (to > 0 && to < text.length) boundaries.add(to);
      });

      const points = [...boundaries].sort((a, b) => a - b);
      const segments = [];
      for (let i = 0; i < points.length - 1; i += 1) {
        const from = points[i];
        const to = points[i + 1];
        if (to <= from) continue;
        const absoluteIndex = lineStartOffset + from;
        const matchedRange = ranges.find((range) => absoluteIndex >= range.from && absoluteIndex < range.to);
        segments.push({
          text: text.slice(from, to),
          color: matchedRange?.color || layer?.color || '#000000',
        });
      }
      return segments.length ? segments : [{ text, color: layer?.color || '#000000' }];
    },
    measureTextSegments(canvasCtx, segments = [], letterSpacing = 0) {
      const chars = segments.flatMap((segment) => [...String(segment.text || '')]);
      return segments.reduce((sum, segment) => {
        const text = String(segment.text || '');
        return sum + [...text].reduce((width, ch) => width + canvasCtx.measureText(ch).width, 0);
      }, 0) + Number(letterSpacing || 0) * Math.max(0, chars.length - 1);
    },
    drawStyledTextLine(canvasCtx, segments = [], x, y, align = 'center', letterSpacing = 0, fallbackColor = '#000000') {
      const visibleSegments = segments.filter((segment) => String(segment.text || '').length);
      if (!visibleSegments.length) return;

      const totalWidth = this.measureTextSegments(canvasCtx, visibleSegments, letterSpacing);
      let cursorX = align === 'right' ? x - totalWidth : align === 'center' ? x - totalWidth / 2 : x;
      const originalAlign = canvasCtx.textAlign;
      const originalFill = canvasCtx.fillStyle;
      canvasCtx.textAlign = 'left';

      let drawnChars = 0;
      visibleSegments.forEach((segment) => {
        canvasCtx.fillStyle = segment.color || fallbackColor;
        [...String(segment.text || '')].forEach((ch) => {
          canvasCtx.fillText(ch, cursorX, y);
          cursorX += canvasCtx.measureText(ch).width;
          drawnChars += 1;
          if (drawnChars < [...visibleSegments.map((item) => item.text).join('')].length) cursorX += Number(letterSpacing || 0);
        });
      });

      canvasCtx.fillStyle = originalFill;
      canvasCtx.textAlign = originalAlign;
    },
    drawTextLine(canvasCtx, text, x, y, align = 'center', letterSpacing = 0) {
      if (!letterSpacing) {
        canvasCtx.fillText(text, x, y);
        return;
      }
      const chars = [...String(text || '')];
      if (!chars.length) return;
      const totalWidth = chars.reduce((sum, ch) => sum + canvasCtx.measureText(ch).width, 0) + letterSpacing * Math.max(0, chars.length - 1);
      let cursorX = align === 'right' ? x - totalWidth : align === 'center' ? x - totalWidth / 2 : x;
      canvasCtx.textAlign = 'left';
      chars.forEach((ch) => {
        canvasCtx.fillText(ch, cursorX, y);
        cursorX += canvasCtx.measureText(ch).width + letterSpacing;
      });
      canvasCtx.textAlign = align;
    },
    drawImage(canvasCtx, key, layer) {
      const box = Geometry.getRenderedImageBox(key, layer);
      const img = AppState.images[key];
      const ready = Geometry.isImageReady(key, layer);
      canvasCtx.save();
      canvasCtx.translate(box.centerX, box.centerY);
      canvasCtx.rotate(((layer.rotation || 0) * Math.PI) / 180);
      if (img && ready) {
        canvasCtx.drawImage(img, -box.width / 2, -box.height / 2, box.width, box.height);
      } else if (!layer.assetFilename) {
        // 這個 layer 本來就沒有指定素材檔名（例如編輯中尚未選圖），維持原本的虛線佔位框，方便辨識。
        canvasCtx.strokeStyle = 'rgba(255,255,255,.85)';
        canvasCtx.setLineDash([6, 4]);
        canvasCtx.strokeRect(-box.width / 2, -box.height / 2, box.width, box.height);
        canvasCtx.fillStyle = '#ffffff';
        canvasCtx.font = '14px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(layer.psdName || key, 0, 4);
      }
      // 有指定素材檔名、但圖片還沒真正 decode 完成時，這裡刻意先不畫任何東西，
      // 而不是用容器滿版寬高畫出未依照片比例縮放的暫時畫面。
      canvasCtx.restore();
    },
  });

  // ── CapsuleRuleEngine（7 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.CapsuleRuleEngine, {
    defaultRules: Object.freeze({
      horizontalPaddingPx: 25,
      subtitleWiderPaddingPx: 25,
      titleWiderPaddingPx: 25,
      titleWiderPaddingMaxDiffPx: 70,
      subtitleWiderPaddingMaxDiffPx: null,
      verticalGapPx: 13,
      verticalPaddingPx: 13,
      legalGapPx: 11,
      minWidthPx: 1,
      fill: '#0053d1',
    }),

    getRules(template = AppState.template) {
      return {
        ...this.defaultRules,
        ...this.getExternalRules(template),
      };
    },
    getRules(template = AppState.template) {
      return {
        ...this.defaultRules,
        ...this.getExternalRules(template),
      };
    },
    getExternalRules(template = AppState.template) {
      return getRuleSection(this.getTemplateFamily(template), 'capsuleRules');
    },
    getTemplateFamily(template = AppState.template) {
      const explicitFamily = template?.ruleFamily || template?.sheetTemplateRoute?.family;
      if (explicitFamily) return explicitFamily;

      // 修正批次產圖時的家族誤判：原本這裡會額外把
      // AppState.templates[AppState.activeIndex] 的名稱/檔名一起塞進判斷字串裡，
      // 當作「萬一 template 自己沒帶識別資訊時」的備援。但批次產圖迴圈要等
      // 全部記錄都處理完，才會更新 AppState.templates / activeIndex，處理每一筆
      // 記錄的當下，這兩個全域變數其實還停留在「使用者上一次操作」的舊內容。
      // 如果剛好含有其他家族的關鍵字，就會被誤判成那個家族，套用到錯誤的
      // 專屬處理邏輯。template 自己的 templateId / batchSourceName / source.psdName
      // 已經足夠識別，不應該再依賴這種容易過期、跟目前處理的記錄無關的全域狀態。
      const labelParts = [
        template?.templateId,
        template?.batchSourceName,
        template?.source?.psdName,
      ].filter(Boolean);

      const label = this.norm(labelParts.join(' '));
      if (label.includes('頭巾vip') || label.includes('headbandvip') || label.includes('hdbvip')) return 'headband_vip';
      if (label.includes('頭巾全站') || label.includes('headbandshopee') || label.includes('hdbshopee')) return 'headband_shopee';

      const registeredFamily = (window.TemplateRuleManager || window.TemplateRuleRegistry)?.detectFamily?.(labelParts, null);
      if (registeredFamily) return registeredFamily;

      // Fallback only for environments that load app.core.js without the registry.
      if (label.includes('ddcard') || label.includes('ddc') || label.includes('dd card')) return 'ddcard';
      if (label.includes('hbn') || label.includes('han')) return 'hbn';
      if (label.includes('headband') || label.includes('hdb') || label.includes('頭巾')) return 'headband';
      return 'ddcard';
    },
    measureTextWidth(layer, measureContext) {
      if (!layer || !measureContext) return 0;
      if (layer.ddcardVipGroupProxy === true && Number.isFinite(Number(layer.ddcardVipGroupWidth))) {
        return Math.ceil(Math.max(1, Number(layer.ddcardVipGroupWidth)));
      }
      if (layer.hbnTitleLogoGroupProxy === true && Number.isFinite(Number(layer.hbnTitleLogoGroupWidth))) {
        return Math.ceil(Math.max(1, Number(layer.hbnTitleLogoGroupWidth)));
      }
      measureContext.save();
      measureContext.font = Renderer.font(layer);
      const letterSpacing = Number(layer.letterSpacing || 0);
      const lines = String(layer.text || '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const width = lines.reduce((maxWidth, line) => {
        const chars = [...String(line || '')];
        const textWidth = chars.reduce((sum, ch) => sum + measureContext.measureText(ch).width, 0);
        const spacingWidth = letterSpacing * Math.max(0, chars.length - 1);
        return Math.max(maxWidth, textWidth + spacingWidth);
      }, 0);
      measureContext.restore();
      return Math.ceil(width);
    },
    calculateWidth({ titleTextWidth, subtitleTextWidth, rules }) {
      const titleWidth = Number(titleTextWidth || 0);
      const subtitleWidth = Number(subtitleTextWidth || 0);
      const widthDiff = Math.abs(titleWidth - subtitleWidth);
      const basePadding = Number(rules.horizontalPaddingPx ?? 25);

      if (subtitleWidth > titleWidth) {
        const limit = rules.subtitleWiderPaddingMaxDiffPx;
        const shouldPad = limit === null || limit === undefined || widthDiff < Number(limit);
        const padding = Number(rules.subtitleWiderPaddingPx ?? basePadding);
        return subtitleWidth + (shouldPad ? padding * 2 : 0);
      }

      if (titleWidth > subtitleWidth) {
        const limit = rules.titleWiderPaddingMaxDiffPx;
        const shouldPad = limit === null || limit === undefined || widthDiff < Number(limit);
        const padding = Number(rules.titleWiderPaddingPx ?? basePadding);
        return titleWidth + (shouldPad ? padding * 2 : 0);
      }

      return Math.max(titleWidth, subtitleWidth);
    },
    buildLayer({ template, title, subtitle, legal, titleTextWidth, subtitleTextWidth }) {
      const rules = this.getRules(template);
      const isolatedCapsule = rules.isolatedIGCapsule === true;
      const isGroupedSubtitle = subtitle?.hbnTitleLogoGroupProxy === true;
      let computedWidth = this.calculateWidth({ titleTextWidth, subtitleTextWidth, rules });

      // IG Story has its own capsule requirements and must not change the
      // historical V4 capsule flow used by DDcard / HBN / POPUP / Headband.
      // Only templates that explicitly set isolatedIGCapsule can override the
      // generated capsule width and preserve the subtitle/legal text boxes.
      if (isolatedCapsule && typeof rules.resolveCapsuleWidth === 'function') {
        try {
          const customWidth = rules.resolveCapsuleWidth({
            template,
            title,
            subtitle,
            legal,
            titleTextWidth,
            subtitleTextWidth,
            measureTextWidth: (layer) => this.measureTextWidth(layer, ctx),
            round,
          });
          if (Number.isFinite(Number(customWidth))) computedWidth = Number(customWidth);
        } catch (error) {
          console.warn('[CapsuleRuleEngine] isolated capsule width failed:', error);
        }
      }

      const capsuleWidth = Math.max(Number(rules.minWidthPx || 1), computedWidth);
      const verticalGap = Number(rules.verticalGapPx ?? 13);
      const verticalPadding = Number(rules.verticalPaddingPx ?? 13);
      const legalGap = Number(rules.legalGapPx ?? 11);
      const centerSource = isolatedCapsule && rules.centerSource === 'subtitle' ? subtitle : title;
      const centerX = (centerSource.x || 0) + (centerSource.width || 0) / 2;
      const x = round(centerX - capsuleWidth / 2, 2);
      const preserveTextLayerLayout = !!rules.preserveTextLayerLayout;
      const preserveSubtitleY = (isolatedCapsule || preserveTextLayerLayout) && !!rules.preserveSubtitleY;
      const preserveSubtitleBox = (isolatedCapsule || preserveTextLayerLayout) && !!rules.preserveSubtitleBox;
      const preserveLegalY = (isolatedCapsule || preserveTextLayerLayout) && !!rules.preserveLegalY;
      const y = preserveSubtitleY
        ? round((subtitle.y || 0) - verticalPadding, 2)
        : round((title.y || 0) + (title.height || 0) + verticalGap, 2);
      const subtitleHasVip = /VIP/i.test(String(subtitle?.text || '')) || subtitle?.ddcardVipGroupProxy === true;
      const subtitleVipFixedHeight = Number(rules.subtitleVipFixedHeightPx || 0);
      const groupedSubtitleHeight = Number(rules.groupedSubtitleHeightPx || 0);
      const height = isGroupedSubtitle && groupedSubtitleHeight > 0
        ? round(groupedSubtitleHeight, 2)
        : subtitleHasVip && subtitleVipFixedHeight > 0
          ? round(subtitleVipFixedHeight, 2)
          : round((subtitle.height || 0) + verticalPadding * 2, 2);

      if (!preserveSubtitleBox) {
        subtitle.x = x;
        subtitle.width = round(capsuleWidth, 2);
      }
      if (!preserveSubtitleY) subtitle.y = round(y + verticalPadding, 2);
      if (legal && !preserveLegalY) legal.y = round(y + height + legalGap, 2);

      return {
        type: 'shape',
        x,
        y,
        width: round(capsuleWidth, 2),
        height,
        fill: rules.fill || template.generatedLayers?.subtitle_frame?.fill || '#0053d1',
        radius: rules.radius === 'capsule' || rules.radius === undefined ? height / 2 : Number(rules.radius || 0),
      };
    },
  });

  // ── LayoutRuleEngine（15 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.LayoutRuleEngine, {
    getRules(template = AppState.template) {
      return getRuleSection(CapsuleRuleEngine.getTemplateFamily(template), 'layoutRules');
    },
    findLayerEntry(template, candidates = [], options = {}) {
      const entries = Object.entries(template?.layers || {});
      const normalizedCandidates = candidates.map((name) => this.norm(name)).filter(Boolean);
      const type = options.type || '';
      const nearLayer = options.nearLayer || null;
      const maxDistanceY = Number(options.maxDistanceY || 0);
      const preferLeftOfNear = !!options.preferLeftOfNear;

      const matched = entries
        .filter(([, layer]) => !type || layer.type === type)
        .map(([key, layer]) => ({ key, layer }))
        .filter(({ key, layer }) => {
          const label = this.norm(`${key} ${layer?.psdName || ''} ${layer?.role || ''}`);
          return normalizedCandidates.some((candidate) => label === candidate || label.includes(candidate));
        })
        .filter(({ layer }) => {
          if (!nearLayer) return true;
          const nearCenterY = Number(nearLayer.y || 0) + Number(nearLayer.height || 0) / 2;
          const layerCenterY = Number(layer.y || 0) + Number(layer.height || 0) / 2;
          if (maxDistanceY && Math.abs(layerCenterY - nearCenterY) > maxDistanceY) return false;
          if (preferLeftOfNear && Number(layer.x || 0) > Number(nearLayer.x || 0)) return false;
          return true;
        });

      return matched[0] || null;
    },
    measureTextWidth(layer) {
      if (!layer || layer.type !== 'text') return Number(layer?.width || 0);
      return CapsuleRuleEngine.measureTextWidth(layer, ctx);
    },
    getLayerCenterX(layer) {
      return Number(layer?.centerX ?? (Number(layer?.x || 0) + Number(layer?.width || 0) / 2));
    },
    getLayerCenterY(layer) {
      return Number(layer?.centerY ?? (Number(layer?.y || 0) + Number(layer?.height || 0) / 2));
    },
    setLayerCenterX(layer, centerX) {
      if (!layer) return;
      const width = Number(layer.width || 0);
      layer.x = round(Number(centerX || 0) - width / 2, 2);
      layer.centerX = round(Number(centerX || 0), 2);
    },
    getCombinedBox(layers = []) {
      const visibleLayers = layers.filter(Boolean);
      if (!visibleLayers.length) return { x: 0, y: 0, width: 1, height: 1, centerX: 0.5, centerY: 0.5 };
      const left = Math.min(...visibleLayers.map((layer) => Number(layer.x || 0)));
      const top = Math.min(...visibleLayers.map((layer) => Number(layer.y || 0)));
      const right = Math.max(...visibleLayers.map((layer) => Number(layer.x || 0) + Number(layer.width || 0)));
      const bottom = Math.max(...visibleLayers.map((layer) => Number(layer.y || 0) + Number(layer.height || 0)));
      return {
        x: left,
        y: top,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top),
        centerX: left + (right - left) / 2,
        centerY: top + (bottom - top) / 2,
      };
    },
    ensureLayer(template, key, baseLayer = {}) {
      if (!template.layers[key]) template.layers[key] = baseLayer;
      return template.layers[key];
    },
    insertBefore(template, layerKey, beforeKeys = []) {
      template.renderOrder = (template.renderOrder || []).filter((key) => key !== layerKey);
      const targetIndex = template.renderOrder.findIndex((key) => beforeKeys.includes(key));
      template.renderOrder.splice(targetIndex >= 0 ? targetIndex : template.renderOrder.length, 0, layerKey);
    },
    apply(template = AppState.template) {
      const rules = this.getRules(template);
      if (typeof rules?.applyProgrammaticLayout === 'function') {
        rules.applyProgrammaticLayout({
          template,
          helpers: {
            round,
            findLayerEntry: this.findLayerEntry.bind(this),
            measureTextWidth: this.measureTextWidth.bind(this),
            setLayerCenterX: this.setLayerCenterX.bind(this),
            getLayerCenterX: this.getLayerCenterX.bind(this),
            getLayerCenterY: this.getLayerCenterY.bind(this),
            getCombinedBox: this.getCombinedBox.bind(this),
            applyProgrammaticCapsule: this.applyProgrammaticCapsule.bind(this),
            insertBefore: this.insertBefore.bind(this),
          },
        });
      }
      if (rules?.headbandShopeeTitleLine?.enabled === true) {
        this.applyHeadbandShopeeTitleLine(template, rules.headbandShopeeTitleLine || {});
      }
      if (rules?.headbandVipTitleLine?.enabled === true) {
        this.applyHeadbandVipTitleLine(template, rules.headbandVipTitleLine || {});
      }
    },
    resolveHeadbandBackgroundWidth({ topLogoWidth = 0, contentWidth = 0, thresholdPx = 70, paddingX = 25 }) {
      const logoWidth = Number(topLogoWidth || 0);
      const targetWidth = Number(contentWidth || 0);
      const diff = Math.abs(logoWidth - targetWidth);

      if (logoWidth > targetWidth && diff >= Number(thresholdPx || 70)) {
        return Math.max(1, logoWidth);
      }
      return Math.max(1, targetWidth + Number(paddingX || 0) * 2);
    },
    applyProgrammaticCapsule({ template, bgKey, centerX, centerY, width, fill }) {
      const bg = this.ensureLayer(template, bgKey, {
        type: 'shape',
        psdName: bgKey,
        source: 'generated_headband_layout',
      });
      const height = 58;
      const radius = height / 2;

      bg.type = 'shape';
      bg.psdName = bg.psdName || bgKey;
      bg.source = 'generated_headband_layout';
      bg.fill = fill || bg.fill || '#0053D1';
      bg.shape = null;
      bg.useDynamicBounds = true;
      bg.x = round(Number(centerX || 0) - Number(width || 1) / 2, 2);
      bg.y = round(Number(centerY || 0) - height / 2, 2);
      bg.width = round(Math.max(1, Number(width || 1)), 2);
      bg.height = height;
      bg.radius = radius;
      bg.centerX = round(bg.x + bg.width / 2, 2);
      bg.centerY = round(bg.y + bg.height / 2, 2);
      bg.hidden = false;
      return bg;
    },
    applyHeadbandShopeeTitleLine(template, rule = {}) {
      if (!template?.layers) return;

      const subtitleEntry = this.findLayerEntry(template, rule.subtitleLayers || ['subtitle', '副標題'], { type: 'text' });
      const topLogoEntry = this.findLayerEntry(template, rule.anchorLogoLayers || ['18號會員日_LOGO', '18號會員日 LOGO']);
      if (!subtitleEntry || !topLogoEntry) return;

      const legalEntry = this.findLayerEntry(template, rule.legalLayers || ['legal', '法務', '法務小字'], { type: 'text' });
      const bgKey = rule.backgroundLayerKey || '案型_BG';
      const paddingX = Number(rule.backgroundPaddingX ?? 25);
      const thresholdPx = Number(rule.widthCompareThresholdPx ?? 70);
      const subtitleWidth = Math.max(1, this.measureTextWidth(subtitleEntry.layer));
      const topLogoWidth = Number(topLogoEntry.layer.width || 0);
      const topLogoCenterX = this.getLayerCenterX(topLogoEntry.layer);
      const subtitleCenterY = this.getLayerCenterY(subtitleEntry.layer);
      const bgWidth = this.resolveHeadbandBackgroundWidth({
        topLogoWidth,
        contentWidth: subtitleWidth,
        thresholdPx,
        paddingX,
      });

      subtitleEntry.layer.width = round(subtitleWidth, 2);
      this.setLayerCenterX(subtitleEntry.layer, topLogoCenterX);
      if (legalEntry?.layer) this.setLayerCenterX(legalEntry.layer, topLogoCenterX);

      this.applyProgrammaticCapsule({
        template,
        bgKey,
        centerX: topLogoCenterX,
        centerY: subtitleCenterY,
        width: bgWidth,
        fill: rule.backgroundFill || '#0053D1',
      });

      this.insertBefore(template, bgKey, [subtitleEntry.key]);
    },
    applyHeadbandVipTitleLine(template, rule = {}) {
      if (!template?.layers) return;

      const subtitleEntry = this.findLayerEntry(template, rule.subtitleLayers || ['subtitle', '副標題'], { type: 'text' });
      const topLogoEntry = this.findLayerEntry(template, rule.anchorLogoLayers || ['18號會員日_LOGO', '18號會員日 LOGO']);
      if (!subtitleEntry || !topLogoEntry) return;

      const vipLogoEntry = this.findLayerEntry(
        template,
        rule.vipLogoLayers || ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO'],
        { nearLayer: subtitleEntry.layer, maxDistanceY: 80, preferLeftOfNear: true }
      );
      if (!vipLogoEntry) return;

      const legalEntry = this.findLayerEntry(template, rule.legalLayers || ['legal', '法務', '法務小字'], { type: 'text' });
      const gap = Number(rule.gapPx ?? 5);
      const paddingX = Number(rule.backgroundPaddingX ?? 25);
      const thresholdPx = Number(rule.widthCompareThresholdPx ?? 70);
      const bgKey = rule.backgroundLayerKey || '案型_BG';
      const bgFill = rule.backgroundFill || '#0053D1';
      const topLogoWidth = Number(topLogoEntry.layer.width || 0);
      const topLogoCenterX = this.getLayerCenterX(topLogoEntry.layer);
      const subtitleWidth = Math.max(1, this.measureTextWidth(subtitleEntry.layer));
      const vipLogoWidth = Number(vipLogoEntry.layer.width || 0);
      const groupWidth = vipLogoWidth + gap + subtitleWidth;
      const groupX = topLogoCenterX - groupWidth / 2;

      vipLogoEntry.layer.x = round(groupX, 2);
      vipLogoEntry.layer.centerX = round(groupX + vipLogoWidth / 2, 2);
      subtitleEntry.layer.x = round(groupX + vipLogoWidth + gap, 2);
      subtitleEntry.layer.width = round(subtitleWidth, 2);
      subtitleEntry.layer.centerX = round(subtitleEntry.layer.x + subtitleWidth / 2, 2);
      if (legalEntry?.layer) this.setLayerCenterX(legalEntry.layer, topLogoCenterX);

      const groupBox = this.getCombinedBox([vipLogoEntry.layer, subtitleEntry.layer]);
      const bgWidth = this.resolveHeadbandBackgroundWidth({
        topLogoWidth,
        contentWidth: groupWidth,
        thresholdPx,
        paddingX,
      });
      this.applyProgrammaticCapsule({
        template,
        bgKey,
        centerX: topLogoCenterX,
        centerY: groupBox.centerY,
        width: bgWidth,
        fill: bgFill,
      });

      this.insertBefore(template, bgKey, [subtitleEntry.key, vipLogoEntry.key]);
    },
    handleLayerBoxApplied(key, layer, previousBox = null, template = AppState.template) {
      if (!template?.layers || !key || !layer) return;
      const family = CapsuleRuleEngine.getTemplateFamily(template);
      if (family !== 'headband_vip') return;

      const rule = this.getRules(template)?.headbandVipTitleLine || {};
      if (rule.enabled !== true) return;

      const subtitleEntry = this.findLayerEntry(template, rule.subtitleLayers || ['subtitle', '副標題'], { type: 'text' });
      const vipLogoEntry = this.findLayerEntry(
        template,
        rule.vipLogoLayers || ['蝦皮VIP_LOGO', '蝦皮VIP LOGO', 'VIP LOGO'],
        { nearLayer: subtitleEntry?.layer, maxDistanceY: 100, preferLeftOfNear: true }
      );
      if (!subtitleEntry || !vipLogoEntry) return;

      const changedIsVipLogo = key === vipLogoEntry.key;
      const changedIsSubtitle = key === subtitleEntry.key;
      if (!changedIsVipLogo && !changedIsSubtitle) return;

      const previousWidth = Number(previousBox?.width || 0);
      const currentWidth = Number(layer.width || 0);
      const scale = previousWidth > 0 && currentWidth > 0 ? currentWidth / previousWidth : 1;
      if (!Number.isFinite(scale) || Math.abs(scale - 1) < 0.001) return;

      if (changedIsVipLogo) {
        const subtitle = subtitleEntry.layer;
        subtitle.fontSizePx = round(Number(subtitle.fontSizePx || 24) * scale, 2);
        subtitle.fontSizePt = subtitle.fontSizePx;
        subtitle.lineHeight = round(Number(subtitle.lineHeight || subtitle.fontSizePx * 1.08) * scale, 2);
        subtitle.height = round(Math.max(1, Number(subtitle.height || subtitle.lineHeight) * scale), 2);
      } else if (changedIsSubtitle) {
        const vipLogo = vipLogoEntry.layer;
        vipLogo.width = round(Math.max(1, Number(vipLogo.width || 1) * scale), 2);
        vipLogo.height = round(Math.max(1, Number(vipLogo.height || 1) * scale), 2);
        vipLogo.centerX = round(Number(vipLogo.x || 0) + vipLogo.width / 2, 2);
        vipLogo.centerY = round(Number(vipLogo.y || 0) + vipLogo.height / 2, 2);
        if (vipLogo.keepAspectRatio) {
          vipLogo.targetWidth = round(vipLogo.width, 2);
          vipLogo.targetHeight = round(vipLogo.height, 2);
          vipLogo.maxTargetHeight = round(vipLogo.height, 2);
        }
      }
    },
  });

  // ── PriceRuleEngine（12 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.PriceRuleEngine, {
    defaultLayouts: Object.freeze({
      doubleCoupon: [
        { slot: 'bottom', psdName: '價格1（下券）', leftX: 211.3, topY: 509.71, width: 231.4, height: 102.7, rotation: 2, fontSizePx: 95, letterSpacing: 0 },
        { slot: 'top', psdName: '價格2（上券）', leftX: 206.3, topY: 372.6, width: 231.4, height: 102.7, rotation: -6, fontSizePx: 95, letterSpacing: 0 },
      ],
      vip: [{ slot: 'single', psdName: '價格', centerX: 328, centerY: 520, rotation: 12, fontSizePx: 80, letterSpacing: 0 }],
      creditCardCoupon: [{ slot: 'single', psdName: '價格', leftX: 230, topY: 510, rotation: -10, fontSizePx: 95, letterSpacing: 0, categoryScale: 0.9 }],
      freeShippingCoupon: [{ slot: 'single', psdName: '價格', leftX: 99, topY: 260, rotation: 8, fontSizePx: 85, letterSpacing: 0, categoryScale: 0.85 }],
      couponCoin: [{ slot: 'single', psdName: '價格', centerX: 250, centerY: 557, rotation: -6, fontSizePx: 95, letterSpacing: 0 }],
      singleCoupon: [{ slot: 'single', psdName: '價格', centerX: 328, centerY: 520, rotation: 12, fontSizePx: 80, letterSpacing: 0 }],
    }),

    hasEffectiveExternalRules(rules) {
      return !!(rules && rules.enabled !== false && (
        Object.keys(rules.templateLayouts || {}).length ||
        Object.keys(rules.productLayouts || {}).length ||
        Array.isArray(rules.classifiers)
      ));
    },
    hasEffectiveExternalRules(rules) {
      return !!(rules && rules.enabled !== false && (
        Object.keys(rules.templateLayouts || {}).length ||
        Object.keys(rules.productLayouts || {}).length ||
        Array.isArray(rules.classifiers)
      ));
    },
    getRules(template = AppState.template) {
      const family = this.getTemplateFamily(template);

      // HBN 只從 registry 取規則（V4.17: 移除 legacy window.HBNTemplateRules fallback）。
      // 若 hbn.rules.js 未載入，回傳空 absolute 規則，避免 fallback 到 DDCard。
      if (family === 'hbn') {
        const registeredRules = (window.TemplateRuleManager || window.TemplateRuleRegistry)?.getRules?.('hbn', 'priceRules') || {};
        if (this.hasEffectiveExternalRules(registeredRules)) return registeredRules;
        return {
          enabled: true, coordinateMode: 'absolute', positioningMode: 'absolute',
          lockToEditedJson: true,
          templateLayouts: {}, productLayouts: {}, classifiers: [],
        };
      }

      const rules = getRuleSection(family, 'priceRules');
      if (this.hasEffectiveExternalRules(rules)) return rules;
      return {};
    },
    getTemplateFamily: (template) => CapsuleRuleEngine.getTemplateFamily(template),
    classify(productName, template = AppState.template, rawPrice = '') {
      const raw = String(productName || '');
      const normalized = this.norm(raw);
      const externalRule = this.resolveExternalRule({ productName: raw, template, rawPrice });

      if (externalRule?.layouts?.length) {
        const isDoubleCoupon = externalRule.layouts.some((layout) => layout.slot === 'top' || layout.slot === 'bottom');
        return {
          layoutKey: externalRule.layoutKey || (isDoubleCoupon ? 'doubleCoupon' : 'singleCoupon'),
          isDoubleCoupon,
          isVip: /vip/i.test(raw),
          layouts: externalRule.layouts.map((layout) => this.normalizeLayout(layout)),
          externalRule,
        };
      }

      // Registered public-template families use edited JSON absolute coordinates.
      // If a family has no matching absolute rule, do not fall back to DD Card defaults.
      const family = this.getTemplateFamily(template);

      const familyRules = this.getRules(template);
      const requiresAbsoluteRule = familyRules?.coordinateMode === 'absolute' || familyRules?.lockToEditedJson === true;
      if (requiresAbsoluteRule) {
        console.warn('[PriceRuleEngine] 價格缺少 absolute 規則，已略過價格生成：', {
          family,
          templateId: template?.templateId,
          batchSourceName: template?.batchSourceName,
          productName: raw,
          rawPrice,
        });
        return {
          layoutKey: `missing${String(family || 'template').toUpperCase()}AbsoluteRule`,
          isDoubleCoupon: false,
          isVip: /vip/i.test(raw),
          layouts: [],
        };
      }

      const isDoubleCoupon = normalized.includes(this.norm('雙券'));
      const isVip = /vip/i.test(raw);
      const isCreditCardCoupon = /信用卡加.*券/.test(normalized);
      const isFreeShippingCoupon = /免運車加.*券/.test(normalized);
      const isCouponCoin = /券加蝦幣/.test(normalized);
      const layoutKey = isDoubleCoupon
        ? 'doubleCoupon'
        : isCreditCardCoupon
          ? 'creditCardCoupon'
          : isFreeShippingCoupon
            ? 'freeShippingCoupon'
            : isCouponCoin
              ? 'couponCoin'
              : isVip
                ? 'vip'
                : 'singleCoupon';

      return {
        layoutKey,
        isDoubleCoupon,
        isVip,
        layouts: this.defaultLayouts[layoutKey] || this.defaultLayouts.singleCoupon,
      };
    },
    resolveExternalRule({ productName = '', template = AppState.template, rawPrice = '' } = {}) {
      const rules = this.getRules(template);
      if (!rules || rules.enabled === false) return null;

      const useProductFirst = rules.productFirst === true || String(rules.resolvePriority || '').toLowerCase() === 'productfirst';
      const productRule = this.resolveProductRule(rules, productName, rawPrice);
      const templateRule = this.resolveTemplateRule(rules, template);

      if (useProductFirst && productRule?.layouts?.length) return productRule;
      if (templateRule?.layouts?.length) return templateRule;
      if (productRule?.layouts?.length) return productRule;

      return null;
    },
    resolveTemplateRule(rules, template = AppState.template) {
      const templateIds = [
        template?.templateId,
        template?.batchSourceName,
        template?.source?.psdName,
        AppState.templates?.[AppState.activeIndex]?.name,
        AppState.templates?.[AppState.activeIndex]?.file,
      ].filter(Boolean);

      for (const id of templateIds) {
        const direct = rules.templateLayouts?.[id];
        if (direct?.layouts?.length) return direct;

        const normalized = this.norm(id);
        const key = Object.keys(rules.templateLayouts || {}).find((candidate) => this.norm(candidate) === normalized);
        if (key && rules.templateLayouts[key]?.layouts?.length) return rules.templateLayouts[key];
      }

      return null;
    },
    resolveProductRule(rules, productName = '', rawPrice = '') {
      const productKey = this.norm(productName);
      const productRules = rules.productLayouts || {};
      const key = Object.keys(productRules).find((candidate) => this.norm(candidate) === productKey);
      const entry = key ? productRules[key] : null;
      if (!entry) return null;

      const matchedVariant = (entry.variants || []).find((variant) => this.priceMatches(rawPrice, variant));
      const useTemplate = matchedVariant?.useTemplate || entry.useTemplate;
      if (useTemplate && rules.templateLayouts?.[useTemplate]) return rules.templateLayouts[useTemplate];

      if (entry.layouts?.length) return entry;
      return null;
    },
    priceMatches(rawPrice = '', variant = {}) {
      const price = this.norm(rawPrice);
      const includes = Array.isArray(variant.priceIncludes) ? variant.priceIncludes : [variant.priceIncludes];
      return includes.filter(Boolean).some((keyword) => price.includes(this.norm(keyword)));
    },
    normalizeLayout(layout = {}, defaultLayout = {}) {
      const next = {
        ...defaultLayout,
        ...layout,
        fontSizePx: Number(layout.fontSizePx ?? layout.fontSize ?? defaultLayout.fontSizePx ?? 24),
      };

      if (Number.isFinite(Number(layout.x))) next.leftX = Number(layout.x);
      if (Number.isFinite(Number(layout.y))) next.topY = Number(layout.y);
      return next;
    },
    isEditedJsonAbsoluteLayout(layout = {}) {
      return layout?.lockToEditedJson === true
        || layout?.disableAnchorSync === true
        || layout?.positioningMode === 'absolute';
    },
    resolveLayoutForAnchor(layout = {}, anchorBox = null) {
      if (this.isEditedJsonAbsoluteLayout(layout)) {
        const fontSizePx = Number(layout.fontSizePx || layout.fontSize || 24);
        const lineHeightMultiplier = Number(layout.lineHeightMultiplier || this.lineHeightRatio);
        return {
          ...layout,
          positioningMode: 'absolute',
          centerX: round(Number(layout.centerX ?? (Number(layout.x ?? layout.leftX ?? 0) + Number(layout.width || this.textBoxWidth) / 2)), 2),
          centerY: round(Number(layout.centerY ?? (Number(layout.y ?? layout.topY ?? 0) + Number(layout.height || fontSizePx * lineHeightMultiplier) / 2)), 2),
          width: round(Number(layout.width || this.textBoxWidth), 2),
          height: round(Number(layout.height || layout.lineHeight || fontSizePx * lineHeightMultiplier), 2),
          fontSizePx: round(fontSizePx, 2),
          fontSizePt: round(Number(layout.fontSizePt || fontSizePx), 2),
          lineHeight: round(Number(layout.lineHeight || fontSizePx * lineHeightMultiplier), 2),
          lineHeightMultiplier,
          preserveExactSize: true,
          skipAutoScale: true,
          disableAnchorSync: layout.disableAnchorSync === true,
          lockToEditedJson: true,
          followProduct: true,
        };
      }

      if (layout.positioningMode !== 'product-image-ratio' || !anchorBox) return layout;

      const width = Number.isFinite(Number(layout.widthRatio))
        ? Number(anchorBox.width || 0) * Number(layout.widthRatio)
        : Number(layout.width || this.textBoxWidth);
      const height = Number.isFinite(Number(layout.heightRatio))
        ? Number(anchorBox.height || 0) * Number(layout.heightRatio)
        : Number(layout.height || layout.fontSizePx * this.lineHeightRatio);
      const fontSizePx = Number.isFinite(Number(layout.fontSizeRatio))
        ? Number(anchorBox.width || 0) * Number(layout.fontSizeRatio)
        : Number(layout.fontSizePx || 24);
      const centerX = Number(anchorBox.x || 0) + Number(anchorBox.width || 0) * Number(layout.anchorRatioX ?? 0.5);
      const centerY = Number(anchorBox.y || 0) + Number(anchorBox.height || 0) * Number(layout.anchorRatioY ?? 0.5);

      return {
        ...layout,
        centerX: round(centerX, 2),
        centerY: round(centerY, 2),
        width: round(width, 2),
        height: round(height, 2),
        fontSizePx: round(fontSizePx, 2),
        fontSizePt: round(fontSizePx, 2),
        lineHeightMultiplier: Number(layout.lineHeightMultiplier || this.lineHeightRatio),
        preserveExactSize: true,
        skipAutoScale: true,
      };
    },
  });

  // ── PriceCouponManager（8 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.PriceCouponManager, {
    layerPrefix: '__auto_price_v2_',
    apply(template, record) {
      this.remove(template);
      const rawPrice = String(record?.['價格'] || record?.['價格_左'] || '').trim();
      if (!template?.layers || !rawPrice) return [];

      const productName = String(record?.['商品圖1'] || '').trim();
      return this.applyForAnchor(template, {
        productName,
        rawPrice,
        anchorLayerKey: this.findAnchorLayerKey(template),
        keyPrefix: this.layerPrefix,
      });
    },
    applyForAnchor(template, { productName = '', rawPrice = '', anchorLayerKey = '', keyPrefix = this.layerPrefix } = {}) {
      if (!template?.layers || !rawPrice || !anchorLayerKey) return [];
      const rule = PriceRuleEngine.classify(productName, template, rawPrice);
      template.pricePresetMeta = {
        productName,
        rawPrice,
        layoutKey: rule.layoutKey,
        templateId: template.templateId || '',
        batchSourceName: template.batchSourceName || ''
      };

      const prices = PriceParser.parse(rawPrice, rule.isDoubleCoupon);
      if (!prices.length) return [];

      const anchorLayer = template.layers[anchorLayerKey] || null;
      const anchorBox = anchorLayer ? Geometry.getLayerBox(anchorLayerKey, anchorLayer) : null;
      if (!anchorBox) return [];

      const createdKeys = [];
      const layoutsBySlot = new Map((rule.layouts || []).map((layout) => [layout.slot, layout]));

      prices.forEach((price, index) => {
        const baseLayout = layoutsBySlot.get(price.slot) || rule.layouts[index] || rule.layouts[0];
        if (!baseLayout || !price.text) return;

        const isEditedJsonLocked = PriceRuleEngine.isEditedJsonAbsoluteLayout(baseLayout);
        if (!isEditedJsonLocked && !anchorBox) return;

        const layoutBase = PriceRuleEngine.resolveLayoutForAnchor({ ...baseLayout, layoutKey: rule.layoutKey }, anchorBox);
        // 拿掉 PriceFontResolver（依價格文字內容關鍵字縮放/覆寫座標，已確認全家族皆為死程式碼）。
        const layout = PriceLayoutResolver.fromLayout(layoutBase);
        const key = `${keyPrefix}${price.slot || index + 1}`;
        const color = PriceColorResolver.resolve(productName, template, layout.color);

        template.layers[key] = PriceLayerFactory.create({
          key,
          text: price.text,
          layout,
          color,
          anchorLayerKey,
          anchorBox,
          anchorRotation: Number(anchorLayer?.rotation || 0),
          productName,
          layoutKey: rule.layoutKey,
        });

        // 拿掉 PricePresetStore（localStorage 價格記憶）機制。
        // 價格 layer 的位置/大小 100% 由上面 PriceRuleEngine.resolveLayoutForAnchor()
        // 依 rules 檔案計算出的 layout 決定，不再套用瀏覽器裡舊的手動調整記錄。

        if (!isEditedJsonLocked) {
          PriceTransformEngine.syncPriceLayer(template, key, template.layers[key]);
        }

        this.insertAfterLayer(template, anchorLayerKey, key);
        createdKeys.push(key);
      });
      return createdKeys;
    },
    applyMallSkbnColumns(template, record = {}) {
      this.remove(template);
      if (!template?.layers) return [];

      const mallLayouts = {
        doubleCoupon: [
          { slot: 'bottom', psdName: '價格1（下券）', positioningMode: 'product-image-ratio', anchorRatioX: 0.5925, anchorRatioY: 0.6942, width: 122.3, height: 59.7, rotation: 2, fontSizePx: 51, lineHeight: 55.08, followProduct: true, skipAutoScale: true, preserveExactSize: true, disableContentScale: true },
          { slot: 'top', psdName: '價格2（上券）', positioningMode: 'product-image-ratio', anchorRatioX: 0.5788, anchorRatioY: 0.3041, width: 115.5, height: 56.3, rotation: -6, fontSizePx: 51, lineHeight: 55.08, followProduct: true, skipAutoScale: true, preserveExactSize: true, disableContentScale: true },
        ],
        singleCoupon: [
          { slot: 'single', psdName: '價格', positioningMode: 'product-image-ratio', anchorRatioX: 0.5, anchorRatioY: 0.5, width: 130, height: 60, rotation: 0, fontSizePx: 51, lineHeight: 55.08, followProduct: true, skipAutoScale: true, preserveExactSize: true, disableContentScale: true },
        ],
      };

      const originalDefaultLayouts = PriceRuleEngine.defaultLayouts;
      const withMallLayouts = Object.freeze({ ...PriceRuleEngine.defaultLayouts, ...mallLayouts });
      const columns = [
        { label: 'left', productField: '商品圖_左', priceField: '價格_左', anchorLayerKey: '商品圖_左' },
        { label: 'middle', productField: '商品圖_中', priceField: '價格_中', anchorLayerKey: '商品圖_中' },
        { label: 'right', productField: '商品圖_右', priceField: '價格_右', anchorLayerKey: '商品圖_右' },
      ];

      try {
        PriceRuleEngine.defaultLayouts = withMallLayouts;
        return columns.flatMap((column) => {
          const productName = String(record?.[column.productField] || '').trim();
          const rawPrice = String(record?.[column.priceField] || '').trim();
          if (!productName || !rawPrice || !template.layers[column.anchorLayerKey] || template.layers[column.anchorLayerKey].hidden) return [];
          return this.applyForAnchor(template, {
            productName,
            rawPrice,
            anchorLayerKey: column.anchorLayerKey,
            keyPrefix: `${this.layerPrefix}${column.label}_`,
          });
        });
      } finally {
        PriceRuleEngine.defaultLayouts = originalDefaultLayouts;
      }
    },
    rebuildFromPricePreset(template) {
      if (!template?.layers) return [];

      const family = PriceRuleEngine.getTemplateFamily(template);
      const templateLabel = PriceRuleEngine.norm([
        template?.ruleFamily,
        template?.sheetTemplateRoute?.family,
        template?.batchSourceName,
        template?.templateId,
        template?.source?.psdName,
      ].filter(Boolean).join(' '));
      const isMallSkbn = family === 'mall_skbn' || templateLabel.includes(PriceRuleEngine.norm('MALL SKBN'));

      // MALL SKBN uses three independent price slots.
      // Do not rebuild it through the legacy single-price apply() path,
      // otherwise __auto_price_v2_left/right_* will be removed and replaced by
      // one shared __auto_price_v2_top/bottom pair.
      if (isMallSkbn) {
        const record = template.batchRecord || {};
        const hasColumnPrice = ['價格_左', '價格_中', '價格_右']
          .some((field) => String(record?.[field] || '').trim());
        const hasColumnProduct = ['商品圖_左', '商品圖_中', '商品圖_右']
          .some((field) => String(record?.[field] || '').trim());

        if (hasColumnPrice && hasColumnProduct) {
          return this.applyMallSkbnColumns(template, record);
        }

        return [];
      }

      if (!template.pricePresetMeta) return [];
      const meta = template.pricePresetMeta || {};
      const rawPrice = String(meta.rawPrice || '').trim();
      if (!rawPrice) return [];

      const productName = String(meta.productName || '').trim();
      const createdKeys = this.apply(template, {
        '商品圖1': productName,
        '價格': rawPrice,
        '價格_左': rawPrice,
      });

      // 修正：重建價格只會呼叫通用引擎，不會經過 applyRecordToTemplate 的完整流程，
      // 導致像 game_bn / live_lobby_bn 這種「用自己的 afterApplyRecordToTemplate
      // 把價格座標校正成 EDITED_LAYOUT 固定值」的家族，每次畫面重繪（縮圖重新產生、
      // 圖片重新載入等）價格都會被打回通用引擎的預設座標，且再也不會被校正回來。
      // 這裡在重建完價格後，補呼叫一次該家族自己的 afterApplyRecordToTemplate，
      // 用 template.batchRecord（原始完整記錄）讓家族自訂的排版邏輯重新套用一次。
      if (window.BatchManager?.applyTemplateRuleHook) {
        window.BatchManager.applyTemplateRuleHook('afterApplyRecordToTemplate', template, template.batchRecord || {}, []);
      }

      return createdKeys;
    },
    remove(template) {
      if (!template?.layers) return;
      Object.keys(template.layers)
        .filter((key) => key.startsWith(this.layerPrefix) || template.layers[key]?.source === 'auto_price_v2' || template.layers[key]?.source === 'auto_price')
        .forEach((key) => delete template.layers[key]);
      template.renderOrder = (template.renderOrder || []).filter((key) => !key.startsWith(this.layerPrefix) && template.layers?.[key]?.source !== 'auto_price_v2' && template.layers?.[key]?.source !== 'auto_price');
    },
    insertAfterLayer(template, anchorKey, layerKey) {
      template.renderOrder = (template.renderOrder || []).filter((key) => key !== layerKey);
      const anchorIndex = anchorKey ? template.renderOrder.indexOf(anchorKey) : -1;
      template.renderOrder.splice(anchorIndex >= 0 ? anchorIndex + 1 : template.renderOrder.length, 0, layerKey);
    },
    findAnchorLayerKey(template) {
      const entries = Object.entries(template?.layers || {});
      const usableImages = entries.filter(([key, layer]) => {
        if (layer.type !== 'image' || layer.hidden) return false;
        const label = PriceRuleEngine.norm(`${key} ${layer.psdName || ''} ${layer.role || ''}`);
        const isBackground = label.includes('bg') || label.includes(PriceRuleEngine.norm('背景')) || label.includes('kvbg');
        const isCta = label.includes('cta') || label.includes(PriceRuleEngine.norm('按鈕')) || label.includes('button');
        const isLogo = label.includes('logo') || label.includes(PriceRuleEngine.norm('會員日'));
        return !isBackground && !isCta && !isLogo;
      });
      const rules = PriceRuleEngine.getRules(template);
      const preferredNames = Array.isArray(rules?.anchorLayerNames) ? rules.anchorLayerNames : ['商品圖1', 'P1', 'P', '曝品', 'product_1', 'product'];
      for (const name of preferredNames) {
        const n = PriceRuleEngine.norm(name);
        const matched = usableImages.find(([key, layer]) => {
          const label = PriceRuleEngine.norm(`${key} ${layer.psdName || ''} ${layer.role || ''} ${layer.assetFilename || ''}`);
          return label === n || label.includes(n) || PriceRuleEngine.norm(key) === n;
        });
        if (matched) return matched[0];
      }
      const product = usableImages.find(([key, layer]) => {
        const label = PriceRuleEngine.norm(`${key} ${layer.psdName || ''} ${layer.role || ''}`);
        return label.includes(PriceRuleEngine.norm('商品圖1')) || label.includes(PriceRuleEngine.norm('曝品')) || label.includes('product') || key === 'product' || label === 'p';
      });
      return product?.[0] || usableImages[0]?.[0] || '';
    },
  });

  // ── PriceColorResolver（4 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.PriceColorResolver, {
    rules: Object.freeze([
      { name: 'VIP', test: (raw, norm) => /vip/i.test(raw), color: '#FF770F' },
      { name: 'SCS', test: (raw, norm) => norm.includes('scs'), color: '#D0011B' },
      { name: '商城券', test: (raw, norm) => norm.includes(PriceRuleEngine.norm('商城券')), color: '#D0011B' },
      { name: '全站券', test: (raw, norm) => norm.includes(PriceRuleEngine.norm('全站券')), color: '#EE4D2D' },
      { name: '全站', test: (raw, norm) => norm.includes(PriceRuleEngine.norm('全站')), color: '#EE4D2D' },
    ]),

    buildRuleTester(rule = {}) {
      if (!rule) return null;
      if (rule.regex) {
        try {
          const re = new RegExp(rule.regex, rule.flags || '');
          return (raw) => re.test(raw);
        } catch (error) {
          console.warn('[PriceColorResolver] colorRules regex 無效，已略過:', rule, error);
        }
      }
      if (rule.keyword) {
        const wanted = PriceRuleEngine.norm(rule.keyword);
        return (_, normalized) => !!wanted && normalized.includes(wanted);
      }
      if (Array.isArray(rule.allKeywords) && rule.allKeywords.length) {
        const wanted = rule.allKeywords.map((word) => PriceRuleEngine.norm(word)).filter(Boolean);
        return (_, normalized) => wanted.every((word) => normalized.includes(word));
      }
      return null;
    },
    buildRuleTester(rule = {}) {
      if (!rule) return null;
      if (rule.regex) {
        try {
          const re = new RegExp(rule.regex, rule.flags || '');
          return (raw) => re.test(raw);
        } catch (error) {
          console.warn('[PriceColorResolver] colorRules regex 無效，已略過:', rule, error);
        }
      }
      if (rule.keyword) {
        const wanted = PriceRuleEngine.norm(rule.keyword);
        return (_, normalized) => !!wanted && normalized.includes(wanted);
      }
      if (Array.isArray(rule.allKeywords) && rule.allKeywords.length) {
        const wanted = rule.allKeywords.map((word) => PriceRuleEngine.norm(word)).filter(Boolean);
        return (_, normalized) => wanted.every((word) => normalized.includes(word));
      }
      return null;
    },
    getExternalRules(template = AppState.template) {
      const rules = PriceRuleEngine.getRules(template);
      return Array.isArray(rules?.colorRules) ? rules.colorRules : [];
    },
    resolve(productName, template = AppState.template, fallbackColor = '') {
      const raw = String(productName || '');
      const normalized = PriceRuleEngine.norm(raw);
      const externalMatched = this.getExternalRules(template).find((rule) => {
        const test = this.buildRuleTester(rule);
        return test?.(raw, normalized);
      });
      if (externalMatched?.color) return externalMatched.color;

      const matched = this.rules.find((rule) => rule.test(raw, normalized));
      return matched?.color || fallbackColor || PriceRuleEngine.defaultColor;
    },
  });

  // ── PriceLayerFactory（2 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.PriceLayerFactory, {
    create({ key, text, layout, color, anchorLayerKey, anchorBox, anchorRotation, productName, layoutKey }) {
      const lineHeight = layout.lineHeight || layout.fontSizePx * 1.08;
      const width = Number(layout.width || 260);
      const height = Number(layout.height || lineHeight);
      return {
        type: 'text',
        source: 'auto_price_v2',
        psdName: layout.psdName || '價格',
        text,
        x: round(layout.centerX - width / 2, 2),
        y: round(layout.centerY - height / 2, 2),
        width: round(width, 2),
        height: round(height, 2),
        centerX: layout.centerX,
        centerY: layout.centerY,
        rotation: layout.rotation || 0,
        fontSizePx: layout.fontSizePx,
        fontSizePt: layout.fontSizePx,
        lineHeight,
        letterSpacing: layout.letterSpacing || 0,
        fontFamily: 'ShopeeNotoSans Content',
        fontWeight: '700',
        align: 'center',
        color,
        hidden: false,
        locked: false,
        priceSlot: layout.slot || 'single',
        priceProductName: productName || '',
        priceLayoutKey: layoutKey || layout.layoutKey || '',
        lineHeightMultiplier: Number(layout.lineHeightMultiplier || 1.08),
        positioningMode: layout.positioningMode || '',
        disableAnchorSync: layout.followProduct === true ? false : !!layout.disableAnchorSync,
        lockToEditedJson: !!layout.lockToEditedJson,
        // 價格大小控制旗標需從 rules/*.js 帶進實際圖層，
        // 後續商品圖縮放連動時才不會覆蓋 ddcard.rules.js 的 width / height / fontSizePx。
        preserveExactSize: !!layout.preserveExactSize,
        skipAutoScale: !!layout.skipAutoScale,
        disableContentScale: !!layout.disableContentScale,
        followProduct: layout.followProduct !== false,
        anchor: (layout.followProduct === true || !layout.disableAnchorSync)
          ? this.createAnchor(layout, anchorLayerKey, anchorBox, anchorRotation)
          : null,
        layerKey: key,
      };
    },
    createAnchor(layout, anchorLayerKey, anchorBox, anchorRotation = 0) {
      const baseCenter = {
        x: (anchorBox?.x || 0) + (anchorBox?.width || 0) / 2,
        y: (anchorBox?.y || 0) + (anchorBox?.height || 0) / 2,
      };
      // 如果 layout 已有 offsetX/offsetY（來自 rules），直接使用，不從座標反推
      const offsetX = Number.isFinite(layout.offsetX) ? layout.offsetX : layout.centerX - baseCenter.x;
      const offsetY = Number.isFinite(layout.offsetY) ? layout.offsetY : layout.centerY - baseCenter.y;
      const rotationOffset = Number.isFinite(layout.rotationOffset)
        ? layout.rotationOffset
        : (layout.rotation || 0) - Number(anchorRotation || 0);
      const baseFontSizePx = Number.isFinite(layout.baseFontSizePx) ? layout.baseFontSizePx : layout.fontSizePx;
      const baseWidth = Number.isFinite(layout.baseWidth) ? layout.baseWidth : (layout.width || 260);
      const baseHeight = Number.isFinite(layout.baseHeight) ? layout.baseHeight : (layout.height || layout.fontSizePx * 1.08);
      return {
        layerKey: anchorLayerKey,
        baseBox: clone(anchorBox || { x: 0, y: 0, width: 1, height: 1 }),
        baseRotation: Number(anchorRotation || 0),
        offsetX,
        offsetY,
        rotationOffset,
        baseFontSizePx,
        baseWidth,
        baseHeight,
      };
    },
  });

  // ── PriceTransformEngine（7 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.PriceTransformEngine, {
    canFollowProduct(layer) {
      return !!(
        layer?.source === 'auto_price_v2' &&
        layer.followProduct !== false &&
        layer.anchor?.layerKey
      );
    },
    syncTemplate(template) {
      if (!template?.layers) return;
      Object.entries(template.layers)
        .filter(([, layer]) => this.canFollowProduct(layer) && layer._anchorDirty)
        .forEach(([key, layer]) => {
          this.syncPriceLayer(template, key, layer);
          layer._anchorDirty = false;
        });
    },
    syncPriceLayer(template, key, layer, options = {}) {
      if (AppState.editingLayerKey === key || !this.canFollowProduct(layer)) return;
      const anchorLayer = template.layers?.[layer.anchor.layerKey];
      if (!anchorLayer) return;
      const currentBox = Geometry.getLayerBox(layer.anchor.layerKey, anchorLayer);
      const baseBox = layer.anchor.baseBox || currentBox;
      const currentCenter = { x: currentBox.x + currentBox.width / 2, y: currentBox.y + currentBox.height / 2 };
      const scaleContent = options.scaleContent !== false
        && layer.disableContentScale !== true
        && layer.skipAutoScale !== true
        && layer.lockToEditedJson !== true
        && layer.preserveExactSize !== true;
      const scaleX = scaleContent && baseBox.width ? currentBox.width / baseBox.width : 1;
      const scaleY = scaleContent && baseBox.height ? currentBox.height / baseBox.height : 1;
      const scale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2 || 1;
      const rotationDelta = Number(anchorLayer.rotation || 0) - Number(layer.anchor.baseRotation || 0);
      const rotatedOffset = this.rotatePoint({
        x: (layer.anchor.offsetX || 0) * scaleX,
        y: (layer.anchor.offsetY || 0) * scaleY,
      }, rotationDelta);

      if (scaleContent) {
        const fontSize = Math.max(6, (layer.anchor.baseFontSizePx || layer.fontSizePx || 24) * scale);
        const width = Math.max(1, (layer.anchor.baseWidth || layer.width || 1) * scaleX);
        const height = Math.max(1, (layer.anchor.baseHeight || layer.height || fontSize * 1.08) * scaleY);
        layer.fontSizePx = round(fontSize, 2);
        layer.fontSizePt = layer.fontSizePx;
        layer.lineHeight = round(fontSize * (layer.lineHeightMultiplier || 1.08), 2);
        layer.width = round(width, 2);
        layer.height = round(Math.max(height, layer.lineHeight), 2);
      }

      layer.centerX = round(currentCenter.x + rotatedOffset.x, 2);
      layer.centerY = round(currentCenter.y + rotatedOffset.y, 2);
      layer.x = round(layer.centerX - layer.width / 2, 2);
      layer.y = round(layer.centerY - layer.height / 2, 2);
      layer.rotation = round(Number(anchorLayer.rotation || 0) + Number(layer.anchor.rotationOffset || 0), 2);
    },
    boxesSameSize(a = {}, b = {}) {
      return Math.abs(Number(a.width || 0) - Number(b.width || 0)) < 0.01
        && Math.abs(Number(a.height || 0) - Number(b.height || 0)) < 0.01;
    },
    handleLayerBoxApplied(key, layer, previousBox = null) {
      const template = AppState.template;
      if (!template?.layers || !key || !layer) return;
      if (layer.source === 'auto_price_v2') {
        this.captureManualPriceTransform(key, layer, template);
        return;
      }

      const currentBox = Geometry.getLayerBox(key, layer);
      const movedOnly = previousBox && this.boxesSameSize(previousBox, currentBox);
      const dx = movedOnly ? Number(currentBox.x || 0) - Number(previousBox.x || 0) : 0;
      const dy = movedOnly ? Number(currentBox.y || 0) - Number(previousBox.y || 0) : 0;

      Object.entries(template.layers)
        .filter(([, child]) => this.canFollowProduct(child) && child.anchor?.layerKey === key)
        .forEach(([childKey, child]) => {
          if (movedOnly) {
            child.x = round(Number(child.x || 0) + dx, 2);
            child.y = round(Number(child.y || 0) + dy, 2);
            child.centerX = round(Number(child.centerX ?? (child.x + child.width / 2)), 2);
            child.centerY = round(Number(child.centerY ?? (child.y + child.height / 2)), 2);
            child.anchor.baseBox = clone(currentBox);
            return;
          }
          child._anchorDirty = true;
          this.syncPriceLayer(template, childKey, child, { scaleContent: true });
          child._anchorDirty = false;
        });
    },
    captureManualPriceTransform(key, layer, template = AppState.template) {
      if (!this.canFollowProduct(layer) || !template?.layers) return;
      const anchorLayer = template.layers[layer.anchor.layerKey];
      if (!anchorLayer) return;
      const currentBox = Geometry.getLayerBox(layer.anchor.layerKey, anchorLayer);
      const baseBox = layer.anchor.baseBox || currentBox;
      const currentCenter = { x: currentBox.x + currentBox.width / 2, y: currentBox.y + currentBox.height / 2 };
      const layerCenter = { x: (layer.x || 0) + (layer.width || 0) / 2, y: (layer.y || 0) + (layer.height || 0) / 2 };
      const scaleX = baseBox.width ? currentBox.width / baseBox.width : 1;
      const scaleY = baseBox.height ? currentBox.height / baseBox.height : 1;
      const scale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2 || 1;
      const rotationDelta = Number(anchorLayer.rotation || 0) - Number(layer.anchor.baseRotation || 0);
      const unrotated = this.rotatePoint({ x: layerCenter.x - currentCenter.x, y: layerCenter.y - currentCenter.y }, -rotationDelta);
      layer.centerX = round(layerCenter.x, 2);
      layer.centerY = round(layerCenter.y, 2);
      layer.anchor.offsetX = round(unrotated.x / (scaleX || 1), 2);
      layer.anchor.offsetY = round(unrotated.y / (scaleY || 1), 2);
      layer.anchor.rotationOffset = round(Number(layer.rotation || 0) - Number(anchorLayer.rotation || 0), 2);
      layer.anchor.baseFontSizePx = round((layer.fontSizePx || 24) / scale, 2);
      layer.anchor.baseWidth = round((layer.width || 1) / (scaleX || 1), 2);
      layer.anchor.baseHeight = round((layer.height || 1) / (scaleY || 1), 2);
      // 拿掉 PricePresetStore（localStorage 價格記憶）機制：手動調整只保留在
      // 當下這個 template 物件（記憶體）裡，確保價格最終結果只由 rules 決定。
    },
    rotatePoint(point, degrees) {
      const rad = Number(degrees || 0) * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
    },
  });

  // ── Geometry（4 個成員，原文自 正式BN/18節_正式BN_Tool_V7.4/core/app.core.js）──
  Object.assign(window.Geometry, {
    isImageReady(key, layer) {
      const img = AppState.images?.[key];
      if (!img) return false;
      if (layer?.keepAspectRatio) return Number(img.naturalWidth) > 0 && Number(img.naturalHeight) > 0;
      return true;
    },
    getRenderedImageBox(key, layer) {
      const img = AppState.images[key];
      if (window.ProductEngine?.getRenderedImageBox) {
        return window.ProductEngine.getRenderedImageBox(layer, img);
      }

      // Fallback kept for environments that load app.core.js without ProductEngine.
      const cx = Number.isFinite(layer.centerX) ? layer.centerX : (layer.x || 0) + (layer.width || 0) / 2;
      const cy = Number.isFinite(layer.centerY) ? layer.centerY : (layer.y || 0) + (layer.height || 0) / 2;
      const width = layer.width || layer.targetWidth || 0;
      const height = layer.height || 0;
      return { x: cx - width / 2, y: cy - height / 2, width, height, centerX: cx, centerY: cy };
    },
    getLayerBox(key, layer) {
      if (!layer) return { x: 0, y: 0, width: 0, height: 0 };
      return layer.type === 'image' ? this.getRenderedImageBox(key, layer) : { x: layer.x || 0, y: layer.y || 0, width: layer.width || 0, height: layer.height || 0 };
    },
    applyBox(key, layer, box) {
      const previousBox = clone(this.getLayerBox(key, layer));
      layer.x = round(box.x);
      layer.y = round(box.y);
      layer.width = round(Math.max(1, box.width));
      layer.height = round(Math.max(1, box.height));
      if (layer.type === 'image') {
        layer.centerX = round(layer.x + layer.width / 2);
        layer.centerY = round(layer.y + layer.height / 2);
        if (layer.keepAspectRatio) {
          layer.targetWidth = round(layer.width);
          const normalizedSizingMode = String(layer.sizingMode || '').replace(/[\s_-]+/g, '').toLowerCase();
          const isContainByPBox = normalizedSizingMode === 'containbypbox';
          const isHeightBased = normalizedSizingMode === 'heightbased';
          const isHeightPriorityNoWidthLimit = layer.productImageSizingRule === 'ddcardHeightPriorityNoWidthLimit';

          // DDcard 的「高度優先、不限寬」只用於初始載入商品圖。
          // 使用者用滑鼠滾輪、控制點或 Inspector 手動縮放後，必須同步更新高度基準，
          // 否則 heightBased 會用舊的 targetHeight / maxTargetHeight 把 P 圖層拉回原尺寸。
          if (isContainByPBox || isHeightBased || isHeightPriorityNoWidthLimit) {
            layer.targetHeight = round(layer.height);
            layer.maxTargetHeight = round(layer.height);
          }
        }
      }
      window.LayoutRuleEngine?.handleLayerBoxApplied?.(key, layer, previousBox, AppState.template);
      window.PriceTransformEngine?.handleLayerBoxApplied?.(key, layer, previousBox);
    },
  });

  // 18節 的 Renderer.renderSceneTo(ctx) 只畫 AppState.template；整合核心的縮圖刷新（makeThumbURLFor）會傳
  // (ctx, template, images) 畫「非使用中」的版位。這裡包一層：有指定 template 就暫時切換 AppState 再呼叫原文，畫完還原。
  const legacyRenderSceneTo = window.Renderer.renderSceneTo;
  window.Renderer.renderSceneTo = function renderSceneToForTemplate(canvasCtx, template, images) {
    if (!template || template === AppState.template) return legacyRenderSceneTo.call(this, canvasCtx);
    const previous = { template: AppState.template, images: AppState.images };
    AppState.template = template;
    if (images) AppState.images = images;
    try { return legacyRenderSceneTo.call(this, canvasCtx); }
    finally { AppState.template = previous.template; AppState.images = previous.images; }
  };
})();
