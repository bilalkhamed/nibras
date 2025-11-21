import { cookies } from 'next/headers';
import { verifyAccessToken } from './tokens';
import prisma from './prisma';
import { User } from '@/types/types';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload || typeof payload.userId !== 'string') {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthYear: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
