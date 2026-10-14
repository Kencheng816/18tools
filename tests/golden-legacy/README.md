# tests/golden-legacy — 自動縮小符號之前的黃金樣本（對照用）

2026-10-06 使用者決定：會員日系列（正式BN／暖身BN／暖正MS／KV；KOL 工單無符號故輸出不變）開啟 `text.autoShrinkSymbols`，
`$`、`%`、逗號、數字後的「號」與 `蝦幣／折／起` 縮成 82%（只縮符號與單位字），**黃金樣本改以整合版新輸出為基準**
（`node tests/run-golden/run-core-golden.js --profiles ... --update-golden --update-reason "..."`）。

這裡保留的是原工具（18節 V7.4／V5.11／V0.5／V1.2）的輸出，只作對照，回歸不讀這個資料夾。
關閉旗標（profile 的 `text.autoShrinkSymbols: false`）即可回到與這些樣本逐 byte 相同。
