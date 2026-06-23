/**
 * AssignmentsGrid Component
 *
 * Displays a grid of assignment cards for students.
 * Handles filtering by program and status, and optimistic updates for completion.
 */

'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import type { Assignment, Program, StudentAssignment } from '@prisma/client';
import { ProgramFilter } from './program-filter';
import { Toggle } from '@/components/ui/toggle';
import {
  CheckCircleIcon,
  CheckLineIcon,
  CheckCheckIcon,
  ClockIcon,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn, formatDate, toArabicNumerals } from '@/lib/shared/utils';
import { updateStudentAssignmentAction } from '../../actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AttachmentsPreview } from './attachments-preview';
import type { AssignmentWithAttachmentsDTO } from '../../types';
import { SubmissionSheet } from './submission-sheet';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubmissionViewerSheet } from '../shared/submission-viewer-sheet';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type StudentAssignmentWithFileUrl = StudentAssignment & {
  fileUrl: string | null;
  isOverdue?: boolean;
};

type AssignmentsGridProps = {
  /** Array of assignments with attachments */
  assignments: AssignmentWithAttachmentsDTO[];
  /** Available programs for filtering */
  programs: Program[];
  /** Student's completion records */
  studentAssignments: StudentAssignmentWithFileUrl[];
  /** View mode for cards */
  view?: 'active' | 'history';
  /** Student information for read-only submission viewer (history mode only) */
  studentInfo?: {
    id: string;
    name: string;
  };
};

/**
 * Main grid component for displaying student assignments
 */
