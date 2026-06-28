import { redirect } from 'next/navigation';
import { AdminDashboard } from './components/admin-dashboard';
import { SupervisorDashboard } from './components/supervisor-dashboard';
import { StudentDashboard } from './components/student-dashboard';
import {
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
  GROUP_MANAGER_ROLE,
  STUDENT_ROLE,
  SUPERVISOR_ROLE,
} from '@/types/types';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { CohortManagerDashboard } from './components/cohort-manager-dashboard';
import { GroupManagerDashboard } from './components/group-manager-dashboard';
import { Role } from '@prisma/client';

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
            case GROUP_MANAGER_ROLE:
              return <GroupManagerDashboard />;
            case 'media_team':
              return <h3>hi media</h3>;
            case Role.program_manager:
              return redirect('/dashboard/programs');
            // return <ProgramManagerDashboard />;
            default:
              redirect('/forbidden');
          }
        }}
      </AuthGuard>
    </Suspense>
  );
}
