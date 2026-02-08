import getAuthSession from '@/lib/server/auth-session';
import { Navbar } from './navbar';

export async function NavbarWrapper() {
  const session = await getAuthSession();
  return <Navbar session={session} />;
}
