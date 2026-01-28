import { GroupList } from '@/features/groups/components/shared/group-list';
import { getGroups } from '@/features/groups/service';
import { AccessTokenPayload, ADMIN_ROLE } from '@/types/types';

interface GroupsListSectionProps {
  auth: AccessTokenPayload;
  searchParams: Promise<{ cohortId?: string }>;
}

export async function GroupsListSection({
  auth,
  searchParams,
}: GroupsListSectionProps) {
  const { cohortId } = await searchParams;

  if (!cohortId && auth.role === ADMIN_ROLE) {
    return null;
  }

  const result = await getGroups({
    cohortId: cohortId,
  });

  if (!result.success) {
    return (
      <div className="text-center text-muted-foreground">
        حدث خطأ أثناء تحميل المجموعات
      </div>
    );
  }

  return <GroupList groups={result.data} hrefBase="/dashboard/groups/" />;
}
