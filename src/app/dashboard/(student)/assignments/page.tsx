import { requireRoles } from '@/lib/server/require-roles';
import { STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Program } from '@prisma/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { getAllPrograms, getCurrentWeek } from '@/features/programs/service';
import { canAccessStudentAssignments } from '@/lib/permissions/helpers';

export default async function StudentAssignmentsPage({}: {
  children: React.ReactNode;
}) {
  const session = await requireRoles(STUDENT_ROLE, SUPERVISOR_ROLE);
  if (!session || !canAccessStudentAssignments(session)) {
    return notFound();
  }

  const levelId = session.currentLevelId;

  const currentWeekResult = await getCurrentWeek();

  if (!currentWeekResult.success || !currentWeekResult.data) {
    return <NoData />;
  }

  const currentWeek = currentWeekResult.data;

  const [assignmentsResult, programsResult] = await Promise.all([
    getWeekAssignments({
      levelId,
      weekId: currentWeek.week.id,
      withAttachments: true,
      programSlug: session.role === SUPERVISOR_ROLE ? 'training' : undefined,
    }),
    getAllPrograms(),
  ]);

  // Handle service errors
  if (!assignmentsResult.success || !programsResult.success) {
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
  const heroTitle = currentWeek?.week.title;
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
      <Suspense fallback={<LoadingSkeleton programs={programsResult.data} />}>
        <StudentAssignmentWrapper
          programs={programsResult.data}
          assignments={assignmentsWithUrls}
          userId={session.userId}
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
    null,
  );

  // Handle service errors gracefully
  const baseStudentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  // Generate signed URLs for student-uploaded files
  const studentAssignmentsWithUrls = await Promise.all(
    baseStudentAssignments.map(async (sa) => {
      if (sa.fileKey) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: sa.fileKey,
        });
        const fileUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        return { ...sa, fileUrl };
      }
      return { ...sa, fileUrl: null };
    }),
  );

  return (
    <AssignmentsGrid
      assignments={assignments}
      studentAssignments={studentAssignmentsWithUrls}
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
