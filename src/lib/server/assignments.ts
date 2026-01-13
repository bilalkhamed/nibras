import { cacheTag } from 'next/cache';
import prisma from './prisma';
import { getProgramBySlug } from './programs';

export async function getWeekAssignments(
  levelId: string,
  weekId: string,
  programSlug?: string
) {
  'use cache';
  const program = programSlug ? await getProgramBySlug(programSlug) : undefined;
  if (!program) {
    return [];
  }

  cacheTag(
    `assignments-level-${levelId}-week-${weekId}-program-${program?.id}`
  );

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
      attachments: true,
    },
  });

  return assignments;
}

export async function getStudentAssignments(
  studentId: string,
  assignmentIds: string[]
) {
  const studentAssignments = await prisma.studentAssignment.findMany({
    where: {
      studentId: studentId,
      assignmentId: {
        in: assignmentIds,
      },
    },
  });
  return studentAssignments;
}

export async function getManyStudentAssignments(
  studentIds: string[],
  assignmentIds: string[]
) {
  const studentAssignments = await prisma.studentAssignment.findMany({
    where: {
      studentId: {
        in: studentIds,
      },
      assignmentId: {
        in: assignmentIds,
      },
    },
  });
  return studentAssignments;
}
