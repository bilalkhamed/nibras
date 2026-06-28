import { CohortCard } from './cohort-card';
import { CohortListDetailedDTO } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircleIcon } from 'lucide-react';

type CohortListProps = {
  cohorts: CohortListDetailedDTO[];
  isDirector?: boolean;
};

export function CohortList({ cohorts, isDirector }: CohortListProps) {
  if (!cohorts.length) {
    return (
      <div className="flex items-center justify-center">
        <Alert variant="warning" className="max-w-md">
          <XCircleIcon className="h-4 w-4 shrink-0 mr-2" />
          <AlertTitle>لا توجد دفعات متاحة.</AlertTitle>
          <AlertDescription>
            يمكنك إنشاء دفعة جديدة من خلال الزر في الأعلى
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cohorts.map((cohort) => (
        <CohortCard key={cohort.id} cohort={cohort} isDirector={isDirector} />
      ))}
    </div>
  );
}
