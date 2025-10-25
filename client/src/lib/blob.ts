/**
 * Vercel Blob 讀取工具函式
 * 用於從 Vercel Blob Storage 讀取 CSV 檔案
 */
import { head } from '@vercel/blob';

/**
 * 從 Vercel Blob 讀取檔案內容
 * @param blobUrl Vercel Blob URL
 * @returns 檔案內容（文字）與最後更新時間
 */
export async function fetchFromBlob(blobUrl: string): Promise<{ content: string; lastModified: string | null }> {
  try {
    // 使用 Vercel Blob SDK 取得 metadata（包含 uploadedAt）
    let uploadedAt: string | null = null;
    try {
      const metadata = await head(blobUrl);
      // uploadedAt 是 Date 型別，轉換為 ISO 字串
      uploadedAt = metadata.uploadedAt.toISOString();
    } catch (metadataError) {
      // 如果無法取得 metadata，繼續使用 HTTP Header
    }
    
    const response = await fetch(blobUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Blob: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    
    // 優先使用 uploadedAt，其次使用 Last-Modified Header
    const lastModified = uploadedAt || response.headers.get('last-modified');
    
    return { content, lastModified };
  } catch (error) {
    console.error('[Blob] Error fetching data');
    throw error;
  }
}

/**
 * 檢查 Blob URL 是否有效
 * @param blobUrl Vercel Blob URL
 * @returns 是否有效
 */
export function isValidBlobUrl(blobUrl: string | undefined): boolean {
  if (!blobUrl) return false;
  
  // Vercel Blob URL 格式：https://*.public.blob.vercel-storage.com/*
  const blobUrlPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.+$/;
  
  return blobUrlPattern.test(blobUrl);
}

/**
 * 格式化最後更新時間為台灣時間
 * @param lastModified Last-Modified header 值
 * @returns 格式化的時間字串
 */
export function formatLastModified(lastModified: string | null): string {
  if (!lastModified) {
    return '未知';
  }
  
  try {
    const date = new Date(lastModified);
    
    // 轉換為台灣時間（UTC+8）
    const taiwanTime = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
    
    return taiwanTime;
  } catch (error) {
    return '未知';
  }
}

