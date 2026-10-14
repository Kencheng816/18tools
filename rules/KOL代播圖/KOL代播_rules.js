/* KOL代播 公版規則檔
 * 對應公版：templates/KOL代播.json（templateId: KOL代播，720x720）
 * 對應工單：2026【美術需求】直播賣版封面圖-4.18 KOL代播版型.xlsx／「4.18 第一單」分頁
 *
 * 這份工單是「一列一個輸出檔」格式（表頭：檔名／KB／尺寸／內容／版型／CTA／補充說明／KMS），
 * 「檔名」欄每一列都固定含有「直播時縮圖」四個字，所以直接用這個當 tokens 比對，
 * 不需要工單裡另外有一欄寫版位/公版名稱。
 *
 * 這個公版獨有、留在這裡的邏輯（其餘通用的部分——檔名覆寫輸出檔名、KB匯出上限、
 * 內容欄多行標籤解析、直播主圖層套用——都已經是 core/app.core.js 的通用功能，任何公版都能用）：
 *   1. LOGO 群組（蝦皮KOL代播_LOGO + 白色直線 + LOGO_範圍實際圖片）置中對齊X軸
 *   2. LOGO_範圍：套入實際LOGO後，高度撐滿、靠左對齊
 *   3. 直播主人像：半身照自動貼合（等比例縮放＋頂端對齊＋水平置中），只算一次，
 *      之後允許在「微調」面板手動覆蓋，不會被自動邏輯蓋回去
 *   4. 兩位直播主的照片指定例外（檔名對不上規律，資料本身的特例，不是共用邏輯）
 */
