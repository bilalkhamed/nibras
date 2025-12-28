import { GroupList } from '@/components/common/group-list';
import prisma from '@/lib/server/prisma';
import { AccessTokenPayload, ADMIN_ROLE } from '@/types/types';

export default async function GroupsListSection({
  auth,
}: {
  auth: AccessTokenPayload;
}) {
  const groups = await prisma.group.findMany({
    where: {
      supervisorId: auth.role === ADMIN_ROLE ? undefined : auth.userId,
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

  return <GroupList groups={groups} hrefBase="/dashboard/groups/" />;
}
