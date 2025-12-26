import { NavItem } from '@/types/types';
import { Home, NotebookPen, UserRound, LayoutDashboard } from 'lucide-react';

export const navItems: NavItem[] = [
  {
    label: 'الرئيسية',
    href: '/',
    icon: Home,
  },
  {
    label: 'خطة البرنامج',
    href: '/plan',
    icon: NotebookPen,
  },
  {
    label: 'حسابي',
    href: '/account',
    icon: UserRound,
    auth: true,
  },
  {
    label: 'الإدارة',
    href: '/dashboard',
    icon: LayoutDashboard,
    auth: true,
    role: 'admin',
  },
];

export const hideNavbarOnRoutes: string[] = [
  '/login',
  '/register',
  '/dashboard',
];

const config = {
  hideNavbarOnRoutes,
  navItems,
};

export default config;
