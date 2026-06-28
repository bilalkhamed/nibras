import { Suspense } from 'react';
import { CardsListSkeleton } from '@/components/skeletons';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  GROUP_MANAGER_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import {
  CreateGroupSheet,
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
      <AuthGuard
        roles={[
          ADMIN_ROLE,
          'director',
          COHORT_MANAGER_ROLE,
          GROUP_MANAGER_ROLE,
          SUPERVISOR_ROLE,
        ]}
      >
        {(session) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
              {(session.role === ADMIN_ROLE ||
                session.role === COHORT_MANAGER_ROLE) && (
                <CreateGroupSheet
                  cohortId={session.managedCohortId || undefined}
                />
              )}
            </div>

            {(session.role === ADMIN_ROLE || session.role === 'director') && (
              <Suspense fallback={<CohortNavigator cohorts={[]} />}>
                <CohortNavigatorWrapper />
              </Suspense>
            )}
            <Suspense key={cohortId} fallback={<CardsListSkeleton />}>
              <GroupsListSection auth={session} searchParams={searchParams} />
            </Suspense>
          </div>
        )}
      </AuthGuard>
    </Suspense>
  );
}
