import { AuthGuard } from '@/components/auth/auth-gaurd';
import { getCurrentWeek } from '@/lib/server/current-week';
import prisma from '@/lib/server/prisma';
import { requireRoles } from '@/lib/server/require-roles';
import { Role, STUDENT_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { id } from 'zod/v4/locales';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard roles={[STUDENT_ROLE]}>{children}</AuthGuard>
    </Suspense>
  );
}
