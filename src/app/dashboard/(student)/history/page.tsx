import {
  getStudentAssignments,
  getWeekAssignments,
} from '@/features/assignments/service';
import getAuthSession from '@/lib/server/auth-session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AssignmentTypes } from '@prisma/client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  PlayCircle,
  ClipboardList,
  HelpCircle,
  CheckCheckIcon,
  ClockIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentsTableSkeleton } from '@/components/skeletons';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AttachmentsCell,
  SubmissionViewerSheet,
} from '@/features/assignments/components';
import {
  getAllPrograms,
  getCalendarWeekByNumber,
  getCurrentWeek,
} from '@/features/programs/service';
import { CalendarWeekDTO } from '@/features/programs/types';
import { CustomAlert } from '@/components/common/custom-alert';
import { formatDate } from '@/lib/shared/utils';
import { Button } from '@/components/ui/button';
import { SUPERVISOR_ROLE } from '@/types/types';

const ASSIGNMENT_TYPE_LABELS: Record<AssignmentTypes, string> = {
  lecture: 'محاضرة',
  exercise: 'تمرين',
  quiz: 'اختبار',
  reading: 'قراءة',
};

const ASSIGNMENT_TYPE_ICONS: Record<AssignmentTypes, React.ReactElement> = {
  lecture: <PlayCircle className="h-4 w-4" />, // محاضرة
  exercise: <ClipboardList className="h-4 w-4" />, // تمرين
  quiz: <HelpCircle className="h-4 w-4" />, // اختبار
  reading: <BookOpen className="h-4 w-4" />, // قراءة
};

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
          {(week, isCurrentWeek) => (
            <div>
              <WeekInfo week={week} />
              <Suspense
                fallback={<AssignmentsTableSkeleton />}
                key={weekNumber}
              >
                <AssignmentsList
                  weekId={week.week.id}
                  weekEndDate={week.endDate}
                  isCurrentWeek={isCurrentWeek}
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
  children: (week: CalendarWeekDTO, isCurrentWeek: boolean) => React.ReactNode;
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

  const currentWeek = currentWeekResult.success ? currentWeekResult.data : null;

  const isCurrentWeek =
    !!currentWeek && currentWeek.week.number === week.week.number;

  return <>{children(week, isCurrentWeek)}</>;
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
  isCurrentWeek,
}: {
  weekId: string;
  weekEndDate: Date;
  isCurrentWeek: boolean;
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

  const programById = programs.reduce<Record<string, string>>(
    (acc, program) => {
      acc[program.id] = program.name;
      return acc;
    },
    {},
  );

  const studentAssignmentsResult = await getStudentAssignments(
    session.userId,
    assignmentsResult.data.map((as) => as.id),
    weekEndDate,
  );

  // Handle service errors gracefully
  const studentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  const assignmentStatusMap: Record<
    string,
    {
      isCompleted: boolean;
      isOverdue: boolean;
      completedAt: Date | null;
      score: number | null;
      comment: string | null;
      fileKey: string | null;
      fileUrl: string | null;
      textSubmission: string | null;
    }
  > = {};

  // Generate signed URLs for student submission files
  await Promise.all(
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

      assignmentStatusMap[sa.assignmentId] = {
        isCompleted: sa.isCompleted,
        isOverdue: sa.isOverdue,
        completedAt: sa.completedAt,
        score: sa.score,
        comment: sa.comment,
        fileKey: sa.fileKey,
        fileUrl,
        textSubmission: sa.textSubmission,
      };
    }),
  );

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground">المهام</h3>
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        <Table>
          <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right font-semibold">المهمة</TableHead>
              <TableHead className="text-right font-semibold">
                البرنامج
              </TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">
                التقييم
              </TableHead>
              <TableHead className="text-right font-semibold">
                المرفقات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignmentsWithUrls.map((assignment) => {
              const studentAssignment = assignmentStatusMap[assignment.id];
              const isCompleted = studentAssignment?.isCompleted;
              const isOverdue = studentAssignment?.isOverdue;
              const statusLabel = isOverdue
                ? 'مُدرك'
                : isCompleted
                  ? 'مكتمل'
                  : isCurrentWeek
                    ? 'غير منجز'
                    : 'فائت';
              const statusVariant = isOverdue
                ? 'warning'
                : isCompleted
                  ? 'success'
                  : isCurrentWeek
                    ? 'outline'
                    : 'destructive';
              const GradeIcon = studentAssignment?.score
                ? CheckCheckIcon
                : ClockIcon;
              const gradeLabel = studentAssignment?.score
                ? 'تم التقييم'
                : 'قيد المراجعة';

              return (
                <TableRow
                  key={assignment.id}
                  className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground"
                            aria-label={ASSIGNMENT_TYPE_LABELS[assignment.type]}
                          >
                            {ASSIGNMENT_TYPE_ICONS[assignment.type]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                        </TooltipContent>
                      </Tooltip>
                      <span>{assignment.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    {programById[assignment.programId] || 'غير محدد'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start">
                      <div className="flex flex-col items-center">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                        {studentAssignment?.completedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(studentAssignment.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80 text-sm flex-col items-center justify-start">
                    {assignment.allowFileSubmission ||
                    assignment.allowTextSubmission ? (
                      <SubmissionViewerSheet
                        allowFileSubmission={assignment.allowFileSubmission}
                        allowTextSubmission={assignment.allowTextSubmission}
                        fileKey={studentAssignment?.fileKey || null}
                        fileUrl={studentAssignment?.fileUrl || null}
                        textSubmission={
                          studentAssignment?.textSubmission || null
                        }
                        currentScore={studentAssignment?.score || null}
                        currentComment={studentAssignment?.comment || null}
                        assignmentId={assignment.id}
                        assignmentName={assignment.name}
                        studentId={session.userId}
                        studentName={session.firstName + ' ' + session.lastName}
                        canEditGrade={false}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!studentAssignment}
                          className="gap-1"
                        >
                          <GradeIcon className="h-4 w-4" />
                          {gradeLabel}
                        </Button>
                      </SubmissionViewerSheet>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <AttachmentsCell attachments={assignment.attachments} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {assignmentsWithUrls.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            لا توجد مهام لهذا الأسبوع
          </div>
        )}
      </div>
    </div>
  );
}
