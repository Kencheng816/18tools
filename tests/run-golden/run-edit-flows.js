#!/usr/bin/env node
/* 手動編輯流程回歸（2026-11-04 封測回饋）
 *
 * 黃金測試只比「工單自動產圖」的輸出；這支補三條使用者手動操作的路：
 *   1. 調整面板改主標 → 畫布跟下載都要是新字（規則每次重畫不能把字抄回工單；下載不能重套工單）。
 *   2. 單一票券製作物（正式BN HBN_02 全站券_雙券 $100）：編輯商品把券縮到 0.6 倍 → 價格要還在、字級等比（90→54）、下載看得到；
 *      還原自動排版 → 素材、框、價格全部回到原狀（下載與黃金逐 byte 相同，只差改過的主標）。
 *   3. 多張商品含券（暖身BN 工單改成「吹風機 + SCS_雙券」）：價格要貼在券那一張（錨點掛複製層、字級依格子等比）；
 *      編輯商品把券縮到 0.6 倍 → 價格跟著券；還原 → 價格回到券的格子。
 *   4. 券面範圍定義（進階「定義券面案型範圍」）：用滑鼠在視窗框出上券／下券／遮罩 → 套用後價格落在框裡、所有用這張券的製作物都重貼、
 *      上券（後面那張）價格帶遮罩；重新產圖直接用定義；編輯商品把券縮 0.6 倍價格仍在框裡；清除定義回到規則位置。
 *
 * 用法：node run-edit-flows.js [--only 1|2|3]   環境變數同 run-core-golden.js。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { startStaticServer } = require('../golden-capture/lib/static-server');
const { launchBrowser } = require('../golden-capture/lib/browser');
const driver = require('../golden-capture/lib/tool-driver');
const { CASES, REPO_ROOT, parseArgs, prepareWorkCopy, openWithProfile, extractZip, pixelDiff } = require('./run-core-golden');

const WORKBOOK = 'tests/golden-inputs/暖身BN/2026.4_18號會員日_美術需求_V5.xlsx';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const near = (a, b, tolerance) => Math.abs(Number(a) - Number(b)) <= tolerance;

async function openCase(browser, server, workDir, profile, sheet, workbookRel) {
  const page = await browser.newPage();
  page.on('dialog', (dialog) => dialog.dismiss());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const testCase = CASES.find((entry) => entry.profile === profile);
  await openWithProfile(page, server.origin, profile);
  await driver.uploadInputs(page, workDir, path.join(workDir, workbookRel), { uploads: { templates: { inputId: 'templateFolderInput', dir: testCase.templatesDir }, assets: { inputId: 'assetInput', dir: testCase.assetsDir }, workbook: { inputId: 'excelInput' } } });
  await driver.generate(page, sheet, '');
  await page.waitForFunction(() => !document.getElementById('assetLoadingOverlay')?.classList.contains('is-open'), { timeout: 120000 });
  await page.evaluate(() => window.ImportFlow?.close?.());
  return { page, errors };
}

async function select(page, namePattern) {
  const index = await page.evaluate((pattern) => window.AppState.templates.findIndex((item) => new RegExp(pattern).test(item.name)), namePattern);
  if (index < 0) throw new Error(`找不到製作物 ${namePattern}`);
  await page.evaluate((i) => document.querySelectorAll('.batch-thumb')[i]?.click(), index);
  await sleep(800);
  return index;
}

/** 目前製作物的商品層與價格層摘要 */
const layersOf = (page) => page.evaluate(() => {
  const out = {};
  Object.entries(window.AppState.template.layers).forEach(([key, layer]) => {
    if ((layer.type === 'image' && /product|商品/i.test(key)) || layer.source === 'auto_price_v2') out[key] = { asset: layer.assetFilename, x: layer.x, y: layer.y, width: layer.width, height: layer.height, fontSizePx: layer.fontSizePx, anchor: layer.anchor?.layerKey, text: layer.text };
  });
  return out;
});
const priceKeys = (layers) => Object.keys(layers).filter((key) => key.startsWith('__auto_price_v2_'));

async function exportImage(page, namePattern) {
  const files = await extractZip(await driver.exportZip(page, 'png'));
  const pattern = new RegExp(`${namePattern.replace('$', '')}\\.png$`);
  for (const [name, buffer] of files) if (pattern.test(name)) return buffer;
  return null;
}

