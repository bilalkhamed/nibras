import { CustomAlert } from '@/components/common/custom-alert';
import { getAllCohortsDetailed } from '@/features/cohorts/service/queries';
import { CohortList } from '@/features/cohorts';

export default async function CohortPage() {
  const cohortsResult = await getAllCohortsDetailed();

  if (!cohortsResult.success) {
    return (
      <CustomAlert
        title="عذراً، حدث خطأ أثناء تحيمل الدفعات"
        description={`رمز الخطأ: ${cohortsResult.error.statusCode}`}
      />
    );
  }

  const cohorts = cohortsResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الدفعات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الدفعات والمستويات الدراسية
          </p>
        </div>
      </div>
      <CohortList cohorts={cohorts} hrefBase="/dashboard/cohorts/" />
    </div>
  );
}
