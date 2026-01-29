/**
 * Cohorts Service - Mutation Operations
 *
 * Service layer for cohort mutations with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import { insertCohort } from '../dal';
import type { CreateCohortData } from '../types';
import { ADMIN_ROLE } from '@/types/types';

// ============================================================================
// Cohort CRUD - Admin Only
// ============================================================================

/**
 * Create a new cohort - admin only
 *
 * @param data - Cohort creation data
 * @returns The created cohort ID
 */
export async function createCohort(
  data: CreateCohortData,
): Promise<ServiceReturn<{ cohortId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await insertCohort({
        name: data.name,
        slug: data.name,
        label: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        entryLevelId: data.currentLevelId,
        currentLevelId: data.currentLevelId,
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { cohortId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}
