/* Template Rule Utils – small shared helpers for new modular rules. */
(function () {
  'use strict';

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim();
  const normalize = (value) => toText(value)
    .toLowerCase()
    .replace(/logo/gi, 'logo')
    .replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, '')
    .replace(/[＿－—–]/g, '');

  function findLayer(template, predicate) {
    return Object.values(template?.layers || {}).find(predicate) || null;
  }

  function findLayerByWords(template, { type = '', words = [] } = {}) {
    const wanted = words.map(normalize).filter(Boolean);
    return findLayer(template, (layer) => {
      if (type && layer?.type !== type) return false;
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''}`);
      return wanted.some((word) => label.includes(word));
    });
  }

  function setImageAsset(template, words, assetFilename) {
    const layer = findLayerByWords(template, { type: 'image', words });
    if (!layer) return false;
    layer.assetFilename = assetFilename;
    layer.hidden = false;
    layer.keepAspectRatio = true;
    return true;
  }

  function makeSolidRectFromLayer(layer, fill) {
    if (!layer) return null;
    const x = Number(layer.x || 0);
    const y = Number(layer.y || 0);
    const width = Number(layer.width || 0);
    const height = Number(layer.height || 0);
    return {
      ...layer,
      type: 'shape',
      psdName: layer.psdName || 'KV_BG',
      x,
      y,
      width,
      height,
      centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
      centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
      fill,
      shape: {
        kind: 'rectangle',
        fill,
        stroke: { enabled: false, width: 0, color: fill },
        pathBounds: {
          x,
          y,
          width,
          height,
          centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
          centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
        },
      },
    };
  }

  // ── 專案配色對照表 ──
  // 這裡刻意留空，作為開源起點。新專案若需要「依目前專案套用不同主標/副標顏色」，
  // 在這裡依樣式補上 { [normalize('專案名稱')]: { title: '#xxxxxx', subtitle: '#xxxxxx' } }，
  // 「目前專案」直接讀 window.AppState.currentProject（引擎既有的全域狀態，不需要改引擎）。
  const PROJECT_TEXT_COLORS = {
    // 範例（依需要取消註解並改成實際專案名稱/色碼）：
    // [normalize('4.17 直播日')]: { title: '#feff91', subtitle: '#fff600' },
  };

  function getCurrentProjectName(template) {
    // 批次 / All 模式下，每張圖會把自己的專案寫在 template.batchProject。
    // 重新預覽、下載 ZIP、價格重建時，AppState.currentProject 可能已經回到「All」，
    // 所以顏色判斷必須優先讀 template.batchProject，不能只看全域 currentProject。
    return String(
      template?.batchProject
      || template?.batchRecord?.__project
      || window.AppState?.currentProject
      || ''
    ).trim();
  }

  // 依「該張圖所屬專案」把主標題／副標題文字顏色套到該公版的主標/副標圖層。
  // 找不到對應專案的配色，或該公版沒有主標/副標圖層時，安全地不做任何事（不會報錯）。
  function applyColorToTextLayer(layer, color) {
    if (!layer || !color) return false;
    layer.color = color;

    // PSD 匯出的文字常會帶 textStyleRanges；Renderer 繪製時會優先使用 range.color。
    // 因此只改 layer.color 不足以覆蓋畫面，需要同步更新每一段樣式。
    if (Array.isArray(layer.textStyleRanges)) {
      layer.textStyleRanges.forEach((range) => {
        if (!range || typeof range !== 'object') return;
        range.color = color;
        range.fill = color;
        if (range.style && typeof range.style === 'object') {
          range.style.color = color;
          range.style.fill = color;
        }
      });
    }
    return true;
  }

  function applyProjectTextColors(template) {
    const projectKey = normalize(getCurrentProjectName(template));
    const colors = PROJECT_TEXT_COLORS[projectKey];
    if (!colors) return false;
    const titleLayer = findLayerByWords(template, { type: 'text', words: ['主標', '主標題', 'title'] });
    const subtitleLayer = findLayerByWords(template, { type: 'text', words: ['副標', '副標題', 'subtitle'] });
    const titleApplied = applyColorToTextLayer(titleLayer, colors.title);
    const subtitleApplied = applyColorToTextLayer(subtitleLayer, colors.subtitle);
    return Boolean(titleApplied || subtitleApplied);
  }

  // ── LOGO 素材判斷 ──
  // 若新專案的工單「LOGO：xxx」欄位是文字說明（不是檔名），需要依內容文字判斷要套用哪個
  // 共用LOGO素材，可仿照下面範例寫一個 resolveLogoAssetFilename()，回傳對應的 assetFilename，
  // 再用 setImageAsset(template, ['logo'], assetFilename) 套用到LOGO圖層即可：
  //
  // function resolveLogoAssetFilename(logoText) {
  //   const text = toText(logoText);
  //   if (text.includes('某個關鍵字')) return '某個LOGO.svg';
  //   return '';
  // }



  function findLayerEntryByExactName(template, name) {
    const wanted = String(name || '').trim();
    if (!wanted) return null;
    return Object.entries(template?.layers || {}).find(([key, layer]) => (
      key === wanted || String(layer?.psdName || '').trim() === wanted
    )) || null;
  }

  function setLayerVisibility(template, names, visible) {
    let changed = false;
    (Array.isArray(names) ? names : [names]).forEach((name) => {
      const entry = findLayerEntryByExactName(template, name);
      if (!entry) return;
      entry[1].hidden = !visible;
      changed = true;
    });
    return changed;
  }

  function setLayerCenterX(layer, centerX) {
    if (!layer) return false;
    const width = Math.max(0, Number(layer.width || 0));
    layer.x = Number(centerX || 0) - width / 2;
    layer.centerX = Number(centerX || 0);
    return true;
  }

  function resizeCapsuleLayer(layer, { width, centerX } = {}) {
    if (!layer || !Number.isFinite(Number(width))) return false;
    const height = Math.max(1, Number(layer.height || layer.shape?.pathBounds?.height || 1));
    const nextWidth = Math.max(height, Number(width));
    const nextCenterX = Number.isFinite(Number(centerX))
      ? Number(centerX)
      : Number.isFinite(Number(layer.centerX))
        ? Number(layer.centerX)
        : Number(layer.x || 0) + Number(layer.width || 0) / 2;
    layer.width = nextWidth;
    layer.height = height;
    layer.x = nextCenterX - nextWidth / 2;
    layer.centerX = nextCenterX;
    layer.centerY = Number.isFinite(Number(layer.centerY))
      ? Number(layer.centerY)
      : Number(layer.y || 0) + height / 2;
    layer.radius = height / 2;
    layer.useDynamicBounds = true;
    layer.hidden = false;
    // 動態膠囊不能保留 PSD 匯出的舊 geometry / vectorPath。
    // 否則部分 ShapeRenderer 路徑仍會使用初始 bbox，造成 layer.width 已更新但畫面寬度不變。
    const liveBounds = {
      x: layer.x,
      y: Number(layer.y || 0),
      width: nextWidth,
      height,
      centerX: nextCenterX,
      centerY: layer.centerY,
    };
    layer.shape = {
      ...(layer.shape && typeof layer.shape === 'object' ? layer.shape : {}),
      kind: 'roundedRectangle',
      fill: layer.shape?.fill || layer.fill,
      stroke: layer.shape?.stroke || null,
      cornerRadius: height / 2,
      pathBounds: liveBounds,
      geometry: {
        kind: 'roundedRectangle',
        bbox: liveBounds,
        transform: { rotationDeg: Number(layer.rotation || 0) },
      },
      vectorPath: [],
      bezierPoints: [],
      hasVectorData: false,
    };
    layer.__dynamicCapsule = true;
    return true;
  }

  function resolveSubtitleVariant(value) {
    const text = toText(value).replace(/\s+/g, '');
    if (!text) return { type: 'empty', text: '', suffix: '' };
    if (/VIP/i.test(text)) {
      return { type: 'vip', text, suffix: text.replace(/VIP/ig, '').trim() };
    }
    if (text.includes('蝦皮直營')) {
      return { type: 'direct', text, suffix: text.replace('蝦皮直營', '').trim() };
    }
    return { type: 'normal', text, suffix: text };
  }

  window.TemplateRuleUtils = Object.freeze({
    toText,
    normalize,
    findLayer,
    findLayerByWords,
    setImageAsset,
    makeSolidRectFromLayer,
    getCurrentProjectName,
    applyColorToTextLayer,
    applyProjectTextColors,
    findLayerEntryByExactName,
    setLayerVisibility,
    setLayerCenterX,
    resizeCapsuleLayer,
    resolveSubtitleVariant,
  });
})();
