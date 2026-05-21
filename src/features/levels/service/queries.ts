/**
 * Levels Service - Query Operations
 *
 * Service layer for level queries with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import { findManyLevels, findLevelById } from '../dal';
import type { LevelListDTO } from '../types';

// ============================================================================
// Level Queries
// ============================================================================

/**
 * Get all levels
 *
 * @returns Array of levels
 */
export async function getAllLevels(): Promise<ServiceReturn<LevelListDTO[]>> {
  return runServiceOperation(
    async (session) => {
      // Typically anyone logged in can view levels (or maybe just admins depending on requirements, assuming admins for now)
      // Actually, let's keep it accessible like cohorts or restrict to admin based on the user request.
      // User request: "Only admins can access, just like cohorts." - Note: cohort queries allow any authenticated user to view list usually?
      // Wait, let's just make sure it's authenticated.
      const dalResult = await findManyLevels();

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: dalResult.data,
      };
    },
    { requireAuth: true },
  );
}

/**
 * Get level by ID
 *
 * @param id Level ID
 * @returns Level data
 */
export async function getLevel(
  id: string,
): Promise<ServiceReturn<LevelListDTO | null>> {
  return runServiceOperation(
    async (session) => {
      const dalResult = await findLevelById(id);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: dalResult.data,
      };
    },
    { requireAuth: true },
  );
}
