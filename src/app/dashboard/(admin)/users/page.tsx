import { AddUserForm } from './add-user-form';
import UsersTableSection from './users-table-section';
import { Suspense } from 'react';
import { UsersTableSkeleton } from '@/components/skeletons';
import { Toaster } from '@/components/ui/sonner';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
});

export default async function UsersPage({}) {
  return (
    <>
      <section>
        <AddUserForm />
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
