'use cache';

import { runDalOperation } from '@/lib/server/dal/helpers';
import { DalReturn } from '@/lib/server/dal/types';
import prisma from '@/lib/server/prisma';
import { Role } from '@prisma/client';
import { cacheTag } from 'next/cache';
import { UserByEmail, UserWithCohortDTO } from '../types';

export async function findManyUsers(): Promise<DalReturn<UserWithCohortDTO[]>> {
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
        phone: true,
        cohort: { select: { id: true, name: true } },
      },
    });
  });
}

export async function findUserById(
  id: string,
): Promise<DalReturn<UserWithCohortDTO | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { id },
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
        phone: true,
        cohort: { select: { id: true, name: true } },
      },
    });
  });
}

export async function findUserByEmail(
  email: string,
): Promise<DalReturn<UserByEmail | null>> {
  return runDalOperation(async () => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        hashedPassword: true,
        firstName: true,
        lastName: true,
        groupsAsStudent: {
          where: { isActive: true },
        },
        cohort: {
          select: {
            currentLevelId: true,
          },
        },
      },
    });
  });
}
