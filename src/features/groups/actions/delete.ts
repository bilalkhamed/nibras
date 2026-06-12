/**
 * Delete Group Action
 *
 * Server action for deleting a group.
 */

'use server';

import { removeGroup } from '../service';

export async function deleteGroupAction(groupId: string) {
  try {
    const result = await removeGroup(groupId);

    if (!result.success) {
      return {
        success: false,
        error: 'فشل حذف المجموعة',
      };
    }

    return {
      success: true,
      groupId: result.data.groupId,
    };
  } catch (error) {
    console.error('Error deleting group:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء حذف المجموعة',
    };
  }
}
