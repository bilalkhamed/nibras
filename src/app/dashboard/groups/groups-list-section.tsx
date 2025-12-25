import { GroupList } from '@/components/group-list';
import prisma from '@/lib/prisma';

export default async function GroupsListSection() {
  const groups = await prisma.group.findMany({
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

  return <GroupList groups={groups} hrefBase="/dashboard/groups/" />;
}
