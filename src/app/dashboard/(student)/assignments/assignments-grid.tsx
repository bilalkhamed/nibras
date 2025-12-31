'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Assignment, Program } from '@prisma/client';
import { WeekHero } from './week-hero';
import { ProgramFilter } from './program-filter';

type AssignmentWithProgram = Assignment & { program: Program };

type Props = {
  assignments: AssignmentWithProgram[];
  heroTitle: string;
  primaryMessage: string;
  streakText: string;
  deadlineLabel: string;
};

export function AssignmentsGrid({
  assignments,
  heroTitle,
  primaryMessage,
  streakText,
  deadlineLabel,
}: Props) {
  const [programFilter, setProgramFilter] = useState<string>('all');

  const programs = useMemo(() => {
    const unique = new Map<string, string>();
    assignments.forEach((item) => {
      if (!unique.has(item.programId)) {
        unique.set(item.programId, item.program.name);
      }
    });
    return Array.from(unique, ([id, name]) => ({ id, name }));
  }, [assignments]);

  const filtered = useMemo(() => {
    if (programFilter === 'all') return assignments;
    return assignments.filter((item) => item.programId === programFilter);
  }, [assignments, programFilter]);

  const typeBadge = (type: Assignment['type']) => {
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
  };

  const handleCopy = async (value?: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-6">
      <WeekHero
        heroTitle={heroTitle}
        primaryMessage={primaryMessage}
        deadlineLabel={deadlineLabel}
        streakText={streakText}
      />

      <ProgramFilter
        programs={programs}
        programFilter={programFilter}
        onFilterChange={setProgramFilter}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((assignment) => {
          const badge = typeBadge(assignment.type);
          const hasLink = Boolean(assignment.url);
          return (
            <article
              key={assignment.id}
              className="group rounded-2xl border border-primary/15 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
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

              <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground dark:text-secondary-foreground">
                <div className="rounded-full border border-primary/30 bg-primary-soft px-3 py-1 font-semibold">
                  نجمة عند الإكمال ⭐
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button className="flex-1">تسليم</Button>
                {hasLink && <CopyButton url={assignment.url!} />}
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <article className="rounded-2xl border border-dashed border-primary/30 bg-card p-6 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">
              لا توجد مهام لهذا الاختيار
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              جرّبي برنامجاً آخر أو عودي لاحقاً ✨
            </p>
          </article>
        )}
      </div>
    </div>
  );
}

function CopyButton({ url }: { url: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
      {isCopied ? 'تم النسخ' : 'الرابط'}
    </Button>
  );
}
