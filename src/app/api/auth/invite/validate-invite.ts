import { verifyHmacSha256 } from '@/lib/server/hash';
import prisma from '@/lib/server/prisma';
import { Role, UserStatus } from '@/types/types';

export async function validateInvite(inviteCode: string): Promise<{
  valid: boolean;
  user?: { id: string; firstName: string; role: Role; status: UserStatus };
  status: number;
}> {
  const validFormat = /^[A-Z0-9]{6}\.[a-f0-9]{64}$/i.test(inviteCode);
  if (!validFormat) {
    {
      return { valid: false, status: 400 };
    }
  }

  const [selector, validator] = inviteCode.split('.');

  const invite = await prisma.invite.findUnique({
    where: {
      selector,
    },
    include: {
      user: {
        select: { id: true, firstName: true, role: true, status: true },
      },
    },
  });

  if (!invite) {
    return { valid: false, status: 400 };
  }

  if (invite.attempts >= 5) {
    return { valid: false, status: 429 };
  }

  if (invite.usedAt) {
    return { valid: false, status: 409 };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, status: 410 };
  }

  const isValid = verifyHmacSha256(validator, invite?.validatorHash);

  if (!isValid) {
    await prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    return { valid: false, status: 400 };
  }

  return { valid: true, status: 200, user: invite.user };
}
