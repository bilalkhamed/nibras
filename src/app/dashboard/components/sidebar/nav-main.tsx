'use client';

import { ChevronLeftIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { AccessTokenPayload, Role, SUPERVISOR_ROLE } from '@/types/types';
import { getActiveSidebarItem } from './page-title';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { sidebarNavItems } from '@/lib/shared/site.config';

export function NavMain({ session }: { session: AccessTokenPayload }) {
  const { role, supervisedGroupId } = session;

  const items = sidebarNavItems[role]
    .map((item) => {
      if (item.href.includes('[groupId]')) {
        if (!supervisedGroupId) return null;
        return {
          ...item,
          href: item.href.replace('[groupId]', supervisedGroupId),
        };
      }
      return item;
    })
    .filter(Boolean) as (typeof sidebarNavItems)[Role];

  const pathname = usePathname();
  const activeItem =
    role === SUPERVISOR_ROLE && pathname.includes('groups')
      ? sidebarNavItems[role].find((item) => item.label === 'مجموعتي')
      : getActiveSidebarItem(pathname);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>الرئيسية</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.canView && !item.canView(session)) return null;
          return (
            <Collapsible key={item.label} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  className={
                    activeItem?.label === item.label
                      ? 'text-primary hover:text-primary'
                      : ''
                  }
                >
                  <Link href={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:-rotate-90">
                        <ChevronLeftIcon className="cursor-pointer" />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.label}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.href}>
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
