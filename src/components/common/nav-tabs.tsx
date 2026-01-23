'use client';

import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/shared/utils';

export type NavTabItem = {
  label: string;
  value: string;
};

type NavTabsProps = {
  items: NavTabItem[];
  /**
   * Function to generate the navigation path for each tab
   * @param value - The value of the selected tab
   * @returns The path to navigate to
   */
  getPath: (value: string) => string;
  /**
   * Function to determine the active tab value from the current URL
   * @param pathname - The current pathname
   * @param searchParams - The current search params
   * @returns The value of the active tab
   */
  getActiveValue?: (
    pathname: string,
    searchParams: URLSearchParams,
  ) => string | undefined;
  /**
   * Optional: The direction of the tabs (default: 'rtl')
   */
  dir?: 'rtl' | 'ltr';
  /**
   * Optional: Custom class name for the tabs container
   */
  className?: string;
  /**
   * Optional: Custom class name for the tabs list
   */
  listClassName?: string;
  /**
   * Optional: Custom class name for each tab trigger
   */
  triggerClassName?: string;
  /**
   * Optional: Default value to use when no active tab is detected.
   * Will automatically navigate to the default tab's path on mount.
   */
  defaultValue?: string;
};

export function NavTabs({
  items,
  getPath,
  getActiveValue,
  dir = 'rtl',
  className,
  listClassName,
  triggerClassName,
  defaultValue,
}: NavTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const detectedValue = getActiveValue
    ? getActiveValue(pathname, searchParams)
    : items.find((item) => pathname.includes(item.value))?.value;

  const activeValue = detectedValue ?? defaultValue;

  // Navigate to default value path if no value is detected from URL
  useEffect(() => {
    if (!detectedValue && defaultValue) {
      router.replace(getPath(defaultValue));
    }
  }, [detectedValue, defaultValue, getPath, router]);

  return (
    <Tabs
      dir={dir}
      value={activeValue}
      onValueChange={(value) => {
        router.push(getPath(value));
      }}
      className={className}
    >
      <div className="overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <TabsList
          className={cn(
            'inline-flex md:flex md:w-full h-auto gap-2 rounded-xl bg-muted/60 p-1.5 border border-border backdrop-blur-sm min-w-fit md:min-w-0',
            listClassName,
          )}
        >
          {items.map((item) => {
            const isActive = activeValue === item.value;
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  'cursor-pointer',
                  'group relative inline-flex items-center gap-2 rounded-md px-4 py-2',
                  'text-sm font-medium transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  'data-[state=active]:text-primary',
                  'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
                  'data-[state=inactive]:hover:bg-background/60',
                  triggerClassName,
                )}
              >
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300',
                    isActive
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-60 group-hover:opacity-60',
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
