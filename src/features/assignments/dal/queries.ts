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
import type { DalReturn } from '@/lib/server/dal/types';
import type {
  AssignmentWithRawAttachmentsDTO,
  AssignmentDTO,
  StudentAssignmentDTO,
  StudentAssignmentWithMarkerDTO,
  WeekAssignmentsOptions,
  StudentDashboardData,
  StudentAchievementsData,
} from '../types';
import { Program } from '@prisma/client';
import { findProgramBySlug } from '@/features/programs/dal';
import { getAcademicYear } from '@/lib/server/academic-year';

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
  programFilter,
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
      ...(programFilter === 'student'
        ? { program: { isSupervisorOnly: false } }
        : programFilter === 'supervisor'
          ? { program: { isSupervisorOnly: true } }
          : {}),
      levelId: levelId || undefined,
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
              username: true,
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

// ============================================================================
// Student Dashboard Query
// ============================================================================

/**
 * Fetch all data needed by the student dashboard in parallel.
 * @param studentId - The student's user ID
 * @param levelId   - The student's current level ID (from session)
 */
export async function findStudentDashboardData(
  studentId: string,
  levelId: string | null,
): Promise<DalReturn<StudentDashboardData>> {
  return runDalOperation(async () => {
    const { year: academicYear } = getAcademicYear();
    const today = new Date();

    // 1. Resolve current calendar week, fall back to week 1
    let activeWeek = await prisma.calendarWeek.findFirst({
      where: {
        academicYear,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      select: {
        startDate: true,
        endDate: true,
        week: { select: { id: true, number: true, title: true } },
      },
    });

    if (!activeWeek) {
      activeWeek = await prisma.calendarWeek.findFirst({
        where: { academicYear },
        orderBy: { week: { number: 'asc' } },
        select: {
          startDate: true,
          endDate: true,
          week: { select: { id: true, number: true, title: true } },
        },
      });
    }

    const weekId = activeWeek?.week.id ?? null;

    // 2. Run all remaining queries in parallel
    const [
      weekAssignments,
      weekStudentAssignments,
      recentRows,
      weekEarnAgg,
      totalEarnAgg,
      weekMaxAgg,
      totalMaxAgg,
    ] = await Promise.all([
      // All assignments for this week at the student's level
      weekId && levelId
        ? prisma.assignment.findMany({
          where: { weekId, levelId },
          select: {
            id: true,
            name: true,
            maxScore: true,
            program: { select: { name: true } },
          },
        })
        : Promise.resolve([]),

      // Existing StudentAssignment rows for this student in this week
      weekId
        ? prisma.studentAssignment.findMany({
          where: {
            studentId,
            assignment: { weekId },
          },
          select: {
            assignmentId: true,
            isCompleted: true,
          },
        })
        : Promise.resolve([]),

      // Recent completions: last 4 graded completed rows
      prisma.studentAssignment.findMany({
        where: {
          studentId,
          isCompleted: true,
          score: { not: null },
          gradedById: { notIn: [studentId] },
        },
        select: {
          score: true,
          maxScore: true,
          completedAt: true,
          assignment: {
            select: {
              name: true,
              week: { select: { number: true } },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 4,
      }),

      // Weekly earned score
      weekId
        ? prisma.studentAssignment.aggregate({
          where: {
            studentId,
            isCompleted: true,
            score: { not: null },
            assignment: { weekId },
          },
          _sum: { score: true },
        })
        : Promise.resolve({ _sum: { score: null } }),

      // Total earned score
      prisma.studentAssignment.aggregate({
        where: {
          studentId,
          isCompleted: true,
          score: { not: null },
        },
        _sum: { score: true },
      }),

      // Weekly max score: from Assignment directly, scoped to week + level
      weekId && levelId
        ? prisma.assignment.aggregate({
          where: { weekId, levelId },
          _sum: { maxScore: true },
        })
        : Promise.resolve({ _sum: { maxScore: null } }),

      // Total max score: scoped to level + program to avoid cross-cohort inflation
      levelId
        ? prisma.assignment.aggregate({
          where: { levelId },
          _sum: { maxScore: true },
        })
        : Promise.resolve({ _sum: { maxScore: null } }),
    ]);

    // 3. Diff in memory to find pending assignments
    const completedIds = new Set(
      (
        weekStudentAssignments as Array<{
          assignmentId: string;
          isCompleted: boolean;
        }>
      )
        .filter((sa) => sa.isCompleted)
        .map((sa) => sa.assignmentId),
    );

    const pendingThisWeek = (
      weekAssignments as Array<{
        id: string;
        name: string;
        maxScore: number;
        program: { name: string };
      }>
    )
      .filter((a) => !completedIds.has(a.id))
      .map((a) => ({
        assignmentId: a.id,
        name: a.name,
        programName: a.program.name,
      }));
    return {
      currentWeek: activeWeek
        ? {
          weekId: activeWeek.week.id,
          number: activeWeek.week.number,
          title: activeWeek.week.title,
          startDate: activeWeek.startDate,
          endDate: activeWeek.endDate,
        }
        : null,
      pendingThisWeek,
      recentCompletions: recentRows.map((row) => ({
        name: row.assignment.name,
        weekNumber: row.assignment.week.number,
        score: row.score,
        maxScore: row.maxScore,
        completedAt: row.completedAt,
      })),
      weekEarnedScore: weekEarnAgg._sum.score ?? 0,
      weekMaxScore: weekMaxAgg._sum.maxScore ?? 0,
      totalEarnedScore: totalEarnAgg._sum.score ?? 0,
      totalMaxScore: totalMaxAgg._sum.maxScore ?? 0,
    };
  });
}

/**
 * Fetch achievements and cohort level progress for the student.
 */
export async function findStudentAchievements(
  studentId: string,
  levelId: string | null
): Promise<DalReturn<StudentAchievementsData>> {
  return runDalOperation(async () => {
    // 1. Fetch completed and scored student assignments with their type and program slug
    const completedAssignments = await prisma.studentAssignment.findMany({
      where: {
        studentId,
        isCompleted: true,
        score: { not: null },
      },
      select: {
        assignment: {
          select: {
            type: true,
            program: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    const counts = {
      reading: 0,
      lectureReading: 0,
      lectureHeart: 0,
      exercise: 0,
    };

    completedAssignments.forEach((sa) => {
      const type = sa.assignment.type;
      const slug = sa.assignment.program.slug;

      if (type === 'reading') {
        counts.reading++;
      } else if (type === 'exercise') {
        counts.exercise++;
      } else if (type === 'lecture') {
        if (slug === 'reading') {
          counts.lectureReading++;
        } else if (slug === 'heart') {
          counts.lectureHeart++;
        }
      }
    });

    // 2. Two count queries for the progress bar (completed assignments in cohort level vs total assignments in cohort level)
    let completedCount = 0;
    let totalCount = 0;
    let levelTitle = '';

    const [compResult, readingProgramRes, heartProgramRes] = await Promise.all([
      levelId
        ? Promise.all([
            prisma.studentAssignment.count({
              where: {
                studentId,
                isCompleted: true,
                score: { not: null },
                assignment: {
                  levelId,
                },
              },
            }),
            prisma.assignment.count({
              where: {
                levelId,
              },
            }),
            prisma.level.findUnique({
              where: { id: levelId },
              select: { title: true },
            }),
          ])
        : Promise.resolve([0, 0, null]),
      findProgramBySlug('reading'),
      findProgramBySlug('heart'),
    ]);

    if (levelId && compResult) {
      const [comp, tot, levelObj] = compResult as [number, number, { title: string } | null];
      completedCount = comp;
      totalCount = tot;
      levelTitle = levelObj?.title ?? '';
    }

    const readingProgramName =
      readingProgramRes.success && readingProgramRes.data
        ? readingProgramRes.data.name
        : 'البرنامج القرائي';

    const heartProgramName =
      heartProgramRes.success && heartProgramRes.data
        ? heartProgramRes.data.name
        : 'طمأنينة القلب';

    return {
      counts,
      programNames: {
        reading: readingProgramName,
        heart: heartProgramName,
      },
      completedCount,
      totalCount,
      levelTitle,
    };
  });
}

