import GroupsListSection from './groups-list-section';
import { Suspense } from 'react';
import { CardsListSkeleton } from '@/components/skeletons';
import CreateGroupDialog from './create-group-dialog';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';

export default async function GroupsPage() {
  return (
    <Suspense fallback={<CardsListSkeleton />}>
      <AuthGuard roles={[ADMIN_ROLE, SUPERVISOR_ROLE]}>
        {(auth) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
              {auth.role === ADMIN_ROLE && <CreateGroupDialog />}
            </div>

            <Suspense fallback={<CardsListSkeleton />}>
              <GroupsListSection auth={auth} />
            </Suspense>
          </div>
        )}
      </AuthGuard>
    </Suspense>
  );
}
