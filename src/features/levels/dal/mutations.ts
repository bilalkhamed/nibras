/**
 * Levels DAL - Mutation Operations
 *
 * Pure database mutations for level data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import { revalidateTag } from 'next/cache';

// ============================================================================
// Level CRUD Mutations
// ============================================================================

/**
 * Insert a new level
 *
 * @param data - Level creation data
 * @returns The created level
 */
export async function insertLevel(data: {
  number: number;
  title: string;
  description?: string;
  slug: string;
}): Promise<DalReturn<{ id: string; title: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.level.create({
      data: {
        number: data.number,
        title: data.title.trim(),
        description: data.description?.trim(),
        slug: data.slug.trim(),
      },
      select: {
        id: true,
        title: true,
      },
    });

    revalidateTag('levels', 'max');
    return result;
  });
}

/**
 * Update a level
 *
 * @param levelId - The level ID
 * @param data - Data to update
 * @returns The updated level
 */
export async function updateLevel(
  levelId: string,
  data: {
    number?: number;
    title?: string;
    description?: string;
    slug?: string;
  },
): Promise<DalReturn<{ id: string; title: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.level.update({
      where: { id: levelId },
      data: {
        ...(data.number !== undefined && { number: data.number }),
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.slug !== undefined && { slug: data.slug.trim() }),
      },
      select: {
        id: true,
        title: true,
      },
    });

    revalidateTag('levels', 'max');
    return result;
  });
}

/**
 * Delete a level by ID
 *
 * @param levelId - The level ID to delete
 * @returns The deleted level
 */
export async function deleteLevel(
  levelId: string,
): Promise<DalReturn<{ id: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.level.delete({
      where: { id: levelId },
      select: { id: true },
    });

    revalidateTag('levels', 'max');
    return result;
  });
}
