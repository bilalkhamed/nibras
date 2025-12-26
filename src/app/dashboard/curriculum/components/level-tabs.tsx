'use client';

import labels from '@/lib/labels.json';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface LevelTabsProps {
  // optional override; if undefined we read from URL
  activeIndex?: number;
  onChange?: (i: number) => void;
}

export function LevelTabs({ activeIndex, onChange }: LevelTabsProps) {
  const levelsObj = labels.dashboard.curriculum.levels;
  const levels = Object.values(levelsObj);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLevelFromUrl = Number(searchParams.get('level') ?? '0');
  const resolvedActive =
    activeIndex !== undefined
      ? activeIndex
      : isNaN(currentLevelFromUrl)
      ? 0
      : currentLevelFromUrl;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSelect = (i: number) => {
    if (onChange) {
      onChange(i);
    } else {
      const qs = createQueryString('level', String(i));
      router.push(`${pathname}?${qs}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((lvl, i) => {
        const active = i === resolvedActive;
        return (
          <Button
            key={lvl}
            variant={active ? 'primary' : 'outline'}
            onClick={() => handleSelect(i)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              active && 'ring-2 ring-primary/40'
            )}
            aria-pressed={active}
          >
            {lvl}
          </Button>
        );
      })}
    </div>
  );
}
