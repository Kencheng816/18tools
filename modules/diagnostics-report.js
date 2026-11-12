/* 整合版（18節）— 診斷資料彙整（四級分類）
 *
 * 2026-10-07 回饋 3／7：把散在各處的診斷（未匹配、素材檢查、解析診斷、略過列…）整理成同一份資料，
 * 依「重要 × 緊急」分四級，給左側診斷面板（diagnostics-panel.js）與下載 zip 的 診斷報告.txt 共用。
 *
 *   critical  重要且緊急（紅）：找不到公版、素材缺少、有價格卻沒顯示 → 不處理就會出錯圖（公版沒有這個圖層＝important；刻意略過＝info，見 diagnostics.skipBlocks）
 *   important 重要不緊急（橘）：文字可能超出框、素材比例被拉伸、素材退回預設 → 圖會出但可能不好看
 *   minor     不重要但緊急（黃）：範例列／空白列被略過、輸出名重複 → 要知道、但多半是預期中
 *   info      不重要不緊急（灰）：解析統計、匯出備註
 *
 * 只讀 AppState，不改任何狀態；collect() 同步，collectWithImages() 會多載一次圖片檢查比例。
 */
(function initDiagnosticsReport() {
  'use strict';

  const TIERS = Object.freeze([
    { id: 'critical', label: '重要且緊急', tone: 'red', hint: '不處理就會出錯圖' },
    { id: 'important', label: '重要不緊急', tone: 'orange', hint: '圖會出，但可能不好看' },
    { id: 'minor', label: '不重要但緊急', tone: 'yellow', hint: '多半是預期中的略過' },
    { id: 'info', label: '資訊', tone: 'grey', hint: '統計與備註' },
  ]);
  const TEXT_OVERFLOW_TOLERANCE = 1.15;
  const ASPECT_TOLERANCE = 0.05;
  const PRICE_SOURCE = 'auto_price_v2';

  const core = () => ({ AppState: window.AppState, Renderer: window.Renderer, TemplateLoader: window.TemplateLoader, ProfileLoader: window.ProfileLoader });
  const clean = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n?/g, '\n').trim();
  const isMissingStatus = (status) => String(status || '').startsWith('missing');

  function makeCollector() {
    const items = Object.fromEntries(TIERS.map((tier) => [tier.id, []]));
    return {
      items,
      add(tierId, kind, title, detail = '', templateIndex = -1) {
        items[tierId].push({ kind, title: clean(title), detail: clean(detail), templateIndex });
      },
    };
  }

  /** 2026-10-30 第 17 題：這些是工單的固定寫法或日後會由工單調整的項目，不進診斷（解析統計仍有數字）：
   *  表頭統計表列、「(綁VID)」這類括號開頭的備註列、製作內容只填在每組第一列（版配下方 B 欄空白）、目前沒有公版的「FB post」版位。 */
  const MUTED_UNMATCHED = /^\s*[（(]|FB\s*post/i;
  const MUTED_WARNING = /找到「製作內容」，但同列沒有|沒有數量，也沒有可套用欄位|製作內容欄空白/;
  const MUTED_SKIP_REASON = /製作內容欄空白|沒有數量，也沒有主標|勾選欄是 FALSE|範例/;

  /** 2026-11-03 工單變更清查 #5／#7：各分類「刻意不做」的製作物（旗標 diagnostics.skipBlocks，字串＝前綴比對），
   *  例：MS 的 下蓋_*（只有圖沒案型）、ENG 的 Game 頭巾／IG Story（這個工具沒這些公版）。進資訊層，不報紅。 */
  function skipBlockPatterns() {
    const value = core().ProfileLoader?.getFlag?.('diagnostics.skipBlocks', undefined);
    return Array.isArray(value) ? value.map((item) => clean(item)).filter(Boolean) : [];
  }
  const isSkippedBlock = (name, patterns) => patterns.some((pattern) => clean(name).startsWith(pattern));

  function collectUnmatched(collector, AppState) {
    const patterns = skipBlockPatterns();
    const skipped = [];
    (AppState.unmatchedBatchItems || []).forEach((item) => {
      const reason = clean(item?.reason);
      const name = clean(item?.name);
      if (MUTED_UNMATCHED.test(name)) return;
      if (isSkippedBlock(name, patterns)) { skipped.push(name); return; }
      if (/空白/.test(reason)) collector.add('minor', '欄位空白', item?.name, reason);
      else collector.add('critical', '找不到公版', item?.name, reason);
    });
    if (skipped.length) collector.add('info', '刻意略過', `${[...new Set(skipped)].join('、')}`, '這個工具沒有這些公版（或只有圖、沒有案型），依設定不製作');
  }

  /** 第 15 題／2026-11-03 #4：CTA 由規則自己處理（文字層、或公版的 CTA 圖層自帶素材）時，core 仍會拿工單的 CTA 文字去找圖片而報缺，不是真的缺素材。 */
  function isCtaTextFalseAlarm(entry, template) {
    if (entry.field !== 'CTA' || !isMissingStatus(entry.status)) return false;
    const ctaLayers = Object.entries(template?.layers || {}).filter(([key, layer]) => layer && /cta|按鈕|button|立即領/i.test(`${key} ${layer.psdName || ''}`));
    if (!ctaLayers.length) return true; // 公版根本沒有 CTA 層（CTA 畫在背景裡，例：正式BN POPUP）→ 不是問題
    return ctaLayers.some(([, layer]) => layer.hidden !== true && (layer.type === 'text' ? !!clean(layer.text) : !!clean(layer.assetFilename)));
  }

  function collectAssetDiagnostics(collector, entries) {
    entries.forEach(({ item, index }) => {
      const list = Array.isArray(item.data?.batchDiagnostics) ? item.data.batchDiagnostics : [];
      list.forEach((entry) => {
        if (isCtaTextFalseAlarm(entry, item.data)) return;
        const detail = `${entry.field || ''}「${entry.value || ''}」${entry.target ? `（${entry.target}）` : ''}`;
        // 2026-11-03 #3：missing-layer＝公版根本沒有這個圖層（工單有填的內容不會出現），跟「檔案找不到」是兩回事
        if (entry.status === 'missing-layer') collector.add('important', '公版沒有這個圖層', item.name, `${detail} 內容不會出現`, index);
        else if (isMissingStatus(entry.status)) collector.add('critical', '素材缺少', item.name, detail, index);
        else if (entry.status === 'warning') collector.add('important', '素材退回預設', item.name, detail, index);
      });
    });
  }

  /** （二校二修 #3）上傳格（LineOA 的 KV 格／商品格、POPUP 格…）還是空的：圖會出，但那一格會是「+上傳」的空位。
   *  上傳後 layer.assetFilename 有值，下一次重畫診斷就自動消失。 */
  function collectEmptyUploadSlots(collector, entries) {
    entries.forEach(({ item, index }) => {
      const empty = Object.entries(item.data?.layers || {})
        .filter(([, layer]) => layer && layer.type === 'image' && layer.__uploadSlot === true && !layer.hidden && !clean(layer.assetFilename))
        .map(([key, layer]) => clean(layer.psdName || layer.name || key));
      if (!empty.length) return;
      collector.add('important', '還沒上傳圖', item.name, `${empty.join('、')}：這幾格還是空的，請點畫布上的「+上傳」補圖`, index);
    });
  }

  function collectPriceIssues(collector, entries) {
    entries.forEach(({ item, index }) => {
      const template = item.data || {};
      const layers = Object.values(template.layers || {});
      const priceLayers = layers.filter((layer) => layer?.source === PRICE_SOURCE);
      priceLayers.filter((layer) => !layer.hidden && !clean(layer.text)).forEach(() => collector.add('critical', '價格空白', item.name, '價格圖層沒有文字', index));
      const rawPrice = clean(template.pricePresetMeta?.rawPrice);
      const couponAsset = layers.find((layer) => layer?.type === 'image' && /券/.test(String(layer.assetFilename || '')));
      if (rawPrice && couponAsset && !priceLayers.some((layer) => !layer.hidden)) {
        collector.add('critical', '有價格卻沒顯示', item.name, `工單價格「${rawPrice}」，票券 ${couponAsset.assetFilename}`, index);
      }
    });
  }

  /** 單行寬度超過框寬 15% 以上才算（各引擎會自動換行／縮放，只抓明顯超出的）。 */
  function collectTextOverflow(collector, entries, Renderer) {
    if (typeof Renderer?.measureRenderedTextWidth !== 'function') return;
    const probe = document.createElement('canvas').getContext('2d');
    entries.forEach(({ item, index }) => {
      Object.entries(item.data?.layers || {}).forEach(([key, layer]) => {
        if (!layer || layer.type !== 'text' || layer.hidden || !(Number(layer.width) > 0) || !clean(layer.text)) return;
        // 價格層（auto_price_v2）由價格引擎自己縮放貼合，框寬不代表實際畫出來的寬度，不用這個方法檢查（IG_03 $350 誤報）。
        if (layer.source === 'auto_price_v2') return;
        try {
          const widest = clean(layer.text).split('\n').reduce((max, line) => Math.max(max, Number(Renderer.measureRenderedTextWidth({ ...layer, text: line }, probe)) || 0), 0);
          if (widest > Number(layer.width) * TEXT_OVERFLOW_TOLERANCE) {
            collector.add('important', '文字可能超出框', item.name, `${layer.psdName || key}：寬 ${Math.round(widest)}px，框 ${Math.round(layer.width)}px`, index);
          }
        } catch (_) { /* 量測失敗就不報 */ }
      });
    });
  }

  /** （2026-11-12 文案規則第一期）禁用語／字數／標點／數字格式／警語日期／蝦幣條件：規則在 config/copy-rules.js，檢查在 modules/copy-lint.js。 */
  function collectCopyLint(collector, entries) {
    const lint = window.CopyLint?.lintTemplate;
    if (typeof lint !== 'function') return;
    entries.forEach(({ item, index }) => {
      let issues = [];
      try { issues = lint(item.data) || []; } catch (_) { return; }
      issues.forEach((issue) => collector.add(issue.tier === 'critical' ? 'critical' : 'important', issue.kind, item.name, issue.detail, index));
    });
  }

  /** 同一個原因的略過列合成一條：「第 18、41、42 列」（超過 8 列只列前 8 列＋共幾列）。 */
  function collectSkippedRows(collector, AppState) {
    const byReason = new Map();
    const patterns = skipBlockPatterns();
    (AppState.batchDiagnostics?.skippedRows || []).forEach((row) => {
      const reason = clean(row.reason);
      if (MUTED_SKIP_REASON.test(reason)) return;
      if (patterns.length && patterns.some((pattern) => reason.includes(pattern))) return; // 刻意略過的製作物（#7），略過原因裡會帶名稱
      if (!byReason.has(reason)) byReason.set(reason, []);
      byReason.get(reason).push(row.row);
    });
    byReason.forEach((rows, reason) => {
      const shown = rows.slice(0, 8).join('、');
      const title = rows.length > 8 ? `第 ${shown}… 列（共 ${rows.length} 列）` : `第 ${shown} 列`;
      collector.add('minor', '略過的列', title, reason);
    });
  }

  function collectDuplicateNames(collector, entries) {
    const seen = new Map();
    entries.forEach(({ item }) => seen.set(item.name, (seen.get(item.name) || 0) + 1));
    [...seen.entries()].filter(([, count]) => count > 1).forEach(([name, count]) => collector.add('minor', '輸出名重複', name, `${count} 張同名，下載時會互相覆蓋或補 _2`));
  }

  function collectInfo(collector, AppState, entries) {
    const diag = AppState.batchDiagnostics || {};
    const stats = [
      diag.sheetName ? `分頁：${diag.sheetName}` : '',
      `製作內容標記：${diag.anchorCount || 0} 個`,
      `製作物區塊：${diag.parsedBlockCount || 0} 個`,
      `資料筆數：${diag.recordCount || 0} 筆`,
      `產出圖片：${entries.length} 張`,
      `目前載入公版：${(diag.sourceTemplateNames || []).join('、') || '無'}`,
    ].filter(Boolean);
    stats.forEach((line) => collector.add('info', '解析統計', line));
    (diag.warnings || []).forEach((message) => { if (!MUTED_WARNING.test(clean(message))) collector.add('important', '解析警告', message); });
    (diag.__exportNotes || []).forEach((note) => collector.add('info', '匯出備註', note));
  }

  function templateEntries(AppState) {
    return (AppState?.templates || []).map((item, index) => ({ item, index }));
  }

  /** 同步彙整（不載圖片）。 */
  function collect() {
    const { AppState, Renderer } = core();
    const collector = makeCollector();
    if (!AppState) return finish(collector);
    const entries = templateEntries(AppState);
    collectUnmatched(collector, AppState);
    collectAssetDiagnostics(collector, entries);
    collectEmptyUploadSlots(collector, entries);
    collectPriceIssues(collector, entries);
    collectTextOverflow(collector, entries, Renderer);
    collectCopyLint(collector, entries);
    collectSkippedRows(collector, AppState);
    collectDuplicateNames(collector, entries);
    collectInfo(collector, AppState, entries);
    return finish(collector);
  }

  /** 多檢查「素材比例被拉伸」：沒有 keepAspectRatio 的圖片層，框比例與圖片原始比例差 5% 以上。 */
  async function collectWithImages() {
    const report = collect();
    const { AppState, TemplateLoader } = core();
    if (!AppState || typeof TemplateLoader?.loadImagesForTemplate !== 'function') return report;
    for (const { item, index } of templateEntries(AppState)) {
      let images = {};
      try { images = await TemplateLoader.loadImagesForTemplate(item.data, { project: item.project }); } catch (_) { continue; }
      Object.entries(item.data?.layers || {}).forEach(([key, layer]) => {
        const image = images?.[key];
        if (!layer || layer.type !== 'image' || layer.hidden || layer.keepAspectRatio || !image?.naturalWidth || !image?.naturalHeight) return;
        const frameRatio = Number(layer.width) / Number(layer.height);
        const imageRatio = image.naturalWidth / image.naturalHeight;
        if (!Number.isFinite(frameRatio) || Math.abs(frameRatio - imageRatio) / imageRatio <= ASPECT_TOLERANCE) return;
        report.tiers.find((tier) => tier.id === 'important').items.push({ kind: '素材比例被拉伸', title: item.name, detail: `${layer.psdName || key}：框 ${Math.round(layer.width)}×${Math.round(layer.height)}，圖 ${image.naturalWidth}×${image.naturalHeight}`, templateIndex: index });
      });
    }
    report.total = report.tiers.reduce((sum, tier) => sum + tier.items.length, 0);
    return report;
  }

  function finish(collector) {
    const tiers = TIERS.map((tier) => ({ ...tier, items: collector.items[tier.id] }));
    return { tiers, total: tiers.reduce((sum, tier) => sum + tier.items.length, 0), generatedAt: new Date() };
  }

  function formatDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /** 一模一樣的訊息（同一種、同標題、同內容）合併成一條並標 ×N。 */
  function groupIdentical(items) {
    const groups = new Map();
    items.forEach((entry) => {
      const key = `${entry.kind}\u0001${entry.title}\u0001${entry.detail}`;
      if (groups.has(key)) groups.get(key).count += 1;
      else groups.set(key, { entry, count: 1 });
    });
    return [...groups.values()];
  }

  /** 純文字版（zip 內 診斷報告.txt）：條列、依四級分段。 */
  function text(report = collect()) {
    const { ProfileLoader, AppState } = core();
    const profile = ProfileLoader?.active;
    const toolName = ProfileLoader?.getFlag?.('ui.toolName', '') || '生成工具';
    const lines = [
      `${toolName} 診斷報告`,
      `產生時間：${formatDate(report.generatedAt || new Date())}`,
      `工具：${profile?.label || profile?.id || '—'}　分頁：${AppState?.batchDiagnostics?.sheetName || '—'}`,
      `摘要：${report.tiers.map((tier) => `${tier.label} ${tier.items.length}`).join(' ・ ')}`,
      '',
    ];
    report.tiers.forEach((tier) => {
      lines.push(`■ ${tier.label}（${tier.items.length}）— ${tier.hint}`);
      if (!tier.items.length) lines.push('  • 無');
      groupIdentical(tier.items).forEach(({ entry, count }) => lines.push(`  • [${entry.kind}] ${entry.title}${entry.detail ? `：${entry.detail}` : ''}${count > 1 ? `　×${count}` : ''}`));
      lines.push('');
    });
    return lines.join('\n');
  }

  window.DiagnosticsReport = Object.freeze({ TIERS, collect, collectWithImages, groupIdentical, text });
})();
