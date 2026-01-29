import { Level, Program } from '@prisma/client';
import { ServiceReturn } from '@/lib/server/service/types';
import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import {
  findLevelBySlug,
  findManyLevels,
  findManyPrograms,
  findProgramBySlug,
  findWeekByDate,
} from '../dal/queries';
import { getAcademicYear } from '@/lib/server/academic-year';
import { CalendarWeekDTO } from '../types';

export async function getProgramBySlug(
  slug: string,
): Promise<ServiceReturn<Program | null>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findProgramBySlug(slug);

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      if (!dalResult.data) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }

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

export async function getLevelBySlug(
  slug: string,
): Promise<ServiceReturn<Level | null>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findLevelBySlug(slug);

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getAllLevels(): Promise<ServiceReturn<Level[]>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findManyLevels();

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getCurrentWeek(): Promise<
  ServiceReturn<CalendarWeekDTO | null>
> {
  return runServiceOperation(
    async () => {
      const { year: academicYear } = getAcademicYear();
      const dalResult = await findWeekByDate(academicYear, new Date());

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}
