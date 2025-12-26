import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/server/prisma';
import { generateSixCharCode } from '@/lib/shared/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload || ![ADMIN_ROLE, SUPERVISOR_ROLE].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const groupId = (await params).groupId;

  if (!groupId)
    return NextResponse.json(
      { error: 'Missing group ID', params },
      { status: 400 }
    );

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
        supervisorId:
          payload.role === SUPERVISOR_ROLE ? payload.userId : undefined,
      },
      include: {
        students: true,
        supervisor: payload.role === ADMIN_ROLE,
      },
    });
    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error, groupId: groupId || 'non' },
      { status: 500 }
    );
  }
}
