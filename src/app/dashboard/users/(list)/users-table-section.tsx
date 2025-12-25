import { cookies } from 'next/headers';
import { UsersTable } from './table';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/tokens';
import prisma from '@/lib/prisma';
import { CountryCode } from '@/types/types';

export default async function UsersTableSection() {
  //dummy wait
  await new Promise((resolve) => setTimeout(resolve, 1000));
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
      createdAt: true,
      updatedAt: true,
      phone: true,
      cohort: { select: { id: true, name: true } },
    },
  });

  return (
    <UsersTable
      users={users.map((u) => ({ ...u, country: u.country as CountryCode }))}
    />
  );
}
