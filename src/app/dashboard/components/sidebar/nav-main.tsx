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
import { Role } from '@/types/types';
import { getActiveSidebarItem } from './page-title';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { sidebarNavItems } from '@/lib/shared/site.config';

export function NavMain({ role }: { role: Role }) {
  const items = sidebarNavItems[role];
  const pathname = usePathname();
  const activeItem = getActiveSidebarItem(pathname);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>الرئيسية</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
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
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
