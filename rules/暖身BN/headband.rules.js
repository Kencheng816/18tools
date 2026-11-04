/* 01_頭巾 公版規則（2026-10-30 公版整併：取代 headband_VIP.rules.js ＋ headband_shopee.rules.js）
 *
 * 一支公版 01_頭巾.json 同時做 VIP 版與蝦皮購物版，工單的 LOGO 類型（票券欄：VIP logo／蝦皮購物）只決定「顯示哪一組圖層」：
 *
 *   | 圖層                                          | VIP 版 | 蝦皮購物版 |
 *   | 蝦皮VIP_BG＋蝦皮VIP_LOGO＋蝦皮VIP_案型（副標群組） | 顯示   | 隱藏（副標含 VIP 字樣時仍顯示） |
 *   | 案型_BG＋subtitle（一般副標群組）               | 隱藏   | 顯示 |
 *   | VIP_icon／蝦皮VIP_券面顏色 #FF7701（券面左側）    | 顯示   | 隱藏 |
 *   | 蝦皮購物_LOGO／券面顏色 #EE4D2D（券面左側）       | 隱藏   | 顯示 |
 *   | 其餘（18號會員日_LOGO、標籤、券面底圖、票券_案型、legal、CTA 三件組、三角形、kv_bg）| 兩版都顯示 |
 *
 * 其他固定行為（封測逐題確認第 6～13 題）：
 *   - 副標群組整組以 18號會員日_LOGO 的中心置中；底色膠囊寬度跟文字動態（文字＋左右各 25px；LOGO 比文字寬 70px 以上時改用 LOGO 寬）。
 *   - CTA 三版本各出一張：下單去／點我領（CTA 文字層＝「立即領」圖層）／兌換完畢（改顯示 兌換完畢 圖片、隱藏 CTA）。
 *   - 「18號」標籤固定文字；「有效期限或安全文字」先隱藏不用；票券_案型 在券面底圖內垂直置中（一行、兩行都置中）。
 *   - 輸出檔名不分版本：頭巾_01_下單去、頭巾_02_點我領…（路由見 template-routing.js）。
 * LOGO 大小、字級、間距都取自公版圖層原本的設計值；規則只負責顯示哪組、填字、置中與膠囊寬度。
 */
