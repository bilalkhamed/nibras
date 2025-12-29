import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GroupsListSection from './groups-list-section';
import { Suspense } from 'react';
import { GroupsListSkeleton } from '@/components/skeletons';
import CreateGroupDialog from './create-group-dialog';
import { Toaster } from '@/components/ui/sonner';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import getAuthSession from '@/lib/server/auth-session';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { requireRoles } from '@/lib/server/require-roles';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});

export default async function GroupsPage() {
  const auth = await requireRoles(ADMIN_ROLE, SUPERVISOR_ROLE);

  if (!auth) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
        {auth.role === ADMIN_ROLE && <CreateGroupDialog />}
      </div>

      {/* <Card className="border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            تصفية الدفعات
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {cohorts.map((cohort) => (
            <Button key={cohort} variant="outline" className="border-border">
              {cohort}
            </Button>
          ))}
          <Button variant="ghost" className="text-muted-foreground">
            إزالة التصفية
          </Button>
        </CardContent>
      </Card> */}

      <Suspense fallback={<GroupsListSkeleton />}>
        <GroupsListSection auth={auth} />
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
    </div>
  );
}
