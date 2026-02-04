'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { useWeekManager } from './week-manager-context';

export function AddWeekButton() {
  const { addWeek } = useWeekManager();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="relative h-12 flex items-center justify-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'absolute inset-x-0 flex items-center justify-center transition-all duration-200',
          isHovered ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 bg-background/80 backdrop-blur-sm border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
          onClick={addWeek}
        >
          <PlusIcon className="size-3" />
          <span>إضافة أسبوع</span>
        </Button>
      </div>
    </div>
  );
}
