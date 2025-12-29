import { Role } from '@/types/types';
import getAuthSession from './auth-session';

export async function requireRoles(...roles: Role[]) {
  const auth = await getAuthSession();

  if (!auth || !roles.includes(auth.role)) {
    return null;
  }

  return auth;
}
