#!/usr/bin/env node
/* 重做導覽範例資料 tour/tour-sample-data.js（工單＋素材內嵌 base64；modules/tour.js 用）。
 * 用法：node tests/tools/build-tour-sample.js  （需 NODE_PATH 指到有 xlsx 的 node_modules） */
'use strict';
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const header = ['製作內容', '數量', 'K數', '尺寸', '版配', '', '', '', '', '', '日期', '編號', '主題日/頁面', '主標', '副標', '法務小字', '商品圖1', '價格', 'CTA'];
const rows = [
  ['18節 暖身BN 導覽範例工單（內建，導覽結束會清掉）'],
  [],
  header,
  ['HBN', '3', '<150K', '1200*360', '', '', '', '', '', '', '4/5-4/18', '1', '攻略頁', '4/18 刷卡享88折', '永豐最高享$3,000', '謹慎理財，信用至上', '永豐銀行', '', '放心買 安心退'],
  ['', '', '', '', '', '', '', '', '', '', '4/5-4/18', '2', '攻略頁', '蝦皮直營限定', '滿千用券折$350', '優惠券詳細規則請見活動說明', 'SCS_雙券', '$350', '放心買 安心退'],
  ['', '', '', '', '', '', '', '', '', '', '4/5-4/18', '3', '攻略頁', '4/18 美妝日', '全新A醇 寵愛自己', '優惠券詳細規則請見活動說明', '吹風機 + ELIXIR 怡麗絲爾 全新A醇', '', '放心買 安心退'],
];
const ws = XLSX.utils.aoa_to_sheet(rows);
ws['!merges'] = [0, 1, 2, 3].map((c) => ({ s: { r: 3, c }, e: { r: 5, c } }));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '暖身BN(311發單)');
const excel = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

const ASSETS = [['03_HBN', 'HBN_CTA.png'], ['03_HBN', 'HBN_KV_BG.png'], ['03_HBN', 'HBN_P.png'], ['03_HBN', 'HBN_放心買安心退.png'], ['03_HBN', 'HBN_蝦皮VIP_KV_BG.png'], ['03_HBN', 'HBN_規範.png'],
  ['素材', '永豐銀行.png'], ['素材', 'SCS_雙券.png'], ['素材', '全站券_雙券.png'], ['素材', '吹風機.png'], ['素材', 'ELIXIR 怡麗絲爾 全新A醇.png'], ['05_POPUP', '蝦皮直營_LOGO.svg']];
const files = ASSETS.map(([dir, name]) => ({ path: `assets/${dir}/${name}`, name, type: name.endsWith('.svg') ? 'image/svg+xml' : 'image/png', b64: fs.readFileSync(path.join(ROOT, 'assets/暖身BN', dir, name)).toString('base64') }));

const out = `/* 18節 暖身BN 新手導覽用的範例資料（modules/tour.js 開始導覽時才載入；導覽結束就清掉，不影響實際工單）
 * 工單：一個 HBN 區塊 3 筆（1 永豐銀行 LOGO／2 SCS_雙券 $350／3「吹風機 + ELIXIR 怡麗絲爾 全新A醇」多商品）；素材：03_HBN 公版素材＋商品與券。
 * 重做：node tests/tools/build-tour-sample.js（素材與工單內容都從 assets/暖身BN 抽） */
window.TOUR_SAMPLE = ${JSON.stringify({ excelName: '2026.4_18號會員日_美術需求_導覽範例.xlsx', sheet: '暖身BN(311發單)', excel: excel.toString('base64'), files })};
`;
fs.writeFileSync(path.join(ROOT, 'tour', 'tour-sample-data.js'), out);
console.log(`tour/tour-sample-data.js ${(out.length / 1024).toFixed(0)} KB，${files.length} 張素材`);
