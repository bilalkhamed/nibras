'use server';

import { createUser } from '../service';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { CreateUserInput, createUserSchema } from '../types';

export type CreateUserActionResult =
  | { success: true; inviteCode: string }
  | { success: false; error: string; details?: z.ZodIssue[] };

/** Server action to create a new user */
export async function createUserAction(
  data: CreateUserInput,
): Promise<CreateUserActionResult> {
  // Validate with zod schema
  const parseResult = createUserSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'حدث خطأ في التحقق من البيانات',
      details: parseResult.error.issues,
    };
  }

  const result = await createUser(parseResult.data);

  console.log(parseResult.data.cohortId);
  if (!result.success) {
    return {
      success: false,
      error: result.error.type,
    };
  }

  // Revalidate the users page to show the new user
  revalidatePath('/dashboard/users');

  return {
    success: true,
    inviteCode: result.data.inviteCode,
  };
}
