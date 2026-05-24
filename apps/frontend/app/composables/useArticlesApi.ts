// composables/useArticlesApi.ts
import type { Article, CreateArticleDto, UpdateArticleDto, ArticlesResponse } from '~/shared/types/articles.types';
import { useApi } from './useApi';

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
      return api('/articles', {
        method: 'GET',
        params,
      });
    },

    // Получить статью по ID (для редактирования)
    async getArticleById(id: string): Promise<Article> {
      return api(`/articles/id/${id}`, {
        method: 'GET',
      });
    },

    // Создать статью
    async createArticle(data: CreateArticleDto): Promise<Article> {
      return api('/articles', {
        method: 'POST',
        body: data,
      });
    },

    // Обновить статью
    async updateArticle(id: string, data: UpdateArticleDto): Promise<Article> {
      return api(`/articles/${id}`, {
        method: 'PATCH',
        body: data,
      });
    },

    // Удалить статью (soft delete)
    async deleteArticle(id: string): Promise<void> {
      return api(`/articles/${id}`, {
        method: 'DELETE',
      });
    },

    // Опубликовать статью
    async publishArticle(id: string): Promise<Article> {
      return api(`/articles/${id}/publish`, {
        method: 'PATCH',
      });
    },

    // Снять с публикации
    async unpublishArticle(id: string): Promise<Article> {
      return api(`/articles/${id}/unpublish`, {
        method: 'PATCH',
      });
    },

    // Получить список категорий
    async getCategories(): Promise<string[]> {
      return api('/articles/categories', {
        method: 'GET',
      });
    },

    // Получить статью по slug (публичная страница)
    async getArticleBySlug(slug: string): Promise<Article> {
      return api(`/articles/${slug}`, {
        method: 'GET',
      });
    },
  };
}
