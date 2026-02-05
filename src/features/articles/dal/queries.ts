'use cache';

import { DalReturn } from '@/lib/server/dal/types';
import {
  articleWithoutContent,
  ArticleWithoutContentDTO,
  FilterArticlesParams,
} from '../types';
import { runDalOperation } from '@/lib/server/dal/helpers';
import prisma from '@/lib/server/prisma';
import { cacheTag } from 'next/cache';

export function findManyArticles({
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
