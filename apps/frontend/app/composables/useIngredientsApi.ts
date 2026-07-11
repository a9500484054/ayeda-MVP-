// apps/frontend/app/composables/useIngredientsApi.ts
import { useApi } from "./useApi";

export interface NutritionInfo {
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  fiber?: number;
  sugar?: number;
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  short: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  description?: string;
  photo?: string;
  unit: Unit;
  nutritionInfo: NutritionInfo;
  seo?: SeoData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIngredientDto {
  code: string;
  name: string;
  description?: string;
  photo?: string;
  unitId: string;
  nutritionInfo?: NutritionInfo;
  seo?: SeoData;
}

export interface UpdateIngredientDto {
  code?: string;
  name?: string;
  description?: string;
  photo?: string;
  unitId?: string;
  nutritionInfo?: NutritionInfo;
  seo?: SeoData;
}

export interface IngredientsResponse {
  data: Ingredient[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useIngredientsApi() {
  const api = useApi();

  return {
    // Получить список ингредиентов с пагинацией
    async getIngredients(page: number = 1, limit: number = 10): Promise<IngredientsResponse> {
      return await api('/ingredients', {
        method: 'GET',
        params: { page, limit }
      });
    },

    // Поиск ингредиентов
    async searchIngredients(query: string, page: number = 1, limit: number = 10): Promise<IngredientsResponse> {
      return await api('/ingredients/search', {
        method: 'GET',
        params: { q: query, page, limit }
      });
    },

    // Получить ингредиент по ID
    async getIngredientById(id: string): Promise<Ingredient> {
      return await api(`/ingredients/${id}`);
    },

    // Создать ингредиент
    async createIngredient(data: CreateIngredientDto): Promise<Ingredient> {
      return await api('/ingredients', {
        method: 'POST',
        body: data
      });
    },

    // Обновить ингредиент
    async updateIngredient(id: string, data: UpdateIngredientDto): Promise<Ingredient> {
      return await api(`/ingredients/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // Удалить ингредиент
    async deleteIngredient(id: string): Promise<void> {
      await api(`/ingredients/${id}`, {
        method: 'DELETE'
      });
    }
  };
}
