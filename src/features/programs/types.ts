import { Prisma } from '@prisma/client';

const weekSelect = {
  id: true,
  number: true,
  title: true,
} satisfies Prisma.WeekSelect;

const calendarWeekSelect = {
  week: {
    select: {
      id: true,
      number: true,
      title: true,
    },
  },
  startDate: true,
  endDate: true,
} satisfies Prisma.CalendarWeekSelect;

export type WeekDTO = Prisma.WeekGetPayload<{
  select: typeof weekSelect;
}>;

export type CalendarWeekDTO = Prisma.CalendarWeekGetPayload<{
  select: typeof calendarWeekSelect;
}>;
