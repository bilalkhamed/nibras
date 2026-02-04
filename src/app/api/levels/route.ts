import { getAllLevels } from '@/features/programs/service';
import getAuthSession from '@/lib/server/auth-session';
import { ADMIN_ROLE } from '@/types/types';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getAuthSession();

  if (!session || session.role !== ADMIN_ROLE) {
    return NextResponse.json(
      {
        error: 'ليس لديك إذن للوصول إلى هذه البيانات',
      },
      { status: 403 },
    );
  }

  const levels = await getAllLevels();

  return NextResponse.json({ levels });
}
