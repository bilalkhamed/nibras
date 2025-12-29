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

// Mock data for students needing attention
const mockStudentsNeedingAttention: ActivityItem[] = [
  {
    id: '1',
    title: 'فاطمة أحمد',
    description: 'لم تسلم 3 واجبات متتالية',
    timestamp: 'مجموعة النور',
    badge: {
      label: 'عاجل',
      variant: 'destructive' as const,
    },
    action: {
      label: 'التواصل',
      href: '#',
    },
  },
  {
    id: '2',
    title: 'مريم خالد',
    description: 'تأخر في تسليم واجب القراءة',
    timestamp: 'مجموعة النور',
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
    id: '3',
    title: 'نور محمد',
    description: 'نسبة إنجاز منخفضة (40%)',
    timestamp: 'مجموعة الأمل',
    action: {
      label: 'عرض',
      href: '#',
    },
  },
];

// Mock data for recent submissions
const mockRecentSubmissions: ActivityItem[] = [
  {
    id: '4',
    title: 'سارة عبدالله',
    description: 'سلمت واجب قراءة الفصل الثالث',
    timestamp: 'منذ ساعة • مجموعة النور',
    badge: {
      label: 'جديد',
      variant: 'default' as const,
    },
    action: {
      label: 'مراجعة',
      href: '#',
    },
  },
  {
    id: '5',
    title: 'هدى يوسف',
    description: 'سلمت نشاط طمأنينة القلب',
    timestamp: 'منذ 3 ساعات • مجموعة الأمل',
    action: {
      label: 'مراجعة',
      href: '#',
    },
  },
  {
    id: '6',
    title: 'رنا سعيد',
    description: 'أكملت محاضرة التواضع والكبر',
    timestamp: 'منذ 5 ساعات • مجموعة النور',
    badge: {
      label: 'مكتمل',
      variant: 'secondary' as const,
    },
  },
];

// Mock data for group activity
const mockGroupActivity: ActivityItem[] = [
  {
    id: '7',
    title: 'مجموعة النور',
    description: '12 من 15 طالبة أكملن واجبات الأسبوع',
    timestamp: 'نسبة الإنجاز: 80%',
    badge: {
      label: 'جيد',
      variant: 'default' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
  {
    id: '8',
    title: 'مجموعة الأمل',
    description: '8 من 14 طالبة أكملن واجبات الأسبوع',
    timestamp: 'نسبة الإنجاز: 57%',
    badge: {
      label: 'يحتاج متابعة',
      variant: 'outline' as const,
    },
    action: {
      label: 'عرض',
      href: '#',
    },
  },
];

export function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">لوحة المشرفة 📋</h1>
        <p className="text-muted-foreground mt-2">
          متابعة الطالبات والمجموعات الخاصة بكِ
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطالبات"
          value={29}
          icon={Users}
          href="#"
          description="في مجموعتين"
        />
        <StatCard
          title="يحتاج متابعة"
          value={3}
          icon={AlertCircle}
          href="#"
          description="طالبات تحتاج متابعة"
        />
        <StatCard
          title="تسليمات جديدة"
          value={8}
          icon={FileText}
          href="#"
          description="تحتاج مراجعة"
        />
        <StatCard
          title="معدل الإنجاز"
          value="73%"
          icon={CheckCircle2}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students Needing Attention */}
        <ActivityCard
          title="طالبات تحتاج متابعة"
          items={mockStudentsNeedingAttention}
          emptyMessage="جميع الطالبات على المسار الصحيح"
          icon={AlertCircle}
          viewAllHref="#"
        />

        {/* Recent Submissions */}
        <ActivityCard
          title="آخر التسليمات"
          items={mockRecentSubmissions}
          emptyMessage="لا توجد تسليمات حديثة"
          icon={FileText}
          viewAllHref="#"
        />
      </div>

      {/* Group Activity Summary */}
      <ActivityCard
        title="ملخص المجموعات"
        items={mockGroupActivity}
        emptyMessage="لا توجد مجموعات"
        icon={Users}
        viewAllHref="#"
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="مجموعاتي"
          description="عرض وإدارة مجموعاتك"
          icon={Users}
          href="#"
          actionLabel="عرض المجموعات"
        />
        <QuickActionCard
          title="إرسال رسالة"
          description="التواصل مع الطالبات"
          icon={MessageSquare}
          href="#"
          actionLabel="إرسال رسالة"
        />
        <QuickActionCard
          title="تقرير الأسبوع"
          description="إنشاء تقرير الأداء الأسبوعي"
          icon={FileText}
          href="#"
          actionLabel="إنشاء تقرير"
        />
      </div>
    </div>
  );
}
