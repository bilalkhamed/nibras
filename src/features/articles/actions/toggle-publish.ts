/**
 * Article Actions - Toggle Publish Status
 *
 * Server action for publishing/unpublishing an article.
 * Admin and Media Team only operation.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { modifyArticle } from '../service';
import type { UpdateArticleResult } from '../types';

/**
 * Toggle article publish status
 *
 * @param articleId - The ID of the article
 * @param isPublished - The new publish status
 * @returns Success with articleId or error
 */
export async function toggleArticlePublishAction(
  articleId: string,
  isPublished: boolean,
): Promise<UpdateArticleResult> {
  const result = await modifyArticle(articleId, { isPublished });

  if (!result.success) {
    switch (result.error.type) {
      case 'forbidden':
        return { success: false, error: 'ليس لديك صلاحية لتغيير حالة النشر' };
      case 'not-found':
        return { success: false, error: 'المقال غير موجود' };
      case 'unauthorized':
        return { success: false, error: 'يجب تسجيل الدخول' };
      default:
        return { success: false, error: 'حدث خطأ أثناء تغيير حالة النشر' };
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
