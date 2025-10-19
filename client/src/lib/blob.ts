/**
 * Vercel Blob 讀取工具函式
 * 用於從 Vercel Blob Storage 讀取 CSV 檔案
 */

/**
 * 從 Vercel Blob 讀取檔案內容
 * @param blobUrl Vercel Blob URL
 * @returns 檔案內容（文字）
 */
export async function fetchFromBlob(blobUrl: string): Promise<string> {
  try {
    console.log(`[Blob] Fetching from: ${blobUrl}`);
    
    const response = await fetch(blobUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Blob: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log(`[Blob] Successfully fetched ${content.length} bytes`);
    
    return content;
  } catch (error) {
    console.error('[Blob] Error fetching from Vercel Blob:', error);
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

