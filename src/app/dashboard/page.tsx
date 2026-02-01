import { redirect } from 'next/navigation';
import { AdminDashboard } from './components/admin-dashboard';
import { SupervisorDashboard } from './components/supervisor-dashboard';
import { StudentDashboard } from './components/student-dashboard';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  STUDENT_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { CohortManagerDashboard } from './components/cohort-manager-dashboard';

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AuthGuard roles={[]}>
        {(auth) => {
          switch (auth.role) {
            case ADMIN_ROLE:
              return <AdminDashboard />;
            case SUPERVISOR_ROLE:
              return <SupervisorDashboard />;
            case STUDENT_ROLE:
              return <StudentDashboard />;
            case COHORT_MANAGER_ROLE:
              return <CohortManagerDashboard />;
            default:
              redirect('/forbidden');
          }
        }}
      </AuthGuard>
    </Suspense>
  );
}
