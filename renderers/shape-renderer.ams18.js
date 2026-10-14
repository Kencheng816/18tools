/* 18節 Line購物AMS V0.5 原版 shape-renderer（整檔保留：Bezier 圓角、PSD 四角半徑、rotationDeg、永遠填色、tracePath）；由 AMS profile 的 coreScripts 載入。 */
/* Shape Renderer V3.29.2
 * JSON Shape Support + app.core.js integration companion.
 *
 * 支援 PSD 公版小工具 V2.2 / V2.3 匯出的 shape JSON：
 * - rectangle
 * - roundedRectangle
 * - ellipse
 * - polygon
 * - path fallback
 *
 * API：
 * - ShapeRenderer.render(ctx, layer, rule)              // 舊 rules/*.js 用法
 * - ShapeRenderer.renderJsonShape(ctx, layer)           // 新 JSON shape 用法
 * - ShapeRenderer.createRuleFromJsonLayer(layer)
 */
(function initShapeRenderer() {
  'use strict';

  const DEG_TO_RAD = Math.PI / 180;

  const toNumber = (value, fallback = 0) => {
    if (value && typeof value === 'object') {
      if (Number.isFinite(Number(value._value))) return Number(value._value);
      if (Number.isFinite(Number(value.value))) return Number(value.value);
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  function normalizeRendererName(name) {
    const value = String(name || '').trim();
    if (value === 'rect') return 'rectangle';
    if (value === 'roundedRect') return 'roundedRectangle';
    if (value === 'circle') return 'ellipse';
    return value;
  }

  function getBox(layer = {}, rule = {}) {
    const shape = layer.shape || {};
    const geometry = shape.geometry || {};
    const useLayerBounds = rule.useLayerBounds === true || rule.bboxSource === 'layer' || rule.box === 'layer';
    const bbox = useLayerBounds ? layer : (rule.bbox || geometry.bbox || shape.pathBounds || layer);

    const x = toNumber(bbox.x, toNumber(layer.x));
    const y = toNumber(bbox.y, toNumber(layer.y));
    const width = toNumber(bbox.width, toNumber(layer.width));
    const height = toNumber(bbox.height, toNumber(layer.height));

    return {
      x,
      y,
      width,
      height,
      centerX: toNumber(bbox.centerX, toNumber(layer.centerX, x + width / 2)),
      centerY: toNumber(bbox.centerY, toNumber(layer.centerY, y + height / 2)),
    };
  }

  function getRotation(layer = {}, rule = {}) {
    if (rule.rotation !== undefined) return toNumber(rule.rotation);
    if (layer.rotation !== undefined) return toNumber(layer.rotation);

    const transform = layer.shape && layer.shape.geometry && layer.shape.geometry.transform;
    if (transform && transform.rotationDeg !== undefined) return toNumber(transform.rotationDeg);

    return 0;
  }

  function getFill(layer = {}, rule = {}) {
    return rule.fill || rule.color || layer.fill || (layer.shape && layer.shape.fill) || '#ffffff';
  }

  function getStroke(layer = {}, rule = {}) {
    const rawStroke = rule.stroke || (layer.shape && layer.shape.stroke);
    if (!rawStroke) return null;

    if (typeof rawStroke === 'string') {
      return { enabled: true, color: rawStroke, width: toNumber(rule.strokeWidth, 1) };
    }

    return {
      enabled: !!rawStroke.enabled,
      color: rawStroke.color || rule.strokeColor || '#000000',
      width: Math.max(0, toNumber(rawStroke.width, toNumber(rule.strokeWidth, 1))),
    };
  }

  function applyPaint(ctx, layer = {}, rule = {}) {
    ctx.fillStyle = getFill(layer, rule);

    const stroke = getStroke(layer, rule);
    if (stroke && stroke.enabled) {
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.width || 1;
    }

    return stroke;
  }

  function strokeIfNeeded(ctx, stroke) {
    if (stroke && stroke.enabled && stroke.width > 0) ctx.stroke();
  }

  const assetCache = new Map();

  function normalizeAssetKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[\s\u00a0\u3000\t\r\n]+/g, '')
      .replace(/[\-_()（）\[\]【】.]/g, '');
  }

  function getAssetCandidates(filename, rule = {}) {
    const rawCandidates = rule.assetCandidates || rule.assets || rule.filenames || rule.assetFilenames || [];
    const candidates = Array.isArray(rawCandidates) ? rawCandidates : [rawCandidates];
    return [filename, ...candidates].filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  function findLocalAssetFile(filename, rule = {}) {
    const files = window.AppState && window.AppState.assetFiles;
    if (!filename || !files || !files.size) return null;

    const candidates = getAssetCandidates(filename, rule);
    const exactOnly = rule.exactAsset === true || rule.exactMatch === true || rule.assetMatch === 'exact';

    // 先做精準比對，支援大小寫差異，但不做「包含」比對。
    for (const candidate of candidates) {
      if (files.has(candidate)) return files.get(candidate);
      const lower = candidate.toLowerCase();
      const exactHit = [...files.keys()].find((name) => name.toLowerCase() === lower);
      if (exactHit) return files.get(exactHit);
    }

    // 嚴格素材規則：例如 VIP_LOGO 只允許 VIP_LOGO.svg / VIP LOGO.svg，
    // 不可誤抓「蝦皮VIP_LOGO.svg」或「蝦皮VIP_LOGO.svg」。
    if (exactOnly) return null;

    const wantedKeys = candidates.map((candidate) => normalizeAssetKey(candidate));
    const hit = [...files.keys()].find((name) => {
      const key = normalizeAssetKey(name);
      return wantedKeys.some((wanted) => key === wanted || key.includes(wanted) || wanted.includes(key));
    });

    return hit ? files.get(hit) : null;
  }

  function requestRender() {
    requestAnimationFrame(() => {
      if (window.Renderer && typeof window.Renderer.render === 'function') window.Renderer.render();
    });
  }

  function loadAssetImage(filename, rule = {}) {
    if (!filename) return null;

    const candidates = getAssetCandidates(filename, rule);
    const localFile = findLocalAssetFile(filename, rule);
    const resolvedFilename = localFile ? localFile.name : candidates[0];
    const cacheKey = localFile
      ? `local:${localFile.name}:${localFile.size}:${localFile.lastModified}`
      : `asset:${resolvedFilename}`;

    const cached = assetCache.get(cacheKey);
    if (cached) return cached.status === 'loaded' ? cached.image : null;

    const img = new Image();
    const entry = { status: 'loading', image: img, objectUrl: '' };
    assetCache.set(cacheKey, entry);

    img.onload = () => {
      entry.status = 'loaded';
      requestRender();
      if (entry.objectUrl) setTimeout(() => URL.revokeObjectURL(entry.objectUrl), 1200);
    };

    img.onerror = () => {
      entry.status = 'error';
      console.warn('[ShapeRenderer] SVG asset 載入失敗:', resolvedFilename);
      if (entry.objectUrl) setTimeout(() => URL.revokeObjectURL(entry.objectUrl), 1200);
    };

    if (localFile) {
      entry.objectUrl = URL.createObjectURL(localFile);
      img.src = entry.objectUrl;
    } else {
      img.src = `./assets/${resolvedFilename}`;
    }

    return null;
  }

  function withTransform(ctx, layer, rule, draw) {
    const box = getBox(layer, rule);
    const rotation = getRotation(layer, rule);

    ctx.save();

    if (rotation) {
      ctx.translate(box.centerX, box.centerY);
      ctx.rotate(rotation * DEG_TO_RAD);
      draw({
        x: -box.width / 2,
        y: -box.height / 2,
        width: box.width,
        height: box.height,
        centerX: 0,
        centerY: 0,
        sourceBox: box,
      });
    } else {
      draw(box);
    }

    ctx.restore();
  }

  function normalizeCornerRadii(raw, width, height) {
    const maxRadius = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
    const clamp = (value) => Math.max(0, Math.min(toNumber(value), maxRadius));
    if (typeof raw === 'number' || typeof raw === 'string') {
      const radius = clamp(raw);
      return { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
    }
    const value = raw || {};
    return {
      topLeft: clamp(value.topLeft ?? value.tl ?? value.leftTop ?? 0),
      topRight: clamp(value.topRight ?? value.tr ?? value.rightTop ?? 0),
      bottomRight: clamp(value.bottomRight ?? value.br ?? value.rightBottom ?? 0),
      bottomLeft: clamp(value.bottomLeft ?? value.bl ?? value.leftBottom ?? 0),
    };
  }

  // Photoshop 的圓角矩形以 cubic Bézier 描述四分之一圓。
  // 使用標準 kappa 常數，比 quadraticCurveTo 更接近 PSD 向量路徑。
  const CIRCLE_KAPPA = 0.5522847498307936;

  function roundRectPath(ctx, x, y, width, height, radius = 0) {
    const r = normalizeCornerRadii(radius, width, height);
    const right = x + width;
    const bottom = y + height;

    ctx.beginPath();
    ctx.moveTo(x + r.topLeft, y);
    ctx.lineTo(right - r.topRight, y);

    if (r.topRight > 0) {
      const k = r.topRight * CIRCLE_KAPPA;
      ctx.bezierCurveTo(right - r.topRight + k, y, right, y + r.topRight - k, right, y + r.topRight);
    } else {
      ctx.lineTo(right, y);
    }

    ctx.lineTo(right, bottom - r.bottomRight);
    if (r.bottomRight > 0) {
      const k = r.bottomRight * CIRCLE_KAPPA;
      ctx.bezierCurveTo(right, bottom - r.bottomRight + k, right - r.bottomRight + k, bottom, right - r.bottomRight, bottom);
    } else {
      ctx.lineTo(right, bottom);
    }

    ctx.lineTo(x + r.bottomLeft, bottom);
    if (r.bottomLeft > 0) {
      const k = r.bottomLeft * CIRCLE_KAPPA;
      ctx.bezierCurveTo(x + r.bottomLeft - k, bottom, x, bottom - r.bottomLeft + k, x, bottom - r.bottomLeft);
    } else {
      ctx.lineTo(x, bottom);
    }

    ctx.lineTo(x, y + r.topLeft);
    if (r.topLeft > 0) {
      const k = r.topLeft * CIRCLE_KAPPA;
      ctx.bezierCurveTo(x, y + r.topLeft - k, x + r.topLeft - k, y, x + r.topLeft, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.closePath();
  }

  function readPsdCornerRadii(layer = {}) {
    const candidates = [
      layer?.shape?.rawShapeDescriptor?.keyOriginType?.[0]?.keyOriginRRectRadii,
      layer?.shape?.geometry?.raw?.keyOriginRRectRadii,
      layer?.shape?.keyOriginRRectRadii,
    ].filter(Boolean);

    for (const raw of candidates) {
      const result = {
        topLeft: toNumber(raw.topLeft, NaN),
        topRight: toNumber(raw.topRight, NaN),
        bottomRight: toNumber(raw.bottomRight, NaN),
        bottomLeft: toNumber(raw.bottomLeft, NaN),
      };
      if (Object.values(result).every(Number.isFinite)) return result;
    }
    return null;
  }

  function drawRectangle(ctx, layer, rule, stroke) {
    withTransform(ctx, layer, rule, ({ x, y, width, height }) => {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fill();
      strokeIfNeeded(ctx, stroke);
    });
  }

  function getCornerRadii(layer = {}, rule = {}, box = {}) {
    // PSD 模式優先採用 Photoshop 匯出的四角半徑，不以 layer 外框高度重新計算。
    if (rule.radiusMode === 'psd' || rule.usePsdRadii === true) {
      const psdRadii = readPsdCornerRadii(layer);
      if (psdRadii) return psdRadii;
    }

    if (rule.radiusMode === 'capsule' || rule.capsule === true) {
      return Math.min(Math.abs(box.width || 0), Math.abs(box.height || 0)) / 2;
    }

    const explicit = rule.cornerRadii || rule.radii || layer.cornerRadii || layer.shape?.cornerRadii;
    if (explicit) return explicit;

    // 即使規則沒有顯式指定，也優先使用 PSD 原始半徑。
    const psdRadii = readPsdCornerRadii(layer);
    if (psdRadii) return psdRadii;

    return rule.radius ?? rule.cornerRadius ?? layer.shape?.cornerRadius ?? 0;
  }

  function drawRoundedRectangle(ctx, layer, rule, stroke) {
    withTransform(ctx, layer, rule, ({ x, y, width, height }) => {
      roundRectPath(ctx, x, y, width, height, getCornerRadii(layer, rule, { width, height }));
      ctx.fill();
      strokeIfNeeded(ctx, stroke);
    });
  }

  function drawEllipse(ctx, layer, rule, stroke) {
    withTransform(ctx, layer, rule, ({ x, y, width, height }) => {
      ctx.beginPath();
      ctx.ellipse(
        x + width / 2,
        y + height / 2,
        Math.abs(width / 2),
        Math.abs(height / 2),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      strokeIfNeeded(ctx, stroke);
    });
  }

  function drawPolygon(ctx, layer, rule, stroke) {
    const shape = layer.shape || {};
    const geometry = shape.geometry || {};
    const sides = Math.max(3, Math.round(toNumber(
      rule.sides,
      toNumber(rule.polygonSides, toNumber(geometry.polygonSides, 3))
    )));

    withTransform(ctx, layer, rule, ({ x, y, width, height }) => {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = Math.abs(width) / 2;
      const ry = Math.abs(height) / 2;
      const startAngle = toNumber(rule.startAngleDeg, -90) * DEG_TO_RAD;

      ctx.beginPath();
      for (let i = 0; i < sides; i += 1) {
        const angle = startAngle + (Math.PI * 2 * i) / sides;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      strokeIfNeeded(ctx, stroke);
    });
  }

  function drawPathFallback(ctx, layer, rule, stroke) {
    const points = (layer.shape && (layer.shape.bezierPoints || layer.shape.vectorPath)) || [];
    const hasRealBezier = Array.isArray(points) && points.some((point) => point.leftDirection || point.rightDirection);

    if (!hasRealBezier) {
      drawRectangle(ctx, layer, { ...rule, bbox: (layer.shape && layer.shape.pathBounds) || rule.bbox }, stroke);
      return;
    }

    ctx.beginPath();
    points.forEach((point, index) => {
      const anchor = point.anchor;
      if (!anchor) return;

      const x = toNumber(anchor.x);
      const y = toNumber(anchor.y);

      if (index === 0) {
        ctx.moveTo(x, y);
        return;
      }

      const prev = points[index - 1];
      const prevAnchor = prev && prev.anchor;
      const prevRight = prev && prev.rightDirection;
      const left = point.leftDirection;

      if (prevRight || left) {
        ctx.bezierCurveTo(
          toNumber(prevRight && prevRight.x, toNumber(prevAnchor && prevAnchor.x, x)),
          toNumber(prevRight && prevRight.y, toNumber(prevAnchor && prevAnchor.y, y)),
          toNumber(left && left.x, x),
          toNumber(left && left.y, y),
          x,
          y
        );
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    strokeIfNeeded(ctx, stroke);
  }

  function getAssetDrawBox(image, box, rule = {}) {
    const mode = String(rule.assetSizing || rule.sizing || 'stretch').toLowerCase();
    if (mode === 'stretch' || mode === 'layerbounds' || mode === 'layer-bounds') return box;

    const naturalWidth = image.naturalWidth || image.width || box.width;
    const naturalHeight = image.naturalHeight || image.height || box.height;
    const imageRatio = naturalHeight ? naturalWidth / naturalHeight : 1;
    const boxRatio = box.height ? box.width / box.height : imageRatio;
    const shouldCover = mode === 'cover';
    const useWidth = shouldCover ? imageRatio < boxRatio : imageRatio > boxRatio;
    const width = useWidth ? box.width : box.height * imageRatio;
    const height = useWidth ? box.width / imageRatio : box.height;

    return {
      x: box.x + (box.width - width) / 2,
      y: box.y + (box.height - height) / 2,
      width,
      height,
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
      sourceBox: box.sourceBox || box,
    };
  }

  function drawAsset(ctx, layer, rule) {
    const filename = rule.asset || rule.assetFilename || rule.src || rule.filename;
    const image = loadAssetImage(filename, rule);
    if (!image) return;

    withTransform(ctx, layer, rule, (box) => {
      const drawBox = getAssetDrawBox(image, box, rule);
      ctx.drawImage(image, drawBox.x, drawBox.y, drawBox.width, drawBox.height);
    });
  }

  const renderers = {
    asset: drawAsset,
    image: drawAsset,
    svg: drawAsset,

    rectangle: drawRectangle,
    rect: drawRectangle,

    roundedRectangle: drawRoundedRectangle,
    roundedRect: drawRoundedRectangle,

    ellipse: drawEllipse,
    circle: drawEllipse,

    polygon: drawPolygon,
    triangle(ctx, layer, rule, stroke) {
      drawPolygon(ctx, layer, { ...rule, sides: 3, polygonSides: 3 }, stroke);
    },

    path: drawPathFallback,

    pill(ctx, layer, rule, stroke) {
      const box = getBox(layer, rule);
      drawRoundedRectangle(ctx, layer, { ...rule, radius: box.height / 2 }, stroke);
    },
  };

  function createRuleFromJsonLayer(layer = {}) {
    const shape = layer.shape || {};
    const geometry = shape.geometry || {};
    const kind = normalizeRendererName(shape.kind || geometry.kind || layer.type);

    // 「CTA_箭頭」這個圖層名稱，不管PSD匯出的向量路徑資料完不完整，
    // 統一畫成一個方向朝右的三角形（▶），這是CTA提示使用者往右看的箭頭圖示，不是任意形狀。
    if (String(layer.psdName || '').trim() === 'CTA_箭頭') {
      return {
        renderer: 'triangle',
        fill: shape.fill || layer.fill,
        stroke: shape.stroke || null,
        sides: 3,
        polygonSides: 3,
        startAngleDeg: 0, // 0度：第一個頂點指向右邊，畫出來的三角形會朝右
        rotation: 0,
        bbox: null, // 用 layer.x/y/width/height 這個乾淨的框，不要用PSD匯出時不完整的pathBounds
        asset: null,
      };
    }

    return {
      renderer: kind,
      fill: shape.fill || layer.fill,
      stroke: shape.stroke || null,
      cornerRadius: shape.cornerRadius || 0,
      radius: shape.cornerRadius || 0,
      polygonSides: geometry.polygonSides || shape.polygonSides,
      sides: geometry.polygonSides || shape.polygonSides,
      rotation: geometry.transform && geometry.transform.rotationDeg,
      // Dynamic layout-managed shapes (for example Headband 案型_BG) must use
      // the live layer box. Other PSD-origin shapes keep their exported bbox.
      bbox: layer.useDynamicBounds === true
        ? null
        : (geometry.bbox || shape.pathBounds || null),
      asset: layer.asset || layer.assetFilename || shape.asset || shape.assetFilename || null,
    };
  }

  function tracePath(ctx, layer, rule = null) {
    if (!ctx || !layer) return false;
    const resolvedRule = rule || createRuleFromJsonLayer(layer);
    const rendererName = normalizeRendererName(resolvedRule.renderer || resolvedRule.type || resolvedRule.shape);
    const box = getBox(layer, resolvedRule);
    const rotation = getRotation(layer, resolvedRule);

    ctx.save();
    if (rotation) {
      ctx.translate(box.centerX, box.centerY);
      ctx.rotate(rotation * DEG_TO_RAD);
      const local = { x: -box.width / 2, y: -box.height / 2, width: box.width, height: box.height };
      if (rendererName === 'roundedRectangle' || rendererName === 'roundedRect' || rendererName === 'pill') {
        roundRectPath(ctx, local.x, local.y, local.width, local.height, getCornerRadii(layer, resolvedRule, local));
      } else if (rendererName === 'ellipse' || rendererName === 'circle') {
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.abs(local.width / 2), Math.abs(local.height / 2), 0, 0, Math.PI * 2);
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.rect(local.x, local.y, local.width, local.height);
        ctx.closePath();
      }
    } else if (rendererName === 'roundedRectangle' || rendererName === 'roundedRect' || rendererName === 'pill') {
      roundRectPath(ctx, box.x, box.y, box.width, box.height, getCornerRadii(layer, resolvedRule, box));
    } else if (rendererName === 'ellipse' || rendererName === 'circle') {
      ctx.beginPath();
      ctx.ellipse(box.centerX, box.centerY, Math.abs(box.width / 2), Math.abs(box.height / 2), 0, 0, Math.PI * 2);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.closePath();
    }
    ctx.restore();
    return true;
  }

  function render(ctx, layer, rule) {
    if (!ctx || !layer || !rule) return false;

    const rendererName = normalizeRendererName(rule.renderer || rule.type || rule.shape);
    const renderer = renderers[rendererName];
    if (!renderer) return false;

    ctx.save();
    const stroke = applyPaint(ctx, layer, rule);
    renderer(ctx, layer, rule, stroke);
    ctx.restore();

    return true;
  }

  function renderJsonShape(ctx, layer) {
    if (!ctx || !layer || layer.type !== 'shape' || !layer.shape) return false;
    return render(ctx, layer, createRuleFromJsonLayer(layer));
  }

  window.ShapeRenderer = Object.freeze({
    render,
    renderJsonShape,
    createRuleFromJsonLayer,
    tracePath,
    renderers: Object.freeze({ ...renderers }),
  });
})();
