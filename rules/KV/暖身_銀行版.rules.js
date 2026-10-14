/* 暖身_銀行版 template rules – V1.1
 * 依副標題文字實際大小，動態產生藍色膠囊：
 *   - 膠囊寬 = 副標題文字實際寬 + 左右各 55px；若此寬度 < 506px，則固定為 506px
 *   - 膠囊高 = 副標題文字實際高 + 上下各 18px
 *   - 膠囊中心點 XY = 副標題文字中心點 XY
 *   - 副標題 + 膠囊 群組後，X 軸置中於 328px（非畫布水平中心）
 *   - 疊放順序：膠囊在下、副標題文字在上
 *
 * 銀行 Logo（01~05_銀行）：
 *   - 工單讀到的銀行清單（依序）對應套用到 01_銀行_logo ~ 05_銀行_logo
 *   - 素材檔名＝銀行名稱 + .svg（例如「國泰世華」→「國泰世華.svg」）
 *   - 實際置中、contain-fit 75% 縮放由公版 JSON 已設定好的
 *     keepAspectRatio / sizingMode=containByPBox / targetWidth / maxTargetHeight
 *     交給共用的 ProductEngine 在渲染時計算，這裡只需要指定檔名。
 *   - 少於 5 家銀行時，多出來的 Logo 圖層直接隱藏。
 */
