import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import getAuthSession from '@/lib/auth-session';
import { TriangleAlertIcon } from 'lucide-react';
import LogoutButton from './logout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'تم تعليق الحساب',
};

export default async function SuspendedPage() {
  const auth = await getAuthSession();

  if (!auth) return redirect('/');
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="w-[25%] max-w-sm ">
        <TriangleAlertIcon scale={2} />
        <AlertTitle className=" font-bold">نأسف!</AlertTitle>
        <AlertDescription>
          <p>تم تعليق حسابك مؤقتًا.</p>
          <p>يرجى التواصل مع الإدارة لحل المشكلة.</p>
        </AlertDescription>
        <LogoutButton />
      </Alert>
    </div>
  );
}
