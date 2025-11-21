import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import { AccountTabs } from '@/components/account/AccountTabs';

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <AccountTabs user={user} />;
}
