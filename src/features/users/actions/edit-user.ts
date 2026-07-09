/**
 * Edit User Action
 *
 * Server action for updating a user's core fields and student profile.
 * Allowed for admins, cohort managers (within their cohort), and the user themselves.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { editUser } from '../service';
import {
  EditUserInput,
  EditUserProfileInput,
  editUserSchema,
  editUserProfileSchema,
} from '../types';

export type EditUserActionResult =
  | { success: true; userId: string }
  | { success: false; error: string };

/** Server action to edit a user's core info and student profile */
export async function editUserAction(
  userId: string,
  userFields: EditUserInput,
  profileFields: EditUserProfileInput,
): Promise<EditUserActionResult> {
  // Validate both schemas
  const userParse = editUserSchema.safeParse(userFields);
  if (!userParse.success) {
    return {
      success: false,
      error: 'حدث خطأ في التحقق من البيانات الشخصية.',
    };
  }

  const profileParse = editUserProfileSchema.safeParse(profileFields);
  if (!profileParse.success) {
    return {
      success: false,
      error: 'حدث خطأ في التحقق من بيانات الملف الشخصي.',
    };
  }

  const result = await editUser(userId, userParse.data, profileParse.data);

  if (!result.success) {
    const errorType = result.error.type;
    let errorMessage: string;

    switch (errorType) {
      case 'unauthorized':
        errorMessage = 'يجب تسجيل الدخول أولاً.';
        break;
      case 'forbidden':
        errorMessage = 'ليس لديك صلاحية لتعديل هذا المستخدم.';
        break;
      case 'not-found':
        errorMessage = 'المستخدم غير موجود.';
        break;
      case 'conflict':
        errorMessage = 'البريد الإلكتروني مستخدم من قِبل حساب آخر.';
        break;
      default:
        errorMessage = 'حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى.';
        break;
    }

    return { success: false, error: errorMessage };
  }

  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath(`/dashboard/profile`);

  return { success: true, userId: result.data.userId };
}
