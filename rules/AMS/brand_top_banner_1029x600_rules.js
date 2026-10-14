/* 品牌館Top Banner_1029x600 專屬規則 */
(function () {
  'use strict';

  const FAMILY = "brand_top_banner_1029x600";
  const TEMPLATE_LAYER_METRICS = {
  "LINE POINTS": {
    "x": 680,
    "y": 453,
    "width": 136,
    "height": 17,
    "centerX": 748,
    "centerY": 461.5,
    "fontSizePt": 18.5,
    "fontSizePx": 18.5,
    "lineHeight": 22.2,
    "letterSpacing": 0,
    "align": "center",
    "fontFamily": "ShopeeNotoSans Content",
    "fontStyle": "Bold",
    "fontWeight": "700"
  },
  "LINE POINTS_Bar": {
    "x": 670,
    "y": 445,
    "width": 156,
    "height": 31,
    "centerX": 748,
    "centerY": 460.5,
    "fill": "#39BE00",
    "cornerRadius": 14.87
  }
};

  window.TemplateRuleRegistry.register(FAMILY, {
    label: "品牌館Top Banner_1029x600",
    priority: 114,
    targets: ["品牌館Top Banner_1029x600", "品牌館Top Banner"],
    tokens: ["品牌館Top Banner"],

    rules: {
      shapeLayers: {
        '白色色塊': { renderer: 'roundedRectangle', radiusMode: 'psd', usePsdRadii: true },
        '綠色色塊': { renderer: 'rectangle' },
        '右_上方Bar': { renderer: 'roundedRectangle', cornerRadii: { topLeft: 20, topRight: 20, bottomRight: 0, bottomLeft: 0 } },
        '右_下方Bar': { renderer: 'roundedRectangle', cornerRadii: { topLeft: 0, topRight: 0, bottomRight: 20, bottomLeft: 20 } },
      },

      productImageBox: {
        "x": 574,
        "y": 83,
        "width": 387,
        "height": 313,
        "centerX": 767.5,
        "centerY": 239.5,
        "targetWidth": 387,
        "targetHeight": 313,
        "maxTargetHeight": 313,
        "sizingMode": "containByPBox",
        "widthLimitPolicy": "pBox"
},

      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm("品牌館Top Banner")) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: "品牌館Top Banner_1029x600",
          templateId: "品牌館Top Banner_1029x600",
          templateFile: "品牌館Top Banner_1029x600.json",
        };
      },

      beforeApplyRecordToTemplate({ template, record, helpers }) {
        const productLayer = Object.values(template?.layers || {}).find((layer) =>
          helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm('P_範圍')
        );
        if (productLayer) {
          Object.assign(productLayer, {
            type: 'image', role: 'product', assetFilename: String(productLayer.assetFilename || ''),
            keepAspectRatio: true, sizingMode: 'containByPBox',
            targetWidth: 387, targetHeight: 313, maxTargetHeight: 313, widthLimitPolicy: 'pBox',
          });
          productLayer.effects = { ...(productLayer.effects || {}), maskBy: '右_上方Bar', shadow: { enabled: false } };
        }
        const filename = String(record?.['檔名'] || '').trim();
        if (filename) record.__outputName = filename;
        record['商品圖2'] = '';
      },

      afterApplyRecordToTemplate({ template, record, helpers }) {
        const findLayer = (name) => Object.values(template.layers || {}).find((layer) =>
          helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm(name)
        );
        const setText = (name, value) => {
          const layer = findLayer(name);
          if (!layer || value === undefined || value === null || String(value).trim() === '') return;
          layer.text = String(value).trim(); layer.hidden = false;
        };
        const applyMetrics = (name) => {
          const layer = findLayer(name); const m = TEMPLATE_LAYER_METRICS[name];
          if (!layer || !m) return;
          for (const [key, value] of Object.entries(m)) { if (key !== 'cornerRadius') layer[key] = value; }
          if (name === 'LINE POINTS_Bar') {
            layer.shape = { ...(layer.shape || {}), kind: 'roundedRectangle', fill: m.fill, cornerRadius: m.cornerRadius };
            layer.cornerRadii = { topLeft: m.cornerRadius, topRight: m.cornerRadius, bottomRight: m.cornerRadius, bottomLeft: m.cornerRadius };
          }
        };

        const lines = helpers.normalizeRecordText(record?.['文案'] || record?.['副標'] || '')
          .split('\n').map((line) => line.trim()).filter(Boolean)
          .filter((line) => !/[（(]%數TBC[）)]/i.test(line));
        setText('回饋文案', lines.find((line) => /^最高.*回饋$/.test(line)) || '');
        setText('回饋警語', lines.find((line) => line.includes('回饋僅限指定商店')) || '');
        setText('店名', record?.['店名']);

        const rawPercent = String(record?.['LINE_POINTS_PERCENT'] ?? '').trim();
        if (rawPercent) {
          const numeric = Number(rawPercent.replace('%', '').trim());
          const percentText = rawPercent.includes('%') ? rawPercent : Number.isFinite(numeric)
            ? `${Math.round((numeric > 0 && numeric < 1 ? numeric * 100 : numeric) * 100) / 100}%` : rawPercent;
          setText('LINE POINTS %', percentText);
        }
        applyMetrics('LINE POINTS');
        applyMetrics('LINE POINTS_Bar');

        const logoShadow = { enabled: true, color: '#f26602', angle: 117, opacity: 0.51, distance: 2, size: 6 };
        const shadowLogos = new Set(['18號會員日_LOGO_白', '蝦皮購物_LOGO_白']);
        const cleanLogos = new Set(['蝦皮購物_純文字LOGO_橘', '蝦皮商城_純文字LOGO_紅', '蝦皮直營_純文字LOGO_紅']);
        for (const layer of Object.values(template.layers || {})) {
          const name = String(layer?.psdName || layer?.name || '').trim();
          if (shadowLogos.has(name)) {
            layer.effects = { ...(layer.effects || {}), shadow: { ...logoShadow } };
          } else if (cleanLogos.has(name)) {
            layer.effects = { ...(layer.effects || {}), shadow: { enabled: false } };
            layer.opacity = 1; layer.blendMode = 'normal'; layer.renderQuality = 'clean-logo';
          } else if (layer.effects?.shadow) {
            const { shadow, ...rest } = layer.effects; layer.effects = rest;
          }
          delete layer.dropShadow; delete layer.shadow;
        }

        const productLayer = findLayer('P_範圍');
        if (productLayer) {
          productLayer.role = 'product'; productLayer.opacity = 1; productLayer.blendMode = 'normal';
          productLayer.effects = { ...(productLayer.effects || {}), maskBy: '右_上方Bar', shadow: { enabled: false } };
          delete productLayer.dropShadow; delete productLayer.shadow;
        }
        const green = findLayer('綠色色塊');
        if (green) green.effects = { ...(green.effects || {}), maskBy: '白色色塊' };
      },
    },
  });
})();
