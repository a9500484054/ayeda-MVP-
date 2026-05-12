// apps/frontend/app/composables/useRecipesFavorites.ts
import type { FavoriteStatusResponse, FavoriteRecipe } from "~/shared/types/domain";
import { useApi } from "./useApi";

export function useRecipesFavorites() {
  const api = useApi();

  async function toggleFavorite(recipeId: string): Promise<FavoriteStatusResponse> {
    try {
      const response = await api<FavoriteStatusResponse>(`/recipes/${recipeId}/favorites`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Toggle favorite error:", error);
      throw error;
    }
  }

  async function getFavoriteStatus(recipeId: string): Promise<FavoriteStatusResponse> {
    try {
      const response = await api<FavoriteStatusResponse>(`/recipes/${recipeId}/favorites/status`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get favorite status error:", error);
      throw error;
    }
  }

  async function getUserFavorites(userId: string, page: number = 1, limit: number = 10): Promise<{
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    items?: FavoriteRecipe[];
  }> {
    try {
      const response = await api<any>(`/users/${userId}/favorites?page=${page}&limit=${limit}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get user favorites error:", error);
      throw error;
    }
  }

  return {
    toggleFavorite,
    getFavoriteStatus,
    getUserFavorites,
  };
}
