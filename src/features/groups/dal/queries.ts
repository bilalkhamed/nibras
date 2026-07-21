/**
 * Groups DAL - Query Operations
 *
 * Pure database queries for group data retrieval.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import {
  type GroupDetailDTO,
  type GroupListItemDTO,
  type GetGroupsOptions,
  type GroupStudentDTO,
  myGroupStudentSelect,
  selectGroupDetail,
} from '../types';

// ============================================================================
// Single Group Queries
// ============================================================================

/**
 * Find a group by ID with full details
 * Includes supervisor, students, and cohort information
 *
 * @param groupId - The group ID
 * @returns Group with full details or null if not found
 */
export async function findGroupById(
  groupId: string,
): Promise<DalReturn<GroupDetailDTO | null>> {
  'use cache';
  cacheTag(`group-${groupId}`);

  return runDalOperation(async () => {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: selectGroupDetail,
    });

    if (!group) return null;

    return {
      ...group,
      managers: group.managers.map((m) => m.user) || [],
    };
  });
}

// ============================================================================
// Group List Queries
// ============================================================================

/**
 * Find groups with optional filtering
 * Returns groups with supervisor info and student counts
 *
 * @param options - Filter options (supervisorId, cohortId)
 * @returns Array of groups with list-view info
 */
export async function findGroups(
  options: GetGroupsOptions = {},
): Promise<DalReturn<GroupListItemDTO[]>> {
  'use cache';
  cacheTag('groups-list');

  return runDalOperation(async () => {
    return prisma.group.findMany({
      where: {
        supervisors: options.supervisorId
          ? {
              some: {
                id: options.supervisorId,
              },
            }
          : undefined,
        cohortId: options.cohortId,
        managers: options.managerId
          ? {
              some: {
                userId: options.managerId,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        cohort: {
          select: {
            id: true,
            name: true,
            currentLevel: true,
          },
        },
        supervisors: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        managers: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });
  });
}

/**
 * Find groups supervised by a specific user
 *
 * @param supervisorId - The supervisor's user ID
 * @returns Array of groups supervised by the user
 */
export async function findGroupsBySupervisor(
  supervisorId: string,
): Promise<DalReturn<GroupListItemDTO[]>> {
  return findGroups({ supervisorId });
}

export async function findStudentGroups(
  studentId: string,
): Promise<DalReturn<GroupStudentDTO[]>> {
  return runDalOperation(async () => {
    return await prisma.groupStudent.findMany({
      where: {
        studentId,
      },

      select: myGroupStudentSelect,
    });
  });
}

export async function findStudentActiveGroup(
  studentId: string,
): Promise<DalReturn<GroupStudentDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.groupStudent.findFirst({
      where: {
        studentId,
        isActive: true,
      },

      select: myGroupStudentSelect,
    });
  });
}

// ============================================================================
// Stats Queries
// ============================================================================

/**
 * Count groups with optional filtering
 *
 * @param filters - Filter options (cohortId)
 * @returns Number of groups matching filters
 */
export async function countGroups(filters?: {
  cohortId?: string;
}): Promise<DalReturn<{ count: number }>> {
  return runDalOperation(async () => {
    const count = await prisma.group.count({
      where: {
        cohortId: filters?.cohortId,
      },
    });
    return { count };
  });
}
