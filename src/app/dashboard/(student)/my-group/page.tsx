import { requireRoles } from '@/lib/server/require-roles';
import { STUDENT_ROLE } from '@/types/types';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import prisma from '@/lib/server/prisma';
import { GroupInfoSection } from './group-info-section';
import { SupervisorSection } from './supervisor-section';
import { GroupStudentsSection } from './group-students-section';
import { getGroupById } from '@/lib/server/groups';
import { getCurrentWeek } from '@/lib/server/current-week';

export default async function StudentGroupPage() {
  const auth = await requireRoles(STUDENT_ROLE);
  if (!auth) {
    return notFound();
  }

  const t0 = performance.now();
  // Get student's group
  const { activeGroupId } = auth;

  if (!activeGroupId) {
    return <NoGroup />;
  }

  const group = await getGroupById(activeGroupId);
  if (!group) {
    return <NoGroup />;
  }

  const currentWeek = await getCurrentWeek();

  const students = group.students.map((gs) => ({
    id: gs.student.id,
    name: `${gs.student.firstName} ${gs.student.middleName || ''} ${gs.student.lastName}`.trim(),
    isMe: gs.student.id === auth.userId,
  }));

  const t1 = performance.now();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary-soft via-white to-secondary-soft p-6 shadow-md dark:border-primary/25 dark:from-[#2a2035] dark:via-[#15101f] dark:to-[#1b1524]">
        <p className="text-sm font-semibold text-foreground">مجموعتي</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">
          {group.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          معاً نتعلم ونتطور ✨
        </p>
      </div>

      {/* Group Info */}
      <GroupInfoSection group={group} currentWeek={currentWeek!} />

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
