/**
 * Programs Service - Mutation Operations
 *
 * Service layer for program mutations with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import {
  insertProgram,
  updateCalendarWeeks as updateCalendarWeeksDb,
} from '../dal';
import type { CalendarWeekInput, CreateProgramData } from '../types';
import { ADMIN_ROLE } from '@/types/types';
import { getAcademicYear } from '@/lib/server/academic-year';

// ============================================================================
// Program CRUD - Admin Only
// ============================================================================

/**
 * Create a new program - admin only
 *
 * @param data - Program creation data
 * @returns The created program ID
 */
export async function createProgram(
  data: CreateProgramData,
): Promise<ServiceReturn<{ programId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await insertProgram({
        name: data.name.trim(),
        description: data.description?.trim(),
        isSupervisorsOnly: data.isSupervisorsOnly,
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { programId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

export async function updateCalendarWeeks(
  newWeeks: CalendarWeekInput[],
): Promise<ServiceReturn<null>> {
  return runServiceOperation(
    async (session) => {
      if (session!.role !== ADMIN_ROLE) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const { year } = getAcademicYear();
      const dalResult = await updateCalendarWeeksDb(year, newWeeks);
      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: null,
      };
    },
    { requireAuth: true },
  );
}
