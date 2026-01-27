/**
 * Assignment Actions - Delete Assignment
 *
 * Server action for deleting an assignment.
 * Admin only operation that removes the assignment
 * and all related student records.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { deleteAssignment } from '../service';
import type { DeleteAssignmentResult } from '../types';

/**
 * Delete an assignment
 * Revalidates cache tags for proper client-side updates
 *
 * @param assignmentId - The assignment ID to delete
 * @returns Success/error result
 */
export async function deleteAssignmentAction(
  assignmentId: string,
): Promise<DeleteAssignmentResult> {
  const result = await deleteAssignment(assignmentId);

  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  const deleted = result.data;

  // Revalidate cache tags for this assignment's context
  revalidateTag(
    `assignments-level-${deleted.levelId}-week-${deleted.weekId}-program-${deleted.programId}`,
    'max',
  );
  revalidateTag(
    `assignments-level-${deleted.levelId}-week-${deleted.weekId}`,
    'max',
  );

  // Revalidate the admin curriculum page
  revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');

  return { success: true };
}
