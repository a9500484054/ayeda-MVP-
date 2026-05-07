import type { UserDto } from "~/shared/types/domain";
import { useApi } from "./useApi";

export interface RecipePhoto {
  id: string;
  src: string;
}

export interface RecipeStep {
  sort: number;
  text: string;
  image?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  unitId: string;
  notes?: string;
}

export interface CreateRecipeDto {
  title: string;
  description?: string;
  cookingTime: number;
  servings: number;
  calories?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'personal' | 'community';
  photo?: RecipePhoto;
  video?: string;
  steps: RecipeStep[];
  srcPath: string;
  ingredients: RecipeIngredient[];
  categoryIds: string[];
}

export interface UpdateRecipeDto {
  title?: string;
  description?: string;
  cookingTime?: number;
  servings?: number;
  calories?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'personal' | 'community';
  photo?: RecipePhoto;
  video?: string;
  steps?: RecipeStep[];
  srcPath?: string;
  ingredients?: RecipeIngredient[];
  categoryIds?: string[];
}

export interface RecipeResponse {
  id: string;
  title: string;
  description: string | null;
  cookingTime: number;
  servings: number;
  calories: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'private' | 'pending' | 'public' | 'rejected';
  type: 'personal' | 'community';
  photo: RecipePhoto | null;
  video: string | null;
  steps: RecipeStep[];
  srcPath: string;
  likes: number;
  author: UserDto;
  ingredients: any[];
  categories: any[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface RecipesResponse {
  data: RecipeResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useRecipesApi() {
  const api = useApi();

  return {
    // Получить список рецептов с пагинацией и фильтрами
    async getRecipes(params?: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      difficulty?: string;
      authorId?: string;
      categoryId?: string;
      minCookingTime?: number;
      maxCookingTime?: number;
    }): Promise<RecipesResponse> {
      return await api('/recipes', {
        method: 'GET',
        params: { page: 1, limit: 10, ...params }
      });
    },

    // Получить рецепт по ID
    async getRecipeById(id: string): Promise<RecipeResponse> {
      return await api(`/recipes/${id}`);
    },

    // Создать рецепт
    async createRecipe(data: CreateRecipeDto): Promise<RecipeResponse> {
      return await api('/recipes', {
        method: 'POST',
        body: data
      });
    },

    // Обновить рецепт
    async updateRecipe(id: string, data: UpdateRecipeDto): Promise<RecipeResponse> {
      return await api(`/recipes/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // Удалить рецепт (soft delete)
    async deleteRecipe(id: string): Promise<void> {
      await api(`/recipes/${id}`, {
        method: 'DELETE'
      });
    }
  };
}
