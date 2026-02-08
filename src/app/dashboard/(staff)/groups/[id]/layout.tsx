import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getGroupById, GroupTabsNav } from '@/features/groups';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  GROUP_MANAGER_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';

type Params = Promise<{ id: string }>;

async function GroupLayoutWrapper({ params }: { params: Params }) {
  const { id } = await params;

  const result = await getGroupById(id);
  if (!result.success || !result.data) notFound();

  const group = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {group.name}
        </h1>
      </div>

      <GroupTabsNav hrefBase={`/dashboard/groups/${id}`} />
    </div>
  );
}

export default function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
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
          <GroupLayoutWrapper params={params} />
        </AuthGuard>
      </Suspense>

      <div>{children}</div>
    </div>
  );
}
