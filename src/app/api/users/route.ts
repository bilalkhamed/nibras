import { NextRequest, NextResponse } from 'next/server';
import { userSchema, UserData } from '@/lib/auth-schemas';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/hash-password';
import {
  ACCESS_TOKEN_COOKIE,
  setAccessToken,
  verifyAccessToken,
} from '@/lib/tokens';
import { cookies } from 'next/headers';
import { ADMIN_ROLE } from '@/types/types';

// Create a new user
export async function POST(request: NextRequest) {
  const body: UserData = await request.json();
  const { success, data, error } = userSchema.safeParse(body);

  const cookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const accessToken = cookie ? await verifyAccessToken(cookie) : null;

  if (accessToken && accessToken.role !== ADMIN_ROLE) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const isAdmin = accessToken?.role === ADMIN_ROLE;
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
    if (!isAdmin) {
      await setAccessToken(user.id, user.role);
    }

    return NextResponse.json(
      {
        success: true,
        message: `User created successfully ${!isAdmin ? 'and logged in' : ''}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessToken = cookie ? await verifyAccessToken(cookie) : null;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized', accessToken, cookies: request.cookies },
      { status: 401 }
    );
  }
  if (accessToken.role !== ADMIN_ROLE) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        birthYear: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // await new Promise((resolve) => setTimeout(resolve, 3000));

    return NextResponse.json(
      { message: 'users retreived successfully', users },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}
