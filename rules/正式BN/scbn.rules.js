/* SCBN template rules – clean SCBN-only price/layout rules. */
(function () {
  'use strict';

  const FAMILY = 'scbn';
  const TEMPLATE_ID = '07_SCBN';

  const ASSETS = Object.freeze({
    logo: '18號會員日_LOGO.svg',
  });

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function getTitleText(record = {}) {
    return findRecordValue(record, ['主標', '主標題', '活動主標(7個字內)']);
  }

  function isSCBNProductionContent(blockName) {
    return normalize(blockName) === normalize('SCBN')
      || normalize(blockName) === normalize('07_SCBN');
  }

  function titleWantsMemberDayLogo(record = {}) {
    const title = normalize(getTitleText(record));
    return title === normalize('18號會員日_LOGO')
      || title === normalize('18號會員日 logo')
      || title === normalize('18號會員日(logo)')
      || title.includes(normalize('18號會員日LOGO'));
  }

  function findLayerEntry(template, words = []) {
    const wanted = words.map(normalize).filter(Boolean);
    return Object.entries(template?.layers || {}).find(([, layer]) => {
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''} ${layer?.text || ''}`);
      return wanted.some((word) => label.includes(word));
    }) || null;
  }

  function hideTitleLayer(template) {
    const layer = Object.values(template?.layers || {}).find((item) => {
      if (item?.type !== 'text') return false;
      const label = normalize(`${item?.psdName || ''} ${item?.role || ''}`);
      return label.includes(normalize('主標')) || label.includes('title');
    });
    if (layer) layer.hidden = true;
  }

  function applyCtaArrowTriangle(template) {
    const entry = findLayerEntry(template, ['CTA_箭頭', 'CTA箭頭', 'CTA Arrow', 'arrow']);
    if (!entry) return false;

    const [, layer] = entry;
    const x = Number(layer.x || 0);
    const y = Number(layer.y || 0);
    const width = Number(layer.width || 17);
    const height = Number(layer.height || 20);
    const fill = layer.fill || layer.shape?.fill || '#FF4B27';
    const points = [
      { x, y },
      { x: x + width, y: y + height / 2 },
      { x, y: y + height },
    ];

    Object.assign(layer, {
      type: 'shape',
      psdName: layer.psdName || 'CTA_箭頭',
      fill,
      hidden: false,
      visible: true,
      assetFilename: '',
      keepAspectRatio: false,
      centerX: x + width / 2,
      centerY: y + height / 2,
      shape: {
        kind: 'ctaArrowRight',
        direction: 'right',
        fill,
        pathBounds: { x, y, width, height, centerX: x + width / 2, centerY: y + height / 2 },
        geometry: {
          kind: 'ctaArrowRight',
          bbox: { x, y, width, height, centerX: x + width / 2, centerY: y + height / 2 },
          corners: points,
        },
        vectorPath: points.map((point) => ({
          anchor: point,
          leftDirection: null,
          rightDirection: null,
          smooth: false,
        })),
      },
    });
    return true;
  }

  function normalizeSCBNRecord(record = {}, diagnostics) {
    // SCBN 商品圖1 走 app.core 通用素材流程：優先 SCBN_商品圖1.png，再找 商品圖1.png。
    // 商品圖2 在 SCBN 工單常用來放雙券價格，例如「92折 + 93折」。
    const product2 = toText(record['商品圖2']);
    const price = toText(record['價格']);
    const looksLikePrice = /(?:\$|折|蝦幣|%|[+＋])/.test(product2);
    if (!price && product2 && looksLikePrice) {
      record['價格'] = product2;
      record['商品圖2'] = '';
      diagnostics?.push?.({ field: '商品圖2', status: 'ok', value: product2, target: 'SCBN 價格欄位轉換' });
    }
  }

  const SCBNTemplateRules = {
    priceRules: {
      enabled: true,
      coordinateMode: 'absolute',
      positioningMode: 'absolute',
      lockToEditedJson: true,
      followProduct: true,
      productFirst: true,
      resolvePriority: 'productFirst',
      disableAnchorSync: false,
      disableContentScale: true,
      enforceProductPriceCount: true,
      defaultColor: '#D0011B',
      anchorLayerName: '商品圖1',
      anchorLayerNames: ['商品圖1', 'P', '曝品', 'product', 'product_1', 'P1'],
      priceRuleSource: 'scbn-edited-json-writeback',
      classifiers: [
        { layoutKey: 'doubleCoupon', keyword: '雙券' },
        { layoutKey: 'singleCoupon', keyword: '單券' },
        { layoutKey: 'vip', regex: 'vip', flags: 'i' },
      ],
      colorRules: [
        { name: 'VIP', regex: 'vip', flags: 'i', color: '#FF770F' },
        { name: '商城券', keyword: '商城券', color: '#D0011B' },
        { name: '全站券', keyword: '全站券', color: '#EE4D2D' },
      ],
      templateLayouts: {
        SCBN_01: {
          templateId: 'SCBN_01',
          productName: '免運車',
          productKey: '免運車',
          layoutKey: 'singleProduct',
          isDoubleCoupon: false,
          productImageBox: {
                    "x": 640,
                    "y": 15,
                    "width": 266,
                    "height": 179,
                    "centerX": 773,
                    "centerY": 104.5,
                    "targetWidth": 266,
                    "targetHeight": 179,
                    "maxTargetHeight": 179,
                    "sizingMode": "containByPBox",
                    "keepAspectRatio": true
          },
          layouts: [],
        },
        SCBN_02: {
          templateId: 'SCBN_02',
          productName: '商城券_雙券',
          productKey: '商城券雙券',
          layoutKey: 'doubleCoupon',
          rawPriceExample: '92折 + 93折',
          isDoubleCoupon: true,
          productImageBox: {
                    "x": 649.2,
                    "y": 10.6,
                    "width": 251.3,
                    "height": 189.7,
                    "centerX": 774.9,
                    "centerY": 105.4,
                    "targetWidth": 251.3,
                    "targetHeight": 189.7,
                    "maxTargetHeight": 189.7,
                    "sizingMode": "containByPBox",
                    "keepAspectRatio": true
          },
          layouts: [
            {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "x": 757.6,
                        "y": 111,
                        "width": 118.3,
                        "height": 67.4,
                        "centerX": 816.75,
                        "centerY": 144.7,
                        "fontSizePx": 60,
                        "fontSizePt": 60,
                        "lineHeight": 64.8,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "lineHeightMultiplier": 1.08,
                        "rotation": 0,
                        "positioningMode": "absolute",
                        "lockToEditedJson": true,
                        "disableAnchorSync": false,
                        "followProduct": true,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "rotationOffset": 0
            },
            {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "x": 719.5,
                        "y": 34.4,
                        "width": 137.9,
                        "height": 71.4,
                        "centerX": 788.45,
                        "centerY": 70.1,
                        "fontSizePx": 60,
                        "fontSizePt": 60,
                        "lineHeight": 64.8,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "lineHeightMultiplier": 1.08,
                        "rotation": 5,
                        "positioningMode": "absolute",
                        "lockToEditedJson": true,
                        "disableAnchorSync": false,
                        "followProduct": true,
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "rotationOffset": 5
            },
          ],
        },
      },
      productLayouts: {
        '免運車': { productName: '免運車', useTemplate: 'SCBN_01' },
        '商城券雙券': {
          productName: '商城券_雙券',
          useTemplate: 'SCBN_02',
          variants: [{ priceIncludes: '92折 + 93折', useTemplate: 'SCBN_02' }],
        },
      },
    },

    resolveRecordTemplateRoute({ block }) {
      if (!isSCBNProductionContent(block?.name)) return null;
      return {
        key: 'scbn',
        family: FAMILY,
        label: 'SCBN',
        templateId: TEMPLATE_ID,
        templateFile: `${TEMPLATE_ID}.json`,
        outputPrefix: 'SCBN',
      };
    },

    layoutRules: {
      applyProgrammaticLayout({ template }) {
        applyCtaArrowTriangle(template);
      },
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      normalizeSCBNRecord(record, diagnostics);
      U.setImageAsset?.(template, ['18號會員日_LOGO', '18號會員日 LOGO', '會員日'], ASSETS.logo);

      if (titleWantsMemberDayLogo(record)) {
        const originalTitle = getTitleText(record);
        hideTitleLayer(template);
        record['主標'] = '';
        diagnostics?.push?.({ field: '主標', status: 'ok', value: originalTitle, target: ASSETS.logo });
      }
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'SCBN',
    priority: 31,
    tokens: ['scbn', '07_scbn', '07 scbn'],
    targets: ['07_scbn', 'scbn'],
    rules: SCBNTemplateRules,
  });
})();
