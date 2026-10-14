/* 18節 MS — A 系函式級覆寫（自動抽取，請勿手改；重跑 tests/tools/extract-legacy18.js）
 *
 * 來源：暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js
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

  // MS 專用常數（18節 core 原文）
  const MS_L1_VIP_LOGO_FILENAME = '蝦皮VIP_LOGO.svg';
  const BUILT_IN_PRICE_RULES_BY_FAMILY = Object.freeze({
    get ddcard() { return window.DDCardTemplateRules?.priceRules || {}; },
    get hbn()    { return window.HBNTemplateRules?.priceRules || {}; },
    get skbn_pc() { return window.SKBNPCTemplateRules?.priceRules || window.SKBNTemplateRules?.priceRules || {}; },
    get skbn_app() { return window.SKBNAPPTemplateRules?.priceRules || {}; },
  });

  // ── BatchManager（39 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
  Object.assign(window.BatchManager, {
    fields: ['主標', '副標', '警語', '商品圖1', '商品圖2', 'CTA', '價格', '票券', '票券案型', '版位'],
    async generateFromSelectedSheet() {
      if (!AppState.excelWorkbook) return alert('請先讀取 Excel 檔。');
      if (DOM.batchStatus) DOM.batchStatus.textContent = '正在解析 Excel 並產生批次圖檔...';
      const sheetName = DOM.excelSheetSelect?.value || AppState.excelWorkbook.SheetNames[0];
      const sheet = AppState.excelWorkbook.Sheets[sheetName];
      if (!sheet) return alert('找不到指定分頁。');

      if (!AppState.sourceTemplates) AppState.sourceTemplates = this.ensureTemplatePool(AppState.templates);
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: true });
      const parseResult = this.parseMSL1Rows(rows) || this.parseRows(rows);
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
          const hasAnyContent = this.fields.some((field) => String(record[field] || '').trim());
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
          const seq = (counters.get(baseName) || 0) + 1;
          counters.set(baseName, seq);
          const outputName = `${baseName}_${String(seq).padStart(2, '0')}`;
          const data = clone(matchInfo.template.data);
          data.templateId = outputName;
          data.batchSourceName = block.name;
          if (recordRoute) {
            data.ruleFamily = recordRoute.family || recordRoute.key;
            data.sheetTemplateRoute = { key: recordRoute.key, family: recordRoute.family || recordRoute.key, label: recordRoute.label, sourceTemplateId: recordRoute.templateId, ruleFile: recordRoute.ruleFile };
          }
          this.applyRecordToTemplate(data, record);
          generated.push({ name: outputName, file: `${outputName}.generated`, visible: true, data, batchRecord: record });
          generatedInBlock += 1;
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
    parseMSL1Rows(rows) {
      const clean = (value) => String(value ?? '')
        .replace(/_x000d_/gi, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      const norm = (value) => this.norm(value);
      const headerRowIndex = rows.findIndex((row) =>
        norm(row?.[6]) === norm('名稱') && norm(row?.[7]) === norm('使用公版')
      );
      if (headerRowIndex < 0) return null;

      const blocks = [];
      const warnings = [];
      const skippedRows = [];
      let current = null;

      const pushCurrent = () => {
        if (!current) return;
        const templateName = clean(current.templateName);
        const fields = current.fields || {};
        const record = {
          主標: fields['主標題'] || fields['主標'] || '',
          副標: fields['副標題'] || fields['副標'] || '',
          警語: fields['法務小字'] || fields['警語'] || fields['legal'] || '',
          CTA: fields['CTA'] || fields['cta'] || fields['按鈕'] || current.cta || '',
          票券: fields['票券'] || fields['票券標題'] || current.couponTitle || '',
          票券案型: fields['票券案型'] || '',
          商品圖1: fields['商品圖1'] || '',
          商品圖2: fields['商品圖2'] || '',
          價格: fields['價格'] || '',
          __msTemplateName: templateName,
          __msFields: fields,
          __msStartRow: current.startRow + 1,
        };
        if (templateName && norm(templateName).includes(norm('表格_免運'))) {
          record.__msFields = {
            ...fields,
            ...this.extractMSL1FreeShippingTableFields(current.tableRows || []),
          };
        }
        // 票券_VIP 的工單目前是：A欄小藍標、C欄主副文、F欄 CTA、下一列 A欄 Logo。
        if (templateName && norm(templateName).includes(norm('票券'))) {
          record.__msFields = {
            ...fields,
            小藍標: fields['小藍標'] || current.badge || '',
            票券文案: fields['票券文案'] || current.couponText || '',
            CTA: record.CTA,
            LOGO: fields['LOGO'] || current.logo || '',
          };
          const lines = clean(record.__msFields['票券文案']).split(/\n+/).map((v) => v.trim()).filter(Boolean);
          record.主標 = lines[0] || record.主標;
          record.副標 = lines.slice(1).join('\n') || record.副標;
          record.CTA = record.__msFields.CTA;
          record.票券 = record.主標;
        }
        if (templateName === '中標_全橘') {
          // 中標_全橘 必須精準對應：使用公版 === "中標_全橘"，名稱 === "中標題"。
          // 只取「中標題」左側欄位資料，不再 fallback 到「中標 / 主標題 / 主標」，避免誤抓其他欄位。
          const middleTitle = fields['中標題'] || '';
          record.__msFields = {
            ...fields,
            中標題: middleTitle,
          };
          record.主標 = middleTitle || record.主標;
        }
        const hasAny = Object.values(record.__msFields || {}).some((v) => clean(v));
        if (!templateName) return;
        if (!hasAny && !norm(templateName).includes(norm('下蓋'))) {
          skippedRows.push({ row: current.startRow + 1, name: templateName, reason: '使用公版有值，但沒有讀到可套用資料' });
          return;
        }
        blocks.push({
          name: templateName,
          headerRow: headerRowIndex,
          startRow: current.startRow,
          quantity: 1,
          records: [record],
          colMap: { 名稱: 6, 使用公版: 7 },
          templateType: 'ms_l1',
        });
      };

      for (let r = headerRowIndex + 1; r < rows.length; r += 1) {
        const row = rows[r] || [];
        const templateName = clean(row[7]);
        const label = clean(row[6]);
        const valueA = clean(row[0]);
        const couponText = clean(row[2]);
        const cta = clean(row[5]);

        if (templateName) {
          pushCurrent();
          current = { templateName, startRow: r, fields: {}, badge: '', couponText: '', cta: '', logo: '', tableRows: [] };
        }
        if (!current) continue;

        if (label && valueA) current.fields[label] = valueA;
        if (norm(current.templateName).includes(norm('表格_免運'))) {
          current.tableRows.push(row.map(clean));
        }

        // 票券列：A欄「小藍標：...」、C欄券文案、F欄 CTA。
        if (couponText || cta || /^小[藍黃]標[:：]/.test(valueA)) {
          current.badge = valueA.replace(/^小[藍黃]標[:：]\s*/, '').trim();
          current.couponText = couponText;
          current.cta = cta;
          current.fields['小藍標'] = current.badge;
          current.fields['票券文案'] = couponText;
          current.fields['CTA'] = cta;
        }
        // 票券下一列可能只放 VIP LOGO。
        if (!label && /logo/i.test(valueA)) {
          current.logo = valueA;
          current.fields['LOGO'] = valueA;
        }
        // 下蓋只需要公版，不需要文字。
        if (norm(current.templateName).includes(norm('下蓋')) && valueA) {
          current.fields['名稱'] = valueA;
        }
      }
      pushCurrent();

      if (!blocks.length) return null;
      return { blocks, anchorCount: 1, warnings, skippedRows, parser: 'MS_L1' };
    },
    extractMSL1FreeShippingTableFields(tableRows = []) {
      const clean = (value) => this.normalizeRecordText(value);
      const compact = (value) => this.norm(clean(value));
      const priceText = (value) => {
        const raw = clean(value);
        if (!raw) return '';
        if (/^[$＄]/.test(raw)) return raw.replace(/^＄/, '$');
        if (/^\d+(?:\.\d+)?\s*起?$/.test(raw)) return `$${raw}`;
        return raw;
      };
      const fields = {};
      const rows = (tableRows || []).map((row) => (row || []).map(clean));
      const headerRow = rows.find((row) => row.some((cell) => compact(cell).includes(compact('適用物流'))));
      const priceRow = rows.find((row) => compact(row[0]).includes(compact('4/18加碼')));

      if (headerRow && priceRow) {
        const logisticsPriceLayers = [
          { keywords: ['蝦皮店到店'], target: '蝦皮店到店_價格', reject: ['隔日到貨', '環保無包裝'] },
          { keywords: ['蝦皮店到店', '隔日到貨'], target: '隔日到貨_價格' },
          { keywords: ['蝦皮店到店', '環保無包裝'], target: '環保無包裝_價格' },
          { keywords: ['店到家宅配'], target: '店到家宅配_價格' },
        ];
        headerRow.forEach((header, index) => {
          const normalizedHeader = compact(header);
          if (!normalizedHeader) return;
          const matched = logisticsPriceLayers.find((rule) =>
            rule.keywords.every((keyword) => normalizedHeader.includes(compact(keyword))) &&
            !(rule.reject || []).some((keyword) => normalizedHeader.includes(compact(keyword)))
          );
          if (matched) fields[matched.target] = priceText(priceRow[index]);
        });
      }

      const vipRow = rows.find((row) => compact(row[0]) === compact('蝦皮VIP'));
      if (vipRow) {
        const offer = clean(vipRow.slice(1).find((cell) => /[|｜]/.test(cell)) || vipRow[2] || '');
        const [left = '', ...rightParts] = offer.split(/[|｜]/).map((value) => clean(value)).filter(Boolean);
        const right = rightParts.join('｜');
        const price = priceText([...vipRow].reverse().find((cell) => /^[$＄]/.test(clean(cell))) || vipRow[5] || '');
        fields['表格案型_左'] = left;
        fields['表格案型_格線'] = offer.includes('｜') ? '｜' : (offer.includes('|') ? '|' : '');
        fields['表格案型_右'] = right;
        fields['價格_蝦皮VIP'] = price;
      }

      return fields;
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
          else if (normalized.includes(this.norm('商品圖1')) || normalized.includes(this.norm('商品圖一')) || normalized === this.norm('商品圖左') || normalized.includes('productimage1')) {
            setOnce('商品圖1', c);
          }
          else if (normalized.includes(this.norm('商品圖2')) || normalized.includes(this.norm('商品圖二')) || normalized === this.norm('商品圖右') || normalized.includes('productimage2')) {
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
          const hasCoreFields = colMap['主標'] !== undefined || colMap['副標'] !== undefined || colMap['警語'] !== undefined || colMap['商品圖1'] !== undefined || colMap['商品圖2'] !== undefined || colMap['CTA'] !== undefined || colMap['價格'] !== undefined || colMap['票券'] !== undefined || colMap['票券案型'] !== undefined || colMap['版位'] !== undefined;
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
        { field: '商品圖1', aliases: ['商品圖1', '商品圖一', '商品圖左', 'productimage1'] },
        { field: '商品圖2', aliases: ['商品圖2', '商品圖二', '商品圖右', 'productimage2'] },
        { field: 'CTA', aliases: ['cta', '按鈕', 'button'] },
        { field: '價格', aliases: ['價格', 'price'] },
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

      // 優先用檔名精確比對：檔名在同一個資料夾裡一定是唯一的，
      // 不像單純用 templateId/label 模糊比對，結果可能因為範本清單的排列順序而改變
      // （本機資料夾跟雲端硬碟資料夾的檔案列舉順序不保證一樣）。
      if (route.templateFile) {
        const wantedFile = this.norm(String(route.templateFile).replace(/\.json$/i, ''));
        const byFilename = (templates || []).find((template) => {
          const fileNorm = this.norm(String(template.file || '').replace(/\.json$/i, ''));
          return fileNorm && fileNorm === wantedFile;
        });
        if (byFilename) return { template: byFilename, reason: '' };
      }

      const wanted = this.norm(route.templateId);
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
      if (templateLabel.includes('skbnpc') || templateLabel.includes('skbn')) return 'SKBN_PC';
      if (templateLabel.includes(this.norm('上蓋vip'))) return '上蓋_VIP';
      if (templateLabel.includes(this.norm('票券vip'))) return '票券_VIP';
      if (templateLabel.includes(this.norm('下蓋vip'))) return '下蓋_VIP';

      const n = this.norm(blockName);
      if (n.includes('hbn')) return 'HBN';
      if (n.includes('ddcard') || n.includes('ddc')) return 'DDC';
      if (n.includes('popup')) return 'POPUP';
      if (n.includes('skbnpc') || n.includes('skbn')) return 'SKBN_PC';
      if (n.includes(this.norm('上蓋vip'))) return '上蓋_VIP';
      if (n.includes(this.norm('票券vip'))) return '票券_VIP';
      if (n.includes(this.norm('下蓋vip'))) return '下蓋_VIP';
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
      // 商品圖的縮放模式直接讀取 rules/*.rules.js 的 productImageBox.sizingMode /
      // widthLimitPolicy，不再用寫死的商品檔名清單判斷。
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
      return window.TemplateRuleRegistry?.getRules?.(family) || {};
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
    isMSL1TopFullOrangeLogoTitle(template, value) {
      const templateLabel = this.norm(`${template?.sheetTemplateRoute?.sourceTemplateId || ''} ${template?.templateId || ''} ${template?.batchSourceName || ''} ${template?.source?.psdName || ''}`);
      const isTopFullOrange = templateLabel.includes(this.norm('上蓋_全橘'));
      if (!isTopFullOrange) return false;
      const raw = String(value || '').trim();
      return ['蝦皮短影音_LOGO', '蝦皮直播_LOGO', 'Shopee Prizes_LOGO']
        .some((token) => raw === `(${token})` || raw === `（${token}）`);
    },
    applyRecordToTemplate(template, record) {
      const diagnostics = [];
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
          const isTopFullOrangeLogoTitle = item.field === '主標'
            && this.isMSL1TopFullOrangeLogoTitle(template, value);
          if (isTopFullOrangeLogoTitle) {
            layer.text = value;
            layer.hidden = true;
            diagnostics.push({ field: item.field, status: 'ok', value, target: `${layer.psdName || ''} 交由上蓋_全橘 LOGO 規則顯示` });
          } else {
            layer.text = value;
            layer.hidden = false;
            diagnostics.push({ field: item.field, status: 'ok', value, target: layer.psdName || '' });
          }
        }
      }

      this.applyMSRecordFieldsToTemplate(template, record, diagnostics);

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
          //    applyProductImageBox 會直接讀取）。
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

      // 若模板只有一個商品圖層，優先使用商品圖2（此份 Excel 的商品圖2 是主要商品圖），沒有才用商品圖1。
      if (productLayers.length === 1) {
        const asset = img2 || img1;
        if (asset) applyImage(productLayers[0], asset, img2 ? '商品圖2' : '商品圖1');
        else if (String(productLayers[0].assetFilename || '').trim() === 'P') productLayers[0].assetFilename = '';
      } else {
        applyImage(productLayers[0], img1, '商品圖1');
        applyImage(productLayers[1], img2, '商品圖2');
        productLayers.forEach((layer) => {
          if (String(layer?.assetFilename || '').trim() === 'P') layer.assetFilename = '';
        });
      }

      syncPriceAnchorsToCurrentProduct();
      const priceKeys = PriceCouponManager.apply(template, record);
      this.applyTemplateRuleHook('afterApplyRecordToTemplate', template, record, diagnostics);
      LayoutRuleEngine.apply(template);
      if (priceKeys.length) diagnostics.push({ field: '價格', status: 'ok', value: record['價格'], target: priceKeys.join('、') });
      else if (String(record['價格'] || '').trim()) diagnostics.push({ field: '價格', status: 'missing-layer', value: record['價格'], target: '找不到商品圖1錨點或價格規則' });

      template.batchDiagnostics = diagnostics;
    },
    applyMSRecordFieldsToTemplate(template, record, diagnostics = []) {
      const fields = record?.__msFields || null;
      if (!fields || !Object.keys(fields).length) return;
      const normLocal = (value) => this.norm(value);
      const findByName = (type, names = []) => {
        const wanted = names.map(normLocal).filter(Boolean);
        return Object.values(template.layers || {}).find((layer) => {
          if (type && layer.type !== type) return false;
          const label = normLocal(`${layer.psdName || ''} ${layer.role || ''}`);
          return wanted.some((name) => label.includes(name) || name.includes(label));
        }) || null;
      };
      const setText = (names, value, fieldName) => {
        const cleanValue = this.normalizeRecordText(value);
        if (!cleanValue) return;
        const layer = findByName('text', names);
        if (!layer) {
          diagnostics.push({ field: fieldName, status: 'missing-layer', value: cleanValue });
          return;
        }
        layer.text = cleanValue;
        layer.hidden = false;
        diagnostics.push({ field: fieldName, status: 'ok', value: cleanValue, target: layer.psdName || '' });
      };

      setText(['主標題', '主標', 'title'], fields['主標題'] || fields['主標'], '主標題');
      setText(['中標題', '中標'], fields['中標題'] || fields['中標'], '中標');
      setText(['副標題', '副標', 'subtitle'], fields['副標題'] || fields['副標'], '副標題');
      setText(['法務小字', '法務', 'legal'], fields['法務小字'] || fields['警語'], '法務小字');
      setText(['價格', 'price'], fields['價格'], '價格');
      setText(['小藍標', '小黃標', 'badge'], fields['小藍標'] || fields['小黃標'], '小藍標');
      setText(['cta', '按鈕', 'button'], fields['CTA'], 'CTA');

      if (fields['票券文案']) {
        const lines = this.normalizeRecordText(fields['票券文案']).split(/\n+/).map((v) => v.trim()).filter(Boolean);
        setText(['主標題', '票券標題', 'title'], lines[0] || '', '票券標題');
        setText(['副標題', '票券副標', 'subtitle'], lines.slice(1).join('\n'), '票券副標');
      }

      const logoRaw = this.normalizeRecordText(fields['LOGO']);
      if (logoRaw) {
        const exactVipLogoToken = /[（(]\s*蝦皮\s*VIP\s*LOGO\s*[)）]/i;
        const logoText = logoRaw
          .replace(exactVipLogoToken, '')
          .replace(/[（(]\s*VIP\s*LOGO\s*[)）]/ig, '')
          .replace(/VIP\s*LOGO/ig, '')
          .trim();
        const logoTextLayer = findByName('text', ['LOGO_案型', '案型', '專屬']);
        if (logoTextLayer && logoText) {
          logoTextLayer.text = logoText;
          logoTextLayer.hidden = false;
        }

        const logoLayer = findByName('image', ['蝦皮VIP LOGO', '蝦皮VIP_LOGO']);
        if (logoLayer && exactVipLogoToken.test(logoRaw)) {
          const requiredAssetName = MS_L1_VIP_LOGO_FILENAME;
          const match = this.findAssetFilename(requiredAssetName);
          logoLayer.assetFilename = match.found ? match.filename : requiredAssetName;
          logoLayer.hidden = false;

          // 將「蝦皮VIP_LOGO.svg + LOGO_案型」視為同一組，群組總寬置中於 X 軸中心。
          if (logoTextLayer) {
            const canvasWidth = Number(template?.canvas?.width || template?.width || 1200);
            const groupCenterX = canvasWidth / 2;
            const gap = 5;
            const fontPx = Number(logoTextLayer.fontSizePx || logoTextLayer.fontSizePt || logoTextLayer.fontSize || 70);
            const measuredTextWidth = (() => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const weight = String(logoTextLayer.fontWeight || logoTextLayer.fontStyle || '').toLowerCase().includes('bold') ? '700' : '500';
                const family = logoTextLayer.fontFamily || 'Shopee Noto Sans, Noto Sans TC, Arial, sans-serif';
                ctx.font = `${weight} ${fontPx}px ${family}`;
                return Math.ceil(ctx.measureText(logoText).width);
              } catch (error) {
                return Math.ceil(logoText.length * fontPx * 0.9);
              }
            })();
            const textWidth = Math.max(1, measuredTextWidth || Number(logoTextLayer.width || 1));
            const logoWidth = Number(logoLayer.width || 0);
            const totalWidth = logoWidth + gap + textWidth;
            logoLayer.x = Math.round(groupCenterX - totalWidth / 2);
            logoTextLayer.x = Math.round(logoLayer.x + logoWidth + gap);
            logoTextLayer.width = Math.round(textWidth);
          }
          diagnostics.push({ field: 'LOGO', status: match.found ? 'ok' : 'missing-asset', value: logoRaw, target: logoLayer.psdName || '', filename: logoLayer.assetFilename });
        }
      }
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
      if (label.includes('skbnpc') || label.includes('skbn')) return 'SKBN';
      return '';
    },
    normalizeAssetKey(value) {
      return String(value || '')
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
      const cleanRaw = raw.replace(/[\s\u00a0\u3000\t\r\n]+/g, '');
      const attempts = [];
      if (!raw) return { found: false, filename: '', attempts };

      const shopeeVipLogoAssetName = MS_L1_VIP_LOGO_FILENAME;
      const shopeeVipLogoKey = this.normalizeAssetKey(shopeeVipLogoAssetName);
      if (this.normalizeAssetKey(raw).includes(shopeeVipLogoKey)) {
        const exactShopeeVipLogo = keys.find((file) => file === shopeeVipLogoAssetName)
          || keys.find((file) => file.toLowerCase() === shopeeVipLogoAssetName.toLowerCase());
        return exactShopeeVipLogo
          ? { found: true, filename: exactShopeeVipLogo, attempts: [shopeeVipLogoAssetName] }
          : { found: false, filename: '', attempts: [shopeeVipLogoAssetName] };
      }

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

      // 1) 原始值完全匹配。
      let hit = tryExact(raw);
      if (hit) return { found: true, filename: hit, attempts };

      // 2) 沒有副檔名時補常見圖片副檔名。
      const rawHasExt = /\.[a-z0-9]+$/i.test(raw);
      const baseNames = [raw, cleanRaw];
      if (prefix) {
        baseNames.unshift(`${prefix}_${cleanRaw}`, `${prefix}_${raw}`);
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

  // ── TemplateLoader（6 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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

      // 先套用規則，讓 MS L1 動態產生的 VIP LOGO / 主標題圖層進入 layers/renderOrder 後再載圖。
      // 避免先建立 image cache、後新增圖層，造成預覽時圖層存在但圖片為空。
      try { LayoutRuleEngine?.apply?.(template); } catch (error) { console.warn('[Assets] layout pre-apply failed:', error); }

      const entries = Object.entries(template.layers || {});
      await Promise.all(entries.map(async ([key, layer]) => {
        if (layer.type !== 'image' || !layer.assetFilename) return;

        const filename = String(layer.assetFilename || '').trim();
        const localFile = this.findLocalAssetFile(filename);

        // 1) 使用者手動載入素材資料夾：最穩，使用 blob URL，不會污染 Canvas。
        if (localFile) {
          const objectUrl = URL.createObjectURL(localFile);
          try { images[key] = await this.loadImage(objectUrl); }
          finally { setTimeout(() => URL.revokeObjectURL(objectUrl), 1200); }
          return;
        }

        // 2) 內建素材 fallback：直接用 Data URI，讓本機 file:// 開啟也能正常顯示與下載。
        if (typeof EMBEDDED_ASSETS !== 'undefined' && EMBEDDED_ASSETS[filename]) {
          images[key] = await this.loadImage(EMBEDDED_ASSETS[filename]);
          return;
        }

        // 3) 一般路徑載入：適合用 Live Server / http 開啟。
        const urls = [`./assets/素材/${filename}`, `assets/素材/${filename}`, `./assets/${filename}`, `./${filename}`, `assets/${filename}`, filename];
        for (const url of urls) {
          try { images[key] = await this.loadImage(url); return; }
          catch (_) {}
        }

        console.warn('[Assets] 圖片載入失敗:', key, filename);
        images[key] = null;
      }));

      // 額外一層防呆——loadImage() 內部雖然已經 await img.decode()，
      // 但極少數瀏覽器/情境下 decode() resolve 的當下 naturalWidth 可能還沒穩定。
      // 這裡再次確認每一張圖片都真的可以取得 naturalWidth，最多重試幾個影格。
      await this.ensureImagesReady(images);
      return images;
    },
    async ensureImagesReady(images, maxFrames = 6) {
      const pending = () => Object.values(images).filter((img) => img && !(Number(img.naturalWidth) > 0));
      let frames = 0;
      while (pending().length && frames < maxFrames) {
        await new Promise(requestAnimationFrame);
        frames += 1;
      }
    },
    findLocalAssetFile(filename) {
      const files = AppState.assetFiles || new Map();
      if (!filename || !files.size) return null;

      const raw = String(filename || '').trim();
      if (files.has(raw)) return files.get(raw);

      const clean = (value) => String(value || '').toLowerCase()
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[\s\u00a0\u3000\t\r\n]+/g, '')
        .replace(/[\-_()（）\[\]【】.]/g, '');

      const keys = [...files.keys()];
      const wanted = clean(raw);
      const shopeeVipLogoKey = clean(MS_L1_VIP_LOGO_FILENAME);
      const isShopeeVipLogoRequest = wanted.includes(shopeeVipLogoKey);

      // MS L1 嚴格素材規則：VIP LOGO 一律只吃「蝦皮VIP_LOGO.svg」。
      // 不用標準化模糊匹配，避免又誤配到舊版空白檔名。
      if (isShopeeVipLogoRequest) {
        const strictHit = keys.find((name) => name === MS_L1_VIP_LOGO_FILENAME)
          || keys.find((name) => name.toLowerCase() === MS_L1_VIP_LOGO_FILENAME.toLowerCase());
        return strictHit ? files.get(strictHit) : null;
      }

      const exactHit = keys.find((name) => clean(name) === wanted);
      if (exactHit) return files.get(exactHit);

      // 模糊比對改為蒐集全部候選後，優先選「清理後字串長度跟目標最接近」的，
      // 不再是「陣列裡第一個」——避免結果因檔案列舉順序不同而改變
      // （桌面資料夾跟雲端硬碟資料夾的檔案列舉順序不保證一樣）。
      const candidates = keys
        .map((name) => {
          const key = clean(name);
          const isMatch = key.includes(wanted) || wanted.includes(key);
          if (!isMatch) return null;
          return { name, lengthDiff: Math.abs(key.length - wanted.length) };
        })
        .filter(Boolean);
      if (!candidates.length) return null;
      candidates.sort((a, b) => a.lengthDiff - b.lengthDiff);
      return files.get(candidates[0].name);
    },
    async loadAssetFolder(fileList) {
      AppState.assetFiles = new Map([...fileList].filter((file) => /^image\//i.test(file.type) || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)).map((file) => [file.name, file]));
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

  // ── Renderer（22 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
  Object.assign(window.Renderer, {
    computeGeneratedLayer(key) {
      if (key !== 'subtitle_frame') return null;
      const t = AppState.template;
      if (!t?.generatedLayers?.subtitle_frame) return null;
      const findTextLayer = (names = []) => {
        const wanted = names.map((name) => normStr(name)).filter(Boolean);
        return Object.values(t.layers || {}).find((layer) => {
          if (!layer || layer.type !== 'text') return false;
          const label = normStr(`${layer.psdName || ''} ${layer.role || ''}`);
          return wanted.some((name) => label === name || label.includes(name));
        }) || null;
      };
      const title = t.layers.title || findTextLayer(['主標題', '主標題_左', '主標', 'title']);
      const subtitle = t.layers.subtitle || findTextLayer(['副標題', '副標', 'subtitle']);
      const legal = t.layers.legal || findTextLayer(['法務小字', '法務', 'legal']);
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
    getLayerShadow(layer) {
      const shadow = layer?.shadow || layer?.dropShadow || layer?.effects?.dropShadow || null;
      return shadow?.enabled === true ? shadow : null;
    },
    shadowColorToRgba(shadow) {
      if (shadow?.rgba) return shadow.rgba;
      const color = String(shadow?.color || '#000000').trim();
      const opacity = Number.isFinite(Number(shadow?.opacity)) ? Number(shadow.opacity) : 1;
      if (/^rgba\(/i.test(color)) return color;
      if (/^rgb\(/i.test(color)) return color.replace(/\)$/i, `, ${opacity})`).replace(/^rgb\(/i, 'rgba(');

      const hex = color.replace('#', '');
      const value = hex.length === 3
        ? hex.split('').map((char) => char + char).join('')
        : hex.padEnd(6, '0').slice(0, 6);
      const red = parseInt(value.slice(0, 2), 16) || 0;
      const green = parseInt(value.slice(2, 4), 16) || 0;
      const blue = parseInt(value.slice(4, 6), 16) || 0;
      return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, opacity))})`;
    },
    getShadowBlendMode(shadow) {
      const mode = String(shadow?.blendMode || shadow?.mixBlendMode || shadow?.compositeOperation || '').toLowerCase();
      return mode === 'multiply' || mode === '色彩增值' ? 'multiply' : 'source-over';
    },
    applyLayerShadow(canvasCtx, layer, options = {}) {
      const shadow = this.getLayerShadow(layer);
      if (!shadow) return false;

      const useTransformScale = options.useTransformScale !== false;
      const transform = useTransformScale && typeof canvasCtx.getTransform === 'function' ? canvasCtx.getTransform() : { a: 1, d: 1 };
      const scale = Math.max(Math.abs(Number(transform?.a || 1)), Math.abs(Number(transform?.d || 1)), 1);
      const angle = (Number(shadow.angle || 0) * Math.PI) / 180;
      const distance = Number(shadow.distance || 0);

      canvasCtx.shadowColor = this.shadowColorToRgba(shadow);
      canvasCtx.shadowBlur = Math.max(0, Number(shadow.blur || 0)) * scale;
      canvasCtx.shadowOffsetX = Math.cos(angle) * distance * scale;
      canvasCtx.shadowOffsetY = Math.sin(angle) * distance * scale;
      return true;
    },
    hasShadowLayer(template) {
      return (template?.renderOrder || []).some((key) => {
        if (key === 'subtitle_frame') return false;
        const layer = template.layers?.[key];
        return !!(layer && !layer.hidden && this.getLayerShadow(layer) && ['text', 'image'].includes(layer.type));
      });
    },
    drawAllLayerShadows(canvasCtx, template) {
      if (!template?.canvas || !this.hasShadowLayer(template)) return;

      const temp = document.createElement('canvas');
      temp.width = Math.round(Number(template.canvas.width || canvasCtx.canvas.width || 1));
      temp.height = Math.round(Number(template.canvas.height || canvasCtx.canvas.height || 1));
      const tempCtx = temp.getContext('2d', { alpha: true });
      if (!tempCtx) return;

      let blendMode = 'source-over';
      for (const key of template.renderOrder || []) {
        if (key === 'subtitle_frame') continue;
        const layer = template.layers?.[key];
        const shadow = this.getLayerShadow(layer);
        if (!layer || layer.hidden || !shadow || !['text', 'image'].includes(layer.type)) continue;

        if (this.getShadowBlendMode(shadow) === 'multiply') blendMode = 'multiply';

        tempCtx.save();
        this.applyLayerShadow(tempCtx, layer, { useTransformScale: false });
        this.drawShadowSource(tempCtx, key, layer);
        tempCtx.restore();

        tempCtx.save();
        tempCtx.globalCompositeOperation = 'destination-out';
        this.drawShadowSource(tempCtx, key, layer);
        tempCtx.restore();
      }

      canvasCtx.save();
      canvasCtx.globalCompositeOperation = blendMode;
      canvasCtx.drawImage(temp, 0, 0);
      canvasCtx.restore();
    },
    drawShadowSource(canvasCtx, key, layer) {
      if (layer?.type === 'text') {
        this.drawTextContent(canvasCtx, key, layer, { fillStyle: '#000000' });
        return;
      }
      if (layer?.type === 'image') {
        this.drawImageContent(canvasCtx, key, layer, { fallback: false });
      }
    },
    _drawLayers(canvasCtx, t, ui = false) {
      let shadowPassDrawn = false;
      for (const key of t.renderOrder || []) {
        if (key === 'subtitle_frame') { this.drawShape(canvasCtx, this.computeGeneratedLayer(key)); continue; }
        const layer = t.layers[key];
        if (!layer || layer.hidden) continue;

        // Draw all managed shadows once, before the first shadowed layer is rendered.
        // This keeps shadows behind the target artwork/text, so VIP LOGO shadows won't cover LOGO_案型.
        if (!shadowPassDrawn && this.getLayerShadow(layer)) {
          this.drawAllLayerShadows(canvasCtx, t);
          shadowPassDrawn = true;
        }

        if (this.drawRuleShape(canvasCtx, key, layer)) continue;
        if (layer.type === 'shape') this.drawShape(canvasCtx, layer);
        if (layer.type === 'image') this.drawImage(canvasCtx, key, layer);
        if (layer.type === 'text') { this.drawText(canvasCtx, key, layer); if (ui && AppState.editingLayerKey === key && this.drawTextCaret) this.drawTextCaret(canvasCtx, key, layer); }
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

      // V3.29.2：PSD 公版小工具 V2.2 / V2.3 匯出的 JSON shape
      // 先交給 ShapeRenderer 依 shape.kind 繪製 ellipse / polygon / rectangle。
      // 若 ShapeRenderer 未載入或不支援該 shape，再回到舊版矩形 fallback。
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
      const italic = layer?.italic || String(layer?.fontStyle || '').toLowerCase().includes('italic') ? 'italic ' : '';
      return `${italic}${layer.fontWeight || 400} ${layer.fontSizePx || 24}px "ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif`;
    },
    drawText(canvasCtx, key, layer) {
      const renderLayer = (AppState.editingLayerKey === key && canvasCtx === ctx)
        ? { ...layer, text: AppState.editingText }
        : layer;
      this.drawTextContent(canvasCtx, key, renderLayer);
    },
    drawTextContent(canvasCtx, key, layer, options = {}) {
      const drawableLayer = { ...layer };
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

      canvasCtx.fillStyle = options.fillStyle || drawableLayer.color || '#000000';
      canvasCtx.font = this.font(drawableLayer);
      canvasCtx.textAlign = drawableLayer.align || 'center';
      canvasCtx.textBaseline = 'top';
      const lines = String(drawableLayer.text || '').replace(/_x000d_/gi, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      const fontSize = drawableLayer.fontSizePx || 24;
      const lineHeight = drawableLayer.lineHeight || fontSize * 1.05;
      const letterSpacing = Number(drawableLayer.letterSpacing || 0);
      const startY = drawableLayer.y + Math.max(0, (drawableLayer.height - lines.length * lineHeight) / 2);
      const x = drawableLayer.align === 'left'
        ? drawableLayer.x
        : drawableLayer.align === 'right'
          ? drawableLayer.x + drawableLayer.width
          : drawableLayer.x + drawableLayer.width / 2;
      lines.forEach((line, i) => this.drawTextLine(canvasCtx, line, x, startY + i * lineHeight, drawableLayer.align || 'center', letterSpacing));
      canvasCtx.restore();
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
      this.drawImageContent(canvasCtx, key, layer);
    },
    drawImageContent(canvasCtx, key, layer, options = {}) {
      const box = Geometry.getRenderedImageBox(key, layer);
      const img = AppState.images[key];
      const ready = Geometry.isImageReady(key, layer);
      canvasCtx.save();
      canvasCtx.translate(box.centerX, box.centerY);
      canvasCtx.rotate(((layer.rotation || 0) * Math.PI) / 180);
      if (img && ready) {
        canvasCtx.drawImage(img, -box.width / 2, -box.height / 2, box.width, box.height);
      } else if (!layer.assetFilename && options.fallback !== false) {
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

  // ── CapsuleRuleEngine（7 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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
      // 記錄的當下，這兩個全域變數其實還停留在「使用者上一次操作」的舊內容，
      // 可能導致誤判成別的家族。template 自己的 templateId / batchSourceName /
      // source.psdName 已經足夠識別，不應該再依賴這種容易過期的全域狀態。
      const labelParts = [
        template?.templateId,
        template?.batchSourceName,
        template?.source?.psdName,
      ].filter(Boolean);

      const label = this.norm(labelParts.join(' '));
      if (label.includes('頭巾vip') || label.includes('headbandvip') || label.includes('hdbvip')) return 'headband_vip';
      if (label.includes('頭巾全站') || label.includes('headbandshopee') || label.includes('hdbshopee')) return 'headband_shopee';

      const registeredFamily = window.TemplateRuleRegistry?.detectFamily?.(labelParts, null);
      if (registeredFamily) return registeredFamily;

      // Fallback only for environments that load app.core.js without the registry.
      if (label.includes('ddcard') || label.includes('ddc') || label.includes('dd card')) return 'ddcard';
      if (label.includes('hbn') || label.includes('han')) return 'hbn';
      if (label.includes('headband') || label.includes('hdb') || label.includes('頭巾')) return 'headband';
      return 'ddcard';
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
      const isMSL1 = template?.ruleFamily === 'ms_l1';

      if (isMSL1) {
        const generatedRules = template.generatedLayers?.subtitle_frame?.rules || {};
        const horizontalPadding = Number(generatedRules.horizontalPadding ?? 50);
        const verticalPadding = Number(generatedRules.verticalPadding ?? 13);
        const fixedHeight = Number(generatedRules.fixedHeight || 0);
        const subtitleBoxWidth = Number(subtitle.width || 1);
        const allLayers = Object.values(template.layers || {});
        const visibleLayers = allLayers.filter((layer) => layer && layer.hidden !== true);
        const getMeasuredLayerWidth = (layer, fallbackWidth = 0) => {
          if (!layer) return Number(fallbackWidth || 0);
          const layerWidth = Number(layer.width || fallbackWidth || 0);
          if (layer.type === 'text') return Math.max(layerWidth, Number(CapsuleRuleEngine.measureTextWidth(layer, ctx) || 0));
          return Math.max(1, layerWidth);
        };
        const topFullOrangeLogoLayer = visibleLayers.find((layer) => layer.__msL1GeneratedTopFullOrangeLogo || layer.__msL1UseAsCapsuleTitleWidth);
        const logoTitleGroupWidth = Math.max(
          Number(title.__msL1LogoTitleGroupWidth || 0),
          ...visibleLayers.map((layer) => Number(layer.__msL1LogoTitleGroupWidth || 0))
        );
        const subtitleGroupWidth = Math.max(
          Number(subtitle.__msL1SubtitleGroupWidth || 0),
          ...visibleLayers.map((layer) => Number(layer.__msL1SubtitleGroupWidth || 0))
        );
        const resolveTitleBaseWidth = () => {
          if (generatedRules.titleWidthSource === 'topFullOrangeLogo') {
            return Math.max(1, getMeasuredLayerWidth(topFullOrangeLogoLayer, title.width));
          }
          if (generatedRules.titleWidthSource === 'logoTitleGroup') {
            return Math.max(1, logoTitleGroupWidth, getMeasuredLayerWidth(title, titleTextWidth));
          }
          return Math.max(1, Number(titleTextWidth || 0), Number(title.width || 0));
        };
        const resolveSubtitleBaseWidth = () => {
          if (generatedRules.subtitleWidthSource === 'subtitleGroup' || generatedRules.widthSource === 'subtitleGroup') {
            return Math.max(1, subtitleGroupWidth, Number(subtitleTextWidth || 0), subtitleBoxWidth);
          }
          return Math.max(1, Number(subtitleTextWidth || 0), subtitleBoxWidth);
        };
        const titleBaseWidth = resolveTitleBaseWidth();
        const subtitleBaseWidth = resolveSubtitleBaseWidth();
        const compareTitleWidth = generatedRules.compareTitleWidth !== false;
        const titleWiderThresholdPx = Number(generatedRules.titleWiderThresholdPx ?? 50);
        const titleSubtitleDiff = titleBaseWidth - subtitleBaseWidth;
        const shouldUseTitleWidth = compareTitleWidth && titleSubtitleDiff >= titleWiderThresholdPx;
        const frameWidth = round(Math.max(1, shouldUseTitleWidth ? titleBaseWidth : subtitleBaseWidth + horizontalPadding), 2);
        const centerX = Number(subtitle.centerX || 0) || (Number(subtitle.x || 0) + subtitleBoxWidth / 2);
        const subtitleCenterY = Number(subtitle.centerY || 0) || (Number(subtitle.y || 0) + Number(subtitle.height || 0) / 2);
        const centerYOffset = Number(generatedRules.centerYOffset || 0);
        const frameCenterY = subtitleCenterY + centerYOffset;
        const height = round(fixedHeight > 0 ? fixedHeight : Math.max(1, Number(subtitle.height || 0) + verticalPadding * 2), 2);
        return {
          type: 'shape',
          x: round(centerX - frameWidth / 2, 2),
          y: round(fixedHeight > 0 ? frameCenterY - height / 2 : Number(subtitle.y || 0) - verticalPadding + centerYOffset, 2),
          width: frameWidth,
          height,
          centerX: round(centerX, 2),
          centerY: round(frameCenterY, 2),
          fill: template.generatedLayers?.subtitle_frame?.fill || '#0053D1',
          radius: Number(generatedRules.radius ?? 25),
        };
      }

      const capsuleWidth = Math.max(
        Number(rules.minWidthPx || 1),
        this.calculateWidth({ titleTextWidth, subtitleTextWidth, rules })
      );
      const verticalGap = Number(rules.verticalGapPx ?? 13);
      const verticalPadding = Number(rules.verticalPaddingPx ?? 13);
      const legalGap = Number(rules.legalGapPx ?? 11);
      const centerX = (title.x || 0) + (title.width || 0) / 2;
      const x = round(centerX - capsuleWidth / 2, 2);
      const y = round((title.y || 0) + (title.height || 0) + verticalGap, 2);
      const height = round((subtitle.height || 0) + verticalPadding * 2, 2);

      subtitle.x = x;
      subtitle.y = round(y + verticalPadding, 2);
      subtitle.width = round(capsuleWidth, 2);
      if (legal) legal.y = round(y + height + legalGap, 2);

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

  // ── LayoutRuleEngine（15 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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

  // ── PriceRuleEngine（12 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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

      // HBN 價格只能使用 rules/hbn.rules.js 註冊或掛載到 window.HBNTemplateRules 的最新規則。
      // 若 HBN 規則未載入或沒有對應 templateLayouts/productLayouts，直接回傳空 absolute 規則，
      // 避免回退套用 DDCard 或舊版內建價格資料。
      if (family === 'hbn') {
        const registeredRules = window.TemplateRuleRegistry?.getRules?.('hbn', 'priceRules') || {};
        if (this.hasEffectiveExternalRules(registeredRules)) return registeredRules;

        const latestHbnRules = window.HBNTemplateRules?.priceRules || {};
        if (this.hasEffectiveExternalRules(latestHbnRules)) return latestHbnRules;

        return {
          enabled: true,
          coordinateMode: 'absolute',
          positioningMode: 'absolute',
          lockToEditedJson: true,
          templateLayouts: {},
          productLayouts: {},
          classifiers: [],
        };
      }

      const rules = getRuleSection(family, 'priceRules');
      if (this.hasEffectiveExternalRules(rules)) return rules;
      return BUILT_IN_PRICE_RULES_BY_FAMILY[family] || BUILT_IN_PRICE_RULES_BY_FAMILY.ddcard || {};
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

  // ── PriceCouponManager（6 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
  Object.assign(window.PriceCouponManager, {
    layerPrefix: '__auto_price_v2_',
    apply(template, record) {
      this.remove(template);
      const rawPrice = String(record?.['價格'] || '').trim();
      if (!template?.layers || !rawPrice) return [];

      const productName = String(record?.['商品圖1'] || '').trim();
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

      const anchorLayerKey = this.findAnchorLayerKey(template);
      const anchorLayer = anchorLayerKey ? template.layers[anchorLayerKey] : null;
      const anchorBox = anchorLayerKey && anchorLayer ? Geometry.getLayerBox(anchorLayerKey, anchorLayer) : null;
      const createdKeys = [];
      const layoutsBySlot = new Map((rule.layouts || []).map((layout) => [layout.slot, layout]));

      prices.forEach((price, index) => {
        const baseLayout = layoutsBySlot.get(price.slot) || rule.layouts[index] || rule.layouts[0];
        if (!baseLayout || !price.text) return;

        const isEditedJsonLocked = PriceRuleEngine.isEditedJsonAbsoluteLayout(baseLayout);
        if (!isEditedJsonLocked && !anchorBox) return;

        const layoutBase = PriceRuleEngine.resolveLayoutForAnchor({ ...baseLayout, layoutKey: rule.layoutKey }, anchorBox);
        // 拿掉 PriceFontResolver（依內容關鍵字縮放/覆寫座標，全家族皆為死程式碼），改用PriceLayoutResolver直接處理。
        const layout = PriceLayoutResolver.fromLayout(layoutBase);
        const key = `${this.layerPrefix}${price.slot || index + 1}`;
        const color = layout.color || PriceColorResolver.resolve(productName, template);

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
    rebuildFromPricePreset(template) {
      if (!template?.layers || !template.pricePresetMeta) return [];
      const meta = template.pricePresetMeta || {};
      const rawPrice = String(meta.rawPrice || '').trim();
      if (!rawPrice) return [];

      const productName = String(meta.productName || '').trim();
      return this.apply(template, {
        '商品圖1': productName,
        '價格': rawPrice,
      });
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

  // ── PriceColorResolver（4 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
  Object.assign(window.PriceColorResolver, {
    defaultRules: Object.freeze([
      { name: 'VIP', regex: 'vip', flags: 'i', color: '#FF770F' },
      { name: 'SCS', keyword: 'scs', color: '#D0011B' },
      { name: '商城券', keyword: '商城券', color: '#D0011B' },
      { name: '全站券', keyword: '全站券', color: '#EE4D2D' },
    ]),

    buildMatcher(entry = {}) {
      if (entry.regex) {
        let re;
        try { re = new RegExp(entry.regex, entry.flags || ''); }
        catch (error) { console.warn('[PriceColorResolver] colorRules regex 無效，已略過:', entry, error); return () => false; }
        return (raw) => re.test(raw);
      }
      const keywords = (Array.isArray(entry.keywords) ? entry.keywords : [entry.keyword])
        .filter(Boolean)
        .map((keyword) => this.norm(keyword));
      if (!keywords.length) return () => false;
      return (raw, normalized) => keywords.some((keyword) => normalized.includes(keyword));
    },
    buildMatcher(entry = {}) {
      if (entry.regex) {
        let re;
        try { re = new RegExp(entry.regex, entry.flags || ''); }
        catch (error) { console.warn('[PriceColorResolver] colorRules regex 無效，已略過:', entry, error); return () => false; }
        return (raw) => re.test(raw);
      }
      const keywords = (Array.isArray(entry.keywords) ? entry.keywords : [entry.keyword])
        .filter(Boolean)
        .map((keyword) => this.norm(keyword));
      if (!keywords.length) return () => false;
      return (raw, normalized) => keywords.some((keyword) => normalized.includes(keyword));
    },
    getFamilyRules(template = AppState.template) {
      const rules = PriceRuleEngine.getRules(template);
      return Array.isArray(rules?.colorRules) && rules.colorRules.length ? rules.colorRules : null;
    },
    resolve(productName, template = AppState.template) {
      const raw = String(productName || '');
      const normalized = this.norm(raw);
      const familyRules = this.getFamilyRules(template);
      const activeRules = familyRules || this.defaultRules;

      const matched = activeRules.find((entry) => this.buildMatcher(entry)(raw, normalized));
      if (matched) return matched.color;

      const rulesDefaultColor = familyRules ? PriceRuleEngine.getRules(template)?.defaultColor : null;
      return rulesDefaultColor || PriceRuleEngine.defaultColor;
    },
  });

  // ── PriceLayerFactory（2 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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

  // ── PriceTransformEngine（7 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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

  // ── Geometry（4 個成員，原文自 暖正MS/18節Tool_暖正MS_V0.5/core/app.core.js）──
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
