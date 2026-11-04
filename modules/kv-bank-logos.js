/* 整合版（18節 KV）— 銀行 LOGO 不再寫死名單（2026-11-03 工單變更清查 #1）
 *
 * 原本：rules/KV/template-routing.js 的 bankLogoList 寫死 5 家銀行，工單出現新銀行、就算素材夾放了 新銀行.svg 也抓不到。
 * 現在：工單裡「任何一格的文字完全等於素材夾某個圖檔的檔名（不含副檔名；svg／png／jpg／webp 都認）」就視為銀行 LOGO，
 * 由上到下、由左到右排序；原名單仍保留（一起比對）。公版自己用的背景／影子／USP 這類檔案不算。
 * 純加法：包住 KV 覆寫檔的 BatchManager.findKvKeywordList（覆寫檔是自動抽取的，不直接改）。
 */
(function initKvBankLogos() {
  'use strict';

  const SKIP_NAME = /bg|背景|影子|規範|範圍|^usp$|shopee-logo/i;
  const IMAGE_EXT = /\.(svg|png|jpe?g|webp|gif)$/i;
  const stem = (name) => String(name || '').split(/[\\/]/).pop().replace(IMAGE_EXT, '').trim();

  /** 素材夾裡可當銀行 LOGO 的檔名（不含副檔名） */
  function assetStems() {
    const entries = window.AssetStore?.getFileEntries?.() || [];
    return [...new Set(entries.filter((entry) => IMAGE_EXT.test(entry.filename) && !SKIP_NAME.test(stem(entry.filename))).map((entry) => stem(entry.filename)))];
  }

  function wire() {
    const BatchManager = window.BatchManager;
    if (!BatchManager?.findKvKeywordList || BatchManager.findKvKeywordList.__bankLogosWired) return;
    const original = BatchManager.findKvKeywordList;
    const wrapped = function findKvKeywordListWithAssets(rows, keywords = []) {
      const extra = assetStems().filter((name) => !keywords.includes(name));
      return original.call(this, rows, [...keywords, ...extra]); // 一起找，順序＝工單由上到下、由左到右
    };
    wrapped.__bankLogosWired = true;
    BatchManager.findKvKeywordList = wrapped;
  }

  function main() {
    const whenReady = () => { if (window.__coreScriptsReady && window.__appReady) Promise.resolve(window.__appReady).then(wire); else setTimeout(whenReady, 100); };
    whenReady();
  }

  window.KvBankLogos = Object.freeze({ assetStems });
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', main, { once: true });
  else main();
})();
