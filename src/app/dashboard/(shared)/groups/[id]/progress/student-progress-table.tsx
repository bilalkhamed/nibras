'use client';

import type React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Assignment } from '@prisma/client';
import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toArabicNumerals, cn } from '@/lib/shared/utils';
import { CompletionBadgeOptimistic } from './completion-badge-optimistic';
import type { StudentProgress } from '@/types/progress';
import { useProgressContext } from './progress-context';

interface StudentProgressTableProps {
  assignments: Assignment[];
  students: StudentProgress[];
}

const STATUS_ICON: Record<
  StudentProgress['status'],
  {
    icon: React.ReactNode;
    className: string;
    bgClassName: string;
    label: string;
  }
> = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    className: 'text-amber-500',
    bgClassName: 'bg-amber-50 dark:bg-amber-950/30',
    label: 'لم تُنجز أي مهمة بعد',
  },
  pending: {
    icon: <Clock3 className="h-4 w-4" />,
    className: 'text-blue-500',
    bgClassName: 'bg-blue-50 dark:bg-blue-950/30',
    label: 'أنجزت [count] من المهام',
  },
  done: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'text-emerald-500',
    bgClassName: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'أنجزت جميع المهام',
  },
};

export function StudentProgressTable({
  assignments,
  students: propsStudents,
}: StudentProgressTableProps) {
  // Get optimistic students from context
  const { students: contextStudents } = useProgressContext();

  // Use context students but filter to match the filtered props
  const propsStudentIds = new Set(propsStudents.map((s) => s.id));
  const students = contextStudents.filter((s) => propsStudentIds.has(s.id));

  const totalAssignments = assignments.length;

  if (students.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground rounded-lg border border-dashed">
        لا توجد نتائج مطابقة للبحث
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md overflow-x-auto">
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
                student.completedCount.toString(),
              ),
            );
            return (
              <TableRow
                key={student.id}
                className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent/10 dark:hover:bg-accent/5 transition-colors"
              >
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                          statusConfig.bgClassName,
                        )}
                      >
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
                {assignments.map((assignment) => (
                  <TableCell key={assignment.id} className="text-center">
                    <CompletionBadgeOptimistic
                      assignmentId={assignment.id}
                      studentId={student.id}
                      studentName={student.name}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-center font-semibold text-foreground">
                  {toArabicNumerals(
                    `${student.completedCount} / ${totalAssignments}`,
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
