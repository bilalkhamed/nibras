'use client';

import { BellIcon, ChevronsUpDown, LogOutIcon, User2Icon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { Role } from '@/types/types';
import labels from '@/lib/labels.json';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SidebarThemeSwitch } from './sidebar-theme-switch';

export function NavUser({
  user,
}: {
  user: {
    firstName: string;
    lastName: string;
    role: Role;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const handleLogOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/');
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              variant={'default'}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-right  text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs">
                  {labels.dashboard.users[user.role]}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'top'}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuGroup dir="rtl">
              <DropdownMenuItem>
                <User2Icon />
                <Link href="/dashboard/profile">معلومات الحساب</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                الإشعارات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <SidebarThemeSwitch />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              dir="rtl"
              // className="text-destructive hover:bg-destructive/10 "
              variant="destructive"
              onClick={handleLogOut}
            >
              <LogOutIcon />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
