import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSidebarSkeleton() {
  return (
    <Sidebar variant="sidebar" dir="rtl" side="right" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" disabled>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted animate-pulse" />
              <Skeleton className="h-5 w-24" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 space-y-4">
        {/* Skeleton items for NavMain */}
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <SidebarMenuSkeleton key={i} showIcon />
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {/* Skeleton item for NavUser */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-12" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
