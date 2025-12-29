import getAuthSession from '@/lib/server/auth-session';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './components/admin-dashboard';
import { SupervisorDashboard } from './components/supervisor-dashboard';
import { StudentDashboard } from './components/student-dashboard';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';

export default async function DashboardPage() {
  const auth = await getAuthSession();

  if (!auth) {
    redirect('/login');
  }

  // Role-based dashboard rendering
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
}
