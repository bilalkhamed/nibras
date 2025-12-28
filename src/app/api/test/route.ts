import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/server/tokens';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/server/prisma';
import { generateSixCharCode } from '@/lib/shared/utils';

export async function GET(request: NextRequest) {
  const programs = await prisma.program.findMany({});

  return NextResponse.json({ programs });
}
