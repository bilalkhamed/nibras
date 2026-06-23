import { AuthGuard } from '@/components/auth/auth-gaurd';
import { STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthGuard roles={[STUDENT_ROLE, SUPERVISOR_ROLE]}>{children}</AuthGuard>
    </Suspense>
  );
}
