import {
  Users,
  BookOpen,
  UserPlus,
  Mail,
  AlertCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { ActivityCard, ActivityItem } from './shared/activity-card';
import { QuickActionCard } from './shared/quick-action-card';
import prisma from '@/lib/server/prisma';

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
}

export async function AdminDashboard() {
  const [
    userCounts,
    programCount,
    groupCount,
    pendingInvites,
    recentUsers,
    groupsWithoutSupervisor,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: {
        status: { not: 'deleted' },
      },
    }),
    prisma.program.count(),
    prisma.group.count(),
    prisma.invite.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.group.findMany({
      where: {
        supervisorId: undefined,
      },
      select: {
        id: true,
        name: true,
        cohort: { select: { name: true } },
      },
      take: 3,
    }),
  ]);

  const studentCount =
    userCounts.find((u) => u.role === 'student')?._count || 0;
  const supervisorCount =
    userCounts.find((u) => u.role === 'supervisor')?._count || 0;
  const adminCount = userCounts.find((u) => u.role === 'admin')?._count || 0;
  const totalUsers = studentCount + supervisorCount + adminCount;

  const pendingInviteActivities: ActivityItem[] = pendingInvites.map(
    (invite) => ({
      id: invite.id,
      title: `${invite.user.firstName} ${invite.user.lastName}`,
      description:
        invite.user.role === 'student'
          ? 'دعوة طالبة'
          : invite.user.role === 'supervisor'
            ? 'دعوة مشرفة'
            : 'دعوة إدارية',
      timestamp: getTimeAgo(invite.createdAt),
      badge: {
        label: 'معلق',
        variant: 'outline' as const,
      },
      action: {
        label: 'عرض',
        href: '/dashboard/users',
      },
    })
  );

  const recentActivity: ActivityItem[] = recentUsers.map((user) => ({
    id: user.id,
    title: `${user.firstName} ${user.lastName}`,
    description:
      user.role === 'student'
        ? 'طالبة جديدة'
        : user.role === 'supervisor'
          ? 'مشرفة جديدة'
          : 'إدارية جديدة',
    timestamp: getTimeAgo(user.createdAt),
    badge: {
      label: 'جديد',
      variant: 'default' as const,
    },
  }));

  const alertActivities: ActivityItem[] = groupsWithoutSupervisor.map(
    (group) => ({
      id: group.id,
      title: group.name,
      description: `${group.name} • بدون مشرفة`,
      timestamp: 'يحتاج إجراء',
      badge: {
        label: 'تنبيه',
        variant: 'destructive' as const,
      },
      action: {
        label: 'تعيين مشرفة',
        href: '/dashboard/users?role=supervisor',
      },
    })
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">لوحة الإدارة 🎯</h1>
        <p className="text-muted-foreground mt-2">
          نظرة شاملة على المنصة والأنشطة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={totalUsers}
          icon={Users}
          href="/dashboard/users"
          description={`${studentCount} طالبة • ${supervisorCount} مشرفة • ${adminCount} إداريات`}
        />
        <StatCard
          title="البرامج النشطة"
          value={programCount}
          icon={BookOpen}
          href="/dashboard/programs"
          description="قراءة • محاضرات • طمأنينة"
        />
        <StatCard
          title="المجموعات"
          value={groupCount}
          icon={Layers}
          href="/dashboard/users?view=groups"
          description={
            studentCount > 0 && groupCount > 0
              ? `متوسط ${Math.round(studentCount / groupCount)} طالبة/مجموعة`
              : 'لا توجد بيانات'
          }
        />
        <StatCard
          title="الدعوات المعلقة"
          value={pendingInvites.length}
          icon={Mail}
          href="/dashboard/users"
          description="تحتاج متابعة"
          trend={
            pendingInvites.length > 10
              ? { value: pendingInvites.length - 10, isPositive: false }
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Invites */}
        {pendingInviteActivities.length > 0 && (
          <ActivityCard
            title="الدعوات المعلقة"
            items={pendingInviteActivities}
            emptyMessage="لا توجد دعوات معلقة"
            icon={Mail}
            viewAllHref="/dashboard/users"
          />
        )}

        {/* Recent Activity */}
        <ActivityCard
          title="النشاط الأخير"
          items={recentActivity}
          emptyMessage="لا يوجد نشاط حديث"
          icon={TrendingUp}
        />
      </div>

      {/* System Alerts */}
      {alertActivities.length > 0 && (
        <ActivityCard
          title="تنبيهات النظام"
          items={alertActivities}
          emptyMessage="لا توجد تنبيهات"
          icon={AlertCircle}
        />
      )}
    </div>
  );
}
