import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/server/prisma';

export async function POST(
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
    select: {
      id: true,
      role: true,
      cohortId: true,
    },
  });

  if (!student || student.role !== STUDENT_ROLE) {
    return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      cohortId: true,
    },
  });

  if (!group) {
    return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
  }

  if (student.cohortId !== group.cohortId) {
    return NextResponse.json(
      { error: 'Student and group cohort mismatch' },
      { status: 400 }
    );
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

  const students = await prisma.groupStudent.findMany({
    where: { groupId },
    include: {
      student: true,
    },
  });

  return NextResponse.json({ students }, { status: 200 });
}
