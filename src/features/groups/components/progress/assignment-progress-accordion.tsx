'use client';

import type { AssignmentProgressStatus } from '../../types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle2, Clock3, Eye } from 'lucide-react';
import { toArabicNumerals, formatDate, cn } from '@/lib/shared/utils';
import { useProgressContext } from './progress-context';
import React from 'react';
import { Button } from '@/components/ui/button';
import { SubmissionViewerSheet } from './submission-viewer-sheet';

export const ASSIGNMENT_STATUS_CONFIG: Record<
  AssignmentProgressStatus,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    className: string;
    bgClassName: string;
    label: string;
  }
> = {
  none: {
    icon: AlertTriangle,
    className: 'text-warning',
    bgClassName: 'bg-warning-soft/50 dark:bg-warning/20',
    label: 'لم يسلم أي طالب',
  },
  partial: {
    icon: Clock3,
    className: 'text-blue-500',
    bgClassName: 'bg-blue-50 dark:bg-blue-500/30',
    label: 'سلم بعض الطلاب',
  },
  complete: {
    icon: CheckCircle2,
    className: 'text-emerald-500',
    bgClassName: 'bg-emerald-50 dark:bg-emerald-500/30',
    label: 'سلم جميع الطلاب',
  },
};

interface AssignmentProgressAccordionProps {
  filteredAssignmentIds: Set<string>;
}

export function AssignmentProgressAccordion({
  filteredAssignmentIds,
}: AssignmentProgressAccordionProps) {
  const {
    assignmentProgress: allProgress,
    students,
    toggleCompletion,
  } = useProgressContext();

  const assignmentProgress = allProgress.filter((a) =>
    filteredAssignmentIds.has(a.id),
  );

  if (assignmentProgress.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground rounded-lg border border-dashed">
        لا توجد مهام مطابقة للبحث
      </div>
    );
  }

  return (
    <Accordion type="single" className="space-y-2" collapsible>
      {assignmentProgress.map((assignment) => {
        const statusConfig = ASSIGNMENT_STATUS_CONFIG[assignment.status];
        const StatusIcon = statusConfig.icon;

        return (
          <AccordionItem
            key={assignment.id}
            value={assignment.id}
            className={cn(
              'rounded-lg border border-border overflow-hidden',
              'bg-card dark:bg-card',
              'transition-colors',
              'last:border-b',
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 dark:hover:bg-muted/30">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          statusConfig.bgClassName,
                        )}
                      >
                        <StatusIcon
                          className={cn('h-4 w-4', statusConfig.className)}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{statusConfig.label}</TooltipContent>
                  </Tooltip>
                  <span className="font-medium text-foreground truncate text-right">
                    {assignment.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">
                  {toArabicNumerals(
                    `${assignment.completedCount}/${assignment.totalStudents}`,
                  )}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              <div className="divide-y divide-border dark:divide-border/50">
                {students.map((student) => {
                  const status = assignment.studentStatuses[student.id] ?? {
                    isCompleted: false,
                    completedAt: null,
                    markedBy: null,
                    studentName: student.name,
                    isOverdue: false,
                  };

                  const markedByName = status.markedBy
                    ? `${status.markedBy.firstName} ${status.markedBy.middleName ?? ''} ${status.markedBy.lastName}`.trim()
                    : null;

                  const isMarkedByOther =
                    status.markedBy && markedByName !== student.name;

                  return (
                    <div
                      key={student.id}
                      className={cn(
                        'flex items-center justify-between gap-3 p-4',
                        'bg-warning-soft/50 dark:bg-warning/20',
                        status.isCompleted &&
                          !status.isOverdue &&
                          'bg-emerald-50/50 dark:bg-emerald-500/20',
                        status.isCompleted &&
                          status.isOverdue &&
                          'bg-amber-50/50 dark:bg-amber-500/20',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {student.name}
                        </p>
                        {status.isCompleted && status.completedAt && (
                          <p
                            className="text-xs text-muted-foreground mt-1"
                            suppressHydrationWarning
                          >
                            تاريخ التسليم:{' '}
                            {formatDate(new Date(status.completedAt))}
                          </p>
                        )}
                        {status.isCompleted && isMarkedByOther && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            بواسطة: {markedByName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {status.isCompleted && (
                          <SubmissionViewerSheet
                            studentName={student.name}
                            assignmentName={assignment.name}
                            textSubmission={status.textSubmission || null}
                            fileKey={status.fileKey || null}
                            fileUrl={status.fileUrl || null}
                            allowTextSubmission={assignment.allowTextSubmission}
                            allowFileSubmission={assignment.allowFileSubmission}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              عرض التسليمات
                            </Button>
                          </SubmissionViewerSheet>
                        )}
                        <button
                          onClick={() =>
                            toggleCompletion(
                              student.id,
                              assignment.id,
                              status.isCompleted,
                            )
                          }
                          className={cn(
                            'h-8 px-3 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
                            status.isCompleted && !status.isOverdue
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700'
                              : status.isCompleted && status.isOverdue
                                ? 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700'
                                : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/50',
                          )}
                        >
                          {status.isCompleted ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {status.isOverdue ? 'تم الادراك' : 'مكتمل'}
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              غير مكتمل
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
