# Vercel 部署教學

本文件將詳細說明如何將 Kahoot Leaderboard 專案部署至 Vercel 平台，並確保學生資料的隱私安全。

## 前置準備

1. **GitHub 帳號**：用於託管程式碼
2. **Vercel 帳號**：前往 [vercel.com](https://vercel.com) 註冊（可使用 GitHub 帳號登入）
3. **準備好的 CSV 資料檔案**：
   - `Kahoot_scores.csv`：Kahoot 原始成績
   - `students.csv`：學生名冊

## 部署步驟

### 步驟 1：將程式碼推送至 GitHub

1. **建立 GitHub 儲存庫**：
   - 登入 GitHub
   - 點擊右上角的「+」→「New repository」
   - 輸入儲存庫名稱（例如：`kahoot-leaderboard`）
   - 選擇「Private」（私有儲存庫）
   - 點擊「Create repository」

2. **推送程式碼**：
   ```bash
   cd /path/to/kahoot-leaderboard
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的帳號/kahoot-leaderboard.git
   git push -u origin main
   ```

   **⚠️ 重要提醒**：
   - 確保 `.gitignore` 檔案已正確設定
   - **不要**將 CSV 資料檔案推送至 GitHub（為保護學生隱私）
   - 可以在 `.gitignore` 中加入：
     ```
     # 學生資料（隱私保護）
     client/public/data/*.csv
     ```

### 步驟 2：連結 Vercel 與 GitHub

1. 登入 [Vercel](https://vercel.com)
2. 點擊「Add New...」→「Project」
3. 選擇「Import Git Repository」
4. 授權 Vercel 存取您的 GitHub 帳號
5. 選擇剛才建立的 `kahoot-leaderboard` 儲存庫
6. 點擊「Import」

### 步驟 3：設定專案

1. **Framework Preset**：Vercel 應該會自動偵測為「Vite」
2. **Root Directory**：保持預設（留空）
3. **Build Command**：`pnpm build`（或保持預設）
4. **Output Directory**：`dist/public`（或保持預設）

### 步驟 4：設定環境變數（保護隱私資料）

這是**最重要**的步驟，用於安全地上傳 CSV 資料。


#### 方法 A：使用環境變數指定 CSV URL（推薦）

1. **準備 CSV 來源**：
   - 將 `Kahoot_scores.csv` 與 `students.csv` 上傳至 Vercel Blob 或任何可公開讀取的儲存空間
   - 取得兩個檔案的 HTTPS 連結（亦可使用相對路徑 `/data/*.csv` 於本地開發）

2. **在 Vercel 設定環境變數**：
   - 在專案設定頁面點選「Environment Variables」
   - 新增以下變數：

   | Name | Value |
   |------|-------|
   | `VITE_KAHOOT_SCORES_CSV_URL` | 貼上 Kahoot_scores.csv 的讀取網址 |
   | `VITE_STUDENTS_CSV_URL` | 貼上 students.csv 的讀取網址 |

   - 選擇適用環境：`Production`, `Preview`, `Development`（建議全選）
   - 點擊「Save」

3. **（可選）設定本地開發環境**：
   - 建立 `.env.local`，內容例如：

```env
VITE_KAHOOT_SCORES_CSV_URL=/data/Kahoot_scores.csv
VITE_STUDENTS_CSV_URL=/data/students.csv
```

> 專案程式碼已預設支援從上述環境變數讀取資料，無需額外修改。

4. **推送或重新部署**：確保環境變數生效後重新部署即可。

#### 方法 B：使用 Vercel Blob（進階）

如果 CSV 檔案非常大，可以使用 Vercel Blob 儲存：

1. 安裝 Vercel Blob SDK：
   ```bash
   pnpm add @vercel/blob
   ```

2. 上傳檔案至 Vercel Blob（需使用 Vercel CLI）

3. 修改程式碼從 Blob URL 讀取

（此方法較複雜，建議先使用方法 A）

### 步驟 5：完成部署

1. 點擊「Deploy」按鈕
2. 等待建置完成（約 1-3 分鐘）
3. 建置成功後，Vercel 會提供一個網址（例如：`https://kahoot-leaderboard.vercel.app`）
4. 點擊網址測試網站是否正常運作

## 更新成績資料

### 使用環境變數方式

1. **編輯新的 CSV 檔案**（例如新增一週的成績）
2. **重新上傳檔案**到您選用的儲存空間（如 Vercel Blob），覆蓋原先的檔案
3. 若網址變動，請同步更新 `VITE_KAHOOT_SCORES_CSV_URL` 或 `VITE_STUDENTS_CSV_URL`
4. 無需重新部署即可在下一次載入時取得最新資料；若有快取，可手動重新整理或觸發重新部署確保更新

### 使用 Git 推送方式（如果 CSV 在 public 目錄）

1. 更新 `client/public/data/Kahoot_scores.csv`
2. 推送至 GitHub：
   ```bash
   git add client/public/data/Kahoot_scores.csv
   git commit -m "Update Kahoot scores"
   git push
   ```
3. Vercel 會自動偵測並重新部署

## 自訂網域（選用）

1. 在 Vercel 專案設定中，找到「Domains」
2. 點擊「Add」
3. 輸入您的網域名稱（例如：`kahoot.your-school.edu.tw`）
4. 依照 Vercel 的指示，在您的 DNS 服務商設定 CNAME 記錄
5. 等待 DNS 生效（通常 5-30 分鐘）

## 隱私與安全建議

### ✅ 建議做法

1. **使用環境變數**：將 CSV 資料存放在 Vercel 環境變數中，而非 Git 儲存庫
2. **私有儲存庫**：將 GitHub 儲存庫設為 Private
3. **僅顯示後四碼**：系統已預設僅顯示學號後四碼
4. **定期更新**：每次 Kahoot 活動後更新成績

### ❌ 避免做法

1. **不要將 CSV 推送至公開的 GitHub 儲存庫**
2. **不要在程式碼中硬編碼學生資料**
3. **不要使用 HTTP（Vercel 預設使用 HTTPS，無需擔心）**

## 常見問題排解

### Q1: 部署後網站顯示「尚無成績資料」

**可能原因**：
- 環境變數未正確設定
- CSV 格式錯誤

**解決方法**：
1. 檢查 Vercel 環境變數是否已儲存
2. 確認 CSV 內容格式正確（UTF-8 編碼，逗號分隔）
3. 查看 Vercel 部署日誌（Deployments → 點擊最新部署 → Runtime Logs）

### Q2: 環境變數更新後網站沒有變化

**解決方法**：
- 環境變數更新後需要**重新部署**才會生效
- 在 Vercel 專案頁面點擊「Deployments」→「Redeploy」

### Q3: 建置失敗

**可能原因**：
- 依賴套件安裝失敗
- TypeScript 編譯錯誤

**解決方法**：
1. 查看 Vercel 建置日誌
2. 在本地執行 `pnpm build` 測試
3. 確認 `package.json` 中的依賴版本正確

### Q4: 如何查看部署日誌？

1. 進入 Vercel 專案頁面
2. 點擊「Deployments」
3. 點擊最新的部署記錄
4. 查看「Build Logs」和「Runtime Logs」

## 進階設定

### 設定自動部署

Vercel 預設會在每次推送至 `main` 分支時自動部署。如果您想要更精細的控制：

1. 在 Vercel 專案設定中，找到「Git」
2. 可以設定：
   - 部署分支（Production Branch）
   - 忽略特定路徑的變更
   - 部署前執行的腳本

### 效能優化

1. **啟用 Edge Functions**（Vercel 預設已啟用）
2. **設定 Cache Headers**（Vercel 自動處理）
3. **使用 CDN**（Vercel 全球 CDN 預設啟用）

## 聯絡支援

如果遇到無法解決的問題：

1. **Vercel 官方文件**：[vercel.com/docs](https://vercel.com/docs)
2. **Vercel 社群論壇**：[github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **專案 Issues**：在 GitHub 儲存庫建立 Issue

---

**祝您部署順利！** 🎉
