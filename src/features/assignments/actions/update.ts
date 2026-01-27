/**
 * Assignment Actions - Update Assignment
 *
 * Server action for updating an existing assignment.
 * Admin only operation that updates assignment details,
 * links, and file attachments.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { updateAssignment } from '../service';
import type { UpdateAssignmentData, UpdateAssignmentResult } from '../types';

/**
 * Update an assignment
 * Fetches current assignment to get level/week IDs for cache invalidation
 *
 * @param assignmentId - The assignment ID to update
 * @param data - The update data
 * @returns Success/error result
 */
export async function updateAssignmentAction(
  assignmentId: string,
  data: UpdateAssignmentData,
): Promise<UpdateAssignmentResult> {
  const result = await updateAssignment(assignmentId, data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  const updated = result.data;

  // Revalidate cache tags for this assignment's context
  revalidateTag(
    `assignments-level-${updated.levelId}-week-${updated.weekId}-program-${updated.programId}`,
    'max',
  );
  revalidateTag(
    `assignments-level-${updated.levelId}-week-${updated.weekId}`,
    'max',
  );

  // Revalidate the admin curriculum page
  revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');

  return { success: true, assignment: updated };
}
