import { Cohort, Prisma, Role, User } from '@prisma/client';
import z from 'zod';

// ============================================================================
// Base DTOs
// ============================================================================

/** Core user fields for display purposes */
export type UserDTO = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'email'
  | 'role'
  | 'birthYear'
  | 'country'
  | 'status'
  | 'phone'
>;

/** Extended user DTO with timestamps */
export type UserWithTimestampsDTO = UserDTO & {
  createdAt: Date;
  updatedAt: Date;
};

/** User with cohort information */
export type UserWithCohortDTO = UserDTO & {
  cohort: Pick<Cohort, 'id' | 'name'> | null;
};

/** User with timestamps and cohort */
export type UserWithCohortAndTimestampsDTO = UserWithTimestampsDTO & {
  cohort: Pick<Cohort, 'id' | 'name'> | null;
};

// ============================================================================
// Minimal DTOs (for dropdowns, lists)
// ============================================================================

/** Minimal user info for name-only displays */
export type UserNameDTO = Pick<
  User,
  'id' | 'firstName' | 'middleName' | 'lastName'
>;

/** User with basic role info */
export type UserBasicDTO = UserNameDTO &
  Pick<User, 'email' | 'role' | 'birthYear'>;

// ============================================================================
// Dashboard DTOs
// ============================================================================

/** For admin dashboard: recent user activity */
export type RecentUserDTO = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'role' | 'createdAt'
>;

/** For student dashboard: basic student info with cohort */
export type StudentBasicInfoDTO = {
  firstName: string;
  cohort: {
    name: string;
    currentLevel: { number: number };
  } | null;
};

/** For supervisor dashboard: student with assignment completion info */
export type StudentWithAssignmentsDTO = {
  id: string;
  firstName: string;
  lastName: string;
  groupsAsStudent: {
    group: { name: string };
  }[];
  studentAssignments: { id: string }[];
};

// ============================================================================
// Auth & Invite DTOs
// ============================================================================

export const userByEmailSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  hashedPassword: true,
  firstName: true,
  lastName: true,
  supervisedGroupId: true,
  supervisorStatus: true,
  groupsAsStudent: {
    where: { isActive: true },
  },
  managedCohorts: {
    select: { cohortId: true },
  },
  cohort: {
    select: {
      currentLevelId: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserByEmail = Prisma.UserGetPayload<{
  select: typeof userByEmailSelect;
}>;

/** User with invite status check (for regenerating invites) */
export type UserInviteStatusDTO = Pick<User, 'id' | 'status'>;

/** User with role and cohort for validation */
export type UserWithRoleAndCohortAndGroupDTO = Pick<
  User,
  'id' | 'role' | 'cohortId' | 'supervisedGroupId'
>;

// ============================================================================
// Mutation DTOs
// ============================================================================

export const createUserSchema = z.object({
  firstName: z.string('الاسم الأول مطلوب').min(2, 'الاسم الأول مطلوب'),
  middleName: z.string('الاسم الثاني مطلوب').min(2, 'الاسم الثاني مطلوب'),
  lastName: z.string('اسم العائلة مطلوب').min(2, 'اسم العائلة مطلوب'),
  birthYear: z
    .number('سنة الميلاد مطلوبة')
    .min(1900, 'سنة الميلاد غير صحيحة')
    .max(new Date().getFullYear() - 11, 'سنة الميلاد غير صحيحة'),
  cohortId: z.string('الدفعة مطلوبة').min(1, 'الدفعة مطلوبة').optional(),
  country: z.string('الدولة مطلوبة').length(2, 'الدولة مطلوبة'),
  role: z.enum(
    Object.keys(Role).filter((key) => key !== 'admin') as Array<
      keyof typeof Role
    >,
    'الرتبة مطلوبة',
  ),
});

/** Input for creating a new user */
export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Response after creating a user */
export type CreatedUserDTO = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'role'
>;

/** Result of create user with invite code */
export type CreateUserResult = {
  user: CreatedUserDTO;
  inviteCode: string;
};
