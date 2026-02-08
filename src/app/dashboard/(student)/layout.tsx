import { AuthGuard } from '@/components/auth/auth-gaurd';
import { STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { Suspense } from 'react';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard roles={[STUDENT_ROLE, SUPERVISOR_ROLE]}>{children}</AuthGuard>
    </Suspense>
  );
}
