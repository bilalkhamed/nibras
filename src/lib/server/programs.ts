'use cache';

import { cacheTag } from 'next/cache';
import prisma from './prisma';

export async function getProgramBySlug(slug: string) {
  cacheTag('programs');
  return await prisma.program.findUnique({
    where: {
      slug,
    },
  });
}

export async function getAllPrograms() {
  cacheTag('programs');
  return await prisma.program.findMany();
}
