/**
 * Delete User Action
 *
 * Server action for permanently deleting a user and all their associated data.
 * This is a hard delete — it cannot be undone.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { deleteUserAccount } from '../service';

export type DeleteUserActionResult =
  | { success: true; userId: string }
  | { success: false; error: string };

/** Server action to permanently delete a user */
export async function deleteUserAction(
  userId: string,
): Promise<DeleteUserActionResult> {
  const result = await deleteUserAccount(userId);

  if (!result.success) {
    const errorType = result.error.type;
    let errorMessage: string;

    switch (errorType) {
      case 'unauthorized':
        errorMessage = 'يجب تسجيل الدخول أولاً.';
        break;
      case 'forbidden':
        errorMessage = 'ليس لديك صلاحية لحذف هذا المستخدم.';
        break;
      case 'not-found':
        errorMessage = 'المستخدم غير موجود.';
        break;
      default:
        errorMessage = 'حدث خطأ أثناء حذف المستخدم. يرجى المحاولة مرة أخرى.';
        break;
    }

    return { success: false, error: errorMessage };
  }

  revalidatePath('/dashboard/users');

  return { success: true, userId: result.data.userId };
}
