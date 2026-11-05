/* 整合版（18節）— 自動縮小 $、%、折、蝦幣、起（文字標準）
 *
 * 2026-10-06 回饋第 2 項。使用者決定：會員日系列（KOL×2／暖身BN／正式BN／MS／KV）開；$／%／折／蝦幣／起 一律 82%（只縮符號與單位字，數字不動）；
 * 2026-11-05：「蝦幣」只在「數字%蝦幣」（18%蝦幣）時縮「%蝦幣」；價格就是「蝦幣山」「蝦幣堆」這種商品名時不縮。
 * 主標／副標／法務與價格層用同一個比例；黃金樣本改以新輸出為基準（舊的保留在 tests/golden-legacy/ 對照）。
 *
 * 【這一項會改變自動產圖的輸出】旗標 text.autoShrinkSymbols=true 的分類才生效，其餘工具零誤差不變。
 *
 * 做法：
 *   1. 每次主畫布／縮圖／輸出畫圖前（Renderer.render、renderSceneTo），把每個文字層的 textStyleRanges 重建：
 *      以原本的 ranges（18節 只用顏色）為底，逐字分類 big／small，小字 fontSizePx＝圖層字級×0.82；標記 __spShrink 以便重算時先還原。
 *   2. 18節 的文字引擎（A 系原文與 B 系 colorOnly）都只讀 ranges 的顏色；這裡以同一套 segment 函式包住兩個血緣的
 *      Renderer.getTextStyleSegments／measureTextSegments／drawStyledTextLine：有小字時逐段換字級，並對齊基線
 *      （textBaseline=top 時小字往下移 大字 ascent − 小字 ascent），寬度量測（膠囊、對齊）也用同一套。
 *   3. 25節 的 rules/shared/sp-text-standard.js 僅借用比例常數（TITLE_SMALL_RATIO=0.82），詞庫由本模組依使用者清單定義。
 */
