// apps/frontend/app/composables/useRecipesLikes.ts
import type { LikeDto, LikeStatusResponse } from "~/shared/types/domain";
import { useApi } from "./useApi";

export function useRecipesLikes() {
  const api = useApi();

  async function toggleLike(recipeId: string): Promise<LikeStatusResponse> {
    try {
      const response = await api<LikeStatusResponse>(`/recipes/${recipeId}/likes`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Toggle like error:", error);
      throw error;
    }
  }

  async function getLikesStatus(recipeId: string): Promise<LikeStatusResponse> {
    try {
      const response = await api<LikeStatusResponse>(`/recipes/${recipeId}/likes/status`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get likes status error:", error);
      throw error;
    }
  }

  async function getRecipeLikes(recipeId: string): Promise<LikeDto[]> {
    try {
      const response = await api<LikeDto[]>(`/recipes/${recipeId}/likes`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get recipe likes error:", error);
      throw error;
    }
  }

  async function getUserLikes(userId: string): Promise<LikeDto[]> {
    try {
      const response = await api<LikeDto[]>(`/users/${userId}/likes`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get user likes error:", error);
      throw error;
    }
  }

  return {
    toggleLike,
    getLikesStatus,
    getRecipeLikes,
    getUserLikes,
  };
}
