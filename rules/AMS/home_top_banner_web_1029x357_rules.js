/* 首頁 Top banner(web) 1029x357 專屬規則 */
(function () {
  'use strict';

  const FAMILY = 'home_top_banner_web_1029x357';

  // LINE POINTS 與 LINE POINTS_Bar 的位置、尺寸與字級，以最新公版 JSON 為基準。
  const TEMPLATE_LAYER_METRICS = {
    "LINE POINTS": {
      "x": 611,
      "y": 301,
      "width": 153,
      "height": 19,
      "centerX": 687.5,
      "centerY": 310.5,
      "fontSizePt": 21,
      "fontSizePx": 21,
      "lineHeight": 25.2,
      "letterSpacing": 0,
      "align": "center",
      "fontFamily": "ShopeeNotoSans Content",
      "fontStyle": "Bold",
      "fontWeight": "700"
    },
    "LINE POINTS_Bar": {
      "x": 600,
      "y": 295,
      "width": 175,
      "height": 31,
      "centerX": 687.5,
      "centerY": 310.5,
      "fill": "#39BE00",
      "cornerRadius": 15.5
    }
  };

  window.TemplateRuleRegistry.register(FAMILY, {
    label: '首頁Top banner(web)_1029x357',
    priority: 110,
    targets: [
      '首頁Top banner(web)_1029x357',
      '首頁Top banner(web)',
    ],
    tokens: ['首頁Top banner(web)'],

    rules: {
      shapeLayers: {
        '白色色塊': {
          renderer: 'roundedRectangle',
          radiusMode: 'psd',
          usePsdRadii: true,
        },
        '綠色色塊': {
          renderer: 'rectangle',
        },
        '右_上方Bar': {
          renderer: 'roundedRectangle',
          cornerRadii: {
            topLeft: 20,
            topRight: 20,
            bottomRight: 0,
            bottomLeft: 0,
          },
        },
        '右_下方Bar': {
          renderer: 'roundedRectangle',
          cornerRadii: {
            topLeft: 0,
            topRight: 0,
            bottomRight: 20,
            bottomLeft: 20,
          },
        },
      },

      productImageBox: {
        x: 512,
        y: 24,
        width: 404,
        height: 228,
        centerX: 714,
        centerY: 138,
        targetWidth: 404,
        targetHeight: 228,
        maxTargetHeight: 228,
        sizingMode: 'containByPBox',
        widthLimitPolicy: 'pBox',
      },

      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm('首頁Top banner(web)')) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: '首頁Top banner(web)_1029x357',
          templateId: '首頁Top banner(web)_1029x357',
          templateFile: '首頁Top banner(web)_1029x357.json',
        };
      },

      beforeApplyRecordToTemplate({ template, record, helpers }) {
        const productLayer = Object.values(template?.layers || {}).find((layer) =>
          helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm('P_範圍')
        );
        if (productLayer) {
          productLayer.type = 'image';
          productLayer.role = 'product';
          productLayer.assetFilename = String(productLayer.assetFilename || '');
          productLayer.keepAspectRatio = true;
          productLayer.sizingMode = 'containByPBox';
          productLayer.targetWidth = 404;
          productLayer.targetHeight = 228;
          productLayer.maxTargetHeight = 228;
          productLayer.widthLimitPolicy = 'pBox';
          productLayer.effects = {
            ...(productLayer.effects || {}),
            maskBy: '右_上方Bar',
            shadow: { enabled: false },
          };
        }

        const filename = String(record?.['檔名'] || '').trim();
        if (filename) record.__outputName = filename;
        record['商品圖2'] = '';
      },

      afterApplyRecordToTemplate({ template, record, helpers }) {
        const findLayerByName = (name) => Object.values(template.layers || {}).find((layer) =>
          helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm(name)
        );

        const applyTemplateLayerMetrics = (name) => {
          const layer = findLayerByName(name);
          const metrics = TEMPLATE_LAYER_METRICS[name];
          if (!layer || !metrics) return;

          for (const [key, value] of Object.entries(metrics)) {
            if (key === 'cornerRadius') continue;
            layer[key] = value;
          }

          if (name === 'LINE POINTS_Bar') {
            layer.shape = {
              ...(layer.shape || {}),
              kind: 'roundedRectangle',
              fill: metrics.fill,
              cornerRadius: metrics.cornerRadius,
            };
            layer.cornerRadii = {
              topLeft: metrics.cornerRadius,
              topRight: metrics.cornerRadius,
              bottomRight: metrics.cornerRadius,
              bottomLeft: metrics.cornerRadius,
            };
          }
        };

        const setText = (name, value) => {
          const layer = findLayerByName(name);
          if (!layer || value === undefined || value === null || String(value).trim() === '') return;
          layer.text = String(value).trim();
          layer.hidden = false;
        };

        const copyLines = helpers.normalizeRecordText(record?.['文案'] || record?.['副標'] || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => !/[（(]%數TBC[）)]/i.test(line));
        const rewardCopy = copyLines.find((line) => /^最高.*回饋$/.test(line)) || '';
        const legalCopy = copyLines.find((line) => line.includes('回饋僅限指定商店')) || '';
        setText('回饋文案', rewardCopy);
        setText('回饋警語', legalCopy);
        setText('店名', record?.['店名']);

        const rawPercent = String(record?.['LINE_POINTS_PERCENT'] ?? '').trim();
        if (rawPercent) {
          const numeric = Number(rawPercent.replace('%', '').trim());
          const percentText = rawPercent.includes('%')
            ? rawPercent
            : Number.isFinite(numeric)
              ? `${Math.round((numeric > 0 && numeric < 1 ? numeric * 100 : numeric) * 100) / 100}%`
              : rawPercent;
          setText('LINE POINTS %', percentText);
        }

        // 工單只更新文字內容，不允許改寫 LINE POINTS 與 Bar 的模板幾何資料。
        applyTemplateLayerMetrics('LINE POINTS');
        applyTemplateLayerMetrics('LINE POINTS_Bar');

        const logoShadow = {
          enabled: true,
          color: '#f26602',
          angle: 117,
          opacity: 0.51,
          distance: 2,
          size: 6,
        };
        const shadowLogoNames = new Set(['18號會員日_LOGO_白', '蝦皮購物_LOGO_白']);
        const cleanLogoNames = new Set([
          '蝦皮購物_純文字LOGO_橘',
          '蝦皮商城_純文字LOGO_紅',
          '蝦皮直營_純文字LOGO_紅',
        ]);

        for (const layer of Object.values(template.layers || {})) {
          const name = String(layer?.psdName || layer?.name || '').trim();

          if (shadowLogoNames.has(name)) {
            layer.effects = { ...(layer.effects || {}), shadow: { ...logoShadow } };
            delete layer.dropShadow;
            delete layer.shadow;
            continue;
          }

          if (cleanLogoNames.has(name)) {
            layer.effects = { ...(layer.effects || {}), shadow: { enabled: false } };
            layer.opacity = 1;
            layer.blendMode = 'normal';
            layer.renderQuality = 'clean-logo';
            delete layer.dropShadow;
            delete layer.shadow;
            continue;
          }

          if (layer.effects?.shadow) {
            const { shadow, ...remainingEffects } = layer.effects;
            layer.effects = remainingEffects;
          }
          delete layer.dropShadow;
          delete layer.shadow;
        }

        const productLayer = findLayerByName('P_範圍');
        if (productLayer) {
          productLayer.role = 'product';
          productLayer.effects = {
            ...(productLayer.effects || {}),
            maskBy: '右_上方Bar',
            shadow: { enabled: false },
          };
          productLayer.opacity = 1;
          productLayer.blendMode = 'normal';
          delete productLayer.dropShadow;
          delete productLayer.shadow;
        }

        const greenLayer = findLayerByName('綠色色塊');
        if (greenLayer) {
          greenLayer.effects = { ...(greenLayer.effects || {}), maskBy: '白色色塊' };
        }
      },
    },
  });
})();
