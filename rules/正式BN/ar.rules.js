/* AR template rules – scoped to Excel 製作內容 = AR only.
 *
 * Template selector:
 *   1. AR案型 / 票券案型 contains LOGO -> 08_AR_LOGO.json
 *      - LOGO asset name follows case text, e.g. 直式_18號會員日_LOGO -> 直式_18號會員日_LOGO.svg
 *   2. AR案型 / 票券案型 contains VIP -> 08_AR_LOGO+案型.json
 *      - VIP text is replaced by VIP_icon.svg; remaining text is applied to 案型 layer(s)
 *   3. all other AR case text -> 08_AR_案型.json
 *      - 4 Chinese chars split into 2 / 2
 *      - text + number or number + text split at the number boundary
 */
(function () {
  'use strict';

  const FAMILY = 'ar';
  const TEMPLATE_LOGO = '08_AR_LOGO';
  const TEMPLATE_LOGO_CASE = '08_AR_LOGO+案型';
  const TEMPLATE_CASE = '08_AR_案型';
  const FILE_CASE = '08_AR_#U6848#U578b.json';
  const VIP_ICON_ASSET = 'VIP_icon.svg';

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));

  function getTheme() {
    return window.TemplateThemes?.AR || { background: '#FFA200' };
  }

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function getCaseText(record = {}) {
    // app.core.js 目前可能會把 Excel「AR案型」辨識成通用欄位「票券案型」。
    // 因此這裡同時支援 AR案型 / AR文案 / 票券案型 / 案型。
    return findRecordValue(record, ['AR案型', 'AR文案', '票券案型', '案型']);
  }

  function normalizeProductionContent(value) {
    return toText(value)
      .toLowerCase()
      .replace(/[＿－—–]/g, '_')
      .replace(/[\s\u00a0\u3000\t\r\n]+/g, '_')
      .replace(/[^a-z0-9_\u4e00-\u9fff]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function isARProductionContent(blockName) {
    // 僅 Excel「製作內容」下方的值等於 AR 時才套用。
    // AR Large BN 是獨立製作物，不進這支 rule。
    return normalizeProductionContent(blockName) === 'ar';
  }

  function hasVipCase(value) {
    return /VIP/i.test(toText(value));
  }

  function hasLogoCase(value) {
    return /LOGO/i.test(toText(value));
  }

  function toSvgAssetName(value) {
    const name = toText(value).replace(/\.svg$/i, '').trim();
    return name ? `${name}.svg` : '';
  }

  function resolveVariant(record = {}) {
    const caseText = getCaseText(record);

    if (hasLogoCase(caseText)) {
      return {
        key: 'ar_logo',
        templateId: TEMPLATE_LOGO,
        templateFile: `${TEMPLATE_LOGO}.json`,
        outputPrefix: 'AR_LOGO',
      };
    }

    if (hasVipCase(caseText)) {
      return {
        key: 'ar_logo_case',
        templateId: TEMPLATE_LOGO_CASE,
        templateFile: `${TEMPLATE_LOGO_CASE}.json`,
        outputPrefix: 'AR_LOGO+案型',
      };
    }

    return {
      key: 'ar_case',
      templateId: TEMPLATE_CASE,
      templateFile: FILE_CASE,
      outputPrefix: 'AR_案型',
    };
  }

  function stripVipKeyword(value) {
    return toText(value)
      .replace(/VIP/gi, '')
      .replace(/[＿_\-–—]+/g, '')
      .trim();
  }

  function splitCaseText(value) {
    const text = stripVipKeyword(value);
    if (!text) return { top: '', bottom: '' };

    // Excel 內若已手動換行，尊重原本換行。
    const explicitParts = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    if (explicitParts.length >= 2) {
      return { top: explicitParts[0], bottom: explicitParts.slice(1).join('\n') };
    }

    // 文字 + 數字：全站94折 -> 全站 / 94折；現折$100 -> 現折 / $100
    const textThenNumber = text.match(/^(.+?)([$＄]?\d[\d,]*(?:\.\d+)?(?:%|％|折|元|點|蝦幣)?)$/);
    if (textThenNumber && textThenNumber[1] && textThenNumber[2]) {
      return { top: textThenNumber[1].trim(), bottom: textThenNumber[2].trim() };
    }

    // 數字 + 文字：800蝦幣 -> 800 / 蝦幣
    const numberThenText = text.match(/^([$＄]?\d[\d,]*(?:\.\d+)?)(.+)$/);
    if (numberThenText && numberThenText[1] && numberThenText[2]) {
      return { top: numberThenText[1].trim(), bottom: numberThenText[2].trim() };
    }

    // 基本型：4 個字固定拆 2 / 2。以 Array.from 處理中英文混排與 emoji 長度。
    const chars = Array.from(text);
    if (chars.length === 4) {
      return { top: chars.slice(0, 2).join(''), bottom: chars.slice(2).join('') };
    }

    return { top: text, bottom: '' };
  }

  function setTextLayer(layers, key, value) {
    if (layers[key]?.type !== 'text') return;
    layers[key].text = value;
    layers[key].hidden = !value;
  }

  function applyCaseText(template, record) {
    const raw = getCaseText(record);
    if (!raw) return;

    const displayText = stripVipKeyword(raw);
    const { top, bottom } = splitCaseText(raw);
    const layers = template?.layers || {};

    setTextLayer(layers, '案型_上', top);
    setTextLayer(layers, '案型_下', bottom);
    setTextLayer(layers, 'AR案型', displayText);
    setTextLayer(layers, '案型', displayText);
  }

  function applyLogoAsset(template, record) {
    const caseText = getCaseText(record);
    if (!caseText) return;

    if (hasLogoCase(caseText)) {
      const logoAsset = toSvgAssetName(caseText);
      U.setImageAsset?.(template, [
        caseText,
        caseText.replace(/\.svg$/i, ''),
        'AR_LOGO',
        'LOGO',
        '直式_18號會員日_LOGO',
      ], logoAsset);
      return;
    }

    if (hasVipCase(caseText)) {
      U.setImageAsset?.(template, [
        'VIP_icon',
        'VIP_ICON',
        'VIP_LOGO',
        'VIP LOGO',
        'VIP',
      ], VIP_ICON_ASSET);
    }
  }

  function applySolidBackground(template) {
    const layers = template?.layers || {};
    const bgKey = Object.keys(layers).find((key) => {
      const label = normalize(`${key} ${layers[key]?.psdName || ''}`);
      return label.includes(normalize('KV_BG')) || label.includes('kvbg');
    });
    if (!bgKey) return false;

    const bg = layers[bgKey];
    const shape = U.makeSolidRectFromLayer?.(bg, getTheme().background);
    if (!shape) return false;

    layers[bgKey] = shape;
    if (Array.isArray(template.renderOrder) && !template.renderOrder.includes(bgKey)) {
      template.renderOrder.unshift(bgKey);
    }
    return true;
  }

  const ARTemplateRules = {
    resolveRecordTemplateRoute({ block, record }) {
      if (!isARProductionContent(block?.name)) return null;

      const variant = resolveVariant(record);
      return {
        key: variant.key,
        family: FAMILY,
        label: variant.templateId,
        templateId: variant.templateId,
        templateFile: variant.templateFile || `${variant.templateId}.json`,
        outputPrefix: variant.outputPrefix,
      };
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      const caseText = getCaseText(record);
      applySolidBackground(template);
      applyLogoAsset(template, record);
      applyCaseText(template, record);
      diagnostics?.push?.({
        field: 'AR案型',
        status: 'ok',
        value: caseText,
        target: template?.sheetTemplateRoute?.sourceTemplateId || '',
      });
    },

    // 保險：core 通用欄位套用後再跑一次，避免案型_上/案型_下被原始 AR案型文字覆蓋。
    afterApplyRecordToTemplate({ template, record }) {
      applySolidBackground(template);
      applyLogoAsset(template, record);
      applyCaseText(template, record);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'AR',
    priority: 9,
    tokens: ['ar', '08_ar', '08 ar'],
    targets: [
      '08_ar_logo',
      '08_ar_logo+案型',
      '08_ar_案型',
      'ar_logo',
      'ar_logo+案型',
      'ar_案型',
    ],
    rules: ARTemplateRules,
  });
})();
