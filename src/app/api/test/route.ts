import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/server/prisma';
import { generateSixCharCode } from '@/lib/shared/utils';

export async function GET(request: NextRequest) {
  const programs = await prisma.program.findMany({});

  return NextResponse.json({ programs });
}

export async function POST(request: NextRequest) {
  const user = await prisma.user.findFirst({
    where: {
      firstName: 'سندس',
    },
  });

  const assignment = await prisma.assignment.findUnique({
    where: {
      id: 'bhuzz6p8d383ldwvz2r4khf4',
    },
  });

  try {
    const studentAssignment = await prisma.studentAssignment.create({
      data: {
        studentId: user!.id,
        assignmentId: assignment!.id,
      },
    });
    return NextResponse.json({
      message: 'Student assignment created',
      studentAssignment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error creating student assignment',
        error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { studentAssignmentId, isCompleted } = body;

  try {
    const updatedStudentAssignment = await prisma.studentAssignment.update({
      where: {
        id: studentAssignmentId,
      },
      data: {
        isCompleted: isCompleted,
      },
    });
    return NextResponse.json({
      message: 'Student assignment updated',
      updatedStudentAssignment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error updating student assignment',
        // error: error.message,
      },
      { status: 500 }
    );
  }
}
