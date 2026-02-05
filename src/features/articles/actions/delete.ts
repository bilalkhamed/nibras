/**
 * Article Actions - Delete Article
 *
 * Server action for deleting an article.
 * Admin and Media Team only operation.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { removeArticle } from '../service';
import type { DeleteArticleResult } from '../types';

/**
 * Delete an article
 *
 * @param articleId - The ID of the article to delete
 * @returns Success or error
 */
export async function deleteArticleAction(
  articleId: string,
): Promise<DeleteArticleResult> {
  const result = await removeArticle(articleId);

  if (!result.success) {
    switch (result.error.type) {
      case 'forbidden':
        return { success: false, error: 'ليس لديك صلاحية لحذف هذا المقال' };
      case 'not-found':
        return { success: false, error: 'المقال غير موجود' };
      case 'unauthorized':
        return { success: false, error: 'يجب تسجيل الدخول' };
      default:
        return { success: false, error: 'حدث خطأ أثناء حذف المقال' };
    }
  }

  // Revalidate articles pages
  revalidatePath('/dashboard/articles');

  return { success: true };
}
