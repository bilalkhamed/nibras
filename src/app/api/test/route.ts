import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/tokens';
import { ADMIN_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import prisma from '@/lib/prisma';
import { generateGroupCode } from '@/lib/utils';

type GroupData = {
  name: string;
  cohortId: string;
  supervisorId: string;
};

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload || payload.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  //   const groups = await prisma.group.findMany({
  //     where: {
  //       supervisorId: 'cmi8u647n0000our2sey70edx',
  //     },
  //     include: {
  //       supervisor: true,
  //     },
  //   });

  const supervisors = await prisma.user.findMany({
    where: {
      role: SUPERVISOR_ROLE,
      // id: 'cmi8u647n0000our2sey70edx',
    },
    include: {
      groupsAsSupervisor: {
        select: {
          name: true,
          id: true,
          cohortId: true,
        },
      },
    },
  });

  return NextResponse.json({ supervisors });
}

/* 
    In the first request, we fetched all groups which have supervisor "cmi8u647n0000our2sey70edx".

    In the second request, we fetched the supervisor with id "cmi8u647n0000our2sey70edx" and included their groups.

    Which is better?

*/
