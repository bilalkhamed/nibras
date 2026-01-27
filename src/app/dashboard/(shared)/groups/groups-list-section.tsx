import { GroupList } from '@/components/common/group-list';
import { getGroups } from '@/features/groups/db';
import { AccessTokenPayload, ADMIN_ROLE } from '@/types/types';

export default async function GroupsListSection({
  auth,
  searchParams,
}: {
  auth: AccessTokenPayload;
  searchParams: Promise<{ cohortId?: string }>;
}) {
  const { cohortId } = await searchParams;

  if (!cohortId && auth.role === ADMIN_ROLE) {
    return;
  }

  const groups = await getGroups({
    supervisorId: auth.role === ADMIN_ROLE ? undefined : auth.userId,
    cohortId: cohortId,
  });

  return <GroupList groups={groups} hrefBase="/dashboard/groups/" />;
}
