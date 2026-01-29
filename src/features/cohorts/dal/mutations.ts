/**
 * Cohorts DAL - Mutation Operations
 *
 * Pure database mutations for cohort data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';

// ============================================================================
// Cohort CRUD Mutations
// ============================================================================

/**
 * Insert a new cohort
 *
 * @param data - Cohort creation data
 * @returns The created cohort
 */
export async function insertCohort(data: {
  name: string;
  slug: string;
  label: string;
  startDate: Date;
  endDate: Date;
  entryLevelId: string;
  currentLevelId: string;
}): Promise<DalReturn<{ id: string; name: string }>> {
  return runDalOperation(async () => {
    return prisma.cohort.create({
      data: {
        name: data.name.trim(),
        slug: data.slug,
        label: data.label,
        startDate: data.startDate,
        endDate: data.endDate,
        entryLevelId: data.entryLevelId,
        currentLevelId: data.currentLevelId,
      },
      select: {
        id: true,
        name: true,
      },
    });
  });
}