export function AssignmentsGrid({
  assignments,
  programs,
  studentAssignments,
  view = 'active',
  studentInfo,
}: AssignmentsGridProps) {
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'completed' | 'pending'
  >('all');

  // Filter by program
  const assignmentsByProgram = useMemo(() => {
    if (programFilter === 'all') return assignments;
    return assignments.filter((item) => item.programId === programFilter);
  }, [assignments, programFilter]);

  // Merge completion status and apply filters
  const processedAssignments = useMemo(() => {
    const studentAssignmentById = new Map(
      studentAssignments.map((sa) => [sa.assignmentId, sa]),
    );

    // Merge with completion status
    const mappedAssignments = assignmentsByProgram.map((a) => ({
      ...a,
      program: programs.find((p) => p.id === a.programId),
      studentAssignment: studentAssignmentById.get(a.id),
      isCompleted: studentAssignmentById.get(a.id)?.isCompleted ?? false,
      fileKey: studentAssignmentById.get(a.id)?.fileKey,
      textSubmission: studentAssignmentById.get(a.id)?.textSubmission,
      fileUrl: studentAssignmentById.get(a.id)?.fileUrl,
    }));

    const merged = mappedAssignments.filter(
      (
        a,
      ): a is (typeof mappedAssignments)[0] & {
        program: NonNullable<(typeof mappedAssignments)[0]['program']>;
      } => a.program !== undefined,
    );

    // Apply status filter
    let filtered = merged;
    if (statusFilter === 'completed') {
      filtered = merged.filter((a) => a.isCompleted);
    }
    if (statusFilter === 'pending') {
      filtered = merged.filter((a) => !a.isCompleted);
    }

    // Only sort by status if not in 'all' view (prevents jumpy behavior)
    if (statusFilter === 'all') {
      return filtered;
    }

    return filtered.sort(
      (a, b) => Number(a.isCompleted) - Number(b.isCompleted),
    );
  }, [assignmentsByProgram, studentAssignments, statusFilter, programs]);

  return (
    <div className="space-y-6">
      <ProgramFilter
        programs={programs}
        programFilter={programFilter}
        onFilterChange={setProgramFilter}
      />

      {/* Status filter tabs */}
      <div className="flex justify-end">
        <div className="flex justify-between gap-2 text-sm bg-muted p-1 rounded-lg w-100 md:w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition flex-1 ${
              statusFilter === 'all'
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md transition flex-1 ${
              statusFilter === 'pending'
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            المتبقي
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md transition flex-1 ${
              statusFilter === 'completed'
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            المنجز
          </button>
        </div>
      </div>

      {processedAssignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {processedAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              view={view}
              studentInfo={studentInfo}
              data={{
                isCompleted: assignment.isCompleted,
                studentAssignment: assignment.studentAssignment,
                fileKey: assignment.fileKey,
                textSubmission: assignment.textSubmission,
                fileUrl: assignment.fileUrl,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type AssignmentCardProps = {
  assignment: AssignmentWithAttachmentsDTO & {
    program: Program;
    isCompleted: boolean;
  };
  view: 'active' | 'history';
  studentInfo?: {
    id: string;
    name: string;
  };
  data: {
    isCompleted: boolean;
    studentAssignment?: StudentAssignment & {
      fileUrl: string | null;
      isOverdue?: boolean;
    };
    fileKey?: string | null;
    textSubmission?: string | null;
    fileUrl?: string | null;
  };
};

/**
 * Individual assignment card with completion toggle
 */
function AssignmentCard({
  assignment,
  view,
  studentInfo,
  data,
}: AssignmentCardProps) {
  const badge = typeBadge(assignment.type);
  const hasAttachments = assignment.attachments.length > 0;
  const requiresSubmission =
    assignment.allowFileSubmission || assignment.allowTextSubmission;
  const isCompleted = data.studentAssignment?.isCompleted ?? false;

  const GradeIcon = data.studentAssignment?.score ? CheckCheckIcon : ClockIcon;
  const gradeLabel = data.studentAssignment?.score
    ? 'تم التقييم'
    : 'لا يوجد تقييم';

  return (
    <Card className="group h-full rounded-2xl border border-primary/15 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge.style}`}
          >
            {badge.label}
          </span>
        </div>
        <CardAction>
          <Badge variant="outline" className="text-xs font-normal">
            {assignment.program.name}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2 leading-6">
          {assignment.name}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {assignment.description}
        </CardDescription>

        {hasAttachments && (
          <div>
            <AttachmentsPreview attachments={assignment.attachments} />
          </div>
        )}
      </CardContent>

      <CardFooter
        className={cn('mt-auto', view === 'history' && 'border-t pt-4')}
      >
        {view === 'active' ? (
          <div className="flex items-center gap-3">
            {requiresSubmission ? (
              <SubmissionSheet
                assignmentId={assignment.id}
                assignmentName={assignment.name}
                allowFileSubmission={assignment.allowFileSubmission}
                allowTextSubmission={assignment.allowTextSubmission}
                defaultValues={{
                  fileKey: data.fileKey,
                  textSubmission: data.textSubmission,
                  fileUrl: data.fileUrl,
                }}
              >
                <Button
                  variant={'outlinePrimary'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {data.textSubmission || data.fileKey
                    ? 'تعديل المرفقات'
                    : 'سلمي المرفقات'}
                </Button>
              </SubmissionSheet>
            ) : (
              <CompleteButton
                assignment={assignment}
                isCompleted={data.isCompleted}
              />
            )}
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="space-y-1 border-l border-border/80 pl-4">
              <p className="text-xs text-muted-foreground">الحالة</p>
              {isCompleted ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="w-fit">
                    مكتمل
                  </Badge>
                  {!requiresSubmission && (
                    <UndoCompleteButton assignment={assignment} />
                  )}
                </div>
              ) : (
                <>
                  {requiresSubmission ? (
                    <SubmissionSheet
                      assignmentId={assignment.id}
                      assignmentName={assignment.name}
                      allowFileSubmission={assignment.allowFileSubmission}
                      allowTextSubmission={assignment.allowTextSubmission}
                      defaultValues={{
                        fileKey: data.fileKey,
                        textSubmission: data.textSubmission,
                        fileUrl: data.fileUrl,
                      }}
                    >
                      <Button
                        variant="outlinePrimary"
                        size="sm"
                        className="gap-1"
                      >
                        <Send className="h-4 w-4" />
                        سلمي المرفقات
                      </Button>
                    </SubmissionSheet>
                  ) : (
                    <CompleteButton
                      assignment={assignment}
                      isCompleted={data.isCompleted}
                    />
                  )}
                </>
              )}
              {data.studentAssignment?.completedAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(data.studentAssignment.completedAt)}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {requiresSubmission ? 'المراجعة' : 'الدرجة'}
              </p>
              {isCompleted && requiresSubmission && studentInfo ? (
                <SubmissionViewerSheet
                  allowFileSubmission={assignment.allowFileSubmission}
                  allowTextSubmission={assignment.allowTextSubmission}
                  fileKey={data.fileKey || null}
                  fileUrl={data.fileUrl || null}
                  textSubmission={data.textSubmission || null}
                  currentScore={data.studentAssignment?.score || null}
                  currentComment={data.studentAssignment?.comment || null}
                  assignmentId={assignment.id}
                  assignmentName={assignment.name}
                  studentId={studentInfo.id}
                  studentName={studentInfo.name}
                  canEditGrade={false}
                  maxScore={assignment.maxScore}
                >
                  <Button variant="outline" size="sm" className="gap-1">
                    <GradeIcon className="h-4 w-4" />
                    {gradeLabel}{' '}
                    {data.studentAssignment?.score
                      ? `(${toArabicNumerals(data.studentAssignment.score)})`
                      : ''}
                  </Button>
                </SubmissionViewerSheet>
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {data.studentAssignment?.score
                    ? toArabicNumerals(data.studentAssignment.score) +
                      ' / ' +
                      toArabicNumerals(assignment.maxScore)
                    : '-'}
                </p>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Completion toggle button with optimistic updates and confetti
 */
function CompleteButton({
  assignment,
  isCompleted,
}: {
  assignment: Assignment;
  isCompleted: boolean;
}) {
  const router = useRouter();

  // Optimistic state for instant UI feedback
  const [optimisticCompleted, toggleOptimistic] = useOptimistic(
    isCompleted,
    (_state, newValue: boolean) => newValue,
  );

  const handleOnPressedChange = async () => {
    const newValue = !optimisticCompleted;

    // Update UI immediately
    startTransition(() => {
      toggleOptimistic(newValue);
    });

    // Perform the server action
    const result = await updateStudentAssignmentAction({
      assignmentId: assignment.id,

      data: {
        isCompleted: newValue,
        score:
          assignment.maxScore && newValue ? assignment.maxScore : undefined,
      },
    });

    if (result.success) {
      // Sync the rest of the app
      router.refresh();
    } else {
      // Show error (optimistic state auto-reverts on transition end)
      toast.error('حدث خطأ أثناء تحديث حالة المهمة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!optimisticCompleted) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 60,
        spread: 50,
        decay: 0.85,
        origin: { x, y },
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            pressed={optimisticCompleted}
            onClick={handleOnClick}
            variant={'outline'}
            size={'lg'}
            className={cn(
              'gap-2 transition-all duration-300 rounded-full',
              optimisticCompleted
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onPressedChange={handleOnPressedChange}
          >
            <span className="sr-only">Mark assignment as completed</span>
            {optimisticCompleted ? <CheckCircleIcon /> : <CheckLineIcon />}
            {optimisticCompleted ? 'منجزة' : 'أنجزي المهمة'}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          {optimisticCompleted
            ? 'لقد أكملت هذه المهمة. أحسنت!'
            : 'اضغطي عند الإنجاز'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Undo completion button for auto-check assignments (no file/text submission)
 */
function UndoCompleteButton({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleUndo = async () => {
    setIsPending(true);

    const result = await updateStudentAssignmentAction({
      assignmentId: assignment.id,
      data: {
        isCompleted: false,
        score: 0,
      },
    });

    if (result.success) {
      router.refresh();
    } else {
      toast.error('حدث خطأ أثناء التراجع. يرجى المحاولة مرة أخرى.');
    }

    setIsPending(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleUndo}
            disabled={isPending}
            aria-label="التراجع عن الإنجاز"
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw
              className={cn('h-3.5 w-3.5', isPending && 'animate-spin')}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>التراجع عن الإنجاز</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Returns badge styling based on assignment type
 */
function typeBadge(type: Assignment['type']) {
  switch (type) {
    case 'reading':
      return {
        label: 'قراءة',
        style:
          'bg-primary-soft text-primary-foreground dark:text-secondary-foreground border-primary/30',
      };
    case 'lecture':
      return {
        label: 'محاضرة',
        style:
          'bg-secondary-soft text-secondary-foreground border-secondary/30',
      };
    case 'exercise':
      return {
        label: 'تمرين',
        style: 'bg-emerald-soft text-emerald-foreground border-emerald/30',
      };
    case 'quiz':
      return {
        label: 'اختبار',
        style: 'bg-accent-soft text-accent-foreground border-accent/30',
      };
    default:
      return {
        label: 'نشاط',
        style: 'bg-muted text-muted-foreground border-border',
      };
  }
}

/**
 * Empty state when no assignments match filters
 */
function EmptyState() {
  return (
    <article className="rounded-2xl border border-dashed border-primary/30 bg-card p-6 text-center shadow-sm">
      <p className="text-lg font-semibold text-foreground">
        لا توجد مهام لهذا الاختيار
      </p>
    </article>
  );
}
