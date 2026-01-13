import { AuthGuard } from '@/components/auth/auth-gaurd';
import { ADMIN_ROLE } from '@/types/types';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard roles={[ADMIN_ROLE]}>{children}</AuthGuard>;
}
