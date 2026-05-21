'use server';

import { ServiceReturn } from '@/lib/server/service/types';
import { removeLevel } from '../service';
import { revalidatePath } from 'next/cache';

export async function deleteLevelAction(
  levelId: string,
): Promise<ServiceReturn<{ levelId: string }>> {
  if (!levelId) {
    return {
      success: false,
      error: {
        type: 'bad-request',
        statusCode: 400,
      },
    };
  }

  const result = await removeLevel(levelId);

  if (!result.success) return result;

  revalidatePath('/dashboard/levels', 'page');
  return result;
}
