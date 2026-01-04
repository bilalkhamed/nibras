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
