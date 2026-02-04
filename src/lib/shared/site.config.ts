import { NavItem, Role, SidebarNavItem } from '@/types/types';
import {
  Home,
  NotebookPen,
  UserRound,
  LayoutDashboard,
  BookOpen,
  UsersRound,
  FolderClock,
  FolderKanban,
  CalendarCog,
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

const programs: SidebarNavItem = {
  label: 'البرامج',
  href: '/dashboard/programs',
  items: [
    { label: 'البرنامج القرائي', href: '/dashboard/programs/reading' },
    { label: 'عرفتك ربي', href: '/dashboard/programs/lectures' },
    { label: 'ليطمئن قلبي', href: '/dashboard/programs/heart' },
  ],
};

export const sidebarNavItems: Record<Role, SidebarNavItem[]> = {
  admin: [
    {
      label: 'المستخدمون',
      href: '/dashboard/users',
      icon: UserRound,
      isActive: true,
    },
    { label: 'المجموعات', href: '/dashboard/groups/', icon: UsersRound },
    {
      label: 'إدارة الدفعات',
      href: '/dashboard/cohorts',
      icon: FolderKanban,
    },
    {
      label: 'إدارة التقويم',
      href: '/dashboard/calendar',
      icon: CalendarCog,
    },
    programs,
  ],
  supervisor: [
    {
      label: 'مجموعتي',
      href: '/dashboard/groups/[groupId]/info',
      icon: UsersRound,
    },
  ],
  student: [
    { label: 'مجموعتي', href: '/dashboard/my-group', icon: UsersRound },
    { label: 'مهامي', href: '/dashboard/assignments', icon: BookOpen },
    { label: 'مساري', href: '/dashboard/history', icon: FolderClock },
  ],

  cohort_manager: [
    {
      label: 'المستخدمون',
      href: '/dashboard/users',
      icon: UserRound,
    },
    {
      label: 'المجموعات',
      href: '/dashboard/groups/',
      icon: UsersRound,
    },
  ],
  group_manager: [
    {
      label: 'المجموعات',
      href: '/dashboard/groups/',
      icon: UsersRound,
    },
  ],
  media_team: [],
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
