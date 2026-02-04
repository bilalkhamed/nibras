/**
 * Assignment DAL - Query Operations
 *
 * Pure database queries for assignment data retrieval.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type {
  AssignmentWithRawAttachmentsDTO,
  AssignmentDTO,
  StudentAssignmentDTO,
  StudentAssignmentWithMarkerDTO,
  WeekAssignmentsOptions,
} from '../types';
import { Program } from '@prisma/client';
import { findProgramBySlug } from '@/features/programs/dal';

// ============================================================================
// Week Assignments Queries
// ============================================================================

/**
 * Get assignments for a specific week without attachments
 * Uses Next.js cache tags for efficient revalidation
 */
export async function findWeekAssignments(
  options: WeekAssignmentsOptions & { withAttachments: false },
): Promise<AssignmentDTO[]>;

/**
 * Get assignments for a specific week with attachments
 * Uses Next.js cache tags for efficient revalidation
 */
export async function findWeekAssignments(
  options: WeekAssignmentsOptions & { withAttachments?: true },
): Promise<AssignmentWithRawAttachmentsDTO[]>;

/**
 * Get assignments for a specific week
 * @param options - Query options including levelId, weekId, optional programSlug
 * @returns Array of assignments with optional attachments
 */
export async function findWeekAssignments({
  levelId,
  weekId,
  programSlug,
  withAttachments = true,
}: WeekAssignmentsOptions): Promise<AssignmentWithRawAttachmentsDTO[]> {
  'use cache';

  const programResult = programSlug
    ? await findProgramBySlug(programSlug)
    : undefined;

  let program: Program | undefined;
  if (!programResult?.success) {
    program = undefined;
  } else {
    program = programResult?.data || undefined;
  }

  // Build cache tags for efficient revalidation
  const tags = [
    `assignments-level-${levelId}-week-${weekId}-program-${program?.id}`,
  ];
  if (!program) tags.push(`assignments-level-${levelId}-week-${weekId}`);
  cacheTag(...tags);

  const assignments = await prisma.assignment.findMany({
    where: {
      programId: program?.id,
      levelId: levelId,
      weekId: weekId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      attachments: withAttachments,
    },
  });

  return assignments;
}

// ============================================================================
// Student Assignment Queries
// ============================================================================

/**
 * Get student assignments for specific assignment IDs
 * @param studentId - The student's user ID
 * @param assignmentIds - Array of assignment IDs to check
 * @returns Array of student assignment records
 */
export async function findStudentAssignments(
  studentId: string,
  assignmentIds: string[],
) {
  return runDalOperation<StudentAssignmentDTO[]>(async () => {
    return prisma.studentAssignment.findMany({
      where: {
        studentId: studentId,
        assignmentId: {
          in: assignmentIds,
        },
      },
    });
  });
}

/**
 * Get student assignments for multiple students
 * Includes marker information for tracking who marked the assignment
 * @param studentIds - Array of student user IDs
 * @param assignmentIds - Array of assignment IDs to check
 * @returns Array of student assignments with marker details
 */
export async function findManyStudentAssignments(
  studentIds: string[],
  assignmentIds: string[],
) {
  return runDalOperation<Omit<StudentAssignmentWithMarkerDTO, 'isOverdue'>[]>(
    async () => {
      return prisma.studentAssignment.findMany({
        where: {
          studentId: {
            in: studentIds,
          },
          assignmentId: {
            in: assignmentIds,
          },
        },
        include: {
          markedBy: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
            },
          },
        },
      });
    },
  );
}

// ============================================================================
// Single Assignment Queries
// ============================================================================

/**
 * Find an assignment by ID
 * @param assignmentId - The assignment ID
 * @returns The assignment or null if not found
 */
export async function findAssignmentById(assignmentId: string) {
  return runDalOperation<AssignmentDTO | null>(async () => {
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
  });
}

/**
 * Find assignment attachments
 * @param assignmentId - The assignment ID
 * @returns Array of attachments for the assignment
 */
export async function findAssignmentAttachments(assignmentId: string) {
  return runDalOperation(async () => {
    return prisma.assignmentAttachment.findMany({
      where: { assignmentId },
    });
  });
}
