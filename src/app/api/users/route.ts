import { NextRequest, NextResponse } from 'next/server';
import { CreateUserData, createUserSchema } from '@/lib/shared/auth-schemas';
import { z } from 'zod';
import { Role, STUDENT_ROLE } from '@/types/types';
import {
  createUser,
  getUsersBasic,
  getUsersNameOnly,
} from '@/features/users/service';

// Create a new user
export async function POST(request: NextRequest) {
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
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 },
    );
  }

  const { success, data, error } = createUserSchema.safeParse(body);
  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  if (data.role === STUDENT_ROLE && !data.cohortId) {
    return NextResponse.json(
      { message: 'Cohort ID is required for student users' },
      { status: 422 },
    );
  }

  const result = await createUser(data);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.type },
      { status: result.error.statusCode },
    );
  }

  return NextResponse.json(
    {
      message: 'User created successfully',
      inviteCode: result.data.inviteCode,
    },
    { status: 201 },
  );
}

// 7SMMHS.02b7105ed6fe31389531a7d8921f3660da31c623fde2f9a263dd55c6f5a35e84

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const role = searchParams.get('role');
  const nameOnly = searchParams.get('nameOnly');
  const groupStatus = searchParams.get('groupStatus');
  const cohortId = searchParams.get('cohortId');

  if (![null, 'student', 'supervisor', 'admin'].includes(role)) {
    return NextResponse.json(
      { message: 'Invalid role filter' },
      { status: 422 },
    );
  }

  const filters = {
    role: role ? (role as Role) : undefined,
    groupStatus: groupStatus === 'inactive' ? ('inactive' as const) : undefined,
    cohortId: cohortId || undefined,
  };

  const result =
    nameOnly === 'true'
      ? await getUsersNameOnly(filters)
      : await getUsersBasic(filters);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.type },
      { status: result.error.statusCode },
    );
  }

  return NextResponse.json(
    { message: 'users retreived successfully', users: result.data },
    { status: 200 },
  );
}
