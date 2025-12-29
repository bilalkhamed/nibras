'use client';

import * as React from 'react';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { sidebarNavItems } from '@/lib/shared/site.config';
import Link from 'next/link';
import { AccessTokenPayload } from '@/types/types';

export function DashboardSidebar({
  auth,
  ...props
}: { auth: AccessTokenPayload } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      {...props}
      dir="rtl"
      side="right"
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={'/dashboard'}>
                <div className=" text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
                </div>
                <span className="truncate font-bold ">برنامج نبراس</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarNavItems[auth.role]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            firstName: auth.firstName,
            lastName: auth.lastName,
            role: auth.role,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
