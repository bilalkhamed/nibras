import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/server/prisma';
import { generateSixCharCode } from '@/lib/shared/utils';
import { getUserById } from '@/features/users/service';

type GroupData = {
  name: string;
  cohortId: string;
  supervisorId: string;
};

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload || payload.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: GroupData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, supervisorId, cohortId } = body;
  if (!name || !supervisorId || !cohortId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  try {
    const res = await getUserById(supervisorId);
    if (!res.success) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 },
      );
    }

    const supervisor = res.data;

    if (supervisor.role !== SUPERVISOR_ROLE) {
      return NextResponse.json(
        { error: 'Invalid supervisor ID' },
        { status: 400 },
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        cohortId,
        supervisorId,
        code: generateSixCharCode(),
      },
    });
    return NextResponse.json(
      { message: 'Group created successfully', group },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload || ![ADMIN_ROLE, SUPERVISOR_ROLE].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (payload.role === ADMIN_ROLE) {
    const groups = await prisma.group.findMany({
      include: {
        supervisor: true,
      },
    });
    return NextResponse.json({ groups });
  }

  if (payload.role === SUPERVISOR_ROLE) {
    const groups = await prisma.group.findMany({
      where: {
        supervisorId: payload.userId,
      },
    });
    return NextResponse.json({ groups });
  }
}
