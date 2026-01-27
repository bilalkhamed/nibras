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
  updateAssignmentBasic,
  updateAssignmentLinks,
  updateAssignmentFiles,
  insertAssignment,
} from '../dal';
import type {
  AssignmentDTO,
  CreateAssignmentData,
  UpdateAssignmentData,
  StudentAssignmentDTO,
} from '../types';
import { createAssignmentSchema, updateAssignmentSchema } from '../types';

// ============================================================================
// Student Assignment Mutations
// ============================================================================

/**
 * Toggle assignment completion status for a student
 * Students can mark their own, supervisors can mark for their groups
 *
 * @param assignmentId - The assignment ID
 * @param isCompleted - Whether the assignment is completed
 * @param studentId - Optional student ID (for supervisors marking on behalf)
 * @returns The updated student assignment
 */
export async function toggleCompletion(
  assignmentId: string,
  isCompleted: boolean,
  studentId?: string,
): Promise<ServiceReturn<StudentAssignmentDTO>> {
  return runServiceOperation(
    async (session) => {
      const userId = session!.userId;
      const role = session!.role;

      // Determine which student's assignment to toggle
      let targetStudentId = studentId;

      // Students can only toggle their own assignments
      if (role === 'student') {
        targetStudentId = userId;
      }

      // Supervisors and admins can toggle for any student
      if (!targetStudentId) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      const dalResult = await upsertStudentAssignment(
        assignmentId,
        targetStudentId,
        isCompleted,
        userId, // markedById is always the current user
      );

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
export async function updateAssignment(
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

      // Update links if provided
      if (data.links) {
        const linksResult = await updateAssignmentLinks(
          assignmentId,
          data.links,
        );
        if (!linksResult.success) {
          return mapDalToService(linksResult);
        }
      }

      // Update files
      const filesResult = await updateAssignmentFiles(
        assignmentId,
        data.fileKeys,
      );
      if (!filesResult.success) {
        return mapDalToService(filesResult);
      }

      // Update basic info
      const dalResult = await updateAssignmentBasic(assignmentId, {
        name: data.name,
        description: data.description,
        type: data.type,
      });

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
