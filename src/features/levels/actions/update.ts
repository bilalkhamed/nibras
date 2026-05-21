'use server';

import { ServiceReturn } from '@/lib/server/service/types';
import { CreateLevelData, createLevelSchema } from '../types';
import { modifyLevel } from '../service';
import { revalidatePath } from 'next/cache';

export async function updateLevelAction(
  levelId: string,
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

  const result = await modifyLevel(levelId, parsedData);

  if (!result.success) return result;

  revalidatePath('/dashboard/levels', 'page');
  return result;
}
