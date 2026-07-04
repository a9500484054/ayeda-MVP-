// apps/frontend/app/composables/useModerationApi.ts
import { useApi } from './useApi'
import { useRecipesApi } from './useRecipesApi'
import { useRecipesComments } from './useRecipesComments'

export interface ModerationRecipe {
  id: string
  title: string
  description: string | null
  cookingTime: number
  servings: number
  calories: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'private' | 'pending' | 'public' | 'rejected'
  type: 'personal' | 'community'
  photo: { id: string; src: string } | null
  video: string | null
  steps: Array<{ sort: number; text: string; image?: string }>
  srcPath: string
  likes: number
  author: {
    id: string
    username: string
    email: string
    avatar?: string
  }
  categories: Array<{ id: string; name: string }>
  ingredients: any[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    og_image?: string
    canonical_url?: string
  }
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface ModerationComment {
  id: string
  text: string
  recipeId: string
  recipeTitle: string
  author: {
    id: string
    username: string
    email: string
    avatar?: string
  }
  isHidden: boolean
  createdAt: string
  updatedAt: string
}

export interface ModerationQueueResponse {
  data: ModerationRecipe[]
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CommentsModerationResponse {
  data: ModerationComment[]
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export function useModerationApi() {
  const api = useApi()
  const recipesApi = useRecipesApi()
  const commentsApi = useRecipesComments()

  // ==================== Рецепты ====================

  /**
   * Получить очередь рецептов на модерацию
   */
  async function getModerationQueue(params?: {
    page?: number
    limit?: number
    search?: string
    status?: 'pending' | 'rejected'
  }): Promise<ModerationQueueResponse> {
    try {
      const response = await recipesApi.getRecipes({
        page: params?.page || 1,
        limit: params?.limit || 10,
        status: params?.status || 'pending',
        ...(params?.search ? { search: params.search } : {})
      })

      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          return {
            data: response.data as ModerationRecipe[],
            total: response.total || response.data.length,
            page: response.page || params?.page || 1,
            limit: response.limit || params?.limit || 10,
            pages: response.pages || Math.ceil((response.total || response.data.length) / (params?.limit || 10)),
            hasNext: response.hasNext || false,
            hasPrev: response.hasPrev || false
          }
        }

        if (Array.isArray(response)) {
          return {
            data: response as ModerationRecipe[],
            total: response.length,
            page: params?.page || 1,
            limit: params?.limit || 10,
            pages: Math.ceil(response.length / (params?.limit || 10)),
            hasNext: false,
            hasPrev: false
          }
        }
      }

      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        pages: 0,
        hasNext: false,
        hasPrev: false
      }
    } catch (error) {
      console.error('❌ Error in getModerationQueue:', error)
      throw error
    }
  }

  /**
   * Получить рецепт для модерации по ID
   */
  async function getRecipeForModeration(id: string): Promise<ModerationRecipe> {
    return await recipesApi.getRecipeById(id) as ModerationRecipe
  }

  /**
   * Одобрить рецепт (опубликовать) + обновить SEO
   */
  async function approveRecipe(id: string, seoData?: {
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string[]
    seoOgImage?: string
    seoCanonicalUrl?: string
  }): Promise<ModerationRecipe> {
    const updateData: any = {
      status: 'public'
    }

    if (seoData) {
      updateData.seo = {
        title: seoData.seoTitle,
        description: seoData.seoDescription,
        keywords: seoData.seoKeywords,
        og_image: seoData.seoOgImage,
        canonical_url: seoData.seoCanonicalUrl
      }
    }

    return await recipesApi.updateRecipe(id, updateData) as ModerationRecipe
  }

  /**
   * Отклонить рецепт
   */
  async function rejectRecipe(id: string, reason?: string): Promise<ModerationRecipe> {
    return await recipesApi.rejectRecipe(id, reason) as ModerationRecipe
  }

  /**
   * Обновить SEO данные рецепта (без изменения статуса)
   */
  async function updateRecipeSEO(id: string, seoData: {
    seoTitle?: string
    seoDescription?: string
    seoKeywords?: string[]
    seoOgImage?: string
    seoCanonicalUrl?: string
  }): Promise<ModerationRecipe> {
    return await recipesApi.updateRecipe(id, {
      seo: {
        title: seoData.seoTitle,
        description: seoData.seoDescription,
        keywords: seoData.seoKeywords,
        og_image: seoData.seoOgImage,
        canonical_url: seoData.seoCanonicalUrl
      }
    }) as ModerationRecipe
  }

  // ==================== Комментарии ====================

  /**
   * Получить все комментарии для модерации
   * Используем API /comments для получения всех комментариев
   * Сортируем по дате создания (сначала новые)
   */
  async function getCommentsModerationQueue(params?: {
    page?: number
    limit?: number
    search?: string
    isHidden?: boolean
  }): Promise<CommentsModerationResponse> {
    try {
      // Используем API /comments для получения всех комментариев
      const response = await api('/comments', {
        method: 'GET',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.isHidden !== undefined ? { isHidden: params.isHidden } : {})
        }
      })

      console.log('📥 getCommentsModerationQueue response:', response)

      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          return {
            data: response.data as ModerationComment[],
            total: response.total || response.data.length,
            page: response.page || params?.page || 1,
            limit: response.limit || params?.limit || 10,
            pages: response.pages || Math.ceil((response.total || response.data.length) / (params?.limit || 10)),
            hasNext: response.hasNext || false,
            hasPrev: response.hasPrev || false
          }
        }

        if (Array.isArray(response)) {
          return {
            data: response as ModerationComment[],
            total: response.length,
            page: params?.page || 1,
            limit: params?.limit || 10,
            pages: Math.ceil(response.length / (params?.limit || 10)),
            hasNext: false,
            hasPrev: false
          }
        }
      }

      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        pages: 0,
        hasNext: false,
        hasPrev: false
      }
    } catch (error) {
      console.error('❌ Error in getCommentsModerationQueue:', error)
      throw error
    }
  }

  /**
   * Скрыть комментарий
   * Используем метод hideComment из useRecipesComments
   */
  async function hideComment(recipeId: string, commentId: string): Promise<ModerationComment> {
    try {
      const response = await commentsApi.hideComment(recipeId, commentId)
      return response as ModerationComment
    } catch (error) {
      console.error('❌ Error hiding comment:', error)
      throw error
    }
  }

  /**
   * Показать комментарий (снять скрытие)
   * Используем метод unhideComment из useRecipesComments
   */
  async function showComment(recipeId: string, commentId: string): Promise<ModerationComment> {
    try {
      const response = await commentsApi.unhideComment(recipeId, commentId)
      return response as ModerationComment
    } catch (error) {
      console.error('❌ Error showing comment:', error)
      throw error
    }
  }

  /**
   * Удалить комментарий
   * Используем метод deleteComment из useRecipesComments
   */
  async function deleteComment(recipeId: string, commentId: string): Promise<void> {
    try {
      await commentsApi.deleteComment(recipeId, commentId)
    } catch (error) {
      console.error('❌ Error deleting comment:', error)
      throw error
    }
  }

  return {
    // Recipes
    getModerationQueue,
    getRecipeForModeration,
    approveRecipe,
    rejectRecipe,
    updateRecipeSEO,

    // Comments
    getCommentsModerationQueue,
    hideComment,
    showComment,
    deleteComment
  }
}
