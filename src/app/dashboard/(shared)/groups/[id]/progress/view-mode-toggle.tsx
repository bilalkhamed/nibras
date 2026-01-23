'use client';

import { Button } from '@/components/ui/button';
import { Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { ViewMode } from '@/types/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODES = [
  {
    value: 'student' as ViewMode,
    icon: Users,
    label: 'عرض حسب الطالبة',
    shortLabel: 'الطالبات',
  },
  {
    value: 'assignment' as ViewMode,
    icon: BookOpen,
    label: 'عرض حسب المهمة',
    shortLabel: 'المهام',
  },
] as const;

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  // Determine if we are in the second position (Assignment)
  const isSecondTab = viewMode === 'assignment';

  return (
    // 1. Use 'grid' for equal sizing and 'relative' to contain the absolute pill
    <div className="relative grid grid-cols-2 gap-1 p-1 bg-muted/50 dark:bg-muted/30 rounded-lg w-full isolate">
      {/* 2. The Animated Pill 
        - position: absolute
        - width: calc(50% - padding)
        - z-index: -10 (behind text)
      */}
      <div
        className={cn(
          'absolute inset-y-1 start-1 w-[calc(50%-0.25rem)]', // Adjust width based on gap/padding
          'bg-background dark:bg-background shadow-sm rounded-md rounded-2xl',
          'transition-transform duration-700 ease-in-out', // Smooth easing
          // 3. Slide Logic: Since you have Arabic text, I added RTL support
          isSecondTab
            ? 'translate-x-full rtl:-translate-x-full'
            : 'translate-x-0',
        )}
      />

      {VIEW_MODES.map((mode) => {
        const isActive = viewMode === mode.value;
        return (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange(mode.value)}
                className={cn(
                  // 4. Buttons are now transparent and sit on top (z-10)
                  'h-8 gap-2 transition-colors z-10 w-full ',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground  hover:bg-primary-soft/30 dark:hover:bg-muted/10',
                )}
              >
                <mode.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">
                  {mode.shortLabel}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">
              {mode.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
