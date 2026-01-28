import { getAllCohorts } from '@/lib/server/cohorts';
import { CohortNavigator } from './cohort-navigator';

export async function CohortNavigatorWrapper() {
  const cohorts = await getAllCohorts();
  return (
    <div>
      <CohortNavigator cohorts={cohorts} />
    </div>
  );
}
