import { getAllCohorts } from '@/features/cohorts/service';
import { CohortNavigator } from './cohort-navigator';

export async function CohortNavigatorWrapper() {
  const result = await getAllCohorts();

  // Handle errors gracefully
  if (!result.success) {
    return null;
  }

  const cohorts = result.data;

  return (
    <div>
      <CohortNavigator cohorts={cohorts} />
    </div>
  );
}
