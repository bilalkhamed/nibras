'use cache';

import prisma from './prisma';
import { getProgramBySlug } from './programs';

export async function getWeekAssignments(
  levelId: string,
  weekId: string,
  programSlug?: string
) {
  const program = programSlug ? await getProgramBySlug(programSlug) : undefined;

  const assignments = await prisma.assignment.findMany({
    where: {
      programId: program?.id,
      levelId: levelId,
      weekId: weekId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      program: true,
    },
  });

  return assignments;
}
