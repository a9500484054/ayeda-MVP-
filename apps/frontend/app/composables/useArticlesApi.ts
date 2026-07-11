// composables/useArticlesApi.ts
import type {
  Article,
  CreateArticleDto,
  UpdateArticleDto,
  ArticlesResponse
} from '~/shared/types/articles.types';

export function useArticlesApi() {
  const api = useApi();

  return {
    // Получить список статей с пагинацией и фильтрацией
    async getArticles(params?: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      category?: string;
      search?: string;
    }): Promise<ArticlesResponse> {
      return api.get('/articles', { params });
    },

    // Получить статью по ID (для редактирования)
    async getArticleById(id: string): Promise<Article> {
      return api.get(`/articles/id/${id}`);
    },

    // Создать статью
    async createArticle(data: CreateArticleDto): Promise<Article> {
      return api.post('/articles', data);
    },

    // Обновить статью
    async updateArticle(id: string, data: UpdateArticleDto): Promise<Article> {
      return api.patch(`/articles/${id}`, data);
    },

    // Удалить статью (soft delete)
    async deleteArticle(id: string): Promise<void> {
      return api.delete(`/articles/${id}`);
    },

    // Опубликовать статью
    async publishArticle(id: string): Promise<Article> {
      return api.patch(`/articles/${id}/publish`);
    },

    // Снять с публикации
    async unpublishArticle(id: string): Promise<Article> {
      return api.patch(`/articles/${id}/unpublish`);
    },

    // Получить список категорий
    async getCategories(): Promise<string[]> {
      return api.get('/articles/categories');
    },

    // Получить статью по slug (публичная страница)
    async getArticleBySlug(slug: string): Promise<Article> {
      return api.get(`/articles/${slug}`);
    },
  };
}
