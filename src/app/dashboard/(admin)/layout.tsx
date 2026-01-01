import { AuthGuard } from '@/components/auth/auth-gaurd';
import { requireRoles } from '@/lib/server/require-roles';
import { ADMIN_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard roles={[ADMIN_ROLE]}>{children}</AuthGuard>;
}
