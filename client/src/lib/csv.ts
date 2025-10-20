import Papa from 'papaparse';
import type { Student, KahootScoresRow } from './types';
import { fetchFromBlob, isValidBlobUrl } from './blob';

// Vercel Blob URLs（從環境變數讀取）
const KAHOOT_SCORES_BLOB_URL = import.meta.env.VITE_KAHOOT_SCORES_BLOB_URL;
const STUDENTS_BLOB_URL = import.meta.env.VITE_STUDENTS_BLOB_URL;

// 儲存最後更新時間
let kahootScoresLastModified: string | null = null;

/**
 * 讀取 CSV 內容（優先從 Vercel Blob，否則從 public 目錄）
 * @param blobUrl Vercel Blob URL（可選）
 * @param publicPath public 目錄路徑（降級方案）
 * @returns CSV 內容（文字）與最後更新時間
 */
async function fetchCSVContent(
  blobUrl: string | undefined, 
  publicPath: string
): Promise<{ content: string; lastModified: string | null }> {
  // 優先從 Vercel Blob 讀取
  if (isValidBlobUrl(blobUrl)) {
    try {
      return await fetchFromBlob(blobUrl!);
    } catch (error) {
      // 降級至 public 目錄，不顯示錯誤訊息避免洩漏 URL
    }
  }
  
  // 降級方案：從 public 目錄讀取（開發環境）
  const response = await fetch(publicPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  const content = await response.text();
  const lastModified = response.headers.get('last-modified');
  
  return { content, lastModified };
}

/**
 * 通用 CSV 解析函式
 * @param csvContent CSV 內容文字
 * @param options 解析選項
 * @returns 解析後的資料陣列
 */
function parseCSV<T>(
  csvContent: string, 
  options: {
    dynamicTyping?: boolean;
    preserveStudentId?: boolean;
  } = {}
): Promise<T[]> {
  const { dynamicTyping = true, preserveStudentId = false } = options;
  
  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: preserveStudentId ? (field: string | number) => {
        // 保留 student_id 和學號欄位為字串，其他欄位自動轉換
        return field !== 'student_id' && field !== '學號';
      } : dynamicTyping,
      transformHeader: (header) => header.trim().toLowerCase(), // 統一轉小寫
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV 解析錯誤:', results.errors);
          reject(new Error('CSV 解析失敗'));
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * 讀取學生名冊
 */
export async function loadStudents(): Promise<Map<string, Student>> {
  try {
    // 從 Vercel Blob 或 public 目錄讀取
    const { content } = await fetchCSVContent(
      STUDENTS_BLOB_URL,
      '/data/students.csv'
    );
    
    // 不使用 dynamicTyping，保持所有欄位為字串
    const students = await parseCSV<Student>(content, { dynamicTyping: false });
    const studentMap = new Map<string, Student>();
    
    students.forEach((student) => {
      studentMap.set(student.student_id, student);
    });
    
    return studentMap;
  } catch (error) {
    console.error('讀取學生名冊失敗:', error);
    return new Map();
  }
}

/**
 * 讀取 Kahoot 原始成績
 */
export async function loadKahootScores(): Promise<{
  weekIds: string[];
  scores: KahootScoresRow[];
}> {
  try {
    // 從 Vercel Blob 或 public 目錄讀取
    const { content, lastModified } = await fetchCSVContent(
      KAHOOT_SCORES_BLOB_URL,
      '/data/Kahoot_scores.csv'
    );
    
    // 儲存最後更新時間
    kahootScoresLastModified = lastModified;
    
    // 使用 preserveStudentId 保留學號的前導零
    const rawData = await parseCSV<Record<string, string | number>>(content, { preserveStudentId: true });
    
    if (rawData.length === 0) {
      return { weekIds: [], scores: [] };
    }
    
    // 取得週次欄位（排除 student_id 和 學號）
    const allKeys = Object.keys(rawData[0]);
    const weekIds = allKeys.filter(
      (key) => key !== 'student_id' && key !== '學號' && key.trim() !== ''
    );
    
    // 轉換資料格式
    const scores: KahootScoresRow[] = rawData.map((row) => {
      const studentId = (row['student_id'] || row['學號'] || '').toString().trim();
      const scoreRow: KahootScoresRow = { student_id: studentId };
      
      weekIds.forEach((weekId) => {
        scoreRow[weekId] = row[weekId];
      });
      
      return scoreRow;
    }).filter(row => row.student_id !== ''); // 過濾空學號
    
    return { weekIds, scores };
  } catch (error) {
    console.error('讀取 Kahoot 成績失敗:', error);
    throw error;
  }
}

/**
 * 取得 Kahoot 成績的最後更新時間（從內部快取）
 */
export function getKahootScoresLastModified(): string | null {
  return kahootScoresLastModified;
}

/**
 * 主動取得 Kahoot 成績檔案的最後更新時間
 * @returns 最後更新時間字串
 */
export async function fetchKahootScoresLastModified(): Promise<string | null> {
  try {
    const { lastModified } = await fetchCSVContent(
      KAHOOT_SCORES_BLOB_URL,
      '/data/Kahoot_scores.csv'
    );
    return lastModified;
  } catch (error) {
    console.error('Failed to fetch last modified time');
    return null;
  }
}

