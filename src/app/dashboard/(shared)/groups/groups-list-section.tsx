import { GroupList } from '@/components/common/group-list';
import { getGroups } from '@/lib/server/groups';
import { AccessTokenPayload, ADMIN_ROLE } from '@/types/types';

export default async function GroupsListSection({
  auth,
}: {
  auth: AccessTokenPayload;
}) {
  const groups = await getGroups(
    auth.role === ADMIN_ROLE ? undefined : auth.userId
  );

  return <GroupList groups={groups} hrefBase="/dashboard/groups/" />;
}
