import { Suspense } from 'react';
import { CardsListSkeleton } from '@/components/skeletons';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import {
  CreateGroupDialog,
  CohortNavigator,
  CohortNavigatorWrapper,
  GroupsListSection,
} from '@/features/groups';

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ cohortId?: string }>;
}) {
  const { cohortId } = await searchParams;

  return (
    <Suspense fallback={<CardsListSkeleton />}>
      <AuthGuard roles={[ADMIN_ROLE, COHORT_MANAGER_ROLE, SUPERVISOR_ROLE]}>
        {(auth) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
              {auth.role === ADMIN_ROLE && <CreateGroupDialog />}
            </div>

            {auth.role === ADMIN_ROLE && (
              <Suspense fallback={<CohortNavigator cohorts={[]} />}>
                <CohortNavigatorWrapper />
              </Suspense>
            )}
            <Suspense key={cohortId} fallback={<CardsListSkeleton />}>
              <GroupsListSection auth={auth} searchParams={searchParams} />
            </Suspense>
          </div>
        )}
      </AuthGuard>
    </Suspense>
  );
}
