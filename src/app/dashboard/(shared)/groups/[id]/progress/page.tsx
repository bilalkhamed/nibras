import { Suspense } from 'react';
import { InfoSectionSkeleton } from '@/components/skeletons';
import {
  getManyStudentAssignments,
  getWeekAssignments,
} from '@/lib/server/assignments';
import { getCurrentWeek } from '@/lib/server/current-week';
import { getGroupById } from '@/lib/server/groups';
import { notFound } from 'next/navigation';
import { StudentProgressTable } from './student-progress-table';

type Params = Promise<{ id: string }>;

export default function GroupProgressPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<InfoSectionSkeleton />}>
      <StudentsAssignmentsList params={params} />
    </Suspense>
  );
}

async function StudentsAssignmentsList({ params }: { params: Params }) {
  const { id } = await params;

  const group = await getGroupById(id);
  if (!group) notFound();
  const currentWeek = await getCurrentWeek();
  if (!currentWeek) notFound(); // TODO: handle error properly
  const weekId = currentWeek.week?.id;
  if (!weekId) notFound();

  const assignments = await getWeekAssignments(
    group.cohort.currentLevel.id,
    weekId
  );
  const studentAssignments = await getManyStudentAssignments(
    group.students.map((gs) => gs.student.id),
    assignments.map((as) => as.id)
  );

  const assignmentStatusMap = studentAssignments.reduce<
    Record<string, Record<string, boolean>>
  >((acc, sa) => {
    if (!acc[sa.studentId]) acc[sa.studentId] = {};
    acc[sa.studentId][sa.assignmentId] = sa.isCompleted;
    return acc;
  }, {});

  const studentsProgress = group.students.map((gs) => {
    const completedCount = assignments.reduce((count, assignment) => {
      const isCompleted =
        assignmentStatusMap[gs.student.id]?.[assignment.id] ?? false;
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
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1 text-foreground font-medium">
          الأسبوع الحالي: {currentWeek.week?.title || 'الأسبوع الحالي'}
        </span>
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
        <StudentProgressTable
          assignments={assignments}
          students={studentsProgress}
        />
      )}
    </div>
  );
}
