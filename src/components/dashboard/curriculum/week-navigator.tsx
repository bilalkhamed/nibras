import { ChevronRight, ChevronLeft } from 'lucide-react';
import labels from '@/lib/labels.json';
import React from 'react';

interface WeekNavigatorProps {
  week: number;
  onChange: (week: number) => void;
  maxWeeks?: number;
}

export function WeekNavigator({
  week,
  onChange,
  maxWeeks = 16,
}: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        disabled={week <= 1}
        onClick={() => onChange(Math.max(1, week - 1))}
        className="p-2 rounded-full bg-card border border-border text-primary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
        aria-label={labels.dashboard.curriculum.prevWeek}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">
        {labels.dashboard.curriculum.week} {week}
      </span>
      <button
        disabled={week >= maxWeeks}
        onClick={() => onChange(Math.min(maxWeeks, week + 1))}
        className="p-2 rounded-full bg-card border border-border text-primary disabled:opacity-40 hover:bg-secondary/20 transition-colors"
        aria-label={labels.dashboard.curriculum.nextWeek}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
