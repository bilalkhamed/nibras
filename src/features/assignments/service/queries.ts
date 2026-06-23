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
  findStudentDashboardData,
} from '../dal';
import type {
  AssignmentWithRawAttachmentsDTO,
  AssignmentDTO,
  StudentAssignmentDTO,
  StudentAssignmentWithMarkerDTO,
  WeekAssignmentsOptions,
  StudentDashboardData,
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
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }
      // Students can only access their own level
      if (session.role === 'student') {
        if (session.currentLevelId !== options.levelId) {
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
  weekEndDate: Date | null,
): Promise<ServiceReturn<(StudentAssignmentDTO & { isOverdue: boolean })[]>> {
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

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      const dataWithOverdue = dalResult.data.map((sa) => ({
        ...sa,
        isOverdue: !weekEndDate
          ? false
          : sa.completedAt
            ? sa.completedAt > weekEndDate
            : false,
      }));

      return {
        ...dalResult,
        data: dataWithOverdue,
      };
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
  weekEndDate: Date,
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

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      const dataWithOverdue = dalResult.data.map((sa) => ({
        ...sa,
        isOverdue: sa.completedAt ? sa.completedAt > weekEndDate : false,
      }));

      return mapDalToService({
        ...dalResult,
        data: dataWithOverdue,
      });
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Student Dashboard Service
// ============================================================================

/**
 * Get all data needed by the student dashboard.
 * Only the authenticated student can call this for their own data.
 */
export async function getStudentDashboardData(): Promise<
  ServiceReturn<StudentDashboardData>
> {
  return runServiceOperation(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }

      if (session.role !== 'student' && session.role !== 'supervisor') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findStudentDashboardData(
        session.userId,
        session.currentLevelId,
      );

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}
