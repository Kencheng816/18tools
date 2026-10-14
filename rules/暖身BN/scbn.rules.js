/* SCBN template rules – scoped to Excel 製作內容 = SCBN only. */
(function () {
  'use strict';

  const FAMILY = 'scbn';
  const TEMPLATE_ID = '07_SCBN';

  const ASSETS = Object.freeze({
    logo: '18號會員日_LOGO.svg',
    freeShippingCar: 'SCBN_免運車.png',
    ctaShopNow: 'SCBN_CTA.png',
  });

  const CTA_ASSET_MAP = Object.freeze({
    '逛逛去': ASSETS.ctaShopNow,
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

  function getProductText(record = {}) {
    return findRecordValue(record, ['商品圖1', '商品圖2', '(左)商品圖', '(右)商品圖']);
  }

  function getCtaText(record = {}) {
    return findRecordValue(record, ['CTA', 'CTA文案', 'CTA按鈕', '按鈕']);
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

  function productWantsFreeShippingCar(record = {}) {
    const product = normalize(getProductText(record));
    return product === normalize('免運車') || product.includes(normalize('免運車'));
  }

  function resolveCtaAsset(record = {}) {
    const cta = getCtaText(record);
    const normalizedCta = normalize(cta);
    if (!cta) return null;

    // 若前置 hook 已把 CTA 改成實際素材檔名，後置 hook 仍可再次套用，避免 core 流程清掉。
    if (/\.(png|jpe?g|webp|svg)$/i.test(cta)) {
      return { label: record.__SCBN_ORIGINAL_CTA || cta, asset: cta };
    }

    const matched = Object.entries(CTA_ASSET_MAP).find(([label]) => normalize(label) === normalizedCta);
    return matched ? { label: cta, asset: matched[1] } : null;
  }

  function findLayerByWordsAnyType(template, words = []) {
    const wanted = words.map(normalize).filter(Boolean);
    return Object.values(template?.layers || {}).find((layer) => {
      const label = normalize(`${layer?.psdName || ''} ${layer?.role || ''} ${layer?.assetFilename || ''} ${layer?.text || ''}`);
      return wanted.some((word) => label.includes(word));
    }) || null;
  }

  function setImageLayer(layer, assetFilename) {
    if (!layer || !assetFilename) return false;
    layer.type = 'image';
    layer.assetFilename = assetFilename;
    layer.hidden = false;
    layer.keepAspectRatio = true;
    layer.text = '';
    return true;
  }

  function setImageAssetAnyType(template, words, assetFilename) {
    const directKey = words.find((key) => template?.layers?.[key]);
    const layer = directKey ? template.layers[directKey] : findLayerByWordsAnyType(template, words);
    return setImageLayer(layer, assetFilename);
  }

  function applyCTA(template, record, diagnostics, options = {}) {
    const resolved = resolveCtaAsset(record);
    if (!resolved) return false;

    // 關鍵修正：core/app.core.js 會在 before hook 後再次用 record['CTA'] 去找素材。
    // 若 record['CTA'] 還是「逛逛去」，core 會找不到圖片並清空 CTA 圖層。
    // 因此在 before hook 先把 CTA 欄位改成真正素材檔名，並保存原始文案供診斷使用。
    if (options.rewriteRecord !== false) {
      record.__SCBN_ORIGINAL_CTA = record.__SCBN_ORIGINAL_CTA || resolved.label;
      record.CTA = resolved.asset;
    }

    const ok = setImageAssetAnyType(template, ['cta', 'CTA', '按鈕', 'button', 'btn'], resolved.asset);
    diagnostics?.push?.({
      field: 'CTA',
      status: ok ? 'ok' : 'missing-layer',
      value: record.__SCBN_ORIGINAL_CTA || resolved.label,
      filename: resolved.asset,
      target: options.phase ? `SCBN CTA Resolver (${options.phase})` : 'SCBN CTA Resolver',
    });
    return ok;
  }

  function hideTitleLayer(template) {
    const layer = Object.values(template?.layers || {}).find((item) => {
      if (item?.type !== 'text') return false;
      const label = normalize(`${item?.psdName || ''} ${item?.role || ''}`);
      return label.includes(normalize('主標')) || label.includes('title');
    });
    if (layer) layer.hidden = true;
  }

  const SCBNTemplateRules = {
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

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      applyCTA(template, record, diagnostics, { phase: 'before', rewriteRecord: true });

      U.setImageAsset?.(template, ['18號會員日_LOGO', '18號會員日 LOGO', '會員日'], ASSETS.logo);

      if (titleWantsMemberDayLogo(record)) {
        hideTitleLayer(template);
        diagnostics?.push?.({ field: '主標', status: 'ok', value: getTitleText(record), target: ASSETS.logo });
      }

      if (productWantsFreeShippingCar(record)) {
        const ok = setImageAssetAnyType(template, ['免運車', '商品圖1', 'product'], ASSETS.freeShippingCar);
        diagnostics?.push?.({ field: '商品圖1', status: ok ? 'ok' : 'missing-layer', value: getProductText(record), filename: ASSETS.freeShippingCar });
      }
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      // 再套用一次，確保 core 的通用 CTA / 商品圖流程不會把 SCBN 專屬 CTA 清掉。
      applyCTA(template, record, diagnostics, { phase: 'after', rewriteRecord: false });
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
