# 使用 Vercel Blob 存放 CSV 資料

本文件說明如何使用 Vercel Blob Storage 來安全地存放學生資料與 Kahoot 成績 CSV 檔案。

## 為什麼選擇 Vercel Blob？

### 方案比較

| 方案            | 優點                       | 缺點                                 | 適用情境                 |
| --------------- | -------------------------- | ------------------------------------ | ------------------------ |
| **Public 目錄** | 簡單直接，無需額外設定     | CSV 檔案會公開，任何人都能下載       | 僅適合測試環境           |
| **環境變數**    | 資料不公開，適合小檔案     | 有大小限制（約 4KB），不適合大型 CSV | 小型資料集（< 100 學生） |
| **Vercel Blob** | 安全、無大小限制、易於更新 | 需要額外設定，有免費額度限制         | **推薦用於正式環境**     |

### Vercel Blob 的優勢

1. ✅ **隱私保護**：檔案不會公開在 GitHub 或網站上
2. ✅ **無大小限制**：適合大型 CSV 檔案（數千筆學生資料）
3. ✅ **易於更新**：可透過 Vercel CLI 或 API 更新檔案，無需重新部署
4. ✅ **免費額度**：Hobby 方案提供 500MB 儲存空間（足夠使用）
5. ✅ **快速存取**：透過 CDN 加速，全球存取速度快

## 實作步驟

### 步驟 1：安裝 Vercel Blob SDK

```bash
cd /home/ubuntu/kahoot-leaderboard
pnpm add @vercel/blob
```

> 注意：專案最新版本已改為直接使用環境變數提供的 URL，不再自動降級讀取 `public` 目錄。請務必設定 `VITE_KAHOOT_SCORES_CSV_URL` 與 `VITE_STUDENTS_CSV_URL`。

### 步驟 2：設定 Vercel Blob Store

1. **登入 Vercel Dashboard**：前往 [vercel.com](https://vercel.com)
2. **進入專案設定**：選擇您的 `kahoot-leaderboard` 專案
3. **建立 Blob Store**：
   - 點擊「Storage」標籤
   - 點擊「Create Database」
   - 選擇「Blob」
   - 輸入名稱（例如：`kahoot-data`）
   - 點擊「Create」

4. **連結至專案**：
   - 建立後，Vercel 會自動生成環境變數 `BLOB_READ_WRITE_TOKEN`
   - 這個 Token 會自動注入到您的專案中

### 步驟 3：上傳 CSV 檔案至 Vercel Blob

使用 Vercel CLI 上傳檔案：

```bash
# 安裝 Vercel CLI（如果尚未安裝）
npm install -g vercel

# 登入 Vercel
vercel login

# 連結專案
cd /home/ubuntu/kahoot-leaderboard
vercel link

# 上傳 CSV 檔案
vercel blob put client/public/data/Kahoot_scores.csv --rw-token YOUR_BLOB_READ_WRITE_TOKEN
vercel blob put client/public/data/students.csv --rw-token YOUR_BLOB_READ_WRITE_TOKEN
```

**注意**：`YOUR_BLOB_READ_WRITE_TOKEN` 可以在 Vercel Dashboard → Storage → kahoot-data → Settings 中找到。

上傳後，您會得到兩個 Blob URL，例如：

- `https://abc123.public.blob.vercel-storage.com/Kahoot_scores.csv`
- `https://abc123.public.blob.vercel-storage.com/students.csv`

### 步驟 4：修改程式碼以從 Vercel Blob 讀取

#### 4.1 建立 Blob 讀取工具函式

建立 `client/src/lib/blob.ts`：

```typescript
/**
 * 從 Vercel Blob 讀取 CSV 檔案
 */
export async function fetchFromBlob(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Blob: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching from Vercel Blob:", error);
    throw error;
  }
}
```

#### 4.2 修改 `csv.ts` 以支援 Blob

修改 `client/src/lib/csv.ts`：

```typescript
import Papa from "papaparse";
import { fetchFromBlob } from "./blob";

// Vercel Blob URLs（從環境變數讀取）
const KAHOOT_SCORES_CSV_URL = import.meta.env.VITE_KAHOOT_SCORES_CSV_URL;
const STUDENTS_CSV_URL = import.meta.env.VITE_STUDENTS_CSV_URL;

/**
 * 讀取 CSV 檔案（優先從 Vercel Blob，否則從 public 目錄）
 */
async function fetchCSVContent(
  blobUrl: string | undefined,
  publicPath: string
): Promise<string> {
  // 優先從 Vercel Blob 讀取
  if (blobUrl) {
    try {
      console.log(`Fetching from Vercel Blob: ${blobUrl}`);
      return await fetchFromBlob(blobUrl);
    } catch (error) {
      console.warn(
        "Failed to fetch from Blob, falling back to public path",
        error
      );
    }
  }

  // 降級方案：從 public 目錄讀取（開發環境）
  console.log(`Fetching from public path: ${publicPath}`);
  const response = await fetch(publicPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`);
  }
  return await response.text();
}

