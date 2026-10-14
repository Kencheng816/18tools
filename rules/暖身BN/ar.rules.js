/* AR template rules – scoped to Excel 製作內容 = AR only.
 * Template selector:
 *   AR案型 / 票券案型 = 直式_18號會員日_LOGO -> 08_AR_LOGO.json
 *   all other AR case text -> 08_AR_案型.json
 */
(function () {
  'use strict';

  const FAMILY = 'ar';
  const TEMPLATE_LOGO = '08_AR_LOGO';
  const TEMPLATE_CASE = '08_AR_案型';
  const FILE_CASE = '08_AR_#U6848#U578b.json';
  const VERTICAL_MEMBER_DAY_LOGO = '直式_18號會員日_LOGO.svg';
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
    // app.core.js 目前會把 Excel「AR案型」辨識成通用欄位「票券案型」。
    // 因此這裡必須同時支援 AR案型 / AR文案 / 票券案型，避免路由抓不到資料後退回第一個 AR 公版。
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

  function isMemberDayLogoCase(value) {
    const n = normalize(value);
    return n === normalize('直式_18號會員日_LOGO')
      || n === normalize('直式18號會員日LOGO')
      || n === normalize('18號會員日LOGO');
  }

  function resolveVariant(record = {}) {
    const caseText = getCaseText(record);
    if (isMemberDayLogoCase(caseText)) {
      return {
        key: 'ar_logo',
        templateId: TEMPLATE_LOGO,
        templateFile: `${TEMPLATE_LOGO}.json`,
        outputPrefix: 'AR_LOGO',
      };
    }

    return {
      key: 'ar_case',
      templateId: TEMPLATE_CASE,
      templateFile: FILE_CASE,
      outputPrefix: 'AR_案型',
    };
  }

  function splitCaseText(value) {
    const text = toText(value).replace(/^VIP\s*限定$/i, '限定').trim();
    if (!text) return { top: '', bottom: '' };

    // Excel 內若已手動換行，尊重原本換行。
    const explicitParts = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    if (explicitParts.length >= 2) return { top: explicitParts[0], bottom: explicitParts.slice(1).join('\n') };

    // AR 案型自動拆行規則：
    // 800蝦幣 -> 800 / 蝦幣
    // 刷卡88折 -> 刷卡 / 88折
    // 夜貓18% -> 夜貓 / 18%
    // 專屬於你 -> 專屬 / 於你
    const patterns = [
      /^(刷卡)(.+)$/,
      /^(夜貓)(.+)$/,
      /^(專屬)(於你)$/,
      /^(全站)(.+)$/,
      /^(限時)(.+)$/,
      /^(老闆)(.+)$/,
      /^(準備)(.+)$/,
      /^(\d+(?:\.\d+)?)(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return { top: match[1].trim(), bottom: match[2].trim() };
    }

    return { top: text, bottom: '' };
  }

  function applyCaseText(template, record) {
    const raw = getCaseText(record);
    if (!raw) return;
    const { top, bottom } = splitCaseText(raw);
    const layers = template?.layers || {};

    if (layers['案型_上']?.type === 'text') {
      layers['案型_上'].text = top;
      layers['案型_上'].hidden = !top;
    }
    if (layers['案型_下']?.type === 'text') {
      layers['案型_下'].text = bottom;
      layers['案型_下'].hidden = !bottom;
    }
    if (layers.AR案型?.type === 'text') {
      layers.AR案型.text = raw.replace(/^VIP\s*/i, '').trim() || '限定';
      layers.AR案型.hidden = !layers.AR案型.text;
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
      U.setImageAsset?.(template, ['直式_18號會員日_LOGO', 'VIP_LOGO', 'VIP LOGO'], VERTICAL_MEMBER_DAY_LOGO);
      applyCaseText(template, record);
      diagnostics?.push?.({ field: 'AR案型', status: 'ok', value: caseText, target: template?.sheetTemplateRoute?.sourceTemplateId || '' });
    },

    // 保險：core 通用欄位套用後再跑一次，避免案型_上/案型_下被原始 AR案型文字覆蓋。
    afterApplyRecordToTemplate({ template, record }) {
      applySolidBackground(template);
      applyCaseText(template, record);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'AR',
    priority: 9,
    tokens: ['ar', '08_ar', '08 ar'],
    targets: ['08_ar_logo', '08_ar_案型', 'ar_logo', 'ar_案型'],
    rules: ARTemplateRules,
  });
})();
