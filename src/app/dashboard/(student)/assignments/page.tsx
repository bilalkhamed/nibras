import { getCurrentWeek } from '@/lib/server/current-week';
import prisma from '@/lib/server/prisma';
import { requireRoles } from '@/lib/server/require-roles';
import { STUDENT_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Assignment, Program } from '@prisma/client';
import { AssignmentsGrid } from './assignments-grid';
import { getWeekAssignments } from '@/lib/server/assignments';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const assignments = await getWeekAssignments(levelId, currentWeek.week.id);

  const totalAssignments = assignments.length;
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
    <AssignmentsGrid
      assignments={assignments}
      heroTitle={heroTitle}
      primaryMessage={primaryMessage}
      streakText={streakText}
      deadlineLabel={deadlineLabel}
    />
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
