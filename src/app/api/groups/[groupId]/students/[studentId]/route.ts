import getAuthSession from '@/lib/auth-session';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string; studentId: string } }
) {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { groupId, studentId } = await params;

  const groupStudent = await prisma.groupStudent.findFirst({
    where: {
      studentId: studentId,
      groupId,
      isActive: true,
    },
  });

  if (!groupStudent) {
    return NextResponse.json(
      { message: 'Student is not active in the group' },
      { status: 404 }
    );
  }

  await prisma.groupStudent.update({
    where: {
      id: groupStudent.id,
    },
    data: {
      isActive: false,
      leftAt: new Date(),
    },
  });

  return NextResponse.json(
    { message: 'Student removed from group successfully' },
    { status: 200 }
  );
}
