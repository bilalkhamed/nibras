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
    // 1. PREP: Ensure all Week records exist and grab their IDs first.
    // Doing this outside the main transaction prevents the transaction from timing out.
    const weekIdsByNumber = new Map<number, string>();

    for (const week of newWeeks) {
      const upsertedWeek = await prisma.week.upsert({
        where: { number: week.week.number },
        create: { title: week.week.title, number: week.week.number },
        update: { title: week.week.title },
      });
      weekIdsByNumber.set(week.week.number, upsertedWeek.id);
    }

    // 2. EXECUTE: Use an Array Transaction.
    // This sends all queries in ONE single network request. It is practically impossible to timeout.
    await prisma.$transaction([
      // Step A: Clear old calendar weeks
      prisma.calendarWeek.deleteMany({
        where: { academicYear: academicNumber },
      }),

      // Step B: Bulk create all new calendar weeks in one go
      prisma.calendarWeek.createMany({
        data: newWeeks.map((week) => ({
          academicYear: academicNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          weekId: weekIdsByNumber.get(week.week.number) as string, // Map the ID we grabbed earlier
        })),
      }),

      // Step C: Cleanup orphaned weeks
      prisma.week.deleteMany({
        where: {
          AND: [
            { number: { notIn: newWeeks.map((w) => w.week.number) } },
            { calendarWeeks: { none: {} } },
            { assignments: { none: {} } },
          ],
        },
      }),
    ]);

    revalidateTag('weeks', 'max');
    return null;
  });
}
