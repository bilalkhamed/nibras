import { UsersTable } from './table';
import { CountryCode } from '@/types/types';
import { getAllUsers } from '@/lib/server/users';

export default async function UsersTableSection() {
  const users = await getAllUsers();

  return (
    <UsersTable
      users={users.map((u) => ({ ...u, country: u.country as CountryCode }))}
    />
  );
}
