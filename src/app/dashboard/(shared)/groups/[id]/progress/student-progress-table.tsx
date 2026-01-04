import type React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Assignment } from '@prisma/client';
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toArabicNumerals } from '@/lib/shared/utils';

interface StudentRow {
  id: string;
  name: string;
  completedCount: number;
  totalAssignments: number;
  status: 'warning' | 'pending' | 'done';
  assignmentStatuses: Record<string, boolean>;
}

interface StudentProgressTableProps {
  assignments: Assignment[];
  students: StudentRow[];
}

const STATUS_ICON: Record<
  StudentRow['status'],
  { icon: React.ReactNode; className: string; label: string }
> = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    className: 'text-amber-500',
    label: 'لم تُنجز أي مهمة بعد',
  },
  pending: {
    icon: <Clock3 className="h-4 w-4" />,
    className: 'text-blue-500',
    label: 'أنجزت [count] من المهام',
  },
  done: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'text-emerald-500',
    label: 'أنجزت جميع المهام',
  },
};

export function StudentProgressTable({
  assignments,
  students,
}: StudentProgressTableProps) {
  const totalAssignments = assignments.length;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
      <Table>
        <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center font-semibold">
              الحالة
            </TableHead>
            <TableHead className="text-right font-semibold w-48">
              الطالبة
            </TableHead>
            {assignments.map((assignment) => (
              <TableHead
                key={assignment.id}
                className="text-center font-semibold"
              >
                {assignment.name}
              </TableHead>
            ))}
            <TableHead className="text-center font-semibold w-32">
              المنجز / الإجمالي
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const statusConfig = STATUS_ICON[student.status];
            const label = toArabicNumerals(
              statusConfig.label.replace(
                '[count]',
                student.completedCount.toString()
              )
            );
            return (
              <TableRow
                key={student.id}
                className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
              >
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                        <span className={statusConfig.className}>
                          {statusConfig.icon}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <div className="sr-only">{label}</div>
                    <TooltipContent className="leading-5.5">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="font-medium text-foreground w-48">
                  {student.name}
                </TableCell>
                {assignments.map((assignment) => {
                  const isCompleted =
                    student.assignmentStatuses[assignment.id] ?? false;
                  return (
                    <TableCell key={assignment.id} className="text-center">
                      <Badge
                        variant={isCompleted ? 'default' : 'outline'}
                        className={
                          isCompleted
                            ? 'bg-emerald-500 text-emerald-50'
                            : 'text-muted-foreground px-5'
                        }
                      >
                        {isCompleted ? 'مكتمل' : '-'}
                      </Badge>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-semibold text-foreground">
                  {toArabicNumerals(
                    `${student.completedCount} / ${totalAssignments}`
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
