import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for creating a new program
 */
export const createProgramSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم البرنامج'),
  description: z.string().optional(),
  isSupervisorsOnly: z.boolean(),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type CreateProgramData = z.infer<typeof createProgramSchema>;

// ============================================================================
// Action Results
// ============================================================================

export type CreateProgramResult =
  | { success: true; programId: string }
  | { success: false; error: string };

// ============================================================================
// DTOs
// ============================================================================

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

export type CalendarWeekInput = Pick<
  Prisma.CalendarWeekCreateInput,
  'startDate' | 'endDate'
> & {
  week: Pick<Prisma.WeekCreateInput, 'number' | 'title'>;
};
