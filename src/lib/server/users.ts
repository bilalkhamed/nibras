'use cache';

import prisma from '@/lib/server/prisma';
import { Role } from '@prisma/client';
import { cacheTag } from 'next/cache';

export async function getAllUsers() {
  cacheTag('users');
  return await prisma.user.findMany({
    where: {
      role: { not: Role.admin },
    },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      role: true,
      birthYear: true,
      country: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      phone: true,
      cohort: { select: { id: true, name: true } },
    },
  });
}
