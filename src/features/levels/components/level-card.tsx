import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { LevelListDTO } from '../types';
import { EditLevelSheet } from './management/edit-level-sheet';
import { DeleteLevelDialog } from './management/delete-level-dialog';
import { toArabicNumerals } from '@/lib/shared/utils';

interface LevelCardProps {
  level: LevelListDTO;
}

export function LevelCard({ level }: LevelCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            {level.title}
            <span className="text-sm font-normal text-muted-foreground mr-2">
              (مستوى رقم {toArabicNumerals(level.number)})
            </span>
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <EditLevelSheet level={level}>
            <Button variant="ghost" size="icon" className="text-primary">
              <Edit2 className="h-4 w-4" />
            </Button>
          </EditLevelSheet>
          <DeleteLevelDialog levelId={level.id} levelTitle={level.title} />
        </div>
      </CardHeader>
    </Card>
  );
}
