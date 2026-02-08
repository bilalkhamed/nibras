import { Suspense } from 'react';
import { GroupTabsNav } from '@/features/groups';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  GROUP_MANAGER_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';

async function GroupLayoutWrapper() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          تدريب المشرفات
        </h1>
      </div>

      <GroupTabsNav hrefBase={`/dashboard/supervisors/training/`} />
    </div>
  );
}

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={<Skeleton className="h-16 animate-pulse rounded bg-muted" />}
      >
        <AuthGuard
          roles={[
            ADMIN_ROLE,
            COHORT_MANAGER_ROLE,
            GROUP_MANAGER_ROLE,
            SUPERVISOR_ROLE,
          ]}
        >
          <GroupLayoutWrapper />
        </AuthGuard>
      </Suspense>

      <div>{children}</div>
    </div>
  );
}
