import {
  getStudentAssignments,
  getWeekAssignments,
} from '@/lib/server/assignments';
import getAuthSession from '@/lib/server/auth-session';
import { getAllPrograms } from '@/lib/server/programs';
import { getCurrentWeek, getWeekByNumber } from '@/lib/server/weeks';
import { CalendarWeek, Week } from '@prisma/client';
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
import { BookOpen, PlayCircle, ClipboardList, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentsTableSkeleton } from '@/components/skeletons';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/server/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AttachmentsCell } from '../../components/attachments-cell';

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
  const week = (await searchParams).week || 1;

  if (isNaN(Number(week)) || Number(week) < 1) {
    redirect('/dashboard/history?week=1');
  }

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <Skeleton className="h-32 w-full  animate-pulse rounded-2xl bg-muted" />
        }
      >
        <WeekProvider weekNumber={Number(week)}>
          {(week, isCurrentWeek) => (
            <div>
              <WeekInfo week={week} />
              <Suspense fallback={<AssignmentsTableSkeleton />}>
                <AssignmentsList
                  weekId={week.week.id}
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
  children: (
    week: CalendarWeek & { week: Week },
    isCurrentWeek: boolean
  ) => React.ReactNode;
}) {
  const currentWeek = await getCurrentWeek();

  // If the requested week is in the future, show no data
  if (currentWeek && weekNumber > currentWeek.week.number) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        لا توجد معلومات متاحة لهذا الأسبوع
      </div>
    );
  }

  const week = await getWeekByNumber(weekNumber);

  if (!week) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        لا توجد معلومات متاحة لهذا الأسبوع
      </div>
    );
  }

  const isCurrentWeek =
    !!currentWeek && currentWeek.week.number === week.week.number;

  return <>{children(week, isCurrentWeek)}</>;
}

async function WeekInfo({ week }: { week: CalendarWeek & { week: Week } }) {
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
  isCurrentWeek,
}: {
  weekId: string;
  isCurrentWeek: boolean;
}) {
  const auth = await getAuthSession();
  if (!auth) return null;

  const assignments = await getWeekAssignments(auth.currentLevelId!, weekId);

  const assignmentsWithUrls = await Promise.all(
    assignments.map(async (assignment) => {
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
        })
      );
      return { ...assignment, attachments: attachmentsWithUrls };
    })
  );

  const programs = await getAllPrograms();
  const programById = programs.reduce<Record<string, string>>(
    (acc, program) => {
      acc[program.id] = program.name;
      return acc;
    },
    {}
  );

  const studentAssignments = await getStudentAssignments(
    auth.userId,
    assignments.map((as) => as.id)
  );

  const assignmentStatusMap: Record<string, boolean> = {};
  studentAssignments.forEach((sa) => {
    assignmentStatusMap[sa.assignmentId] = sa.isCompleted;
  });

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
              const isCompleted = assignmentStatusMap[assignment.id] || false;
              const statusLabel = isCompleted
                ? 'مكتمل'
                : isCurrentWeek
                  ? 'غير منجز'
                  : 'فائت';
              const statusVariant = isCompleted
                ? 'success'
                : isCurrentWeek
                  ? 'outline'
                  : 'destructive';
              const gradeLabel = isCompleted
                ? 'قيد المراجعة'
                : 'لم يتم التقييم';

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
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground/80 text-sm">
                    {gradeLabel}
                  </TableCell>
                  <TableCell>
                    <AttachmentsCell attachments={assignment.attachments} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {assignments.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            لا توجد مهام لهذا الأسبوع
          </div>
        )}
      </div>
    </div>
  );
}
