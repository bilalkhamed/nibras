import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { InfoSectionSkeleton, TableSkeleton } from '@/components/skeletons';
import GroupInfoSection from './group-info-section';
import GroupStudentsTable, { GroupStudent } from './group-students-table';
import AddStudentDialog from './add-student-dialog';
import prisma from '@/lib/server/prisma';
import { notFound } from 'next/navigation';
import { getGroupById } from '@/features/groups/db';
import getAuthSession from '@/lib/server/auth-session';
import { Role } from '@prisma/client';
import { ADMIN_ROLE } from '@/types/types';

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
        {userRole === ADMIN_ROLE && (
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
  const group = await getGroupById(id);
  const auth = await getAuthSession();
  if (!auth) notFound();
  if (!group) notFound();
  return (
    <div className="space-y-4">
      {/* Group Info Section */}
      <GroupInfoSection
        groupName={group.name}
        cohortId={group.cohortId}
        studentCount={group.students.length}
        supervisor={group.supervisor}
        cohort={group.cohort}
        userRole={auth.role}
      />

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
