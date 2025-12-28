'use client';

import { usePathname } from 'next/navigation';
import { sidebarNavItems } from '@/lib/shared/site.config';

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

function flattenSidebarItems() {
  const roleItems = Object.values(sidebarNavItems).flat();
  const all = [...roleItems];
  for (const item of roleItems) {
    if (item.items?.length) {
      all.push(...item.items);
    }
  }
  return all;
}

export function DashboardTitle() {
  const pathname = usePathname();

  return getActiveSidebarItem(pathname)?.label ?? 'الرئيسية';
}

export function getActiveSidebarItem(path: string) {
  const currentPath = normalizePath(path);

  const items = flattenSidebarItems();

  const bestMatch = items
    .filter((item) => {
      const href = normalizePath(item.href);
      return currentPath === href || currentPath.startsWith(`${href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  return bestMatch ?? null;
}
