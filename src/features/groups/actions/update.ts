/**
 * Update Group Action
 *
 * Server action to update an existing group.
 */

'use server';

import { updateGroupSchema, type UpdateGroupResult } from '../types';
import { updateGroup } from '../service';
import { revalidatePath } from 'next/cache';

/**
 * Update an existing group
 *
 * @param groupId - The ID of the group to update
 * @param rawData - The form data (unvalidated)
 * @returns Success or error message
 */
export async function updateGroupAction(
  groupId: string,
  rawData: unknown,
): Promise<UpdateGroupResult> {
  // Validate input
  const validation = updateGroupSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message || 'بيانات غير صحيحة',
    };
  }

  const data = validation.data;

  // Call service
  const result = await updateGroup(groupId, data);

  if (!result.success) {
    switch (result.error.type) {
      case 'forbidden':
        return { success: false, error: 'ليس لديك صلاحية لتحديث هذه المجموعة' };
      case 'not-found':
        return { success: false, error: 'المجموعة غير موجودة' };
      case 'unauthorized':
        return { success: false, error: 'يجب تسجيل الدخول' };
      default:
        return { success: false, error: 'حدث خطأ أثناء تحديث المجموعة' };
    }
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard/groups');
  revalidatePath(`/dashboard/groups/${groupId}`);

  return {
    success: true,
    groupId: result.data.groupId,
  };
}
