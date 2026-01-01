'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Assignment, Program, StudentAssignment } from '@prisma/client';
import { ProgramFilter } from './program-filter';
import { Toggle } from '@/components/ui/toggle';
import { CheckCircleIcon, CheckLineIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/shared/utils';
import { toggleAssignmentCompletion } from '@/lib/server/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Props = {
  assignments: Assignment[];
  programs: Program[];
  studentAssignments: StudentAssignment[];
};

export function AssignmentsGrid({
  assignments,
  programs,
  studentAssignments,
}: Props) {
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'completed' | 'pending'
  >('all');

  const assignmentsByProgram = useMemo(() => {
    if (programFilter === 'all') return assignments;
    return assignments.filter((item) => item.programId === programFilter);
  }, [assignments, programFilter]);

  const processedAssignments = useMemo(() => {
    // 1. Merge Status
    const merged = assignmentsByProgram.map((a) => ({
      ...a,
      program: programs.find((p) => p.id === a.programId)!,
      isCompleted: studentAssignments.some(
        (p) => p.assignmentId === a.id && p.completedAt !== null // Ensure we check for actual completion
      ),
    }));

    // 2. Filter First (Optimization)
    let filtered = merged;
    if (statusFilter === 'completed')
      filtered = merged.filter((a) => a.isCompleted);
    if (statusFilter === 'pending')
      filtered = merged.filter((a) => !a.isCompleted);

    // 3. Conditional Sorting
    // If we are in 'All' view, DON'T sort by status. Keep them in their natural order (e.g. by ID or Date).
    // This prevents the "Jump".
    if (statusFilter === 'all') {
      return filtered; // Or sort by a.createdAt if you want date order
    }

    // Only sort by status if we are NOT in 'All' view (or if you strictly want it)
    return filtered.sort(
      (a, b) => Number(a.isCompleted) - Number(b.isCompleted)
    );
  }, [assignmentsByProgram, studentAssignments, statusFilter]);

  return (
    <div className="space-y-6">
      <ProgramFilter
        programs={programs}
        programFilter={programFilter}
        onFilterChange={setProgramFilter}
      />
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
              isCompleted={assignment.isCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment,
  isCompleted,
}: {
  assignment: Assignment & { program: Program } & { isCompleted: boolean };
  isCompleted: boolean;
}) {
  const badge = typeBadge(assignment.type);
  const hasLink = Boolean(assignment.url);

  return (
    <article className="group rounded-2xl border border-primary/15 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge.style}`}
        >
          {badge.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {assignment.program.name}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-bold text-foreground line-clamp-2">
        {assignment.name}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
        {assignment.description || 'ابدئي عند جاهزيتك، ننتظر إبداعك.'}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <CompleteButton assignment={assignment} isCompleted={isCompleted} />

        {hasLink && <OpenUrlButton url={assignment.url!} />}
      </div>
    </article>
  );
}

// AI CODE (mostly):
function CompleteButton({
  assignment,
  isCompleted,
}: {
  assignment: Assignment;
  isCompleted: boolean;
}) {
  const router = useRouter();

  // 2. Setup the Optimistic State
  // This defaults to 'isCompleted' (server state), but we can override it instantly
  const [optimisticCompleted, toggleOptimistic] = useOptimistic(
    isCompleted,
    (state, newValue: boolean) => newValue
  );

  const handleOnPressedChange = async () => {
    const newValue = !optimisticCompleted;

    // 3. Update UI Immediately (Optimistic)
    startTransition(() => {
      toggleOptimistic(newValue);
    });

    // 4. Perform the Server Action in the background
    const result = await toggleAssignmentCompletion(assignment.id, newValue);

    if (result.success) {
      // 5. Sync the rest of the app (e.g. move item to bottom of list)
      router.refresh();
    } else {
      // 6. Handle Failure (Optimistic state automatically reverts when transition ends)
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
            // 7. Use the Optimistic State for rendering
            pressed={optimisticCompleted}
            onClick={handleOnClick}
            variant={'outline'}
            size={'lg'}
            className={cn(
              'gap-2 transition-all duration-300 rounded-full',
              // Use optimisticCompleted for styling logic too
              optimisticCompleted
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                : 'text-muted-foreground hover:text-foreground'
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

function OpenUrlButton({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const handleClick = () => {
    window.open(url, '_blank');
  };

  return (
    <Button variant="outline" size={'md'} onClick={handleClick}>
      الرابط
    </Button>
  );
}

function EmptyState() {
  return (
    <article className="rounded-2xl border border-dashed border-primary/30 bg-card p-6 text-center shadow-sm">
      <p className="text-lg font-semibold text-foreground">
        لا توجد مهام لهذا الاختيار
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        جرّبي برنامجاً آخر أو عودي لاحقاً ✨
      </p>
    </article>
  );
}
