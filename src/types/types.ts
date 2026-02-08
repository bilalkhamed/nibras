import {
  Role,
  UserStatus,
  CohortStatus,
  User as PrismaUser,
  Level,
  AssignmentTypes,
  Assignment,
  AssignmentAttachment,
  SupervisorStatus,
} from '@prisma/client';
import labels from '@/lib/labels.json';

export const ADMIN_ROLE = 'admin';
export const SUPERVISOR_ROLE = 'supervisor';
export const STUDENT_ROLE = 'student';
export const COHORT_MANAGER_ROLE = 'cohort_manager';
export const GROUP_MANAGER_ROLE = 'group_manager';

export const ACTIVE_STATUS = UserStatus.active;
export const SUSPENDED_STATUS = UserStatus.suspended;
export const DELETED_STATUS = UserStatus.deleted;
export const INVITED_STATUS = UserStatus.invited;

export { Role, UserStatus, CohortStatus, AssignmentTypes };

export type AccessTokenPayload = {
  userId: string;
  role: Role;
  expiresAt: Date;
  status: UserStatus;
  firstName: string;
  lastName: string;
  currentLevelId: string | null;
  activeGroupId: string | null;
  supervisedGroupId: string | null;
  managedCohortId: string | null;
  supervisorStatus: SupervisorStatus | null;
};

export type CountryCode = keyof typeof labels.countries;

// export interface User {
//   id: string;
//   email: string;
//   role: Role;
//   firstName: string;
//   middleName: string;
//   lastName: string;
//   birthYear: number;
//   status: UserStatus;
//   country?: CountryCode | null;
//   phone?: string | null;
//   cohort?: Cohort | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

export type User = Omit<
  PrismaUser,
  'hashedPassword' | 'country' | 'cohortId'
> & {
  country?: CountryCode | null;
  cohortId?: string | null;
  cohort?: Cohort | null;
};

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  supervisor: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  cohort: {
    currentLevel: Level;
    name: string;
  };
  _count: {
    students: number;
  };
}

export type Cohort = {
  id: string;
  name: string;
  currentLevel?: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  auth?: boolean; // requires logged-in user
  role?: 'admin'; // restrict to role
};

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: React.ElementType;
  items?: Omit<SidebarNavItem, 'items' | 'icon' | 'isActive'>[];
  isActive?: boolean;
};

export type AssignmentWithAttachments = Assignment & {
  attachments: (AssignmentAttachment & { tempUrl: string })[];
};
