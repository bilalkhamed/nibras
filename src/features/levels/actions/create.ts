'use server';

import { ServiceReturn } from '@/lib/server/service/types';
import { CreateLevelData, createLevelSchema } from '../types';
import { createLevel } from '../service';
import { revalidatePath } from 'next/cache';

export async function createLevelAction(
  data: CreateLevelData,
): Promise<ServiceReturn<{ levelId: string }>> {
  const { success, data: parsedData } = createLevelSchema.safeParse(data);

  if (!success) {
    return {
      success: false,
      error: {
        type: 'bad-request',
        statusCode: 400,
      },
    };
  }

  const result = await createLevel(parsedData);

  if (!result.success) return result;

  revalidatePath('/dashboard/levels', 'page');
  return result;
}
