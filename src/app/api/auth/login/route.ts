import { loginSchema } from '@/lib/shared/auth-schemas';
import { comparePasswords } from '@/lib/server/hash';
import prisma from '@/lib/server/prisma';
import { setAccessToken } from '@/lib/server/tokens';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    var body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { success, error, data } = loginSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  const { email, password } = data;

  const foundUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      hashedPassword: true,
      firstName: true,
      lastName: true,
      cohort: {
        select: {
          currentLevelId: true,
        },
      },
    },
  });

  if (!foundUser || !foundUser.hashedPassword) {
    return NextResponse.json(
      {
        error: 'Invalid email or password',
      },
      { status: 401 }
    );
  }

  const passwordMatch = await comparePasswords(
    password,
    foundUser?.hashedPassword
  );

  if (!passwordMatch) {
    return NextResponse.json(
      {
        error: 'Invalid email or password',
      },
      { status: 401 }
    );
  }

  await setAccessToken(
    foundUser.id,
    foundUser.role,
    foundUser.status,
    foundUser.firstName,
    foundUser.lastName,
    foundUser.cohort?.currentLevelId || null
  );
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(request: Request) {
  return NextResponse.json({ message: 'User endpoint', you: request.url });
}
