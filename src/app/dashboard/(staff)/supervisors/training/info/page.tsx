import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { InfoSectionSkeleton } from '@/components/skeletons';
import { notFound } from 'next/navigation';
import getAuthSession from '@/lib/server/auth-session';
import { Role } from '@prisma/client';
import { getUsersBasic } from '@/features/users/service';
import { CustomAlert } from '@/components/common/custom-alert';
import { UserBasicDTO } from '@/features/users/types';
import { SupervisorsTable } from '@/features/users/components/';
import { AddSupervisorsDialogue } from '@/features/users/components';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

async function SupervisorsListSection({
  supervisors,
}: {
  supervisors: UserBasicDTO[];
  userRole: Role;
}) {
  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          المشرفات تحت التدريب ({supervisors.length})
        </CardTitle>
        <AddSupervisorsDialogue>
          <Button>إضافة مشرفات للتدريب</Button>
        </AddSupervisorsDialogue>
      </CardHeader>

      <Separator className="w-[95%]! self-center" />
      <CardContent>
        <SupervisorsTable supervisors={supervisors} />
      </CardContent>
    </Card>
  );
}

export default async function GroupDetailPage({}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<InfoSectionSkeleton />}>
        <GroupDetailWrapper />
      </Suspense>
    </div>
  );
}

async function GroupDetailWrapper() {
  const [result, session] = await Promise.all([
    getUsersBasic({ role: 'supervisor', isTraining: true }),
    getAuthSession(),
  ]);

  if (!session) notFound();
  if (!result.success || !result.data) notFound();

  const supervisors = result.data;

  return (
    <div className="space-y-4">
      {/* Group Info Section */}

      {/* Students Section with Suspense */}
      {supervisors.length > 0 ? (
        <div>
          <SupervisorsListSection
            supervisors={supervisors}
            userRole={session.role}
          />
        </div>
      ) : (
        <CustomAlert
          title="لا توجد مشرفات مسجلات في التدريب."
          description="يرجى التواصل مع الإدارة لإضافة مشرفات للتدريب."
          variant="warning"
        />
      )}
    </div>
  );
}
