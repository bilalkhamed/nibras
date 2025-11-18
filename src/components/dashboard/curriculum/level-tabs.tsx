import React from 'react';
import labels from '@/lib/labels.json';
import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';

interface LevelTabsProps {
  activeIndex: number;
  onChange: (index: number) => void;
}

export function LevelTabs({ activeIndex, onChange }: LevelTabsProps) {
  const levels = labels.dashboard.curriculum.levels;
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((lvl, i) => (
        <Button
          key={lvl}
          onClick={() => onChange(i)}
          variant={i === activeIndex ? 'primary' : 'outline'}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all'
          )}
        >
          {lvl}
        </Button>
      ))}
    </div>
  );
}
