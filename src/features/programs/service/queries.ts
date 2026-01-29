import { Program } from '@prisma/client';
import { ServiceReturn } from '@/lib/server/service/types';
import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { findManyPrograms, findProgramBySlug } from '../dal/queries';

export async function getProgramBySlug(
  slug: string,
): Promise<ServiceReturn<Program | null>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findProgramBySlug(slug);

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getAllPrograms(): Promise<ServiceReturn<Program[]>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findManyPrograms();

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}
