/* 暖身_攻略頁 template rules – V1.0
 * 依副標題文字實際大小，動態產生藍色膠囊：
 *   - 膠囊寬 = 副標題文字實際寬 + 左右各 65px
 *   - 膠囊高 = 副標題文字實際高 + 上下各 18px
 *   - 膠囊中心點 XY = 副標題文字中心點 XY
 *   - 副標題 + 膠囊 群組後，X 軸置中於畫布水平中心
 *   - 疊放順序：膠囊在下、副標題文字在上
 */
(function () {
  'use strict';

  const FAMILY = 'kv_warmup_guide';
  const CAPSULE_LAYER_KEY = '副標題_膠囊';
  const CAPSULE_FILL = '#0053D1';
  const PADDING_X = 65;
  const PADDING_Y = 18;

  function findSubtitleLayer(template, findLayer) {
    return findLayer(template, 'text', ['subtitle', '副標題', '副標'], false);
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
    const capsuleWidth = round(textWidth + PADDING_X * 2, 2);
    const capsuleHeight = round(textHeight + PADDING_Y * 2, 2);

    // 副標題與膠囊的中心點 XY 先維持相同（以副標題目前的中心為準）。
    const centerY = Number(subtitle.centerY ?? (Number(subtitle.y || 0) + Number(subtitle.height || 0) / 2));

    // 群組（副標題 + 膠囊）X 軸置中於畫布水平中心。
    const canvasWidth = Number(template?.canvas?.width || 1200);
    const targetCenterX = canvasWidth / 2;

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
      capsule: { width: capsuleWidth, height: capsuleHeight, centerX: targetCenterX, centerY },
    });
  }

  const RULES = {
    capsuleRules: {},

    afterApplyRecordToTemplate(context) {
      applyCapsule(context);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: '暖身_攻略頁',
    priority: 30,
    tokens: ['暖身_攻略頁', '暖身 L1 KV 版配', 'kv_warmup_guide'],
    targets: ['暖身_攻略頁', '暖身 L1 KV 版配', 'kv_warmup_guide'],
    rules: RULES,
  });
})();
