/**
 * Cohorts DAL - Query Operations
 *
 * Pure database queries for cohort data retrieval.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import {
  CohortListDetailedDTO,
  cohortListDetailedSelect,
  type CohortListDTO,
} from '../types';

// ============================================================================
// Cohort Queries
// ============================================================================

/**
 * Find all cohorts with basic info
 * Used for lists and dropdowns
 *
 * @returns Array of cohorts ordered by start date
 */
export async function findManyCohorts(): Promise<DalReturn<CohortListDTO[]>> {
  'use cache';
  cacheTag('cohorts');

  return runDalOperation(async () => {
    return prisma.cohort.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  });
}

export async function findManyCohortsDetailed(): Promise<
  DalReturn<CohortListDetailedDTO[]>
> {
  'use cache';
  cacheTag('cohorts');

  return runDalOperation(async () => {
    return prisma.cohort.findMany({
      select: cohortListDetailedSelect,
      orderBy: {
        startDate: 'asc',
      },
    });
  });
}

export async function findCohortById(
  id: string,
): Promise<DalReturn<CohortListDTO | null>> {
  'use cache';
  cacheTag('cohorts');

  return runDalOperation(async () => {
    return prisma.cohort.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  });
}
