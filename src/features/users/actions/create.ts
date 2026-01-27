'use server';

import { createUserSchema } from '@/lib/shared/auth-schemas';
import { createUser } from '../service';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type CreateUserActionResult =
  | { success: true; inviteCode: string }
  | { success: false; error: string; details?: z.ZodIssue[] };

/** Server action to create a new user */
export async function createUserAction(
  formData: FormData,
): Promise<CreateUserActionResult> {
  const rawData = {
    firstName: formData.get('firstName'),
    middleName: formData.get('middleName'),
    lastName: formData.get('lastName'),
    country: formData.get('country'),
    role: formData.get('role'),
    birthYear: formData.get('birthYear')
      ? Number(formData.get('birthYear'))
      : undefined,
    cohortId: formData.get('cohortId') || undefined,
    phone: formData.get('phone') || undefined,
  };

  // Validate with zod schema
  const parseResult = createUserSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      details: parseResult.error.issues,
    };
  }

  const result = await createUser(parseResult.data);

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
