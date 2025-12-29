import {
  Users,
  BookOpen,
  UserPlus,
  Mail,
  AlertCircle,
  TrendingUp,
  Layers,
  Calendar,
} from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { ActivityCard, ActivityItem } from './shared/activity-card';
import { QuickActionCard } from './shared/quick-action-card';

// Mock pending invites
const mockPendingInvites: ActivityItem[] = [
  {
    id: '1',
    title: '15 دعوة معلقة',
    description: 'دعوات طالبات لم يتم تفعيلها بعد',
    timestamp: 'منذ 3 أيام',
    badge: {
      label: 'متابعة',
      variant: 'outline' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
  {
    id: '2',
    title: '3 مشرفات جدد',
    description: 'مشرفات في انتظار التفعيل',
    timestamp: 'منذ يومين',
    badge: {
      label: 'جديد',
      variant: 'default' as const,
    },
    action: {
      label: 'مراجعة',
      href: '#',
    },
  },
];

// Mock recent activity
const mockRecentActivity: ActivityItem[] = [
  {
    id: '3',
    title: 'برنامج جديد: القراءة المتقدمة',
    description: 'تم إنشاؤه بواسطة أ. سارة',
    timestamp: 'منذ ساعة',
    badge: {
      label: 'برنامج',
      variant: 'default' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
  {
    id: '4',
    title: 'مجموعة جديدة: مجموعة الفجر',
    description: 'تم إنشاؤها بواسطة أ. هدى',
    timestamp: 'منذ 3 ساعات',
    badge: {
      label: 'مجموعة',
      variant: 'secondary' as const,
    },
  },
  {
    id: '5',
    title: '25 طالبة انضممن للمنصة',
    description: 'دفعة 2025',
    timestamp: 'اليوم',
    badge: {
      label: 'طالبات',
      variant: 'default' as const,
    },
  },
];

// Mock system alerts
const mockSystemAlerts: ActivityItem[] = [
  {
    id: '6',
    title: 'تحديث المنهج مطلوب',
    description: 'برنامج المحاضرات - المستوى 3',
    timestamp: 'عاجل',
    badge: {
      label: 'عاجل',
      variant: 'destructive' as const,
    },
    action: {
      label: 'تحديث',
      href: '#',
    },
  },
  {
    id: '7',
    title: '5 مجموعات تحتاج مشرفات',
    description: 'مجموعات بدون مشرفة',
    timestamp: 'يحتاج إجراء',
    badge: {
      label: 'تنبيه',
      variant: 'outline' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
];

export function AdminDashboard() {
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
          value={487}
          icon={Users}
          href="#"
          description="450 طالبة • 32 مشرفة • 5 إداريات"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="البرامج النشطة"
          value={3}
          icon={BookOpen}
          href="#"
          description="قراءة • محاضرات • طمأنينة"
        />
        <StatCard
          title="المجموعات"
          value={35}
          icon={Layers}
          href="#"
          description="متوسط 13 طالبة/مجموعة"
        />
        <StatCard
          title="معدل النشاط"
          value="82%"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <ActivityCard
          title="إجراءات معلقة"
          items={mockPendingInvites}
          emptyMessage="لا توجد إجراءات معلقة"
          icon={AlertCircle}
          viewAllHref="#"
        />

        {/* System Alerts */}
        <ActivityCard
          title="تنبيهات النظام"
          items={mockSystemAlerts}
          emptyMessage="لا توجد تنبيهات"
          icon={AlertCircle}
          viewAllHref="#"
        />
      </div>

      {/* Recent Activity */}
      <ActivityCard
        title="آخر النشاطات"
        items={mockRecentActivity}
        emptyMessage="لا توجد نشاطات حديثة"
        icon={Calendar}
        viewAllHref="#"
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="إضافة مستخدم"
          description="دعوة طالبة أو مشرفة جديدة"
          icon={UserPlus}
          href="#"
          actionLabel="دعوة مستخدم"
        />
        <QuickActionCard
          title="إنشاء برنامج"
          description="بدء برنامج تعليمي جديد"
          icon={BookOpen}
          href="#"
          actionLabel="إنشاء برنامج"
        />
        <QuickActionCard
          title="إدارة المجموعات"
          description="عرض وتنظيم المجموعات"
          icon={Layers}
          href="#"
          actionLabel="المجموعات"
        />
        <QuickActionCard
          title="التقارير"
          description="عرض تقارير الأداء الشاملة"
          icon={TrendingUp}
          href="#"
          actionLabel="عرض التقارير"
        />
      </div>
    </div>
  );
}
