/**
 * Cohorts Feature Types
 *
 * Contains all DTOs and type definitions for the cohorts feature.
 */

import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Schema for creating a new cohort
 */
export const createCohortSchema = z.object({
  name: z.string().min(1, 'اسم الدفعة مطلوب'),
  // startDate: z.string().min(1, 'تاريخ البداية مطلوب'), // TODO: re-enable when dates are surfaced in UI
  // endDate: z.string().min(1, 'تاريخ النهاية مطلوب'),   // TODO: re-enable when dates are surfaced in UI
  currentLevelId: z.string('المستوى الحالي مطلوب'),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type CreateCohortData = z.infer<typeof createCohortSchema>;

// ============================================================================
// Action Results
// ============================================================================

export type CreateCohortResult =
  | { success: true; cohortId: string }
  | { success: false; error: string };

// ============================================================================
// DTOs
// ============================================================================

/**
 * Basic cohort info for lists and dropdowns
 */
export const cohortListSelect = {
  id: true,
  name: true,
} satisfies Prisma.CohortSelect;

export type CohortListDTO = Prisma.CohortGetPayload<{
  select: typeof cohortListSelect;
}>;

export const cohortListDetailedSelect = {
  id: true,
  name: true,
  startDate: true,
  endDate: true,
  currentLevel: {
    select: {
      id: true,
      title: true,
    },
  },
  managers: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
  },
  _count: {
    select: {
      students: true,
      groups: true,
      managers: true,
    },
  },
} satisfies Prisma.CohortSelect;

export type CohortListDetailedDTO = Prisma.CohortGetPayload<{
  select: typeof cohortListDetailedSelect;
}>;

/**
 * Full cohort details
 */
export const cohortDetailSelect = {
  id: true,
  name: true,
  startDate: true,
  endDate: true,
  currentLevelId: true,
  currentLevel: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CohortSelect;

export type CohortDetailDTO = Prisma.CohortGetPayload<{
  select: typeof cohortDetailSelect;
}>;

export const cohortDetailStatsSelect = {
  id: true,
  name: true,
  startDate: true,
  endDate: true,
  currentLevel: {
    select: {
      id: true,
      title: true,
    },
  },
  entryLevel: {
    select: {
      id: true,
      title: true,
    },
  },
  managers: {
    include: {
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
  students: {
    select: {
      id: true,
      status: true,
      role: true,
    },
  },
  groups: {
    include: {
      supervisors: {
        select: {
          id: true,
          status: true,
          supervisorStatus: true,
        },
      },
      managers: {
        include: {
          user: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CohortSelect;

export type CohortDetailStatsDTO = Prisma.CohortGetPayload<{
  select: typeof cohortDetailStatsSelect;
}>;

