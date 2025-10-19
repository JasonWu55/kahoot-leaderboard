# Vercel Blob 完整設定步驟

本文件提供從零開始設定 Vercel Blob 的完整步驟，包含截圖說明與常見問題排解。

## 📋 前置準備

- ✅ Vercel 帳號（可使用 GitHub 帳號登入）
- ✅ 已將專案推送至 GitHub
- ✅ 已在 Vercel 建立專案並完成首次部署
- ✅ 準備好 `Kahoot_scores.csv` 和 `students.csv` 檔案

## 🚀 步驟一：建立 Vercel Blob Store

### 1.1 登入 Vercel Dashboard

前往 [vercel.com](https://vercel.com) 並登入您的帳號。

### 1.2 進入專案頁面

在 Dashboard 中找到您的 `kahoot-leaderboard` 專案，點擊進入。

### 1.3 建立 Blob Store

1. 點擊頂部導航列的 **「Storage」** 標籤
2. 點擊 **「Create Database」** 按鈕
3. 在彈出的選單中選擇 **「Blob」**
4. 輸入 Store 名稱：`kahoot-data`（或您喜歡的名稱）
5. 點擊 **「Create」** 按鈕

### 1.4 連結至專案

建立完成後，Vercel 會詢問是否要連結至專案：

1. 選擇您的 `kahoot-leaderboard` 專案
2. 點擊 **「Connect」**

Vercel 會自動生成環境變數 `BLOB_READ_WRITE_TOKEN` 並注入到您的專案中。

## 📤 步驟二：上傳 CSV 檔案至 Blob

### 2.1 安裝 Vercel CLI

如果您尚未安裝 Vercel CLI，請執行：

```bash
npm install -g vercel
```

或使用 pnpm：

```bash
pnpm add -g vercel
```

### 2.2 登入 Vercel CLI

```bash
vercel login
```

按照提示完成登入（會開啟瀏覽器進行授權）。

### 2.3 連結專案

進入專案目錄並連結至 Vercel：

```bash
cd /path/to/kahoot-leaderboard
vercel link
```

按照提示選擇：

- Scope：您的 Vercel 帳號
- Link to existing project：Yes
- Project name：kahoot-leaderboard

### 2.4 取得 Blob Token

前往 Vercel Dashboard：

1. 進入您的專案
2. 點擊 **「Storage」** → **「kahoot-data」**
3. 點擊 **「Settings」** 標籤
4. 找到 **「Read-Write Token」**
5. 點擊 **「Copy」** 複製 Token

### 2.5 上傳 CSV 檔案

使用 Vercel CLI 上傳檔案：

```bash
# 上傳 Kahoot 成績檔案
vercel blob put client/public/data/Kahoot_scores.csv \
  --rw-token YOUR_BLOB_READ_WRITE_TOKEN

# 上傳學生名冊檔案
vercel blob put client/public/data/students.csv \
  --rw-token YOUR_BLOB_READ_WRITE_TOKEN
```

**注意**：將 `YOUR_BLOB_READ_WRITE_TOKEN` 替換為您剛才複製的 Token。

### 2.6 記錄 Blob URLs

上傳成功後，CLI 會顯示 Blob URL，例如：

```
✓ Uploaded Kahoot_scores.csv
  URL: https://abc123def456.public.blob.vercel-storage.com/Kahoot_scores.csv

✓ Uploaded students.csv
  URL: https://xyz789ghi012.public.blob.vercel-storage.com/students.csv
```

**請妥善保存這兩個 URLs**，稍後會用到。

## ⚙️ 步驟三：設定環境變數

### 3.1 在 Vercel Dashboard 設定

1. 進入您的專案頁面
2. 點擊 **「Settings」** → **「Environment Variables」**
3. 新增以下兩個變數：

#### 變數 1：Kahoot 成績 Blob URL

- **Name**：`VITE_KAHOOT_SCORES_BLOB_URL`
- **Value**：貼上您的 `Kahoot_scores.csv` Blob URL
- **Environments**：勾選 `Production`, `Preview`, `Development`（建議全選）
- 點擊 **「Save」**

#### 變數 2：學生名冊 Blob URL

- **Name**：`VITE_STUDENTS_BLOB_URL`
- **Value**：貼上您的 `students.csv` Blob URL
- **Environments**：勾選 `Production`, `Preview`, `Development`（建議全選）
- 點擊 **「Save」**

### 3.2 本地開發設定（可選）

如果您想在本地開發時也使用 Vercel Blob，可以建立 `.env.local` 檔案：

```bash
cd /path/to/kahoot-leaderboard
cat > .env.local << EOF
VITE_KAHOOT_SCORES_BLOB_URL=https://your-blob-url.public.blob.vercel-storage.com/Kahoot_scores.csv
VITE_STUDENTS_BLOB_URL=https://your-blob-url.public.blob.vercel-storage.com/students.csv
EOF
```

**注意**：`.env.local` 已在 `.gitignore` 中，不會被提交至 Git。

如果不設定，系統會自動降級使用 `client/public/data/` 目錄中的檔案。

## 🔄 步驟四：重新部署

### 4.1 推送程式碼

```bash
git add .
git commit -m "Add Vercel Blob support for CSV data"
git push
```

### 4.2 觸發部署

Vercel 會自動偵測 Git 推送並開始部署。您也可以手動觸發：

1. 進入 Vercel Dashboard
2. 點擊 **「Deployments」** 標籤
3. 點擊 **「Redeploy」** 按鈕

### 4.3 驗證部署

部署完成後：

1. 點擊部署連結開啟網站
2. 開啟瀏覽器開發者工具（F12）
3. 切換至 **「Console」** 標籤
4. 重新整理頁面
5. 查看是否有 `[CSV] Using Vercel Blob:` 的日誌

如果看到這行日誌，表示成功從 Vercel Blob 讀取資料！

## 📝 步驟五：更新成績資料

### 5.1 準備新的 CSV 檔案

編輯您的 `Kahoot_scores.csv`，例如新增一週的成績。

### 5.2 上傳新檔案

使用 Vercel CLI 上傳（會覆蓋舊檔案）：

```bash
vercel blob upload path/to/new/Kahoot_scores.csv \
  --token YOUR_BLOB_READ_WRITE_TOKEN
```

### 5.3 驗證更新

1. 開啟網站
2. 強制重新整理（Ctrl + Shift + R 或 Cmd + Shift + R）
3. 確認新資料已顯示

**無需重新部署**，更新會立即生效！

## 🔍 驗證與測試

### 測試清單

- [ ] 網站能正常載入排行榜資料
- [ ] 瀏覽器 Console 顯示 `[CSV] Using Vercel Blob:` 日誌
- [ ] 週排行榜顯示正確
- [ ] 學期總排行榜顯示正確
- [ ] 學生暱稱正確顯示（來自 students.csv）
- [ ] 更新 CSV 後資料能即時更新

### 檢查 Blob 使用量

1. 進入 Vercel Dashboard
2. 點擊 **「Storage」** → **「kahoot-data」**
3. 點擊 **「Usage」** 標籤
4. 查看儲存空間與頻寬使用量

## ❓ 常見問題排解

### Q1: 上傳 CSV 時出現 "Unauthorized" 錯誤

**原因**：Token 錯誤或過期

**解決方法**：

1. 前往 Vercel Dashboard → Storage → kahoot-data → Settings
2. 重新複製 Read-Write Token
3. 使用新的 Token 重新上傳

### Q2: 網站顯示「尚無成績資料」

**可能原因**：

- 環境變數未正確設定
- Blob URL 錯誤
- CSV 檔案格式錯誤

**排查步驟**：

1. 檢查 Vercel Dashboard 的環境變數是否正確
2. 開啟瀏覽器 Console，查看錯誤訊息
3. 確認 Blob URL 可以直接在瀏覽器中開啟（會下載 CSV 檔案）
4. 檢查 CSV 檔案格式是否正確（UTF-8 編碼，逗號分隔）

### Q3: 本地開發時無法讀取 Blob

**原因**：本地環境未設定 `.env.local`

**解決方法**：

- 方法 1：建立 `.env.local` 並填入 Blob URLs
- 方法 2：不設定環境變數，讓系統自動降級使用 `public/data/` 目錄

### Q4: 更新 CSV 後網站沒有變化

**原因**：瀏覽器快取

**解決方法**：

1. 強制重新整理（Ctrl + Shift + R）
2. 清除瀏覽器快取
3. 使用無痕模式測試

### Q5: Blob URL 洩漏怎麼辦？

**解決方法**：

1. 在 Vercel Dashboard → Storage → kahoot-data 中刪除舊檔案
2. 重新上傳 CSV 檔案（會得到新的 URL）
3. 更新 Vercel 環境變數
4. 觸發重新部署

## 📊 成本估算

### Vercel Blob 免費額度（Hobby 方案）

- **儲存空間**：500 MB
- **頻寬**：100 GB/月
- **讀取次數**：無限制

### 預估使用量（100 學生，15 週）

- **CSV 檔案大小**：約 50 KB × 2 = 100 KB
- **每月頻寬**：假設每天 100 次存取 = 5 MB/天 = 150 MB/月

**結論**：完全在免費額度內，無需付費。

## 🎉 完成！

恭喜您已成功設定 Vercel Blob！現在您可以：

✅ 安全地存放學生資料（不會出現在 GitHub）
✅ 隨時更新成績，無需重新部署
✅ 享受全球 CDN 加速的快速存取

如有任何問題，請參考 [Vercel Blob 官方文件](https://vercel.com/docs/storage/vercel-blob)。
