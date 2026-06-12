/**
 * Reset User Action
 *
 * Server action for resetting a user account back to `invited` state.
 * Nullifies email, username, and passwordHash. All other data is preserved.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { resetUserAccount } from '../service';

export type ResetUserActionResult =
  | { success: true; userId: string }
  | { success: false; error: string };

/** Server action to reset a user account */
export async function resetUserAction(
  userId: string,
): Promise<ResetUserActionResult> {
  const result = await resetUserAccount(userId);

  if (!result.success) {
    const errorType = result.error.type;
    let errorMessage: string;

    switch (errorType) {
      case 'unauthorized':
        errorMessage = 'يجب تسجيل الدخول أولاً.';
        break;
      case 'forbidden':
        errorMessage = 'ليس لديك صلاحية لإعادة تعيين هذا المستخدم.';
        break;
      case 'not-found':
        errorMessage = 'المستخدم غير موجود.';
        break;
      default:
        errorMessage = 'حدث خطأ أثناء إعادة تعيين المستخدم. يرجى المحاولة مرة أخرى.';
        break;
    }

    return { success: false, error: errorMessage };
  }

  revalidatePath('/dashboard/users');

  return { success: true, userId: result.data.userId };
}
