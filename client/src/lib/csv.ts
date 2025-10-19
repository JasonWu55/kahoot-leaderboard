Text file: csv.ts
Latest content with line numbers:
111	  weekIds: string[];
112	  scores: KahootScoresRow[];
113	}> {
114	  try {
115	    // 從 Vercel Blob 或 public 目錄讀取
116	    const { content, lastModified } = await fetchCSVContent(
117	      KAHOOT_SCORES_BLOB_URL,
118	      '/data/Kahoot_scores.csv'
119	    );
120	    
121	    // 儲存最後更新時間
122	    kahootScoresLastModified = lastModified;
123	    
124	    // 使用 preserveStudentId 保留學號的前導零
125	    const rawData = await parseCSV<Record<string, string | number>>(content, { preserveStudentId: true });
126	    
127	    if (rawData.length === 0) {
128	      return { weekIds: [], scores: [] };
129	    }
130	    
131	    // 取得週次欄位（排除 student_id 和 學號）
132	    const allKeys = Object.keys(rawData[0]);
133	    const weekIds = allKeys.filter(
134	      (key) => key !== 'student_id' && key !== '學號' && key.trim() !== ''
135	    );
136	    
137	    // 轉換資料格式
138	    const scores: KahootScoresRow[] = rawData.map((row) => {
139	      const studentId = (row['student_id'] || row['學號'] || '').toString().trim();
140	      const scoreRow: KahootScoresRow = { student_id: studentId };
141	      
142	      weekIds.forEach((weekId) => {
143	        scoreRow[weekId] = row[weekId];
144	      });
145	      
146	      return scoreRow;
147	    }).filter(row => row.student_id !== ''); // 過濾空學號
148	    
149	    return { weekIds, scores };
150	  } catch (error) {