(function registerHeadbandRules() {
  'use strict';

  const FAMILY = 'headband';
  const KEYS = Object.freeze({
    anchorLogo: '18號會員日_LOGO',
    vipBg: '蝦皮VIP_BG', vipLogo: '蝦皮VIP_LOGO', vipCase: '蝦皮VIP_案型',
    plainBg: '案型_BG', subtitle: 'subtitle',
    vipIcon: 'VIP_icon', vipFace: '蝦皮VIP_券面顏色',
    shopeeLogo: '蝦皮購物_LOGO', shopeeFace: '券面顏色',
    face: '券面底圖', ticketCase: '票券_案型', expiry: '有效期限或安全文字', tag: '18號',
    legal: 'legal',
    ctaText: '立即領', ctaBg: 'CTA_BG', soldOut: '兌換完畢',
  });
  const ASSETS = Object.freeze({ vipLogo: '蝦皮VIP_LOGO.svg', vipIcon: 'VIP_icon.svg', shopeeLogo: '蝦皮購物_LOGO.png' });
  const COLORS = Object.freeze({ capsule: '#0053D1', vipFace: '#FF7701', shopeeFace: '#EE4D2D', ctaBg: '#EE4D2D', ctaCircle: '#000000' });
  const CAPSULE = Object.freeze({ paddingX: 25, logoWidthThresholdPx: 70 });
  const FIXED_TAG_TEXT = '18號';
  const VIP_PATTERN = /蝦皮\s*VIP|VIP/gi;

  const CTA_VARIANTS = Object.freeze([
    { id: 'order_now', label: '下單去', ctaText: '下單去', showCta: true, showSoldOut: false },
    { id: 'claim_now', label: '點我領', ctaText: '點我領', showCta: true, showSoldOut: false },
    { id: 'sold_out', label: '兌換完畢', ctaText: '', showCta: false, showSoldOut: true },
  ]);

  const toText = (value) => String(value ?? '').replace(/_x000d_/gi, '\n').replace(/\r\n?/g, '\n').trim();
  const normalize = (value) => toText(value).toLowerCase().replace(/[\s 　_\-+()（）\[\]【】.]+/g, '');
  const round2 = (value) => Math.round(Number(value) * 100) / 100;
  const getLayer = (template, key) => template?.layers?.[key] || null;
  const setVisible = (layer, visible) => { if (layer) { layer.hidden = !visible; layer.visible = visible; } };
  const centerXOf = (layer) => Number(layer.x) + Number(layer.width) / 2;

  function measure(text, layer) {
    const measurer = window.TitleLogoParser?.measureTextWidth;
    const width = typeof measurer === 'function' ? Number(measurer(text, layer)) : 0;
    return Number.isFinite(width) && width > 0 ? width : Number(layer?.width) || 0;
  }

  // ── 版本判斷 ──

  /** VIP 版：路由（工單 LOGO 類型）是 VIP；沒有路由資訊時看票券欄。 */
  function resolveLogoVariant(template, record) {
    const routeKey = normalize(template?.sheetTemplateRoute?.key || '');
    if (routeKey) return routeKey.includes('vip') ? 'vip' : 'shopee';
    return /vip/i.test(toText(record?.['票券'])) ? 'vip' : 'shopee';
  }

  function resolveCtaVariant(record) {
    const raw = normalize(record?.__headbandCtaVariant || record?.CTA_案型 || record?.CTA || '');
    if (raw.includes('點我領') || raw.includes('claimnow')) return CTA_VARIANTS[1];
    if (raw.includes('兌換完畢') || raw.includes('soldout')) return CTA_VARIANTS[2];
    return CTA_VARIANTS[0];
  }

  function createVariantRecords(record = {}) {
    return CTA_VARIANTS.map((variant) => ({ ...record, CTA_案型: variant.ctaText, __headbandCtaVariant: variant.id, __outputSuffix: variant.label }));
  }

  // ── 公版設計值（第一次套用時記下，之後每次重排都用同一組） ──

  function designOf(template) {
    if (template.__headbandDesign) return template.__headbandDesign;
    const vipLogo = getLayer(template, KEYS.vipLogo); const vipCase = getLayer(template, KEYS.vipCase);
    const vipBg = getLayer(template, KEYS.vipBg); const plainBg = getLayer(template, KEYS.plainBg);
    const centerY = (layer, fallback) => (layer ? round2(Number(layer.y) + Number(layer.height) / 2) : fallback);
    const design = {
      vipGap: vipLogo && vipCase ? Math.max(0, round2(Number(vipCase.x) - (Number(vipLogo.x) + Number(vipLogo.width)))) : 6,
      vipBgHeight: Number(vipBg?.height) || 58, vipBgCenterY: centerY(vipBg, 153),
      plainBgHeight: Number(plainBg?.height) || 58, plainBgCenterY: centerY(plainBg, 153),
    };
    template.__headbandDesign = design;
    return design;
  }

  // ── 券面（右側票券） ──

  function applyCouponFace(template, logoVariant, diagnostics) {
    const isVip = logoVariant === 'vip';
    setVisible(getLayer(template, KEYS.vipIcon), isVip);
    setVisible(getLayer(template, KEYS.vipFace), isVip);
    setVisible(getLayer(template, KEYS.shopeeLogo), !isVip);
    setVisible(getLayer(template, KEYS.shopeeFace), !isVip);

    const tag = getLayer(template, KEYS.tag);
    if (tag) { tag.text = FIXED_TAG_TEXT; setVisible(tag, true); }
    setVisible(getLayer(template, KEYS.expiry), false);

    const face = getLayer(template, KEYS.face);
    const ticketCase = getLayer(template, KEYS.ticketCase);
    if (face && ticketCase) {
      // 文字框改成跟券面一樣高：渲染時文字區塊會在框內垂直置中，一行、兩行都置中。
      ticketCase.y = Number(face.y);
      ticketCase.height = Number(face.height);
      ticketCase.centerY = round2(Number(face.y) + Number(face.height) / 2);
    }
    diagnostics?.push?.({ field: '券面', status: 'ok', value: isVip ? 'VIP' : '蝦皮購物', target: isVip ? 'VIP_icon＋蝦皮VIP_券面顏色' : '蝦皮購物_LOGO＋券面顏色' });
  }

  // ── 副標群組（左側） ──

  function capsuleWidth(contentWidth, anchorLogo) {
    const logoWidth = Number(anchorLogo?.width) || 0;
    if (logoWidth > contentWidth && logoWidth - contentWidth >= CAPSULE.logoWidthThresholdPx) return logoWidth;
    return contentWidth + CAPSULE.paddingX * 2;
  }

  function placeCapsule(bg, { centerX, centerY, width, height }) {
    if (!bg) return;
    bg.useDynamicBounds = true;
    bg.x = round2(centerX - width / 2); bg.y = round2(centerY - height / 2);
    bg.width = round2(width); bg.height = round2(height);
    bg.centerX = round2(centerX); bg.centerY = round2(centerY);
    bg.radius = round2(height / 2);
  }

  function placeText(layer, text, { x, width }) {
    layer.text = text;
    layer.x = round2(x); layer.width = round2(width); layer.centerX = round2(x + width / 2);
  }

  function layoutVipGroup(template, text, centerX) {
    const design = designOf(template);
    const logo = getLayer(template, KEYS.vipLogo); const caseLayer = getLayer(template, KEYS.vipCase);
    if (!logo || !caseLayer) return;
    const textWidth = text ? measure(text, caseLayer) : 0;
    const logoWidth = Number(logo.width) || 0;
    const groupWidth = logoWidth + (textWidth ? design.vipGap + textWidth : 0);
    const left = centerX - groupWidth / 2;

    logo.type = 'image'; logo.assetFilename = ASSETS.vipLogo; logo.assetCandidates = [ASSETS.vipLogo]; logo.keepAspectRatio = true;
    logo.x = round2(left); logo.centerX = round2(left + logoWidth / 2);
    placeText(caseLayer, text, { x: left + logoWidth + design.vipGap, width: textWidth });
    caseLayer.align = 'center';
    setVisible(caseLayer, !!text);
    placeCapsule(getLayer(template, KEYS.vipBg), { centerX, centerY: design.vipBgCenterY, width: capsuleWidth(groupWidth, getLayer(template, KEYS.anchorLogo)), height: design.vipBgHeight });
  }

  function layoutPlainGroup(template, text, centerX) {
    const design = designOf(template);
    const subtitle = getLayer(template, KEYS.subtitle);
    if (!subtitle) return;
    const textWidth = measure(text, subtitle);
    placeText(subtitle, text, { x: centerX - textWidth / 2, width: textWidth });
    subtitle.align = 'center';
    placeCapsule(getLayer(template, KEYS.plainBg), { centerX, centerY: design.plainBgCenterY, width: capsuleWidth(textWidth, getLayer(template, KEYS.anchorLogo)), height: design.plainBgHeight });
  }

  function applySubtitleGroup(template, record, logoVariant, diagnostics) {
    const subtitle = getLayer(template, KEYS.subtitle);
    const anchorLogo = getLayer(template, KEYS.anchorLogo);
    if (!subtitle || !anchorLogo) return;
    const centerX = centerXOf(anchorLogo);
    const raw = toText(record?.['副標'] || subtitle.text);
    const useVip = logoVariant === 'vip' || VIP_PATTERN.test(raw);
    VIP_PATTERN.lastIndex = 0;

    [KEYS.vipBg, KEYS.vipLogo, KEYS.vipCase].forEach((key) => setVisible(getLayer(template, key), useVip));
    [KEYS.plainBg, KEYS.subtitle].forEach((key) => setVisible(getLayer(template, key), !useVip));

    if (useVip) {
      const text = raw.replace(VIP_PATTERN, '').replace(/^\s*[+＋｜|／/・,，、\-]+\s*/, '').trim();
      VIP_PATTERN.lastIndex = 0;
      layoutVipGroup(template, text, centerX);
      diagnostics?.push?.({ field: '副標', status: 'ok', value: raw, target: `蝦皮VIP_LOGO＋「${text}」` });
    } else {
      layoutPlainGroup(template, raw, centerX);
    }

    const legal = getLayer(template, KEYS.legal);
    if (legal) { legal.x = round2(centerX - Number(legal.width) / 2); legal.centerX = round2(centerX); }
  }

  // ── CTA 三版本 ──

  /** 核心把工單 CTA 文字當圖片層找（頭巾的 CTA 是文字層「立即領」），會留一筆 CTA missing-layer 誤報，從診斷裡拿掉。 */
  function dropCtaFalseAlarm(diagnostics) {
    if (!Array.isArray(diagnostics)) return;
    for (let i = diagnostics.length - 1; i >= 0; i -= 1) {
      const entry = diagnostics[i];
      if (entry?.field === 'CTA' && entry?.status === 'missing-layer') diagnostics.splice(i, 1);
    }
  }

  function applyCtaVariant(template, record, diagnostics) {
    dropCtaFalseAlarm(diagnostics);
    const variant = resolveCtaVariant(record);
    const ctaText = getLayer(template, KEYS.ctaText);
    if (ctaText) ctaText.text = variant.ctaText;
    setVisible(ctaText, variant.showCta);
    setVisible(getLayer(template, KEYS.ctaBg), variant.showCta);
    setVisible(getLayer(template, KEYS.soldOut), variant.showSoldOut);
    diagnostics?.push?.({ field: 'CTA', status: 'ok', value: variant.label, target: variant.showCta ? KEYS.ctaText : KEYS.soldOut });
  }

  function apply({ template, record, diagnostics }) {
    if (!template?.layers) return;
    const logoVariant = resolveLogoVariant(template, record);
    applyCouponFace(template, logoVariant, diagnostics);
    applySubtitleGroup(template, record, logoVariant, diagnostics);
    applyCtaVariant(template, record, diagnostics);
  }

  const capsuleShape = { renderer: 'roundedRectangle', fill: COLORS.capsule, radius: 29, useLayerBounds: true };
  const RULES = {
    capsuleRules: {},
    variantRules: { enabled: true, mode: 'duplicate-records', variants: CTA_VARIANTS, createVariantRecords },
    createVariantRecords,
    expandRecordVariants: createVariantRecords,
    layoutRules: {},
    shapeLayers: {
      '三角形': { renderer: 'asset', asset: '三角形.svg', exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      '標籤_底色': { renderer: 'asset', asset: '標籤_底色.svg', exactAsset: true, useLayerBounds: true, assetSizing: 'stretch' },
      [KEYS.vipLogo]: { renderer: 'asset', asset: ASSETS.vipLogo, assetCandidates: [ASSETS.vipLogo], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      [KEYS.vipIcon]: { renderer: 'asset', asset: ASSETS.vipIcon, assetCandidates: [ASSETS.vipIcon], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      [KEYS.shopeeLogo]: { renderer: 'asset', asset: ASSETS.shopeeLogo, assetCandidates: [ASSETS.shopeeLogo], exactAsset: true, useLayerBounds: true, assetSizing: 'contain' },
      [KEYS.vipBg]: capsuleShape,
      [KEYS.plainBg]: capsuleShape,
      [KEYS.vipFace]: { renderer: 'rectangle', fill: COLORS.vipFace },
      [KEYS.shopeeFace]: { renderer: 'rectangle', fill: COLORS.shopeeFace },
      '圓形CTA_BG': { renderer: 'circle', fill: COLORS.ctaCircle },
      [KEYS.ctaBg]: { renderer: 'roundedRectangle', fill: COLORS.ctaBg, radius: 5 },
    },
    priceRules: { enabled: false, coordinateMode: 'absolute', templateLayouts: {}, productLayouts: {} },
    afterApplyRecordToTemplate: apply,
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: '頭巾',
    priority: 30,
    tokens: ['01_頭巾', '頭巾', 'headband', 'hdb'],
    targets: ['01_頭巾', '頭巾', 'headband', 'hdb'],
    rules: RULES,
  });

  window.HeadbandRules = Object.freeze({ apply, KEYS, ASSETS, COLORS, CTA_VARIANTS });
})();
