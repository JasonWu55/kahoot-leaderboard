import type { RawRow, WeeklyScore, SeasonScore, MonthlyScore, KahootScoresRow } from './types';

/**
 * 計算名次加分
 * 1名:+5, 2名:+3, 3名:+2, 4-10名:+1, 其餘:0
 */
function calculateRankBonus(rank: number): number {
  if (rank === 1) return 5;
  if (rank === 2) return 3;
  if (rank === 3) return 2;
  if (rank >= 4 && rank <= 10) return 1;
  return 0;
}

/**
 * 從原始成績計算週排名
 * @param weekId 週次識別碼
 * @param rows 原始成績資料（已排序）
 * @returns 週成績資料（包含計算欄位）
 */
export function computeWeekly(weekId: string, rows: RawRow[]): WeeklyScore[] {
  if (rows.length === 0) return [];
  
  // 計算該週最高分
  const maxRaw = Math.max(...rows.map((r) => r.raw_score));
  
  return rows.map((r) => {
    // 標準化分數 = raw_score / max_raw_score * 100
    const standardized = maxRaw > 0 ? (r.raw_score / maxRaw) * 100 : 0;
    
    // 名次加分
    const bonus = calculateRankBonus(r.rank);
    
    // 週最終分 = standardized + rank_bonus（無保底機制）
    const finalScore = standardized + bonus;
    
    return {
      week_id: weekId,
      student_id: r.student_id,
      rank: r.rank,
      raw_score: r.raw_score,
      max_raw_score: maxRaw,
      standardized: Math.round(standardized * 100) / 100, // 保留兩位小數
      rank_bonus: bonus,
      final_score: Math.round(finalScore * 100) / 100,
    };
  });
}

/**
 * 從 Kahoot 原始成績資料提取某一週的成績並計算排名
 * @param weekId 週次識別碼
 * @param scores Kahoot 原始成績資料
 * @returns 週成績資料
 */
export function extractWeeklyScores(
  weekId: string,
  scores: KahootScoresRow[]
): WeeklyScore[] {
  // 提取該週有成績的學生
  const rawRows: RawRow[] = scores
    .map((row) => {
      const rawScore = row[weekId];
      // 確保分數存在且為有效數字
      if (rawScore === undefined || rawScore === null || rawScore === '' || isNaN(Number(rawScore))) {
        return null;
      }
      return {
        student_id: row.student_id,
        raw_score: Number(rawScore),
        rank: 0, // 暫時設為 0，稍後計算
      };
    })
    .filter((row): row is RawRow => row !== null);
  
  // 排序：先按分數降序，同分則按學號升序（字典序）
  rawRows.sort((a, b) => {
    if (b.raw_score !== a.raw_score) {
      return b.raw_score - a.raw_score;
    }
    return a.student_id.localeCompare(b.student_id);
  });
  
  // 計算名次（同分同名次）
  let currentRank = 1;
  for (let i = 0; i < rawRows.length; i++) {
    if (i > 0 && rawRows[i].raw_score === rawRows[i - 1].raw_score) {
      // 同分，名次相同
      rawRows[i].rank = rawRows[i - 1].rank;
    } else {
      rawRows[i].rank = currentRank;
    }
    currentRank++;
  }
  
  // 計算週成績
  return computeWeekly(weekId, rawRows);
}

/**
 * 計算學期總排名（取最佳 N 週）
 * @param allWeeks 所有週次的成績資料
 * @param bestN 取最佳 N 週（預設 10）
 * @returns 學期總成績資料（已排序）
 */
