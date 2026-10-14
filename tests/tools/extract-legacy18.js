#!/usr/bin/env node
'use strict';

/**
 * 開發工具：從 18節 A 系原工具的 core/app.core.js 抽出指定物件的指定方法（原文不改），
 * 組成 core/legacy18/<id>.overrides.js——整合核心載入後，用 Object.assign 把這些方法蓋到 B 系物件上。
 *
 * 為什麼用「整支方法覆寫」而不是逐行旗標：05 報告 §7-8 結論——A 系的 parseRows／素材查找／文字引擎與 B 系差異太大，
 * 旗標拆分成本高於忠實度收益；以函式為單位覆寫，原文一字不改，零誤差可直接由黃金回歸驗證。
 *
 * 用法：LEGACY18_SOURCE_ROOT=<原工具所在資料夾> node tests/tools/extract-legacy18.js <工具id> <spec.json>
 *   spec.json：{ "source": "暖身BN/18節_暖身BN_Tool_V5.11/core/app.core.js"（相對 LEGACY18_SOURCE_ROOT）, "objects": { "BatchManager": ["parseRows", ...], ... }, "globals": [...],
 *                "prelude": "覆寫前要先定義的常數（檔頭小工具）", "epilogue": "覆寫後的接線（例如把 18節 generateFromSelectedSheet 內的呼叫順序包進被覆寫的方法）" }
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
/** 原工具所在資料夾（repo 外，例如 D:\#AI測試\#18節專案\#整合版本）；spec.source 相對於它。 */
const SOURCE_ROOT = process.env.LEGACY18_SOURCE_ROOT || path.resolve(ROOT, '..');

function extractObjectBlock(source, objectName) {
  const start = source.indexOf(`  const ${objectName} = {`);
  if (start < 0) throw new Error(`找不到 const ${objectName} = {`);
  const end = source.indexOf('\n  };\n', start);
  return source.slice(start, end + 5);
}

/** 抽出 `    name(...) {` … `    },` 或 `    name: value,`（單行）這類成員，保留原文與縮排。 */
function extractMember(block, name) {
  const lines = block.split('\n');
  const headPattern = new RegExp(`^    (?:async )?${name.replace(/[$]/g, '\\$')}\\s*[(:]`);
  const startIndex = lines.findIndex((line) => headPattern.test(line));
  if (startIndex < 0) throw new Error(`找不到成員 ${name}`);
  if (/[,;]\s*$/.test(lines[startIndex]) && !/\{\s*$/.test(lines[startIndex])) return lines[startIndex];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^    },?\s*$/.test(lines[i])) return lines.slice(startIndex, i + 1).join('\n').replace(/\}\s*$/, '},');
  }
  throw new Error(`成員 ${name} 沒有結尾`);
}

function main() {
  const [toolId, specFile] = process.argv.slice(2);
  if (!toolId || !specFile) throw new Error('用法：extract-legacy18.js <工具id> <spec.json>');
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const source = fs.readFileSync(path.join(SOURCE_ROOT, spec.source), 'utf8');

  const sections = Object.entries(spec.objects).map(([objectName, members]) => {
    const block = extractObjectBlock(source, objectName);
    const body = members.map((member) => extractMember(block, member)).join('\n');
    return `  // ── ${objectName}（${members.length} 個成員，原文自 ${spec.source}）──\n  Object.assign(window.${objectName}, {\n${body}\n  });`;
  });

  const output = `/* 18節 ${toolId} — A 系函式級覆寫（自動抽取，請勿手改；重跑 tests/tools/extract-legacy18.js）
 *
 * 來源：${spec.source}
 * 載入時機：profile.coreScripts 排在 core/app.core.js 之後。對 B 系物件做 Object.assign，被蓋掉的 25節 版本仍在 core 內供其他 profile 使用。
 * 這裡的方法原文一字未改；它們以 this.* 互相呼叫，少數全域（${(spec.globals || []).join('、')}）由下方 const 取自 window。
 */
(function applyLegacy18Overrides() {
  'use strict';
  if (!window.BatchManager || !window.TemplateLoader) { console.error('[legacy18] core 尚未載入，覆寫略過'); return; }
${(spec.globals || []).map((name) => `  const ${name} = window.${name};`).join('\n')}
${spec.prelude ? `${spec.prelude}\n` : ''}
${sections.join('\n\n')}
${spec.epilogue ? `\n${spec.epilogue}\n` : ''}})();
`;
  const target = path.join(ROOT, 'core', 'legacy18', `${toolId}.overrides.js`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, output);
  console.log(`已寫入 ${path.relative(ROOT, target)}（${output.split('\n').length} 行）`);
}

main();
