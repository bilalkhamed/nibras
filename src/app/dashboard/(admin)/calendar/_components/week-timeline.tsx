'use client';

import * as React from 'react';
import {
  differenceInDays,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { XIcon, CalendarOffIcon } from 'lucide-react';
import { WeekCard, WeekStatus } from './week-card';
import { InsertBreakButton } from './insert-break-button';
import { AddWeekButton } from './add-week-button';
import { useWeekManager } from './week-manager-context';
import { Button } from '@/components/ui/button';
import { cn, toArabicNumerals } from '@/lib/shared/utils';
import { CalendarWeekItem } from './types';

interface BreakIndicatorProps {
  days: number;
  afterIndex: number;
}

function BreakIndicator({ days, afterIndex }: BreakIndicatorProps) {
  const { removeBreak } = useWeekManager();

  return (
    <div className="relative flex items-center justify-center py-2 md:pr-14">
      {/* Break card */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 border-dashed">
        <CalendarOffIcon className="size-4 text-amber-600" />
        <span className="text-sm text-amber-700 font-medium">
          إجازة ({days} يوم)
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
          onClick={() => removeBreak(afterIndex)}
        >
          <XIcon className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function WeekTimeline() {
  const { weeks } = useWeekManager();

  if (weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">لا توجد أسابيع</h3>
        <p className="text-muted-foreground max-w-sm">
          استخدم زر &quot;إنشاء جدول&quot; لإنشاء جدول أسابيع جديد
        </p>
      </div>
    );
  }

  // Calculate gaps between weeks
  const getGapDays = (index: number): number => {
    if (index >= weeks.length - 1) return 0;
    const currentEnd = new Date(weeks[index].endDate);
    const nextStart = new Date(weeks[index + 1].startDate);
    return differenceInDays(nextStart, currentEnd) - 1;
  };

  // Get status of a week (past, current, or future)
  const getWeekStatus = (week: CalendarWeekItem): WeekStatus => {
    const now = new Date();
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);

    if (isWithinInterval(now, { start, end })) {
      return 'current';
    } else if (isBefore(end, now)) {
      return 'past';
    } else {
      return 'future';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line - desktop only */}
      <div className="absolute right-6.75 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/50 via-primary/30 to-muted hidden md:block" />

      {/* Week cards */}
      <div className="flex flex-col gap-2">
        {weeks.map((week, index) => {
          const gapDays = getGapDays(index);
          const hasBreak = gapDays > 0;
          const status = getWeekStatus(week);

          return (
            <React.Fragment key={week.week.id}>
              <div className="relative flex items-start">
                {/* Timeline dot - desktop only */}
                <div className="absolute right-4 top-6 hidden md:flex items-center justify-center">
                  <div
                    className={cn(
                      'size-6 rounded-full border-2 bg-background transition-all duration-200 flex items-center justify-center text-xs font-medium',
                      status === 'current' &&
                        'border-primary bg-primary text-primary-foreground animate-pulse shadow-lg shadow-primary/30',
                      status === 'past' &&
                        'border-muted-foreground/30 text-muted-foreground/50',
                      status === 'future' && 'border-primary text-primary',
                    )}
                  >
                    {toArabicNumerals(week.week.number)}
                  </div>
                </div>

                {/* Card container */}
                <div className="w-full md:pr-14">
                  <WeekCard week={week} status={status} />
                </div>
              </div>

              {/* Between cards: Break indicator or Insert button */}
              {index < weeks.length - 1 && (
                <>
                  {hasBreak ? (
                    <BreakIndicator days={gapDays} afterIndex={index} />
                  ) : (
                    <div className="md:pr-14">
                      <InsertBreakButton afterIndex={index} />
                    </div>
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* Add week button after the last week */}
        <div className="md:pr-14">
          <AddWeekButton />
        </div>
      </div>
    </div>
  );
}
