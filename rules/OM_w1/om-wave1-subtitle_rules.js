/* OM Wave 1 subtitle rules
 * 副標題欄位由本 Rule 專責處理，避免 app.core.js 與特定公版圖層耦合。
 */
(function registerOmWave1SubtitleRules() {
  'use strict';

  const U = window.TemplateRuleUtils;
  const TARGETS = [
    'Template_1200x1200',
    'Template_1200x628',
    'Template_600x400',
    'UAC-Pmax-LineLAP_960x1200',
    'DPA Frame',
    'LinePoint_960x540',
    'line point_banner1_960x540',
    'line point_960x540',
    'line point_512x512',
    'pixnet_260x480',
    'pixnet_672x560',
    'Rtbhouse_300x250',
    'Rtbhouse_300x600',
    'Rtbhouse_320x480',
    'Rtbhouse_320x50',
    'Rtbhouse_360x640',
    'Rtbhouse_480x320',
    'Rtbhouse_728x90',
  ];

  const NAMES = Object.freeze({
    normal: ['副標題', '副標題_BG'],
    vip: ['蝦皮VIP_LOGO', '蝦皮VIP_副標題_右', '蝦皮VIP_副標題_BG'],
    direct: ['蝦皮直營_LOGO', '蝦皮直營_副標題_右', '蝦皮直營_副標題_BG'],
  });

  // 副標膠囊規則集中設定：
  // padding：副標內容寬於活動 Logo 時的左右留白。
  // threshold：活動 Logo 較寬，但差距在門檻內時，改以副標內容為基準。
  // thresholdPadding：命中門檻時的左右留白。
  const CAPSULE_RULES_BY_TEMPLATE = Object.freeze({
    'Template_1200x1200': {
      normal: { padding: 50, threshold: 50, thresholdPadding: 50 },
      vip: { padding: 50, threshold: 50, thresholdPadding: 50 },
      direct: { padding: 50, threshold: 50, thresholdPadding: 50 },
    },
    'Template_1200x628': {
      normal: { padding: 25, threshold: 25, thresholdPadding: 25 },
      vip: { padding: 25, threshold: 25, thresholdPadding: 25 },
      direct: { padding: 25, threshold: 45, thresholdPadding: 25 },
    },
    'Template_600x400': {
      normal: { padding: 20, threshold: 20, thresholdPadding: 20 },
      vip: { padding: 20, threshold: 30, thresholdPadding: 30 },
      direct: { padding: 20, threshold: 30, thresholdPadding: 10 },
    },
    'UAC-Pmax-LineLAP_960x1200': {
      normal: { padding: 40, threshold: 40, thresholdPadding: 40 },
      vip: { padding: 40, threshold: 60, thresholdPadding: 40 },
      direct: { padding: 40, threshold: 40, thresholdPadding: 40 },
    },
    'LinePoint_960x540': { normal: { padding: 25 } },
    'line point_512x512': { normal: { padding: 28 } },
    'pixnet_672x560': {
      normal: { padding: 20, threshold: 40, thresholdPadding: 20 },
      vip: { padding: 25, threshold: 40, thresholdPadding: 20 },
      direct: { padding: 25, threshold: 40, thresholdPadding: 20 },
    },
    'pixnet_260x480': { normal: { padding: 18 } },
    'Rtbhouse_728x90': { normal: { padding: 24 } },
    'Rtbhouse_480x320': { normal: { padding: 24 } },
    'Rtbhouse_360x640': { normal: { padding: 20 } },
    'Rtbhouse_320x480': { normal: { padding: 18 } },
    'Rtbhouse_320x50': { normal: { padding: 12 } },
    'Rtbhouse_300x600': { normal: { padding: 18 } },
    'Rtbhouse_300x250': { normal: { padding: 16 } },
  });

  const CAPSULE_PADDING_BY_TEMPLATE = Object.freeze(
    Object.fromEntries(
      Object.entries(CAPSULE_RULES_BY_TEMPLATE).map(([templateId, variants]) => [
        templateId,
        Number(variants.normal?.padding ?? variants.vip?.padding ?? variants.direct?.padding ?? 25),
      ])
    )
  );

  function templateIdOf(template) {
    // 批次產圖時 app.core.js 會把 template.templateId 改成輸出檔名，
    // 因此公版規則識別必須優先使用路由保存的原始公版 ID。
    const candidates = [
      template?.sheetTemplateRoute?.sourceTemplateId,
      template?.canvas?.templateId,
      template?.batchSourceName,
      template?.templateId,
    ].map((value) => String(value || '').trim()).filter(Boolean);

    const registeredTemplateIds = Object.keys(CAPSULE_PADDING_BY_TEMPLATE);
    for (const candidate of candidates) {
      const exact = registeredTemplateIds.find((id) => id === candidate);
      if (exact) return exact;

      const normalizedCandidate = candidate.toLowerCase().replace(/[\s_-]+/g, '');
      const normalizedMatch = registeredTemplateIds.find((id) =>
        id.toLowerCase().replace(/[\s_-]+/g, '') === normalizedCandidate
      );
      if (normalizedMatch) return normalizedMatch;
    }

    return candidates[0] || '';
  }

  function capsuleRule(template, variantType = 'normal') {
    const templateRules = CAPSULE_RULES_BY_TEMPLATE[templateIdOf(template)] || {};
    return templateRules[variantType] || templateRules.normal || { padding: 25 };
  }

  function campaignLogoLayer(template) {
    return layer(template, '18號會員日_LOGO_白') || layer(template, '18號會員日_LOGO');
  }

  function campaignLogoWidth(template) {
    const logo = campaignLogoLayer(template);
    return logo ? Math.max(0, Number(logo.width || 0)) : 0;
  }

  function resolveCapsuleWidth(template, contentWidth, options = {}) {
    const actualContentWidth = Math.max(1, Number(contentWidth || 0));
    const logoWidth = campaignLogoWidth(template);
    const variantType = String(options.variantType || 'normal');
    const rule = capsuleRule(template, variantType);
    const padding = Number(rule.padding ?? 25);
    const threshold = Number(rule.threshold ?? -1);
    const thresholdPadding = Number(rule.thresholdPadding ?? padding);

    if (logoWidth > 0 && logoWidth >= actualContentWidth) {
      const widthDifference = logoWidth - actualContentWidth;
      if (threshold >= 0 && widthDifference <= threshold) {
        return actualContentWidth + thresholdPadding * 2;
      }
      return logoWidth;
    }

    return actualContentWidth + padding * 2;
  }

  function entry(template, name) {
    return U.findLayerEntryByExactName(template, name);
  }

  function layer(template, name) {
    return entry(template, name)?.[1] || null;
  }

  function hideAll(template) {
    U.setLayerVisibility(template, [...NAMES.normal, ...NAMES.vip, ...NAMES.direct], false);
  }

  function canvasCenterX(template) {
    return Number(template?.canvas?.width || 0) / 2;
  }

  function subtitleAlignmentCenterX(template) {
    const templateId = String(template?.templateId || template?.canvas?.templateId || '').trim();
    if (/1200x628$/i.test(templateId) || /_1200x628$/i.test(templateId)) {
      const campaignLogo = layer(template, '18號會員日_LOGO_白');
      if (campaignLogo) return Number(campaignLogo.centerX ?? (Number(campaignLogo.x || 0) + Number(campaignLogo.width || 0) / 2));
    }
    return canvasCenterX(template);
  }

  function applyLogoShadowRules(template, record) {
    const media = normalizePresetMedia(record?.__media || '');
    const isDpaFrame = media === 'DPA Frame' || /dpa\s*frame/i.test(templateIdOf(template));
    const targetNames = new Set([
      '蝦皮購物_LOGO_白',
      '直式_18號會員日_LOGO_白',
      '蝦皮購物18號會員日_LOGO_白',
      '18號會員日_LOGO_白',
    ]);
    Object.entries(template?.layers || {}).forEach(([key, item]) => {
      const labels = [key, item?.psdName, String(item?.assetFilename || '').replace(/\.[^.]+$/, '')];
      if (!labels.some((name) => targetNames.has(String(name || '').trim()))) return;

      const isCampaignLogo = labels.some((name) => String(name || '').trim() === '18號會員日_LOGO_白');
      if (isDpaFrame && isCampaignLogo) {
        item.dropShadow = { enabled: false };
        return;
      }

      item.dropShadow = {
        enabled: true,
        color: '#f26602',
        opacity: 0.51,
        blendMode: 'multiply',
        angleDeg: 117,
        distancePx: 2,
        blurPx: 6,
      };
    });
  }

  function setLogoAsset(template, name, filename) {
    const target = layer(template, name);
    if (!target) return false;
    target.assetFilename = filename;
    target.keepAspectRatio = true;
    target.hidden = false;
    return true;
  }

  function textWidth(textLayer, helpers) {
    // 僅量測實際文字 glyph 寬度，不讀取 JSON 原始文字框 width。
    const measured = Math.max(1, Number(helpers.measureTextWidth(textLayer) || 0));
    textLayer.__measuredContentWidth = measured;
    return measured;
  }

  function applyVariant(template, config, suffix, helpers) {
    const logo = layer(template, config.logo);
    const text = layer(template, config.text);
    const bg = layer(template, config.bg);
    if (!logo || !text || !bg) return false;

    hideAll(template);
    setLogoAsset(template, config.logo, config.asset);
    text.text = suffix;
    text.hidden = false;
    bg.hidden = false;

    const gap = 5;
    const logoWidth = Math.max(1, Number(logo.width || 0));
    const measuredTextWidth = textWidth(text, helpers);
    text.width = measuredTextWidth;
    const contentWidth = logoWidth + gap + measuredTextWidth;
    const centerX = subtitleAlignmentCenterX(template);
    const left = centerX - contentWidth / 2;

    logo.x = left;
    logo.centerX = left + logoWidth / 2;
    text.x = left + logoWidth + gap;
    text.centerX = text.x + measuredTextWidth / 2;
    U.resizeCapsuleLayer(bg, {
      width: resolveCapsuleWidth(template, contentWidth, { variantType: config.variantType }),
      centerX,
    });
    return true;
  }

  function applyNormal(template, value, helpers) {
    const text = layer(template, '副標題');
    const bg = layer(template, '副標題_BG');
    if (!text || !bg) return false;

    hideAll(template);
    text.text = value;
    text.hidden = false;
    bg.hidden = false;

    const subtitleWidth = textWidth(text, helpers);
    // 膠囊只依實際副標題內容寬度計算，不比較活動 Logo，也不使用 JSON 文字框寬度。
    const templateId = templateIdOf(template);
    const campaignLogo = campaignLogoLayer(template);
    const centerX = templateId === 'Template_1200x628' && campaignLogo
      ? Number(campaignLogo.centerX ?? (Number(campaignLogo.x || 0) + Number(campaignLogo.width || 0) / 2))
      : Number(bg.centerX ?? text.centerX ?? canvasCenterX(template));
    text.x = centerX - subtitleWidth / 2;
    text.centerX = centerX;
    text.width = subtitleWidth;
    U.resizeCapsuleLayer(bg, { width: resolveCapsuleWidth(template, subtitleWidth, { variantType: 'normal' }), centerX });
    return true;
  }

  // 由「各公版調整價格檔案」edited JSON 完整寫回。
  // 精準索引：曝光媒體 | Layout No. | 尺寸 | 商品素材名稱。
  // 商品圖除幾何值外，也保留 keepAspectRatio / sizingMode / targetWidth 等渲染設定。
  // 精準定位資料已移至每份公版 JSON 的 assetPlacementPresets.items。

  function normalizeAssetStem(value) {
    return String(value || '')
      .trim()
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, '');
  }

  function normalizePresetMedia(value) {
    const raw = String(value || '').trim();
    const compact = raw.toLowerCase().replace(/[\s_\-/]+/g, '');
    if (compact === 'uacpmaxlinelap') return 'UAC/Pmax/LineLAP';
    if (compact === 'linepoint') return 'line point';
    if (compact === 'rtbhouse') return 'Rtbhouse';
    if (compact === 'pixnet') return 'Pixnet';
    if (compact === 'template') return 'Template';
    if (compact === 'dpaframe') return 'DPA Frame';
    return raw;
  }

  function exactLayoutPresetKey(template, record) {
    const media = normalizePresetMedia(record?.__media || '');
    const layoutNo = String(record?.__layoutNo || '').trim().toLowerCase();
    const size = normalizeSize(record?.__size || template?.canvas?.templateId || '');
    const productName = normalizeAssetStem(record?.['商品圖1'] || template?.layers?.product?.assetFilename || '');
    return `${media}|${layoutNo}|${size}|${productName}`;
  }

  function lockExactGeometry(layer, values, options = {}) {
    if (!layer || !values) return false;
    Object.assign(layer, values);

    if (Number.isFinite(Number(values.x)) && Number.isFinite(Number(values.width))) {
      layer.centerX = Number(values.x) + Number(values.width) / 2;
    }
    if (Number.isFinite(Number(values.y)) && Number.isFinite(Number(values.height))) {
      layer.centerY = Number(values.y) + Number(values.height) / 2;
    }

    Object.assign(layer, {
      preserveExactSize: true,
      skipAutoScale: true,
      lockToEditedJson: true,
      positioningMode: 'absolute-edited-json',
      followProduct: false,
      disableAnchorSync: true,
      ...options,
    });
    return true;
  }

  function getTemplatePlacementPresets(template) {
    const config = template?.assetPlacementPresets;
    if (!config || Number(config.schemaVersion) !== 1) return {};
    return config.items && typeof config.items === 'object' && !Array.isArray(config.items)
      ? config.items
      : {};
  }

  function findProductLayerForPreset(template, preferredKey, values = {}) {
    const entries = Object.entries(template?.layers || {}).filter(([key, item]) => {
      if (item?.type !== 'image') return false;
      const name = String(item?.psdName || item?.name || key || '').trim();
      return name !== 'P_範圍' && name !== '_P_範圍';
    });
    const expectedAsset = normalizeAssetStem(values.assetFilename);

    // 動態商品圖層的編號可能因資料夾內容排序而變動；素材檔名比 P_02/P_03 更穩定，優先比素材。
    if (expectedAsset) {
      const byAsset = entries.find(([, item]) => normalizeAssetStem(item?.assetFilename) === expectedAsset);
      if (byAsset) return byAsset[1];
    }

    return template?.layers?.[preferredKey]
      || entries.find(([, item]) => String(item?.psdName || '').trim() === preferredKey)?.[1]
      || null;
  }

  function applyProductPresetGeometry(layer, values) {
    if (!layer || !values) return false;
    // assetFilename 只用於穩定尋找動態圖層，不覆寫素材比對流程已解析出的實際檔名。
    const { assetFilename: _assetFilename, ...geometry } = values;
    return lockExactGeometry(layer, geometry, {
      // 商品圖的 width / height 是 edited JSON 的 P 框資料；真正繪製仍須沿用 JSON 的等比例模式。
      keepAspectRatio: geometry.keepAspectRatio !== false,
      sizingMode: geometry.sizingMode || 'containByPBox',
      targetWidth: Number(geometry.targetWidth ?? geometry.width),
      targetHeight: Number(geometry.targetHeight ?? geometry.height),
      maxTargetHeight: Number(geometry.maxTargetHeight ?? geometry.targetHeight ?? geometry.height),
      ...(Number.isFinite(Number(geometry.maxTargetWidth))
        ? { maxTargetWidth: Number(geometry.maxTargetWidth) }
        : {}),
    });
  }

  function applyExactLayoutPreset(template, record) {
    const presetKey = exactLayoutPresetKey(template, record);
    const preset = getTemplatePlacementPresets(template)[presetKey];
    if (!preset) return false;

    const productLayer = template?.layers?.product
      || Object.values(template?.layers || {}).find((item) => String(item?.psdName || '').trim() === 'P');
    let applied = applyProductPresetGeometry(productLayer, preset.product);

    // 資料夾模式可能同時生成 P_02/P_03；每張額外商品圖都保存自己的絕對位置。
    // preferredKey 只作 fallback，實際套用優先依 assetFilename 找圖層，避免排序變動時套錯素材。
    Object.entries(preset.additionalProducts || {}).forEach(([preferredKey, values]) => {
      const targetLayer = findProductLayerForPreset(template, preferredKey, values);
      applied = applyProductPresetGeometry(targetLayer, values) || applied;
    });

    Object.entries(preset.prices || {}).forEach(([slot, values]) => {
      const priceLayer = template?.layers?.[`__auto_price_v2_${slot}`];
      if (!priceLayer) return;

      const bindToProduct = values.anchorLayerKey === 'product' && productLayer;
      lockExactGeometry(priceLayer, values, bindToProduct ? {
        positioningMode: 'product-image-ratio',
        followProduct: true,
        disableAnchorSync: false,
      } : {});

      if (bindToProduct) {
        const productCenterX = Number(productLayer.centerX ?? (Number(productLayer.x || 0) + Number(productLayer.width || 0) / 2));
        const productCenterY = Number(productLayer.centerY ?? (Number(productLayer.y || 0) + Number(productLayer.height || 0) / 2));
        const priceCenterX = Number(priceLayer.centerX ?? (Number(priceLayer.x || 0) + Number(priceLayer.width || 0) / 2));
        const priceCenterY = Number(priceLayer.centerY ?? (Number(priceLayer.y || 0) + Number(priceLayer.height || 0) / 2));
        priceLayer.anchor = {
          layerKey: 'product',
          baseBox: {
            x: Number(productLayer.x || 0),
            y: Number(productLayer.y || 0),
            width: Number(productLayer.width || 0),
            height: Number(productLayer.height || 0),
            centerX: productCenterX,
            centerY: productCenterY,
          },
          baseRotation: Number(productLayer.rotation || 0),
          offsetX: priceCenterX - productCenterX,
          offsetY: priceCenterY - productCenterY,
          rotationOffset: Number(priceLayer.rotation || 0) - Number(productLayer.rotation || 0),
          baseFontSizePx: Number(priceLayer.fontSizePx || 0),
          baseWidth: Number(priceLayer.width || 0),
          baseHeight: Number(priceLayer.height || 0),
        };
        priceLayer._anchorDirty = false;
      }

      delete priceLayer.anchorLayerKey;
      if (Number.isFinite(Number(values.fontSizePx))) {
        priceLayer.fontSizePt = Number(values.fontSizePx);
        priceLayer.lineHeight = Number(values.lineHeight ?? (Number(values.fontSizePx) * 1.08));
      }
      applied = true;
    });

    if (applied) template.__appliedPlacementPresetKey = presetKey;
    return applied;
  }

  function refreshSubtitleLayout(template) {
    if (!template?.layers) return false;
    const ctx = document.createElement('canvas').getContext('2d');
    const helpers = { measureTextWidth: (item) => window.CapsuleRuleEngine?.measureTextWidth?.(item, ctx) || Number(item?.width || 0) };
    const vipLogo = layer(template, '蝦皮VIP_LOGO');
    const vipText = layer(template, '蝦皮VIP_副標題_右');
    const directLogo = layer(template, '蝦皮直營_LOGO');
    const directText = layer(template, '蝦皮直營_副標題_右');
    const visibleVip = Boolean(vipLogo && vipText && vipLogo.hidden !== true && vipText.hidden !== true);
    const visibleDirect = Boolean(directLogo && directText && directLogo.hidden !== true && directText.hidden !== true);
    if (visibleVip) return applyVariant(template, { logo:'蝦皮VIP_LOGO', text:'蝦皮VIP_副標題_右', bg:'蝦皮VIP_副標題_BG', asset:'蝦皮VIP_LOGO.svg', variantType:'vip' }, String(vipText.text || ''), helpers);
    if (visibleDirect) return applyVariant(template, { logo:'蝦皮直營_LOGO', text:'蝦皮直營_副標題_右', bg:'蝦皮直營_副標題_BG', asset:'蝦皮直營_LOGO.svg', variantType:'direct' }, String(directText.text || ''), helpers);
    const normal = layer(template, '副標題');
    if (normal && !normal.hidden) return applyNormal(template, String(normal.text || ''), helpers);
    return false;
  }

  window.OMWave1SubtitleLayout = Object.freeze({ refresh: refreshSubtitleLayout });

  function afterApplyRecordToTemplate({ template, record, helpers, diagnostics, skipExactLayout }) {
    const raw = helpers.normalizeRecordText(record?.['副標'] ?? record?.['副標題'] ?? '');

    // 副標題是選配欄位；沒有副標時只略過副標排版，不能中止價格等後處理。
    if (raw) {
      const variant = U.resolveSubtitleVariant(raw);
      let applied = false;

      if (variant.type === 'vip') {
        applied = applyVariant(template, {
          logo: '蝦皮VIP_LOGO',
          text: '蝦皮VIP_副標題_右',
          bg: '蝦皮VIP_副標題_BG',
          asset: '蝦皮VIP_LOGO.svg',
          variantType: 'vip',
        }, variant.suffix, helpers);
      } else if (variant.type === 'direct') {
        applied = applyVariant(template, {
          logo: '蝦皮直營_LOGO',
          text: '蝦皮直營_副標題_右',
          bg: '蝦皮直營_副標題_BG',
          asset: '蝦皮直營_LOGO.svg',
          variantType: 'direct',
        }, variant.suffix, helpers);
      }

      // 部分媒體公版只有一般副標題：找不到完整變體圖層時安全退回一般副標題。
      if (!applied) applied = applyNormal(template, raw, helpers);
      if (applied) diagnostics.push({ field: '副標', status: 'ok', value: raw, target: `subtitle-rule:${variant.type}` });
    }

    // 公版 JSON 的 assetPlacementPresets 是手動調校過的初始座標，只套用一次。
    // 若第一次生成時素材尚未載入而無法命中，後續素材載入刷新仍允許補套一次；成功後用 key
    // 記錄在 template 上。之後的縮圖刷新 / 切換版位不再重套，才能保留使用者手動調整結果。
    const presetKey = exactLayoutPresetKey(template, record);
    if (!skipExactLayout || template.__appliedPlacementPresetKey !== presetKey) {
      applyExactLayoutPreset(template, record);
    }
  }



  const MEDIA_ASSET_FOLDER_MAP = Object.freeze({
    'Template': 'Template',
    'UAC/Pmax/LineLAP': 'UAC-Pmax-LineLAP',
    'Pixnet': 'Pixnet',
    'line point': 'Line Point',
    'Rtbhouse': 'Rtbhouse',
    'DPA Frame': 'DPA Frame',
  });

  function normalizeProductDirective(record, layoutNo) {
    const raw = String(record?.['商品圖1'] || '').trim();
    if (!raw) return;

    if (raw === '右邊網址') {
      delete record['商品圖1'];
      record.__productFolder = String(layoutNo || '').trim();
      return;
    }

    // 工單尾段為價格：例如 全站券_雙券_$40、SCS_雙券_$350、信用卡加全站券_88折。
    // 最後一段只作為價格，前段才是素材檔名；雙券產生兩個價格，其餘皆一個。
    const priceMatch = raw.match(/_((?:\$[0-9,]+)|(?:[0-9]+(?:\.[0-9]+)?折)|(?:[0-9]+(?:\.[0-9]+)?%)|(?:[0-9,]+元))$/i);
    if (priceMatch) {
      record['商品圖1'] = raw.slice(0, -priceMatch[0].length);
      record['價格'] = priceMatch[1];
      record.__couponCount = /雙券/.test(record['商品圖1']) ? 2 : 1;
    }
  }

  function beforeApplyRecordToTemplate({ template, record }) {
    applyLogoShadowRules(template, record);
    const media = String(record?.__media || '').trim();
    const size = normalizeSize(record?.__size || template?.canvas?.templateId || '');
    const project = MEDIA_ASSET_FOLDER_MAP[media] || '';
    if (project) {
      record.__project = project;
      template.batchProject = project;
    }

    normalizeProductDirective(record, record?.__layoutNo);

    // Template / UAC 的 600x400 小圖不處理 Icon/曝品與價格。
    if (size === '600x400' && (media === 'Template' || media === 'UAC/Pmax/LineLAP')) {
      delete record['商品圖1'];
      delete record['商品圖2'];
      delete record['價格'];
      delete record['價格_左'];
      delete record.__productFolder;
      record.__couponCount = 0;
      // 600x400 完全不保留商品圖層：避免 P 即使隱藏後仍出現在圖層清單，
      // 也避免後續通用流程再次把素材寫回這個基礎層。
      const removedProductKeys = [];
      Object.entries(template?.layers || {}).forEach(([key, item]) => {
        const normalizedKey = String(key || '').trim();
        const psdName = String(item?.psdName || '').trim();
        const role = String(item?.role || '').trim();
        const isProductLayer = item?.type === 'image' && (
          normalizedKey === 'product' || /^P(?:_\d{2})?$/.test(normalizedKey) ||
          psdName === 'P' || /^P_\d{2}$/.test(psdName) ||
          /商品圖|曝品/i.test(role)
        );
        if (isProductLayer) {
          removedProductKeys.push(key);
          delete template.layers[key];
        }
      });
      if (removedProductKeys.length && Array.isArray(template.renderOrder)) {
        const removed = new Set(removedProductKeys);
        template.renderOrder = template.renderOrder.filter((key) => !removed.has(key));
      }
    }

    const kvEntry = Object.entries(template?.layers || {}).find(([key, layer]) => {
      const label = String(`${key} ${layer?.psdName || ''}`).toLowerCase();
      return layer?.type === 'image' && (label.includes('kv_bg') || label.includes('kvbg'));
    });
    if (kvEntry) {
      const kvLayer = kvEntry[1];
      if (media === 'UAC/Pmax/LineLAP') kvLayer.assetFilename = `UAC-Pmax-LineLAP_${size}_KV_BG.png`;
      else if (media === 'Template') kvLayer.assetFilename = `Template_${size}_KV_BG.png`;
      else if (media === 'Pixnet') kvLayer.assetFilename = `pixnet_${size}_KV_BG.png`;
      else if (media === 'line point') kvLayer.assetFilename = `line point_${size}_KV_BG.png`;
      else if (media === 'Rtbhouse') kvLayer.assetFilename = `Rtbhouse_${size}_KV_BG.png`;
      else if (media === 'DPA Frame') kvLayer.assetFilename = 'DPA Frame_KV_BG.png';
    }
  }

  function normalizeSize(value) {
    return String(value || '').trim().toLowerCase().replace(/[×＊*]/g, 'x').replace(/\s+/g, '');
  }

  function parseContentCell(value) {
    const record = {};
    String(value || '').split(/\r?\n/).forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || /^※/.test(line)) return;
      const match = line.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
      if (!match) return;
      const label = match[1].trim();
      const text = match[2].trim();
      if (!text) return;
      if (/^主標(?:題)?$/.test(label)) record['主標'] = text;
      else if (/^副標(?:題)?$/.test(label)) record['副標'] = text;
      else if (/警語|法務/.test(label)) record['警語'] = text;
      else if (/^文案$/.test(label)) record['文案'] = text;
      else if (/Icon\s*\/\s*曝品|曝品|商品圖/.test(label)) record['商品圖1'] = text;
      else if (/^左$/.test(label)) record['LOGO'] = text;
      else if (/^中上$/.test(label)) record['活動LOGO'] = text;
    });
    return record;
  }

  function resolveTemplateId(media, size) {
    const normalizedMedia = String(media || '').trim().toLowerCase();
    const normalizedSize = normalizeSize(size);
    if (normalizedMedia === 'dpa frame') return 'DPA Frame';
    if (normalizedMedia === 'template') return `Template_${normalizedSize}`;
    if (normalizedMedia === 'uac/pmax/linelap') {
      return normalizedSize === '960x1200' ? 'UAC-Pmax-LineLAP_960x1200' : `Template_${normalizedSize}`;
    }
    if (normalizedMedia === 'pixnet') return `pixnet_${normalizedSize}`;
    if (normalizedMedia === 'line point') return normalizedSize === '960x540' ? 'LinePoint_960x540' : `line point_${normalizedSize}`;
    if (normalizedMedia === 'rtbhouse') return `Rtbhouse_${normalizedSize}`;
    return '';
  }

  function parseOmWave1Sheet({ rows }) {
    const clean = (value) => String(value ?? '').trim();
    const SUPPORTED_MEDIA = new Set([
      'Template',
      'UAC/Pmax/LineLAP',
      'Pixnet',
      'line point',
      'Rtbhouse',
      'DPA Frame',
      'VideoElements',
      'VideoElements_Frame',
    ]);
    const isFeedbackHeader = (row) => {
      const col1 = clean(row?.[1]).toLowerCase();
      const col2 = clean(row?.[2]).toLowerCase();
      return col1 === '階段' || col2 === '說明' || clean(row?.[4]).includes('反饋統整');
    };
    const isHeader = (row) => clean(row?.[1]).toLowerCase() === '曝光媒體'
      && /layout\s*no\.?/i.test(clean(row?.[3]))
      && clean(row?.[4]).includes('尺寸')
      && clean(row?.[5]).includes('檔案命名');
    const headerRows = [];
    rows.forEach((row, index) => { if (isHeader(row)) headerRows.push(index); });
    if (!headerRows.length) return null;

    const templateContentByLayout = new Map();
    const rawItems = [];
    for (let h = 0; h < headerRows.length; h += 1) {
      const start = headerRows[h] + 1;
      const end = h + 1 < headerRows.length ? headerRows[h + 1] : rows.length;
      let media = '';
      let kSpec = '';
      let layout = '';
      for (let r = start; r < end; r += 1) {
        const row = rows[r] || [];
        if (isFeedbackHeader(row)) break;

        const mediaCell = clean(row[1]);
        if (mediaCell) {
          // 新媒體名稱不在白名單時，清空狀態，避免把反饋／備註區誤當成上一個媒體的延續資料。
          media = SUPPORTED_MEDIA.has(mediaCell) ? mediaCell : '';
        }
        if (clean(row[2])) kSpec = clean(row[2]);
        if (clean(row[3])) layout = clean(row[3]);
        const size = normalizeSize(row[4]);
        const outputName = clean(row[5]);
        const content = clean(row[8]);
        if (media === 'Template' && layout && content) templateContentByLayout.set(layout, parseContentCell(content));
        if (!size || !outputName || !SUPPORTED_MEDIA.has(media)) continue;
        rawItems.push({ rowIndex: r, media, kSpec, layout, size, outputName, content });
      }
    }

    const blocks = [];
    const skippedRows = [];
    rawItems.forEach((item) => {
      if (/^VideoElements(?:_Frame)?$/i.test(item.media)) {
        skippedRows.push({ row: item.rowIndex + 1, name: item.media, reason: '依規則略過不製作媒體' });
        return;
      }
      const templateId = resolveTemplateId(item.media, item.size);
      if (!templateId) {
        skippedRows.push({ row: item.rowIndex + 1, name: item.media, reason: '未設定曝光媒體對應公版' });
        return;
      }
      const ownContent = parseContentCell(item.content);
      const inherited = Object.keys(ownContent).length ? ownContent : (templateContentByLayout.get(item.layout) || {});
      const record = {
        ...inherited,
        __sourceRow: item.rowIndex + 1,
        __media: item.media,
        __layoutNo: item.layout,
        __size: item.size,
        __kSpec: item.kSpec,
        __outputName: item.outputName,
        __templateId: templateId,
        版位: item.media,
      };
      normalizeProductDirective(record, item.layout);
      blocks.push({
        name: templateId,
        headerRow: headerRows[0],
        startRow: item.rowIndex,
        quantity: 1,
        records: [record],
        colMap: {},
        templateType: 'om-wave1',
      });
    });

    return {
      blocks,
      anchorCount: headerRows.length,
      warnings: [],
      skippedRows,
    };
  }

  function resolveRecordTemplateRoute({ record }) {
    const templateId = String(record?.__templateId || '').trim();
    if (!templateId) return null;
    return {
      key: 'om_wave1_subtitle',
      family: 'om_wave1_subtitle',
      label: templateId,
      templateId,
      templateFile: `${templateId}.json`,
      outputName: String(record.__outputName || '').trim(),
      outputPrefix: String(record.__media || templateId).trim(),
    };
  }


  const PRICE_DOUBLE_LAYOUTS = Object.freeze([
    {
      slot: 'top',
      positioningMode: 'product-image-ratio',
      anchorRatioX: 0.62,
      anchorRatioY: 0.37,
      widthRatio: 0.38,
      heightRatio: 0.16,
      fontSizeRatio: 0.105,
      align: 'center',
      color: '#EE4D2D',
      fontWeight: '700',
    },
    {
      slot: 'bottom',
      positioningMode: 'product-image-ratio',
      anchorRatioX: 0.62,
      anchorRatioY: 0.68,
      widthRatio: 0.38,
      heightRatio: 0.16,
      fontSizeRatio: 0.105,
      align: 'center',
      color: '#EE4D2D',
      fontWeight: '700',
    },
  ]);

  const PRICE_SINGLE_CREDIT_CARD_LAYOUT = Object.freeze([
    {
      slot: 'single',
      positioningMode: 'product-image-ratio',
      anchorRatioX: 0.69,
      anchorRatioY: 0.56,
      widthRatio: 0.34,
      heightRatio: 0.18,
      fontSizeRatio: 0.115,
      align: 'center',
      color: '#EE4D2D',
      fontWeight: '700',
    },
  ]);

  const PRICE_RULES = Object.freeze({
    enabled: true,
    productFirst: true,
    productLayouts: {
      '全站券_雙券': { layouts: PRICE_DOUBLE_LAYOUTS },
      'SCS_雙券': { layouts: PRICE_DOUBLE_LAYOUTS },
      // 工單「信用卡加全站券_88折」會先拆成素材名稱與價格；
      // 此單券 layout 確保 88折 建立一個可見價格圖層。
      '信用卡加全站券': { layouts: PRICE_SINGLE_CREDIT_CARD_LAYOUT },
    },
  });

  window.TemplateRuleRegistry.register('om_wave1_subtitle', {
    label: 'OM Wave 1 Subtitle',
    priority: 100,
    targets: TARGETS,
    tokens: TARGETS,
    sheetParser: parseOmWave1Sheet,
    rules: { priceRules: PRICE_RULES, capsuleRules: { paddingByTemplate: CAPSULE_PADDING_BY_TEMPLATE, rulesByTemplate: CAPSULE_RULES_BY_TEMPLATE }, beforeApplyRecordToTemplate, afterApplyRecordToTemplate, resolveRecordTemplateRoute },
  });
})();
