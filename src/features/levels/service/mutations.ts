/**
 * Levels Service - Mutation Operations
 *
 * Service layer for level mutations with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import { insertLevel, updateLevel, deleteLevel } from '../dal';
import type { CreateLevelData } from '../types';
import { ADMIN_ROLE } from '@/types/types';

function buildLevelSlug(levelNumber: number): string {
  return `level${levelNumber}`;
}

// ============================================================================
// Level CRUD - Admin Only
// ============================================================================

/**
 * Create a new level - admin only
 *
 * @param data - Level creation data
 * @returns The created level ID
 */
export async function createLevel(
  data: CreateLevelData,
): Promise<ServiceReturn<{ levelId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await insertLevel({
        number: data.number,
        title: data.title,
        description: data.description,
        slug: buildLevelSlug(data.number),
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { levelId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

/**
 * Update a level - admin only
 *
 * @param levelId - The level ID
 * @param data - Level update data
 * @returns The updated level ID
 */
export async function modifyLevel(
  levelId: string,
  data: CreateLevelData,
): Promise<ServiceReturn<{ levelId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await updateLevel(levelId, {
        number: data.number,
        title: data.title,
        description: data.description,
        slug: buildLevelSlug(data.number),
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { levelId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

/**
 * Delete a level - admin only
 *
 * @param levelId - The level ID to delete
 * @returns Success indicator
 */
export async function removeLevel(
  levelId: string,
): Promise<ServiceReturn<{ levelId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await deleteLevel(levelId);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { levelId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}
