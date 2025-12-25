import getAuthSession from '@/lib/auth-session';
import prisma from '@/lib/prisma';
import { ADMIN_ROLE } from '@/types/types';
import { NextResponse } from 'next/server';

export async function GET() {
  const auth = await getAuthSession();

  if (!auth) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (auth.role !== ADMIN_ROLE) {
    return NextResponse.json(
      { message: 'Forbidden' },
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const cohorts = await prisma.cohort.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return NextResponse.json({ cohorts });
}
