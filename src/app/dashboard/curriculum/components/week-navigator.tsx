'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import labels from '@/lib/labels.json';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface WeekNavigatorProps {
  week?: number; // optional override; otherwise read from URL (?week)
  maxWeeks?: number;
  onChange?: (week: number) => void;
}

export function WeekNavigator({
  week,
  maxWeeks = 16,
  onChange,
}: WeekNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read week from URL (1-based), clamp to [1, maxWeeks]
  const weekParam = searchParams.get('week');
  const parsed = parseInt(weekParam ?? '', 10);
  const urlWeek = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 1), maxWeeks)
    : 1;

  const currentWeek = week !== undefined ? week : urlWeek;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const setWeek = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), maxWeeks);
    if (onChange) {
      onChange(clamped);
    } else {
      const qs = createQueryString('week', String(clamped));
      router.replace(`${pathname}?${qs}`);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        disabled={currentWeek <= 1}
        onClick={() => setWeek(currentWeek - 1)}
        className="cursor-pointer p-2 rounded-full bg-card border border-border text-primary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
        aria-label={labels.dashboard.curriculum.prevWeek}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">
        {labels.dashboard.curriculum.week} {currentWeek}
      </span>
      <button
        disabled={currentWeek >= maxWeeks}
        onClick={() => setWeek(currentWeek + 1)}
        className="cursor-pointer p-2 rounded-full bg-card border border-border text-primary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
        aria-label={labels.dashboard.curriculum.nextWeek}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