(function () {
  'use strict';

  const U = window.TemplateRuleUtils;

  // ── 直播主照片指定例外 ──
  // 這兩位資料夾裡有「同名字但不同款」的檔案，一般的「依名稱模糊比對」規則會選到
  // 檔名剛好比較像的那張，但那不一定是要用的那張，所以這裡明確指定要用哪一個檔案。
  const HOST_PHOTO_OVERRIDES = {
    '嘉恩': '嘉恩-2025.png',
    '周子葳': '周庭安2周子葳.png',
  };

  // ── 半身照自動貼合的目標規格 ──
  // 改用「寬度」當縮放基準（原本用「高度414/頂端303」，實測跟範圍圖的像素重疊率只有
  // 28~32%左右，改用寬度為基準重疊率能到55~68%，區分度好非常多，所以貼合演算法
  // 跟品質檢查都統一改用這組數字，避免「畫面貼合用一種算法、驗證用另一種算法」兜不起來）。
  const HOST_FIT_TARGET = { targetWidth: 390, topY: 300, centerX: 360 };

  // 半身照貼合品質檢查：IoU（交集÷聯集）低於這個門檻，代表跟範圍圖對不太準
  // （人物可能太小/太大/位置偏移/照片本身有問題），需要跳出視窗讓人手動確認調整。
  // 門檻設 80%：允許的貼合誤差空間較嚴格，可以抓出更多需要人工調整的邊緣案例。
  const HOST_FIT_IOU_THRESHOLD = 0.80;

  // 半身照參考輪廓：固定用男性短髮這一張當視覺參考（不分髮型分類），只在需要手動確認時
  // 才顯示、疊在直播主照片上方，半透明、鎖定不能被點選/拖曳，確認調整完後就會重新隱藏，
  // 不會出現在縮圖或最終匯出的圖片裡。
  const HOST_FIT_GUIDE_KEY = '__半身照參考輪廓';
  const HOST_FIT_GUIDE_ASSET = 'KOL代播_男性短髮半身照範圍.png';

  function ensureHostFitGuideLayer(template) {
    if (template.layers[HOST_FIT_GUIDE_KEY]) return template.layers[HOST_FIT_GUIDE_KEY];
    template.layers[HOST_FIT_GUIDE_KEY] = {
      type: 'image',
      psdName: '半身照參考輪廓（僅供對照，不會匯出）',
      x: 0,
      y: 0,
      width: Number(template.canvas?.width || 720),
      height: Number(template.canvas?.height || 720),
      centerX: Number(template.canvas?.width || 720) / 2,
      centerY: Number(template.canvas?.height || 720) / 2,
      assetFilename: HOST_FIT_GUIDE_ASSET,
      opacity: 0.5,
      locked: true,
      hidden: true, // 預設隱藏；只有跳出確認視窗調整時才會被打開，確認後重新隱藏
    };
    // 插進「直播主_人像」後面，讓它疊在照片上方（半透明比對用），不影響其他圖層的畫面順序。
    const hostIndex = template.renderOrder.indexOf('直播主_人像');
    if (hostIndex >= 0) template.renderOrder.splice(hostIndex + 1, 0, HOST_FIT_GUIDE_KEY);
    else template.renderOrder.push(HOST_FIT_GUIDE_KEY);
    return template.layers[HOST_FIT_GUIDE_KEY];
  }

  // ── LOGO 相關架構（V0.8 重新設計）──
  // LOGO_範圍：純參考框，固定 136x53、左邊界固定在 x=399，hidden（不畫、不匯出）+ __internal（layer 列表看不到）。
  //   只用來提供兩個資訊：(1) LOGO 圖層的初始位置錨點，(2) LOGO 圖層的 clip 邊界。
  // LOGO：動態新增的實際 LOGO 圖層，載入實際 LOGO 圖片，可自由拖曳/縮放。
  //   當 LOGO 圖層被使用者放大超出 LOGO_範圍 時，超出的部分由 renderer 的 clip 模式遮住
  //   （見 core/app.core.js drawImage 中的 layer.logoClipRangeKey 分支）。
  //
  // 這樣做的好處：不論帶入的 LOGO 圖片比例多離譜（正方形、超寬條、超窄長條），
  //   LOGO_範圍 這個「群組寬度代表」都固定 136，「蝦皮LOGO+白色直線+LOGO_範圍」的群組排版永遠一致。
  const LOGO_RANGE_KEY = 'LOGO_範圍';
  const LOGO_LAYER_KEY = 'LOGO';
  const LOGO_RANGE_TARGET = { frameWidth: 136, frameHeight: 53, leftX: 399 };

  // 建立實際 LOGO 圖層（如果還沒有的話）。放在 LOGO_範圍 後面、標籤前面。
  // 位置與初始尺寸都跟 LOGO_範圍 貼齊（LOGO 一開始佔滿 LOGO_範圍 的邊界）。
  function ensureLogoLayer(template) {
    if (template.layers?.[LOGO_LAYER_KEY]) return template.layers[LOGO_LAYER_KEY];
    const rangeLayer = template.layers?.[LOGO_RANGE_KEY];
    if (!rangeLayer) return null;
    // 用 LOGO_RANGE_TARGET 目標值當初始尺寸（不是讀 rangeLayer.width/height）——因為 hook 首次執行時
    // rangeLayer 可能還沒被 applyProgrammaticLayout 更新，還是 JSON 原本的 48x49，
    // 用目標值 136x53 當 LOGO 初始尺寸，才能讓群組排版第一次就用合理的寬度。
    // Y 位置沿用 rangeLayer 的 centerY（PSD 原本的直向位置）作為錨點。
    const rangeCenterY = Number(rangeLayer.centerY ?? (Number(rangeLayer.y || 0) + Number(rangeLayer.height || 0) / 2));
    const initWidth = LOGO_RANGE_TARGET.frameWidth;
    const initHeight = LOGO_RANGE_TARGET.frameHeight;
    const initX = LOGO_RANGE_TARGET.leftX;
    template.layers[LOGO_LAYER_KEY] = {
      type: 'image',
      psdName: 'LOGO',
      x: initX,
      y: rangeCenterY - initHeight / 2,
      width: initWidth,
      height: initHeight,
      centerX: initX + initWidth / 2,
      centerY: rangeCenterY,
      rotation: 0,
      keepAspectRatio: false,
      assetFilename: '',
      // 告訴 renderer：畫這張圖時，用 LOGO_範圍 這個圖層的邊界建 clip 遮罩，超出的部分不會被畫出來。
      logoClipRangeKey: LOGO_RANGE_KEY,
      // 告訴 resize 邏輯：縮放時錨點固定在「左邊界 + 垂直中心」，
      // 這樣使用者拉握把放大 LOGO 時，LOGO 從左邊向右擴張、從上下中心向兩側擴張，
      // 不會意外把 LOGO 拉出白色直線的右側 10px 間距。
      resizeAnchor: 'leftCenter',
    };
    // 插到 LOGO_範圍 後面（畫在 LOGO_範圍 上方；反正 LOGO_範圍 hidden 也不會顯示）。
    const rangeIndex = (template.renderOrder || []).indexOf(LOGO_RANGE_KEY);
    if (rangeIndex >= 0) template.renderOrder.splice(rangeIndex + 1, 0, LOGO_LAYER_KEY);
    else template.renderOrder.push(LOGO_LAYER_KEY);
    return template.layers[LOGO_LAYER_KEY];
  }

  // LOGO 初始尺寸：等比例縮放讓整張 LOGO 完整放進 LOGO_範圍 (contain 模式)，靠 LOGO_範圍 左邊對齊。
  // 只在圖片實際載入完成後才能算，因為需要讀 image.naturalWidth/naturalHeight。
  // 呼叫端已經確保有 __logoContainFitted 旗標保護，這裡只負責計算與套用。
  function fitLogoContainInRange(template) {
    const logoLayer = template.layers?.[LOGO_LAYER_KEY];
    const rangeLayer = template.layers?.[LOGO_RANGE_KEY];
    if (!logoLayer || !rangeLayer) return;
    const logoImg = window.AppState?.images?.[LOGO_LAYER_KEY];
    const logoImgIsFresh = logoImg && logoImg.naturalWidth
      && logoImg.__loadedForFilename === logoLayer.assetFilename;
    if (!logoImgIsFresh) return;

    const rangeW = Number(rangeLayer.width || 0);
    const rangeH = Number(rangeLayer.height || 0);
    const imgRatio = logoImg.naturalWidth / logoImg.naturalHeight;
    const rangeRatio = rangeW / rangeH;
    let logoW, logoH;
    if (imgRatio >= rangeRatio) {
      // LOGO 比範圍寬扁 → 以「寬度=rangeW」為基準等比例縮放，高度會 <= rangeH
      logoW = rangeW;
      logoH = rangeW / imgRatio;
    } else {
      // LOGO 比範圍窄長 → 以「高度=rangeH」為基準等比例縮放，寬度會 <= rangeW
      logoH = rangeH;
      logoW = rangeH * imgRatio;
    }
    // 靠 LOGO_範圍 左邊對齊 + 垂直置中
    logoLayer.x = rangeLayer.x;
    logoLayer.y = rangeLayer.y + (rangeH - logoH) / 2;
    logoLayer.width = logoW;
    logoLayer.height = logoH;
    logoLayer.centerX = logoLayer.x + logoW / 2;
    logoLayer.centerY = rangeLayer.y + rangeH / 2;
    logoLayer.rotation = 0;
    logoLayer.keepAspectRatio = false;
    template.__logoContainFitted = true;
  }

  window.TemplateRuleRegistry.register('kol_daibo', {
    label: 'KOL代播',
    targets: ['KOL代播'],
    tokens: ['直播時縮圖'],

    rules: {
      afterApplyRecordToTemplate({ template, record }) {
        // 半身照參考輪廓圖層：一定要在這裡（圖片載入之前）就先建立好，這樣稍後的
        // loadImagesForTemplate 才會一併把參考圖載進來，供後面的品質檢查使用。
        ensureHostFitGuideLayer(template);

        // 直播主照片指定例外：一般通用比對已經在引擎內完成，這裡只針對這兩個特例覆寫成指定檔案。
        const hostName = String(record?.['直播主'] || '').trim();
        const override = HOST_PHOTO_OVERRIDES[hostName];
        if (override) {
          const hostLayer = template.layers?.['直播主_人像'];
          if (hostLayer) hostLayer.assetFilename = override;
        }

        // ── LOGO 架構：「LOGO_範圍」+「LOGO」兩層並存 ──
        //   LOGO_範圍：純參考框，固定 136x53，hidden（不畫、不匯出）+ __internal（layer 列表看不到），
        //     只用來提供「clip 邊界」與「LOGO 初始位置錨點」給 LOGO 圖層。
        //   LOGO：動態新增，實際 LOGO 圖片，可自由調整；當 LOGO 被使用者放大超出 LOGO_範圍 時，
        //     超出的部分由 renderer 的 clip 遮罩自動遮住（見 core/app.core.js 的 logoClipRangeKey 分支）。
        ensureLogoLayer(template);

        if (!template.__logoAssetApplied) {
          const logoName = String(record?.['LOGO'] || '').trim();
          const logoLayer = template.layers?.['LOGO'];
          const rangeLayer = template.layers?.['LOGO_範圍'];
          if (logoName && logoLayer && window.BatchManager?.findAssetFilename) {
            const match = window.BatchManager.findAssetFilename(logoName, { layer: logoLayer, layerKey: 'LOGO' });
            if (match.found) {
              logoLayer.assetFilename = match.filename;
              // LOGO_範圍 本身不需要 assetFilename（不畫），清空避免 loadImagesForTemplate 浪費時間去載一張沒用的圖。
              if (rangeLayer) rangeLayer.assetFilename = '';
              template.__logoAssetApplied = true;
            }
          }
        }

        // LOGO 初始尺寸：等比例縮放讓整張 LOGO 完整放進 LOGO_範圍 (contain 模式)，靠 LOGO_範圍 左邊對齊。
        // 之後如果使用者手動放大 LOGO 讓它超出 LOGO_範圍，超出的右側部分才會被 clip 遮住。
        // 這一段只做一次；使用者手動調整過的 LOGO 尺寸不會被蓋回去（用 __logoContainFitted 旗標保護）。
        if (!template.__logoContainFitted) {
          fitLogoContainInRange(template);
        }

        // 直播主人名：這個公版的文案慣例固定是「直播主 {名字}」，不是把名字整個蓋掉，
        // 所以用專屬格式套用，而不是走通用引擎的逐字套用。
        // 如果名字本身已經 >= 6 個字（例如「台灣姑娘阿柔」），加上「直播主 」前綴會爆版，
        // 這時候直接省略前綴，只顯示名字（用 Array.from 計字元數以正確處理 emoji 等組合字元）。
        if (hostName) {
          const hostNameLayer = template.layers?.['直播主人名'];
          if (hostNameLayer) {
            const nameCharCount = Array.from(hostName.trim()).length;
            hostNameLayer.text = nameCharCount >= 6 ? hostName : `直播主 ${hostName}`;
          }
        }

        // 半身照自動貼合：只在圖片真正載入完成（naturalWidth可用）且這個生成物還沒貼合過時執行一次。
        // 這個 hook 在圖片還沒載入完成前（例如 applyRecordToTemplate 剛跑完同步邏輯那一刻）也會被呼叫到，
        // 那時候直接跳過，等下一次（stabilizeTemplateBeforePreview，圖片已經穩定載入後）再重試。
        if (!template.__hostPhotoFitted) {
          const hostLayer = template.layers?.['直播主_人像'];
          const hostImg = window.AppState?.images?.['直播主_人像'];
          // __loadedForFilename 是 loadImagesForTemplate 載入成功後標記的「這張圖是為了哪個
          // assetFilename 載入的」。afterApplyRecordToTemplate 有可能在這個生成物自己的圖片
          // 載入完成「之前」就先被呼叫到一次（此時 AppState.images 還是上一個生成物留下來的舊圖），
          // 沒有這個檢查會拿上一位直播主的照片尺寸去算這一位的貼合結果，兩個人對不上就會「算錯」。
          const hostImgIsFresh = hostImg && hostImg.naturalWidth
            && hostLayer && hostImg.__loadedForFilename === hostLayer.assetFilename;
          if (hostImgIsFresh) {
            // 【需求3】人工調整快取：如果這位直播主的素材檔案已經在別的生成物被人工調整過，
            // 直接套用同一組數值（x/y/width/height/rotation），跳過自動貼合演算法，也不會再跳審核彈窗。
            // 這樣同一位直播主的所有生成物，只需在第一張手動調整一次，後面的自動套用相同結果。
            const cache = window.AppState?.portraitAdjustmentByAsset;
            const materialKey = String(hostLayer.assetFilename || '').trim().normalize('NFKC').toLowerCase();
            const cached = cache && materialKey ? cache.get?.(materialKey) : null;
            if (cached) {
              hostLayer.x = cached.x;
              hostLayer.y = cached.y;
              hostLayer.width = cached.width;
              hostLayer.height = cached.height;
              hostLayer.centerX = cached.centerX;
              hostLayer.centerY = cached.centerY;
              hostLayer.rotation = Number(cached.rotation || 0);
              hostLayer.keepAspectRatio = false;
              template.__hostPhotoFitted = true;
              template.__hostPhotoNeedsReview = false; // 已經是「人工確認過」的位置，不需要再跳審核
              template.__hostPhotoDefaultBox = { ...cached }; // 給 PortraitSyncEngine 的還原功能用
              return; // 這位直播主搞定，離開這段 fit 邏輯
            }

            const applied = U.fitImageByAlphaWidth({
              layer: hostLayer,
              image: hostImg,
              ...HOST_FIT_TARGET,
            });
            if (applied) {
              template.__hostPhotoFitted = true;

              // 記下這個生成物「自動貼合完成、使用者還沒手動調整前」的版位快照。
              // app.core.js 的直播主照片同步/還原功能（PortraitSyncEngine）需要一個
              // 明確的「預設版位」基準，才能在使用者按下「還原成預設版位」時知道要還原成什麼樣子；
              // 這裡只負責記錄快照，不碰任何UI或同步邏輯（規則檔不做跨圖層/跨生成物的事）。
              template.__hostPhotoDefaultBox = {
                x: hostLayer.x, y: hostLayer.y, width: hostLayer.width, height: hostLayer.height,
                centerX: hostLayer.centerX, centerY: hostLayer.centerY, rotation: Number(hostLayer.rotation || 0),
              };

              // 貼合品質檢查：跟參考輪廓圖算 IoU，低於門檻就標記需要人工確認。
              // 這個檢查放在 renderPreviewGrid 那一層（app.core.js）判斷要不要跳出確認視窗，
              // 這裡只負責算分數、寫旗標，不直接跳視窗（規則檔不碰UI彈窗邏輯）。
              const guideImg = window.AppState?.images?.[HOST_FIT_GUIDE_KEY];
              const guideLayer = template.layers?.[HOST_FIT_GUIDE_KEY];
              const guideImgIsFresh = guideImg && guideImg.naturalWidth
                && guideLayer && guideImg.__loadedForFilename === guideLayer.assetFilename;
              if (guideImgIsFresh) {
                const iou = U.computeFitIoU({
                  layer: hostLayer,
                  image: hostImg,
                  guideImage: guideImg,
                  canvasSize: template.canvas?.width || 720,
                });
                if (iou !== null) {
                  template.__hostPhotoFitIoU = iou;
                  template.__hostPhotoNeedsReview = iou < HOST_FIT_IOU_THRESHOLD;
                  // 通用審核彈窗（app.core.js）只認這兩個旗標，不需要知道「直播主_人像」這個
                  // 圖層名稱是KOL代播專屬的——哪個圖層要調整、疊哪張參考圖，由規則檔自己決定。
                  template.__reviewLayerKey = '直播主_人像';
                  template.__reviewGuideKey = HOST_FIT_GUIDE_KEY;
                }
              }
            }
          }
        }
      },

      layoutRules: {
        applyProgrammaticLayout({ template, helpers }) {
          const { findLayerEntry, getCombinedBox } = helpers;

          const shopeeLogoEntry = findLayerEntry(template, ['蝦皮KOL代播_LOGO'], { type: 'image' });
          const dividerEntry = findLayerEntry(template, ['白色直線'], { type: 'shape' });
          const logoRangeEntry = findLayerEntry(template, ['LOGO_範圍'], { type: 'image' });
          if (!shopeeLogoEntry || !dividerEntry || !logoRangeEntry) return;

          const logoRangeLayer = logoRangeEntry.layer;

          // LOGO_範圍：純參考框，固定 136x53、靠左對齊原本設計的左邊界(x=399)。
          //   - hidden: true → renderer 不畫它、匯出圖也不會出現
          //   - __internal: true → LayerManager.render 過濾掉，layer 列表看不到（避免使用者困惑）
          //   - locked: true → 額外保險，即便從別的路徑選到也無法操作
          //   只做一次；使用者手動調整後不會被自動邏輯覆寫。
          if (!template.__logoRangeFitted) {
            const prevCenterY = Number(logoRangeLayer.centerY ?? (Number(logoRangeLayer.y || 0) + Number(logoRangeLayer.height || 0) / 2));
            logoRangeLayer.width = LOGO_RANGE_TARGET.frameWidth;
            logoRangeLayer.height = LOGO_RANGE_TARGET.frameHeight;
            logoRangeLayer.x = LOGO_RANGE_TARGET.leftX;
            logoRangeLayer.y = prevCenterY - LOGO_RANGE_TARGET.frameHeight / 2;
            logoRangeLayer.centerX = LOGO_RANGE_TARGET.leftX + LOGO_RANGE_TARGET.frameWidth / 2;
            logoRangeLayer.centerY = prevCenterY;
            logoRangeLayer.rotation = 0;
            logoRangeLayer.keepAspectRatio = false;
            logoRangeLayer.hidden = true;
            logoRangeLayer.__internal = true;
            logoRangeLayer.locked = true;
            // 之前 V0.7 用的 logoRangeClipMode 標記已不再使用（clip 由新的 LOGO 圖層自己走 logoClipRangeKey 分支）。
            delete logoRangeLayer.logoRangeClipMode;
            template.__logoRangeFitted = true;
          }

          // 群組排版：蝦皮KOL代播_LOGO 與白色直線之間、白色直線與 LOGO 之間，各自固定 10px 間距，
          // 排好間距後再整體置中對齊畫布 X 軸。
          //
          // 「LOGO」在這裡指的是「群組中最右邊的圖層」。行為依 LOGO 圖層是否已載入而變：
          //   (a) LOGO 圖層已存在且有實際 width → 用 LOGO 圖層的實際寬度當群組右端邊界
          //       （這樣使用者放大/縮小 LOGO 時，群組跟著即時重新置中）
          //   (b) LOGO 圖層還沒建立 / 還沒 fit → 退回用 LOGO_範圍的 136 當基準（首次載入的過渡狀態）
          //
          // 不論 (a) 還是 (b)，LOGO_範圍 這個「clip 邊界框」都要跟 LOGO 圖層的 x 保持一致
          // （或跟群組右端邊界一致），這樣 clip 才會從正確位置遮罩，超出範圍的 LOGO 才會被裁掉。
          const shopeeLogoLayer = shopeeLogoEntry.layer;
          const dividerLayer = dividerEntry.layer;
          const logoLayer = template.layers?.[LOGO_LAYER_KEY]; // 可能還沒建立（首次 hook 前）
          const GAP = 10;

          // 白色直線是 shape 圖層，PSD 匯出時的 geometry.bbox / pathBounds 是靜態座標。
          // shape-renderer.js 預設畫圖時會優先讀那組靜態座標，所以如果沒有這個旗標，
          // 不管這裡把 dividerLayer.x 算成多少，畫面上永遠只會呈現 PSD 原始位置（初版位置）。
          // 標記 useDynamicBounds=true 後，shape-renderer.js 才會改用下面即時算出的 x/y/width/height 來畫。
          dividerLayer.useDynamicBounds = true;

          const shopeeLogoWidth = Number(shopeeLogoLayer.width || 0);
          const dividerWidth = Number(dividerLayer.width || 0);
          // 群組右端「代表圖層」：LOGO 已 fit → 用 LOGO；否則用 LOGO_範圍（fallback）
          const hasLogo = !!(logoLayer && Number(logoLayer.width || 0) > 0);
          const rightEndWidth = hasLogo ? Number(logoLayer.width) : Number(logoRangeLayer.width || 0);

          dividerLayer.x = Number(shopeeLogoLayer.x || 0) + shopeeLogoWidth + GAP;
          dividerLayer.centerX = dividerLayer.x + dividerWidth / 2;
          const rightEndLeftX = dividerLayer.x + dividerWidth + GAP;
          // LOGO_範圍 這個 clip 邊界框，永遠貼齊「群組右端左邊界」，不論 LOGO 有沒有 fit
          logoRangeLayer.x = rightEndLeftX;
          logoRangeLayer.centerX = rightEndLeftX + Number(logoRangeLayer.width || 0) / 2;
          // 如果 LOGO 圖層已 fit，也一起貼齊
          if (hasLogo) {
            logoLayer.x = rightEndLeftX;
            logoLayer.centerX = rightEndLeftX + logoLayer.width / 2;
          }

          // 群組置中：把「蝦皮LOGO＋白色直線＋群組右端代表」視為一個整體，
          // 整體平移讓水平中心對齊畫布正中央（不改變彼此的 10px 間距）。
          // 群組寬度 = shopeeLogo + GAP + divider + GAP + rightEndWidth
          const groupLeftX = Number(shopeeLogoLayer.x || 0);
          const groupRightX = rightEndLeftX + rightEndWidth;
          const groupCenterX = (groupLeftX + groupRightX) / 2;
          const canvasCenterX = Number(template?.canvas?.width || 720) / 2;
          const delta = canvasCenterX - groupCenterX;
          if (Math.abs(delta) > 0.01) {
            // 平移所有相關圖層（包括 LOGO_範圍 和 LOGO，這樣它們的水平位置一起走）
            const allMoveLayers = [shopeeLogoLayer, dividerLayer, logoRangeLayer];
            if (hasLogo) allMoveLayers.push(logoLayer);
            allMoveLayers.forEach((layer) => {
              layer.x = Number(layer.x || 0) + delta;
              if (Number.isFinite(Number(layer.centerX))) layer.centerX = Number(layer.centerX) + delta;
            });
          }
        },
      },

      // 匯出KB上限：這份工單每一列都是 200K，這裡當作這個公版的預設值；
      // 如果之後改工單改成別的數字，通用引擎一律以Excel「KB」欄的實際值為準，這裡只是沒讀到欄位時的備援。
      exportConstraints: { maxKB: 200 },
    },
  });
})();
