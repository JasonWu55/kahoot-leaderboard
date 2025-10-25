/**
 * 學生基本資料
 */
export type Student = {
  student_id: string; // 學號後四碼，例如 "0554"
  student_name?: string; // 學生姓名
  display_name?: string; // 顯示名稱（暱稱）
};

/**
 * 原始成績資料
 */
export type RawRow = {
  rank: number;
  student_id: string;
  raw_score: number;
};

/**
 * 週成績資料（包含計算欄位）
 */
export type WeeklyScore = {
  week_id: string; // 週次識別碼，例如 "ch01"
  student_id: string;
  rank: number;
  raw_score: number;

  // 計算欄位
  max_raw_score: number; // 該週最高分
  standardized: number; // 標準化分數 = raw_score / max_raw_score * 100
  rank_bonus: number; // 名次加分：1名:+5, 2名:+3, 3名:+2, 4-10名:+1
  final_score: number; // 週最終分 = max(standardized, 60) + rank_bonus
};

/**
 * 學期總成績資料
 */
export type SeasonScore = {
  student_id: string;
  weekly: WeeklyScore[]; // 各週成績
  best_n: number; // 取最佳 N 週（預設 10）
  total_final: number; // 取最佳 N 週的 final_score 加總
  percent_100: number; // 百分制 = total_final / 全班最高 total_final * 100
  rank: number; // 學期排名
};

/**
 * 月排行成績資料
 */
export type MonthlyScore = {
  student_id: string;
  week_scores: { week_id: string; final_score: number }[]; // 該月各週的週最終分
  month_total: number; // 月總分 = 週最終分加總
  raw_total: number; // 原始分數加總（用於同分判斷）
  rank: number; // 月排名
};

/**
 * CSV 原始資料格式（從 Kahoot_scores.csv 讀取）
 */
export type KahootScoresRow = {
  student_id: string;
  [weekId: string]: string | number; // 動態欄位，例如 ch01, ch02-1, ch02-2
};

