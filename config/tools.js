/* 18節 整合版 — 工具登錄表（單一入口用）
 *
 * 每個工具一筆：id（＝config/profiles/<id>.profile.js）、label、group、sheetHints（工單分頁名含這些字就判定為此工具）、
 * core：'app'＝整合核心 app.html?profile=<id>（13 個工具都是；'tool' 值保留給日後臨時掛原 core 的 tools/<id>/ 用）。
 * 入口頁依 sheetHints 對上傳工單的分頁名打分，列出候選；使用者也可直接點選。
 * 用 <script> 載入（不用 fetch），雙擊 index.html 以 file:// 開啟也能用。
 */
window.TOOL_REGISTRY = [
  { id: 'OM_w1',  label: '外廣 OM Wave 1', version: 'V3.8',  group: '外廣', sheetHints: ['外廣_Wave1'], core: 'app' },
  { id: 'OM_w2',  label: '外廣 OM Wave 2', version: 'V0.5',  group: '外廣', sheetHints: ['外廣_Wave2'], core: 'app' },
  { id: 'LineOA', label: 'LineOA',         version: 'V0.4',  group: '外廣', sheetHints: ['LineOA_wave'], core: 'app' },
  { id: 'network', label: 'Affiliate network', version: 'V0.5', group: 'Affiliate', sheetHints: ['Network_'], core: 'app' },
  { id: 'AMS',    label: 'Line購物 AMS',    version: 'V0.5',  group: 'Affiliate', sheetHints: ['Line購物_'], core: 'app' },
  { id: '鏡面',   label: '跨夜 鏡面',       version: 'V0.1',  group: '跨夜直播', sheetHints: ['_鏡面'], core: 'app' },
  { id: '跨夜',   label: '跨夜直播宣傳圖',  version: 'V0.9',  group: '跨夜直播', sheetHints: ['跨夜_線上宣傳圖'], core: 'app' },
  { id: 'KV',     label: 'KV（Logo+KV 版配）', version: 'V1.2',  group: 'KV', sheetHints: ['Logo+KV'], core: 'app' },
  { id: 'KOL_第一單', label: 'KOL代播圖 第一單', version: 'V0.9', group: 'KOL代播圖', sheetHints: ['第一單'], core: 'app' },
  { id: 'KOL_第二單', label: 'KOL代播圖 第二單', version: 'V0.9', group: 'KOL代播圖', sheetHints: ['第二單'], core: 'app' },
  { id: 'MS',     label: '暖正 MS',         version: 'V0.5',  group: 'BN／MS', sheetHints: ['L1_暖正GD做圖列表', '暖正L1'], core: 'app' },
  { id: '暖身BN', label: '暖身 BN',         version: 'V5.11', group: 'BN／MS', sheetHints: ['暖身BN('], core: 'app' },
  { id: '正式BN', label: '正式 BN',         version: 'V7.4',  group: 'BN／MS', sheetHints: ['正式BN('], core: 'app' },
  { id: 'ENG',    label: 'ENG',             version: 'V0.9',  group: 'ENG', sheetHints: ['day KV', '紅包雨KV', 'OMKV'], core: 'app' },
];
