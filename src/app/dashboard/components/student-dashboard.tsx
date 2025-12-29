import { BookOpen, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatCard } from './shared/stat-card';
import { ActivityCard, ActivityItem } from './shared/activity-card';
import { ProgressCard } from './shared/progress-card';
import { QuickActionCard } from './shared/quick-action-card';

// Mock data matching schema types
const mockActiveAssignments: ActivityItem[] = [
  {
    id: '1',
    title: 'قراءة الفصل الثالث - كتاب الأخلاق',
    description: 'برنامج القراءة • الأسبوع 5',
    timestamp: 'ينتهي خلال يومين',
    badge: {
      label: 'عاجل',
      variant: 'destructive' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
  {
    id: '2',
    title: 'محاضرة: التواضع والكبر',
    description: 'برنامج المحاضرات • الأسبوع 5',
    timestamp: 'ينتهي خلال 4 أيام',
    badge: {
      label: 'جديد',
      variant: 'default' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
  {
    id: '3',
    title: 'نشاط: طمأنينة القلب',
    description: 'برنامج طمأنينة القلب • الأسبوع 4',
    timestamp: 'ينتهي خلال أسبوع',
    action: {
      label: 'عرض',
      href: '#',
    },
  },
];

const mockCompletedAssignments: ActivityItem[] = [
  {
    id: '4',
    title: 'قراءة الفصل الثاني - كتاب الأخلاق',
    description: 'برنامج القراءة • الأسبوع 4',
    timestamp: 'اكتمل منذ يومين',
    badge: {
      label: 'مكتمل',
      variant: 'secondary' as const,
    },
  },
  {
    id: '5',
    title: 'محاضرة: الصبر والشكر',
    description: 'برنامج المحاضرات • الأسبوع 4',
    timestamp: 'اكتمل منذ 3 أيام',
    badge: {
      label: 'مكتمل',
      variant: 'secondary' as const,
    },
  },
];

const mockProgress = [
  { label: 'برنامج القراءة', current: 12, total: 20 },
  { label: 'برنامج المحاضرات', current: 8, total: 15 },
  { label: 'برنامج طمأنينة القلب', current: 5, total: 10 },
];

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">مرحباً بكِ! 👋</h1>
        <p className="text-muted-foreground mt-2">
          استعرضي واجباتكِ ومهامكِ الأسبوعية
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="المهام النشطة"
          value={3}
          icon={BookOpen}
          href="#"
          description="واجبات قيد التنفيذ"
        />
        <StatCard
          title="المهام المكتملة"
          value={12}
          icon={CheckCircle2}
          href="#"
          description="هذا الشهر"
        />
        <StatCard
          title="الإنجاز الأسبوعي"
          value="75%"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="الواجبات القادمة"
          value={2}
          icon={Clock}
          description="خلال 7 أيام"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Assignments */}
        <ActivityCard
          title="المهام النشطة"
          items={mockActiveAssignments}
          emptyMessage="لا توجد مهام نشطة"
          icon={BookOpen}
          viewAllHref="#"
        />

        {/* Progress Summary */}
        <ProgressCard title="ملخص التقدم" items={mockProgress} />
      </div>

      {/* Recent Completions */}
      <ActivityCard
        title="آخر الإنجازات"
        items={mockCompletedAssignments}
        emptyMessage="لا توجد إنجازات حديثة"
        icon={CheckCircle2}
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="مجموعتي"
          description="عرض معلومات المجموعة والطالبات"
          icon={BookOpen}
          href="#"
          actionLabel="عرض المجموعة"
        />
        <QuickActionCard
          title="جدول الأسبوع"
          description="عرض جميع المهام المقررة هذا الأسبوع"
          icon={Clock}
          href="#"
          actionLabel="عرض الجدول"
        />
        <QuickActionCard
          title="الملف الشخصي"
          description="تحديث بياناتكِ الشخصية"
          icon={TrendingUp}
          href="#"
          actionLabel="الملف الشخصي"
        />
      </div>
    </div>
  );
}
