// apps/frontend/app/composables/useCategoriesApi.ts
import { useApi } from "./useApi";

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useCategoriesApi() {
  const api = useApi();

  return {
    // Получить список категорий
    async getCategories(page: number = 1, limit: number = 10): Promise<CategoriesResponse> {
      return await api('/categories', {
        method: 'GET',
        params: { page, limit }
      });
    },

    // Получить категорию по ID
    async getCategoryById(id: string): Promise<Category> {
      return await api(`/categories/${id}`);
    },

    // Создать категорию
    async createCategory(data: CreateCategoryDto): Promise<Category> {
      return await api('/categories', {
        method: 'POST',
        body: data
      });
    },

    // Обновить категорию
    async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
      return await api(`/categories/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // Удалить категорию
    async deleteCategory(id: string): Promise<void> {
      await api(`/categories/${id}`, {
        method: 'DELETE'
      });
    },

    // Поиск категорий
    async searchCategories(search: string, params?: { limit?: number }): Promise<CategoriesResponse> {
      return await api('/categories/search', {
        method: 'GET',
        params: {
          q: search,
          limit: params?.limit || 20
        }
      });
    }
  };
}
