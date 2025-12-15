import prisma from './prisma';
import { AccessTokenPayload, User } from '@/types/types';
import getAuthSession from './auth-session';

export async function getCurrentUser(authSession?: AccessTokenPayload) {
  const auth = authSession ?? (await getAuthSession());
  if (!auth) return null;

  const user: User | null = await prisma.user.findUnique({
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

  return user;
}
