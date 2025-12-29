import { requireRoles } from '@/lib/server/require-roles';
import { ADMIN_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRoles(ADMIN_ROLE);
  if (!auth) {
    return notFound();
  }
  console.log(auth);
  return <>{children}</>;
}
