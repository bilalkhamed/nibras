import { runDalOperation } from '@/lib/server/dal/helpers';
import { DalReturn } from '@/lib/server/dal/types';
import prisma, { Prisma } from '@/lib/server/prisma';
import { revalidatePath } from 'next/cache';
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
          managedCohorts:
            userData.role === 'cohort_manager'
              ? {
                  create: { cohortId: userData.cohortId! },
                }
              : undefined,
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

export async function updateUser({
  data,
  where,
}: {
  data: Prisma.UserUpdateInput;
  where: Prisma.UserWhereUniqueInput;
}) {
  return runDalOperation(async () => {
    const updatedUser = await prisma.user.update({
      where,
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        cohortId: true,
      },
    });
    return updatedUser;
  });
}

export async function updateManyUsers({
  data,
  where,
}: {
  data: Prisma.UserUpdateManyArgs['data'];
  where: Prisma.UserWhereInput;
}) {
  return runDalOperation(async () => {
    const updatedUsers = await prisma.user.updateMany({
      where,
      data,
    });
    return updatedUsers;
  });
}

// TODO: Add update user functions as needed

// ============================================================================
// Reset Operations
// ============================================================================

/**
 * Reset a user account — clears credentials, sets status back to `invited`.
 * All other data (StudentProfile, GroupStudent, progress, etc.) is preserved.
 *
 * @param userId - The user ID to reset
 * @returns The reset user's id
 */
export async function resetUser(
  userId: string,
): Promise<DalReturn<{ id: string }>> {
  return runDalOperation(async () => {
    return await prisma.$transaction(async (tx) => {
      // 1. Clear credentials and revert status
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          email: null,
          username: null,
          hashedPassword: null,
          status: 'invited',
        },
        select: { id: true },
      });

      // 2. Remove the old invite so a fresh one can be issued
      await tx.invite.deleteMany({ where: { userId } });

      revalidatePath('/dashboard/users');
      return user;
    });
  });
}

// ============================================================================
// Delete Operations
// ============================================================================

// TODO: Add delete user functions as needed
