'use cache';

import prisma from './prisma';

export async function getProgramBySlug(slug: string) {
  return await prisma.program.findUnique({
    where: {
      slug,
    },
  });
}
