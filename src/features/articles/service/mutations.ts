import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { ArticleData } from '../types';
import { ServiceReturn } from '@/lib/server/service/types';
import { Article } from '@prisma/client';
import { insertArticle } from '../dal';

export async function createArticle(
  data: Omit<ArticleData, 'authorId'>,
): Promise<ServiceReturn<Article>> {
  return runServiceOperation(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: {
            type: 'unauthorized',
            statusCode: 401,
          },
        };
      }

      if (session.role !== 'media_team' && session.role !== 'admin') {
        return {
          success: false,
          error: {
            type: 'forbidden',
            statusCode: 403,
          },
        };
      }

      const dalResult = await insertArticle({
        ...data,
        authorId: session.userId,
      });

      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}
