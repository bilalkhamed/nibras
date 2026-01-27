'use cache';

import prisma from '@/lib/server/prisma';
import { Role, User } from '@prisma/client';
import { cacheTag } from 'next/cache';
import { DalReturn } from './dal/types';
import { runDalOperation } from './dal/helpers';

type UserDTO = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string | null;
  role: Role;
  birthYear: number;
  country: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  phone: string | null;
  cohort: {
    id: string;
    name: string;
  } | null;
};

export async function getAllUsers(): Promise<DalReturn<UserDTO[]>> {
  cacheTag('users');
  return runDalOperation(async () => {
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
  });
}
