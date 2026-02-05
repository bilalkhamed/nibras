import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { ArticleData, UpdateArticleData } from '../types';
import { ServiceReturn } from '@/lib/server/service/types';
import { Article } from '@prisma/client';
import { insertArticle, updateArticle, deleteArticle } from '../dal';

const ALLOWED_ROLES = ['media_team', 'admin'] as const;

function isAllowedRole(role: string): boolean {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

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

      if (!isAllowedRole(session.role)) {
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

export async function modifyArticle(
  id: string,
  data: UpdateArticleData,
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

      if (!isAllowedRole(session.role)) {
        return {
          success: false,
          error: {
            type: 'forbidden',
            statusCode: 403,
          },
        };
      }

      const dalResult = await updateArticle(id, data);
      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}

export async function removeArticle(
  id: string,
): Promise<ServiceReturn<{ id: string }>> {
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

      if (!isAllowedRole(session.role)) {
        return {
          success: false,
          error: {
            type: 'forbidden',
            statusCode: 403,
          },
        };
      }

      const dalResult = await deleteArticle(id);
      return mapDalToService(dalResult);
    },
    {
      requireAuth: true,
    },
  );
}
