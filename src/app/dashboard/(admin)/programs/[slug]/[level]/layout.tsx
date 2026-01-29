import { WeekNavigator } from './week-navigator';
import { getAllWeeks } from '@/features/programs/service';
import { CustomAlert } from '@/components/common/custom-alert';

export default async function ProgramLevelPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const weeksResult = await getAllWeeks();
  if (!weeksResult.success) {
    return (
      <CustomAlert
        variant="destructive"
        title="عذراً، حدث خطأ أثناء جلب الأسابيع الدراسية."
      />
    );
  }

  const weeks = weeksResult.data;

  return (
    <div className="space-y-6">
      <WeekNavigator weeks={weeks} />
      {children}
    </div>
  );
}
