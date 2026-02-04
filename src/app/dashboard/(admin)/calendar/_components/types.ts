import { CalendarWeekDTO } from '@/features/programs/types';

export type CalendarWeekItem = CalendarWeekDTO;

export interface WeekManagerState {
  weeks: CalendarWeekItem[];
  hasChanges: boolean;
}
