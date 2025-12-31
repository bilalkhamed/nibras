import getAuthSession from '@/lib/server/auth-session';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './components/admin-dashboard';
import { SupervisorDashboard } from './components/supervisor-dashboard';
import { StudentDashboard } from './components/student-dashboard';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Suspense } from 'react';

export default async function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading in dashboard/page...</div>}>
      <AuthGuard roles={[]}>
        {(auth) => {
          switch (auth.role) {
            case ADMIN_ROLE:
              return <AdminDashboard />;
            case SUPERVISOR_ROLE:
              return <SupervisorDashboard />;
            case STUDENT_ROLE:
              return <StudentDashboard />;
            default:
              redirect('/forbidden');
          }
        }}
      </AuthGuard>
    </Suspense>
  );
}
