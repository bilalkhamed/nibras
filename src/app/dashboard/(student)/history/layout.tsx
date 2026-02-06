import { Suspense } from 'react';
import { WeekNavigator } from '@/components/common/week-navigator';
import { getWeeksTillDate } from '@/features/programs/service';

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={<div className="h-14 rounded-xl bg-muted animate-pulse" />}
      >
        <WeekNavigatorContainer />
      </Suspense>
      {children}
    </div>
  );
}

async function WeekNavigatorContainer() {
  const weeksResult = await getWeeksTillDate();

  if (!weeksResult.success) {
    return <WeekNavigator weeks={[]} />;
  }
  const weeks = weeksResult.data;
  const mappedWeeks = weeks
    .map((w) => ({ id: w.week.id, number: w.week.number, title: w.week.title }))
    .sort((a, b) => a.number - b.number);

  if (mappedWeeks.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        لا توجد أسابيع متاحة حتى الآن
      </div>
    );
  }

  return (
    <WeekNavigator
      weeks={mappedWeeks}
      currentWeekNumber={
        weeksResult.data[weeksResult.data.length - 1].week.number
      }
    />
  );
}