async function composeAndScale(page, itemId, scaleMul) {
  await page.evaluate(() => window.ProductComposer.open());
  await page.waitForFunction(() => !document.getElementById('productComposerModal')?.classList.contains('hidden'), { timeout: 30000 });
  await sleep(1200);
  await page.evaluate((id, k) => window.ProductComposer.setItemTransform(id, { scaleMul: k, dx: 60, dy: 30 }), itemId, scaleMul);
  await sleep(600);
  await page.evaluate(() => document.getElementById('composerApply').click());
  await page.waitForFunction(() => document.getElementById('productComposerModal')?.classList.contains('hidden'), { timeout: 60000 });
  await sleep(1500);
}

async function restore(page) {
  await page.evaluate(() => window.ProductComposer.restoreAuto());
  await sleep(2500);
}

// ── 1 + 2：正式BN HBN_02 ──
async function flowSingleCoupon(browser, server, workDir) {
  const problems = [];
  const { page, errors } = await openCase(browser, server, workDir, '正式BN', '正式BN(319發單)', WORKBOOK);
  try {
    await select(page, 'HBN_02$');
    const golden = fs.readFileSync(path.join(REPO_ROOT, 'tests/golden/正式BN/正式BN(319發單)/images/03_HBN/HBN_02.png'));

    // 1. 改主標
    await page.evaluate(() => { const input = document.querySelector('#itemTextFields textarea'); input.value = '測試改字ABC'; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); });
    await sleep(1500);
    const title = await page.evaluate(() => window.AppState.template.layers.title?.text);
    if (title !== '測試改字ABC') problems.push(`改主標後圖層文字是「${title}」`);
    const textExport = await exportImage(page, 'HBN_02$');
    const textDiff = pixelDiff(golden, textExport, 'HBN_02.png', path.join(REPO_ROOT, 'tests/golden-diff/edit-flows/HBN_02_text.png'));
    if (!(textDiff.pixels > 1000)) problems.push('改主標後下載的圖跟黃金一樣（手動改字沒進下載）');

    // 2. 編輯商品：券縮 0.6
    const before = await layersOf(page);
    if (priceKeys(before).length !== 2) problems.push(`HBN_02 應有 2 個價格層，實際 ${priceKeys(before).length}`);
    await composeAndScale(page, 'item0', 0.6);
    const after = await layersOf(page);
    if (priceKeys(after).length !== 2) problems.push(`合成後價格層剩 ${priceKeys(after).length} 個（價格消失）`);
    priceKeys(after).forEach((key) => {
      if (!near(after[key].fontSizePx, before[key].fontSizePx * 0.6, 1.5)) problems.push(`${key} 字級 ${after[key].fontSizePx}，應約為 ${before[key].fontSizePx} × 0.6`);
      const product = after.product;
      if (product && (after[key].x < product.x - 5 || after[key].x + after[key].width > product.x + product.width + 5)) problems.push(`${key} 跑到商品框外`);
    });
    if (!/_compose\.png$/.test(after.product?.asset || '')) problems.push(`合成後商品素材是 ${after.product?.asset}`);
    const composeExport = await exportImage(page, 'HBN_02$');
    if (pixelDiff(textExport, composeExport, 'HBN_02.png', path.join(REPO_ROOT, 'tests/golden-diff/edit-flows/HBN_02_compose.png')).pixels < 5000) problems.push('合成後下載的圖沒有變（合成沒進下載）');

    // 還原
    await restore(page);
    const restored = await layersOf(page);
    ['product', ...priceKeys(before)].forEach((key) => {
      ['x', 'y', 'width', 'height', 'fontSizePx', 'asset'].forEach((prop) => {
        if (before[key] && String(before[key][prop]) !== String(restored[key]?.[prop])) problems.push(`還原後 ${key}.${prop} = ${restored[key]?.[prop]}（原本 ${before[key][prop]}）`);
      });
    });
    const restoredExport = await exportImage(page, 'HBN_02$');
    if (pixelDiff(textExport, restoredExport, 'HBN_02.png', path.join(REPO_ROOT, 'tests/golden-diff/edit-flows/HBN_02_restored.png')).pixels !== 0) problems.push('還原後下載的圖跟合成前不一樣');
  } finally { await page.close(); }
  if (errors.length) problems.push(`頁面錯誤：${errors.slice(0, 3).join(' | ')}`);
  return problems;
}

