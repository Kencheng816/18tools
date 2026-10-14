/* 分類清單（id／label／family／sheetHints）— 18節 整合核心（第二階段）
 * 只列已折進一份 core 並通過黃金回歸的工具；其餘工具仍由入口頁載入 tools/<id>/ 原 core。
 * 由 core/profile-loader.js 以 <script> 載入（不用 fetch，雙擊 index.html 用 file:// 開也能跑）。 */
window.__profileRegistry = window.__profileRegistry || {};
window.__profileRegistry["index"] = [
  { "id": "LineOA", "label": "18節 LineOA V0.4", "family": "b", "sheetHints": ["LineOA_wave"] },
  { "id": "鏡面", "label": "18節 鏡面 V0.1", "family": "ancestor", "sheetHints": ["_鏡面"] },
  { "id": "跨夜", "label": "18節 跨夜直播宣傳圖 V0.9", "family": "ancestor", "sheetHints": ["跨夜_線上宣傳圖"] },
  { "id": "OM_w1", "label": "18節 外廣OM Wave 1 V3.8", "family": "ancestor", "sheetHints": ["外廣_Wave1"] },
  { "id": "OM_w2", "label": "18節 外廣OM Wave 2 V0.5", "family": "ancestor", "sheetHints": ["外廣_Wave2"] },
  { "id": "network", "label": "18節 Affiliate network V0.5", "family": "ancestor", "sheetHints": ["Network_"] },
  { "id": "AMS", "label": "18節 Line購物AMS V0.5", "family": "ancestor", "sheetHints": ["Line購物_"] },
  { "id": "ENG", "label": "18節 ENG Tool V0.9", "family": "ancestor", "sheetHints": ["day KV", "紅包雨KV", "OMKV"] },
  { "id": "KV", "label": "18節 KV V1.2", "family": "ancestor", "sheetHints": ["Logo+KV"] },
  { "id": "KOL_第一單", "label": "18節 KOL代播圖 第一單 V0.9", "family": "ancestor", "sheetHints": ["第一單"] },
  { "id": "KOL_第二單", "label": "18節 KOL代播圖 第二單 V0.9", "family": "ancestor", "sheetHints": ["第二單"] },
  { "id": "暖身BN", "label": "18節 暖身BN V5.11", "family": "ancestor", "sheetHints": ["暖身BN(", "新增製作物_OSP BN"] },
  { "id": "正式BN", "label": "18節 正式BN V7.4", "family": "ancestor", "sheetHints": ["正式BN(", "新增製作物_正式BN"] },
  { "id": "MS", "label": "18節 暖正MS V0.5", "family": "ancestor", "sheetHints": ["L1_暖正GD做圖列表", "暖正L1"] }
];
