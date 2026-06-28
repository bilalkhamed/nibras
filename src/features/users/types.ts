import { Cohort, GradeLevel, Prisma, Role, User } from '@prisma/client';
import z from 'zod';

// ============================================================================
// Base DTOs
// ============================================================================

/** Core user fields for display purposes */

export const userSelect = {
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  email: true,
  role: true,
  birthYear: true,
  country: true,
  status: true,
  phone: true,
  username: true,
} satisfies Prisma.UserSelect;

export type UserDTO = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

/** Extended user DTO with timestamps */
export type UserWithTimestampsDTO = UserDTO & {
  createdAt: Date;
  updatedAt: Date;
};

export const studentProfileSelect = {
  address: true,
  gradeLevel: true,
  motherFullName: true,
  motherPhone: true,
  skills: true,
} satisfies Prisma.StudentProfileSelect;

export const userWithCohortSelect = {
  ...userSelect,
  cohort: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

/** User with cohort information */
export type UserWithCohortDTO = Prisma.UserGetPayload<{
  select: typeof userWithCohortSelect;
}>;

export const userWithCohortAndStudentProfileSelect = {
  ...userWithCohortSelect,
  studentProfile: { select: studentProfileSelect },
} satisfies Prisma.UserSelect;

/** User with cohort and student profile info */
export type UserWithCohortAndStudentProfileDTO = Prisma.UserGetPayload<{
  select: typeof userWithCohortAndStudentProfileSelect;
}>;

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
  username: true,
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
  programIds: z.array(z.string()).optional(),
});

/** Input for creating a new user */
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================================================
// Edit User Schemas
// ============================================================================

/** Schema for editing core user fields (no cohort or role) */
export const editUserSchema = z.object({
  firstName: z.string('الاسم الأول مطلوب').min(2, 'الاسم الأول مطلوب'),
  middleName: z.string('الاسم الثاني مطلوب').min(2, 'الاسم الثاني مطلوب'),
  lastName: z.string('اسم العائلة مطلوب').min(2, 'اسم العائلة مطلوب'),
  email: z
    .string('البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح')
    .optional()
    .or(z.literal('')),
  birthYear: z
    .number('سنة الميلاد مطلوبة')
    .min(1900, 'سنة الميلاد غير صحيحة')
    .max(new Date().getFullYear() - 11, 'سنة الميلاد غير صحيحة'),
  country: z.string('الدولة مطلوبة').length(2, 'الدولة مطلوبة'),
});

export type EditUserInput = z.infer<typeof editUserSchema>;

/** Schema for editing the student profile fields (all optional) */
export const editUserProfileSchema = z.object({
  gradeLevel: z
    .nativeEnum(GradeLevel, { message: 'المرحلة الدراسية غير صحيحة' })
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, 'العنوان طويل جداً')
    .optional()
    .or(z.literal('')),
  motherFullName: z
    .string()
    .max(100, 'اسم الأم طويل جداً')
    .optional()
    .or(z.literal('')),
  motherPhone: z
    .string()
    .max(20, 'رقم الهاتف طويل جداً')
    .optional()
    .or(z.literal('')),
});

export type EditUserProfileInput = z.infer<typeof editUserProfileSchema>;

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
