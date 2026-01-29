import { Suspense } from 'react';
import { InfoSectionSkeleton } from '@/components/skeletons';
import {
  getManyStudentAssignments,
  getWeekAssignments,
} from '@/features/assignments/service';
import type { AssignmentStatus, StudentProgress } from '@/features/groups';
import { StudentProgressContainer } from '@/features/groups';
import {
  getCurrentWeek,
  getWeekByNumber,
  getWeeksTillDate,
} from '@/lib/server/weeks';
import { getGroupById } from '@/features/groups';
import { notFound } from 'next/navigation';
import { WeekNavigator } from '@/components/common/week-navigator';
import getAuthSession from '@/lib/server/auth-session';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ week?: string }> | { week?: string };

export default function GroupProgressPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<WeekNavigator weeks={[]} />}>
        <WeekNavigatorContainer />
      </Suspense>

      <Suspense fallback={<InfoSectionSkeleton />}>
        <StudentsAssignmentsList params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function StudentsAssignmentsList({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const { week } = (await searchParams) || {};

  const [groupResult, session] = await Promise.all([
    getGroupById(id),
    getAuthSession(),
  ]);
  if (!groupResult.success || !groupResult.data) notFound();
  const group = groupResult.data;
  const currentUserName = session
    ? `${session.firstName} ${session.lastName}`
    : 'مشرف';
  const currentWeek = await getCurrentWeek();
  if (!currentWeek) notFound(); // TODO: handle error properly
  // FIX: remove current week dependency (to support when there is no current week)

  const parsedWeek = Number(week);

  // here we are checking if either the week is invalid OR a future week
  const isInvalidWeek = Number.isNaN(parsedWeek) || parsedWeek < 1;
  const isFutureWeek = !isInvalidWeek && parsedWeek > currentWeek.week.number;

  // if it is , default to current week
  const targetWeekNumber =
    isInvalidWeek || isFutureWeek ? currentWeek.week.number : parsedWeek;

  // fetch the target week from DB
  const targetWeek = await getWeekByNumber(targetWeekNumber);
  const selectedWeek = targetWeek ?? currentWeek;

  const weekId = selectedWeek.week.id;

  const assignmentsResult = await getWeekAssignments({
    levelId: group.cohort.currentLevelId,
    weekId: weekId,
    withAttachments: false,
  });

  // Handle service errors
  const assignments = assignmentsResult.success ? assignmentsResult.data : [];

  const studentAssignmentsResult = await getManyStudentAssignments(
    group.students.map((gs) => gs.student.id),
    assignments.map((as) => as.id),
  );

  // Handle service errors gracefully
  const studentAssignments = studentAssignmentsResult.success
    ? studentAssignmentsResult.data
    : [];

  const assignmentStatusMap = studentAssignments.reduce<
    Record<string, Record<string, AssignmentStatus>>
  >((acc, sa) => {
    if (!acc[sa.studentId]) acc[sa.studentId] = {};
    acc[sa.studentId][sa.assignmentId] = {
      isCompleted: sa.isCompleted,
      completedAt: sa.completedAt,
      markedBy: sa.markedBy,
    };
    return acc;
  }, {});

  const studentsProgress = group.students.map((gs) => {
    const completedCount = assignments.reduce((count, assignment) => {
      const isCompleted =
        assignmentStatusMap[gs.student.id]?.[assignment.id]?.isCompleted ??
        false;
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

    const studentName = `${gs.student.firstName} ${
      gs.student.middleName ?? ''
    } ${gs.student.lastName}`.trim();

    return {
      id: gs.student.id,
      name: studentName,
      completedCount,
      totalAssignments: assignments.length,
      status,
      assignmentStatuses: assignmentStatusMap[gs.student.id] || {},
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

      {group.students.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          لا توجد طالبات في هذه المجموعة
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
        />
      )}
    </div>
  );
}

// just to load weeks then pass to WeekNavigator
async function WeekNavigatorContainer() {
  const [weeks, currentWeek] = await Promise.all([
    getWeeksTillDate(),
    getCurrentWeek(),
  ]);
  const mappedWeeks = weeks
    .map((w) => ({ id: w.week.id, number: w.week.number, title: w.week.title }))
    .sort((a, b) => a.number - b.number);

  return (
    <WeekNavigator
      weeks={mappedWeeks}
      currentWeekNumber={currentWeek?.week.number}
    />
  );
}
