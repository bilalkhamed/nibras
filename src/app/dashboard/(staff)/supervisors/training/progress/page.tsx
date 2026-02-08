import { Suspense } from 'react';
import { InfoSectionSkeleton } from '@/components/skeletons';
import {
  getManyStudentAssignments,
  getWeekAssignments,
} from '@/features/assignments/service';
import type { AssignmentStatus, StudentProgress } from '@/features/groups';
import { StudentProgressContainer } from '@/features/groups';
import { notFound } from 'next/navigation';
import { WeekNavigator } from '@/components/common/week-navigator';
import getAuthSession from '@/lib/server/auth-session';
import {
  getCalendarWeekByNumber,
  getCurrentWeek,
  getWeeksTillDate,
} from '@/features/programs/service';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUsersBasic } from '@/features/users/service';
import { CustomAlert } from '@/components/common/custom-alert';

type SearchParams = Promise<{ week?: string }> | { week?: string };

export default function GroupProgressPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<WeekNavigator weeks={[]} />}>
        <WeekNavigatorContainer />
      </Suspense>

      <Suspense fallback={<InfoSectionSkeleton />}>
        <StudentsAssignmentsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function StudentsAssignmentsList({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const { week } = (await searchParams) || {};

  const [session, supervisorsResult] = await Promise.all([
    getAuthSession(),
    getUsersBasic({ role: 'supervisor', isTraining: true }),
  ]);

  if (!supervisorsResult.success)
    return (
      <CustomAlert
        title="عذرًا، حدث خطأ أثناء جلب بيانات المشرفات."
        description={`رمز الخطأ: ${supervisorsResult.error.statusCode}`}
      />
    );

  const currentUserName = session
    ? `${session.firstName} ${session.lastName}`
    : 'مشرف';
  const currentWeekResult = await getCurrentWeek();
  if (!currentWeekResult.success || !currentWeekResult.data) notFound(); // TODO: handle error properly
  // FIX: remove current week dependency (to support when there is no current week)

  const parsedWeek = Number(week);

  // here we are checking if either the week is invalid OR a future week
  const isInvalidWeek = Number.isNaN(parsedWeek) || parsedWeek < 1;
  const isFutureWeek =
    !isInvalidWeek && parsedWeek > currentWeekResult.data.week.number;

  // if it is , default to current week
  const targetWeekNumber =
    isInvalidWeek || isFutureWeek
      ? currentWeekResult.data.week.number
      : parsedWeek;
  // fetch the target week from DB
  const targetWeekResult = await getCalendarWeekByNumber(targetWeekNumber);
  const targetWeek =
    targetWeekResult.success && targetWeekResult.data
      ? targetWeekResult.data
      : null;
  const selectedWeek = targetWeek ?? currentWeekResult.data;

  const weekId = selectedWeek.week.id;

  const assignmentsResult = await getWeekAssignments({
    levelId: null,
    weekId: weekId,
    withAttachments: false,
    programFilter: 'supervisor',
  });

  // Handle service errors
  const assignments = assignmentsResult.success ? assignmentsResult.data : [];

  const studentAssignmentsResult = await getManyStudentAssignments(
    supervisorsResult.data.map((s) => s.id),
    assignments.map((as) => as.id),
    selectedWeek.endDate,
  );

  // Handle service errors gracefully
  const studentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  // Generate presigned URLs for student submissions with fileKey
  const studentAssignmentsWithUrls = await Promise.all(
    studentAssignments.map(async (sa) => {
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

  const assignmentStatusMap = studentAssignmentsWithUrls.reduce<
    Record<
      string,
      Record<
        string,
        AssignmentStatus & {
          fileKey?: string | null;
          fileUrl?: string | null;
          textSubmission?: string | null;
        }
      >
    >
  >((acc, sa) => {
    if (!acc[sa.studentId]) acc[sa.studentId] = {};
    acc[sa.studentId][sa.assignmentId] = {
      isCompleted: sa.isCompleted,
      completedAt: sa.completedAt,
      markedBy: sa.markedBy,
      isOverdue: sa.isOverdue,
      fileKey: sa.fileKey,
      fileUrl: sa.fileUrl,
      textSubmission: sa.textSubmission,
      score: sa.score,
      comment: sa.comment,
    };
    return acc;
  }, {});

  const studentsProgress = supervisorsResult.data.map((sup) => {
    const completedCount = assignments.reduce((count, assignment) => {
      const isCompleted =
        assignmentStatusMap[sup.id]?.[assignment.id]?.isCompleted ?? false;
      return count + (isCompleted ? 1 : 0);
    }, 0);

    const status: 'warning' | 'pending' | 'done' =
      assignments.length === 0
        ? 'warning'
        : completedCount === 0
          ? 'warning'
          : completedCount === assignments.length
            ? 'done'
            : 'pending';

    const studentName = `${sup.firstName} ${
      sup.middleName ?? ''
    } ${sup.lastName}`.trim();

    return {
      id: sup.id,
      name: studentName,
      completedCount,
      totalAssignments: assignments.length,
      status,
      assignmentStatuses: assignmentStatusMap[sup.id] || {},
    } satisfies StudentProgress;
  });

  return (
    <div className="space-y-4">
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">
          {selectedWeek.week?.title || 'الأسبوع الحالي'}
        </h2>
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          {selectedWeek.startDate.toLocaleDateString('ar-SA')} -{' '}
          {selectedWeek.endDate.toLocaleDateString('ar-SA')}
        </p>
      </div>

      {supervisorsResult.data.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          لا توجد مشرفات
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          لا توجد مهام لهذا الأسبوع
        </div>
      ) : (
        <StudentProgressContainer
          assignments={assignments}
          students={studentsProgress}
          currentUserName={currentUserName}
          weekEndDate={selectedWeek.endDate}
        />
      )}
    </div>
  );
}

// just to load weeks then pass to WeekNavigator
async function WeekNavigatorContainer() {
  const [weeksResult, currentWeekResult] = await Promise.all([
    getWeeksTillDate(),
    getCurrentWeek(),
  ]);

  if (!weeksResult.success) {
    return <WeekNavigator weeks={[]} />;
  }

  const mappedWeeks = weeksResult.data
    .map((w) => ({ id: w.week.id, number: w.week.number, title: w.week.title }))
    .sort((a, b) => a.number - b.number);

  return (
    <WeekNavigator
      weeks={mappedWeeks}
      currentWeekNumber={
        currentWeekResult.success && currentWeekResult.data
          ? currentWeekResult.data.week.number
          : undefined
      }
    />
  );
}
