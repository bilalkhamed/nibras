import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { getProgramBySlug } from '@/lib/server/programs';
import { Assignment, AssignmentAttachment } from '@prisma/client';

type BaseOptions = {
  levelId: string;
  weekId: string;
  programSlug?: string;
};

export async function getWeekAssignments(
  options: BaseOptions & { withAttachments: false },
): Promise<Assignment[]>;

export async function getWeekAssignments(
  options: BaseOptions & { withAttachments?: true },
): Promise<(Assignment & { attachments: AssignmentAttachment[] })[]>;

export async function getWeekAssignments({
  levelId,
  weekId,
  programSlug,
  withAttachments = true,
}: BaseOptions & { withAttachments?: boolean }): Promise<
  (Assignment & { attachments: AssignmentAttachment[] })[]
> {
  'use cache';
  const program = programSlug ? await getProgramBySlug(programSlug) : undefined;

  const tags = [
    `assignments-level-${levelId}-week-${weekId}-program-${program?.id}`,
  ];
  if (!program) tags.push(`assignments-level-${levelId}-week-${weekId}`);
  cacheTag(...tags);

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
      attachments: withAttachments,
    },
  });

  return assignments;
}

export async function getStudentAssignments(
  studentId: string,
  assignmentIds: string[],
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
  assignmentIds: string[],
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
    include: {
      markedBy: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
  });
  return studentAssignments;
}
