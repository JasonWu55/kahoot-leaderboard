# 環境變數設定說明

本專案使用 Vercel Blob 存放 CSV 資料，需要設定以下環境變數。

## 環境變數列表

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `VITE_KAHOOT_SCORES_CSV_URL` | Kahoot 成績 CSV 的讀取網址 | `https://example.com/Kahoot_scores.csv` |
| `VITE_STUDENTS_CSV_URL` | 學生名冊 CSV 的讀取網址 | `https://example.com/students.csv` |

**重要**：這些環境變數必須以 `VITE_` 開頭，才能在前端使用。

## 本地開發設定

### 方法 1：使用 .env.local（推薦）

建立 `.env.local` 檔案（不要提交至 Git）：

```env
VITE_KAHOOT_SCORES_CSV_URL=https://your-csv-host/Kahoot_scores.csv
VITE_STUDENTS_CSV_URL=https://your-csv-host/students.csv
```

### 方法 2：使用公開目錄

若僅在本地開發，可使用專案 `public` 目錄作為資料來源。

```env
VITE_KAHOOT_SCORES_CSV_URL=/data/Kahoot_scores.csv
VITE_STUDENTS_CSV_URL=/data/students.csv
```

> ⚠️ 未設定這兩個環境變數時，系統將無法載入資料並顯示錯誤。

## Vercel 部署設定

1. 登入 [Vercel Dashboard](https://vercel.com)
2. 進入您的專案
3. 點擊「Settings」→「Environment Variables」
4. 新增以下變數：

| Name | Value |
|------|-------|
| `VITE_KAHOOT_SCORES_CSV_URL` | 貼上 Kahoot_scores.csv 的公開讀取連結 |
| `VITE_STUDENTS_CSV_URL` | 貼上 students.csv 的公開讀取連結 |

5. 選擇適用環境：`Production`, `Preview`, `Development`（建議全選）
6. 點擊「Save」

## 如何取得 Blob URL？

請參考 `VERCEL_BLOB_SETUP.md` 文件中的完整步驟。

簡要流程：
1. 在 Vercel Dashboard 建立 Blob Store
2. 使用 Vercel CLI 上傳 CSV 檔案
3. 上傳成功後會得到檔案的公開讀取 URL
4. 將 URL 設定為環境變數
