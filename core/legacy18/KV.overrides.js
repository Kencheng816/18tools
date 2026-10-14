/* 18節 KV — A 系函式級覆寫（自動抽取，請勿手改；重跑 tests/tools/extract-legacy18.js）
 *
 * 來源：KV/18節_KV_V1.2/core/app.core.js
 * 載入時機：profile.coreScripts 排在 core/app.core.js 之後。對 B 系物件做 Object.assign，被蓋掉的 25節 版本仍在 core 內供其他 profile 使用。
 * 這裡的方法原文一字未改；它們以 this.* 互相呼叫，少數全域（AppState、Geometry、Renderer、TemplateLoader、LayoutRuleEngine、CapsuleRuleEngine、LoadingOverlay、TemplateFilter、HistoryManager、SpecOverlayManager、App、LayerManager、Inspector、TextEditor、decodeHashUnicode、scheduleBlobRevoke、PreviewZoom、ProductEngine、ShapeRenderer、TemplateRuleRegistry、TemplateRuleManager、XLSX）由下方 const 取自 window。
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
  // DEFAULT_TEMPLATE（空白畫布保底）依決策 D9 不搬：KV 的 ensureTemplatePool 不再補 DDcard，找不到公版就進 unmatched。
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

  // KV 版配路由（18節 KV core 檔頭原文；rules/KV/template-routing.js 已先載入 window.TemplateRoutingConfig）
  const KV_SHEET_ROUTES = Object.freeze(window.TemplateRoutingConfig?.kvSheetRoutes || []);


  // ── BatchManager（30 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
  Object.assign(window.BatchManager, {
    fields: ['主標', '副標', '警語', '商品圖1', '商品圖2', '商品圖_左', '商品圖_中', '商品圖_右', 'CTA', '價格', '價格_左', '價格_中', '價格_右', '文案_左', '文案_中', '文案_右', '票券', '票券案型', '版位'],
    async generateFromSelectedSheet() {
      if (!AppState.excelWorkbook) return alert('請先讀取 Excel 檔。');
      if (DOM.batchStatus) DOM.batchStatus.textContent = '正在解析 Excel 並產生批次圖檔...';
      const sheetName = DOM.excelSheetSelect?.value || AppState.excelWorkbook.SheetNames[0];
      const sheet = AppState.excelWorkbook.Sheets[sheetName];
      if (!sheet) return alert('找不到指定分頁。');

      if (!AppState.sourceTemplates) AppState.sourceTemplates = this.ensureTemplatePool(AppState.templates);
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: true });
      const parseResult = this.parseRows(rows);
      const parsedBlocks = parseResult.blocks || [];
      const diagnostics = {
        sheetName,
        anchorCount: parseResult.anchorCount || 0,
        parsedBlockCount: parsedBlocks.length,
        recordCount: parsedBlocks.reduce((sum, block) => sum + (block.records?.length || 0), 0),
        sourceTemplateNames: (AppState.sourceTemplates || AppState.templates || []).map((t) => t.name || t.data?.templateId || t.file || '未命名公版'),
        warnings: parseResult.warnings || [],
        skippedRows: parseResult.skippedRows || [],
      };
      AppState.batchDiagnostics = diagnostics;

      if (!parsedBlocks.length) {
        AppState.batchItems = [];
        AppState.unmatchedBatchItems = [{ name: sheetName, reason: diagnostics.anchorCount ? '有找到「製作內容」，但沒有找到同列欄位或有效資料列' : '找不到「製作內容」' }];
        this.renderBatchUI();
        alert('沒有產生任何圖片：找不到「製作內容」、欄位列，或欄位下方沒有有效資料。');
        return;
      }

      const generated = [];
      const unmatched = [];
      const emptyBlocks = [];
      let sourceTemplates = AppState.sourceTemplates?.length ? AppState.sourceTemplates : AppState.templates;
      const counters = new Map();

      for (const block of parsedBlocks) {
        let generatedInBlock = 0;
        for (const record of block.records) {
          const hasAnyContent = block.kvRoute || this.fields.some((field) => String(record[field] || '').trim());
          if (!hasAnyContent) continue;

          const recordRoute = this.resolveRecordTemplateRoute(block, record);
          if (recordRoute) {
            const routeTemplate = await this.ensureTemplateForRoute(recordRoute, sourceTemplates);
            if (routeTemplate && !sourceTemplates.some((item) => this.norm(item?.data?.templateId || item?.name || item?.file) === this.norm(routeTemplate?.data?.templateId || routeTemplate?.name || routeTemplate?.file))) {
              sourceTemplates = [routeTemplate, ...sourceTemplates];
            }
          }

          const matchInfo = recordRoute
            ? this.findTemplateForRoute(recordRoute, sourceTemplates)
            : this.findTemplateForName(block.name, sourceTemplates);
          if (!matchInfo?.template) {
            unmatched.push({ name: block.name, reason: matchInfo?.reason || '找不到對應公版關鍵字' });
            continue;
          }

          const templateName = matchInfo.template.name || matchInfo.template.data?.templateId || 'Template';
          const baseName = recordRoute?.outputPrefix || this.makeOutputPrefix(block.name, templateName);
          const variantRecords = this.expandRecordVariantsForTemplate(matchInfo.template.data, record);

          for (const variantRecord of variantRecords) {
            const seq = (counters.get(baseName) || 0) + 1;
            counters.set(baseName, seq);
            const suffix = this.normalizeOutputSuffix(variantRecord.__outputSuffix || variantRecord._outputSuffix || '');
            const outputName = `${baseName}_${String(seq).padStart(2, '0')}${suffix ? `_${suffix}` : ''}`;
            const data = clone(matchInfo.template.data);
            data.templateId = outputName;
            data.batchSourceName = block.name;
            if (recordRoute) {
              data.ruleFamily = recordRoute.family || recordRoute.key;
              data.sheetTemplateRoute = { key: recordRoute.key, family: recordRoute.family || recordRoute.key, label: recordRoute.label, sourceTemplateId: recordRoute.templateId, ruleFile: recordRoute.ruleFile };
            }
            this.applyRecordToTemplate(data, variantRecord);
            generated.push({ name: outputName, file: `${outputName}.generated`, visible: true, data, batchRecord: variantRecord });
            generatedInBlock += 1;
          }
        }
        if (!generatedInBlock) emptyBlocks.push({ name: block.name, reason: '指定欄位都是空白' });
      }

      AppState.unmatchedBatchItems = [...unmatched, ...emptyBlocks];
      AppState.batchItems = generated;
      AppState.batchGroupsOpen = {};
      AppState.batchDiagnostics = { ...diagnostics, generatedCount: generated.length, unmatchedCount: unmatched.length, emptyBlockCount: emptyBlocks.length, skippedRows: parseResult.skippedRows || [] };
      if (!generated.length) {
        this.renderBatchUI();
        const reasons = [
          unmatched.length ? `找不到公版 ${unmatched.length} 筆` : '',
          emptyBlocks.length ? `欄位空白 ${emptyBlocks.length} 筆` : '',
          !unmatched.length && !emptyBlocks.length ? '沒有有效資料列' : '',
        ].filter(Boolean).join('；');
        alert(`沒有產生任何圖片：${reasons}。請查看左側「未匹配 / 診斷」清單。`);
        return;
      }

      AppState.templates = generated;
      AppState.activeIndex = 0;
      AppState.template = AppState.templates[0].data;
      AppState.selectedLayers = [];
      AppState.batchMode = true;

      // 批次產圖後先顯示浮動進度，不再先顯示缺圖的預覽。
      this.renderBatchUI();
      this.renderPreviewPlaceholders();
      LoadingOverlay.show('正在載入第 1 張素材...', 0);

      try {
        await this.renderPreviewGrid({ showProgress: true, revealWhenDone: true });
      } catch (error) {
        console.warn('[Batch Preview] 產生縮圖失敗:', error);
      } finally {
        LoadingOverlay.hide();
      }

      App.sync();
      this.renderBatchUI();
    },
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
          if (hasCoreFields) candidates.push({ headerRow: r, anchorCol, colMap });
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

      // KV 版配路由：獨立於「製作內容」表格解析之外的表單式掃描（見 findKvFormBlocks）。
      const kvBlocks = this.findKvFormBlocks(rows, warnings);
      if (kvBlocks.length) blocks.push(...kvBlocks);

      return { blocks, anchorCount, warnings, skippedRows };
    },
    resolveRecordTemplateRoute(block = {}, record = {}) {
      if (block.kvRoute) {
        return { ...block.kvRoute };
      }

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

      return null;
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
      if (!route?.templateId) return { template: null, reason: route?.missingReason || '路由缺少 templateId' };

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
        const labels = this.getTemplateMatchRules().map((item) => item.label).filter(Boolean).join(' / ') || '（尚未註冊任何公版規則）';
        return { template: null, reason: `製作物名稱沒有讀到已設定的公版關鍵字（${labels}）` };
      }

      const found = (templates || []).find((template) => {
        const label = this.norm(`${template.name || ''} ${template.data?.templateId || ''} ${template.file || ''}`);
        return rule.targets.some((target) => label.includes(this.norm(target)));
      });
      if (!found) {
        const loaded = (templates || []).map((t) => t.name || t.data?.templateId || t.file || '未命名公版').join('、') || '無';
        return { template: null, reason: `讀到 ${rule.label} 關鍵字，但目前沒有載入 ${rule.label} 公版。已載入：${loaded}` };
      }
      return { template: found, reason: '' };
    },
    makeOutputPrefix(blockName, templateName) {
      return String(templateName || blockName || 'IMG').replace(/\.template\.json$/i, '').replace(/[^a-z0-9一-龥]+/ig, '_').replace(/^_+|_+$/g, '') || 'IMG';
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
          measureTextHeight: (layer) => CapsuleRuleEngine.measureTextHeight(layer, ctx),
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
    applyRecordToTemplate(template, record) {
      const diagnostics = [];
      template.batchRecord = { ...(record || {}) };
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

      this.applyTemplateRuleHook('afterApplyRecordToTemplate', template, record, diagnostics);
      LayoutRuleEngine.apply(template);

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
    async stabilizeTemplateBeforePreview(template) {
      if (!template?.layers) return;

      // 先讓已 decode 的圖片進入瀏覽器繪製週期，避免第一次縮圖使用到尚未穩定的 naturalWidth / naturalHeight。
      await this.waitForPreviewFrame();

      LayoutRuleEngine.apply(template);

      await this.waitForPreviewFrame();

      // LayoutRuleEngine 可能會改動排版尺寸；最後再同步一次，確保縮圖與主畫布一致。
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
    matchKvRouteTitle(text, route) {
      const normalized = String(text ?? '').trim();
      if (!normalized) return false;
      const match = route?.titleMatch || {};
      if (match.exact !== undefined) return normalized === match.exact;
      if (match.startsWith !== undefined) {
        if (!normalized.startsWith(match.startsWith)) return false;
        return match.includes === undefined || normalized.includes(match.includes);
      }
      return false;
    },
    findKvContentCellBelow(rows, startRow, col, maxRowsDown = 20) {
      for (let r = startRow + 1; r <= startRow + maxRowsDown && r < rows.length; r += 1) {
        const raw = rows[r]?.[col];
        const normalized = this.normalizeRecordText(raw);
        if (normalized.includes('\n')) return { row: r, text: normalized };
      }
      return null;
    },
    findKvKeywordList(rows, keywords = []) {
      if (!keywords.length) return [];
      const hits = [];
      for (let r = 0; r < rows.length; r += 1) {
        const row = rows[r] || [];
        for (let c = 0; c < row.length; c += 1) {
          const cellText = String(row[c] ?? '').trim();
          if (cellText && keywords.includes(cellText)) hits.push({ row: r, col: c, value: cellText });
        }
      }
      hits.sort((a, b) => (a.row - b.row) || (a.col - b.col));
      return hits.map((hit) => hit.value);
    },
    findKvFormBlocks(rows, warnings = []) {
      const routes = KV_SHEET_ROUTES;
      if (!routes.length) return [];
      const blocks = [];

      for (let r = 0; r < rows.length; r += 1) {
        const row = rows[r] || [];
        for (let c = 0; c < row.length; c += 1) {
          const cellText = String(row[c] ?? '').trim();
          if (!cellText) continue;
          // 一個標題格可能同時對應多個公版（例如「正式日 L1 KV 版配」一次對到 3 個公版）。
          const matchedRoutes = routes.filter((item) => this.matchKvRouteTitle(cellText, item));
          if (!matchedRoutes.length) continue;

          for (const route of matchedRoutes) {
            if (route.noSubtitle) {
              // 這類公版不需要從工單讀取任何文字，素材檔名已經寫死在公版 JSON 裡，
              // 只要工單上偵測到這個標題，就直接把公版加進批次輸出。
              blocks.push({
                name: route.label,
                headerRow: r,
                startRow: r,
                quantity: 1,
                colMap: {},
                records: [{ __sourceRow: r + 1 }],
                templateType: 'kv_route',
                kvRoute: route,
              });
              continue;
            }

            const content = this.findKvContentCellBelow(rows, r, c);
            if (!content) {
              warnings.push(`第 ${r + 1} 列「${cellText}」找不到換行資料格，無法取得副標題（KV 版配：${route.label}）`);
              continue;
            }

            const lines = content.text.split('\n').map((line) => line.trim()).filter(Boolean);
            const subtitleText = lines[lines.length - 1] || '';
            if (!subtitleText) {
              warnings.push(`第 ${content.row + 1} 列換行資料格沒有可用文字（KV 版配：${route.label}）`);
              continue;
            }

            blocks.push({
              name: route.label,
              headerRow: r,
              startRow: r,
              quantity: 1,
              colMap: {},
              records: [{
                '副標': subtitleText,
                __sourceRow: content.row + 1,
                ...(route.bankLogoList ? { '銀行清單': this.findKvKeywordList(rows, route.bankLogoList) } : {}),
              }],
              templateType: 'kv_route',
              kvRoute: route,
            });
          }
        }
      }

      return blocks;
    },
    ensureTemplatePool(templates = []) {
      return (templates || []).map((t) => ({ ...t, data: clone(t.data) }));
    },
    getTemplateMatchRules() {
      const registeredRules = (window.TemplateRuleManager || window.TemplateRuleRegistry)?.getMatchRules?.();
      if (registeredRules?.length) return registeredRules;

      // Fallback only for environments that load app.core.js without the registry.
      return [
        { family: 'kv_warmup_guide', label: '暖身_攻略頁', tokens: ['暖身_攻略頁', '暖身l1kv版配'], targets: ['暖身_攻略頁'] },
        { family: 'kv_warmup_bank', label: '暖身_銀行版', tokens: ['暖身_銀行版', '暖身l1kv版配銀行版'], targets: ['暖身_銀行版'] },
      ];
    },
    getBatchGroupTitle(item) {
      const raw = String(item?.data?.batchSourceName || item?.batchRecord?.__sourceName || item?.name || '').trim();
      const normalized = raw.replace(/[_\-]+\d+$/i, '').replace(/\s+/g, ' ').trim();
      return normalized || '未分類';
    },
  });

  // ── TemplateLoader（5 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
  Object.assign(window.TemplateLoader, {
    async loadImagesForActiveTemplate() {
      const seq = ++AppState.imageLoadSeq;
      const images = await this.loadImagesForTemplate(AppState.template);
      // 防止批次縮圖背景載入時覆蓋目前畫布的圖片快取。
      if (seq === AppState.imageLoadSeq) {
        AppState.images = images;
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

          // 1) 使用者手動載入素材資料夾：最穩，使用 blob URL，不會污染 Canvas。
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
      this.setStatus(`已從資料夾載入 ${AppState.templates.length} 個公版`);
      await this.loadImagesForActiveTemplate();
      window.SpecOverlayManager?.refresh?.();
      App.sync();
    },
  });

  // ── Renderer（15 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
  Object.assign(window.Renderer, {
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

  // ── CapsuleRuleEngine（3 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
  Object.assign(window.CapsuleRuleEngine, {
    getTemplateFamily(template = AppState.template) {
      const explicitFamily = template?.ruleFamily || template?.sheetTemplateRoute?.family;
      if (explicitFamily) return explicitFamily;

      // template 自己的 templateId / batchSourceName / source.psdName 用來讓
      // TemplateRuleRegistry 依照各規則檔註冊的 tokens/targets 辨識家族。
      const labelParts = [
        template?.templateId,
        template?.batchSourceName,
        template?.source?.psdName,
      ].filter(Boolean);

      const registeredFamily = (window.TemplateRuleManager || window.TemplateRuleRegistry)?.detectFamily?.(labelParts, null);
      if (registeredFamily) return registeredFamily;

      // 沒有任何規則檔認得這個 template：回傳 null，getRuleSection 會安全地
      // 回傳空物件 {}，不會套用到錯誤家族的規則。
      return null;
    },
    measureTextWidth(layer, measureContext) {
      if (!layer || !measureContext) return 0;
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
    measureTextHeight(layer, measureContext) {
      if (!layer || !measureContext) return 0;
      measureContext.save();
      measureContext.font = Renderer.font(layer);
      const fontSizePx = Number(layer.fontSizePx || 24);
      const lineHeightPx = Number(layer.lineHeight || fontSizePx * 1.2);
      const lines = String(layer.text || '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      let height = 0;
      lines.forEach((line, index) => {
        const metrics = measureContext.measureText(line || ' ');
        const ascent = Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : fontSizePx * 0.8;
        const descent = Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : fontSizePx * 0.2;
        height += index === 0 ? (ascent + descent) : lineHeightPx;
      });
      measureContext.restore();
      return Math.ceil(Math.max(1, height));
    },
  });

  // ── LayoutRuleEngine（11 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
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
    },
    applyProgrammaticCapsule({ template, bgKey, centerX, centerY, width, fill }) {
      const bg = this.ensureLayer(template, bgKey, {
        type: 'shape',
        psdName: bgKey,
        source: 'generated_programmatic_capsule',
      });
      const height = 58;
      const radius = height / 2;

      bg.type = 'shape';
      bg.psdName = bg.psdName || bgKey;
      bg.source = 'generated_programmatic_capsule';
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
  });

  // ── Geometry（5 個成員，原文自 KV/18節_KV_V1.2/core/app.core.js）──
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
      const constrainKey = layer.constrainToLayerKey;
      const bounds = constrainKey ? this.getLayerBox(constrainKey, AppState.template?.layers?.[constrainKey]) : null;
      const nextBox = bounds ? this.clampBoxToBounds(box, bounds) : box;

      layer.x = round(nextBox.x);
      layer.y = round(nextBox.y);
      layer.width = round(Math.max(1, nextBox.width));
      layer.height = round(Math.max(1, nextBox.height));
      if (layer.type === 'image') {
        layer.centerX = round(layer.x + layer.width / 2);
        layer.centerY = round(layer.y + layer.height / 2);
        if (layer.keepAspectRatio) {
          layer.targetWidth = round(layer.width);
          const normalizedSizingMode = String(layer.sizingMode || '').replace(/[\s_-]+/g, '').toLowerCase();
          const isContainByPBox = normalizedSizingMode === 'containbypbox';
          const isHeightBased = normalizedSizingMode === 'heightbased';

          // 手動縮放後同步更新高度基準，避免 heightBased 用舊的 targetHeight / maxTargetHeight 把圖層拉回原尺寸。
          if (isContainByPBox || isHeightBased) {
            layer.targetHeight = round(layer.height);
            layer.maxTargetHeight = round(layer.height);
          }
        }
      }

      // 讓「跟隨某圖層左上角」的圖層（例如陰影跟著它對應的邊界框移動）同步左上角座標，寬高不變。
      Object.entries(AppState.template?.layers || {}).forEach(([followerKey, followerLayer]) => {
        if (followerKey === key || followerLayer?.followTopLeftOfKey !== key) return;
        followerLayer.x = round(layer.x);
        followerLayer.y = round(layer.y);
        if (followerLayer.type === 'image') {
          followerLayer.centerX = round(followerLayer.x + (followerLayer.width || 0) / 2);
          followerLayer.centerY = round(followerLayer.y + (followerLayer.height || 0) / 2);
        }
      });

      window.LayoutRuleEngine?.handleLayerBoxApplied?.(key, layer, previousBox, AppState.template);
    },
    clampBoxToBounds(box, bounds) {
      if (!bounds || !bounds.width || !bounds.height) return box;
      const width = Math.min(Math.max(1, box.width), bounds.width);
      const height = Math.min(Math.max(1, box.height), bounds.height);
      const x = Math.min(Math.max(box.x, bounds.x), bounds.x + bounds.width - width);
      const y = Math.min(Math.max(box.y, bounds.y), bounds.y + bounds.height - height);
      return { x, y, width, height };
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
