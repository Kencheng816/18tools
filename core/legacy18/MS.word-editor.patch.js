/* ════════════════════════════════════════════════════════════════
   V3.1-M2  Word 風格文字工具列 + 游標修復 — 功能補丁
   ────────────────────────────────────────────────────────────────
   【修復】drawTextCaret 原本在 app.js 中被呼叫但從未定義，
           導致 render loop 在編輯文字時拋出 TypeError，
           使後續圖層全部停止繪製（視覺上「消失」）。
           本補丁正確實作此函式：
           · 計算文字末端座標，繪製閃爍 I-beam 游標
           · render loop 不再崩潰，所有圖層正常顯示
   ════════════════════════════════════════════════════════════════ */
(function patchWordTextEditor() {

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyPatch, 0);
    });
  } else {
    setTimeout(applyPatch, 0);
  }

  function applyPatch() {

    // ── 輔助：取得目前選取的圖層物件 ──
    function activeLayer() {
      if (!window.AppState || !AppState.template) return null;
      const key = AppState.selectedLayers && AppState.selectedLayers[0];
      return key ? (AppState.template.layers && AppState.template.layers[key]) : null;
    }

    // ══════════════════════════════════════════════════════════
    // ① 修復：實作 Renderer.drawTextCaret()
    //    原本未定義 → render loop 在此崩潰 → 後續圖層消失
    //    現在：正確計算游標位置並繪製閃爍 I-beam
    // ══════════════════════════════════════════════════════════
    if (window.Renderer) {
      Renderer.drawTextCaret = function (canvasCtx, key, layer) {
        if (!AppState.caretVisible) return;          // 閃爍：不可見期間直接跳過

        // 取得目前顯示中的文字（編輯暫存 or 圖層原始）
        const text = (AppState.editingLayerKey === key)
          ? (AppState.editingText || '')
          : (layer.text || '');

        canvasCtx.save();
        canvasCtx.font = this.font(layer);
        canvasCtx.textBaseline = 'top';

        const lines      = String(text).split('\n');
        const fontSize   = layer.fontSizePx || 24;
        const lineHeight = layer.lineHeight  || fontSize * 1.05;
        const lastLine   = lines[lines.length - 1] || '';
        const lineIndex  = lines.length - 1;

        // 游標 X：最後一行文字末端
        const lastLineW  = canvasCtx.measureText(lastLine).width;
        let caretX;
        if      (layer.align === 'left')   caretX = layer.x + lastLineW;
        else if (layer.align === 'right')  caretX = layer.x + layer.width;
        else                               caretX = layer.x + layer.width / 2 - canvasCtx.measureText(text.split('\n')[lineIndex] || '').width / 2 + lastLineW;

        // 游標 Y：對應行的頂端
        const startY  = layer.y + Math.max(0, (layer.height - lines.length * lineHeight) / 2);
        const caretY  = startY + lineIndex * lineHeight;
        const caretH  = fontSize * 1.1;

        // 繪製 I-beam（用圖層顏色，加對比描邊增加可讀性）
        const caretColor = layer.color || '#ffffff';
        canvasCtx.strokeStyle = caretColor;
        canvasCtx.lineWidth   = Math.max(1.5, fontSize * 0.06);
        canvasCtx.lineCap     = 'round';
        canvasCtx.beginPath();
        canvasCtx.moveTo(caretX, caretY);
        canvasCtx.lineTo(caretX, caretY + caretH);
        canvasCtx.stroke();

        canvasCtx.restore();
      };
    }

    // ══════════════════════════════════════════════════════════
    // ② 覆寫 Renderer.font()：支援 italic / fontFamily
    // ══════════════════════════════════════════════════════════
    if (window.Renderer) {
      Renderer.font = function (layer) {
        const style  = layer.fontStyle === 'italic' ? 'italic ' : '';
        const weight = layer.fontWeight || 400;
        const size   = layer.fontSizePx || 24;
        const family = layer.fontFamily
          ? `"${layer.fontFamily}","ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif`
          : '"ShopeeNotoSans Content","Noto Sans TC","Microsoft JhengHei",sans-serif';
        return `${style}${weight} ${size}px ${family}`;
      };
    }

    // ══════════════════════════════════════════════════════════
    // ③ 覆寫 Inspector.render()：同步 Word 工具列控件狀態
    // ══════════════════════════════════════════════════════════
    if (window.Inspector) {
      const _origRender = Inspector.render.bind(Inspector);
      Inspector.render = function () {
        _origRender();
        const layer = activeLayer();
        if (!layer || layer.type !== 'text') return;

        const fontFamilyEl     = document.getElementById('fontFamilyInput');
        const boldBtn          = document.getElementById('boldBtn');
        const italicBtn        = document.getElementById('italicBtn');
        const underlineBtn     = document.getElementById('underlineBtn');
        const lineHeightEl     = document.getElementById('lineHeightInput');
        const letterSpacingEl  = document.getElementById('letterSpacingInput');
        const sizeEl           = document.getElementById('fontSizeInput');

        if (fontFamilyEl)    fontFamilyEl.value = layer.fontFamily || 'ShopeeNotoSans Content';
        if (boldBtn)         boldBtn.classList.toggle('active',     Number(layer.fontWeight || 400) >= 700);
        if (italicBtn)       italicBtn.classList.toggle('active',   layer.fontStyle === 'italic');
        if (underlineBtn)    underlineBtn.classList.toggle('active', !!(layer.textDecoration && layer.textDecoration.includes('underline')));
        if (lineHeightEl)    lineHeightEl.value    = layer.lineHeightMultiplier != null ? layer.lineHeightMultiplier : '';
        if (letterSpacingEl) letterSpacingEl.value = layer.letterSpacing != null ? layer.letterSpacing : '';
        if (sizeEl)          sizeEl.value          = layer.fontSizePx || 24;
      };
    }

    // ══════════════════════════════════════════════════════════
    // ④ 覆寫 Inspector.applyTextFromInputs()：寫入所有新屬性
    // ══════════════════════════════════════════════════════════
    if (window.Inspector) {
      Inspector.applyTextFromInputs = function () {
        const layer = activeLayer();
        if (!layer || layer.type !== 'text' || layer.locked) return;

        const v = (id) => document.getElementById(id);

        // 僅在值真正改變時才推入 history，避免每次輸入都塞一筆
        const prevText = layer.text;
        const prevSize = layer.fontSizePx;
        const prevColor = layer.color;
        const prevFamily = layer.fontFamily;

        if (v('textInput'))     layer.text       = v('textInput').value;
        if (v('fontSizeInput')) { layer.fontSizePx = Number(v('fontSizeInput').value) || layer.fontSizePx || 24; layer.fontSizePt = layer.fontSizePx; }
        if (v('colorInput'))    layer.color      = v('colorInput').value || layer.color;
        if (v('fontFamilyInput') && v('fontFamilyInput').value) layer.fontFamily = v('fontFamilyInput').value;

        const lhEl = v('lineHeightInput');
        if (lhEl && lhEl.value !== '') {
          const m = parseFloat(lhEl.value);
          if (!isNaN(m)) { layer.lineHeightMultiplier = m; layer.lineHeight = (layer.fontSizePx || 24) * m; }
        } else if (lhEl && lhEl.value === '') {
          // 清空行高：恢復自動
          delete layer.lineHeightMultiplier;
          delete layer.lineHeight;
        }

        const lsEl = v('letterSpacingInput');
        if (lsEl && lsEl.value !== '') {
          const sp = parseFloat(lsEl.value);
          if (!isNaN(sp)) layer.letterSpacing = sp;
        } else if (lsEl && lsEl.value === '') {
          delete layer.letterSpacing;
        }

        // 字型 / 字色變更時才推入 history（文字輸入則由 TextEditor.commit 處理）
        if (layer.fontSizePx !== prevSize || layer.color !== prevColor || layer.fontFamily !== prevFamily) {
          if (window.HistoryManager) HistoryManager.push();
        }

        if (layer.source === 'auto_price_v2' && window.PriceTransformEngine) {
          PriceTransformEngine.captureManualPriceTransform(AppState.selectedLayers?.[0], layer);
        }
        if (window.Renderer) Renderer.render();
      };
    }

    // ══════════════════════════════════════════════════════════
    // ⑤ 覆寫 Renderer.drawText()：支援字距（逐字元繪製）
    // ══════════════════════════════════════════════════════════
    if (window.Renderer) {
      const _origDrawText = Renderer.drawText.bind(Renderer);
      Renderer.drawText = function (canvasCtx, key, layer) {
        if (!layer.letterSpacing) { _origDrawText(canvasCtx, key, layer); return; }

        const editKey     = window.AppState && AppState.editingLayerKey;
        const mainCtx     = window.ctx || canvasCtx;
        const renderLayer = (editKey === key && canvasCtx === mainCtx)
          ? { ...layer, text: AppState.editingText }
          : layer;
        const l = renderLayer;

        canvasCtx.save();
        canvasCtx.fillStyle   = l.color || '#000000';
        canvasCtx.font        = this.font(l);
        canvasCtx.textAlign   = 'left';
        canvasCtx.textBaseline = 'top';
        const sp       = l.letterSpacing || 0;
        const lines    = String(l.text || '').split('\n');
        const fontSize = l.fontSizePx  || 24;
        const lh       = l.lineHeight  || fontSize * 1.05;
        const startY   = l.y + Math.max(0, (l.height - lines.length * lh) / 2);
        lines.forEach((line, li) => {
          let totalW = 0;
          for (const ch of line) totalW += canvasCtx.measureText(ch).width + sp;
          totalW -= sp;
          let cx = l.align === 'right' ? l.x + l.width - totalW
                 : l.align === 'center' ? l.x + (l.width - totalW) / 2
                 : l.x;
          for (const ch of line) {
            canvasCtx.fillText(ch, cx, startY + li * lh);
            cx += canvasCtx.measureText(ch).width + sp;
          }
        });
        canvasCtx.restore();
      };
    }

    // ══════════════════════════════════════════════════════════
    // ⑥ 覆寫 Renderer.drawText()（第二層）：支援底線繪製
    // ══════════════════════════════════════════════════════════
    if (window.Renderer) {
      const _drawWithLS = Renderer.drawText.bind(Renderer);
      Renderer.drawText = function (canvasCtx, key, layer) {
        _drawWithLS(canvasCtx, key, layer);
        if (!layer.textDecoration || !layer.textDecoration.includes('underline')) return;

        const editKey = window.AppState && AppState.editingLayerKey;
        const mainCtx = window.ctx || canvasCtx;
        const l = (editKey === key && canvasCtx === mainCtx)
          ? { ...layer, text: AppState.editingText } : layer;

        canvasCtx.save();
        canvasCtx.strokeStyle = l.color || '#000000';
        canvasCtx.font        = this.font(l);
        const fontSize = l.fontSizePx || 24;
        const lh       = l.lineHeight || fontSize * 1.05;
        const lines    = String(l.text || '').split('\n');
        const startY   = l.y + Math.max(0, (l.height - lines.length * lh) / 2);
        canvasCtx.lineWidth = Math.max(1, fontSize * 0.06);
        lines.forEach((line, li) => {
          const w = canvasCtx.measureText(line).width;
          const x0 = l.align === 'right'  ? l.x + l.width - w
                   : l.align === 'center' ? l.x + (l.width - w) / 2
                   : l.x;
          const y0 = startY + li * lh + fontSize + 2;
          canvasCtx.beginPath(); canvasCtx.moveTo(x0, y0); canvasCtx.lineTo(x0 + w, y0); canvasCtx.stroke();
        });
        canvasCtx.restore();
      };
    }

    // ══════════════════════════════════════════════════════════
    // ⑦ 綁定 Word 工具列按鈕事件
    // ══════════════════════════════════════════════════════════
    const $ = (id) => document.getElementById(id);
    const v = (id) => document.getElementById(id);

    // 字型選單
    $('fontFamilyInput')?.addEventListener('change', () => window.Inspector && Inspector.applyTextFromInputs());

    // 行高 / 字距即時套用
    ['lineHeightInput', 'letterSpacingInput'].forEach(id =>
      $(id)?.addEventListener('input', () => window.Inspector && Inspector.applyTextFromInputs()));
    ['lineHeightInput', 'letterSpacingInput'].forEach(id =>
      $(id)?.addEventListener('change', () => window.Inspector && Inspector.applyTextFromInputs()));

    // 字級 A− / A+
    const sizeEl = $('fontSizeInput');
    const adjustFontSize = (delta) => {
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      HistoryManager.push();
      l.fontSizePx = delta > 0 ? Math.min(300, (l.fontSizePx || 24) + delta) : Math.max(6, (l.fontSizePx || 24) + delta);
      l.fontSizePt = l.fontSizePx;
      if (l.lineHeightMultiplier) l.lineHeight = l.fontSizePx * l.lineHeightMultiplier;
      if (sizeEl) sizeEl.value = l.fontSizePx;
      if (l.source === 'auto_price_v2' && window.PriceTransformEngine) PriceTransformEngine.captureManualPriceTransform(AppState.selectedLayers?.[0], l);
      if (window.Renderer) Renderer.render();
    };
    $('fontSizeDecBtn')?.addEventListener('click', () => adjustFontSize(-1));
    $('fontSizeIncBtn')?.addEventListener('click', () => adjustFontSize(+1));

    $('boldBtn')?.addEventListener('click', () => {
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      l.fontWeight = Number(l.fontWeight || 400) >= 700 ? 400 : 700;
      if (window.HistoryManager) HistoryManager.push();
      if (window.Inspector) Inspector.render(); if (window.Renderer) Renderer.render();
    });

    // 斜體 I
    $('italicBtn')?.addEventListener('click', () => {
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      l.fontStyle = l.fontStyle === 'italic' ? 'normal' : 'italic';
      if (window.HistoryManager) HistoryManager.push();
      if (window.Inspector) Inspector.render(); if (window.Renderer) Renderer.render();
    });

    // 底線 U
    $('underlineBtn')?.addEventListener('click', () => {
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      const has = l.textDecoration && l.textDecoration.includes('underline');
      l.textDecoration = has ? 'none' : 'underline';
      if (window.HistoryManager) HistoryManager.push();
      if (window.Inspector) Inspector.render(); if (window.Renderer) Renderer.render();
    });

    // Ctrl+B / Ctrl+I / Ctrl+U（編輯模式中）
    document.addEventListener('keydown', (e) => {
      if (!window.AppState || !AppState.editingLayerKey) return;
      const l = activeLayer(); if (!l || l.type !== 'text') return;
      const hot = (e.ctrlKey || e.metaKey);
      if (hot && e.key.toLowerCase() === 'b') { e.preventDefault(); l.fontWeight = Number(l.fontWeight||400)>=700?400:700; if(window.Inspector)Inspector.render(); if(window.Renderer)Renderer.render(); }
      if (hot && e.key.toLowerCase() === 'i') { e.preventDefault(); l.fontStyle = l.fontStyle==='italic'?'normal':'italic'; if(window.Inspector)Inspector.render(); if(window.Renderer)Renderer.render(); }
      if (hot && e.key.toLowerCase() === 'u') { e.preventDefault(); const has=l.textDecoration&&l.textDecoration.includes('underline'); l.textDecoration=has?'none':'underline'; if(window.Inspector)Inspector.render(); if(window.Renderer)Renderer.render(); }
    }, true);

    console.log('[V3.1-M2] 補丁載入完成：游標修復 + Word 工具列');
  }

})();
