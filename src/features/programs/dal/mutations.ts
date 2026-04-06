/**
 * Programs DAL - Mutation Operations
 *
 * Pure database mutations for program data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import { revalidateTag } from 'next/cache';
import { CalendarWeekInput } from '../types';

// ============================================================================
// Program CRUD Mutations
// ============================================================================

/**
 * Insert a new program
 *
 * @param data - Program creation data
 * @returns The created program
 */
export async function insertProgram(data: {
  name: string;
  description?: string;
  isSupervisorsOnly: boolean;
}): Promise<DalReturn<{ id: string; name: string; slug: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.program.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        slug: data.name,
        isSupervisorOnly: data.isSupervisorsOnly,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    revalidateTag('programs', 'max');
    return result;
  });
}

export async function updateCalendarWeeks(
  academicNumber: number,
  newWeeks: CalendarWeekInput[],
): Promise<DalReturn<null>> {
  return runDalOperation(async () => {
    await prisma.$transaction(async (tx) => {
      await tx.calendarWeek.deleteMany({
        where: { academicYear: academicNumber },
      });

      await Promise.all(
        newWeeks.map(async (week) => {
          const upsertedWeek = await tx.week.upsert({
            where: { number: week.week.number },
            create: { title: week.week.title, number: week.week.number },
            update: { title: week.week.title },
          });

          await tx.calendarWeek.create({
            data: {
              academicYear: academicNumber,
              startDate: week.startDate,
              endDate: week.endDate,
              weekId: upsertedWeek.id,
            },
          });
        }),
      );

      await tx.week.deleteMany({
        where: {
          AND: [
            {
              number: {
                notIn: newWeeks.map((w) => w.week.number),
              },
            },
            {
              calendarWeeks: {
                none: {},
              },
            },
            {
              assignments: {
                none: {},
              },
            },
          ],
        },
      });
    });

    revalidateTag('weeks', 'max');
    return null;
  });
}
