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
  Newspaper,
} from 'lucide-react';
import { canAccessStudentAssignments } from '../permissions/helpers';

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
    label: 'الأخبار',
    href: '/articles',
    icon: Newspaper,
  },
  {
    label: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
    auth: true,
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

const articles: SidebarNavItem = {
  label: 'المقالات',
  href: '/dashboard/articles',
  icon: Newspaper,
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
      label: 'المستويات',
      href: '/dashboard/levels',
      icon: FolderKanban,
    },
    {
      label: 'المشرفات',
      href: '/dashboard/supervisors',
      items: [
        {
          label: 'البرنامج التدريبي',
          href: '/dashboard/supervisors/training',
        },
      ],
    },
    {
      label: 'إدارة التقويم',
      href: '/dashboard/calendar',
      icon: CalendarCog,
    },
    programs,
    articles,
  ],
  supervisor: [
    {
      label: 'مجموعتي',
      href: '/dashboard/groups/[groupId]/info',
      icon: UsersRound,
    },
    {
      label: 'مهامي',
      href: '/dashboard/assignments',
      icon: BookOpen,
      canView: (session) => canAccessStudentAssignments(session),
    },
    {
      label: 'مساري',
      href: '/dashboard/history',
      icon: FolderClock,
      canView: (session) => canAccessStudentAssignments(session),
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
  media_team: [articles],
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
