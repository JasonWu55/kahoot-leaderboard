Text file: types.ts
Latest content with line numbers:
1	/**
2	 * 學生基本資料
3	 */
4	export type Student = {
5	  student_id: string; // 學號後四碼，例如 "0554"
6	  student_name?: string; // 學生姓名
7	  display_name?: string; // 顯示名稱（暱稱）
8	};
9	
10	/**
11	 * 原始成績資料
12	 */
13	export type RawRow = {
14	  rank: number;
15	  student_id: string;
16	  raw_score: number;
17	};
18	
19	/**
20	 * 週成績資料（包含計算欄位）
21	 */
22	export type WeeklyScore = {
23	  week_id: string; // 週次識別碼，例如 "ch01"
24	  student_id: string;
25	  rank: number;
26	  raw_score: number;
27	
28	  // 計算欄位
29	  max_raw_score: number; // 該週最高分
30	  standardized: number; // 標準化分數 = raw_score / max_raw_score * 100
31	  rank_bonus: number; // 名次加分：1名:+5, 2名:+3, 3名:+2, 4-10名:+1
32	  final_score: number; // 週最終分 = max(standardized, 60) + rank_bonus
33	};
34	
35	/**
36	 * 學期總成績資料
37	 */
38	export type SeasonScore = {
39	  student_id: string;
40	  weekly: WeeklyScore[]; // 各週成績
41	  best_n: number; // 取最佳 N 週（預設 10）
42	  total_final: number; // 取最佳 N 週的 final_score 加總
43	  percent_100: number; // 百分制 = total_final / 全班最高 total_final * 100
44	  rank: number; // 學期排名
45	};
46	
47	/**
48	 * CSV 原始資料格式（從 Kahoot_scores.csv 讀取）
49	 */
50	export type KahootScoresRow = {
51	  student_id: string;
52	  [weekId: string]: string | number; // 動態欄位，例如 ch01, ch02-1, ch02-2
53	};
54	
55	