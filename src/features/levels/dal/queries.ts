/**
 * Levels DAL - Query Operations
 *
 * Pure database queries for level data retrieval.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import { levelListSelect, type LevelListDTO } from '../types';

// ============================================================================
// Level Queries
// ============================================================================

/**
 * Find all levels
 * Used for lists and dropdowns
 *
 * @returns Array of levels ordered by number
 */
export async function findManyLevels(): Promise<DalReturn<LevelListDTO[]>> {
  'use cache';
  cacheTag('levels');

  return runDalOperation(async () => {
    return prisma.level.findMany({
      select: levelListSelect,
      orderBy: {
        number: 'asc',
      },
    });
  });
}

export async function findLevelById(
  id: string,
): Promise<DalReturn<LevelListDTO | null>> {
  'use cache';
  cacheTag('levels');

  return runDalOperation(async () => {
    return prisma.level.findUnique({
      where: { id },
      select: levelListSelect,
    });
  });
}
