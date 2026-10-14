/* ME PAGE Template Rules
 * 對應公版：14_ME PAGE.json / templateId: ME PAGE
 * 工單來源：暖身BN(311發單) > 製作內容 = ME PAGE
 *
 * 主標題規則（依優先順序判斷）：
 * 1. icon_*銀行 → 銀行優先，顯示「銀行」圖層，素材＝{TemplateName}_icon_{值}.png
 * 2. icon_*    → 顯示「icon」圖層，素材＝{TemplateName}_icon_{值}.png
 * 3. 剛好 2 個中文字（點我、領吧...等）→ 顯示「title/主標題」文字圖層，直接顯示該文字
 * 4. 其它（不是 icon、不是銀行、也不是 2 個中文字，例如 VIP券、或任何自訂長標題）
 *    → 顯示「product / P」圖層並隱藏 icon、銀行、title，素材＝{TemplateName}_{值}.png
 *      （VIP券 → ME PAGE_VIP券.png；之後新增其它值不用改程式，檔名對上就會自動生效）
 */
(function () {
  'use strict';

  const RULE_ID = 'me_page';
  const FAMILY = 'me_page';
  const TEMPLATE_ID = 'ME PAGE';
  const TEMPLATE_FILE_RE = /(?:^|\/)(?:14_)?ME\s*PAGE\.json$/i;

  const LAYERS = Object.freeze({
    title: ['title', '主標題'],
    icon: ['icon'],
    bank: ['銀行'],
    product: ['product', 'P', '商品圖1'],
  });

  function normalizeText(value) {
    return String(value == null ? '' : value).trim();
  }

  function normalizeKey(value) {
    return normalizeText(value).replace(/\s+/g, '').toUpperCase();
  }

  function getRowValue(row, keys) {
    if (!row || typeof row !== 'object') return '';
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
    }
    const normalizedMap = new Map(
      Object.keys(row).map((key) => [normalizeKey(key), row[key]])
    );
    for (const key of keys) {
      const hit = normalizedMap.get(normalizeKey(key));
      if (hit != null && hit !== '') return hit;
    }
    return '';
  }

  function getMainTitle(row) {
    return normalizeText(getRowValue(row, ['主標', '主標題', 'title', 'Title']));
  }

  function getTemplateId(template) {
    return normalizeText(
      template && (template.templateId || template.id || template.name || template.psdName)
    );
  }

  function getLayer(template, aliases) {
    if (!template || !template.layers) return null;
    for (const name of aliases) {
      if (template.layers[name]) return template.layers[name];
    }
    const wanted = aliases.map(normalizeKey);
    const foundKey = Object.keys(template.layers).find((key) => wanted.includes(normalizeKey(key)));
    return foundKey ? template.layers[foundKey] : null;
  }

  function setLayerVisible(layer, visible) {
    if (!layer) return;
    layer.visible = !!visible;
    layer.hidden = !visible;
  }

  function setImageLayer(layer, assetFilename) {
    if (!layer || !assetFilename) return;
    layer.type = 'image';
    layer.assetFilename = assetFilename;
    layer.src = assetFilename;
    layer.image = assetFilename;
    layer.text = '';
    setLayerVisible(layer, true);
  }

  function setTextLayer(layer, text) {
    if (!layer) return;
    layer.type = 'text';
    layer.text = text;
    setLayerVisible(layer, true);
  }

  // icon_ 前綴（icon_點我、icon_永豐銀行...）判斷是否為 icon 類。
  function isIconTitle(title) {
    return /^icon[_\-]/i.test(title);
  }

  // icon_ 前綴且文字含「銀行」→ 銀行類（銀行優先於一般 icon，避免被 icon 規則吃掉）。
  function isBankTitle(title) {
    return isIconTitle(title) && /銀行/.test(title);
  }

  // 剛好 2 個中文字（點我、領吧...等短動作文字）→ 直接顯示文字，不需要素材圖。
  function isTwoCharTextTitle(title) {
    return /^[\u4e00-\u9fff]{2}$/.test(title);
  }

  function resolveTitleMode(title) {
    if (isBankTitle(title)) return 'bank';
    if (isIconTitle(title)) return 'icon';
    if (isTwoCharTextTitle(title)) return 'text';
    return 'product'; // 非 icon、非銀行、非 2 個中文字 → 導入 P/product 圖層
  }

  // icon_ 前綴類（icon / bank）的素材命名慣例：把 "icon_" 也算進檔名裡，
  // 例如 主標="icon_永豐銀行" → 檔名 "icon_永豐銀行.png"（再交給資產比對模組加上模板前綴）。
  function resolveIconAsset(title) {
    return `${title}.png`;
  }

  // product 模式（含 VIP券）：直接用主標文字本身當檔名，交給資產比對模組
  // 用模板前綴（ME PAGE_）+ 資料夾優先比對去找實際檔案，不需要為每個值另外寫白名單。
  function resolveProductAsset(title) {
    return `${title}.png`;
  }

  function applyMainTitle(template, row) {
    const title = getMainTitle(row);
    if (!title) return template;

    const titleLayer = getLayer(template, LAYERS.title);
    const iconLayer = getLayer(template, LAYERS.icon);
    const bankLayer = getLayer(template, LAYERS.bank);
    const productLayer = getLayer(template, LAYERS.product);

    switch (resolveTitleMode(title)) {
      case 'bank':
        // 同時符合 icon_* 與 *銀行 時，銀行優先，避免被一般 icon 規則吃掉。
        setLayerVisible(titleLayer, false);
        setLayerVisible(iconLayer, false);
        setImageLayer(bankLayer, resolveIconAsset(title));
        break;

      case 'icon':
        setLayerVisible(titleLayer, false);
        setLayerVisible(bankLayer, false);
        setImageLayer(iconLayer, resolveIconAsset(title));
        break;

      case 'text':
        setLayerVisible(iconLayer, false);
        setLayerVisible(bankLayer, false);
        setLayerVisible(productLayer, false);
        setTextLayer(titleLayer, title);
        break;

      case 'product':
      default:
        // 非 icon、非銀行、非 2 個中文字（例如 VIP券、或任何自訂長標題）
        // → 用 P/product 圖層顯示對應素材圖，並隱藏 icon / 銀行 / title。
        setLayerVisible(titleLayer, false);
        setLayerVisible(iconLayer, false);
        setLayerVisible(bankLayer, false);
        setImageLayer(productLayer, resolveProductAsset(title));
        break;
    }

    return template;
  }

  function shouldUseRule(context) {
    const template = context && (context.template || context.templateJson || context.json || context);
    const row = context && (context.row || context.data || context.workOrder || context.sheetRow || {});
    const templateId = getTemplateId(template);
    const fileName = normalizeText(context && (context.templateFile || context.templateFilename || context.fileName));
    const production = normalizeText(getRowValue(row, ['製作內容', '版位', '使用公版', 'templateId']));

    return templateId === TEMPLATE_ID
      || normalizeKey(production) === normalizeKey(TEMPLATE_ID)
      || TEMPLATE_FILE_RE.test(fileName);
  }

  const rule = {
    id: RULE_ID,
    name: 'ME PAGE Rules',
    templateId: TEMPLATE_ID,
    match: shouldUseRule,
    test: shouldUseRule,
    appliesTo: shouldUseRule,
    apply(template, row, context) {
      return applyMainTitle(template, row || (context && context.row) || {});
    },
    applyToTemplate(template, row, context) {
      return applyMainTitle(template, row || (context && context.row) || {});
    },
    transform(context) {
      const template = context && (context.template || context.templateJson || context.json);
      if (!template) return context;
      applyMainTitle(template, context.row || context.data || context.workOrder || {});
      return context;
    },
    utils: {
      resolveTitleMode,
      resolveIconAsset,
      resolveProductAsset,
    },
  };

  window.TemplateRules = window.TemplateRules || {};
  window.TemplateRules[RULE_ID] = rule;
  window.TemplateRules[TEMPLATE_ID] = rule;

  // 必須使用目前工具的 TemplateRuleRegistry.register() 註冊，
  // parseRows/findTemplateForName 才能把 Excel「製作內容 = ME PAGE」配對到 14_ME PAGE.json。
  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: TEMPLATE_ID,
    priority: 80,
    tokens: ['ME PAGE', 'MEPAGE', '14_ME PAGE'],
    targets: ['ME PAGE', 'MEPAGE', '14_ME PAGE', '14_MEPAGE'],
    rules: {
      afterApplyRecordToTemplate({ template, record }) {
        applyMainTitle(template, record || {});
      },
      resolveRecordTemplateRoute({ block }) {
        const blockName = normalizeText(block && block.name);
        if (normalizeKey(blockName) !== normalizeKey(TEMPLATE_ID)) return null;
        return {
          key: FAMILY,
          family: FAMILY,
          label: TEMPLATE_ID,
          templateId: TEMPLATE_ID,
          templateFile: '14_ME PAGE.json',
          ruleFile: 'me_page.rules.js',
          outputPrefix: 'ME_PAGE',
        };
      },
    },
  });
})();
