import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/server/prisma';
import getAuthSession from '@/lib/server/auth-session';
import { ADMIN_ROLE } from '@/types/types';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthSession();

    // Only admins can create programs
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (auth?.role !== ADMIN_ROLE) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
      if (!body?.name || !body.description) {
        throw new Error('Invalid body');
      }
    } catch {
      return NextResponse.json({ message: 'Invalid body' }, { status: 400 });
    }

    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Program name is required' },
        { status: 400 }
      );
    }

    // Create program
    const program = await prisma.program.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { message: 'Failed to create program' },
      { status: 500 }
    );
  }
}
