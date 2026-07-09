import UserInfoSection from './user-info-section';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { XIcon } from 'lucide-react';
import getAuthSession from '@/lib/server/auth-session';
import Link from 'next/link';
import GroupInfoSection from './group-info-section';
import StudentProfileSection from './student-profile-section';
import { Suspense } from 'react';
import { InfoSectionSkeleton } from '@/components/skeletons';

export default async function ProfilePage() {
  const auth = await getAuthSession();

  if (!auth) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <XIcon className="h-5 w-5 text-destructive" />
        <AlertTitle>حدث خطأ</AlertTitle>
        <AlertDescription>
          عذرًا، لم نتمكن من توثيق هويتك. يرجى{' '}
          <Link href="/login" className="underline ml-1">
            تسجيل الدخول
          </Link>{' '}
          مرة أخرى للوصول إلى صفحة الملف الشخصي الخاصة بك.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<InfoSectionSkeleton />}>
        <UserInfoSection />
      </Suspense>
      {auth.role === 'student' && (
        <Suspense fallback={<InfoSectionSkeleton />}>
          <StudentProfileSection />
        </Suspense>
      )}
      {auth.role === 'student' && (
        <Suspense fallback={<InfoSectionSkeleton />}>
          <GroupInfoSection auth={auth} />
        </Suspense>
      )}
    </div>
  );
}
