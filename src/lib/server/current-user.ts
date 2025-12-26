import prisma from './prisma';
import { AccessTokenPayload, CountryCode, User } from '@/types/types';
import getAuthSession from './auth-session';

export async function getCurrentUser(
  authSession?: AccessTokenPayload
): Promise<User | null> {
  const auth = authSession ?? (await getAuthSession());
  if (!auth) return null;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      status: true,
      country: true,
      middleName: true,
      lastName: true,
      birthYear: true,
      createdAt: true,
      updatedAt: true,
      phone: true,
    },
  });

  if (!user) return null;
  return { ...user, country: user.country as CountryCode };
}
