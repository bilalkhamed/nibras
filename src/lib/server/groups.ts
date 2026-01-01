'use cache';

import prisma from './prisma';

export async function getGroupById(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      supervisor: true,
      students: {
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      },
      cohort: {
        include: {
          currentLevel: true,
        },
      },
    },
  });
  return group;
}
