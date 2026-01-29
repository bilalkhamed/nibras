import { requireRoles } from '@/lib/server/require-roles';
import { STUDENT_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  StudentGroupInfoSection,
  SupervisorSection,
  GroupStudentsSection,
  getGroupById,
  type GroupDetailDTO,
} from '@/features/groups';
import { getCurrentWeek } from '@/lib/server/weeks';

export default async function StudentGroupPage() {
  const auth = await requireRoles(STUDENT_ROLE);
  if (!auth) {
    return notFound();
  }

  // Get student's group
  const { activeGroupId } = auth;

  if (!activeGroupId) {
    return <NoGroup />;
  }

  const groupResult = await getGroupById(activeGroupId);
  if (!groupResult.success || !groupResult.data) {
    return <NoGroup />;
  }
  const group = groupResult.data;

  const currentWeek = await getCurrentWeek();

  const students = group.students.map(
    (gs: GroupDetailDTO['students'][number]) => ({
      id: gs.student.id,
      name: `${gs.student.firstName} ${gs.student.middleName || ''} ${gs.student.lastName}`.trim(),
      isMe: gs.student.id === auth.userId,
    }),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary-soft via-white to-secondary-soft p-6 shadow-md dark:border-primary/25 dark:from-[#2a2035] dark:via-[#15101f] dark:to-[#1b1524]">
        <p className="text-sm font-semibold text-foreground">مجموعتي</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">
          {group.name}
        </h1>
      </div>

      {/* Group Info */}
      <StudentGroupInfoSection group={group} currentWeek={currentWeek!} />

      {/* Supervisor Section */}
      {group.supervisor && <SupervisorSection supervisor={group.supervisor} />}

      {/* Students Grid */}
      <GroupStudentsSection students={students} />
    </div>
  );
}

function NoGroup() {
  return (
    <Alert variant="warning">
      <AlertTitle>لا توجد مجموعة</AlertTitle>
      <AlertDescription>
        لم يتم تعيينك لأي مجموعة بعد. يرجى التواصل مع المشرفة.
      </AlertDescription>
    </Alert>
  );
}
