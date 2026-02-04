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
import { revalidateTag } from 'next/cache';

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
    const result = await prisma.cohort.create({
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

    revalidateTag('cohorts', 'max');
    return result;
  });
}

/**
 * Update a cohort
 *
 * @param cohortId - The cohort ID
 * @param data - Data to update
 * @returns The updated cohort
 */
export async function updateCohort(
  cohortId: string,
  data: {
    name?: string;
    slug?: string;
    label?: string;
    startDate?: Date;
    endDate?: Date;
    currentLevelId?: string;
  },
): Promise<DalReturn<{ id: string; name: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.cohort.update({
      where: { id: cohortId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.slug && { slug: data.slug }),
        ...(data.label && { label: data.label }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.currentLevelId && { currentLevelId: data.currentLevelId }),
      },
      select: {
        id: true,
        name: true,
      },
    });

    revalidateTag('cohorts', 'max');
    return result;
  });
}

/**
 * Delete a cohort by ID
 *
 * @param cohortId - The cohort ID to delete
 * @returns The deleted cohort
 */
export async function deleteCohort(
  cohortId: string,
): Promise<DalReturn<{ id: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.cohort.delete({
      where: { id: cohortId },
      select: { id: true },
    });

    revalidateTag('cohorts', 'max');
    return result;
  });
}
