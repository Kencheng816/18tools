/* APP首頁膠囊APP (下半天2)_1029x249 專屬規則 */
(function () {
  'use strict';

  const FAMILY = 'app_home_capsule_lower2_1029x249';
  const TEMPLATE_ID = 'APP首頁膠囊APP (下半天2)_1029x249';

  function findLayer(template, helpers, name) {
    return Object.values(template?.layers || {}).find((layer) =>
      helpers.norm(layer?.psdName || layer?.name || '') === helpers.norm(name)
    ) || null;
  }

  function ensureShapeMask(template, sourceLayer, maskKey) {
    if (!sourceLayer || template.layers?.[maskKey]) return;
    template.layers[maskKey] = {
      ...JSON.parse(JSON.stringify(sourceLayer)),
      name: maskKey,
      psdName: maskKey,
      type: 'shape',
      hidden: true,
      locked: true,
      role: 'mask',
      assetFilename: '',
      effects: {},
    };
  }

  window.TemplateRuleRegistry.register(FAMILY, {
    label: TEMPLATE_ID,
    priority: 130,
    targets: [TEMPLATE_ID, 'APP首頁膠囊APP (下半天2)'],
    tokens: ['APP首頁膠囊APP (下半天2)', 'APP首頁膠囊APP'],

    rules: {
      shapeLayers: {
        '白色色塊': { renderer: 'roundedRectangle', radiusMode: 'psd', usePsdRadii: true },
        '綠色色塊': { renderer: 'rectangle' },
        'P_範圍_遮罩': { renderer: 'roundedRectangle', radiusMode: 'psd', usePsdRadii: true },
      },

      productImageBox: {
        x: 582, y: 15, width: 220, height: 220,
        centerX: 692, centerY: 125,
        targetWidth: 220, targetHeight: 220, maxTargetHeight: 220,
        sizingMode: 'containByPBox', widthLimitPolicy: 'pBox',
      },

      resolveRecordTemplateRoute({ block, record, helpers }) {
        const placement = String(record?.['版位'] || block?.name || '').trim();
        if (helpers.norm(placement) !== helpers.norm('APP首頁膠囊APP (下半天2)')) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: TEMPLATE_ID,
          templateId: TEMPLATE_ID,
          templateFile: `${TEMPLATE_ID}.json`,
        };
      },

      beforeApplyRecordToTemplate({ template, record, helpers }) {
        const productLayer = findLayer(template, helpers, 'P_範圍');
        if (productLayer) {
          ensureShapeMask(template, productLayer, 'P_範圍_遮罩');
          Object.assign(productLayer, {
            type: 'image', role: 'product', keepAspectRatio: true,
            sizingMode: 'containByPBox', widthLimitPolicy: 'pBox',
            targetWidth: 220, targetHeight: 220, maxTargetHeight: 220,
          });
          productLayer.effects = {
            ...(productLayer.effects || {}),
            maskBy: 'P_範圍_遮罩',
            shadow: { enabled: false },
          };
        }
        record['商品圖2'] = '';
        const filename = String(record?.['檔名'] || '').trim();
        if (filename) record.__outputName = filename;
      },

      afterApplyRecordToTemplate({ template, record, helpers }) {
        const setText = (name, value) => {
          const layer = findLayer(template, helpers, name);
          const text = String(value ?? '').trim();
          if (!layer || !text) return;
          layer.text = text;
          layer.hidden = false;
        };

        const lines = helpers.normalizeRecordText(record?.['文案'] || record?.['副標'] || '')
          .split('\n').map((line) => line.trim()).filter(Boolean)
          .filter((line) => !/[（(]%數TBC[）)]/i.test(line));
        setText('回饋文案', lines.find((line) => /^最高.*回饋$/.test(line)) || '');
        setText('回饋警語', lines.find((line) => line.includes('回饋僅限指定商店')) || '');

        const logoShadow = {
          enabled: true, color: '#f26602', angle: 117,
          opacity: 0.51, distance: 2, size: 6,
        };
        const logoAssets = {
          '蝦皮購物18號會員日_LOGO_白': '蝦皮購物18號會員日_LOGO_白.svg',
          '蝦皮購物_純文字LOGO_橘': '蝦皮購物_純文字LOGO_橘.svg',
          '蝦皮商城_純文字LOGO_紅': '蝦皮商城_純文字LOGO_紅.svg',
          '蝦皮直營_純文字LOGO_紅': '蝦皮直營_純文字LOGO_紅.svg',
        };

        Object.entries(logoAssets).forEach(([name, filename]) => {
          const layer = findLayer(template, helpers, name);
          if (!layer) return;
          const match = helpers.findAssetFilename(filename, { template, layer, layerKey: name });
          if (match.found) layer.assetFilename = match.filename;
          layer.opacity = 1;
          layer.blendMode = 'normal';
          delete layer.dropShadow;
          delete layer.shadow;
          if (name === '蝦皮購物18號會員日_LOGO_白') {
            layer.effects = { ...(layer.effects || {}), shadow: { ...logoShadow } };
          } else {
            layer.effects = { ...(layer.effects || {}), shadow: { enabled: false } };
            layer.renderQuality = 'clean-logo';
          }
        });

        const greenLayer = findLayer(template, helpers, '綠色色塊');
        if (greenLayer) {
          greenLayer.effects = {
            ...(greenLayer.effects || {}),
            maskBy: '白色色塊',
          };
        }

        const productLayer = findLayer(template, helpers, 'P_範圍');
        if (productLayer) {
          productLayer.role = 'product';
          productLayer.opacity = 1;
          productLayer.blendMode = 'normal';
          productLayer.effects = {
            ...(productLayer.effects || {}),
            maskBy: 'P_範圍_遮罩',
            shadow: { enabled: false },
          };
          delete productLayer.dropShadow;
          delete productLayer.shadow;
        }
      },
    },
  });
})();
