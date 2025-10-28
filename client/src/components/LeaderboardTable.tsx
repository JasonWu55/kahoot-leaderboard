import type { WeeklyScore, Student } from '@/lib/types';
import { formatStudentId } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LeaderboardTableProps = {
  scores: WeeklyScore[];
  students: Map<string, Student>;
  viewMode: 'raw' | 'final';
};

export default function LeaderboardTable({
  scores,
  students,
  viewMode,
}: LeaderboardTableProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        本週尚無成績資料
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
              <TableHead className="text-right">原始分數</TableHead>
            ) : (
              <>
                <TableHead className="text-right">原始分數</TableHead>
                <TableHead className="text-right">標準化分數</TableHead>
                <TableHead className="text-right">名次加分</TableHead>
                <TableHead className="text-right font-semibold">週最終分</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((score) => {
            const student = students.get(score.student_id);
            const formattedId = formatStudentId(score.student_id);
            const displayName = student?.display_name || formattedId;
            
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
                  <TableCell className="text-right font-medium">
                    {score.raw_score.toLocaleString()}
                  </TableCell>
                ) : (
                  <>
                    <TableCell className="text-right text-muted-foreground">
                      {score.raw_score.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {score.standardized.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {score.rank_bonus > 0 ? `+${score.rank_bonus}` : score.rank_bonus}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {score.final_score.toFixed(2)}
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
