import { AddUserForm, UsersTableSection } from '@/features/users/components';
import { Suspense } from 'react';
import { UsersTableSkeleton } from '@/components/skeletons';
import { Toaster } from '@/components/ui/sonner';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import getAuthSession from '@/lib/server/auth-session';
import { ADMIN_ROLE } from '@/types/types';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
});

export default async function UsersPage({}) {
  return (
    <>
      <section>
        <Suspense fallback={'fetching form'}>
          <AddUserFormContainer />
        </Suspense>
        <Toaster
          richColors
          className="rounded-2xl"
          position="top-center"
          style={{
            fontFamily: ibmPlexSansArabic.style.fontFamily,
            borderRadius: '1rem',
          }}
        />
      </section>
      <Suspense
        fallback={
          <div className="mt-8">
            <UsersTableSkeleton />
          </div>
        }
      >
        <section className="mt-8">
          <UsersTableSection />
        </section>
      </Suspense>
    </>
  );
}

async function AddUserFormContainer() {
  const session = await getAuthSession();

  if (!session) return null;

  return session.role === ADMIN_ROLE ? (
    <AddUserForm />
  ) : (
    <AddUserForm cohortId={session.managedCohortId!} />
  );
}
