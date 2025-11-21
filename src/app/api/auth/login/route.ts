import { loginSchema } from '@/lib/auth-schemas';
import { comparePasswords } from '@/lib/hash-password';
import prisma from '@/lib/prisma';
import { setAccessToken } from '@/lib/tokens';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { success, error, data } = loginSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  const { email, password } = data;

  const foundUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, hashedPassword: true },
  });

  if (!foundUser) {
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

  await setAccessToken(foundUser.id, foundUser.role);
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(request: Request) {
  return NextResponse.json({ message: 'User endpoint', you: request.url });
}
