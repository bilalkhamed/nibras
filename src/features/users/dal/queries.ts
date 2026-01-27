'use cache';

import { runDalOperation } from '@/lib/server/dal/helpers';
import { DalReturn } from '@/lib/server/dal/types';
import prisma from '@/lib/server/prisma';
import { Role } from '@prisma/client';
import { cacheTag } from 'next/cache';
import {
  RecentUserDTO,
  StudentBasicInfoDTO,
  StudentWithAssignmentsDTO,
  UserBasicDTO,
  UserByEmail,
  UserInviteStatusDTO,
  UserNameDTO,
  UserWithCohortAndTimestampsDTO,
  UserWithCohortDTO,
  UserWithRoleAndCohortDTO,
} from '../types';

// ============================================================================
// Basic Read Operations
// ============================================================================

/** Find all users (excluding admins) with cohort info */
export async function findManyUsers(): Promise<DalReturn<UserWithCohortDTO[]>> {
  cacheTag('users');
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: {
        role: { not: Role.admin },
      },
      select: {
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
        cohort: { select: { id: true, name: true } },
      },
    });
  });
}

/** Find all users with timestamps (for admin lists) */
export async function findManyUsersWithTimestamps(): Promise<
  DalReturn<UserWithCohortAndTimestampsDTO[]>
> {
  cacheTag('users');
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: {
        role: { not: Role.admin },
      },
      select: {
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
        createdAt: true,
        updatedAt: true,
        cohort: { select: { id: true, name: true } },
      },
    });
  });
}

/** Find user by ID with cohort info */
export async function findUserById(
  id: string,
): Promise<DalReturn<UserWithCohortDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
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
        cohort: { select: { id: true, name: true } },
      },
    });
  });
}

/** Find user by email (for authentication) */
export async function findUserByEmail(
  email: string,
): Promise<DalReturn<UserByEmail | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
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
      },
    });
  });
}

// ============================================================================
// Filtered Queries
// ============================================================================

export type FindUsersWithFiltersParams = {
  role?: Role;
  groupStatus?: 'inactive';
  cohortId?: string;
};

/** Find users with name-only fields (for dropdowns) */
export async function findUsersNameOnly(
  filters?: FindUsersWithFiltersParams,
): Promise<DalReturn<UserNameDTO[]>> {
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: {
        role: filters?.role,
        groupsAsStudent:
          filters?.groupStatus === 'inactive'
            ? { none: { isActive: true } }
            : undefined,
        cohortId: filters?.cohortId,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}

/** Find users with basic info (for tables) */
export async function findUsersBasic(
  filters?: FindUsersWithFiltersParams,
): Promise<DalReturn<UserBasicDTO[]>> {
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: {
        role: filters?.role,
        groupsAsStudent:
          filters?.groupStatus === 'inactive'
            ? { none: { isActive: true } }
            : undefined,
        cohortId: filters?.cohortId,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        birthYear: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });
}

// ============================================================================
// Dashboard Queries
// ============================================================================

/** Count users grouped by role (for admin dashboard stats) */
export async function countUsersByRole() {
  return runDalOperation(async () => {
    return await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: {
        status: { not: 'deleted' },
      },
    });
  });
}

/** Find recently created active users (for admin dashboard) */
export async function findRecentUsers(
  limit: number = 5,
): Promise<DalReturn<RecentUserDTO[]>> {
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  });
}

/** Find student basic info for student dashboard */
export async function findStudentBasicInfo(
  userId: string,
): Promise<DalReturn<StudentBasicInfoDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        cohort: {
          select: {
            name: true,
            currentLevel: { select: { number: true } },
          },
        },
      },
    });
  });
}

/** Find students with assignment completion (for supervisor dashboard) */
export async function findStudentsBySuperviorWithAssignments(
  supervisorId: string,
  limit: number = 100,
): Promise<DalReturn<StudentWithAssignmentsDTO[]>> {
  return runDalOperation(async () => {
    return await prisma.user.findMany({
      where: {
        role: 'student',
        groupsAsStudent: {
          some: {
            isActive: true,
            group: { supervisorId },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        groupsAsStudent: {
          where: { isActive: true },
          select: { group: { select: { name: true } } },
          take: 1,
        },
        studentAssignments: {
          where: { isCompleted: true },
          select: { id: true },
        },
      },
      take: limit,
    });
  });
}

// ============================================================================
// Validation Queries
// ============================================================================

/** Find user for invite validation */
export async function findUserForInvite(
  userId: string,
): Promise<DalReturn<UserInviteStatusDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
  });
}

/** Find user with role and cohort (for group assignment validation) */
export async function findUserWithRoleAndCohort(
  userId: string,
): Promise<DalReturn<UserWithRoleAndCohortDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        cohortId: true,
      },
    });
  });
}

/** Find user by first name (for testing/seeding) */
export async function findUserByFirstName(
  firstName: string,
): Promise<DalReturn<{ id: string } | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findFirst({
      where: { firstName },
      select: { id: true },
    });
  });
}
