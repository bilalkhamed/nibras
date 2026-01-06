'use cache';

import prisma from './prisma';

export async function getLevelBySlug(slug: string) {
  const level = await prisma.level.findUnique({
    where: { slug },
  });
  return level;
}
