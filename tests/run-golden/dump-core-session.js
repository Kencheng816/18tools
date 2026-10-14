#!/usr/bin/env node
'use strict';

/**
 * 除錯工具：用整合核心（app.html?profile=）跑 cases-core.json 的一個案例，把 session.json（圖層座標／文字／素材）寫到指定檔，
 * 方便與 tests/golden/<case>/session.json 逐鍵比對找出差異在哪個圖層／欄位（run-core-golden 只比圖）。
 *
 * 用法：node tests/run-golden/dump-core-session.js "<case id>" <輸出檔.json>
 * 環境變數同 run-core-golden.js（GOLDEN_WORK_DIR、NODE_PATH）。
 */

const path = require('path');
const fs = require('fs');

const { startStaticServer } = require('../golden-capture/lib/static-server');
const { launchBrowser } = require('../golden-capture/lib/browser');
const driver = require('../golden-capture/lib/tool-driver');
const { prepareWorkCopy, openWithProfile, CASES } = require('./run-core-golden.js');

async function main() {
  const [caseId, outputFile] = process.argv.slice(2);
  const testCase = CASES.find((entry) => entry.id === caseId);
  if (!testCase || !outputFile) throw new Error('用法：dump-core-session.js "<case id>" <輸出檔.json>');

  const workDir = prepareWorkCopy();
  const server = await startStaticServer(workDir);
  const { browser } = await launchBrowser();
  const page = await browser.newPage();
  page.on('dialog', (dialog) => dialog.dismiss());
  try {
    await openWithProfile(page, server.origin, testCase.profile);
    const uploads = {
      templates: { inputId: 'templateFolderInput', dir: testCase.templatesDir },
      assets: { inputId: 'assetInput', dir: testCase.assetsDir },
      workbook: { inputId: 'excelInput' },
    };
    await driver.uploadInputs(page, workDir, path.join(workDir, testCase.workbook), { uploads });
    const result = await driver.generate(page, testCase.sheet, testCase.project || '');
    const dump = await driver.dumpSession(page);
    fs.writeFileSync(outputFile, JSON.stringify(dump, null, 2));
    console.log(`generated ${result.generated}，已寫入 ${outputFile}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
