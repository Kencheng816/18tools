# GitLab 上傳步驟（第一次）

前置：GitLab 上建好空專案（Settings → General → Visibility… → 勾 **Git Large File Storage (LFS)**），本機裝好 `git` 與 `git-lfs`。

```bash
cd "D:\#AI測試\#18節專案\#整合版本\18節Tool_整合版"
git init -b main
git lfs install                      # 讀 .gitattributes，圖／xlsx／字型走 LFS
git add .
git status --short | head            # 確認沒有 node_modules/、tests/regression-out/（.gitignore 已排除）
git commit -m "18節Tool 整合版 第一階段：單一入口＋13 工具原 core（18/18 黃金全綠）"
git remote add origin <GitLab 專案的 .git 網址>
git push -u origin main              # 約 333MB，其中 244MB 是 LFS 物件
```

推上去後 CI 會自動跑 `check`（幾秒）；`golden` 在 main 分支自動跑（需 headless Chromium，約 10–20 分鐘）。

## 注意
- 資料夾名含 `#`，PowerShell 請整段加引號。
- 若公司 GitLab 沒開 LFS：刪掉 `.gitattributes` 裡 `filter=lfs` 的行再 `git add`，改用一般 git 存放（單一 repo 上限依 GitLab 設定，通常 10GB）。
- AMS 有輸出檔名含 `*`（原工具現況），只在 zip 內，不會進 repo。
- 之後每次更新：`git add -A && git commit -m "..." && git push`。
