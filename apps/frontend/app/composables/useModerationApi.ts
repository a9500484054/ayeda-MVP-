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
   * Используем новый метод getCommentsForModeration из useRecipesComments
   */
  async function getCommentsModerationQueue(params?: {
    page?: number
    limit?: number
    search?: string
    isHidden?: boolean
    recipeId?: string
    authorId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    startDate?: string
    endDate?: string
  }): Promise<CommentsModerationResponse> {
    try {
      const response = await commentsApi.getCommentsForModeration(params)

      // Преобразуем CommentDto в ModerationComment
      const data = response.data.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        recipeId: comment.recipeId,
        recipeTitle: comment.recipeTitle || comment.recipe?.title || 'Рецепт',
        author: comment.author || {
          id: comment.authorId || '',
          username: comment.authorName || 'Пользователь',
          email: comment.authorEmail || '',
          avatar: comment.authorAvatar || null
        },
        isHidden: comment.isHidden || false,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }))

      return {
        data,
        total: response.total || data.length,
        page: response.page || params?.page || 1,
        limit: response.limit || params?.limit || 10,
        pages: response.pages || Math.ceil((response.total || data.length) / (params?.limit || 10)),
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false
      }
    } catch (error) {
      console.error('❌ Error in getCommentsModerationQueue:', error)
      throw error
    }
  }

  /**
   * Скрыть комментарий
   */
  async function hideComment(recipeId: string, commentId: string): Promise<ModerationComment> {
    try {
      const response = await commentsApi.hideComment(recipeId, commentId)
      return {
        id: response.id,
        text: response.text,
        recipeId: response.recipeId,
        recipeTitle: response.recipe?.title || 'Рецепт',
        author: response.author || {
          id: response.authorId || '',
          username: response.authorName || 'Пользователь',
          email: response.authorEmail || '',
          avatar: response.authorAvatar || null
        },
        isHidden: response.isHidden || false,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }
    } catch (error) {
      console.error('❌ Error hiding comment:', error)
      throw error
    }
  }

  /**
   * Показать комментарий (снять скрытие)
   */
  async function showComment(recipeId: string, commentId: string): Promise<ModerationComment> {
    try {
      const response = await commentsApi.unhideComment(recipeId, commentId)
      return {
        id: response.id,
        text: response.text,
        recipeId: response.recipeId,
        recipeTitle: response.recipe?.title || 'Рецепт',
        author: response.author || {
          id: response.authorId || '',
          username: response.authorName || 'Пользователь',
          email: response.authorEmail || '',
          avatar: response.authorAvatar || null
        },
        isHidden: response.isHidden || false,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }
    } catch (error) {
      console.error('❌ Error showing comment:', error)
      throw error
    }
  }

  /**
   * Удалить комментарий
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
