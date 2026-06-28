import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { ArticleListDTO, FilterArticlesParams } from '../types';
import {
  findManyArticles,
  findAllArticlesForAdmin,
  findArticleByIdDal,
  findArticleBySlugDal,
} from '../dal';
import { ServiceReturn } from '@/lib/server/service/types';
import { Article } from '@prisma/client';

const ALLOWED_ROLES = ['media_team', 'admin', 'director'] as const;

function isAllowedRole(role: string): boolean {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export async function getArticles({
  category,
  isPublished,
}: FilterArticlesParams) {
  return runServiceOperation(async (session) => {
    if (!session || !isAllowedRole(session.role)) {
      isPublished = true; // Force only published articles for unauthorized users
    }

    const dalResult = await findManyArticles({
      isPublished,
      category,
    });

    return mapDalToService(dalResult);
  });
}

export async function getAllArticlesAdmin(): Promise<
  ServiceReturn<ArticleListDTO[]>
> {
  return runServiceOperation(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }

      if (!isAllowedRole(session.role)) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findAllArticlesForAdmin();
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

export async function getArticleById(
  id: string,
): Promise<ServiceReturn<Article | null>> {
  return runServiceOperation(
    async (session) => {
      if (!session) {
        return {
          success: false,
          error: { type: 'unauthorized', statusCode: 401 },
        };
      }

      if (!isAllowedRole(session.role)) {
        return {
          success: false,
          error: { type: 'forbidden', statusCode: 403 },
        };
      }

      const dalResult = await findArticleByIdDal(id);
      return mapDalToService(dalResult);
    },
    { requireAuth: true },
  );
}

export async function getArticleBySlug(
  slug: string,
): Promise<ServiceReturn<Article | null>> {
  return runServiceOperation(async (session) => {
    const dalResult = await findArticleBySlugDal(slug);

    if (!dalResult.success) {
      return mapDalToService(dalResult);
    }

    const article = dalResult.data;

    // If article is not published, only allow admins/media team to view
    if (article && !article.isPublished) {
      if (!session || !isAllowedRole(session.role)) {
        return {
          success: false,
          error: { type: 'not-found', statusCode: 404 },
        };
      }
    }

    return mapDalToService(dalResult);
  });
}
