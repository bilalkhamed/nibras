'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSwitch() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-primary" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-[#ff7a3a]" />
          <span className="sr-only">تغيير الوضع</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="bg-card text-foreground border border-border"
      >
        <DropdownMenuItem onClick={() => setTheme('light')}>
          الوضع الفاتح
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          الوضع الداكن
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          نظام الجهاز
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
