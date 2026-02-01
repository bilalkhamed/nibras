import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { InfoSectionSkeleton, TableSkeleton } from '@/components/skeletons';
import { notFound } from 'next/navigation';
import {
  getGroupById,
  GroupInfoSection,
  GroupStudentsTable,
  AddStudentDialog,
  type GroupStudent,
} from '@/features/groups';
import getAuthSession from '@/lib/server/auth-session';
import { Role } from '@prisma/client';
import { ADMIN_ROLE, COHORT_MANAGER_ROLE } from '@/types/types';

async function GroupStudentsSection({
  groupId,
  groupStudents,
  cohortId,
  cohortName,
  userRole,
}: {
  groupId: string;
  groupStudents: GroupStudent[];
  cohortId: string;
  cohortName: string;
  userRole: Role;
}) {
  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          الطالبات ({groupStudents.length})
        </CardTitle>
        {(userRole === ADMIN_ROLE || userRole === COHORT_MANAGER_ROLE) && (
          <AddStudentDialog
            groupId={groupId}
            cohortId={cohortId}
            cohortName={cohortName}
          />
        )}
      </CardHeader>
      <CardContent>
        <GroupStudentsTable
          userRole={userRole}
          groupId={groupId}
          groupStudents={groupStudents}
        />
      </CardContent>
    </Card>
  );
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<InfoSectionSkeleton />}>
        <GroupDetailWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function GroupDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, auth] = await Promise.all([
    getGroupById(id),
    getAuthSession(),
  ]);

  if (!auth) notFound();
  if (!result.success || !result.data) notFound();

  const group = result.data;

  return (
    <div className="space-y-4">
      {/* Group Info Section */}
      <GroupInfoSection group={group} userRole={auth.role} />

      {/* Students Section with Suspense */}
      <GroupStudentsSection
        groupId={group.id}
        groupStudents={group.students}
        cohortId={group.cohort.id}
        cohortName={group.cohort.name}
        userRole={auth.role}
      />
    </div>
  );
}
