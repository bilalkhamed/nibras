import { Prisma } from '@prisma/client';

const calendarWeekSelect = {
  week: {
    select: {
      number: true,
      title: true,
      id: true,
    },
  },
  startDate: true,
  endDate: true,
} satisfies Prisma.CalendarWeekSelect;

export type CalendarWeekDTO = Prisma.CalendarWeekGetPayload<{
  select: typeof calendarWeekSelect;
}>;
