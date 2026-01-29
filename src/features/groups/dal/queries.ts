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
import type {
  GroupDetailDTO,
  GroupListItemDTO,
  GetGroupsOptions,
  GroupStudentDTO,
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
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        students: {
          where: { isActive: true },
          select: {
            student: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
            joinedAt: true,
          },
        },
        cohort: {
          include: {
            currentLevel: true,
          },
        },
      },
    });

    return group as GroupDetailDTO | null;
  });
}

/**
 * Find a group by ID for authorization checks
 * Only returns basic group info needed for access control
 *
 * @param groupId - The group ID
 * @returns Basic group info or null if not found
 */
export async function findGroupForAuth(
  groupId: string,
): Promise<
  DalReturn<{ id: string; supervisorId: string; cohortId: string } | null>
> {
  return runDalOperation(async () => {
    return prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        supervisorId: true,
        cohortId: true,
      },
    });
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
        supervisorId: options.supervisorId,
        cohortId: options.cohortId,
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
        supervisor: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
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

export async function findStudentActiveGroup(
  studentId: string,
): Promise<DalReturn<GroupStudentDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.groupStudent.findFirst({
      where: {
        studentId,
        isActive: true,
      },

      select: {
        joinedAt: true,
        group: {
          select: {
            name: true,
            cohort: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
            supervisor: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });
  });
}
