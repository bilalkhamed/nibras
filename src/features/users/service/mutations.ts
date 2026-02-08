import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { createUserWithInvite, updateManyUsers, updateUser } from '../dal';
import { CreateUserInput, CreateUserResult } from '../types';
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

      console.log(dalResult);
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

// TODO: Add update user services as needed

// ============================================================================
// Delete Services
// ============================================================================

// TODO: Add delete user services as needed
