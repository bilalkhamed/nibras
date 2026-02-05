'use cache';

import { DalReturn } from '@/lib/server/dal/types';
import {
  articleWithoutContent,
  ArticleWithoutContentDTO,
  FilterArticlesParams,
  ArticleListDTO,
  articleListSelect,
  PublicArticleListDTO,
  publicArticleListSelect,
} from '../types';
import { runDalOperation } from '@/lib/server/dal/helpers';
import prisma from '@/lib/server/prisma';
import { cacheTag } from 'next/cache';
import { Article } from '@prisma/client';

export async function findManyArticles({
  isPublished,
  category,
}: FilterArticlesParams): Promise<DalReturn<ArticleWithoutContentDTO[]>> {
  cacheTag('articles', 'max');
  return runDalOperation(async () => {
    const articles = await prisma.article.findMany({
      where: {
        isPublished,
        category,
      },
      select: articleWithoutContent,
    });
    return articles;
  });
}

export async function findAllArticlesForAdmin(): Promise<
  DalReturn<ArticleListDTO[]>
> {
  cacheTag('articles', 'max');
  return runDalOperation(async () => {
    const articles = await prisma.article.findMany({
      select: articleListSelect,
      orderBy: { createdAt: 'desc' },
    });
    return articles;
  });
}

export async function findArticleByIdDal(
  id: string,
): Promise<DalReturn<Article | null>> {
  return runDalOperation(async () => {
    return prisma.article.findUnique({
      where: { id },
    });
  });
}

export async function findArticleBySlugDal(
  slug: string,
): Promise<DalReturn<Article | null>> {
  return runDalOperation(async () => {
    return prisma.article.findUnique({
      where: { slug },
    });
  });
}

// ============================================================================
// Public Queries (No Authentication Required)
// ============================================================================

export async function findPublishedArticles(): Promise<
  DalReturn<PublicArticleListDTO[]>
> {
  cacheTag('articles', 'public-articles');
  return runDalOperation(async () => {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: publicArticleListSelect,
      orderBy: { createdAt: 'desc' },
    });
    return articles;
  });
}

export async function findPublishedArticleBySlug(
  slug: string,
): Promise<DalReturn<Article | null>> {
  cacheTag('articles', `article-${slug}`);
  return runDalOperation(async () => {
    return prisma.article.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });
  });
}
