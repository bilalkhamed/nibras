import { NavItem, SidebarNavItem } from '@/types/types';
import {
  Home,
  NotebookPen,
  UserRound,
  LayoutDashboard,
  BookOpen,
  ListOrdered,
  UsersRound,
  ChartColumn,
} from 'lucide-react';

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

export const sidebarNavItems: {
  admin: SidebarNavItem[];
  supervisor: SidebarNavItem[];
  student: SidebarNavItem[];
} = {
  admin: [
    {
      label: 'المستخدمون',
      href: '/dashboard/users',
      icon: UserRound,
      isActive: true,
    },
    { label: 'المجموعات', href: '/dashboard/groups', icon: UsersRound },
    { label: 'المستويات', href: '/dashboard/levels', icon: ListOrdered },
    {
      label: 'البرامج',
      href: '/dashboard/programs',
      items: [
        { label: 'البرنامج القرائي', href: '/dashboard/programs/reading' },
        { label: 'البرنامج التربوي', href: '/dashboard/programs/lectures' },
        { label: 'ليطمئن قلبي', href: '/dashboard/programs/heart' },
      ],
    },
    { label: 'التقارير', href: '/dashboard/reports', icon: ChartColumn },
  ],
  supervisor: [
    { label: 'مجموعاتي', href: '/dashboard/groups', icon: UsersRound },
    { label: 'التقارير', href: '/dashboard/my-reports', icon: ChartColumn },
  ],
  student: [
    { label: 'مجموعتي', href: '/dashboard/my-group', icon: UsersRound },
    { label: 'مهامي', href: '/dashboard/assignments', icon: BookOpen },
  ],
};

export const hideNavbarOnRoutes: string[] = [
  '/login',
  '/register',
  '/dashboard',
  '/dashboard',
];

const config = {
  hideNavbarOnRoutes,
  navItems,
  sidebarNavItems,
};

// export { sidebarNavItems };
export default config;
