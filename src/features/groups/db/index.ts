'use cache';

import prisma from '@/lib/server/prisma';

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

type GetGroupsOptions = {
  supervisorId?: string;
  cohortId?: string;
};

export async function getGroups(options: GetGroupsOptions = {}) {
  return await prisma.group.findMany({
    where: {
      supervisorId: options.supervisorId,
      cohortId: options.cohortId,
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
          id: true,
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
