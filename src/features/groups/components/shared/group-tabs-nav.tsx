'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/shared/utils';

interface GroupTabsNavProps {
  hrefBase: string;
}

export function GroupTabsNav({ hrefBase }: GroupTabsNavProps) {
  const pathname = usePathname();

  const isProgressTab = pathname.includes('/progress');
  const isInfoTab = pathname.includes('/info');

  const tabValue = isProgressTab ? 'progress' : isInfoTab ? 'info' : 'info';

  const tabs = [
    { value: 'info', label: 'معلومات المجموعة' },
    { value: 'progress', label: 'تقدم الطالبات' },
  ];

  return (
    <Tabs value={tabValue} dir="rtl">
      <div className="overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <TabsList className="inline-flex md:flex md:w-full h-auto gap-2 rounded-xl bg-muted/60 p-1.5 border border-border backdrop-blur-sm min-w-fit md:min-w-0">
          {tabs.map((tab) => {
            const isActive = tabValue === tab.value;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                asChild
                className={cn(
                  'cursor-pointer',
                  'group relative inline-flex items-center gap-2 rounded-md px-4 py-2',
                  'text-sm font-medium transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  'data-[state=active]:text-primary',
                  'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
                  'data-[state=inactive]:hover:bg-background/60',
                )}
              >
                <Link href={`${hrefBase}/${tab.value}`}>
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={cn(
                      'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300',
                      isActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-60 group-hover:opacity-60',
                    )}
                  />
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}
