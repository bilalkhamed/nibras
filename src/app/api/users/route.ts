import { NextResponse } from 'next/server';
import { userSchema, UserData } from '@/lib/auth-schemas';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/hash-password';
import { setAccessToken } from '@/lib/tokens';

// Create a new user
export async function POST(request: Request) {
  const body: UserData = await request.json();
  const { success, data, error } = userSchema.safeParse(body);
  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    return NextResponse.json(
      { message: 'user exists with the same email' },
      { status: 409 }
    );
  }
  try {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        birthYear: data.birthYear,
        hashedPassword,
      },
    });

    // return NextResponse.json(
    //   { message: 'user created', user },
    //   { status: 201 }
    // );
    await setAccessToken(user.id, user.role);
    return NextResponse.json(
      { success: true, message: 'User created successfully and logged in' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ message: 'User endpoint', you: request.url });
}
