/**
 * Article Actions - Update Article
 *
 * Server action for updating an existing article.
 * Admin and Media Team only operation.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { modifyArticle } from '../service';
import {
  UpdateArticleFormData,
  updateArticleFormSchema,
  type UpdateArticleResult,
} from '../types';

/**
 * Update an existing article
 *
 * @param articleId - The ID of the article to update
 * @param data - Article update data
 * @returns Success with articleId or error
 */
export async function updateArticleAction(
  articleId: string,
  data: UpdateArticleFormData,
): Promise<UpdateArticleResult> {
  // Validate input
  const validation = updateArticleFormSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message || 'بيانات غير صحيحة',
    };
  }

  const result = await modifyArticle(articleId, validation.data);

  if (!result.success) {
    switch (result.error.type) {
      case 'forbidden':
        return { success: false, error: 'ليس لديك صلاحية لتحديث هذا المقال' };
      case 'not-found':
        return { success: false, error: 'المقال غير موجود' };
      case 'unauthorized':
        return { success: false, error: 'يجب تسجيل الدخول' };
      default:
        return { success: false, error: 'حدث خطأ أثناء تحديث المقال' };
    }
  }

  // Revalidate articles pages
  revalidatePath('/dashboard/articles');
  revalidatePath(`/dashboard/articles/editor/${articleId}`);

  return {
    success: true,
    articleId: result.data.id,
  };
}
