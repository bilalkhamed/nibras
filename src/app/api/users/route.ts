import { NextRequest, NextResponse } from 'next/server';
import { CreateUserData, createUserSchema } from '@/lib/shared/auth-schemas';
import { z } from 'zod';
import prisma from '@/lib/server/prisma';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, INVITED_STATUS, Role, STUDENT_ROLE } from '@/types/types';
import { Prisma } from '@prisma/client';
import { generateInvite } from '@/lib/server/hash';

// Create a new user
export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const accessToken = cookie ? await verifyAccessToken(cookie) : null;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (accessToken.role !== ADMIN_ROLE) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  let body: CreateUserData;
  try {
    body = await request.json();
    if (
      !body.firstName ||
      !body.middleName ||
      !body.lastName ||
      !body.country ||
      !body.role ||
      !body.birthYear
    ) {
      throw new Error('missing values');
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { success, data, error } = createUserSchema.safeParse(body);
  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  if (data.role === STUDENT_ROLE && !data.cohortId) {
    return NextResponse.json(
      { message: 'Cohort ID is required for student users' },
      { status: 422 }
    );
  }

  const { expiresAt, selector, validatorHash, fullCode } = generateInvite();
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...data,
          status: INVITED_STATUS,
        },
      });

      await tx.invite.create({
        data: {
          userId: user.id,
          expiresAt,
          selector,
          validatorHash,
        },
      });
    });
    return NextResponse.json(
      { message: 'User created successfully', inviteCode: fullCode },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Error creating user', details: err.toString() },
      { status: 500 }
    );
  }
}

// 7SMMHS.02b7105ed6fe31389531a7d8921f3660da31c623fde2f9a263dd55c6f5a35e84

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

  const searchParams = request.nextUrl.searchParams;

  const role = searchParams.get('role');
  const nameOnly = searchParams.get('nameOnly');
  const groupStatus = searchParams.get('groupStatus');
  const cohortId = searchParams.get('cohortId');

  const selectFields: Prisma.UserSelect =
    nameOnly === 'true'
      ? {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        }
      : {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          role: true,
          birthYear: true,
        };

  if (![null, 'student', 'supervisor', 'admin'].includes(role)) {
    return NextResponse.json(
      { message: 'Invalid role filter' },
      { status: 422 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: role ? (role as Role) : undefined,
        groupsAsStudent:
          groupStatus === 'inactive'
            ? {
                none: {
                  isActive: true,
                },
              }
            : undefined,
        cohortId: cohortId ? cohortId : undefined,
      },
      select: selectFields,
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
