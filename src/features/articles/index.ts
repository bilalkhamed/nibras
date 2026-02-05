/**
 * Articles Feature - Public API
 *
 * Re-exports all articles feature modules for easy importing.
 */

// Components
export {
  ArticleContentEditor,
  ArticleCoverUploader,
  ArticleForm,
  ArticlesTable,
} from './components';

// Actions
export {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  toggleArticlePublishAction,
} from './actions';

// Service
export {
  createArticle,
  modifyArticle,
  removeArticle,
} from './service/mutations';

export {
  getArticles,
  getAllArticlesAdmin,
  getArticleById,
  getArticleBySlug,
} from './service/queries';

// Types
export type {
  ArticleData,
  CreateArticleFormData,
  UpdateArticleFormData,
  UpdateArticleData,
  ArticleListDTO,
  ArticleWithoutContentDTO,
  CreateArticleResult,
  UpdateArticleResult,
  DeleteArticleResult,
  FilterArticlesParams,
  ArticleCategory,
} from './types';

export {
  ARTICLE_CATEGORIES,
  categoryLabels,
  articleSchema,
  createArticleFormSchema,
  updateArticleFormSchema,
} from './types';
