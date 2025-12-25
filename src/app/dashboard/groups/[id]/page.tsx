import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { TableSkeleton } from '@/components/skeletons';
import GroupInfoSection from './group-info-section';
import GroupStudentsTable, { GroupStudent } from './group-students-table';
import AddStudentDialog from './add-student-dialog';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});

async function GroupStudentsSection({
  groupId,
  groupStudents,
  cohortId,
  cohortName,
}: {
  groupId: string;
  groupStudents: GroupStudent[];
  cohortId: string;
  cohortName: string;
}) {
  // TODO: Replace with actual data fetching
  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          الطالبات ({groupStudents.length})
        </CardTitle>
        <AddStudentDialog
          groupId={groupId}
          cohortId={cohortId}
          cohortName={cohortName}
        />
      </CardHeader>
      <CardContent>
        <GroupStudentsTable groupId={groupId} groupStudents={groupStudents} />
      </CardContent>
    </Card>
  );
}

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const t0 = performance.now();
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      supervisor: {
        select: { id: true, firstName: true, middleName: true, lastName: true },
      },
      cohort: {
        select: { id: true, name: true, currentLevel: true },
      },
      students: {
        where: { isActive: true },
        select: {
          joinedAt: true,
          student: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const t1 = performance.now();

  console.log(`Time taken to fetch group data: ${t1 - t0} milliseconds.`);

  if (!group) notFound();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {group.name}
        </h1>
      </div>

      {/* Group Info Section */}
      <GroupInfoSection
        groupName={group.name}
        cohortId={group.cohortId}
        studentCount={group.students.length}
        supervisor={group.supervisor}
        cohort={group.cohort}
      />

      {/* Students Section with Suspense */}
      <GroupStudentsSection
        groupId={group.id}
        groupStudents={group.students}
        cohortId={group.cohort.id}
        cohortName={group.cohort.name}
      />

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
