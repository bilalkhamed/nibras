'use client';

import { useEffect, useOptimistic, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Cohort } from '@prisma/client';
import SearchSelect from '@/components/common/search-select';
import { Card, CardContent } from '@/components/ui/card';

export function CohortNavigator({ cohorts }: { cohorts: Cohort[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCohortId = searchParams.get('cohortId') || '';
  const defaultCohortId = cohorts[0]?.id;

  // Optimistic state for immediate UI feedback
  const [optimisticCohortId, setOptimisticCohortId] = useOptimistic(
    currentCohortId || defaultCohortId || '',
  );

  // Navigate to default cohort if none is selected
  useEffect(() => {
    if (!currentCohortId && defaultCohortId) {
      router.replace(`/dashboard/groups?cohortId=${defaultCohortId}`);
    }
  }, [currentCohortId, defaultCohortId, router]);

  const handleCohortChange = (cohortId: string) => {
    if (cohortId) {
      startTransition(() => {
        setOptimisticCohortId(cohortId);
        router.push(`/dashboard/groups?cohortId=${cohortId}`);
      });
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-row w-full justify-between md:justify-start items-center gap-4">
        <div>الدفعة</div>
        <SearchSelect
          options={cohorts.map((cohort) => ({
            id: cohort.id,
            label: cohort.name,
          }))}
          value={optimisticCohortId}
          onChange={handleCohortChange}
          placeholder="اختر الدفعة"
          searchPlaceholder="ابحث عن دفعة..."
          emptyMessage="لم يتم العثور على دفعات."
          classNames={{
            container: 'flex-1 md:max-w-xs',
          }}
        />
      </CardContent>
    </Card>
  );
}
