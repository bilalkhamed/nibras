'use client';

import { usePathname } from 'next/navigation';
import labels from '@/lib/labels.json';

const VALID_SECTIONS = ['users', 'curriculum', 'statistics'] as const;

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[1] ?? 'users';

  const activeTab = (
    VALID_SECTIONS.includes(section as any) ? section : 'curriculum'
  ) as keyof typeof labels.dashboard.title;

  return (
    <div className="mb-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 leading-[3]">
        {labels.dashboard.title[activeTab] ?? labels.dashboard.title.curriculum}
      </h1>
    </div>
  );
}
