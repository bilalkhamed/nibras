/**
 * Cohorts Service - Query Operations
 *
 * Service layer for cohort queries with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import { findManyCohorts } from '../dal';
import type { CohortListDTO } from '../types';
import { ADMIN_ROLE } from '@/types/types';

// ============================================================================
// Cohort Queries
// ============================================================================

/**
 * Get all cohorts - admin only
 *
 * @returns Array of cohorts
 */
export async function getAllCohorts(): Promise<ServiceReturn<CohortListDTO[]>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findManyCohorts();

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
