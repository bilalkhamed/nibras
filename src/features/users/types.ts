import { Cohort, Prisma, User } from '@prisma/client';

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

const userByEmailSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  hashedPassword: true,
  firstName: true,
  lastName: true,
  groupsAsStudent: {
    where: { isActive: true },
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
export type UserWithRoleAndCohortDTO = Pick<User, 'id' | 'role' | 'cohortId'>;

// ============================================================================
// Mutation DTOs
// ============================================================================

/** Input for creating a new user */
export type CreateUserInput = {
  firstName: string;
  middleName: string;
  lastName: string;
  birthYear: number;
  country: string;
  role: 'student' | 'supervisor';
  cohortId?: string;
};

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
