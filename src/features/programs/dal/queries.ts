'use cache';

import { cacheTag } from 'next/cache';
import prisma from '@/lib/server/prisma';
import { DalReturn } from '@/lib/server/dal/types';
import { Program } from '@prisma/client';
import { runDalOperation } from '@/lib/server/dal/helpers';

export async function findProgramBySlug(
  slug: string,
): Promise<DalReturn<Program | null>> {
  return runDalOperation(async () => {
    cacheTag('programs');
    const program = await prisma.program.findUnique({
      where: {
        slug,
      },
    });
    return program;
  });
}

export async function findManyPrograms(): Promise<DalReturn<Program[]>> {
  return runDalOperation(async () => {
    cacheTag('programs');
    return await prisma.program.findMany();
  });
}
