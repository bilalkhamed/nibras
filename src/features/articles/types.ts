import { Prisma } from '@prisma/client';
import z from 'zod';

// ============================================================================
// Article Categories (Suggested categories - user can add custom ones)
// ============================================================================

export const SUGGESTED_CATEGORIES = [
  { value: 'عام', label: 'عام' },
  { value: 'أخبار', label: 'أخبار' },
  { value: 'ديني', label: 'ديني' },
  { value: 'تعليمي', label: 'تعليمي' },
  { value: 'إرشادي', label: 'إرشادي' },
] as const;

// Legacy exports for backwards compatibility
export const ARTICLE_CATEGORIES = ['GENERAL', 'NEWS', 'RELIGIOUS'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const categoryLabels: Record<string, string> = {
  GENERAL: 'عام',
  NEWS: 'أخبار',
  RELIGIOUS: 'ديني',
};

// ============================================================================
// Zod Schemas
// ============================================================================

export const articleSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  slug: z.string().min(1, 'الرابط مطلوب'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  coverImageKey: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
  authorId: z.string().min(1, 'معرف المؤلف مطلوب'),
  category: z.string().min(1, 'الفئة مطلوبة').default('عام'),
});

export const createArticleFormSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  slug: z
    .string()
    .min(1, 'الرابط مطلوب')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط',
    ),
  content: z.string().min(1, 'المحتوى مطلوب'),
  coverImageKey: z.string().optional().nullable(),
  isPublished: z.boolean(),
  category: z.string().min(1, 'الفئة مطلوبة'),
});

export const updateArticleFormSchema = createArticleFormSchema.partial();

// ============================================================================
// Types
// ============================================================================

export type ArticleData = z.infer<typeof articleSchema>;
export type CreateArticleFormData = z.infer<typeof createArticleFormSchema>;
export type UpdateArticleFormData = z.infer<typeof updateArticleFormSchema>;
export type UpdateArticleData = Partial<Omit<ArticleData, 'authorId'>>;

// ============================================================================
// Prisma Selects & DTOs
// ============================================================================

export const articleWithoutContent = {
  title: true,
  slug: true,
  isPublished: true,
  category: true,
} satisfies Prisma.ArticleSelect;

export type ArticleWithoutContentDTO = Prisma.ArticleGetPayload<{
  select: typeof articleWithoutContent;
}>;

export const articleListSelect = {
  id: true,
  title: true,
  slug: true,
  isPublished: true,
  category: true,
  coverImageKey: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.ArticleSelect;

export type ArticleListDTO = Prisma.ArticleGetPayload<{
  select: typeof articleListSelect;
}>;

// ============================================================================
// Action Result Types
// ============================================================================

export type CreateArticleResult =
  | { success: true; articleId: string }
  | { success: false; error: string };

export type UpdateArticleResult =
  | { success: true; articleId: string }
  | { success: false; error: string };

export type DeleteArticleResult =
  | { success: true }
  | { success: false; error: string };

// ============================================================================
// Filter Params
// ============================================================================

export type FilterArticlesParams = {
  isPublished?: boolean;
  category?: string;
};
