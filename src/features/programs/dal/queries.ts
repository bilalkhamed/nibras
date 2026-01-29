'use cache';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { DalError, DalReturn } from '@/lib/server/dal/types';
import { CalendarWeek, Level, Program, Week } from '@prisma/client';
import { runDalOperation } from '@/lib/server/dal/helpers';
import { CalendarWeekDTO, WeekDTO } from '../types';

export async function findProgramBySlug(
  slug: string,
): Promise<DalReturn<Program | null>> {
  return runDalOperation(async () => {
    cacheTag('programs');
    const program = await prisma.program.findUnique({
      where: {
        slug,
      },
    });
    return program;
  });
}

export async function findManyPrograms(): Promise<DalReturn<Program[]>> {
  return runDalOperation(async () => {
    cacheTag('programs');
    return await prisma.program.findMany();
  });
}

export async function findLevelBySlug(
  slug: string,
): Promise<DalReturn<Level | null>> {
  return runDalOperation(async () => {
    cacheTag('levels');
    const level = await prisma.level.findUnique({
      where: { slug },
    });
    return level;
  });
}

export async function findManyLevels(): Promise<DalReturn<Level[]>> {
  return runDalOperation(async () => {
    cacheTag('levels');
    return await prisma.level.findMany({
      orderBy: { number: 'asc' },
    });
  });
}

export async function findWeekByDate(
  academicYear: number,
  date: Date,
): Promise<DalReturn<CalendarWeekDTO | null>> {
  return runDalOperation(async () => {
    cacheTag('weeks');
    return await prisma.calendarWeek.findFirst({
      where: {
        academicYear,
        startDate: {
          lte: date,
        },
        endDate: {
          gte: date,
        },
      },
      include: {
        week: {
          select: {
            number: true,
            title: true,
            id: true,
          },
        },
      },
    });
  });
}

export async function findCalendarWeekByNumber(
  academicYear: number,
  weekNumber: number,
): Promise<DalReturn<CalendarWeekDTO | null>> {
  return runDalOperation(async () => {
    cacheTag('weeks');
    return await prisma.calendarWeek.findFirst({
      where: {
        academicYear,
        week: {
          number: weekNumber,
        },
      },
      include: {
        week: {
          select: {
            number: true,
            title: true,
            id: true,
          },
        },
      },
    });
  });
}

export async function findWeekByNumber(
  weekNumber: number
) : Promise<DalReturn<WeekDTO | null>> {
  return runDalOperation(async () => {
    cacheTag('weeks');
    return await prisma.week.findUnique({
      where: {
        number: weekNumber,
      },
      select: {
        id: true,
        number: true,
        title: true,
      },
    });
  });
}

export async function findManyWeeksTillDate(
  date: Date,
): Promise<DalReturn<CalendarWeekDTO[]>> {
  return runDalOperation(async () => {
    cacheTag('weeks');
    return await prisma.calendarWeek.findMany({
      where: {
        startDate: { lte: date },
      },
      include: {
        week: {
          select: {
            number: true,
            title: true,
            id: true,
          },
        },
      },
      orderBy: {
        week: {
          number: 'asc',
        },
      },
    });
  });
}
