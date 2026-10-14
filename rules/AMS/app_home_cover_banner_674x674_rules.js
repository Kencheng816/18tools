/* APP首頁蓋版APP (上半天)_674x674 專屬規則 */
(function () {
  'use strict';

  const FAMILY = "app_home_cover_banner_674x674";
  const TEMPLATE_LAYER_METRICS = {
  "LINE POINTS": {
    "x": 238,
    "y": 612,
    "width": 140,
    "height": 18,
    "centerX": 308,
    "centerY": 621,
    "fontSizePt": 19.24,
    "fontSizePx": 19.24,
    "lineHeight": 23.09,
    "letterSpacing": 0,
    "align": "center",
    "fontFamily": "ShopeeNotoSans Content",
    "fontStyle": "Bold",
    "fontWeight": "700"
  },
  "LINE POINTS_Bar": {
    "x": 230,
    "y": 606,
    "width": 158,
    "height": 31,
    "centerX": 309,
    "centerY": 621.5,
    "fill": "#39BE00",
    "cornerRadius": 15.5
  }
};

  window.TemplateRuleRegistry.register(FAMILY, {
    label: "APP首頁蓋版APP (上半天)_674x674",
    priority: 130,
    targets: ["APP首頁蓋版APP (上半天)_674x674", "APP首頁蓋版APP (上半天)"],
    tokens: ["APP首頁蓋版APP (上半天)"],

    rules: {
      shapeLayers: {
        '白色色塊': { renderer: 'roundedRectangle', radiusMode: 'psd', usePsdRadii: true },
        '綠色色塊': { renderer: 'rectangle' },
        '右_上方Bar': { renderer: 'roundedRectangle', cornerRadii: { topLeft: 20, topRight: 20, bottomRight: 0, bottomLeft: 0 } },
        '右_下方Bar': { renderer: 'roundedRectangle', cornerRadii: { topLeft: 0, topRight: 0, bottomRight: 20, bottomLeft: 20 } },
      },

      productImageBox: {
        "x": 113,
        "y": 339,
        "width": 448,
        "height": 224,
        "centerX": 337,
        "centerY": 451,
        "targetWidth": 448,
        "targetHeight": 224,
        "maxTargetHeight": 224,
        "sizingMode": "containByPBox",
        "widthLimitPolicy": "pBox"
},

      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm("APP首頁蓋版APP (上半天)")) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: "APP首頁蓋版APP (上半天)_674x674",
          templateId: "APP首頁蓋版APP (上半天)_674x674",
          templateFile: "APP首頁蓋版APP (上半天)_674x674.json",
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
            targetWidth: 448, targetHeight: 224, maxTargetHeight: 224, widthLimitPolicy: 'pBox',
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