(function () {
  'use strict';

  const FAMILY = 'kv_warmup_bank';
  const CAPSULE_LAYER_KEY = '副標題_膠囊';
  const CAPSULE_FILL = '#0053D1';
  const PADDING_X = 55;
  const PADDING_Y = 18;
  const MIN_CAPSULE_WIDTH = 506;
  const GROUP_CENTER_X = 328;
  const BANK_BOX_KEYS = ['01_銀行', '02_銀行', '03_銀行', '04_銀行', '05_銀行'];

  // 只有 4 家銀行時：01~04 排成 2x2（上兩個、下兩個），彼此間距 10px，
  // 整體（4個方塊合併起來的）中心點固定在畫布 X=896.3, Y=320.7。
  // 01=左上、02=右上、03=左下、04=右下（跟 5 家銀行版面的上下位置對應）。
  const FOUR_BANK_ORDER = ['01_銀行', '02_銀行', '03_銀行', '04_銀行'];
  const FOUR_BANK_GAP = 10;
  const FOUR_BANK_GROUP_CENTER = { x: 896.3, y: 320.7 };

  function findSubtitleLayer(template, findLayer) {
    return findLayer(template, 'text', ['subtitle', '副標題', '副標'], false);
  }

  function findFollowerLayer(template, boxKey) {
    const entry = Object.entries(template.layers || {}).find(([, layer]) => layer?.followTopLeftOfKey === boxKey);
    return entry ? entry[1] : null;
  }

  function applyFourBankGridLayout(template, round) {
    const boxes = FOUR_BANK_ORDER.map((key) => template.layers?.[key]);
    if (boxes.some((box) => !box)) return;
    const [box1, box2, box3, box4] = boxes;

    const colLeftWidth = Math.max(Number(box1.width || 0), Number(box3.width || 0));
    const colRightWidth = Math.max(Number(box2.width || 0), Number(box4.width || 0));
    const rowTopHeight = Math.max(Number(box1.height || 0), Number(box2.height || 0));
    const rowBottomHeight = Math.max(Number(box3.height || 0), Number(box4.height || 0));

    const totalWidth = colLeftWidth + FOUR_BANK_GAP + colRightWidth;
    const totalHeight = rowTopHeight + FOUR_BANK_GAP + rowBottomHeight;
    const groupLeft = FOUR_BANK_GROUP_CENTER.x - totalWidth / 2;
    const groupTop = FOUR_BANK_GROUP_CENTER.y - totalHeight / 2;

    const positions = {
      '01_銀行': { x: groupLeft, y: groupTop },
      '02_銀行': { x: groupLeft + colLeftWidth + FOUR_BANK_GAP, y: groupTop },
      '03_銀行': { x: groupLeft, y: groupTop + rowTopHeight + FOUR_BANK_GAP },
      '04_銀行': { x: groupLeft + colLeftWidth + FOUR_BANK_GAP, y: groupTop + rowTopHeight + FOUR_BANK_GAP },
    };

    FOUR_BANK_ORDER.forEach((boxKey) => {
      const box = template.layers[boxKey];
      const pos = positions[boxKey];
      box.x = round(pos.x, 2);
      box.y = round(pos.y, 2);
      box.centerX = round(box.x + box.width / 2, 2);
      box.centerY = round(box.y + box.height / 2, 2);

      // 陰影左上角跟著邊界框左上角走（跟 5 家銀行時同一套規則）。
      const shadow = findFollowerLayer(template, boxKey);
      if (shadow) {
        shadow.x = box.x;
        shadow.y = box.y;
        shadow.centerX = round(shadow.x + Number(shadow.width || 0) / 2, 2);
        shadow.centerY = round(shadow.y + Number(shadow.height || 0) / 2, 2);
      }

      // Logo 的置中方式跟 5 家銀行時完全一樣：中心點 = 邊界框中心點，
      // contain-fit 尺寸（targetWidth / maxTargetHeight）不變，因為方塊本身寬高沒變，只是位置變了。
      const logo = template.layers[`${boxKey}_logo`];
      if (logo) {
        logo.centerX = box.centerX;
        logo.centerY = box.centerY;
        logo.x = round(logo.centerX - Number(logo.width || 0) / 2, 2);
        logo.y = round(logo.centerY - Number(logo.height || 0) / 2, 2);
      }
    });
  }

  function applyBankLogos({ template, record, diagnostics, helpers }) {
    const bankList = Array.isArray(record?.['銀行清單']) ? record['銀行清單'] : [];

    if (bankList.length === 4) {
      applyFourBankGridLayout(template, helpers.round);
    }

    BANK_BOX_KEYS.forEach((boxKey, index) => {
      const logoKey = `${boxKey}_logo`;
      const logoLayer = template.layers?.[logoKey];
      const shadowLayer = findFollowerLayer(template, boxKey);

      const bankName = String(bankList[index] || '').trim();
      if (!bankName) {
        if (logoLayer) logoLayer.hidden = true;
        if (shadowLayer) shadowLayer.hidden = true;
        diagnostics.push({ field: logoKey, status: 'missing', reason: '工單銀行清單沒有第' + (index + 1) + '筆資料' });
        return;
      }

      if (logoLayer) {
        logoLayer.assetFilename = `${bankName}.svg`;
        logoLayer.hidden = false;
      }
      if (shadowLayer) shadowLayer.hidden = false;
      diagnostics.push({ field: logoKey, status: 'ok', value: bankName, filename: `${bankName}.svg` });
    });
  }

  function applyCapsule({ template, record, diagnostics, helpers }) {
    const { findLayer, round, measureTextWidth, measureTextHeight } = helpers;
    const subtitle = findSubtitleLayer(template, findLayer);
    if (!subtitle) {
      diagnostics.push({ field: '副標題_膠囊', status: 'missing-layer', reason: '找不到 subtitle 文字圖層' });
      return;
    }

    const textWidth = measureTextWidth(subtitle);
    const textHeight = measureTextHeight(subtitle);
    const paddedWidth = textWidth + PADDING_X * 2;
    const capsuleWidth = round(Math.max(paddedWidth, MIN_CAPSULE_WIDTH), 2);
    const capsuleHeight = round(textHeight + PADDING_Y * 2, 2);

    // 副標題與膠囊的中心點 XY 先維持相同（以副標題目前的中心為準）。
    const centerY = Number(subtitle.centerY ?? (Number(subtitle.y || 0) + Number(subtitle.height || 0) / 2));

    // 群組（副標題 + 膠囊）X 軸置中於 328px（非畫布水平中心）。
    const targetCenterX = GROUP_CENTER_X;

    subtitle.x = round(targetCenterX - textWidth / 2, 2);
    subtitle.width = round(textWidth, 2);
    subtitle.centerX = round(targetCenterX, 2);

    const capsule = template.layers[CAPSULE_LAYER_KEY] || {};
    Object.assign(capsule, {
      type: 'shape',
      psdName: CAPSULE_LAYER_KEY,
      source: 'generated_kv_capsule',
      x: round(targetCenterX - capsuleWidth / 2, 2),
      y: round(centerY - capsuleHeight / 2, 2),
      width: capsuleWidth,
      height: capsuleHeight,
      centerX: round(targetCenterX, 2),
      centerY: round(centerY, 2),
      fill: CAPSULE_FILL,
      radius: round(capsuleHeight / 2, 2),
      hidden: false,
    });
    template.layers[CAPSULE_LAYER_KEY] = capsule;

    const order = template.renderOrder;
    if (Array.isArray(order)) {
      const withoutCapsule = order.filter((key) => key !== CAPSULE_LAYER_KEY);
      const subtitleIndex = withoutCapsule.indexOf('subtitle');
      const insertAt = subtitleIndex >= 0 ? subtitleIndex : withoutCapsule.length;
      withoutCapsule.splice(insertAt, 0, CAPSULE_LAYER_KEY);
      template.renderOrder = withoutCapsule;
    }

    diagnostics.push({
      field: '副標題_膠囊',
      status: 'ok',
      value: subtitle.text,
      capsule: { width: capsuleWidth, height: capsuleHeight, centerX: targetCenterX, centerY, minWidthApplied: paddedWidth < MIN_CAPSULE_WIDTH },
    });
  }

  const RULES = {
    capsuleRules: {},

    afterApplyRecordToTemplate(context) {
      applyCapsule(context);
      applyBankLogos(context);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: '暖身_銀行版',
    priority: 30,
    tokens: ['暖身_銀行版', '暖身 L1 KV 版配 (銀行版)', 'kv_warmup_bank'],
    targets: ['暖身_銀行版', '暖身 L1 KV 版配 (銀行版)', 'kv_warmup_bank'],
    rules: RULES,
  });
})();
