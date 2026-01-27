import { runDalOperation } from '@/lib/server/dal/helpers';
import { DalReturn } from '@/lib/server/dal/types';
import prisma from '@/lib/server/prisma';
import { CreateUserInput, CreatedUserDTO } from '../types';

// ============================================================================
// Create Operations
// ============================================================================

/** Create a new user with invite in a transaction */
export async function createUserWithInvite(
  userData: CreateUserInput,
  inviteData: {
    selector: string;
    validatorHash: string;
    expiresAt: Date;
  },
): Promise<DalReturn<CreatedUserDTO>> {
  return runDalOperation(async () => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          birthYear: userData.birthYear,
          country: userData.country,
          role: userData.role,
          cohortId: userData.cohortId,
          status: 'invited',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      await tx.invite.create({
        data: {
          userId: user.id,
          selector: inviteData.selector,
          validatorHash: inviteData.validatorHash,
          expiresAt: inviteData.expiresAt,
        },
      });

      return user;
    });
  });
}

// ============================================================================
// Update Operations
// ============================================================================

// TODO: Add update user functions as needed

// ============================================================================
// Delete Operations
// ============================================================================

// TODO: Add delete user functions as needed
