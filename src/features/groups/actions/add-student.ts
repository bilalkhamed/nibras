/**
 * Groups Actions - Add Student to Group
 *
 * Server action for adding a student to a group.
 * Admin only operation.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { addStudentToGroup } from '../service';
import { addStudentToGroupSchema, type AddStudentResult } from '../types';

/**
 * Add a student to a group
 *
 * @param groupId - The group ID
 * @param studentId - The student's user ID
 * @returns Success or error
 */
export async function addStudentToGroupAction(
  groupId: string,
  studentId: string,
): Promise<AddStudentResult> {
  // Validate input
  const parsed = addStudentToGroupSchema.safeParse({ groupId, studentId });
  if (!parsed.success) {
    return {
      success: false,
      error: 'بيانات غير صالحة',
    };
  }

  const result = await addStudentToGroup(groupId, studentId);

  if (!result.success) {
    switch (result.error.type) {
      case 'unauthorized':
        return { success: false, error: 'غير مصرح' };
      case 'forbidden':
        return { success: false, error: 'لا يمكنك إضافة طالبة' };
      case 'bad-request':
        return { success: false, error: 'بيانات غير صالحة' };
      case 'not-found':
        return { success: false, error: 'المجموعة غير موجودة' };
      case 'conflict':
        return { success: false, error: 'الطالبة موجودة في المجموعة مسبقاً' };
      default:
        return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  // Revalidate group details
  revalidateTag(`group-${groupId}`, 'max');
  revalidatePath(`/dashboard/groups/${groupId}/info`, 'page');

  return { success: true };
}
