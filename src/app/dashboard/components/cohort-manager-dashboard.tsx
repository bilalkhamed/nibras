import { getGroupCount } from '@/features/groups/service/queries';
import { getUsersCount, getUsersRoleCounts } from '@/features/users/service';
import { Suspense } from 'react';
import { StatCard } from './shared/stat-card';
import {
  Users,
  UsersRound,
  UserPlus,
  GraduationCap,
  LucideIcon,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import labels from '@/lib/labels.json';
import { Skeleton } from '@/components/ui/skeleton';
import { getCohortById } from '@/features/cohorts/service';
import { InfoSectionSkeleton } from '@/components/skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { InfoField } from '@/components/common/info-field';
import { Badge } from '@/components/ui/badge';
import getAuthSession from '@/lib/server/auth-session';
import { formatDate } from '@/lib/shared/utils';

export async function CohortManagerDashboard() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          لوحة إدارة الدفعة
        </h1>
      </div>

      <Suspense fallback={<InfoSectionSkeleton />}>
        <CohortInfoSection />
      </Suspense>

      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsCards />
      </Suspense>
    </section>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

async function StatisticsCards() {
  new Promise((resolve) => setTimeout(resolve, 5200)); // Simulate delay
  const [userCountResult, groupCountResult] = await Promise.all([
    getUsersRoleCounts(),
    getGroupCount(),
  ]);

  const cards: {
    icon: LucideIcon;
    title: string;
    value: number;
    trend?: string;
  }[] = [];

  if (userCountResult.success) {
    const userCount = userCountResult.data;

    if (userCount.student !== undefined) {
      cards.push({
        icon: Users,
        title: labels.dashboard.users.student,
        value: userCount.student,
      });
    }

    if (userCount.supervisor !== undefined) {
      cards.push({
        icon: UserPlus,
        title: labels.dashboard.users.supervisor,
        value: userCount.supervisor,
      });
    }

    const totalUsers = Object.values(userCount).reduce(
      (sum, count) => sum + count,
      0,
    );
    cards.push({
      icon: UsersRound,
      title: 'إجمالي المستخدمين',
      value: totalUsers,
    });
  }

  if (groupCountResult.success) {
    cards.push({
      icon: GraduationCap,
      title: 'إجمالي المجموعات',
      value: groupCountResult.data.count,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatCard
          key={index}
          icon={card.icon}
          title={card.title}
          value={card.value.toString()}
        />
      ))}
    </div>
  );
}

async function CohortInfoSection() {
  const session = await getAuthSession();
  const cohortId = session?.managedCohortId;

  if (!cohortId) {
    return null;
  }

  const result = await getCohortById(cohortId);

  if (!result.success || !result.data) {
    return null;
  }

  const cohort = result.data;

  return (
    <Card className="border-border bg-card/80">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          معلومات الدفعة
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InfoField
            label="اسم الدفعة"
            value={cohort.name}
            icon={<GraduationCap className="h-4 w-4" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
