/**
 * Assignment Service - Mutation Operations
 *
 * Service layer for assignment mutations with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import {
  upsertStudentAssignment,
  deleteAssignmentById,
  insertAssignment,
} from '../dal';
import type {
  AssignmentDTO,
  CreateAssignmentData,
  UpdateAssignmentData,
  StudentAssignmentDTO,
  UpdateStudentAssignmentInput,
} from '../types';
import { createAssignmentSchema, updateAssignmentSchema } from '../types';
import { updateAssignment } from '../dal/mutations';

// ============================================================================
// Student Assignment Mutations
// ============================================================================

/**
 * Update student assignment for a student
 * Students can mark their own, supervisors can mark for their groups
 *
 * @param assignmentId - The assignment ID
 * @param isCompleted - Whether the assignment is completed
 * @param studentId - Optional student ID (for supervisors marking on behalf)
 * @returns The updated student assignment
 */
export async function updateStudentAssignment({
  assignmentId,
  studentId,
  data,
}: UpdateStudentAssignmentInput): Promise<ServiceReturn<StudentAssignmentDTO>> {
  return runServiceOperation(
    async (session) => {
      const userId = session!.userId;
      const role = session!.role;

      // Determine which student's assignment to toggle
      let targetStudentId = studentId;

      // Students can only toggle their own assignments
      if (role === 'student') {
        if (!targetStudentId) {
          targetStudentId = userId;
        } else if (targetStudentId !== userId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Supervisors and admins can toggle for any student
      if (!targetStudentId) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      const dalResult = await upsertStudentAssignment({
        assignmentId,
        studentId: targetStudentId,
        data: {
          ...data,
          markedById: userId,
        },
      });

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Assignment CRUD - Admin Only
// ============================================================================

/**
 * Delete an assignment - admin only
 *
 * @param assignmentId - The assignment ID to delete
 * @returns The deleted assignment (for cache invalidation)
 */
export async function deleteAssignment(
  assignmentId: string,
): Promise<ServiceReturn<AssignmentDTO>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await deleteAssignmentById(assignmentId);

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/**
 * Update an assignment - admin only
 * Handles updating basic info, links, and files
 *
 * @param assignmentId - The assignment ID to update
 * @param data - The update data
 * @returns The updated assignment
 */
export async function modifyAssignment(
  assignmentId: string,
  data: UpdateAssignmentData,
): Promise<ServiceReturn<AssignmentDTO>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Validate input
      const parsed = updateAssignmentSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      const dalResult = await updateAssignment(assignmentId, parsed.data);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/**
 * Create a new assignment - admin only
 *
 * @param data - The assignment creation data
 * @returns The created assignment
 */
export async function createAssignment(
  data: CreateAssignmentData,
): Promise<ServiceReturn<AssignmentDTO>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Validate input
      const parsed = createAssignmentSchema.safeParse(data);
      if (!parsed.success) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      const dalResult = await insertAssignment(parsed.data);

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}
