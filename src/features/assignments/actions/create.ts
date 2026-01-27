/**
 * Assignment Actions - Create Assignment
 *
 * Server action for creating a new assignment.
 * Admin only operation that creates an assignment
 * with its attachments (links and files).
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createAssignment } from '../service';
import type { CreateAssignmentData, CreateAssignmentResult } from '../types';

/**
 * Create a new assignment
 * Revalidates cache tags for proper client-side updates
 *
 * @param data - The assignment creation data
 * @returns Success/error result with created assignment
 */
export async function createAssignmentAction(
  data: CreateAssignmentData,
): Promise<CreateAssignmentResult> {
  const result = await createAssignment(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  const created = result.data;

  // Revalidate cache tags for this assignment's context
  revalidateTag(
    `assignments-level-${created.levelId}-week-${created.weekId}-program-${created.programId}`,
    'max',
  );
  revalidateTag(
    `assignments-level-${created.levelId}-week-${created.weekId}`,
    'max',
  );

  // Revalidate the admin curriculum page
  revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');

  return { success: true, assignment: created };
}
