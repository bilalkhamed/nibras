'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/shared/utils';

type Level = {
  title: string;
  slug: string;
};

export function LevelTabs({
  programSlug,
  levels,
}: {
  programSlug: string;
  levels: Level[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeProgram = pathname
    .split('/')
    .find((segment) => segment.startsWith('level'));

  return (
    <Tabs
      dir="rtl"
      value={activeProgram}
      onValueChange={(value) => {
        router.push(`/dashboard/programs/${programSlug}/${value}`);
      }}
    >
      <div className="overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <TabsList className="inline-flex md:flex md:w-full h-auto gap-2 rounded-xl bg-muted/60 p-1.5 border border-border backdrop-blur-sm min-w-fit md:min-w-0">
          {levels.map((level) => {
            const isActive = activeProgram === level.slug;
            return (
              <TabsTrigger
                key={level.slug}
                value={level.slug}
                className={cn(
                  'cursor-pointer',
                  'group relative inline-flex items-center gap-2 rounded-md px-4 py-2',
                  'text-sm font-medium transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  'data-[state=active]:text-primary',
                  'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
                  'data-[state=inactive]:hover:bg-background/60'
                )}
              >
                <span className="truncate">{level.title}</span>
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300',
                    isActive
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-60 group-hover:opacity-60'
                  )}
                />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}
