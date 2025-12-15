import { cookies } from 'next/headers';
import { UsersTable } from './table';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/tokens';
import { User } from '../../../../../../prisma/generated';
import prisma from '@/lib/prisma';

export default async function UsersTablePage() {
  const cookie = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  const accessToken = await verifyAccessToken(cookie || '');

  if (!accessToken || accessToken.role !== 'admin') {
    return <div>Unauthorized</div>;
  }
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      role: true,
      birthYear: true,
      country: true,
      status: true,
    },
  });
  return <UsersTable users={users} />;
}
