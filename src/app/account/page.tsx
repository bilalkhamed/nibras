import { redirect } from 'next/navigation';

export default async function AccountPage() {
  return redirect('/account/profile');
}
