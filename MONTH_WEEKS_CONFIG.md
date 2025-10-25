# 月排行設定說明 (MONTH_WEEKS)

## 概述

`MONTH_WEEKS` 用於定義每個月份包含哪些週次，用於計算月排行（月冠軍）。

系統會**優先從環境變數讀取**，如果環境變數未設定，則使用 `client/src/const.ts` 中的預設值。

---

## 設定方式

### 方法一：使用環境變數（推薦用於生產環境）

在 Vercel Dashboard 或本地 `.env.local` 中設定：

```bash
VITE_MONTH_WEEKS={"10月":["ch01","ch02-1","ch02-2","ch03"],"11月":["ch04","ch05"],"12月":["ch06","ch07"]}
```

**注意事項：**
- 必須是有效的 JSON 格式
- **不要有空格**（環境變數中的 JSON 不應包含空格）
- 月份名稱必須是字串（例如 `"10月"`）
- 週次陣列必須是字串陣列（例如 `["ch01", "ch02-1"]`）

### 方法二：修改預設值（用於開發環境）

編輯 `client/src/const.ts`：

```typescript
const DEFAULT_MONTH_WEEKS: Record<string, string[]> | undefined = {
  "10月": ["ch01", "ch02", "ch03", "ch04"],
  "11月": ["ch05", "ch06", "ch07", "ch08"],
  "12月": ["ch09", "ch10", "ch11", "ch12"]
};
```

---

## 範例

### 範例 1：標準設定（每月 4 週）

```json
{
  "10月": ["ch01", "ch02", "ch03", "ch04"],
  "11月": ["ch05", "ch06", "ch07", "ch08"],
  "12月": ["ch09", "ch10", "ch11", "ch12"]
}
```

**環境變數格式：**
```bash
VITE_MONTH_WEEKS={"10月":["ch01","ch02","ch03","ch04"],"11月":["ch05","ch06","ch07","ch08"],"12月":["ch09","ch10","ch11","ch12"]}
```

### 範例 2：不規則週次（含子週次）

```json
{
  "10月": ["ch01", "ch02-1", "ch02-2", "ch03-1"],
  "11月": ["ch03-2", "ch04", "ch05"],
  "12月": ["ch06", "ch07", "ch08", "ch09"]
}
```

**環境變數格式：**
```bash
VITE_MONTH_WEEKS={"10月":["ch01","ch02-1","ch02-2","ch03-1"],"11月":["ch03-2","ch04","ch05"],"12月":["ch06","ch07","ch08","ch09"]}
```

---

## 停用月排行功能

如果不需要月排行功能，有兩種方式：

### 方法一：不設定環境變數，並註解預設值

編輯 `client/src/const.ts`：

```typescript
const DEFAULT_MONTH_WEEKS: Record<string, string[]> | undefined = undefined;
// 或直接註解掉整個物件
// const DEFAULT_MONTH_WEEKS: Record<string, string[]> | undefined = {
//   "10月": ["ch01", "ch02", "ch03", "ch04"],
//   ...
// };
```

### 方法二：設定環境變數為空

```bash
VITE_MONTH_WEEKS=
```

---

## 在 Vercel 設定環境變數

1. 前往 Vercel Dashboard → 選擇專案
2. 點擊 **Settings** → **Environment Variables**
3. 新增變數：
   - **Key**: `VITE_MONTH_WEEKS`
   - **Value**: `{"10月":["ch01","ch02-1","ch02-2","ch03"],"11月":["ch04","ch05"],"12月":["ch06","ch07"]}`
   - **Environments**: 選擇 `Production`, `Preview`, `Development`
4. 點擊 **Save**
5. 重新部署專案（Vercel 會自動觸發）

---

## 常見問題

### Q1: 環境變數設定後沒有生效？

**A:** 確認以下事項：
1. JSON 格式是否正確（使用 [JSONLint](https://jsonlint.com/) 驗證）
2. 是否有空格（環境變數中的 JSON 不應包含空格）
3. 是否重新部署了專案

### Q2: 如何驗證環境變數是否正確？

**A:** 在瀏覽器 Console 中執行：
```javascript
console.log(import.meta.env.VITE_MONTH_WEEKS);
```

### Q3: 可以只設定部分月份嗎？

**A:** 可以，例如只設定 10 月和 11 月：
```json
{
  "10月": ["ch01", "ch02", "ch03"],
  "11月": ["ch04", "ch05"]
}
```

---

## 隱私保護建議

**為了保護真實的教學進度資訊：**
- GitHub 上的 `const.ts` 使用**測試用的預設值**（例如 ch01-ch12）
- Vercel 上使用**環境變數**設定真實的週次對應（例如 ch02-1, ch02-2）

這樣可以避免在公開的 GitHub 上洩漏真實的教學進度。

