import { cookies } from 'next/headers';
import { AddUserForm } from '../add-user-form';
import { UsersTable } from '../users-table';
import { ACCESS_TOKEN_COOKIE } from '@/lib/tokens';

type User = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role: string;
  birthYear: number;
};

export default async function UsersSection() {
  const cookie = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  const users = await fetch('http://localhost:3000/api/users', {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      Cookie: `${ACCESS_TOKEN_COOKIE}=${cookie}`,
    },
  })
    .then(async (res) => (await res.json()).users as User[])
    .catch(() => []); // fallback if API not ready

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <AddUserForm />
      <UsersTable users={users} />
    </section>
  );
}
