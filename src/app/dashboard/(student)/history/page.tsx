import {
  getStudentAssignments,
  getWeekAssignments,
} from '@/features/assignments/service';
import getAuthSession from '@/lib/server/auth-session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardsListSkeleton } from '@/components/skeletons';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AssignmentsGrid } from '@/features/assignments/components';
import {
  getAllPrograms,
  getCalendarWeekByNumber,
  getCurrentWeek,
} from '@/features/programs/service';
import { CalendarWeekDTO } from '@/features/programs/types';
import { CustomAlert } from '@/components/common/custom-alert';
import { SUPERVISOR_ROLE } from '@/types/types';

export default async function StudentHistoryPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const weekNumber = (await searchParams).week || undefined;

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <Skeleton className="h-32 w-full  animate-pulse rounded-2xl bg-muted" />
        }
      >
        <WeekProvider weekNumber={Number(weekNumber)}>
          {(week) => (
            <div>
              <WeekInfo week={week} />
              <Suspense
                fallback={<CardsListSkeleton numberOfCards={3} />}
                key={weekNumber}
              >
                <AssignmentsList
                  weekId={week.week.id}
                  weekEndDate={week.endDate}
                />
              </Suspense>
            </div>
          )}
        </WeekProvider>
      </Suspense>
      {/* History content goes here */}
    </div>
  );
}

async function WeekProvider({
  weekNumber,
  children,
}: {
  weekNumber: number;
  children: (week: CalendarWeekDTO) => React.ReactNode;
}) {
  const currentWeekResult = await getCurrentWeek();

  if (!currentWeekResult.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="عذراً، حدث خطأ ما."
        description="فشل في جلب بيانات الأسبوع الحالي من الخادم."
      />
    );
  }

  // If the requested week is in the future, show no data
  if (
    currentWeekResult.data &&
    weekNumber > currentWeekResult.data.week.number
  ) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        لا توجد معلومات متاحة لهذا الأسبوع
      </div>
    );
  }

  if (isNaN(weekNumber) || weekNumber < 1) {
    redirect(`/dashboard/history?week=${currentWeekResult.data?.week.number}`);
  }

  const weekResult = await getCalendarWeekByNumber(weekNumber);

  if (!weekResult.success || !weekResult.data) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        لا توجد معلومات متاحة لهذا الأسبوع
      </div>
    );
  }

  const week = weekResult.data;

  return <>{children(week)}</>;
}

async function WeekInfo({ week }: { week: CalendarWeekDTO }) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">{week.week.title}</h2>
      <p className="text-sm text-muted-foreground">
        {week.startDate.toLocaleDateString('ar-SA')} -{' '}
        {week.endDate.toLocaleDateString('ar-SA')}
      </p>
    </div>
  );
}

async function AssignmentsList({
  weekId,
  weekEndDate,
}: {
  weekId: string;
  weekEndDate: Date;
}) {
  const session = await getAuthSession();
  if (!session) return null;

  const assignmentsResult = await getWeekAssignments({
    levelId: session.currentLevelId,
    weekId: weekId,
    withAttachments: true,
    programFilter: session.role === SUPERVISOR_ROLE ? 'supervisor' : 'student',
  });

  // Handle service errors
  if (!assignmentsResult.success) {
    return null;
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

  const programsResult = await getAllPrograms({
    filter: session.role === SUPERVISOR_ROLE ? 'supervisor' : 'student',
  });
  if (!programsResult.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="عذراً، حدث خطأ ما."
        description="فشل في جلب بيانات البرامج من الخادم."
      />
    );
  }
  const programs = programsResult.data;

  const studentAssignmentsResult = await getStudentAssignments(
    session.userId,
    assignmentsResult.data.map((as) => as.id),
    weekEndDate,
  );

  // Handle service errors gracefully
  const studentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  // Generate signed URLs for student submission files
  const studentAssignmentsWithUrls = await Promise.all(
    studentAssignments.map(async (sa) => {
      let fileUrl: string | null = null;
      if (sa.fileKey) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: sa.fileKey,
          });
          fileUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        } catch (error) {
          console.error('Failed to generate signed URL for submission:', error);
        }
      }

      return {
        ...sa,
        fileUrl,
      };
    }),
  );

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground">المهام</h3>
      <AssignmentsGrid
        assignments={assignmentsWithUrls}
        programs={programs}
        studentAssignments={studentAssignmentsWithUrls}
        view="history"
        studentInfo={{
          id: session.userId,
          name: session.firstName + ' ' + session.lastName,
        }}
      />
    </div>
  );
}
