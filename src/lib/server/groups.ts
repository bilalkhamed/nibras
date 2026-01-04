'use cache';

import prisma from './prisma';

let counter = 0;

export async function getGroupById(groupId: string) {
  console.log('Fetching group with ID:', groupId);
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      supervisor: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
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
          joinedAt: true,
        },
      },
      cohort: {
        include: {
          currentLevel: true,
        },
      },
    },
  });
  console.log(`Fetched group #${++counter}:`, group!.name);
  return group;
}
