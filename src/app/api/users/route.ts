import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/types/types';
import { getUsersBasic, getUsersNameOnly } from '@/features/users/service';

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
