import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Trophy, Info, Calendar } from 'lucide-react';
import LeaderboardTable from '@/components/LeaderboardTable';
import SeasonTable from '@/components/SeasonTable';
import MonthlyTable from '@/components/MonthlyTable';
import ViewToggle from '@/components/ViewToggle';
import WeekPicker from '@/components/WeekPicker';
import MonthPicker from '@/components/MonthPicker';
import { loadStudents, loadKahootScores } from '@/lib/csv';
import { computeAllWeeks, computeSeason, computeMonthly } from '@/lib/compute';
import { MONTH_WEEKS, BEST_N_WEEKS } from '@/const';
import type { Student, WeeklyScore, SeasonScore, MonthlyScore } from '@/lib/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 資料狀態
  const [students, setStudents] = useState<Map<string, Student>>(new Map());
  const [weekIds, setWeekIds] = useState<string[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<Map<string, WeeklyScore[]>>(new Map());
  const [seasonScores, setSeasonScores] = useState<SeasonScore[]>([]);
  const [rawScoresMap, setRawScoresMap] = useState<Map<string, Map<string, number>>>(new Map());
  
  // 月排行狀態
  const [monthlyScores, setMonthlyScores] = useState<Map<string, MonthlyScore[]>>(new Map());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  // UI 狀態
  const [viewMode, setViewMode] = useState<'raw' | 'final'>('final');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'season'>('weekly');

  // 檢查是否定義 MONTH_WEEKS
  const hasMonthWeeksConfig = MONTH_WEEKS && Object.keys(MONTH_WEEKS).length > 0;

  // 載入資料
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 載入學生名冊
        const studentsMap = await loadStudents();
        setStudents(studentsMap);

        // 載入 Kahoot 成績
        const { weekIds: weeks, scores } = await loadKahootScores();
        
        if (weeks.length === 0) {
          setError('尚無成績資料');
          return;
        }

        setWeekIds(weeks);
        setSelectedWeek(weeks[weeks.length - 1]); // 預設選擇最新週次

        // 建立原始分數 Map（用於月排行同分判斷）
        const rawMap = new Map<string, Map<string, number>>();
        scores.forEach((row) => {
          const studentId = String(row.student_id);
          if (!rawMap.has(studentId)) {
            rawMap.set(studentId, new Map());
          }
          const studentWeeks = rawMap.get(studentId)!;
          weeks.forEach((weekId) => {
            const rawScore = Number(row[weekId]) || 0;
            studentWeeks.set(weekId, rawScore);
          });
        });
        setRawScoresMap(rawMap);

        // 計算所有週次成績
        const allWeeksScores = computeAllWeeks(weeks, scores);
        setWeeklyScores(allWeeksScores);

        // 計算學期總成績
        const allWeeksFlat: WeeklyScore[] = [];
        allWeeksScores.forEach((scores) => {
          allWeeksFlat.push(...scores);
        });
        const seasonScoresData = computeSeason(allWeeksFlat, BEST_N_WEEKS);
        setSeasonScores(seasonScoresData);

        // 計算月排行（如果啟用）
        if (hasMonthWeeksConfig && MONTH_WEEKS) {
          const monthlyMap = new Map<string, MonthlyScore[]>();
          const months = Object.keys(MONTH_WEEKS!);
          const validMonths: string[] = [];
          
          months.forEach((month) => {
            const monthWeeks = MONTH_WEEKS![month];
            
            // 檢查所有週次是否都存在於 CSV 資料中
            const allWeeksExist = monthWeeks.every((weekId) => weeks.includes(weekId));
            
            if (allWeeksExist) {
              // 只有當所有週次都存在時，才計算月排行
              const monthlyData = computeMonthly(monthWeeks, allWeeksScores, rawMap);
              monthlyMap.set(month, monthlyData);
              validMonths.push(month);
            }
          });

          setMonthlyScores(monthlyMap);
          setAvailableMonths(validMonths);
          if (validMonths.length > 0) {
            setSelectedMonth(validMonths[0]); // 預設選擇第一個有效月份
          }
        }

      } catch (err) {
        console.error('載入資料失敗:', err);
        setError('載入資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [hasMonthWeeksConfig]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">載入成績資料中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentWeekScores = weeklyScores.get(selectedWeek) || [];
  const currentMonthScores = monthlyScores.get(selectedMonth) || [];
  const totalWeeks = weekIds.length;
  const isSeasonReady = totalWeeks >= BEST_N_WEEKS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                Kahoot 排行榜
              </h1>
              <p className="text-muted-foreground mt-1">
                課堂參與成績即時查詢系統
              </p>
            </div>
            <a
              href="/about"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Info className="h-4 w-4" />
              規則說明
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'weekly' | 'monthly' | 'season')}>
          {/* Tabs Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <TabsList className={`grid w-full ${availableMonths.length > 0 ? 'sm:w-[600px] grid-cols-3' : 'sm:w-[400px] grid-cols-2'}`}>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                週排行
              </TabsTrigger>
              {availableMonths.length > 0 && (
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  月排行
                </TabsTrigger>
              )}
              <TabsTrigger value="season" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                學期總排行
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1" />
            
            {activeTab !== 'monthly' && <ViewToggle viewMode={viewMode} onToggle={setViewMode} />}
          </div>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>週排行榜</CardTitle>
                    <CardDescription>
                      {viewMode === 'raw' 
                        ? '顯示各週原始成績排名' 
                        : '顯示標準化分數與名次加分後的週最終分'}
                    </CardDescription>
                  </div>
                  <WeekPicker
                    weekIds={weekIds}
                    selectedWeek={selectedWeek}
                    onSelect={setSelectedWeek}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  scores={currentWeekScores}
                  students={students}
                  viewMode={viewMode}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Tab */}
          {availableMonths.length > 0 && (
            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>月排行榜</CardTitle>
                      <CardDescription>
                        顯示該月各週的週最終分加總，前三名將獲得獎牌 🥇🥈🥉
                        {MONTH_WEEKS && selectedMonth && MONTH_WEEKS[selectedMonth] && (
                          <>
                            <br />
                            本月包含週次：{MONTH_WEEKS[selectedMonth].join(', ')}
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <MonthPicker
                      months={availableMonths}
                      selected={selectedMonth}
                      onChange={setSelectedMonth}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <MonthlyTable
                    data={currentMonthScores}
                    students={students}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Season Tab */}
          <TabsContent value="season" className="space-y-4">
            {!isSeasonReady && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  目前成績不足 {BEST_N_WEEKS} 週（目前：{totalWeeks} 週），此為臨時排名，尚待結算。
                  學期總分將在累積滿 {BEST_N_WEEKS} 週後正式計算。
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>學期總排行榜</CardTitle>
                <CardDescription>
                  {viewMode === 'raw' 
                    ? '顯示各週原始分數的平均值（僅供參考）' 
                    : `取最佳 ${BEST_N_WEEKS} 週的週最終分加總（目前已有 ${totalWeeks} 週）`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SeasonTable
                  scores={seasonScores}
                  students={students}
                  viewMode={viewMode}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

