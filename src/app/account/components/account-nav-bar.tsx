'use client';

import {
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Tab = 'account' | 'settings';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  sticky: boolean;
};

export function AccountNavBar({ activeTab, onTabChange, sticky }: Props) {
  const router = useRouter();

  const tabs = [
    { key: 'account' as const, label: 'الحساب', icon: UserIcon },
    { key: 'settings' as const, label: 'الإعدادات', icon: SettingsIcon },
  ];

  const handleLogOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/login');
  };

  return (
    <div
      className={cn(
        'relative z-40 border-b border-border',
        sticky
          ? 'sticky top-0 animate-in fade-in slide-in-from-top bg-muted/70 backdrop-blur-sm shadow-md'
          : 'bg-muted/60 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 transition-all duration-300',
          sticky ? 'py-2' : 'py-3'
        )}
      >
        <div className="flex items-center gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  'cursor-pointer group relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="truncate">{t.label}</span>
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300',
                    active
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-60 group-hover:opacity-60'
                  )}
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleLogOut}>
            <LogOut className="h-4 w-4 mr-2" /> تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
