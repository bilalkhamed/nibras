// 'use cache';

import { Level, Program } from '@prisma/client';
import { ServiceReturn } from '@/lib/server/service/types';
import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import {
  findCalendarWeekByNumber,
  findLevelBySlug,
  findManyCalendarWeeks,
  findManyLevels,
  findManyPrograms,
  findManyWeeks,
  findManyWeeksTillDate,
  findProgramBySlug,
  findWeekByDate,
  findWeekByNumber,
} from '../dal/queries';
import { getAcademicYear } from '@/lib/server/academic-year';
import { CalendarWeekDTO, WeekDTO } from '../types';

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

export async function getAllPrograms({
  filter,
}: {
  filter: 'all' | 'student' | 'supervisor';
}): Promise<ServiceReturn<Program[]>> {
  return runServiceOperation(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }

      const dalResult = await findManyPrograms({ filter });

      if (!dalResult.success) {
        return mapDalToService(dalResult);
      }

      const { role, supervisorStatus } = session;

      console.log(
        role === 'admin' ||
          role === 'cohort_manager' ||
          (role === 'supervisor' && supervisorStatus === 'in_training'),
      );

      if (
        role === 'admin' ||
        role === 'cohort_manager' ||
        (role === 'supervisor' && supervisorStatus === 'in_training')
      ) {
        return mapDalToService(dalResult);
      }

      return mapDalToService({
        ...dalResult,
        data: dalResult.data.filter(
          (program) => program.isSupervisorOnly !== true,
        ),
      });
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

export async function getWeekByDate(
  date: Date,
): Promise<ServiceReturn<CalendarWeekDTO | null>> {
  return runServiceOperation(
    async () => {
      const { year: academicYear } = getAcademicYear();
      const dalResult = await findWeekByDate(academicYear, date);

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getCalendarWeekByNumber(
  weekNumber: number,
): Promise<ServiceReturn<CalendarWeekDTO | null>> {
  return runServiceOperation(
    async () => {
      const { year: academicYear } = getAcademicYear();
      const dalResult = await findCalendarWeekByNumber(
        academicYear,
        weekNumber,
      );

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

export async function getWeekByNumber(
  weekNumber: number,
): Promise<ServiceReturn<WeekDTO | null>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findWeekByNumber(weekNumber);

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

export async function getWeeksTillDate(
  date?: Date,
): Promise<ServiceReturn<CalendarWeekDTO[]>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findManyWeeksTillDate(date || new Date());

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getAllWeeks(): Promise<ServiceReturn<WeekDTO[]>> {
  return runServiceOperation(
    async () => {
      const dalResult = await findManyWeeks();

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function getAllCalendarWeeks(): Promise<
  ServiceReturn<CalendarWeekDTO[]>
> {
  return runServiceOperation(
    async () => {
      const { year: academicYear } = getAcademicYear();
      const dalResult = await findManyCalendarWeeks(academicYear);

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}
