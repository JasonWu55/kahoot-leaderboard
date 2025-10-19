import Papa from 'papaparse';
import type { Student, KahootScoresRow } from './types';
import { fetchFromBlob, isValidBlobUrl } from './blob';

// Vercel Blob URLs（從環境變數讀取）
const KAHOOT_SCORES_BLOB_URL = import.meta.env.VITE_KAHOOT_SCORES_BLOB_URL;
const STUDENTS_BLOB_URL = import.meta.env.VITE_STUDENTS_BLOB_URL;

/**
 * 讀取 CSV 內容（優先從 Vercel Blob，否則從 public 目錄）
 * @param blobUrl Vercel Blob URL（可選）
 * @param publicPath public 目錄路徑（降級方案）
 * @returns CSV 內容（文字）
 */
async function fetchCSVContent(blobUrl: string | undefined, publicPath: string): Promise<string> {
  // 優先從 Vercel Blob 讀取
  if (isValidBlobUrl(blobUrl)) {
    try {
      console.log(`[CSV] Using Vercel Blob: ${blobUrl}`);
      return await fetchFromBlob(blobUrl!);
    } catch (error) {
      console.warn('[CSV] Failed to fetch from Blob, falling back to public path', error);
    }
  }
  
  // 降級方案：從 public 目錄讀取（開發環境）
  console.log(`[CSV] Using public path: ${publicPath}`);
  const response = await fetch(publicPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

/**
 * 通用 CSV 解析函式
 * @param csvContent CSV 內容文字
 * @returns 解析後的資料陣列
 */
function parseCSV<T>(csvContent: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // 自動轉換數字型別
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
    const csvContent = await fetchCSVContent(
      STUDENTS_BLOB_URL,
      '/data/students.csv'
    );
    
    const students = await parseCSV<Student>(csvContent);
    const studentMap = new Map<string, Student>();
    
    students.forEach((student) => {
      studentMap.set(student.student_id, student);
    });
    
    console.log(`[CSV] Loaded ${studentMap.size} students`);
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
    const csvContent = await fetchCSVContent(
      KAHOOT_SCORES_BLOB_URL,
      '/data/Kahoot_scores.csv'
    );
    
    const rawData = await parseCSV<Record<string, string | number>>(csvContent);
    
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
    
    console.log(`[CSV] Loaded ${scores.length} students with ${weekIds.length} weeks`);
    return { weekIds, scores };
  } catch (error) {
    console.error('讀取 Kahoot 成績失敗:', error);
    throw error;
  }
}

