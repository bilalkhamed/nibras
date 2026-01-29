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
import { insertProgram } from '../dal';
import type { CreateProgramData } from '../types';
import { ADMIN_ROLE } from '@/types/types';

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
        name: data.name,
        description: data.description,
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
