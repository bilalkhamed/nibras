'use client';

import * as React from 'react';
import { format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  CalendarPlusIcon,
  CalendarClockIcon,
  CalendarIcon,
  RotateCcwIcon,
  CalendarDaysIcon,
  CalendarOffIcon,
  ClockIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn, toArabicNumerals } from '@/lib/shared/utils';
import { useWeekManager } from './week-manager-context';
import { Card } from '@/components/ui/card';

export function GenerateScheduleDialog() {
  const { generateSchedule } = useWeekManager();
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [numberOfWeeks, setNumberOfWeeks] = React.useState(12);

  const handleGenerate = () => {
    if (!startDate) return;
    generateSchedule(startDate, numberOfWeeks);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarPlusIcon className="size-4" />
          <span>إنشاء جدول</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء جدول جديد</DialogTitle>
          <DialogDescription>
            سيتم إنشاء جدول جديد وحذف الجدول الحالي. حدد تاريخ البداية وعدد
            الأسابيع.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">تاريخ البداية</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="ml-2 size-4" />
                  {startDate ? (
                    format(startDate, 'd MMMM yyyy', { locale: ar })
                  ) : (
                    <span>اختر تاريخ البداية</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  locale={ar}
                  dir="rtl"
                  showOutsideDays={false}
                  modifiers={{
                    today: () => false,
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">عدد الأسابيع</label>
            <Input
              type="number"
              min={1}
              max={52}
              value={numberOfWeeks}
              onChange={(e) => setNumberOfWeeks(Number(e.target.value))}
              className="text-center"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleGenerate} disabled={!startDate}>
            إنشاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShiftDatesDialog() {
  const { shiftDates } = useWeekManager();
  const [open, setOpen] = React.useState(false);
  const [days, setDays] = React.useState(7);

  const handleShift = () => {
    shiftDates(days);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarClockIcon className="size-4" />
          <span>تحريك التواريخ</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تحريك جميع التواريخ</DialogTitle>
          <DialogDescription>
            أدخل عدد الأيام لتحريك جميع التواريخ. استخدم قيمة موجبة للتأخير أو
            سالبة للتقديم.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">عدد الأيام</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDays((d) => d - 7)}
              >
                -7
              </Button>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDays((d) => d + 7)}
              >
                +7
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {days > 0
                ? `سيتم تأخير جميع التواريخ بـ ${days} يوم`
                : days < 0
                  ? `سيتم تقديم جميع التواريخ بـ ${Math.abs(days)} يوم`
                  : 'لن يتم تغيير التواريخ'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleShift} disabled={days === 0}>
            تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WeekManagerToolbar() {
  const { resetState, hasChanges, weeks } = useWeekManager();

  // Calculate summary stats
  const totalWeeks = weeks.length;
  const startDate = weeks.length > 0 ? new Date(weeks[0].startDate) : null;
  const endDate =
    weeks.length > 0 ? new Date(weeks[weeks.length - 1].endDate) : null;

  // Count breaks (gaps > 0 days between consecutive weeks)
  const breakCount = React.useMemo(() => {
    let count = 0;
    for (let i = 0; i < weeks.length - 1; i++) {
      const currentEnd = new Date(weeks[i].endDate);
      const nextStart = new Date(weeks[i + 1].startDate);
      const gap = differenceInDays(nextStart, currentEnd) - 1;
      if (gap > 0) count++;
    }
    return count;
  }, [weeks]);

  // Calculate total break days
  const totalBreakDays = React.useMemo(() => {
    let days = 0;
    for (let i = 0; i < weeks.length - 1; i++) {
      const currentEnd = new Date(weeks[i].endDate);
      const nextStart = new Date(weeks[i + 1].startDate);
      const gap = differenceInDays(nextStart, currentEnd) - 1;
      if (gap > 0) days += gap;
    }
    return days;
  }, [weeks]);

  return (
    <Card className="p-4 my-4 md:ms-14">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <GenerateScheduleDialog />
        <ShiftDatesDialog />
        <Button
          variant="outline"
          className="gap-2"
          onClick={resetState}
          disabled={!hasChanges}
        >
          <RotateCcwIcon className="size-4" />
          <span>إعادة تعيين</span>
        </Button>
      </div>

      {/* Summary section */}
      {totalWeeks > 0 && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Total weeks */}
            <div className="flex items-center gap-1.5">
              <CalendarDaysIcon className="size-4" />
              <span>{toArabicNumerals(totalWeeks)} أسابيع</span>
            </div>

            {/* Date range */}
            {startDate && endDate && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                <span>
                  {format(startDate, 'd MMM', { locale: ar })} -{' '}
                  {format(endDate, 'd MMM yyyy', { locale: ar })}
                </span>
              </div>
            )}

            {/* Breaks */}
            {breakCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <CalendarOffIcon className="size-4" />
                <span>
                  {toArabicNumerals(breakCount)} إجازة (
                  {toArabicNumerals(totalBreakDays)} يوم)
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
