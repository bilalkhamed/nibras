import getAuthSession from '@/lib/server/auth-session';
import { AccessTokenPayload } from '@/types/types';
import { Role } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';

export async function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode | ((auth: AccessTokenPayload) => React.ReactNode);
  roles: Role[];
}) {
  const auth = await getAuthSession();

  if (!auth) {
    return redirect('/login');
  }

  if (roles.length > 0) {
    const hasRole = roles.includes(auth.role);
    if (!hasRole) {
      return notFound();
    }
  }

  if (typeof children === 'function') {
    return <>{children(auth)}</>;
  }

  return <>{children}</>;
}
