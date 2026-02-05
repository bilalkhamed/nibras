import { runDalOperation } from '@/lib/server/dal/helpers';
import { ArticleData, UpdateArticleData } from '../types';
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

export async function updateArticle(
  id: string,
  data: UpdateArticleData,
): Promise<DalReturn<Article>> {
  return runDalOperation(async () => {
    const updatedArticle = await prisma.article.update({
      where: { id },
      data,
    });
    revalidateTag('articles', 'max');
    return updatedArticle;
  });
}

export async function deleteArticle(
  id: string,
): Promise<DalReturn<{ id: string }>> {
  return runDalOperation(async () => {
    await prisma.article.delete({
      where: { id },
    });
    revalidateTag('articles', 'max');
    return { id };
  });
}
