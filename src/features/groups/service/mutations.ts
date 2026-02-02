/**
 * Groups Service - Mutation Operations
 *
 * Service layer for group mutations with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import {
  insertGroup,
  insertGroupStudent,
  findActiveGroupStudent,
  deactivateGroupStudent,
  findGroupById,
  updateGroup as updateGroupDal,
} from '../dal';
import type {
  CreateGroupData,
  GroupStudentEntryDTO,
  UpdateGroupData,
} from '../types';
import {
  ADMIN_ROLE,
  SUPERVISOR_ROLE,
  STUDENT_ROLE,
  COHORT_MANAGER_ROLE,
} from '@/types/types';
import { getUserWithRoleAndCohortAndGroup } from '@/features/users/service';

// ============================================================================
// Group CRUD - Admin or Cohort Manager Only
// ============================================================================

/**
 * Create a new group - admin or cohort manager only
 *
 * @param data - Group creation data
 * @returns The created group ID
 */
export async function createGroup(
  data: CreateGroupData,
): Promise<ServiceReturn<{ groupId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (
        session!.role !== ADMIN_ROLE &&
        session!.role !== COHORT_MANAGER_ROLE
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      if (session!.role === COHORT_MANAGER_ROLE) {
        if (data.cohortId !== session!.managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Validate supervisor exists and has correct role
      for (const supervisorId of data.supervisors) {
        const supervisorResult =
          await getUserWithRoleAndCohortAndGroup(supervisorId);
        if (!supervisorResult.success) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }

        if (supervisorResult.data.role !== SUPERVISOR_ROLE) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }

        if (supervisorResult.data.supervisedGroupId) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }
      }

      const dalResult = await insertGroup({
        name: data.name,
        cohortId: data.cohortId,
        supervisors: data.supervisors,
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { groupId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

/**
 * Update an existing group - admin or cohort manager only
 *
 * @param groupId - The group ID to update
 * @param data - Group update data
 * @returns The updated group ID
 */
export async function updateGroup(
  groupId: string,
  data: UpdateGroupData,
): Promise<ServiceReturn<{ groupId: string }>> {
  return runServiceOperation(
    async (session) => {
      // Authorization: admin or cohort manager only
      if (
        session!.role !== ADMIN_ROLE &&
        session!.role !== COHORT_MANAGER_ROLE
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Fetch the existing group to check permissions
      const groupResult = await findGroupById(groupId);
      if (!groupResult.success) {
        return mapDalToService(groupResult);
      }

      if (!groupResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      // Cohort manager permission check: can only update groups in their cohort
      if (session!.role === COHORT_MANAGER_ROLE) {
        if (groupResult.data.cohortId !== session!.managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }

        // Cohort manager cannot change the cohort of a group
        if (data.cohortId !== groupResult.data.cohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Validate supervisors exist and have correct role
      for (const supervisorId of data.supervisors) {
        const supervisorResult =
          await getUserWithRoleAndCohortAndGroup(supervisorId);
        if (!supervisorResult.success) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }

        if (supervisorResult.data.role !== SUPERVISOR_ROLE) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }

        if (
          supervisorResult.data.supervisedGroupId &&
          supervisorResult.data.supervisedGroupId !== groupId
        ) {
          return {
            success: false,
            error: { type: 'bad-request', statusCode: 400 },
          };
        }
      }

      // Update the group
      const dalResult = await updateGroupDal(groupId, {
        name: data.name,
        cohortId: data.cohortId,
        supervisors: data.supervisors,
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { groupId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Group Student Mutations
// ============================================================================

/**
 * Add a student to a group - admin only
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns The created group student entry
 */
export async function addStudentToGroup(
  groupId: string,
  studentId: string,
): Promise<ServiceReturn<GroupStudentEntryDTO>> {
  return runServiceOperation(
    async (session) => {
      if (
        session!.role !== ADMIN_ROLE &&
        session!.role !== COHORT_MANAGER_ROLE
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Validate student exists and has correct role
      const studentResult = await getUserWithRoleAndCohortAndGroup(studentId);
      console.log(studentResult);

      if (!studentResult.success) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      if (session!.role === COHORT_MANAGER_ROLE) {
        if (studentResult.data.cohortId !== session!.managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      if (studentResult.data.role !== STUDENT_ROLE) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      // Validate group exists and cohorts match
      const groupResult = await findGroupById(groupId);
      if (!groupResult.success) {
        return mapDalToService(groupResult);
      }

      if (!groupResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      if (studentResult.data.cohortId !== groupResult.data.cohortId) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      const dalResult = await insertGroupStudent(groupId, studentId);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/**
 * Remove a student from a group (soft delete) - admin only
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns Success/failure
 */
export async function removeStudentFromGroup(
  groupId: string,
  studentId: string,
): Promise<ServiceReturn<{ removed: boolean }>> {
  return runServiceOperation(
    async (session) => {
      if (
        session!.role !== ADMIN_ROLE &&
        session!.role !== COHORT_MANAGER_ROLE
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Find active group student entry
      const entryResult = await findActiveGroupStudent(groupId, studentId);

      if (!entryResult.success) {
        return mapDalToService(entryResult);
      }

      if (!entryResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      if (session!.role === COHORT_MANAGER_ROLE) {
        if (entryResult.data.group.cohortId !== session!.managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Deactivate the entry
      const dalResult = await deactivateGroupStudent(entryResult.data.id);
      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { removed: true },
      };
    },
    { requireAuth: true },
  );
}
