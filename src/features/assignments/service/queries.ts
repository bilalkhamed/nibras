/**
 * Assignment Service - Query Operations
 *
 * Service layer for assignment queries with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import {
  findWeekAssignments,
  findStudentAssignments,
  findManyStudentAssignments,
} from '../dal';
import type {
  AssignmentWithRawAttachmentsDTO,
  AssignmentDTO,
  StudentAssignmentDTO,
  StudentAssignmentWithMarkerDTO,
  WeekAssignmentsOptions,
} from '../types';

// ============================================================================
// Week Assignments Service
// ============================================================================

/**
 * Get assignments for a week - accessible by authenticated users
 * Students see their own level assignments, admins can see any level
 *
 * @param options - Query options for week assignments
 * @returns Array of assignments with attachments
 */
export async function getWeekAssignments(
  options: WeekAssignmentsOptions & { withAttachments: false },
): Promise<ServiceReturn<AssignmentDTO[]>>;

export async function getWeekAssignments(
  options: WeekAssignmentsOptions & { withAttachments?: true },
): Promise<ServiceReturn<AssignmentWithRawAttachmentsDTO[]>>;

export async function getWeekAssignments(
  options: WeekAssignmentsOptions,
): Promise<ServiceReturn<AssignmentWithRawAttachmentsDTO[] | AssignmentDTO[]>> {
  return runServiceOperation(
    async (session) => {
      // Students can only access their own level
      if (session!.role === 'student') {
        if (session!.currentLevelId !== options.levelId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Note: findWeekAssignments uses 'use cache' directive internally
      // so it doesn't go through runDalOperation, we call it directly
      const assignments = await findWeekAssignments(options as never);

      return { success: true, data: assignments };
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Student Assignments Service
// ============================================================================

/**
 * Get student assignments for specific assignment IDs
 * Students can only view their own, supervisors/admins can view any
 *
 * @param studentId - The student's user ID
 * @param assignmentIds - Array of assignment IDs to check
 * @returns Array of student assignment records
 */
export async function getStudentAssignments(
  studentId: string,
  assignmentIds: string[],
): Promise<ServiceReturn<StudentAssignmentDTO[]>> {
  return runServiceOperation(
    async (session) => {
      // Students can only view their own assignments
      if (session!.role === 'student' && session!.userId !== studentId) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findStudentAssignments(studentId, assignmentIds);

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

/**
 * Get student assignments for multiple students
 * Only supervisors and admins can access this
 *
 * @param studentIds - Array of student user IDs
 * @param assignmentIds - Array of assignment IDs to check
 * @returns Array of student assignments with marker details
 */
export async function getManyStudentAssignments(
  studentIds: string[],
  assignmentIds: string[],
): Promise<ServiceReturn<StudentAssignmentWithMarkerDTO[]>> {
  return runServiceOperation(
    async (session) => {
      // Only supervisors and admins can view multiple students' assignments
      if (session!.role === 'student') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findManyStudentAssignments(
        studentIds,
        assignmentIds,
      );

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}
