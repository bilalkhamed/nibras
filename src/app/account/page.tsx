import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import { AccountTabs } from './components';

export default async function AccountPage() {
  return redirect('/account/profile');
}
