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
