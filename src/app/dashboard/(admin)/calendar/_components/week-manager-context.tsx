'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { updateCalendarWeeksAction } from '@/features/programs/actions/update-weeks';
import { CalendarWeekItem } from './types';

// Helper to check if two date ranges overlap
function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 <= e2 && s2 <= e1;
}

// Check if any weeks in the array have overlapping dates
function hasOverlappingDates(weeks: CalendarWeekItem[]): boolean {
  for (let i = 0; i < weeks.length; i++) {
    for (let j = i + 1; j < weeks.length; j++) {
      if (
        datesOverlap(
          weeks[i].startDate,
          weeks[i].endDate,
          weeks[j].startDate,
          weeks[j].endDate,
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

interface WeekManagerContextValue {
  weeks: CalendarWeekItem[];
  setWeeks: React.Dispatch<React.SetStateAction<CalendarWeekItem[]>>;
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  updateWeek: (weekId: string, updates: Partial<CalendarWeekItem>) => void;
  deleteWeek: (weekId: string) => void;
  insertBreak: (afterIndex: number) => void;
  removeBreak: (afterIndex: number) => void;
  addWeek: () => void;
  generateSchedule: (startDate: Date, numberOfWeeks: number) => void;
  shiftDates: (days: number) => void;
  resetState: () => void;
  saveChanges: () => Promise<void>;
}

const WeekManagerContext = React.createContext<WeekManagerContextValue | null>(
  null,
);

export function useWeekManager() {
  const context = React.useContext(WeekManagerContext);
  if (!context) {
    throw new Error('useWeekManager must be used within a WeekManagerProvider');
  }
  return context;
}

interface WeekManagerProviderProps {
  children: React.ReactNode;
  initialWeeks: CalendarWeekItem[];
}

export function WeekManagerProvider({
  children,
  initialWeeks,
}: WeekManagerProviderProps) {
  const [weeks, setWeeks] = React.useState<CalendarWeekItem[]>(initialWeeks);
  const [hasChanges, setHasChanges] = React.useState(false);
  const initialWeeksRef = React.useRef(initialWeeks);

  const updateWeek = React.useCallback(
    (weekId: string, updates: Partial<CalendarWeekItem>) => {
      setWeeks((prev) => {
        const newWeeks = prev.map((week) =>
          week.week.id === weekId ? { ...week, ...updates } : week,
        );

        // Only check for overlaps if dates are being updated
        if (updates.startDate !== undefined || updates.endDate !== undefined) {
          if (hasOverlappingDates(newWeeks)) {
            toast.error('لا يمكن تداخل التواريخ بين الأسابيع');
            return prev; // Return original state, reject the change
          }
        }

        return newWeeks;
      });
      setHasChanges(true);
    },
    [],
  );

  const deleteWeek = React.useCallback((weekId: string) => {
    setWeeks((prev) => {
      const filtered = prev.filter((week) => week.week.id !== weekId);
      // Renumber the weeks
      return filtered.map((week, index) => ({
        ...week,
        week: {
          ...week.week,
          number: index + 1,
        },
      }));
    });
    setHasChanges(true);
  }, []);

  const insertBreak = React.useCallback((afterIndex: number) => {
    setWeeks((prev) => {
      const newWeeks = [...prev];
      // Shift all weeks after the insertion point by 7 days
      for (let i = afterIndex + 1; i < newWeeks.length; i++) {
        const startDate = new Date(newWeeks[i].startDate);
        const endDate = new Date(newWeeks[i].endDate);
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);
        newWeeks[i] = {
          ...newWeeks[i],
          startDate,
          endDate,
        };
      }
      return newWeeks;
    });
    setHasChanges(true);
  }, []);

  const removeBreak = React.useCallback((afterIndex: number) => {
    setWeeks((prev) => {
      const newWeeks = [...prev];
      // Calculate the gap days between current week end and next week start
      const currentEnd = new Date(newWeeks[afterIndex].endDate);
      const nextStart = new Date(newWeeks[afterIndex + 1].startDate);
      const gapDays =
        Math.floor(
          (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24),
        ) - 1;

      if (gapDays <= 0) return prev;

      // Shift all weeks after the break backward by the gap days
      for (let i = afterIndex + 1; i < newWeeks.length; i++) {
        const startDate = new Date(newWeeks[i].startDate);
        const endDate = new Date(newWeeks[i].endDate);
        startDate.setDate(startDate.getDate() - gapDays);
        endDate.setDate(endDate.getDate() - gapDays);
        newWeeks[i] = {
          ...newWeeks[i],
          startDate,
          endDate,
        };
      }

      // Validate for overlaps after the change
      if (hasOverlappingDates(newWeeks)) {
        toast.error('لا يمكن إزالة الإجازة - ستتداخل التواريخ');
        return prev;
      }

      return newWeeks;
    });
    setHasChanges(true);
  }, []);

  const addWeek = React.useCallback(() => {
    setWeeks((prev) => {
      const lastWeek = prev[prev.length - 1];
      let startDate: Date;
      let endDate: Date;

      if (lastWeek) {
        // Start the day after the last week ends
        startDate = new Date(lastWeek.endDate);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
      } else {
        // If no weeks exist, start from today
        startDate = new Date();
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
      }

      const newWeekNumber = prev.length + 1;
      const newWeek: CalendarWeekItem = {
        startDate,
        endDate,
        week: {
          number: newWeekNumber,
          id: `temp-${crypto.randomUUID()}`,
          title: `الأسبوع ${newWeekNumber}`,
        },
      };

      return [...prev, newWeek];
    });
    setHasChanges(true);
  }, []);

  const generateSchedule = React.useCallback(
    (startDate: Date, numberOfWeeks: number) => {
      const newWeeks: CalendarWeekItem[] = [];
      let currentStart = new Date(startDate);

      for (let i = 0; i < numberOfWeeks; i++) {
        const weekEnd = new Date(currentStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        newWeeks.push({
          startDate: new Date(currentStart),
          endDate: weekEnd,
          week: {
            number: i + 1,
            id: `temp-${crypto.randomUUID()}`,
            title: `الأسبوع ${i + 1}`,
          },
        });

        currentStart = new Date(weekEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      setWeeks(newWeeks);
      setHasChanges(true);
    },
    [],
  );

  const shiftDates = React.useCallback((days: number) => {
    setWeeks((prev) => {
      const newWeeks = prev.map((week) => {
        const startDate = new Date(week.startDate);
        const endDate = new Date(week.endDate);
        startDate.setDate(startDate.getDate() + days);
        endDate.setDate(endDate.getDate() + days);
        return {
          ...week,
          startDate,
          endDate,
        };
      });

      // Validate for overlaps after the change
      if (hasOverlappingDates(newWeeks)) {
        toast.error('لا يمكن تحريك التواريخ - ستتداخل التواريخ');
        return prev;
      }

      return newWeeks;
    });
    setHasChanges(true);
  }, []);

  const resetState = React.useCallback(() => {
    setWeeks(initialWeeksRef.current);
    setHasChanges(false);
  }, []);

  const saveChanges = React.useCallback(async () => {
    try {
      const result = await updateCalendarWeeksAction(weeks);
      console.log(result);

      if (!result.success) {
        throw new Error(result.error?.type || 'unknown');
      }
      setHasChanges(false);
      initialWeeksRef.current = weeks;
    } catch (error) {
      console.error('Error saving weeks:', error);
      throw error; // Re-throw to be handled by the UI
    }
  }, [weeks]);

  const value = React.useMemo(
    () => ({
      weeks,
      setWeeks,
      hasChanges,
      setHasChanges,
      updateWeek,
      deleteWeek,
      insertBreak,
      removeBreak,
      addWeek,
      generateSchedule,
      shiftDates,
      resetState,
      saveChanges,
    }),
    [
      weeks,
      hasChanges,
      updateWeek,
      deleteWeek,
      insertBreak,
      removeBreak,
      addWeek,
      generateSchedule,
      shiftDates,
      resetState,
      saveChanges,
    ],
  );

  return (
    <WeekManagerContext.Provider value={value}>
      {children}
    </WeekManagerContext.Provider>
  );
}
