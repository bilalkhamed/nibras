/**
 * Groups DAL - Mutation Operations
 *
 * Pure database mutations for group data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import { generateSixCharCode } from '@/lib/shared/utils';
import {
  CreateGroupData,
  GroupStudentWithCohortIdDTO,
  selectGroupStudentWithCohortId,
  UpdateGroupData,
  type GroupStudentEntryDTO,
} from '../types';
import { revalidateTag } from 'next/cache';

// ============================================================================
// Group CRUD Mutations
// ============================================================================

/**
 * Insert a new group
 *
 * @param data - Group creation data
 * @returns The created group
 */
export async function insertGroup(
  data: CreateGroupData,
): Promise<DalReturn<{ id: string; name: string; code: string }>> {
  return runDalOperation(async () => {
    return prisma.group.create({
      data: {
        name: data.name,
        cohortId: data.cohortId,
        supervisors: {
          connect: data.supervisors.map((id) => ({ id })),
        },
        code: generateSixCharCode(),
        managers: data.groupManager
          ? {
              create: {
                userId: data.groupManager,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  });
}

/**
 * Update group basic info and supervisors
 *
 * @param groupId - The group ID
 * @param data - Data to update (name, cohortId, supervisors)
 * @returns The updated group
 */
export async function updateGroup(
  groupId: string,
  data: UpdateGroupData,
): Promise<DalReturn<{ id: string; name: string }>> {
  return runDalOperation(async () => {
    const updateData: {
      name?: string;
      cohortId?: string;
      supervisors?: { set: { id: string }[] };
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.cohortId !== undefined) {
      updateData.cohortId = data.cohortId;
    }

    if (data.supervisors !== undefined) {
      // Replace all supervisors: disconnect all, then connect new ones
      updateData.supervisors = {
        set: data.supervisors.map((id) => ({ id })),
      };
    }

    console.log(data);

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...updateData,
        managers:
          typeof data.groupManager === 'string'
            ? {
                deleteMany: {},

                create: data.groupManager
                  ? {
                      userId: data.groupManager,
                    }
                  : undefined,
              }
            : undefined,
      },
      select: {
        id: true,
        name: true,
      },
    });

    revalidateTag(`group-${groupId}`, 'max');
    revalidateTag('groups-list', 'max');

    return updated;
  });
}

/**
 * Delete a group by ID
 *
 * @param groupId - The group ID to delete
 * @returns The deleted group
 */
export async function deleteGroup(
  groupId: string,
): Promise<DalReturn<{ id: string }>> {
  return runDalOperation(async () => {
    return prisma.group.delete({
      where: { id: groupId },
      select: { id: true },
    });
  });
}

// ============================================================================
// Group Student Mutations
// ============================================================================

/**
 * Add a student to a group
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns The created group student entry
 */
export async function insertGroupStudent(
  groupId: string,
  studentId: string,
): Promise<DalReturn<GroupStudentEntryDTO>> {
  return runDalOperation(async () => {
    return prisma.groupStudent.create({
      data: {
        groupId,
        studentId,
      },
    });
  });
}

/**
 * Find active group student entry
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns The group student entry or null
 */
export async function findActiveGroupStudent(
  groupId: string,
  studentId: string,
): Promise<DalReturn<GroupStudentWithCohortIdDTO | null>> {
  return runDalOperation(async () => {
    return prisma.groupStudent.findFirst({
      where: {
        groupId,
        studentId,
        isActive: true,
      },
      select: selectGroupStudentWithCohortId,
    });
  });
}

/**
 * Deactivate a student from a group (soft delete)
 *
 * @param groupStudentId - The group student entry ID
 * @returns The updated group student entry
 */
export async function deactivateGroupStudent(
  groupStudentId: string,
): Promise<DalReturn<GroupStudentEntryDTO>> {
  return runDalOperation(async () => {
    return prisma.groupStudent.update({
      where: { id: groupStudentId },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  });
}
