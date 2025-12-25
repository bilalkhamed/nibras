import { verifyHmacSha256 } from '@/lib/hash';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { validateInvite } from '../validate-invite';

export async function POST(request: NextRequest) {
  let body: { inviteCode: string };
  try {
    body = await request.json();
    if (!body.inviteCode) {
      throw new Error('missing values');
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { valid, status, user } = await validateInvite(body.inviteCode);
  return NextResponse.json({ valid, user }, { status });
}

//K936ZI.c5c07ca3e420969fb69b7252794100b223da797d0d9e93c798a37ead1f6d6f42
