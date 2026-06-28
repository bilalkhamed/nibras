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
import type { CohortListDetailedDTO, CohortListDTO } from '../types';
import { ADMIN_ROLE, COHORT_MANAGER_ROLE } from '@/types/types';
import { findCohortById, findManyCohortsDetailed } from '../dal/queries';

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
      if (session!.role !== ADMIN_ROLE && session!.role !== 'director') {
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

export async function getAllCohortsDetailed(): Promise<
  ServiceReturn<CohortListDetailedDTO[]>
> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE && session!.role !== 'director') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findManyCohortsDetailed();

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

export async function getCohortById(
  id: string,
): Promise<ServiceReturn<CohortListDTO | null>> {
  return runServiceOperation(
    async (session) => {
      if (
        session!.role !== ADMIN_ROLE &&
        session!.role !== 'director' &&
        session!.role !== COHORT_MANAGER_ROLE
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findCohortById(id);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      return {
        success: true,
        data: dalResult.data,
      };
    },
    { requireAuth: true },
  );
}
