import { getCurrentWeek } from '@/lib/server/weeks';
import { requireRoles } from '@/lib/server/require-roles';
import { STUDENT_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Program } from '@prisma/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAllPrograms } from '@/lib/server/programs';
import { Suspense } from 'react';
import { CardsListSkeleton } from '@/components/skeletons';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AssignmentsGrid,
  WeekHero,
  ProgramFilter,
} from '@/features/assignments/components';
import {
  getWeekAssignments,
  getStudentAssignments,
} from '@/features/assignments/service';
import type { AssignmentWithAttachmentsDTO } from '@/features/assignments/types';

export default async function StudentAssignmentsPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRoles(STUDENT_ROLE);
  if (!auth) {
    return notFound();
  }

  const levelId = auth.currentLevelId;

  const currentWeek = await getCurrentWeek();

  if (!levelId || !currentWeek) {
    return <NoData />;
  }

  const [assignmentsResult, programs] = await Promise.all([
    getWeekAssignments({
      levelId,
      weekId: currentWeek.week.id,
      withAttachments: true,
    }),
    getAllPrograms(),
  ]);

  // Handle service errors
  if (!assignmentsResult.success) {
    return <NoData />;
  }

  const assignmentsWithUrls = await Promise.all(
    assignmentsResult.data.map(async (assignment) => {
      const attachmentsWithUrls = await Promise.all(
        assignment.attachments.map(async (att) => {
          if (att.type === 'FILE' && att.fileKey) {
            const command = new GetObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: att.fileKey,
            });
            return {
              ...att,
              tempUrl: await getSignedUrl(S3, command, { expiresIn: 3600 }),
            };
          }
          return { ...att, tempUrl: att.url! }; // Fallback for links
        }),
      );
      return { ...assignment, attachments: attachmentsWithUrls };
    }),
  );

  const totalAssignments = assignmentsResult.data.length;
  const primaryMessage =
    totalAssignments > 0
      ? `لديك ${totalAssignments} مهمات هذا الأسبوع`
      : 'لا توجد مهام حالياً، استعدي للتحدي القادم';
  const heroTitle = currentWeek?.week.title ?? 'مهام الأسبوع';
  const streakText = 'حافظي على السلسلة';

  const deadlineLabel = currentWeek?.endDate
    ? new Date(currentWeek.endDate).toLocaleDateString('ar-SA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'لم يحدد بعد';

  return (
    <div className="space-y-6">
      <WeekHero
        heroTitle={heroTitle}
        primaryMessage={primaryMessage}
        deadlineLabel={deadlineLabel}
        streakText={streakText}
      />
      <Suspense fallback={<LoadingSkeleton programs={programs} />}>
        <StudentAssignmentWrapper
          programs={programs}
          assignments={assignmentsWithUrls}
          userId={auth.userId}
        />
      </Suspense>
    </div>
  );
}

async function StudentAssignmentWrapper({
  programs,
  assignments,
  userId,
}: {
  programs: Program[];
  assignments: AssignmentWithAttachmentsDTO[];
  userId: string;
}) {
  const studentAssignmentsResult = await getStudentAssignments(
    userId,
    assignments.map((a) => a.id),
  );

  // Handle service errors gracefully
  const studentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  return (
    <AssignmentsGrid
      assignments={assignments}
      studentAssignments={studentAssignments}
      programs={programs}
    />
  );
}

function LoadingSkeleton({ programs }: { programs: Program[] }) {
  return (
    <div className="space-y-6">
      <ProgramFilter programs={programs} programFilter={'all'} />
      <CardsListSkeleton numberOfCards={3} />
    </div>
  );
}

function NoData() {
  return (
    <Alert variant={'warning'}>
      <AlertTitle>لا توجد مهام حالياً</AlertTitle>
      <AlertDescription>
        لا توجد مهام متاحة في الوقت الحالي. يرجى التحقق مرة أخرى لاحقًا.
      </AlertDescription>
    </Alert>
  );
}
