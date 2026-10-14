/* 我的帳戶 Down banner 1029x264 專屬規則 */
(function () {
  'use strict';

  const FAMILY = 'my_account_down_banner_1029x264';

  // LINE POINTS 與 LINE POINTS_Bar 的位置、尺寸與字級，以最新公版 JSON 為基準。
  const TEMPLATE_LAYER_METRICS = {
    "LINE POINTS": {
      "x": 597,
      "y": 214,
      "width": 153,
      "height": 19,
      "centerX": 673.5,
      "centerY": 223.5,
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
      "x": 586,
      "y": 208,
      "width": 175,
      "height": 31,
      "centerX": 673.5,
      "centerY": 223.5,
      "fill": "#39BE00",
      "cornerRadius": 15.5
    }
  };

  window.TemplateRuleRegistry.register(FAMILY, {
    label: '我的帳戶Down banner_1029x264',
    priority: 100,
    targets: [
      '我的帳戶Down banner_1029x264',
      '我的帳戶Down banner',
    ],
    tokens: ['我的帳戶Down banner', '我的帳戶'],

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
        x: 498,
        y: 24,
        width: 404,
        height: 143,
        centerX: 700,
        centerY: 95.5,
        targetWidth: 404,
        targetHeight: 143,
        maxTargetHeight: 143,
        sizingMode: 'containByPBox',
        widthLimitPolicy: 'pBox',
      },

      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm('我的帳戶Down banner')) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: '我的帳戶Down banner_1029x264',
          templateId: '我的帳戶Down banner_1029x264',
          templateFile: '我的帳戶Down banner_1029x264.json',
        };
      },

      beforeApplyRecordToTemplate({ template, record, helpers }) {
        // 必須在核心掃描商品圖圖層之前，先把 P_範圍定義成可接收商品素材的 image layer。
        // 公版 JSON 已直接設定為 image；這裡保留防呆，避免舊 JSON 或 edited JSON 回寫後退回 shape。
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
          productLayer.targetHeight = 143;
          productLayer.maxTargetHeight = 143;
          productLayer.widthLimitPolicy = 'pBox';
          productLayer.effects = {
            ...(productLayer.effects || {}),
            maskBy: '右_上方Bar',
          };
        }

        // Excel「檔名」直接作為輸出檔名；不再自動追加 _01 / _02。
        const filename = String(record?.['檔名'] || '').trim();
        if (filename) record.__outputName = filename;

        // 此版位的商品圖只使用「GD摳圖LINK」映射後的商品圖1。
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

        // 「文案」只取指定兩行；品牌列與 (%數TBC) 不套入任何文字圖層。
        const copyLines = helpers.normalizeRecordText(record?.['文案'] || record?.['副標'] || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .filter((line) => !/[（(]%數TBC[）)]/i.test(line));
        const rewardCopy = copyLines.find((line) => /^最高.*回饋$/.test(line)) || '';
        const legalCopy = copyLines.find((line) => line.includes('回饋僅限指定商店')) || '';
        setText('回饋文案', rewardCopy);
        setText('回饋警語', legalCopy);

        // 店名完整套入，不使用「短文案+回饋%」欄位。
        setText('店名', record?.['店名']);

        // LINE POINTS %：Excel 可能是 0.03、3 或「3%」，統一顯示成 3%。
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
        const shadowLogoNames = new Set([
          '18號會員日_LOGO_白',
          '蝦皮購物_LOGO_白',
        ]);
        const cleanLogoNames = new Set([
          '蝦皮購物_純文字LOGO_橘',
          '蝦皮商城_純文字LOGO_紅',
          '蝦皮直營_純文字LOGO_紅',
        ]);

        for (const layer of Object.values(template.layers || {})) {
          const name = String(layer?.psdName || layer?.name || '').trim();

          // 僅指定的兩個白色 SVG Logo 套用陰影；其餘圖層明確移除陰影。
          if (shadowLogoNames.has(name)) {
            layer.effects = {
              ...(layer.effects || {}),
              shadow: { ...logoShadow },
            };
            delete layer.dropShadow;
            delete layer.shadow;
            continue;
          }

          if (cleanLogoNames.has(name)) {
            layer.effects = {
              ...(layer.effects || {}),
              shadow: { enabled: false },
            };
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

        const productLayer = Object.values(template.layers || {}).find((layer) =>
          String(layer?.psdName || '').trim() === 'P_範圍'
        );
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

        const greenLayer = Object.values(template.layers || {}).find((layer) =>
          String(layer?.psdName || '').trim() === '綠色色塊'
        );
        if (greenLayer) {
          greenLayer.effects = {
            ...(greenLayer.effects || {}),
            maskBy: '白色色塊',
          };
        }
      },
    },
  });
})();
