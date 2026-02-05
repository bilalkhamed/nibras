import { runDalOperation } from '@/lib/server/dal/helpers';
import { ArticleData } from '../types';
import prisma from '@/lib/server/prisma';
import { Article } from '@prisma/client';
import { DalReturn } from '@/lib/server/dal/types';
import { revalidateTag } from 'next/cache';

export function insertArticle(data: ArticleData): Promise<DalReturn<Article>> {
  return runDalOperation(async () => {
    const newArticle = await prisma.article.create({
      data,
    });
    revalidateTag('articles', 'max');
    return newArticle;
  });
}
