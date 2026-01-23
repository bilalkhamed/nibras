import GroupsListSection from './groups-list-section';
import { Suspense } from 'react';
import { CardsListSkeleton } from '@/components/skeletons';
import CreateGroupDialog from './create-group-dialog';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { CohortNavigator } from './cohort-navigator';
import { CohortNavigatorWrapper } from './cohort-navigator-wrapper';

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ cohortId?: string }>;
}) {
  const { cohortId } = await searchParams;

  return (
    <Suspense fallback={<CardsListSkeleton />}>
      <AuthGuard roles={[ADMIN_ROLE, SUPERVISOR_ROLE]}>
        {(auth) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
              {auth.role === ADMIN_ROLE && <CreateGroupDialog />}
            </div>

            <Suspense fallback={<CohortNavigator cohorts={[]} />}>
              <CohortNavigatorWrapper />
            </Suspense>
            <Suspense key={cohortId} fallback={<CardsListSkeleton />}>
              <GroupsListSection auth={auth} searchParams={searchParams} />
            </Suspense>
          </div>
        )}
      </AuthGuard>
    </Suspense>
  );
}
