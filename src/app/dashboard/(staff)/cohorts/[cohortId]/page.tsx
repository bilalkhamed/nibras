import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users,
  GraduationCap,
  UserCog,
  ArrowRight,
  UserCheck,
  UsersRound,
  Pencil,
} from 'lucide-react';
import { getCohortDetail, EditCohortSheet } from '@/features/cohorts';
import { UsersTableSection } from '@/features/users/components';
import { AuthGuard } from '@/components/auth/auth-gaurd';
import { StatCard } from '@/app/dashboard/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { UsersTableSkeleton } from '@/components/skeletons';
import { CustomAlert } from '@/components/common/custom-alert';
import {
  AccessTokenPayload,
  ADMIN_ROLE,
  COHORT_MANAGER_ROLE,
} from '@/types/types';
import LoadingCohortDetail from './loading';

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;

  return (
    <Suspense fallback={<LoadingCohortDetail />}>
      <AuthGuard roles={[ADMIN_ROLE, 'director', COHORT_MANAGER_ROLE]}>
        {(session) => (
          <CohortDetailContent cohortId={cohortId} session={session} />
        )}
      </AuthGuard>
    </Suspense>
  );
}

async function CohortDetailContent({
  cohortId,
  session,
}: {
  cohortId: string;
  session: AccessTokenPayload;
}) {
  const res = await getCohortDetail(cohortId);

  if (!res.success) {
    if (res.error?.statusCode === 403) {
      return (
        <CustomAlert
          title="غير مسموح"
          description="ليس لديك صلاحية للوصول إلى هذه الدفعة."
          variant="destructive"
        />
      );
    }
    return notFound();
  }

  if (!res.data) {
    return notFound();
  }

  const cohort = res.data;

  // 2. Student split (filtered strictly by student role)
  const students = cohort.students.filter((s) => s.role === 'student');
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const invitedStudents = students.filter((s) => s.status === 'invited').length;
  const studentDescription = (
    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-semibold">
      <span className="text-emerald-600 dark:text-emerald-400">
        {activeStudents} نشط
      </span>
      <span className="text-muted-foreground/50">•</span>
      <span className="text-secondary">{invitedStudents} معلق</span>
    </span>
  );

  // 3. Supervisor unique list & split (under training count removed, merged direct cohort supervisors)
  const uniqueSupervisorsMap = new Map<
    string,
    { id: string; status: string }
  >();
  cohort.groups.forEach((group) => {
    group.supervisors.forEach((sup) => {
      uniqueSupervisorsMap.set(sup.id, { id: sup.id, status: sup.status });
    });
  });
  cohort.students.forEach((user) => {
    if (user.role === 'supervisor') {
      uniqueSupervisorsMap.set(user.id, { id: user.id, status: user.status });
    }
  });
  const supervisors = Array.from(uniqueSupervisorsMap.values());
  const totalSupervisors = supervisors.length;
  const activeSupervisors = supervisors.filter(
    (s) => s.status === 'active',
  ).length;
  const invitedSupervisors = supervisors.filter(
    (s) => s.status === 'invited',
  ).length;
  const supervisorDescription = (
    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-semibold">
      <span className="text-emerald-600 dark:text-emerald-400">
        {activeSupervisors} نشط
      </span>
      <span className="text-muted-foreground/50">•</span>
      <span className="text-secondary">{invitedSupervisors} معلق</span>
    </span>
  );

  // 4. Group Manager unique list & split (merged direct cohort group managers)
  const uniqueGroupManagersMap = new Map<
    string,
    { id: string; status: string }
  >();
  cohort.groups.forEach((group) => {
    group.managers.forEach((gm) => {
      uniqueGroupManagersMap.set(gm.user.id, {
        id: gm.user.id,
        status: gm.user.status,
      });
    });
  });
  cohort.students.forEach((user) => {
    if (user.role === 'group_manager') {
      uniqueGroupManagersMap.set(user.id, { id: user.id, status: user.status });
    }
  });
  const groupManagers = Array.from(uniqueGroupManagersMap.values());
  const totalGroupManagers = groupManagers.length;
  const activeGroupManagers = groupManagers.filter(
    (m) => m.status === 'active',
  ).length;
  const invitedGroupManagers = groupManagers.filter(
    (m) => m.status === 'invited',
  ).length;
  const groupManagersDescription = (
    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-semibold">
      <span className="text-emerald-600 dark:text-emerald-400">
        {activeGroupManagers} نشط
      </span>
      <span className="text-muted-foreground/50">•</span>
      <span className="text-secondary">{invitedGroupManagers} معلق</span>
    </span>
  );

  const groupsCount = cohort.groups.length;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Back button and title section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Link
              href="/dashboard/cohorts"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
              <span>الدفعات</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{cohort.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            {cohort.name}
          </h1>
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-2">
          {session.role === ADMIN_ROLE && (
            <EditCohortSheet cohort={cohort}>
              <Button
                variant="outline"
                className="border-border bg-card flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                <span>تعديل</span>
              </Button>
            </EditCohortSheet>
          )}
          <Button
            asChild
            variant="outline"
            className="border-border bg-card cursor-pointer"
          >
            <Link
              href={`/dashboard/groups?cohortId=${cohort.id}`}
              className="flex items-center gap-2"
            >
              <UsersRound className="h-4 w-4" />
              <span>عرض مجموعات الدفعة ({groupsCount})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section with grouping */}
      <div className="space-y-6">
        {/* Identity Info Row */}
        <div className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {/* Cohort Manager */}
            <StatCard
              title="مدير الدفعة"
              value={
                cohort.managers.length > 0
                  ? `${cohort.managers[0].user.firstName} ${cohort.managers[0].user.lastName}`
                  : 'لا يوجد'
              }
              icon={UserCog}
            />

            {/* Level info */}
            <StatCard
              title="مستوى الدفعة"
              value={cohort.currentLevel.title}
              icon={GraduationCap}
            />
          </div>
        </div>

        {/* People Stats Row */}
        <div className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Student Count */}
            <StatCard
              title="اليافعات"
              value={totalStudents}
              description={studentDescription}
              icon={Users}
            />

            {/* Group Managers Count */}
            <StatCard
              title="مديرات المجموعات"
              value={totalGroupManagers}
              description={groupManagersDescription}
              icon={UsersRound}
            />

            {/* Supervisor Count */}
            <StatCard
              title="المشرفات"
              value={totalSupervisors}
              description={supervisorDescription}
              icon={UserCheck}
            />
          </div>
        </div>
      </div>

      {/* Users table section */}
      <div className="space-y-4">
        <div className="border-t border-border pt-6">
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTableSection cohortId={cohort.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
