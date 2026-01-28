/**
 * Groups Actions - Remove Student from Group
 *
 * Server action for removing a student from a group.
 * Admin only operation (soft delete).
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { removeStudentFromGroup } from '../service';
import {
  removeStudentFromGroupSchema,
  type RemoveStudentResult,
} from '../types';

/**
 * Remove a student from a group
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns Success or error
 */
export async function removeStudentFromGroupAction(
  groupId: string,
  studentId: string,
): Promise<RemoveStudentResult> {
  // Validate input
  const parsed = removeStudentFromGroupSchema.safeParse({ groupId, studentId });
  if (!parsed.success) {
    return {
      success: false,
      error: 'بيانات غير صالحة',
    };
  }

  const result = await removeStudentFromGroup(groupId, studentId);

  if (!result.success) {
    switch (result.error.type) {
      case 'unauthorized':
        return { success: false, error: 'غير مصرح' };
      case 'forbidden':
        return { success: false, error: 'لا يمكنك إزالة طالبة' };
      case 'not-found':
        return { success: false, error: 'الطالبة غير موجودة في المجموعة' };
      default:
        return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  // Revalidate group details
  revalidateTag(`group-${groupId}`, 'max');
  revalidatePath(`/dashboard/groups/${groupId}/info`, 'page');

  return { success: true };
}
