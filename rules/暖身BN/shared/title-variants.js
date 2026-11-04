/* 暖身BN 共用 — 主標三型態（一般／VIP LOGO／蝦皮直營 LOGO）＋ VIP 背景切換 ＋ 底色
 *
 * 2026-10-30 公版整併（03_HBN、04_DD Card 由使用者重做）後的規則，對應封測逐題確認第 1、4、5 題：
 *   - 主標讀到「VIP」→ 隱藏一般主標 title，改顯示「蝦皮VIP_主標題_左 ＋ 蝦皮VIP_LOGO ＋ 蝦皮VIP_主標題_右」三段式
 *     （關鍵字在哪、LOGO 就換在哪：「4/18 VIP 專屬」→ 左「4/18」、LOGO、右「專屬」），整組以公版主標的中心置中。
 *   - 主標讀到「蝦皮直營／直營」→ 顯示「蝦皮直營_LOGO ＋ 蝦皮直營_主標題_右」；關鍵字前面若有字，借 蝦皮VIP_主標題_左 放。
 *   - 其他 → 只顯示 title，變體圖層全部隱藏。
 *   - 公版有 蝦皮VIP_KV_BG 時：VIP 型態顯示它並隱藏 kv_bg，否則相反。
 *   - 公版最底下自動鋪一層底色（預設 #ffa200），內部圖層、圖層清單不顯示（bg_color 被拿掉後的保底）。
 *   - 4_18_專屬／副標題_藍底／副標題_底圖 這類對位參考層標成參考用（不畫、不列）。
 * 字級、LOGO 大小、LOGO 與文字的間距都取自公版圖層原本的設計值，規則只負責「顯示哪組」與「整組置中」。
 * 由 hbn.rules.js／ddcard.rules.js 的 afterApplyRecordToTemplate 呼叫。
 */
