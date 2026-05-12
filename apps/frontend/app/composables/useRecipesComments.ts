// apps/frontend/app/composables/useRecipesComments.ts

import type { CommentDto, CreateCommentDto, UpdateCommentDto, CommentsResponse } from "~/shared/types/domain";
import { useApi } from "./useApi";

export function useRecipesComments() {
  const api = useApi();

  async function createComment(recipeId: string, text: string): Promise<CommentDto> {
    try {
      const response = await api<CommentDto>(`/recipes/${recipeId}/comments`, {
        method: "POST",
        body: { text },
      });
      return response;
    } catch (error) {
      console.error("Create comment error:", error);
      throw error;
    }
  }

  async function getComments(recipeId: string, page: number = 1, limit: number = 10): Promise<CommentsResponse> {
    try {
      const response = await api<CommentsResponse>(`/recipes/${recipeId}/comments?page=${page}&limit=${limit}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get comments error:", error);
      throw error;
    }
  }

  async function getComment(recipeId: string, commentId: string): Promise<CommentDto> {
    try {
      const response = await api<CommentDto>(`/recipes/${recipeId}/comments/${commentId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Get comment error:", error);
      throw error;
    }
  }

  async function updateComment(recipeId: string, commentId: string, text: string): Promise<CommentDto> {
    try {
      const response = await api<CommentDto>(`/recipes/${recipeId}/comments/${commentId}`, {
        method: "PATCH",
        body: { text },
      });
      return response;
    } catch (error) {
      console.error("Update comment error:", error);
      throw error;
    }
  }

  async function deleteComment(recipeId: string, commentId: string): Promise<void> {
    try {
      await api(`/recipes/${recipeId}/comments/${commentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      throw error;
    }
  }

  async function hideComment(recipeId: string, commentId: string): Promise<CommentDto> {
    try {
      const response = await api<CommentDto>(`/recipes/${recipeId}/comments/${commentId}/hide`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Hide comment error:", error);
      throw error;
    }
  }

  async function unhideComment(recipeId: string, commentId: string): Promise<CommentDto> {
    try {
      const response = await api<CommentDto>(`/recipes/${recipeId}/comments/${commentId}/unhide`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Unhide comment error:", error);
      throw error;
    }
  }

  return {
    createComment,
    getComments,
    getComment,
    updateComment,
    deleteComment,
    hideComment,
    unhideComment,
  };
}
