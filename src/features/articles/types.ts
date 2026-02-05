import { Prisma } from '@prisma/client';
import z from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  slug: z.string().min(1, 'الرابط مطلوب'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  coverImageKey: z.string().optional(),
  isPublished: z.boolean().default(false),
  authorId: z.string().min(1, 'معرف المؤلف مطلوب'),
  category: z.enum(['GENERAL', 'NEWS', 'RELIGIOUS']).default('GENERAL'),
});

export type ArticleData = z.infer<typeof articleSchema>;

export const articleWithoutContent = {
  title: true,
  slug: true,
  isPublished: true,
  category: true,
} satisfies Prisma.ArticleSelect;

export type ArticleWithoutContentDTO = Prisma.ArticleGetPayload<{
  select: typeof articleWithoutContent;
}>;

export type FilterArticlesParams = {
  isPublished?: boolean;
  category?: string;
};