// ── 3：暖身BN HBN_06 改成「吹風機 + SCS_雙券」──
function writeMultiCouponWorkbook(workDir) {
  const wb = XLSX.readFile(path.join(REPO_ROOT, WORKBOOK), { cellStyles: false });
  const ws = wb.Sheets['暖身BN(311發單)'];
  // HBN 區塊裡「商品圖1＝SCS_雙券」那一格（不寫死位置，工單欄位增減也找得到）
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  let address = null;
  let inHbn = false;
  rows.forEach((row, r) => {
    if (row[0] && String(row[0]).trim() === 'HBN') inHbn = true;
    else if (row[0] && inHbn) inHbn = false;
    if (inHbn && !address) { const c = row.findIndex((v) => v === 'SCS_雙券'); if (c >= 0) address = XLSX.utils.encode_cell({ r, c: c + XLSX.utils.decode_range(ws['!ref']).s.c }); }
  });
  const cell = address && ws[address];
  if (!cell || cell.v !== 'SCS_雙券') throw new Error(`黃金工單 HBN 區塊找不到 商品圖1＝SCS_雙券（${address}），測試要更新`);
  cell.v = '吹風機 + SCS_雙券'; delete cell.w; delete cell.r; delete cell.h;
  const out = path.join(workDir, 'tests', 'mutation-tmp', 'edit-flows_multi_coupon.xlsx');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  XLSX.writeFile(wb, out);
  return path.relative(workDir, out);
}

async function flowMultiCoupon(browser, server, workDir) {
  const problems = [];
  const workbookRel = writeMultiCouponWorkbook(workDir);
  const { page, errors } = await openCase(browser, server, workDir, '暖身BN', '暖身BN(311發單)', workbookRel);
  try {
    await select(page, 'HBN_06$');
    const before = await layersOf(page);
    if (!before.product__multi1) problems.push('沒有拆成兩張（product__multi1 不存在）');
    if (!/SCS_雙券/.test(before.product__multi1?.asset || '')) problems.push(`第二張素材是 ${before.product__multi1?.asset}`);
    if (priceKeys(before).length !== 2) problems.push(`應有 2 個價格層（券的），實際 ${priceKeys(before).length}`);
    priceKeys(before).forEach((key) => {
      if (before[key].anchor !== 'product__multi1') problems.push(`${key} 錨點是 ${before[key].anchor}，應掛在券那一層`);
      const coupon = before.product__multi1;
      if (coupon && (before[key].x < coupon.x - 10 || before[key].x + before[key].width > coupon.x + coupon.width + 10)) problems.push(`${key} 沒有貼在券的格子裡`);
      if (!(before[key].fontSizePx < 60)) problems.push(`${key} 字級 ${before[key].fontSizePx} 沒有依券的格子縮小`);
    });

    await composeAndScale(page, 'item1', 0.6);
    const after = await layersOf(page);
    if (priceKeys(after).length !== 2) problems.push(`合成後價格層剩 ${priceKeys(after).length} 個`);
    priceKeys(after).forEach((key) => { if (!near(after[key].fontSizePx, before[key].fontSizePx * 0.6, 1.5)) problems.push(`合成後 ${key} 字級 ${after[key].fontSizePx}，應約為 ${before[key].fontSizePx} × 0.6`); });

    await restore(page);
    const restored = await layersOf(page);
    priceKeys(before).forEach((key) => {
      ['x', 'y', 'fontSizePx', 'anchor'].forEach((prop) => { if (!near(restored[key]?.[prop], before[key][prop], 1) && String(restored[key]?.[prop]) !== String(before[key][prop])) problems.push(`還原後 ${key}.${prop} = ${restored[key]?.[prop]}（原本 ${before[key][prop]}）`); });
    });
    if (!/SCS_雙券/.test(restored.product__multi1?.asset || '')) problems.push('還原後第二張（券）沒有回來');
  } finally { await page.close(); }
  if (errors.length) problems.push(`頁面錯誤：${errors.slice(0, 3).join(' | ')}`);
  return problems;
}

// ── 4：券面範圍定義（正式BN HBN_02 全站券_雙券） ──
const SLOT_RECTS = { top: [0.34, 0.12, 0.92, 0.40, -6], bottom: [0.34, 0.50, 0.92, 0.80, 2], mask: [0.02, 0.02, 0.98, 0.52, -6] };

