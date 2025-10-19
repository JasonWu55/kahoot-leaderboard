# 環境變數設定說明

本專案使用 Vercel Blob 存放 CSV 資料，需要設定以下環境變數。

## 環境變數列表

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_KAHOOT_SCORES_BLOB_URL` | Kahoot 成績 CSV 的 Vercel Blob URL | `https://abc123.public.blob.vercel-storage.com/Kahoot_scores.csv` |
| `VITE_STUDENTS_BLOB_URL` | 學生名冊 CSV 的 Vercel Blob URL | `https://abc123.public.blob.vercel-storage.com/students.csv` |

**重要**：這些環境變數必須以 `VITE_` 開頭，才能在前端使用。

## 本地開發設定

### 方法 1：使用 .env.local（推薦）

建立 `.env.local` 檔案（不要提交至 Git）：

```env
VITE_KAHOOT_SCORES_BLOB_URL=https://your-blob-url.public.blob.vercel-storage.com/Kahoot_scores.csv
VITE_STUDENTS_BLOB_URL=https://your-blob-url.public.blob.vercel-storage.com/students.csv
```

### 方法 2：不設定環境變數

如果不設定這些環境變數，系統會自動降級使用 `client/public/data/` 目錄中的 CSV 檔案。

這對本地開發很方便，無需上傳至 Vercel Blob。

## Vercel 部署設定

1. 登入 [Vercel Dashboard](https://vercel.com)
2. 進入您的專案
3. 點擊「Settings」→「Environment Variables」
4. 新增以下變數：

| Name | Value |
|------|-------|
| `VITE_KAHOOT_SCORES_BLOB_URL` | 貼上您的 Kahoot_scores.csv Blob URL |
| `VITE_STUDENTS_BLOB_URL` | 貼上您的 students.csv Blob URL |

5. 選擇適用環境：`Production`, `Preview`, `Development`（建議全選）
6. 點擊「Save」

## 如何取得 Blob URL？

請參考 `VERCEL_BLOB_SETUP.md` 文件中的完整步驟。

簡要流程：
1. 在 Vercel Dashboard 建立 Blob Store
2. 使用 Vercel CLI 上傳 CSV 檔案
3. 上傳成功後會得到 Blob URL
4. 將 URL 設定為環境變數
