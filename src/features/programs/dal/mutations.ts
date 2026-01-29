/**
 * Programs DAL - Mutation Operations
 *
 * Pure database mutations for program data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type { DalReturn } from '@/lib/server/dal/types';
import { revalidateTag } from 'next/cache';

// ============================================================================
// Program CRUD Mutations
// ============================================================================

/**
 * Insert a new program
 *
 * @param data - Program creation data
 * @returns The created program
 */
export async function insertProgram(data: {
  name: string;
  description?: string;
}): Promise<DalReturn<{ id: string; name: string; slug: string }>> {
  return runDalOperation(async () => {
    const result = await prisma.program.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        slug: data.name,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    revalidateTag('programs', 'max');
    return result;
  });
}