(function initWarmupTitleVariants() {
  'use strict';

  const KEYS = Object.freeze({
    title: 'title',
    vipLeft: '蝦皮VIP_主標題_左',
    vipLogo: '蝦皮VIP_LOGO',
    vipRight: '蝦皮VIP_主標題_右',
    directLogo: '蝦皮直營_LOGO',
    directRight: '蝦皮直營_主標題_右',
    kvBg: 'kv_bg',
    vipKvBg: '蝦皮VIP_KV_BG',
    baseBg: '__base_bg',
  });
  const GUIDE_KEYS = ['4_18_專屬', '副標題_藍底', '副標題_底圖'];
  const ASSETS = Object.freeze({ vipLogo: '蝦皮VIP_LOGO.svg', directLogo: '蝦皮直營_LOGO.svg' });
  const VIP_PATTERN = /蝦皮\s*VIP|VIP/i;
  const DIRECT_PATTERN = /蝦皮直營|直營/;

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n?/g, '\n').trim();
  const round2 = (value) => Math.round(Number(value) * 100) / 100;
  const getLayer = (template, key) => template?.layers?.[key] || null;
  const setVisible = (layer, visible) => { if (layer) { layer.hidden = !visible; layer.visible = visible; } };

  function measure(text, layer) {
    const measurer = window.TitleLogoParser?.measureTextWidth;
    const width = typeof measurer === 'function' ? Number(measurer(text, layer)) : 0;
    return Number.isFinite(width) && width > 0 ? width : Number(layer?.width) || 0;
  }

  /** 第一次套用時記下公版設計的間距（LOGO 與左右文字之間），之後每次重排都用同一組數字。 */
  function designOf(template) {
    if (template.__titleVariantDesign) return template.__titleVariantDesign;
    const left = getLayer(template, KEYS.vipLeft); const vipLogo = getLayer(template, KEYS.vipLogo); const vipRight = getLayer(template, KEYS.vipRight);
    const directLogo = getLayer(template, KEYS.directLogo); const directRight = getLayer(template, KEYS.directRight);
    const title = getLayer(template, KEYS.title);
    const gap = (a, b) => (a && b ? Math.max(0, round2(Number(b.x) - (Number(a.x) + Number(a.width)))) : 8);
    const design = {
      centerX: title ? round2(Number(title.x) + Number(title.width) / 2) : round2(Number(template.canvas?.width || 0) / 2),
      vipGapLeft: gap(left, vipLogo),
      vipGapRight: gap(vipLogo, vipRight),
      directGapRight: gap(directLogo, directRight),
      directGapLeft: gap(left, directLogo) || 8,
    };
    template.__titleVariantDesign = design;
    return design;
  }

  function splitAt(raw, pattern) {
    const match = pattern.exec(raw);
    if (!match) return null;
    return { left: raw.slice(0, match.index).trim(), right: raw.slice(match.index + match[0].length).trim() };
  }

  function hideAllVariants(template) {
    [KEYS.vipLeft, KEYS.vipLogo, KEYS.vipRight, KEYS.directLogo, KEYS.directRight].forEach((key) => setVisible(getLayer(template, key), false));
  }

  /** 左右兩段字級相同時，右段的垂直度量（y／高／行高）跟左段對齊——DD Card 的 蝦皮VIP_主標題_右 行高匯出成 35（左段 69.6），
   *  渲染把文字區塊在框內垂直置中，右段會比左段低 8px（封測回饋：DDC_07「專屬」往下掉）。 */
  function alignVertical(target, reference) {
    if (!target || !reference || Math.abs(Number(target.fontSizePx) - Number(reference.fontSizePx)) > 0.5) return;
    target.y = Number(reference.y); target.height = Number(reference.height); target.lineHeight = Number(reference.lineHeight);
    target.centerY = round2(target.y + target.height / 2);
  }

  /** 依序排 [左文字][LOGO][右文字]，整組以 centerX 置中；沒有左文字就不占位。 */
  function layoutGroup(template, { leftLayer, leftText, logo, logoAsset, rightLayer, rightText, gapLeft, gapRight }) {
    const design = designOf(template);
    alignVertical(rightLayer, leftLayer);
    const leftWidth = leftText ? measure(leftText, leftLayer) : 0;
    const rightWidth = rightText ? measure(rightText, rightLayer) : 0;
    const logoWidth = Number(logo.width) || 0;
    const total = (leftWidth ? leftWidth + gapLeft : 0) + logoWidth + (rightWidth ? gapRight + rightWidth : 0);
    let cursor = design.centerX - total / 2;

    if (leftLayer) {
      if (leftText) {
        leftLayer.text = leftText; leftLayer.align = 'right';
        leftLayer.x = round2(cursor); leftLayer.width = round2(leftWidth); leftLayer.centerX = round2(cursor + leftWidth / 2);
        cursor += leftWidth + gapLeft;
      }
      setVisible(leftLayer, !!leftText);
    }

    logo.type = 'image';
    logo.assetFilename = logoAsset;
    logo.assetCandidates = [logoAsset];
    logo.keepAspectRatio = true;
    logo.x = round2(cursor); logo.centerX = round2(cursor + logoWidth / 2);
    setVisible(logo, true);
    cursor += logoWidth;

    if (rightLayer) {
      if (rightText) {
        cursor += gapRight;
        rightLayer.text = rightText; rightLayer.align = 'left';
        rightLayer.x = round2(cursor); rightLayer.width = round2(rightWidth); rightLayer.centerX = round2(cursor + rightWidth / 2);
      }
      setVisible(rightLayer, !!rightText);
    }
    return total;
  }

  function applyTitle(template, record, diagnostics) {
    const title = getLayer(template, KEYS.title);
    if (!title) return 'plain';
    const raw = toText(title.text || record?.['主標']);
    hideAllVariants(template);
    const design = designOf(template);

    const vip = splitAt(raw, VIP_PATTERN);
    const vipLogo = getLayer(template, KEYS.vipLogo);
    if (vip && vipLogo) {
      setVisible(title, false);
      layoutGroup(template, {
        leftLayer: getLayer(template, KEYS.vipLeft), leftText: vip.left,
        logo: vipLogo, logoAsset: ASSETS.vipLogo,
        rightLayer: getLayer(template, KEYS.vipRight), rightText: vip.right,
        gapLeft: design.vipGapLeft, gapRight: design.vipGapRight,
      });
      diagnostics?.push?.({ field: '主標', status: 'ok', value: raw, target: `VIP LOGO 三段式：「${vip.left}」＋LOGO＋「${vip.right}」` });
      return 'vip';
    }

    const direct = splitAt(raw, DIRECT_PATTERN);
    const directLogo = getLayer(template, KEYS.directLogo);
    if (direct && directLogo) {
      setVisible(title, false);
      layoutGroup(template, {
        leftLayer: getLayer(template, KEYS.vipLeft), leftText: direct.left,
        logo: directLogo, logoAsset: ASSETS.directLogo,
        rightLayer: getLayer(template, KEYS.directRight), rightText: direct.right,
        gapLeft: design.directGapLeft, gapRight: design.directGapRight,
      });
      diagnostics?.push?.({ field: '主標', status: 'ok', value: raw, target: `蝦皮直營 LOGO：LOGO＋「${direct.right}」` });
      return 'direct';
    }

    setVisible(title, true);
    return 'plain';
  }

  function applyBackground(template, mode) {
    const vipBg = getLayer(template, KEYS.vipKvBg);
    const kvBg = getLayer(template, KEYS.kvBg);
    if (!vipBg) return;
    setVisible(vipBg, mode === 'vip');
    setVisible(kvBg, mode !== 'vip');
  }

  function markGuides(template) {
    GUIDE_KEYS.forEach((key) => {
      const layer = getLayer(template, key);
      if (!layer) return;
      if (window.LayerHygiene?.markGuide) window.LayerHygiene.markGuide(layer);
      else { layer.hidden = true; layer.locked = true; layer.__internal = true; }
    });
  }

  /** 最底層底色：內部 shape 圖層，由規則檔 shapeLayers['__base_bg'] 指定顏色（rectangle）。 */
  function ensureBaseBackground(template) {
    if (!template?.layers || !template.canvas) return;
    if (!template.layers[KEYS.baseBg]) {
      template.layers[KEYS.baseBg] = {
        type: 'shape', psdName: '底色', x: 0, y: 0,
        width: Number(template.canvas.width) || 0, height: Number(template.canvas.height) || 0,
        centerX: (Number(template.canvas.width) || 0) / 2, centerY: (Number(template.canvas.height) || 0) / 2,
        hidden: false, visible: true, locked: true, __internal: true, __nonInteractive: true,
      };
    }
    const order = Array.isArray(template.renderOrder) ? template.renderOrder.filter((key) => key !== KEYS.baseBg) : Object.keys(template.layers).filter((key) => key !== KEYS.baseBg);
    template.renderOrder = [KEYS.baseBg, ...order];
  }

  function apply({ template, record, diagnostics }) {
    if (!template?.layers) return null;
    markGuides(template);
    ensureBaseBackground(template);
    const mode = applyTitle(template, record, diagnostics);
    applyBackground(template, mode);
    return mode;
  }

  window.WarmupTitleVariants = Object.freeze({ apply, KEYS, ASSETS, BASE_BG_RULE: Object.freeze({ renderer: 'rectangle', fill: '#ffa200' }) });
})();