export function computeSeason(allWeeks: WeeklyScore[], bestN = 10): SeasonScore[] {
  // 按學生分組
  const byStu = new Map<string, WeeklyScore[]>();
  for (const w of allWeeks) {
    if (!byStu.has(w.student_id)) {
      byStu.set(w.student_id, []);
    }
    byStu.get(w.student_id)!.push(w);
  }
  
  // 計算每位學生的最佳 N 週總分
  const temp: SeasonScore[] = [];
  byStu.forEach((items, sid) => {
    // 按 final_score 降序排序
    const sorted = [...items].sort((a, b) => b.final_score - a.final_score);
    
    // 取最佳 N 週（如果不足 N 週，則取全部）
    const pick = sorted.slice(0, Math.min(bestN, sorted.length));
    const total = pick.reduce((s, x) => s + x.final_score, 0);
    
    temp.push({
      student_id: sid,
      weekly: items,
      best_n: bestN,
      total_final: Math.round(total * 100) / 100,
      percent_100: 0, // 稍後計算
      rank: 0, // 稍後計算
    });
  });
  
  // 排序：先按 total_final 降序，同分則按學號升序
  temp.sort((a, b) => {
    if (b.total_final !== a.total_final) {
      return b.total_final - a.total_final;
    }
    return a.student_id.localeCompare(b.student_id);
  });
  
  // 計算百分制與排名（使用 MIN-MAX 標準化，保底 60 分）
  const maxTotal = temp.length > 0 ? temp[0].total_final : 0;
  const minTotal = temp.length > 0 ? temp[temp.length - 1].total_final : 0;
  let currentRank = 1;
  for (let i = 0; i < temp.length; i++) {
    // 百分制：使用 MIN-MAX 標準化，將分數映射到 60-100 區間
    // 公式：60 + (total_final - minTotal) / (maxTotal - minTotal) * 40
    if (maxTotal > minTotal) {
      const normalized = (temp[i].total_final - minTotal) / (maxTotal - minTotal);
      temp[i].percent_100 = Math.round((60 + normalized * 40) * 100) / 100;
    } else {
      // 如果所有人分數相同，統一給 60 分
      temp[i].percent_100 = 60;
    }
    
    // 排名（同分同名次）
    if (i > 0 && temp[i].total_final === temp[i - 1].total_final) {
      temp[i].rank = temp[i - 1].rank;
    } else {
      temp[i].rank = currentRank;
    }
    currentRank++;
  }
  
  return temp;
}

/**
 * 計算所有週次的成績
 * @param weekIds 週次識別碼列表
 * @param scores Kahoot 原始成績資料
 * @returns 所有週次的成績資料
 */
export function computeAllWeeks(
  weekIds: string[],
  scores: KahootScoresRow[]
): Map<string, WeeklyScore[]> {
  const result = new Map<string, WeeklyScore[]>();
  
  for (const weekId of weekIds) {
    const weeklyScores = extractWeeklyScores(weekId, scores);
    result.set(weekId, weeklyScores);
  }
  
  return result;
}



/**
 * 計算月排行
 * @param monthWeeks 該月份包含的週次列表
 * @param allWeeklyScores 所有週次的成績資料（Map<weekId, WeeklyScore[]>）
 * @param rawScoresMap 原始分數資料（Map<student_id, Map<week_id, raw_score>>）
 * @returns 月排行資料
 */
export function computeMonthly(
  monthWeeks: string[],
  allWeeklyScores: Map<string, WeeklyScore[]>,
  rawScoresMap: Map<string, Map<string, number>>
): MonthlyScore[] {
  // 收集所有學生的月成績
  const studentMonthlyMap = new Map<string, {
    weekScores: Map<string, number>; // week_id -> final_score
    rawScores: Map<string, number>;  // week_id -> raw_score
  }>();

  // 遍歷每個週次
  monthWeeks.forEach((weekId) => {
    const weeklyScores = allWeeklyScores.get(weekId);
    if (!weeklyScores) return;

    weeklyScores.forEach((score) => {
      if (!studentMonthlyMap.has(score.student_id)) {
        studentMonthlyMap.set(score.student_id, {
          weekScores: new Map(),
          rawScores: new Map()
        });
      }

      const studentData = studentMonthlyMap.get(score.student_id)!;
      studentData.weekScores.set(weekId, score.final_score);

      // 取得原始分數
      const rawScore = rawScoresMap.get(score.student_id)?.get(weekId) || 0;
      studentData.rawScores.set(weekId, rawScore);
    });
  });

  // 計算每位學生的月總分
  const monthlyScores: MonthlyScore[] = [];

  studentMonthlyMap.forEach((data, studentId) => {
    const weekScores = Array.from(data.weekScores.values());
    const rawScores = Array.from(data.rawScores.values());

    const monthTotal = weekScores.reduce((sum, score) => sum + score, 0);
    const rawTotal = rawScores.reduce((sum, score) => sum + score, 0);

    monthlyScores.push({
      student_id: studentId,
      week_scores: Array.from(data.weekScores.entries()).map(([weekId, score]) => ({
        week_id: weekId,
        final_score: score
      })),
      month_total: Math.round(monthTotal * 100) / 100,
      raw_total: rawTotal,
      rank: 0 // 待排序後填入
    });
  });

  // 排序：先按月總分降序，若相同則按原始分數總和降序，再按學號升序
  monthlyScores.sort((a, b) => {
    if (b.month_total !== a.month_total) {
      return b.month_total - a.month_total;
    }
    if (b.raw_total !== a.raw_total) {
      return b.raw_total - a.raw_total;
    }
    return a.student_id.localeCompare(b.student_id);
  });

  // 填入名次
  monthlyScores.forEach((score, index) => {
    score.rank = index + 1;
  });

  return monthlyScores;
}

