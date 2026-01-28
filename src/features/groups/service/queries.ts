/**
 * Groups Service - Query Operations
 *
 * Service layer for group queries with authentication and authorization.
 * These functions wrap DAL calls with proper access control.
 */

import 'server-only';

import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import { findGroupById, findGroups, findGroupsBySupervisor } from '../dal';
import type {
  GroupDetailDTO,
  GroupListItemDTO,
  GetGroupsOptions,
} from '../types';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';

// ============================================================================
// Single Group Queries
// ============================================================================

/**
 * Get a group by ID with authorization check
 * Admins can view any group, supervisors can only view their own groups
 *
 * @param groupId - The group ID
 * @returns Group with full details
 */
export async function getGroupById(
  groupId: string,
): Promise<ServiceReturn<GroupDetailDTO | null>> {
  return runServiceOperation(
    async (session) => {
      const dalResult = await findGroupById(groupId);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      const group = dalResult.data;

      // Check authorization
      if (group && session!.role === SUPERVISOR_ROLE) {
        if (group.supervisor.id !== session!.userId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Group List Queries
// ============================================================================

/**
 * Get groups with role-based filtering
 * Admins can see all groups (optionally filtered by cohort)
 * Supervisors can only see their own groups
 *
 * @param options - Filter options
 * @returns Array of groups
 */
export async function getGroups(
  options: GetGroupsOptions = {},
): Promise<ServiceReturn<GroupListItemDTO[]>> {
  return runServiceOperation(
    async (session) => {
      const role = session!.role;
      const userId = session!.userId;

      // Supervisors can only see their own groups
      if (role === SUPERVISOR_ROLE) {
        const dalResult = await findGroupsBySupervisor(userId);
        return mapDalToService(dalResult);
      }

      // Admins can see all groups (optionally filtered)
      if (role === ADMIN_ROLE) {
        const dalResult = await findGroups(options);
        return mapDalToService(dalResult);
      }

      // Other roles don't have access
      return {
        success: false,
        error: { type: 'forbidden', statusCode: 403 },
      };
    },
    { requireAuth: true },
  );
}
