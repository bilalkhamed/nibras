'use cache';

import { getAcademicYear } from './academic-year';
import prisma from './prisma';

export async function getCurrentWeek() {
  const { year: academicYear } = getAcademicYear();
  const currentWeek = await prisma.calendarWeek.findFirst({
    where: {
      academicYear,
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      week: true,
    },
  });

  return currentWeek;
}

export async function getWeekByNumber(weekNumber: number) {
  const { year: academicYear } = getAcademicYear();
  const week = await prisma.calendarWeek.findFirst({
    where: {
      academicYear,
      week: {
        number: weekNumber,
      },
    },
    include: {
      week: true,
    },
  });

  return week;
}

export async function getWeeksTillDate(date = new Date()) {
  return await prisma.calendarWeek.findMany({
    where: {
      startDate: { lte: date },
    },
    include: {
      week: true,
    },
    orderBy: {
      week: {
        number: 'asc',
      },
    },
  });
}
