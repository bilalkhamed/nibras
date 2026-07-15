import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import type { ServiceReturn } from '@/lib/server/service/types';
import {
  createUserWithInvite,
  editUserFields,
  findUserById,
  updateManyUsers,
  updateUser,
  upsertUserProfile,
  resetUser,
  deleteUser,
} from '../dal';
import {
  CreateUserInput,
  CreateUserResult,
  EditUserInput,
  EditUserProfileInput,
} from '../types';
import { generateInvite } from '@/lib/server/hash';
import { SupervisorStatus } from '@prisma/client';

// ============================================================================
// Create Services
// ============================================================================

/** Create a new user with invite - admin only */
export async function createUser(userData: CreateUserInput) {
  return runServiceOperation<CreateUserResult>(
    async (session) => {
      if (
        !session ||
        (session.role !== 'admin' && session.role !== 'cohort_manager')
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Validate student must have cohortId
      if (userData.role === 'student' && !userData.cohortId) {
        return {
          success: false,
          error: { type: 'bad-request', statusCode: 400 },
        };
      }

      if (session.role === 'cohort_manager') {
        if (
          userData.role === 'student' &&
          userData.cohortId !== session.managedCohortId
        ) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }

        if (userData.role !== 'student' && userData.role !== 'supervisor') {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      const { expiresAt, selector, validatorHash, fullCode } = generateInvite();

      const dalResult = await createUserWithInvite(userData, {
        selector,
        validatorHash,
        expiresAt,
      });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: {
          user: dalResult.data,
          inviteCode: fullCode,
        },
      };
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Update Services
// ============================================================================
export async function updateSupervisorStatus({
  newStatus,
  supervisorId,
}: {
  newStatus: SupervisorStatus;
  supervisorId: string;
}) {
  return runServiceOperation(
    async (session) => {
      if (
        !session ||
        (session.role !== 'admin' && session.role !== 'cohort_manager')
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await updateUser({
        where: { id: supervisorId },
        data: {
          supervisorStatus: newStatus,
        },
      });

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

export async function updateMultipleSupervisorsStatus({
  newStatus,
  supervisorIds,
}: {
  newStatus: SupervisorStatus;
  supervisorIds: string[];
}) {
  return runServiceOperation(
    async (session) => {
      if (
        !session ||
        (session.role !== 'admin' && session.role !== 'cohort_manager')
      ) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await updateManyUsers({
        where: { id: { in: supervisorIds } },
        data: {
          supervisorStatus: newStatus,
        },
      });

      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Edit User Services
// ============================================================================

/**
 * Edit a user's core fields and optional student profile.
 * Allowed for: admin, cohort_manager (within their own cohort), or the user themselves.
 */
export async function editUser(
  targetUserId: string,
  userFields: EditUserInput,
  profileFields: EditUserProfileInput,
): Promise<ServiceReturn<{ userId: string }>> {
  return runServiceOperation(
    async (session) => {
      const isAdmin = session!.role === 'admin';
      const isSelf = session!.userId === targetUserId;
      const isCohortManager = session!.role === 'cohort_manager';

      if (!isAdmin && !isSelf && !isCohortManager) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      // Fetch target user to check existing role and ensure they exist
      const targetResult = await findUserById(targetUserId);
      if (!targetResult.success || !targetResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

      // If cohort_manager: verify target user belongs to their cohort
      if (isCohortManager && !isSelf) {
        if (targetResult.data.cohort?.id !== session!.managedCohortId) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // Verify that only admin can change roles
      if (userFields.role && userFields.role !== targetResult.data.role) {
        if (!isAdmin) {
          return {
            success: false,
            error: { type: 'forbidden', statusCode: 403 },
          };
        }
      }

      // 1. Update core user fields
      const userResult = await editUserFields(targetUserId, userFields);
      if (!userResult.success) {
        return mapDalToService(userResult);
      }

      // 2. Upsert student profile (always — profile may not exist yet)
      const profileResult = await upsertUserProfile(
        targetUserId,
        profileFields,
      );
      if (!profileResult.success) {
        return mapDalToService(profileResult);
      }

      return {
        success: true,
        data: { userId: targetUserId },
      };
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Reset Services
// ============================================================================

/**
 * Reset a user account — admin only.
 * Sets status → invited, nullifies email/username/passwordHash.
 * All other data is preserved.
 *
 * @param userId - The user ID to reset
 */
export async function resetUserAccount(
  userId: string,
): Promise<ServiceReturn<{ userId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (!session || session.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await resetUser(userId);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { userId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}

// ============================================================================
// Delete Services
// ============================================================================

/**
 * Hard-delete a user account — admin only.
 * Permanently removes the user and all cascaded child records.
 *
 * @param userId - The user ID to permanently delete
 */
export async function deleteUserAccount(
  userId: string,
): Promise<ServiceReturn<{ userId: string }>> {
  return runServiceOperation(
    async (session) => {
      if (!session || session.role !== 'admin') {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await deleteUser(userId);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      return {
        success: true,
        data: { userId: dalResult.data.id },
      };
    },
    { requireAuth: true },
  );
}
