/**
 * Update Cohort Action
 *
 * Server action for updating a cohort.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { modifyCohort } from '../service';
import type { CreateCohortData } from '../types';

export async function updateCohortAction(
  cohortId: string,
  data: CreateCohortData,
) {
  try {
    const result = await modifyCohort(cohortId, data);

    if (!result.success) {
      return {
        success: false,
        error: 'فشل تحديث الدفعة',
      };
    }

    revalidatePath('/dashboard/cohorts');
    return {
      success: true,
      cohortId: result.data.cohortId,
    };
  } catch (error) {
    console.error('Error updating cohort:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تحديث الدفعة',
    };
  }
}
