import getAuthSession from '@/lib/server/auth-session';
import { generateInvite, verifyHmacSha256 } from '@/lib/server/hash';
import prisma from '@/lib/server/prisma';
import { ADMIN_ROLE, INVITED_STATUS } from '@/types/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const auth = await getAuthSession();

  if (!auth?.role) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (auth.role !== ADMIN_ROLE) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json(
      { message: 'Missing userId parameter' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  if (user.status !== INVITED_STATUS) {
    return NextResponse.json(
      { message: 'User is not in invited status' },
      { status: 400 }
    );
  }

  const { selector, validatorHash, expiresAt, fullCode } = generateInvite();

  await prisma.invite.update({
    where: {
      userId: user.id,
    },
    data: {
      createdAt: new Date(),
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
