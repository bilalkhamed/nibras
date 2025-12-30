import { InvitedUserData, invitedUserSchema } from '@/lib/shared/auth-schemas';
import { NextRequest, NextResponse } from 'next/server';
import { validateInvite } from '../validate-invite';
import { z } from 'zod';
import prisma from '@/lib/server/prisma';
import { hashPassword } from '@/lib/server/hash';
import { ACTIVE_STATUS } from '@/types/types';
import { setAccessToken } from '@/lib/server/tokens';

export async function POST(request: NextRequest) {
  let body: InvitedUserData & { inviteCode: string };
  try {
    body = await request.json();
    if (
      !body.email ||
      !body.password ||
      !body.confirmPassword ||
      !body.inviteCode
    ) {
      throw new Error('missing values');
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
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
      { status: 400 }
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
          status: ACTIVE_STATUS,
        },
        select: {
          id: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });
    });

    await setAccessToken(
      updatedUser.id,
      updatedUser.role,
      ACTIVE_STATUS,
      updatedUser.firstName,
      updatedUser.lastName
    );

    return NextResponse.json(
      { message: 'Invite completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error) {
      if ((error as any).code === 'P2002') {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Server error completing invite', error },
      { status: 500 }
    );
  }
}