(function initSpTextShrink() {
  'use strict';

  const core = () => ({ AppState: window.AppState, Renderer: window.Renderer });
  const flag = (name, fallback) => { const value = window.ProfileLoader?.getFlag?.(name, undefined); return value === undefined || value === null ? fallback : value; };

  const SMALL_RATIO = 0.82;
  const SMALL_SYMBOLS = new Set(['%', '％', '$', '＄', ',', '，', '﹐', '︐']);
  const DEFAULT_SMALL_TOKENS = ['蝦幣', '折', '起'];
  const isDigit = (ch) => ch >= '0' && ch <= '9';
  const round2 = (n) => Math.round(Number(n) * 100) / 100;

  // ── 1. 逐字分類 → ranges ──
  const isPriceLayer = (layer, key) => !!layer && (layer.source === 'auto_price_v2' || /價格|price/i.test(String(key || layer.__layerKey || '')));

  /** 逐字分類。價格層：符號＋詞庫（蝦幣／折／起）都縮；主標／副標／法務（非價格層）：只縮符號，詞庫不縮，
   *  而且「%蝦幣」整組不縮（2026-10-06 使用者回饋）。 */
  function classify(text, tokens) {
    const chars = [...String(text || '')];
    const sizes = new Array(chars.length).fill('big');
    const followedBy = (index, word) => [...word].every((wc, offset) => chars[index + 1 + offset] === wc);
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i];
      if ((ch === '%' || ch === '％') && !tokens.length && followedBy(i, '蝦幣')) continue; // 主標／副標的「%蝦幣」整組維持原字級
      if (SMALL_SYMBOLS.has(ch) || (ch === '號' && i > 0 && isDigit(chars[i - 1]))) { sizes[i] = 'small'; continue; }
      for (const token of tokens) {
        const tokenChars = [...token];
        // 價格層的「蝦幣」只有在「數字%蝦幣」（例如 18%蝦幣）才縮；「蝦幣山」「蝦幣堆」這種整個就是商品名的不縮（2026-11-05 使用者決定）
        if (token === '蝦幣' && !(i > 0 && (chars[i - 1] === '%' || chars[i - 1] === '％') && i > 1 && isDigit(chars[i - 2]))) continue;
        if (tokenChars.length && tokenChars.every((tc, offset) => chars[i + offset] === tc)) {
          for (let k = 0; k < tokenChars.length; k += 1) sizes[i + k] = 'small';
          i += tokenChars.length - 1;
          break;
        }
      }
    }
    return { chars, sizes };
  }

  /** 以 UTF-16 位移為單位（textStyleRanges 的 from／to 都是 UTF-16），把分類結果切成 ranges；顏色沿用原本 ranges 該位置的顏色。 */
  function buildRanges(layer, tokens, key) {
    const text = String(layer.text || '');
    if (!text) return null;
    const { chars, sizes } = classify(text, isPriceLayer(layer, key) ? tokens : []);
    if (!sizes.includes('small')) return null;
    const bigPx = round2(Number(layer.fontSizePx || layer.fontSizePt) || 24);
    const smallPx = round2(bigPx * SMALL_RATIO);
    const original = Array.isArray(layer.__spShrinkOriginalRanges) ? layer.__spShrinkOriginalRanges : (Array.isArray(layer.textStyleRanges) ? layer.textStyleRanges : []);
    const colorAt = (offset) => {
      const range = original.find((item) => Number(item?.from) <= offset && offset < Number(item?.to));
      return range ? (range.color || range.fill || range.style?.color || range.style?.fill || null) : null;
    };
    const ranges = [];
    let offset = 0;
    chars.forEach((ch, index) => {
      const from = offset; const to = offset + ch.length; offset = to;
      const size = sizes[index];
      const color = colorAt(from);
      const last = ranges[ranges.length - 1];
      if (last && last.__size === size && last.__color === color && last.to === from) { last.to = to; return; }
      const range = { from, to, fontSizePx: size === 'small' ? smallPx : bigPx, __spShrink: true, __size: size, __color: color };
      if (color) { range.color = color; range.fill = color; }
      ranges.push(range);
    });
    return ranges;
  }

  function applyLayer(layer, tokens, key) {
    if (!layer || layer.type !== 'text') return false;
    // 先還原成「本模組介入前」的 ranges，再依目前文字／字級重建（文字或字級改了就會跟著變；沒有符號就恢復原狀）。
    if (Array.isArray(layer.textStyleRanges) && layer.textStyleRanges.some((range) => range?.__spShrink)) {
      layer.textStyleRanges = Array.isArray(layer.__spShrinkOriginalRanges) ? layer.__spShrinkOriginalRanges.map((range) => ({ ...range })) : undefined;
      if (layer.textStyleRanges === undefined) delete layer.textStyleRanges;
    }
    const ranges = buildRanges(layer, tokens, key);
    if (!ranges) {
      delete layer.__spShrinkOriginalRanges;
      if (layer.__spShrinkSetVerticalAlign) { delete layer.styledTextVerticalAlign; delete layer.__spShrinkSetVerticalAlign; }
      return false;
    }
    // 原 ranges 存成可列舉欄位：clone（縮圖快照、歷史、存檔）之後仍能還原，不會把原本的顏色分段弄丟。
    if (!Array.isArray(layer.__spShrinkOriginalRanges)) layer.__spShrinkOriginalRanges = Array.isArray(layer.textStyleRanges) ? layer.textStyleRanges.map((range) => ({ ...range })) : [];
    layer.textStyleRanges = ranges;
    // B 系 legacy 引擎讀這個旗標：混合字級時以最大字級分段的墨水底端為全行底線（25節 規格：小字貼下緣）。
    if (!layer.styledTextVerticalAlign) { layer.styledTextVerticalAlign = 'source-baseline'; layer.__spShrinkSetVerticalAlign = true; }
    return true;
  }

  function applyTemplate(template) {
    if (!template?.layers) return 0;
    const tokens = flag('text.autoShrinkTokens', DEFAULT_SMALL_TOKENS);
    let count = 0;
    Object.entries(template.layers).forEach(([key, layer]) => { if (applyLayer(layer, tokens, key)) count += 1; });
    return count;
  }

  // ── 2. 字級感知的 segment／量測／繪製 ──
  const hasShrink = (layer) => Array.isArray(layer?.textStyleRanges) && layer.textStyleRanges.some((range) => range?.__spShrink);
  const fontWithSize = (font, size) => String(font || '').replace(/(\d+(?:\.\d+)?)px/, `${size}px`);

  /** 這段文字在這個字型下的墨水上下緣（actualBoundingBox）；25節 的 source-baseline 以「最大字級分段的墨水底端」為全行底線。
   *  不快取：網頁字型可能還在載入，快取到替代字型的度量會讓之後每次重畫都錯（且不同時機結果不同）。 */
  function inkMetrics(canvasCtx, font, text) {
    const saved = canvasCtx.font;
    canvasCtx.font = font;
    canvasCtx.save(); canvasCtx.textBaseline = 'alphabetic';
    const metrics = canvasCtx.measureText(text || '國');
    canvasCtx.restore();
    canvasCtx.font = saved;
    // 同一段文字改用 textBaseline=top 量：actualBoundingBoxAscent 是「墨水頂端在 top 對齊點之上多少」（通常是負的一兩 px）。
    // 兩者相減就是「以 top 畫在 y 時，alphabetic 基線在 y 下方多少」——不能用 fontBoundingBoxAscent 推（Canvas 的 top 用的是
    // em 框頂，和字型 bbox 的 ascent 不同，ShopeeNotoSans 差了 13px，整行會往下掉）。
    canvasCtx.font = font;
    canvasCtx.save(); canvasCtx.textBaseline = 'top';
    const topMetrics = canvasCtx.measureText(text || '國');
    canvasCtx.restore();
    canvasCtx.font = saved;
    const ascent = Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : parseFloat(font) * 0.8;
    const topAscent = Number.isFinite(topMetrics.actualBoundingBoxAscent) ? topMetrics.actualBoundingBoxAscent : -parseFloat(font) * 0.08;
    return {
      ascent,
      descent: Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : parseFloat(font) * 0.1,
      baselineBelowTop: ascent - topAscent, // 以 top 畫在 y → alphabetic 基線 = y + baselineBelowTop
    };
  }

  /** 這一行的 segments：顏色沿用原 segment 函式的結果，字級取 __spShrink range 的 fontSizePx。 */
  function segmentsWithSizes(layer, line, lineStartOffset, baseSegments) {
    const text = String(line || '');
    const ranges = (layer.textStyleRanges || []).filter((range) => range?.__spShrink);
    const layerPx = Number(layer.fontSizePx || 24);
    const sizeAt = (offset) => { const range = ranges.find((item) => item.from <= offset && offset < item.to); return range ? Number(range.fontSizePx) : layerPx; };
    // 原 segments 的顏色邊界
    const colorAt = []; let cursor = 0;
    baseSegments.forEach((segment) => { const length = String(segment.text || '').length; for (let i = 0; i < length; i += 1) colorAt[cursor + i] = segment.color; cursor += length; });
    const segments = [];
    for (let i = 0; i < text.length; i += 1) {
      const size = sizeAt(lineStartOffset + i);
      const color = colorAt[i] || baseSegments[0]?.color || layer.color || '#000000';
      const last = segments[segments.length - 1];
      if (last && last.fontSizePx === size && last.color === color) { last.text += text[i]; continue; }
      segments.push({ text: text[i], color, fontSizePx: size, __spShrink: true });
    }
    return segments;
  }

  /**
   * 整行排版（2026-10-30 封測回饋：縮小的符號前面會多一段空隙）。
   * 舊做法是「小字縮在自己原本的格子裡」——$ 的格子還是原字級寬，縮小後貼右、左邊就空出一塊，視覺字距跟其他字不一樣。
   * 改成真正重排：大字以原字級、小字以縮小後的實際寬度依序往右排，前後字緊接，整行寬度也跟著變窄；
   * 置中／靠右對齊用重排後的寬度算。大字連續的一串仍整串量（保留 kerning）；小字寬度用「大字字型量 × 比例」推算
   * （向量字型線性縮放；大字字型此刻一定已載入，小字字型若還在載入會量到替代字型）。
   * 回傳每個字的起點（相對行首）、每個字的字級與整行寬度。
   */
  function lineLayout(canvasCtx, segments, letterSpacing) {
    const spacing = Number(letterSpacing || 0);
    const baseFont = canvasCtx.font;
    const bigPx = segments.reduce((max, segment) => Math.max(max, Number(segment.fontSizePx || 0)), 0) || parseFloat(baseFont) || 24;
    const bigFont = fontWithSize(baseFont, bigPx);
    const chars = []; const starts = []; const sizes = [];
    let x = 0;
    canvasCtx.font = bigFont;
    segments.forEach((segment) => {
      const text = [...String(segment.text || '')];
      if (!text.length) return;
      const px = Number(segment.fontSizePx || bigPx);
      const ratio = px / bigPx;
      if (!spacing && ratio === 1) {
        // 大字一串：prefix 寬度含 kerning，和原本整行 fillText 的字位置一致
        let prefix = '';
        text.forEach((ch) => { chars.push(ch); sizes.push(px); starts.push(x + canvasCtx.measureText(prefix).width); prefix += ch; });
        x += canvasCtx.measureText(prefix).width;
        return;
      }
      // 小字（或有字距時的任何字）逐字排：每個字後面加字距，最後再把結尾多加的那一個扣掉
      text.forEach((ch) => { chars.push(ch); sizes.push(px); starts.push(x); x += canvasCtx.measureText(ch).width * ratio + spacing; });
    });
    if (spacing && chars.length) x -= spacing;
    canvasCtx.font = baseFont;
    return { chars, starts, sizes, width: Math.max(0, x), bigPx, bigFont };
  }

  function measureSegments(canvasCtx, segments, letterSpacing) {
    return lineLayout(canvasCtx, segments, letterSpacing).width;
  }

  /** 字級感知繪製（A 系原文 top 基線、B 系 legacy 都走這裡）：
   *  - 大字：以原字級畫在重排後的位置（同一串大字仍整串 fillText，保留 kerning）
   *  - 小字：縮小後緊接前一個字，墨水底端切齊大字底端（25節 source-baseline） */
  function drawSegments(canvasCtx, segments, x, y, align, letterSpacing, fallbackColor) {
    const visible = segments.filter((segment) => String(segment.text || '').length);
    if (!visible.length) return;
    const baseFont = canvasCtx.font;
    const savedAlign = canvasCtx.textAlign; const savedFill = canvasCtx.fillStyle; const savedBaseline = canvasCtx.textBaseline;
    const layout = lineLayout(canvasCtx, visible, letterSpacing);
    const lineStart = align === 'right' ? x - layout.width : align === 'center' ? x - layout.width / 2 : x;
    const { bigPx, bigFont } = layout;
    const refInk = inkMetrics(canvasCtx, bigFont, visible.map((segment) => segment.text).join(''));
    // 原本以 top 基線畫在 y：大字的 alphabetic 基線 = y + baselineBelowTop（實測換算）；墨水底端 = 基線 + descent。
    const baselineY = savedBaseline === 'alphabetic' ? y : y + refInk.baselineBelowTop;
    const inkBottomY = baselineY + refInk.descent;
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'alphabetic';
    let charIndex = 0;
    visible.forEach((segment) => {
      const text = String(segment.text || '');
      const chars = [...text];
      const px = Number(segment.fontSizePx || bigPx);
      canvasCtx.fillStyle = segment.color || fallbackColor;
      if (px >= bigPx) {
        canvasCtx.font = bigFont;
        if (!Number(letterSpacing || 0)) canvasCtx.fillText(text, lineStart + layout.starts[charIndex], baselineY);
        else chars.forEach((ch, i) => canvasCtx.fillText(ch, lineStart + layout.starts[charIndex + i], baselineY));
        charIndex += chars.length;
        return;
      }
      const ratio = px / bigPx;
      canvasCtx.font = bigFont;
      const descents = chars.map((ch) => inkMetrics(canvasCtx, bigFont, ch).descent * ratio);
      canvasCtx.font = fontWithSize(baseFont, px);
      chars.forEach((ch, i) => canvasCtx.fillText(ch, lineStart + layout.starts[charIndex + i], inkBottomY - descents[i]));
      charIndex += chars.length;
    });
    canvasCtx.font = baseFont; canvasCtx.textAlign = savedAlign; canvasCtx.fillStyle = savedFill; canvasCtx.textBaseline = savedBaseline;
  }

  // ── 3. 接線 ──
  function wire() {
    const { Renderer } = core();
    if (!Renderer || Renderer.__spTextShrinkWired) return;
    Renderer.__spTextShrinkWired = true;
    if (flag('text.autoShrinkSymbols', false) !== true) return;

    // 規則檔在 afterApplyRecordToTemplate 量文字寬度決定字級／膠囊（例如 HBN 標題縮放）——要在它量之前就先把符號縮好，
    // 否則產圖當下量到的是未縮的寬度、點縮圖重新套版時又量到縮過的，兩次結果不同。
    const BatchManager = window.BatchManager;
    if (BatchManager && typeof BatchManager.applyTemplateRuleHook === 'function' && !BatchManager.__spTextShrinkHooked) {
      BatchManager.__spTextShrinkHooked = true;
      const originalHook = BatchManager.applyTemplateRuleHook;
      BatchManager.applyTemplateRuleHook = function applyTemplateRuleHookWithShrink(hookName, template, ...rest) {
        if (hookName === 'afterApplyRecordToTemplate') applyTemplate(template);
        return originalHook.call(this, hookName, template, ...rest);
      };
    }
    const originalRender = Renderer.render;
    Renderer.render = function renderWithShrink(...args) { applyTemplate(core().AppState?.template); return originalRender.apply(this, args); };
    const originalSceneTo = Renderer.renderSceneTo;
    Renderer.renderSceneTo = function renderSceneToWithShrink(canvasCtx, template, ...rest) { applyTemplate(template || core().AppState?.template); return originalSceneTo.call(this, canvasCtx, template, ...rest); };

    // 舊核心（暖正MS V3.7.3）的 drawText 不看 textStyleRanges、整行 fillText（drawTextLine）：
    // 包住 drawText 記住目前圖層與行位移，drawTextLine 遇到有小字的圖層就改走字級感知繪製。
    const lineState = { layer: null, offset: 0 };
    // drawText 與 drawTextContent（暖正MS 的陰影 pass 直接呼叫後者）都要記住圖層，陰影才會和縮過的字對齊。
    ['drawText', 'drawTextContent'].forEach((name) => {
      if (typeof Renderer[name] !== 'function') return;
      const original = Renderer[name];
      Renderer[name] = function drawTextTrackingLines(canvasCtx, key, layer, ...rest) {
        const previous = { ...lineState };
        lineState.layer = layer; lineState.offset = 0;
        try { return original.call(this, canvasCtx, key, layer, ...rest); }
        finally { lineState.layer = previous.layer; lineState.offset = previous.offset; }
      };
    });
    const originalDrawTextLine = Renderer.drawTextLine;
    Renderer.drawTextLine = function drawTextLineWithShrink(canvasCtx, text, x, y, align = 'center', letterSpacing = 0, ...rest) {
      const layer = lineState.layer;
      const line = String(text || '');
      const offset = lineState.offset;
      lineState.offset += line.length + 1;
      if (!layer || !hasShrink(layer) || !line) return originalDrawTextLine.call(this, canvasCtx, text, x, y, align, letterSpacing, ...rest);
      const segments = segmentsWithSizes(layer, line, offset, [{ text: line, color: canvasCtx.fillStyle }]);
      if (new Set(segments.map((segment) => segment.fontSizePx)).size < 2) return originalDrawTextLine.call(this, canvasCtx, text, x, y, align, letterSpacing, ...rest);
      return drawSegments(canvasCtx, segments, x, y, align, letterSpacing, canvasCtx.fillStyle);
    };

    const originalSegments = Renderer.getTextStyleSegments;
    Renderer.getTextStyleSegments = function getTextStyleSegmentsWithSizes(layer, line, lineStartOffset = 0, ...rest) {
      const base = originalSegments.call(this, layer, line, lineStartOffset, ...rest);
      if (!hasShrink(layer) || !String(line || '')) return base;
      return segmentsWithSizes(layer, line, lineStartOffset, base);
    };
    const originalMeasure = Renderer.measureTextSegments;
    Renderer.measureTextSegments = function measureTextSegmentsWithSizes(canvasCtx, segments = [], letterSpacing = 0, ...rest) {
      if (!segments.some((segment) => segment?.__spShrink)) return originalMeasure.call(this, canvasCtx, segments, letterSpacing, ...rest);
      return measureSegments(canvasCtx, segments, letterSpacing);
    };
    // A 系 drawStyledTextLine 與 B 系 legacy 的 drawStyledTextLineLegacy 都改走同一套（才有「大字不位移」）。
    ['drawStyledTextLine', 'drawStyledTextLineLegacy'].forEach((name) => {
      if (typeof Renderer[name] !== 'function') return;
      const originalDraw = Renderer[name];
      Renderer[name] = function drawStyledTextLineWithSizes(canvasCtx, segments = [], x, y, align = 'center', letterSpacing = 0, fallbackColor = '#000000', ...rest) {
        const sizes = new Set(segments.map((segment) => segment?.fontSizePx).filter(Boolean));
        if (sizes.size < 2 || !segments.some((segment) => segment?.__spShrink)) return originalDraw.call(this, canvasCtx, segments, x, y, align, letterSpacing, fallbackColor, ...rest);
        return drawSegments(canvasCtx, segments, x, y, align, letterSpacing, fallbackColor);
      };
    });

    // 寬度量測（膠囊底色、置中）不需要包：小字佔原字級的格子，整行寬度與沒縮之前相同。
  }

  const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
  whenReady();

  window.SpTextShrink = Object.freeze({ applyTemplate, classify });
})();
