import { getAllCalendarWeeks } from '@/features/programs/service';
import { WeekManager } from './_components';

export default async function CalendarPage() {
  const weeks = await getAllCalendarWeeks();

  if (!weeks.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة التقويم</h1>
          <p className="text-muted-foreground">
            قم بإدارة جدول الأسابيع والإجازات
          </p>
        </div>
      </div>
      <WeekManager initialWeeks={weeks.data} />
    </div>
  );
}
