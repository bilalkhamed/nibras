import { LevelCard } from './level-card';
import { LevelListDTO } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircleIcon } from 'lucide-react';

interface LevelListProps {
  levels: LevelListDTO[];
  isDirector?: boolean;
}

export function LevelList({ levels, isDirector }: LevelListProps) {
  if (!levels.length) {
    return (
      <div className="flex items-center justify-center">
        <Alert variant="warning" className="max-w-md">
          <XCircleIcon className="h-4 w-4 shrink-0 mr-2" />
          <AlertTitle>لا توجد مستويات متاحة.</AlertTitle>
          <AlertDescription>
            يمكنك إنشاء مستوى جديد من خلال الزر في الأعلى
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {levels.map((level) => (
        <LevelCard key={level.id} level={level} isDirector={isDirector} />
      ))}
    </div>
  );
}
