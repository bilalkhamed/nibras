import { AuthGuard } from '@/components/auth/auth-gaurd';
import { ADMIN_ROLE, COHORT_MANAGER_ROLE } from '@/types/types';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roles={[ADMIN_ROLE, COHORT_MANAGER_ROLE]}>{children}</AuthGuard>
  );
}