async function drawSlot(page, label, [x1, y1, x2, y2, angle]) {
  await page.evaluate((text) => { [...document.querySelectorAll('.coupon-slot-item')].find((el) => el.textContent.includes(text))?.click(); }, label);
  const box = await page.$eval('#couponSlotCanvas', (canvas) => { const r = canvas.getBoundingClientRect(); return { left: r.left, top: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(box.left + x1 * box.w, box.top + y1 * box.h); await page.mouse.down();
  await page.mouse.move(box.left + x2 * box.w, box.top + y2 * box.h, { steps: 5 }); await page.mouse.up();
  await page.evaluate((a) => { const input = document.getElementById('couponSlotAngle'); input.value = a; input.dispatchEvent(new Event('input')); }, angle);
}

/** 價格層的中心是否落在券框 × 比例範圍裡（容許 2px） */
const insideSlot = (price, coupon, rel) => {
  const cx = price.x + price.width / 2; const cy = price.y + price.height / 2;
  const ex = coupon.x + rel.cx * coupon.width; const ey = coupon.y + rel.cy * coupon.height;
  return near(cx, ex, 2) && near(cy, ey, 2) && near(price.width, rel.w * coupon.width, 2);
};

async function flowCouponSlots(browser, server, workDir) {
  const problems = [];
  const { page, errors } = await openCase(browser, server, workDir, '正式BN', '正式BN(319發單)', WORKBOOK);
  try {
    await page.evaluate((key) => localStorage.removeItem(key), '18tool_couponPriceSlots');
    await select(page, 'HBN_02$');
    const before = await layersOf(page);
    await page.evaluate(() => { if (!document.body.classList.contains('is-advanced')) document.getElementById('advancedToggleBtn').click(); });
    const button = await page.$eval('#defineCouponSlotBtn', (el) => ({ disabled: el.disabled, display: getComputedStyle(el).display }));
    if (button.disabled || button.display === 'none') problems.push(`進階模式下「定義券面案型範圍」按鈕 ${JSON.stringify(button)}`);
    await page.evaluate(() => window.CouponSlotEditor.open());
    await page.waitForFunction(() => !document.getElementById('couponSlotModal')?.classList.contains('hidden'), { timeout: 20000 });
    if ((await page.$eval('#couponSlotKind', (el) => el.value)) !== 'double') problems.push('全站券_雙券 應預設為雙券');
    await drawSlot(page, '上券價格範圍', SLOT_RECTS.top);
    await drawSlot(page, '下券價格範圍', SLOT_RECTS.bottom);
    await drawSlot(page, '上券遮罩', SLOT_RECTS.mask);
    const framed = await page.$$eval('.coupon-slot-item small', (els) => els.map((el) => el.textContent));
    if (framed.join() !== '已框,已框,已框') problems.push(`框的狀態：${framed.join('、')}`);
    await page.evaluate(() => document.getElementById('couponSlotApply').click());
    await sleep(2500);
    const def = await page.evaluate(() => window.CouponSlots.get('全站券_雙券'));
    if (!def?.top || !def?.bottom || !def?.mask) problems.push(`存下來的定義不完整：${JSON.stringify(def)}`);
    if (def?.top && !near(def.top.angle, -6, 0.6)) problems.push(`上券角度 ${def.top.angle}`);

    const after = await layersOf(page);
    const coupon = after.product;
    ['top', 'bottom'].forEach((slot) => {
      const key = `__auto_price_v2_${slot}`;
      if (!after[key]) { problems.push(`${key} 不見了`); return; }
      if (def?.[slot] && !insideSlot(after[key], coupon, def[slot])) problems.push(`${key} 沒有落在框裡：${JSON.stringify(after[key])}`);
    });
    const masks = await page.evaluate(() => ({ top: !!window.AppState.template.layers.__auto_price_v2_top?.priceClipMask, bottom: !!window.AppState.template.layers.__auto_price_v2_bottom?.priceClipMask }));
    if (!masks.top || masks.bottom) problems.push(`上券（後面那張）的價格要帶遮罩、下券不帶：${JSON.stringify(masks)}`);
    // 同一張券的其他製作物也要重貼（HBN_04 也是全站券_雙券 $40？找任一張同券）
    const others = await page.evaluate(() => window.AppState.templates.map((item, index) => ({ index, name: item.name, same: Object.values(item.data.layers).some((l) => /全站券_雙券/.test(l.assetFilename || '')), slot: !!Object.values(item.data.layers).find((l) => l.source === 'auto_price_v2')?.priceCouponSlot })).filter((x) => x.same));
    const notApplied = others.filter((x) => !x.slot).map((x) => x.name);
    if (notApplied.length) problems.push(`同券的製作物沒有重貼：${notApplied.join('、')}`);
    const exportAfter = await exportImage(page, 'HBN_02$');
    if (!(pixelDiff(fs.readFileSync(path.join(REPO_ROOT, 'tests/golden/正式BN/正式BN(319發單)/images/03_HBN/HBN_02.png')), exportAfter, 'HBN_02.png', path.join(REPO_ROOT, 'tests/golden-diff/edit-flows/HBN_02_slots.png')).pixels > 1000)) problems.push('套用券面定義後下載的圖跟黃金一樣');

    // 合成：券縮 0.6 → 價格仍在框裡（相對合成後的券框）
    await composeAndScale(page, 'item0', 0.6);
    const composed = await layersOf(page);
    const couponRel = await page.evaluate(() => window.AppState.template.layers.product?.productCompose?.couponRel);
    if (!couponRel) problems.push('合成後沒有記下券在合成圖裡的位置（couponRel）');
    else {
      const base = composed.product;
      const couponBox = { x: base.x + couponRel.x * base.width, y: base.y + couponRel.y * base.height, width: couponRel.width * base.width, height: couponRel.height * base.height };
      ['top', 'bottom'].forEach((slot) => { const key = `__auto_price_v2_${slot}`; if (composed[key] && def?.[slot] && !insideSlot(composed[key], couponBox, def[slot])) problems.push(`合成後 ${key} 沒有跟著券：${JSON.stringify(composed[key])} 券框 ${JSON.stringify(couponBox)} base ${JSON.stringify(base)} 期望中心 ${couponBox.x + def[slot].cx * couponBox.width},${couponBox.y + def[slot].cy * couponBox.height}`); });
    }
    await restore(page);

    // 清除定義 → 回到規則位置
    await page.evaluate(() => { window.CouponSlots.save('全站券_雙券', null); window.CouponSlots.applyEverywhere('全站券_雙券'); });
    await page.evaluate(() => window.BatchManager.refreshTemplateFromBatchRecord?.(window.AppState.template));
    await sleep(500);
    const cleared = await page.evaluate(() => window.CouponSlots.has('全站券_雙券'));
    if (cleared) problems.push('清除定義後還有定義');
    void before;
  } finally { await page.close(); }
  if (errors.length) problems.push(`頁面錯誤：${errors.slice(0, 3).join(' | ')}`);
  return problems;
}

const FLOWS = [
  { id: '1+2', name: '正式BN HBN_02：改主標進下載／單一票券合成 0.6 倍價格跟著縮／還原回原狀', run: flowSingleCoupon },
  { id: '3', name: '暖身BN HBN_06：「吹風機 + SCS_雙券」價格貼在券上／合成跟著券／還原', run: flowMultiCoupon },
  { id: '4', name: '正式BN HBN_02：進階「定義券面案型範圍」框選 → 價格落在框裡、同券全部重貼、上券遮罩、合成跟著券、清除', run: flowCouponSlots },
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const only = args.only ? String(args.only) : '';
  const workDir = prepareWorkCopy();
  const { browser } = await launchBrowser();
  const server = await startStaticServer(workDir);
  let failed = 0;
  try {
    for (const flow of FLOWS) {
      if (only && !flow.id.split('+').includes(only) && flow.id !== only) continue;
      let problems;
      try { problems = await flow.run(browser, server, workDir); } catch (error) { problems = [`例外：${error.message}`]; }
      if (problems.length) { failed += 1; console.log(`✗ ${flow.name}`); problems.forEach((line) => console.log(`    ${line}`)); } else console.log(`✓ ${flow.name}`);
    }
  } finally { await browser.close(); server.close(); }
  console.log(failed ? `run-edit-flows：${failed} 個失敗` : 'run-edit-flows：全部通過');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main().catch((error) => { console.error(error); process.exit(1); });
