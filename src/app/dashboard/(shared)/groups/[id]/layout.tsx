import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getGroupById } from '@/features/groups/db';
import { GroupTabsNav } from './group-tabs-nav';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';

type Params = Promise<{ id: string }>;

async function GroupLayoutWrapper({ params }: { params: Params }) {
  const { id } = await params;

  const group = await getGroupById(id);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {group.name}
        </h1>
      </div>

      <GroupTabsNav groupId={id} />
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
        <AuthGuard roles={[SUPERVISOR_ROLE, ADMIN_ROLE]}>
          <GroupLayoutWrapper params={params} />
        </AuthGuard>
      </Suspense>

      <div>{children}</div>
    </div>
  );
}
