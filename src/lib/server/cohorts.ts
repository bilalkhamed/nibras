'use cache';

import prisma from './prisma';

export async function getAllCohorts() {
  return await prisma.cohort.findMany();
}
