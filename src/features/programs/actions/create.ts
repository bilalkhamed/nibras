/**
 * Programs Actions - Create Program
 *
 * Server action for creating a new program.
 * Admin only operation.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createProgram } from '../service';
import { createProgramSchema, type CreateProgramResult } from '../types';

/**
 * Create a new program
 *
 * @param data - Program creation data
 * @returns Success with programId or error
 */
export async function createProgramAction(
  data: unknown,
): Promise<CreateProgramResult> {
  // Validate input
  const parsed = createProgramSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'بيانات غير صالحة',
    };
  }

  const result = await createProgram(parsed.data);

  if (!result.success) {
    switch (result.error.type) {
      case 'unauthorized':
        return { success: false, error: 'غير مصرح' };
      case 'forbidden':
        return { success: false, error: 'لا يمكنك إنشاء برنامج' };
      case 'bad-request':
        return { success: false, error: 'بيانات غير صالحة' };
      default:
        return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  }

  revalidatePath('/dashboard/programs', 'page');

  return {
    success: true,
    programId: result.data.programId,
  };
}