export async function loadKahootScores(): Promise<{
  weekIds: string[];
  scores: KahootScoresRow[];
}> {
  try {
    // 從 Blob 或 public 目錄讀取
    const csvContent = await fetchCSVContent(
      KAHOOT_SCORES_CSV_URL,
      "/data/Kahoot_scores.csv"
    );

    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string | number>>(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: header => header.trim().toLowerCase(),
        complete: results => {
          // ... 原本的解析邏輯
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("讀取 Kahoot 成績失敗:", error);
    throw error;
  }
}

export async function loadStudents(): Promise<Student[]> {
  try {
    // 從 Blob 或 public 目錄讀取
    const csvContent = await fetchCSVContent(
      STUDENTS_CSV_URL,
      "/data/students.csv"
    );

    return new Promise((resolve, reject) => {
      Papa.parse<Student>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase(),
        complete: results => {
          // ... 原本的解析邏輯
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("讀取學生資料失敗:", error);
    throw error;
  }
}
```

### 步驟 5：設定環境變數

在 Vercel 專案設定中，新增以下環境變數：

| 變數名稱                      | 值                                                                | 說明                 |
| ----------------------------- | ----------------------------------------------------------------- | -------------------- |
| `VITE_KAHOOT_SCORES_CSV_URL` | `https://abc123.public.blob.vercel-storage.com/Kahoot_scores.csv` | Kahoot 成績 CSV URL |
| `VITE_STUDENTS_CSV_URL`      | `https://abc123.public.blob.vercel-storage.com/students.csv`      | 學生名冊 CSV URL    |

**注意**：因為這些 URL 會在前端使用，所以必須加上 `VITE_` 前綴。

### 步驟 6：本地開發設定

建立 `.env.local` 檔案（不要提交至 Git）：

```env
VITE_KAHOOT_SCORES_CSV_URL=https://abc123.public.blob.vercel-storage.com/Kahoot_scores.csv
VITE_STUDENTS_CSV_URL=https://abc123.public.blob.vercel-storage.com/students.csv
```

或者，在本地開發時不設定這些變數，讓程式自動降級使用 `public/data/` 目錄中的檔案。

### 步驟 7：部署至 Vercel

```bash
git add .
git commit -m "Add Vercel Blob support for CSV data"
git push
```

Vercel 會自動偵測並部署。

## 更新成績資料

使用 Vercel Blob 後，更新成績變得非常簡單：

### 方法 1：使用 Vercel CLI（推薦）

```bash
# 上傳新的 CSV 檔案（會覆蓋舊檔案）
vercel blob upload path/to/new/Kahoot_scores.csv --token YOUR_BLOB_READ_WRITE_TOKEN

# 無需重新部署，網站會立即使用新資料
```

### 方法 2：使用 Vercel Dashboard

1. 登入 Vercel Dashboard
2. 進入 Storage → kahoot-data
3. 點擊「Upload」
4. 選擇新的 CSV 檔案上傳（會覆蓋同名檔案）

### 方法 3：使用 API（進階）

可以撰寫腳本透過 Vercel Blob API 自動上傳：

```typescript
import { put } from "@vercel/blob";

const blob = await put("Kahoot_scores.csv", csvFileContent, {
  access: "public",
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log("Uploaded:", blob.url);
```

## 安全性考量

### Blob URL 的公開性

**重要**：Vercel Blob 的 URL 雖然是公開的（任何人知道 URL 就能存取），但：

1. **URL 難以猜測**：包含隨機字串，例如 `abc123def456.public.blob.vercel-storage.com`
2. **不會被搜尋引擎索引**：不會出現在 Google 搜尋結果中
3. **可以定期更換**：如果擔心洩漏，可以重新上傳並更新環境變數

### 進一步加強安全性

如果需要更高的安全性，可以：

1. **使用 Server-Side 讀取**：
   - 將 CSV 讀取邏輯移到後端 API
   - 前端透過 API 取得資料，而非直接存取 Blob URL
   - 這需要將專案升級為 Server 模式（使用 `webdev_add_feature`）

2. **使用 Private Blob**：
   - 上傳時設定 `access: 'private'`
   - 需要透過後端 API 生成臨時存取 Token

## 成本估算

### Vercel Blob 免費額度（Hobby 方案）

- **儲存空間**：500 MB
- **頻寬**：100 GB/月
- **讀取次數**：無限制

### 預估使用量

假設：

- 學生人數：100 人
- 週次數量：15 週
- CSV 檔案大小：約 50 KB

**每月成本**：

- 儲存：50 KB × 2 檔案 = 100 KB（遠低於 500 MB）
- 頻寬：假設每天 100 次存取，每次 50 KB = 5 MB/天 = 150 MB/月（遠低於 100 GB）

**結論**：完全在免費額度內，無需付費。

## 疑難排解

### Q1: 上傳 CSV 後網站沒有更新？

A: 檢查瀏覽器快取，嘗試強制重新整理（Ctrl + Shift + R）。

### Q2: 本地開發時無法讀取 Blob？

A: 確認 `.env.local` 檔案中的 Blob URL 正確，或者移除環境變數讓程式降級使用 `public/data/` 目錄。

### Q3: Blob URL 洩漏怎麼辦？

A: 重新上傳檔案到新的路徑，並更新 Vercel 環境變數。舊的 URL 可以在 Vercel Dashboard 中刪除。

### Q4: 如何查看 Blob 使用量？

A: 登入 Vercel Dashboard → Storage → kahoot-data → Usage，可以查看儲存空間與頻寬使用量。

## 總結

使用 Vercel Blob 存放 CSV 資料是一個**安全、方便、免費**的解決方案，特別適合需要保護學生隱私的場景。相比環境變數方案，Vercel Blob 沒有大小限制，且更新資料無需重新部署，是正式環境的最佳選擇。

如果您決定採用此方案，我可以協助您修改程式碼並完成設定。
