import type { SeasonScore, Student } from '@/lib/types';
import { formatStudentId } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SeasonTableProps = {
  scores: SeasonScore[];
  students: Map<string, Student>;
  viewMode: 'raw' | 'final';
};

export default function SeasonTable({
  scores,
  students,
  viewMode,
}: SeasonTableProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        尚無學期成績資料
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">名次</TableHead>
            <TableHead className="w-32">學號</TableHead>
            <TableHead>暱稱</TableHead>
            {viewMode === 'raw' ? (
              <>
                <TableHead className="text-right">週數</TableHead>
                <TableHead className="text-right">平均原始分數</TableHead>
              </>
            ) : (
              <>
                <TableHead className="text-right">最佳週數</TableHead>
                <TableHead className="text-right font-semibold">學期總分</TableHead>
                <TableHead className="text-right">百分制</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((score) => {
            const student = students.get(score.student_id);
            const formattedId = formatStudentId(score.student_id);
            const displayName = student?.display_name || formattedId;
            
            // 計算原始分數平均（用於 Raw 模式）
            const totalRawScore = score.weekly.reduce((sum, w) => sum + w.raw_score, 0);
            const avgRawScore = score.weekly.length > 0 
              ? totalRawScore / score.weekly.length 
              : 0;
            
            return (
              <TableRow key={score.student_id}>
                <TableCell className="text-center font-medium">
                  {score.rank}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formattedId}
                </TableCell>
                <TableCell>{displayName}</TableCell>
                {viewMode === 'raw' ? (
                  <>
                    <TableCell className="text-right">
                      {score.weekly.length}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {avgRawScore.toFixed(2)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right">
                      {Math.min(score.best_n, score.weekly.length)} / {score.best_n}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {score.total_final.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {score.percent_100.toFixed(2)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
