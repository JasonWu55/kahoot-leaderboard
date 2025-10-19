import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Trophy, Info } from 'lucide-react';
import LeaderboardTable from '@/components/LeaderboardTable';
import SeasonTable from '@/components/SeasonTable';
import ViewToggle from '@/components/ViewToggle';
import WeekPicker from '@/components/WeekPicker';
import { loadStudents, loadKahootScores } from '@/lib/csv';
import { computeAllWeeks, computeSeason } from '@/lib/compute';
import type { Student, WeeklyScore, SeasonScore } from '@/lib/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 資料狀態
  const [students, setStudents] = useState<Map<string, Student>>(new Map());
  const [weekIds, setWeekIds] = useState<string[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<Map<string, WeeklyScore[]>>(new Map());
  const [seasonScores, setSeasonScores] = useState<SeasonScore[]>([]);
  
  // UI 狀態
  const [viewMode, setViewMode] = useState<'raw' | 'final'>('final');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'weekly' | 'season'>('weekly');

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

        // 計算所有週次成績
        const allWeeksScores = computeAllWeeks(weeks, scores);
        setWeeklyScores(allWeeksScores);

        // 計算學期總成績
        const allWeeksFlat: WeeklyScore[] = [];
        allWeeksScores.forEach((scores) => {
          allWeeksFlat.push(...scores);
        });
        const seasonScoresData = computeSeason(allWeeksFlat, 10);
        setSeasonScores(seasonScoresData);

      } catch (err) {
        console.error('載入資料失敗:', err);
        setError('載入資料失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
  const totalWeeks = weekIds.length;
  const isSeasonReady = totalWeeks >= 10;

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'weekly' | 'season')}>
          {/* Tabs Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                週排行
              </TabsTrigger>
              <TabsTrigger value="season" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                學期總排行
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1" />
            
            <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
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

          {/* Season Tab */}
          <TabsContent value="season" className="space-y-4">
            {!isSeasonReady && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  目前成績不足 10 週（目前：{totalWeeks} 週），此為臨時排名，尚待結算。
                  學期總分將在累積滿 10 週後正式計算。
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>學期總排行榜</CardTitle>
                <CardDescription>
                  {viewMode === 'raw' 
                    ? '顯示各週原始分數的平均值（僅供參考）' 
                    : `取最佳 10 週的週最終分加總（目前已有 ${totalWeeks} 週）`}
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
