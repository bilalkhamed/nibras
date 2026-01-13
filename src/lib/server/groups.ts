'use cache';

import prisma from './prisma';

export async function getGroupById(groupId: string) {
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
  return group;
}

export async function getGroups(supervisorId?: string) {
  return await prisma.group.findMany({
    where: {
      supervisorId: supervisorId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      cohort: {
        select: {
          currentLevel: true,
          name: true,
        },
      },
      supervisor: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          students: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });
}
