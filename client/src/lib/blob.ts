Text file: blob.ts
Latest content with line numbers:
1	/**
2	 * Vercel Blob 讀取工具函式
3	 * 用於從 Vercel Blob Storage 讀取 CSV 檔案
4	 */
5	
6	/**
7	 * 從 Vercel Blob 讀取檔案內容
8	 * @param blobUrl Vercel Blob URL
9	 * @returns 檔案內容（文字）與最後更新時間
10	 */
11	export async function fetchFromBlob(blobUrl: string): Promise<{ content: string; lastModified: string | null }> {
12	  try {
13	    const response = await fetch(blobUrl);
14	    
15	    if (!response.ok) {
16	      throw new Error(`Failed to fetch from Blob: ${response.status} ${response.statusText}`);
17	    }
18	    
19	    const content = await response.text();
20	    const lastModified = response.headers.get('last-modified');
21	    
22	    return { content, lastModified };
23	  } catch (error) {
24	    console.error('[Blob] Error fetching data');
25	    throw error;
26	  }
27	}
28	
29	/**
30	 * 檢查 Blob URL 是否有效
31	 * @param blobUrl Vercel Blob URL
32	 * @returns 是否有效
33	 */
34	export function isValidBlobUrl(blobUrl: string | undefined): boolean {
35	  if (!blobUrl) return false;
36	  
37	  // Vercel Blob URL 格式：https://*.public.blob.vercel-storage.com/*
38	  const blobUrlPattern = /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.+$/;
39	  
40	  return blobUrlPattern.test(blobUrl);
41	}
42	
43	/**
44	 * 格式化最後更新時間為台灣時間
45	 * @param lastModified Last-Modified header 值
46	 * @returns 格式化的時間字串
47	 */
48	export function formatLastModified(lastModified: string | null): string {
49	  if (!lastModified) {
50	    return '未知';
51	  }
52	  
53	  try {
54	    const date = new Date(lastModified);
55	    
56	    // 轉換為台灣時間（UTC+8）
57	    const taiwanTime = new Intl.DateTimeFormat('zh-TW', {
58	      timeZone: 'Asia/Taipei',
59	      year: 'numeric',
60	      month: '2-digit',
61	      day: '2-digit',
62	      hour: '2-digit',
63	      minute: '2-digit',
64	      second: '2-digit',
65	      hour12: false
66	    }).format(date);
67	    
68	    return taiwanTime;
69	  } catch (error) {
70	    return '未知';
71	  }
72	}
73	
74	