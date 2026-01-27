import { getAllUsers } from '../service';
import { UsersTable } from './users-table';
import { runServiceOrRedirect } from '@/lib/server/service/helpers';

export async function UsersTableSection() {
  const res = await runServiceOrRedirect(getAllUsers);

  if (!res.success) {
    return <div>Failed to load users.</div>;
  }

  const users = res.data;

  return <UsersTable users={users} />;
}
