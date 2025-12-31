import { getCurrentUser } from '@/lib/server/current-user';
import { Navbar } from './navbar';

export async function NavbarWrapper() {
  const user = await getCurrentUser();
  return <Navbar user={user} />;
}
