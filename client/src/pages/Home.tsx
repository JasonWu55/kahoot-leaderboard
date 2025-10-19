Text file: Home.tsx
Latest content with line numbers:
2	import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
3	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
4	import { Alert, AlertDescription } from '@/components/ui/alert';
5	import { Loader2, TrendingUp, Trophy, Info } from 'lucide-react';
6	import LeaderboardTable from '@/components/LeaderboardTable';
7	import SeasonTable from '@/components/SeasonTable';
8	import ViewToggle from '@/components/ViewToggle';
9	import WeekPicker from '@/components/WeekPicker';
10	import { loadStudents, loadKahootScores } from '@/lib/csv';
11	import { computeAllWeeks, computeSeason } from '@/lib/compute';
12	import type { Student, WeeklyScore, SeasonScore } from '@/lib/types';
13	
14	export default function Home() {
15	  const [loading, setLoading] = useState(true);
16	  const [error, setError] = useState<string | null>(null);
17	  
18	  // 資料狀態
19	  const [students, setStudents] = useState<Map<string, Student>>(new Map());
20	  const [weekIds, setWeekIds] = useState<string[]>([]);
21	  const [weeklyScores, setWeeklyScores] = useState<Map<string, WeeklyScore[]>>(new Map());
22	  const [seasonScores, setSeasonScores] = useState<SeasonScore[]>([]);
23	  
24	  // UI 狀態
25	  const [viewMode, setViewMode] = useState<'raw' | 'final'>('final');
26	  const [selectedWeek, setSelectedWeek] = useState<string>('');
27	  const [activeTab, setActiveTab] = useState<'weekly' | 'season'>('weekly');
28	
29	  // 載入資料
30	  useEffect(() => {
31	    async function loadData() {
32	      try {
33	        setLoading(true);
34	        setError(null);
35	
36	        // 載入學生名冊
37	        const studentsMap = await loadStudents();
38	        setStudents(studentsMap);
39	
40	        // 載入 Kahoot 成績
41	        const { weekIds: weeks, scores } = await loadKahootScores();
42	        
43	        if (weeks.length === 0) {
44	          setError('尚無成績資料');
45	          return;
46	        }
47	
48	        setWeekIds(weeks);
49	        setSelectedWeek(weeks[weeks.length - 1]); // 預設選擇最新週次
50	