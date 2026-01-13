'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const themes = [
  { id: 'light', label: 'الوضع الفاتح', icon: Sun, color: 'text-primary' },
  { id: 'dark', label: 'الوضع الداكن', icon: Moon, color: 'text-[#ff7a3a]' },
  { id: 'system', label: 'نظام الجهاز', icon: Monitor, color: '' },
];

export function SidebarThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-1 items-center justify-between ps-2" dir="rtl">
      <div className="text-sm text-muted-foreground">المظهر</div>
      <div>
        {themes.map(({ id, label, icon: Icon, color }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(id)}
                className={theme === id ? 'bg-sidebar-accent' : ''}
                aria-label={label}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </Button>
            </TooltipTrigger>

            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
