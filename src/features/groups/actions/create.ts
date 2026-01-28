/**
 * Groups Actions - Create Group
 *
 * Server action for creating a new group.
 * Admin only operation.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createGroup } from '../service';
import { createGroupSchema, type CreateGroupResult } from '../types';

/**
 * Create a new group
 *
 * @param data - Group creation data
 * @returns Success with groupId or error
 */
export async function createGroupAction(
  data: unknown,
): Promise<CreateGroupResult> {
  // Validate input
  const parsed = createGroupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'بيانات غير صالحة',
    };
  }

  const result = await createGroup(parsed.data);

  if (!result.success) {
    switch (result.error.type) {
      case 'unauthorized':
        return { success: false, error: 'غير مصرح' };
      case 'forbidden':
        return { success: false, error: 'لا يمكنك إنشاء مجموعة' };
      case 'bad-request':
        return { success: false, error: 'بيانات غير صالحة' };
      default:
        return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  // Revalidate groups list
  revalidateTag('groups-list', 'max');
  revalidatePath('/dashboard/groups', 'page');

  return {
    success: true,
    groupId: result.data.groupId,
  };
}
