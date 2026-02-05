/**
 * Article Actions - Create Article
 *
 * Server action for creating a new article.
 * Admin and Media Team only operation.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createArticle } from '../service';
import {
  CreateArticleFormData,
  createArticleFormSchema,
  type CreateArticleResult,
} from '../types';

/**
 * Create a new article
 *
 * @param data - Article creation data
 * @returns Success with articleId or error
 */
export async function createArticleAction(
  data: CreateArticleFormData,
): Promise<CreateArticleResult> {
  // Validate input
  const validation = createArticleFormSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message || 'بيانات غير صحيحة',
    };
  }

  const result = await createArticle(validation.data);

  if (!result.success) {
    switch (result.error.type) {
      case 'forbidden':
        return { success: false, error: 'ليس لديك صلاحية لإنشاء مقال' };
      case 'unauthorized':
        return { success: false, error: 'يجب تسجيل الدخول' };
      default:
        return { success: false, error: 'حدث خطأ أثناء إنشاء المقال' };
    }
  }

  // Revalidate articles pages
  revalidatePath('/dashboard/articles');

  return {
    success: true,
    articleId: result.data.id,
  };
}
