import { loginSchema } from '@/lib/shared/auth-schemas';
import { comparePasswords } from '@/lib/server/hash';
import { setAccessToken } from '@/lib/server/tokens';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByIdentifier } from '@/features/users/service';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { success, error, data } = loginSchema.safeParse(body);

  console.log('Parsed data:', { success, error, data });

  if (!success) {
    return NextResponse.json(z.treeifyError(error), { status: 422 });
  }

  const { identifier, password } = data;

  const res = await getUserByIdentifier(identifier);
  console.log('getUserByIdentifier result:', res);
  if (!res.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const foundUser = res.data;

  console.log('Found user:', foundUser);

  if (!foundUser.hashedPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await comparePasswords(
    password,
    foundUser.hashedPassword,
  );

  console.log('Password match:', passwordMatch);

  if (!passwordMatch) {
    return NextResponse.json(
      {
        error: 'Invalid credentials',
      },
      { status: 401 },
    );
  }

  await setAccessToken(
    foundUser.id,
    foundUser.role,
    foundUser.status,
    foundUser.firstName,
    foundUser.lastName,
    foundUser.cohort?.currentLevelId || null,
    foundUser.groupsAsStudent.length > 0
      ? foundUser.groupsAsStudent[0].groupId
      : null,
    foundUser.supervisedGroupId,
    foundUser.managedCohorts[0]?.cohortId || null,
    foundUser.supervisorStatus,
  );
  return NextResponse.json({ success: true }, { status: 200 });
}
