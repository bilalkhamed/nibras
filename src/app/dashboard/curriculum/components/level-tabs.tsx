'use client';

import labels from '@/lib/labels.json';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface LevelTabsProps {
  // optional override; if undefined we read from URL
  activeIndex?: number;
}

export function LevelTabs({ activeIndex }: LevelTabsProps) {
  const levels = labels.dashboard.curriculum.levels;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLevelFromUrl = Number(searchParams.get('level') ?? '0');
  const resolvedActive = isNaN(currentLevelFromUrl) ? 0 : currentLevelFromUrl;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSelect = (i: number) => {
    const qs = createQueryString('level', String(i));
    router.push(`${pathname}?${qs}`);
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
