import { AccessTokenPayload, CountryCode } from '@/types/types';
import getAuthSession from './auth-session';
import { getUserById } from '@/features/users/service';
import { UserDTO } from '@/features/users/types';

export async function getCurrentUser(
  authSession?: AccessTokenPayload,
): Promise<UserDTO | null> {
  const auth = authSession ?? (await getAuthSession());
  if (!auth) return null;

  const resposne = await getUserById(auth.userId);

  if (!resposne.success) return null;

  const user = resposne.data;

  if (!user) return null;
  return { ...user, country: user.country as CountryCode };
}
