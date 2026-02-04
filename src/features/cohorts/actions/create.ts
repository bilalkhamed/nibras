'use server';

import { ServiceReturn } from '@/lib/server/service/types';
import { CreateCohortData, createCohortSchema } from '../types';
import { createCohort } from '../service';
import { revalidatePath } from 'next/cache';

export async function createCohortAction(
  data: CreateCohortData,
): Promise<ServiceReturn<{ cohortId: string }>> {
  const { success, data: parsedData } = createCohortSchema.safeParse(data);

  if (!success) {
    return {
      success: false,
      error: {
        type: 'bad-request',
        statusCode: 400,
      },
    };
  }

  const result = await createCohort(parsedData);

  if (!result.success) return result;

  revalidatePath('/cohorts');
  return result;
}
