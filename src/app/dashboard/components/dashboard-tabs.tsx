'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import labels from '@/lib/labels.json';
import { Users, BookOpen, BarChart3, Layers } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface TabItem {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const TABS: string[] = ['users', 'groups', 'curriculum', 'statistics'];

interface DashboardTabsProps {
  activeTab: 'users' | 'groups' | 'curriculum' | 'statistics';
}

export function DashboardTabs() {
  const router = useRouter();

  const handleTabChange = (newTab: string) => {
    router.push(`/dashboard/${newTab}`);
  };

  const pathname = usePathname();
  const pathSegments = pathname.split('/');
  let activeTab;
  if (TABS.includes(pathSegments[pathSegments.length - 1])) {
    activeTab = pathSegments.pop();
  } else activeTab = pathSegments[pathSegments.length - 2];

  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setSticky(y > 80);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabs: TabItem[] = [
    {
      key: 'users',
      label: labels.dashboard.nav.users,
      href: '/dashboard/users',
      icon: Users,
    },
    {
      key: 'groups',
      label: labels.dashboard.nav.groups || 'المجموعات',
      href: '/dashboard/groups',
      icon: Layers,
    },
    {
      key: 'curriculum',
      label: labels.dashboard.nav.curriculum,
      href: '/dashboard/curriculum',
      icon: BookOpen,
    },
    {
      key: 'statistics',
      label: labels.dashboard.nav.stats || labels.dashboard.stats.title,
      href: '/dashboard/statistics',
      icon: BarChart3,
    },
  ];

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
          'mx-auto flex max-w-6xl items-center justify-center gap-6 px-4 transition-all duration-300',
          sticky ? 'py-2' : 'py-3'
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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
              <span className="truncate">{tab.label}</span>
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
    </div>
  );
}
