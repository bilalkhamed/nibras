'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Trash2Icon } from 'lucide-react';

import { cn } from '@/lib/shared/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarWeekItem } from './types';
import { useWeekManager } from './week-manager-context';

export type WeekStatus = 'past' | 'current' | 'future';

interface WeekCardProps {
  week: CalendarWeekItem;
  status: WeekStatus;
}

export function WeekCard({ week, status }: WeekCardProps) {
  const { updateWeek, deleteWeek } = useWeekManager();
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(week.startDate),
    to: new Date(week.endDate),
  });

  // Sync local state when week dates change (e.g., from insertBreak or shiftDates)
  React.useEffect(() => {
    setDateRange({
      from: new Date(week.startDate),
      to: new Date(week.endDate),
    });
  }, [week.startDate, week.endDate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWeek(week.week.id, {
      week: {
        ...week.week,
        title: e.target.value,
      },
    });
  };

  const handleDateRangeSelect = (
    range: { from?: Date; to?: Date } | undefined,
  ) => {
    if (!range) return;

    // Only update if we have both dates
    if (range.from && range.to) {
      updateWeek(week.week.id, {
        startDate: range.from,
        endDate: range.to,
      });
    }
  };

  const handleDelete = () => {
    deleteWeek(week.week.id);
  };

  const formatDateRange = () => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    return `${format(start, 'd MMM', { locale: ar })} - ${format(end, 'd MMM yyyy', { locale: ar })}`;
  };

  return (
    <Card
      className={cn(
        'relative backdrop-blur-sm transition-all duration-200 hover:shadow-lg',
        status === 'current' &&
          'bg-primary/5 border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/20',
        status === 'past' && 'bg-card/30 border-muted-foreground/10 opacity-60',
        status === 'future' && 'bg-card/50 border-muted-foreground/20',
        status !== 'current' && 'hover:border-primary/30',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {week.week.number}
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">
                <Input
                  value={week.week.title}
                  onChange={handleTitleChange}
                  className="h-8 w-48 border-none bg-transparent px-0 text-base font-semibold focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary focus-visible:rounded-none"
                  placeholder="عنوان الأسبوع"
                />
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                الأسبوع {week.week.number}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-right font-normal',
                !dateRange.from && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="ml-2 size-4" />
              <span>{formatDateRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              locale={ar}
              dir="rtl"
              showOutsideDays={false}
              ISOWeek
              modifiers={{
                today: () => false,
              }}
            />
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
