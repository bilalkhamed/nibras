import { generateInvite } from '@/lib/server/hash';
import prisma from '@/lib/server/prisma';
import { INVITED_STATUS } from '@/types/types';
import { NextRequest, NextResponse } from 'next/server';
import { getUserForInvite } from '@/features/users/service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json(
      { message: 'Missing userId parameter' },
      { status: 400 },
    );
  }

  const userResult = await getUserForInvite(userId);

  if (!userResult.success) {
    return NextResponse.json(
      { message: userResult.error.type },
      { status: userResult.error.statusCode },
    );
  }

  const user = userResult.data;

  if (user.status !== INVITED_STATUS) {
    return NextResponse.json(
      { message: 'User is not in invited status' },
      { status: 400 },
    );
  }

  const { selector, validatorHash, expiresAt, fullCode } = generateInvite();

  await prisma.invite.upsert({
    where: {
      userId: user.id,
    },
    update: {
      selector,
      validatorHash,
      expiresAt,
      attempts: 0,
      usedAt: null,
    },
    create: {
      userId: user.id,
      selector,
      validatorHash,
      expiresAt,
      attempts: 0,
      usedAt: null,
    },
  });

  return NextResponse.json({ inviteCode: fullCode }, { status: 200 });
}

//K936ZI.c5c07ca3e420969fb69b7252794100b223da797d0d9e93c798a37ead1f6d6f42
