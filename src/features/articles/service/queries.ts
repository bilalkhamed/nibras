import {
  mapDalToService,
  runServiceOperation,
} from '@/lib/server/service/helpers';
import { FilterArticlesParams } from '../types';
import { findManyArticles } from '../dal';

export async function getArticles({
  category,
  isPublished,
}: FilterArticlesParams) {
  return runServiceOperation(async (session) => {
    if (
      !session ||
      (session.role !== 'media_team' && session.role !== 'admin')
    ) {
      isPublished = true; // Force only published articles for unauthorized users
    }

    const dalResult = await findManyArticles({
      isPublished,
      category,
    });

    return mapDalToService(dalResult);
  });
}
