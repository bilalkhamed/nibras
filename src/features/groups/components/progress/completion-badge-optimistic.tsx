'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/shared/utils';
import { useProgressContext } from './progress-context';

interface CompletionBadgeOptimisticProps {
  assignmentId: string;
  studentId: string;
  studentName: string;
}

export function CompletionBadgeOptimistic({
  assignmentId,
  studentId,
  studentName,
}: CompletionBadgeOptimisticProps) {
  const { getStudentStatus, toggleCompletion } = useProgressContext();
  const status = getStudentStatus(studentId, assignmentId);

  const handleClick = () => {
    toggleCompletion(studentId, assignmentId, status.isCompleted);
  };

  const markedByName = status.markedBy
    ? `${status.markedBy.firstName} ${status.markedBy.middleName ?? ''} ${status.markedBy.lastName}`.trim()
    : null;

  const isMarkedByOther = status.markedBy && markedByName !== studentName;

  if (status.isCompleted && status.completedAt) {
    const isOverdue = status.isOverdue;
    const badgeLabel = isOverdue ? 'تم الادراك' : 'مكتمل';
    const badgeClass = isOverdue
      ? 'bg-amber-500 text-amber-50 gap-1.5 cursor-pointer hover:bg-amber-600 transition-all'
      : 'bg-emerald-500 text-emerald-50 gap-1.5 cursor-pointer hover:bg-emerald-600 transition-all';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1">
              <Badge
                variant="default"
                className={badgeClass}
                onClick={handleClick}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {badgeLabel}
              </Badge>
              {status.completedAt && (
                <span
                  className="text-[10px] text-muted-foreground"
                  suppressHydrationWarning
                >
                  {formatDate(new Date(status.completedAt))}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-right">
            <p className="text-sm" suppressHydrationWarning>
              {isOverdue ? 'تم إدراكه في' : 'تم إكماله في'}{' '}
              {new Date(status.completedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {isMarkedByOther && markedByName && (
              <p className="text-xs text-muted-foreground mt-1">
                بواسطة: {markedByName}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground px-5 cursor-pointer hover:bg-emerald-50/90 hover:text-accent-foreground transition-all dark:hover:bg-emerald-950/30"
      onClick={handleClick}
    >
      -
    </Badge>
  );
}
