import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MonthlyScore, Student } from '@/lib/types';

type MonthlyTableProps = {
  data: MonthlyScore[];
  students: Map<string, Student>;
};

export default function MonthlyTable({ data, students }: MonthlyTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        本月尚無成績資料
      </div>
    );
  }

  // 取得獎牌圖示
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // 取得前三名的背景色（金色系，透明度 50%）
  const getTopThreeStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100/50'; // 金色
    if (rank === 2) return 'bg-gray-200/50';   // 銀色
    if (rank === 3) return 'bg-orange-100/50'; // 銅色
    return '';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">名次</TableHead>
            <TableHead className="w-24">學號</TableHead>
            <TableHead className="w-24">暱稱</TableHead>
            <TableHead className="min-w-[200px]">各週分數</TableHead>
            <TableHead className="w-24 text-right">月總分</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const student = students.get(row.student_id);
            const displayName = student?.display_name || row.student_id;
            const medal = getMedalIcon(row.rank);
            const bgStyle = getTopThreeStyle(row.rank);

            // 格式化各週分數：79.05+105.00+72.34+90.06
            const weekScoresText = row.week_scores
              .map((ws) => ws.final_score.toFixed(2))
              .join(' + ');

            return (
              <TableRow key={row.student_id} className={bgStyle}>
                <TableCell className="text-center font-medium">
                  {medal && <span className="mr-1">{medal}</span>}
                  {row.rank}
                </TableCell>
                <TableCell className="font-mono">{row.student_id}</TableCell>
                <TableCell>{displayName}</TableCell>
                <TableCell className="font-mono text-sm">{weekScoresText}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {row.month_total.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

