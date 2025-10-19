# Vercel Blob 快速開始指南

本指南提供最精簡的步驟，讓您快速完成 Vercel Blob 設定並部署專案。

## 🎯 目標

- 將 CSV 資料安全地存放在 Vercel Blob（不公開在 GitHub）
- 設定環境變數讓網站讀取 Blob 資料
- 完成部署並驗證功能

## ⏱️ 預計時間

約 15-20 分鐘

## 📝 步驟總覽

1. 建立 Vercel Blob Store
2. 上傳 CSV 檔案
3. 設定環境變數
4. 部署專案
5. 驗證功能

---

## 步驟 1：建立 Vercel Blob Store

### 1.1 登入 Vercel

前往 [vercel.com](https://vercel.com) 並登入。

### 1.2 進入專案

在 Dashboard 中找到 `kahoot-leaderboard` 專案，點擊進入。

### 1.3 建立 Blob Store

1. 點擊頂部的 **「Storage」** 標籤
2. 點擊 **「Create Database」**
3. 選擇 **「Blob」**
4. 名稱輸入：`kahoot-data`
5. 點擊 **「Create」**
6. 選擇連結至 `kahoot-leaderboard` 專案

完成！Vercel 會自動生成 `BLOB_READ_WRITE_TOKEN` 環境變數。

---

## 步驟 2：上傳 CSV 檔案

### 2.1 安裝 Vercel CLI

```bash
npm install -g vercel
```

### 2.2 登入並連結專案

```bash
# 登入
vercel login

# 進入專案目錄
cd /path/to/kahoot-leaderboard

# 連結專案
vercel link
```

按照提示選擇您的專案。

### 2.3 取得 Blob Token

1. 在 Vercel Dashboard 中，進入 **Storage** → **kahoot-data** → **Settings**
2. 找到 **「Read-Write Token」**
3. 點擊 **「Copy」** 複製 Token

### 2.4 上傳檔案

```bash
# 上傳 Kahoot 成績
vercel blob upload client/public/data/Kahoot_scores.csv --token YOUR_TOKEN

# 上傳學生名冊
vercel blob upload client/public/data/students.csv --token YOUR_TOKEN
```

**重要**：將 `YOUR_TOKEN` 替換為您剛才複製的 Token。

### 2.5 記錄 Blob URLs

上傳成功後，CLI 會顯示 URL，例如：

```
✓ Uploaded Kahoot_scores.csv
  URL: https://abc123.public.blob.vercel-storage.com/Kahoot_scores.csv

✓ Uploaded students.csv
  URL: https://xyz789.public.blob.vercel-storage.com/students.csv
```

**請複製並保存這兩個 URLs**，下一步會用到。

---

## 步驟 3：設定環境變數

### 3.1 在 Vercel Dashboard 設定

1. 進入專案頁面
2. 點擊 **「Settings」** → **「Environment Variables」**
3. 新增兩個變數：

**變數 1：**
- Name: `VITE_KAHOOT_SCORES_BLOB_URL`
- Value: 貼上您的 `Kahoot_scores.csv` Blob URL
- Environments: 勾選全部（Production, Preview, Development）
- 點擊 **「Save」**

**變數 2：**
- Name: `VITE_STUDENTS_BLOB_URL`
- Value: 貼上您的 `students.csv` Blob URL
- Environments: 勾選全部（Production, Preview, Development）
- 點擊 **「Save」**

---

## 步驟 4：部署專案

### 4.1 推送程式碼

```bash
git add .
git commit -m "Add Vercel Blob support"
git push
```

### 4.2 等待部署

Vercel 會自動偵測並開始部署。您可以在 Vercel Dashboard 的 **「Deployments」** 標籤查看進度。

---

## 步驟 5：驗證功能

### 5.1 開啟網站

部署完成後，點擊部署連結開啟網站。

### 5.2 檢查排行榜

確認以下功能正常：

- ✅ 週排行榜顯示正確
- ✅ 學期總排行榜顯示正確
- ✅ 學生暱稱正確顯示

### 5.3 檢查 Console 日誌（可選）

1. 按 F12 開啟開發者工具
2. 切換至 **「Console」** 標籤
3. 重新整理頁面
4. 查看是否有 `[CSV] Using Vercel Blob:` 的日誌

如果看到這行日誌，表示成功從 Vercel Blob 讀取資料！

---

## 🎉 完成！

恭喜您已成功設定 Vercel Blob！

## 📊 後續操作

### 更新成績資料

當您需要更新成績時：

```bash
# 上傳新的 CSV 檔案（會覆蓋舊檔案）
vercel blob upload path/to/new/Kahoot_scores.csv --token YOUR_TOKEN
```

**無需重新部署**，更新會立即生效！

### 本地開發（可選）

如果您想在本地開發時也使用 Vercel Blob，建立 `.env.local` 檔案：

```env
VITE_KAHOOT_SCORES_BLOB_URL=https://your-blob-url.../Kahoot_scores.csv
VITE_STUDENTS_BLOB_URL=https://your-blob-url.../students.csv
```

如果不設定，系統會自動降級使用 `client/public/data/` 目錄中的檔案。

---

## ❓ 遇到問題？

### 網站顯示「尚無成績資料」

1. 檢查 Vercel 環境變數是否正確設定
2. 確認 Blob URL 可以在瀏覽器中直接開啟（會下載 CSV）
3. 強制重新整理（Ctrl + Shift + R）

### 更新 CSV 後沒有變化

1. 強制重新整理（Ctrl + Shift + R）
2. 清除瀏覽器快取
3. 使用無痕模式測試

### 需要更詳細的說明？

請參考以下文件：

- **完整設定步驟**：`VERCEL_BLOB_SETUP.md`
- **環境變數說明**：`ENV_SETUP.md`
- **Vercel Blob 指南**：`VERCEL_BLOB_GUIDE.md`

---

## 📞 支援

如有任何問題，請參考 [Vercel Blob 官方文件](https://vercel.com/docs/storage/vercel-blob)。

