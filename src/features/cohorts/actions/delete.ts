/**
 * Delete Cohort Action
 *
 * Server action for deleting a cohort.
 */

'use server';

import { removeCohort } from '../service';

export async function deleteCohortAction(cohortId: string) {
  try {
    const result = await removeCohort(cohortId);

    if (!result.success) {
      return {
        success: false,
        error: 'فشل حذف الدفعة',
      };
    }

    return {
      success: true,
      cohortId: result.data.cohortId,
    };
  } catch (error) {
    console.error('Error deleting cohort:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف الدفعة',
    };
  }
}
