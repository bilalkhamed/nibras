/**
 * Assignment Actions - Toggle Completion
 *
 * Server action for toggling assignment completion status.
 * Used by students to mark their own work, and supervisors
 * to mark on behalf of students with connectivity issues.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { toggleCompletion } from '../service';
import type { ToggleCompletionResult } from '../types';

/**
 * Toggle assignment completion status
 * Automatically determines paths to revalidate based on user role
 *
 * @param assignmentId - The assignment ID
 * @param isCompleted - Whether the assignment is completed
 * @param studentId - Optional student ID (for supervisors)
 * @returns Success/error result
 */
export async function toggleAssignmentCompletionAction(
  assignmentId: string,
  isCompleted: boolean,
  studentId?: string,
): Promise<ToggleCompletionResult> {
  // Artificial delay for better UX feedback (shows loading state)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = await toggleCompletion(assignmentId, isCompleted, studentId);

  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  // Revalidate relevant paths
  // Student assignments page
  revalidatePath('/dashboard/assignments', 'page');
  // Supervisor progress tracking
  revalidatePath('/dashboard/groups/[id]/progress', 'page');

  return { success: true };
}
