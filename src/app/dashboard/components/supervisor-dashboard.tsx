import {
  Users,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  FileText,
  UserPlus,
} from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { ActivityCard, ActivityItem } from './shared/activity-card';
import { QuickActionCard } from './shared/quick-action-card';
import prisma from '@/lib/server/prisma';
import getAuthSession from '@/lib/server/auth-session';

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'منذ لحظات';
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
}

export async function SupervisorDashboard() {
  const session = await getAuthSession();
  if (!session) return null;

  const [groups, totalStudents, recentCompletions, studentsWithLowCompletion] =
    await Promise.all([
      prisma.group.findMany({
        where: {
          supervisorId: session.userId,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              students: {
                where: { isActive: true },
              },
            },
          },
          students: {
            where: { isActive: true },
            select: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  studentAssignments: {
                    where: {
                      isCompleted: true,
                    },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.groupStudent.count({
        where: {
          isActive: true,
          group: {
            supervisorId: session.userId,
          },
        },
      }),
      prisma.studentAssignment.findMany({
        where: {
          isCompleted: true,
          student: {
            groupsAsStudent: {
              some: {
                isActive: true,
                group: {
                  supervisorId: session.userId,
                },
              },
            },
          },
        },
        select: {
          completedAt: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
              groupsAsStudent: {
                where: { isActive: true },
                select: {
                  group: { select: { name: true } },
                },
                take: 1,
              },
            },
          },
          assignment: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.user.findMany({
        where: {
          role: 'student',
          groupsAsStudent: {
            some: {
              isActive: true,
              group: {
                supervisorId: session.userId,
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          groupsAsStudent: {
            where: { isActive: true },
            select: {
              group: { select: { name: true } },
            },
            take: 1,
          },
          studentAssignments: {
            where: {
              isCompleted: true,
            },
            select: { id: true },
          },
        },
        take: 100,
      }),
    ]);

  const totalGroups = groups.length;

  const totalCompletedAssignments = groups.reduce(
    (acc, group) =>
      acc +
      group.students.reduce(
        (studentAcc, student) =>
          studentAcc + student.student.studentAssignments.length,
        0
      ),
    0
  );

  const studentsNeedingAttention = studentsWithLowCompletion
    .map((student) => ({
      ...student,
      completionCount: student.studentAssignments.length,
    }))
    .filter((s) => s.completionCount < 5)
    .slice(0, 3);

  const attentionActivities: ActivityItem[] = studentsNeedingAttention.map(
    (student) => {
      const isUrgent = student.completionCount === 0;
      return {
        id: student.id,
        title: `${student.firstName} ${student.lastName}`,
        description: `${student.completionCount} مهام مكتملة فقط`,
        timestamp: student.groupsAsStudent[0]?.group.name || 'غير محدد',
        badge: {
          label: isUrgent ? 'عاجل' : 'متابعة',
          variant: isUrgent ? 'destructive' : 'outline',
        },
      };
    }
  );

  const recentActivities: ActivityItem[] = recentCompletions.map(
    (completion) => ({
      id: completion.student.firstName + completion.assignment.name,
      title: `${completion.student.firstName} ${completion.student.lastName}`,
      description: completion.assignment.name,
      timestamp: completion.completedAt
        ? `${getTimeAgo(completion.completedAt)} • ${completion.student.groupsAsStudent[0]?.group.name || ''}`
        : '',
      badge: {
        label: 'مكتمل',
        variant: 'secondary' as const,
      },
    })
  );

  const groupActivities: ActivityItem[] = groups.map((group) => {
    const completedCount = group.students.reduce(
      (acc, s) => acc + s.student.studentAssignments.length,
      0
    );
    const avgCompletion =
      group._count.students > 0
        ? Math.round(completedCount / group._count.students)
        : 0;

    const isExcellent = avgCompletion > 10;
    return {
      id: group.id,
      title: group.name,
      description: `${group._count.students} طالبة`,
      timestamp: `متوسط ${avgCompletion} مهمة مكتملة`,
      badge: {
        label: isExcellent ? 'ممتاز' : 'جيد',
        variant: isExcellent ? 'default' : 'secondary',
      },
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">لوحة المشرفة 👩‍🏫</h1>
        <p className="text-muted-foreground mt-2">
          متابعة مجموعاتك والطالبات بكل سهولة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="مجموعاتي"
          value={totalGroups}
          icon={Users}
          description={`${totalStudents} طالبة`}
        />
        <StatCard
          title="المهام المكتملة"
          value={totalCompletedAssignments}
          icon={CheckCircle2}
          description="إجمالي المجموعات"
        />
        <StatCard
          title="تحتاج متابعة"
          value={studentsNeedingAttention.length}
          icon={AlertCircle}
          description="طالبات بحاجة للدعم"
        />
        <StatCard
          title="النشاط الأخير"
          value={recentActivities.length}
          icon={FileText}
          description="مهام مكتملة حديثاً"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students Needing Attention */}
        {attentionActivities.length > 0 && (
          <ActivityCard
            title="طالبات تحتجن متابعة"
            items={attentionActivities}
            emptyMessage="جميع الطالبات بحالة جيدة! 🎉"
            icon={AlertCircle}
          />
        )}

        {/* Recent Submissions */}
        <ActivityCard
          title="آخر النشاطات"
          items={recentActivities}
          emptyMessage="لا يوجد نشاط حديث"
          icon={CheckCircle2}
        />
      </div>

      {/* Group Activity */}
      {groupActivities.length > 0 && (
        <ActivityCard
          title="نشاط المجموعات"
          items={groupActivities}
          emptyMessage="لا توجد مجموعات"
          icon={Users}
        />
      )}
    </div>
  );
}
