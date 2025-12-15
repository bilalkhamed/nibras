import { GroupList } from '@/components/group-list';
import prisma from '@/lib/prisma';

export default async function GroupsListSection() {
  const t0 = performance.now();
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      cohortId: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      supervisor: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
  });

  const t1 = performance.now();

  console.log(`Time taken to fetch groups list: ${t1 - t0} milliseconds.`);

  return (
    <GroupList
      groups={groups.map((g) => ({
        ...g,
        _count: {
          students: 2,
        },
      }))}
      hrefBase="/dashboard/groups/"
    />
  );
}
