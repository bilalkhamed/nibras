/**
 * Assignment Actions - Add Grade
 *
 * Server action for adding grade to an assignment.
 * Used by supervisors to grade student assignments
 */

'use server';

import { revalidatePath } from 'next/cache';
import type { ToggleCompletionResult } from '../types';
import { addGradingToStudentAssignment } from '../service/mutations';

/**
 * Toggle assignment completion status
 * Automatically determines paths to revalidate based on user role
 *
 * @param assignmentId - The assignment ID
 * @param isCompleted - Whether the assignment is completed
 * @param studentId - Optional student ID (for supervisors)
 * @returns Success/error result
 */
export async function addGradeAction({
  assignmentId,
  studentId,
  data,
}: {
  assignmentId: string;
  studentId: string;
  data: { grade: number; comment?: string };
}): Promise<ToggleCompletionResult> {
  // Artificial delay for better UX feedback (shows loading state)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = await addGradingToStudentAssignment({
    assignmentId,
    studentId,
    data,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  revalidatePath('/dashboard/groups/[id]/progress', 'page');

  return { success: true };
}
