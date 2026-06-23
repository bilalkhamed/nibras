'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import labels from '@/lib/labels.json';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WeekNavigatorProps {
  weeks: { id: string; number: number; title: string }[];
  currentWeekNumber?: number;
}

export function WeekNavigator({
  weeks,
  // We can keep currentWeekNumber in props in case you want to use it for
  // UI highlighting later, but we won't use it to force a redirect.
  currentWeekNumber,
}: WeekNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const weekFromParams = searchParams.get('week');

  // FIX: Default to the first available week (Week 1), matching your server logic.
  const defaultWeek = weeks[0]?.number ?? 1;

  const [activeWeek, setActiveWeek] = useState<number>(
    weekFromParams ? Number(weekFromParams) : defaultWeek,
  );

  useEffect(() => {
    if (weeks.length === 0) return;
    const parsed = Number(weekFromParams);

    if (!weekFromParams || Number.isNaN(parsed) || parsed < 1) {
      // This will now normalize the URL to ?week=1 instead of 35
      updateWeek(defaultWeek, { replace: true });
      setActiveWeek(defaultWeek);
    } else {
      setActiveWeek(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekFromParams, weeks]);

  const updateWeek = (newWeek: number, options?: { replace?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', String(newWeek));
    const target = `${pathname}?${params.toString()}`;
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };

  const isFirst = activeWeek <= (weeks[0]?.number ?? defaultWeek);
  const isLast = activeWeek >= (weeks[weeks.length - 1]?.number ?? activeWeek);

  const weekOptions = useMemo(() => weeks.map((w) => w.number), [weeks]);

  return (
    <div className="flex justify-center">
      <div className="flex items-center w-full max-w-xl justify-between gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outlinePrimary"
              size="icon"
              disabled={isFirst}
              onClick={() => updateWeek(activeWeek - 1)}
              aria-label={labels.dashboard.curriculum.prevWeek}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {labels.dashboard.curriculum.prevWeek}
          </TooltipContent>
        </Tooltip>

        <div
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
          aria-live="polite"
        >
          <span>{labels.dashboard.curriculum.week}</span>
          <Select
            value={String(activeWeek)}
            onValueChange={(val) => updateWeek(Number(val))}
          >
            <SelectTrigger
              size="sm"
              aria-label={labels.dashboard.curriculum.week}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="center">
              {weekOptions.map((weekNumber) => (
                <SelectItem key={weekNumber} value={String(weekNumber)}>
                  {weekNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">/ {weekOptions.length}</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outlinePrimary"
              size="icon"
              disabled={isLast}
              onClick={() => updateWeek(activeWeek + 1)}
              aria-label={labels.dashboard.curriculum.nextWeek}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {labels.dashboard.curriculum.nextWeek}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
