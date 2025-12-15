import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/tokens';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/prisma';
import { generateGroupCode } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload || ![ADMIN_ROLE, SUPERVISOR_ROLE].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { studentId: string };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.studentId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const groupId = (await params).groupId;

  const student = await prisma.user.findUnique({
    where: { id: body.studentId },
  });

  if (!student || student.role !== STUDENT_ROLE) {
    return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const groupStudent = await prisma.groupStudent.create({
      data: {
        groupId,
        studentId: student.id,
      },
    });

    return NextResponse.json({ groupStudent }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error, groupId: groupId || 'non' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
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

  const students = await prisma.groupStudent.findMany({
    where: { groupId },
    include: {
      student: true,
    },
  });

  return NextResponse.json({ students }, { status: 200 });
}
