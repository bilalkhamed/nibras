import { InvitedUserData, invitedUserSchema } from '@/lib/shared/auth-schemas';
import { NextRequest, NextResponse } from 'next/server';
import { validateInvite } from '../validate-invite';
import { z } from 'zod';
import prisma, { Prisma } from '@/lib/server/prisma';
import { hashPassword } from '@/lib/server/hash';
import { ACTIVE_STATUS } from '@/types/types';
import { setAccessToken } from '@/lib/server/tokens';

export async function POST(request: NextRequest) {
  let body: InvitedUserData & { inviteCode: string };
  try {
    body = await request.json();
    if (
      !body.username ||
      !body.password ||
      !body.confirmPassword ||
      !body.inviteCode
    ) {
      throw new Error('missing values');
    }
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 },
    );
  }

  const { valid, status, user } = await validateInvite(body.inviteCode);

  if (!valid || !user) {
    return NextResponse.json({ message: 'Invalid invite' }, { status });
  }

  const { success, data, error } = invitedUserSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { message: 'Invalid user data', errors: z.treeifyError(error) },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.invite.update({
        where: { userId: user.id },
        data: {
          usedAt: new Date(),
          attempts: { increment: 1 },
        },
      });
      return await tx.user.update({
        where: { id: user.id },
        data: {
          email: data.email,
          hashedPassword,
          username: data.username,
          status: ACTIVE_STATUS,
        },
        select: {
          id: true,
          role: true,
          firstName: true,
          lastName: true,
          supervisedGroupId: true,
          supervisorStatus: true,
          cohort: {
            select: {
              currentLevelId: true,
            },
          },
          managedCohorts: {
            select: {
              cohortId: true,
            },
          },
          groupsAsStudent: {
            where: {
              isActive: true,
            },
          },
        },
      });
    });

    await setAccessToken(
      updatedUser.id,
      updatedUser.role,
      ACTIVE_STATUS,
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.cohort?.currentLevelId || null,
      updatedUser.groupsAsStudent.length > 0
        ? updatedUser.groupsAsStudent[0].groupId
        : null,
      updatedUser.supervisedGroupId,
      updatedUser.managedCohorts[0]?.cohortId || null,
      updatedUser.supervisorStatus,
    );

    return NextResponse.json(
      { message: 'Invite completed successfully' },
      { status: 200 },
    );
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[]) || [];

        const driverAdapterError = error.meta?.driverAdapterError as
          | {
              cause?: { originalMessage?: string };
            }
          | undefined;
        const originalMessage =
          driverAdapterError?.cause?.originalMessage || '';
        // get the field that caused the unique constraint violation from the error metadata

        return NextResponse.json(
          {
            message:
              target.includes('email') || originalMessage.includes('email')
                ? 'Email already in use'
                : 'Username already in use',
            field:
              target.includes('email') || originalMessage.includes('email')
                ? 'email'
                : 'username',
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { message: 'Server error completing invite', error },
      { status: 500 },
    );
  }
}
