'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import labels from '@/lib/labels.json';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
}

function getNewWeekPathname(
  pathname: string,
  activeWeek: number,
  newWeek: number
) {
  if (pathname.includes(`week-${newWeek}`)) {
    return pathname;
  }
  if (!pathname.includes(`week-${activeWeek}`)) {
    return pathname + `/week-${newWeek}`;
  }

  return pathname.replace(`week-${activeWeek}`, `week-${newWeek}`);
}

export function WeekNavigator({ weeks }: WeekNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeWeekString = pathname
    .split('/')
    .find((segment) => segment?.startsWith('week-'));

  const [activeWeek, setActiveWeek] = useState<number>(weeks[0].number);

  useEffect(() => {
    if (weeks.length === 0) {
      return;
    }
    if (!activeWeekString) {
      router.replace(getNewWeekPathname(pathname, 0, weeks[0].number));
      setActiveWeek(weeks[0].number);
    } else {
      setActiveWeek(Number(activeWeekString.replace('week-', '')));
    }
  }, [pathname, weeks, router, activeWeekString]);

  return (
    <div className="flex justify-center">
      <div className="flex items-center w-100 justify-around gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outlinePrimary"
              size="icon"
              disabled={activeWeek <= 1}
              onClick={() =>
                router.push(
                  getNewWeekPathname(pathname, activeWeek, activeWeek - 1)
                )
              }
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
            onValueChange={(val) => {
              router.push(
                getNewWeekPathname(pathname, activeWeek, Number(val))
              );
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label={labels.dashboard.curriculum.week}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="center">
              {weeks.map((week) => {
                return (
                  <SelectItem key={week.id} value={String(week.number)}>
                    {week.number}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">/ {weeks.length}</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outlinePrimary"
              size="icon"
              disabled={activeWeek >= weeks.length}
              onClick={() => {
                router.push(
                  getNewWeekPathname(pathname, activeWeek, activeWeek + 1)
                );
              }}
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
