import { BookOpen, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { ActivityCard, ActivityItem } from './shared/activity-card';
import { ProgressCard } from './shared/progress-card';
import { QuickActionCard } from './shared/quick-action-card';
import prisma from '@/lib/server/prisma';
import getAuthSession from '@/lib/server/auth-session';
import labels from '@/lib/labels.json';
import { AssignmentTypes } from '@prisma/client';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'مساء الخير';
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'مساء الخير';
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
}

export async function StudentDashboard() {
  const session = await getAuthSession();
  if (!session) return null;

  const [
    student,
    completedCount,
    pendingAssignments,
    programProgress,
    recentCompletions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        firstName: true,
        cohort: {
          select: {
            name: true,
            currentLevel: { select: { number: true } },
          },
        },
      },
    }),
    prisma.studentAssignment.count({
      where: {
        studentId: session.userId,
        isCompleted: true,
      },
    }),
    prisma.assignment.findMany({
      where: {
        level: {
          cohortsAsCurrentLevel: {
            some: {
              students: {
                some: { id: session.userId },
              },
            },
          },
        },
        studentAssignments: {
          none: {
            studentId: session.userId,
            isCompleted: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        program: { select: { name: true } },
        week: { select: { number: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.program.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignments: {
              where: {
                level: {
                  cohortsAsCurrentLevel: {
                    some: {
                      students: {
                        some: { id: session.userId },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        assignments: {
          where: {
            level: {
              cohortsAsCurrentLevel: {
                some: {
                  students: {
                    some: { id: session.userId },
                  },
                },
              },
            },
            studentAssignments: {
              some: {
                studentId: session.userId,
                isCompleted: true,
              },
            },
          },
          select: { id: true },
        },
      },
    }),
    prisma.studentAssignment.findMany({
      where: {
        studentId: session.userId,
        isCompleted: true,
      },
      select: {
        completedAt: true,
        assignment: {
          select: {
            name: true,
            type: true,
            program: { select: { name: true } },
            week: { select: { number: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 3,
    }),
  ]);

  const pendingCount = pendingAssignments.length;
  const totalAssignments = completedCount + pendingCount;
  const completionRate =
    totalAssignments > 0
      ? Math.round((completedCount / totalAssignments) * 100)
      : 0;

  const pendingActivities: ActivityItem[] = pendingAssignments.map(
    (assignment) => ({
      id: assignment.id,
      title: assignment.name,
      description: `${assignment.program.name} • الأسبوع ${assignment.week.number}`,
      timestamp: getTimeAgo(assignment.createdAt),
      badge: {
        label: labels.dashboard.curriculum[assignment.type as AssignmentTypes],
        variant: 'default' as const,
      },
      action: {
        label: 'عرض',
        href: '/dashboard/assignments',
      },
    })
  );

  const completedActivities: ActivityItem[] = recentCompletions.map((sa) => ({
    id: sa.assignment.name,
    title: sa.assignment.name,
    description: `${sa.assignment.program.name} • الأسبوع ${sa.assignment.week.number}`,
    timestamp: sa.completedAt ? getTimeAgo(sa.completedAt) : '',
    badge: {
      label: 'مكتمل',
      variant: 'secondary' as const,
    },
  }));

  const progressItems = programProgress.map((program) => ({
    label: program.name,
    current: program.assignments.length,
    total: program._count.assignments,
  }));

  const greeting = getGreeting();
  const encouragement =
    pendingCount === 0
      ? 'رائع! لا توجد مهام معلقة 🎉'
      : pendingCount <= 2
        ? `لديكِ ${pendingCount} مهام متبقية. يمكنكِ إنجازها!`
        : `${pendingCount} مهام في انتظاركِ. لنبدأ! 💪`;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          {greeting}, {student?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">{encouragement}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="المهام المعلقة"
          value={pendingCount}
          icon={BookOpen}
          href="/dashboard/assignments"
          description="واجبات قيد التنفيذ"
        />
        <StatCard
          title="المهام المكتملة"
          value={completedCount}
          icon={CheckCircle2}
          href="/dashboard/assignments"
          description="إجمالي المنجزات"
        />
        <StatCard
          title="نسبة الإنجاز"
          value={`${completionRate}%`}
          icon={TrendingUp}
          trend={
            completionRate >= 75
              ? { value: completionRate - 75, isPositive: true }
              : undefined
          }
        />
        <StatCard
          title="المستوى الحالي"
          value={student?.cohort?.currentLevel.number || '-'}
          icon={Clock}
          description={student?.cohort?.name || 'غير محدد'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Assignments */}
        <ActivityCard
          title="المهام المعلقة"
          items={pendingActivities}
          emptyMessage="رائع! لا توجد مهام معلقة 🎉"
          icon={BookOpen}
          viewAllHref="/dashboard/assignments"
        />

        {/* Progress Summary */}
        <ProgressCard title="ملخص التقدم" items={progressItems} />
      </div>

      {/* Recent Completions */}
      {completedActivities.length > 0 && (
        <ActivityCard
          title="آخر الإنجازات"
          items={completedActivities}
          emptyMessage="لا توجد إنجازات حديثة"
          icon={CheckCircle2}
        />
      )}
    </div>
  );
}
