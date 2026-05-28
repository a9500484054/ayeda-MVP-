<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
    <RecipeHeader :title="recipe?.title" @back="goBack" />

    <RecipeLoading v-if="pending && !recipe" />

    <RecipeAccessDenied
      v-else-if="recipe && !canViewRecipe"
      :message="accessDeniedMessage"
      :show-login="!isAuthenticated"
      @back="goBack"
      @login="navigateToLogin"
    />

    <RecipeNotFound
      v-else-if="fetchError || !recipe"
      :no-path="!srcPath"
      :error-message="fetchError?.message"
      @back="goBack"
      @retry="refreshRecipe"
    />

    <template v-else-if="recipe && canViewRecipe">
      <RecipeHero
        :title="recipe.title"
        :description="recipe.description"
        :image-url="recipeImage"
        :cooking-time="recipe.cookingTime"
        :servings="recipe.servings"
        :calories="recipe.calories"
        :author="recipe.author"
        :categories="recipe.categories"
        :liked="liked"
        :likes-count="likesCount"
        :is-favorite="isFavorite"
        :like-pending="likePending"
        :favorite-pending="favoritePending"
        :is-authenticated="isAuthenticated"
        @like="toggleLike"
        @favorite="toggleFavorite"
        @share="shareRecipe"
      />

      <div class="grid gap-6 md:gap-8 lg:grid-cols-[380px_1fr]">
        <!-- Левая колонка - sticky -->
        <div class="lg:sticky lg:top-10 lg:self-start">
          <RecipeIngredients
            :ingredients="recipe.ingredients"
            :base-servings="recipe.servings || 1"
            :units-cache="unitsCache"
            :units-loading="unitsLoading"
            @update:servings="handleServingsChange"
            @add-to-shopping-list="addToShoppingList"
          />
        </div>

        <!-- Правая колонка -->
        <RecipeSteps :steps="recipe.steps" />
      </div>

      <RecipeComments
        :comments="comments"
        :total="commentsTotal"
        :current-page="currentCommentsPage"
        :total-pages="commentsTotalPages"
        :loading="commentsLoading"
        :comment-pending="commentPending"
        :edit-pending="editPending"
        :is-authenticated="isAuthenticated"
        :user-id="user?.id"
        :user-role="user?.role"
        @submit="submitComment"
        @update="updateComment"
        @delete="deleteComment"
        @page-change="loadComments"
        @login="navigateToLogin"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useRecipesApi, type RecipeResponse } from '~/composables/useRecipesApi'
import { useRecipesLikes } from '~/composables/useRecipesLikes'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import { useRecipesComments } from '~/composables/useRecipesComments'
import { useUnitsApi, type Unit } from '~/composables/useUnitsApi'
import { useShoppingListsApi } from '~/composables/useShoppingListsApi'
import type { CommentDto } from '~/shared/types/domain'

// Components
import RecipeHeader from '~/components/recipe/RecipeHeader.vue'
import RecipeHero from '~/components/recipe/RecipeHero.vue'
import RecipeIngredients from '~/components/recipe/RecipeIngredients.vue'
import RecipeSteps from '~/components/recipe/RecipeSteps.vue'
import RecipeComments from '~/components/recipe/RecipeComments.vue'
import RecipeLoading from '~/components/recipe/RecipeLoading.vue'
import RecipeAccessDenied from '~/components/recipe/RecipeAccessDenied.vue'
import RecipeNotFound from '~/components/recipe/RecipeNotFound.vue'

definePageMeta({
  layout: 'cabinet',
})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const recipesApi = useRecipesApi()
const likesApi = useRecipesLikes()
const favoritesApi = useRecipesFavorites()
const commentsApi = useRecipesComments()
const unitsApi = useUnitsApi()
const shoppingListsApi = useShoppingListsApi()
const { isAuthenticated, user } = useAuth()
const toast = useToast()


// ✅ Берём токен из кук напрямую на странице
const accessToken = useCookie<string | null>('access_token')
console.log('🔑 accessToken value:', accessToken.value)
console.log('🔑 accessToken type:', typeof accessToken.value)

// Получаем параметр srcPath из маршрута
const srcPath = computed(() => {
  const path = route.params.srcPath
  return Array.isArray(path) ? path[0] : path
})

console.log('📍 srcPath:', srcPath.value)

// ============ SSR DATA FETCHING ============
const { data: recipeData, pending, error: fetchError } = await useAsyncData(
  `recipe-${srcPath.value}`,
  async () => {
    console.log('🚀 useAsyncData started')

    if (!srcPath.value) {
      console.error('❌ No srcPath provided')
      throw new Error('Путь к рецепту не указан')
    }

    const apiBase = config.public.apiBase || 'http://localhost:3001'
    const url = `${apiBase}/recipes/by-path/${srcPath.value}`
    console.log('📡 Request URL:', url)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
      console.log('✅ Token added to headers')
    } else {
      console.log('⚠️ No access token available')
    }

    try {
      console.log('🌐 Fetching recipe...')
      const response = await $fetch(url, {
        method: 'GET',
        headers,
      })

      console.log('✅ Response received:', response)
      console.log('📦 Recipe ID:', response?.id)

      if (!response?.id) {
        console.error('❌ Recipe has no id')
        throw new Error('Рецепт не найден')
      }

      return response
    } catch (err: any) {
      console.error('❌ Fetch error:', err)
      console.error('❌ Error status:', err.status)
      console.error('❌ Error message:', err.message)
      console.error('❌ Error data:', err.data)
      throw err
    }
  },
  {
    server: true,
    lazy: false,
    immediate: true,
  }
)

console.log('📊 useAsyncData result:', {
  hasData: !!recipeData.value,
  pending: pending.value,
  hasError: !!fetchError.value,
  errorMessage: fetchError.value?.message
})

const recipe = computed(() => recipeData.value)

// Если есть ошибка, показываем её в консоли
if (fetchError.value) {
  console.error('🚨 Fetch error in component:', fetchError.value)
}

// ============ КЛИЕНТСКИЕ СОСТОЯНИЯ ============
const unitsCache = ref<Map<string, Unit>>(new Map())
const unitsLoading = ref(false)
const servings = ref(1)
const liked = ref(false)
const likesCount = ref(0)
const likePending = ref(false)
const isFavorite = ref(false)
const favoritePending = ref(false)

// Комментарии
const comments = ref<CommentDto[]>([])
const commentsTotal = ref(0)
const commentsTotalPages = ref(1)
const currentCommentsPage = ref(1)
const commentsLoading = ref(false)
const commentPending = ref(false)
const editPending = ref(false)

// ============ ФУНКЦИИ ============
const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const recipeImage = computed(() => {
  if (recipe.value?.photo?.src) {
    return getImageUrl(recipe.value.photo.src)
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop'
})

// Загрузка единиц измерения
const loadUnit = async (unitId: string): Promise<Unit | null> => {
  if (!unitId) return null
  if (unitsCache.value.has(unitId)) {
    return unitsCache.value.get(unitId)!
  }
  try {
    const unit = await unitsApi.getUnitById(unitId)
    if (unit) {
      unitsCache.value.set(unitId, unit)
    }
    return unit
  } catch (err) {
    console.error('Ошибка загрузки единицы измерения:', err)
    return null
  }
}

const loadUnitsForIngredients = async (ingredients: any[]) => {
  if (!ingredients?.length) return
  const unitIds = new Set<string>()
  for (const ing of ingredients) {
    if (ing.unitId) {
      unitIds.add(ing.unitId)
    }
  }
  if (unitIds.size === 0) return
  unitsLoading.value = true
  try {
    await Promise.all([...unitIds].map(id => loadUnit(id)))
  } catch (err) {
    console.error('Ошибка при загрузке единиц измерения:', err)
  } finally {
    unitsLoading.value = false
  }
}

// Лайки и избранное
const loadLikeStatus = async () => {
  if (!recipe.value?.id || !isAuthenticated.value) return
  try {
    const status = await likesApi.getLikesStatus(recipe.value.id)
    liked.value = status.liked
    likesCount.value = status.likesCount
  } catch (err) {
    console.error('Ошибка загрузки статуса лайка:', err)
  }
}

const loadFavoriteStatus = async () => {
  if (!recipe.value?.id || !isAuthenticated.value) return
  try {
    const status = await favoritesApi.getFavoriteStatus(recipe.value.id)
    isFavorite.value = status.isFavorite
  } catch (err) {
    console.error('Ошибка загрузки статуса избранного:', err)
  }
}

const toggleLike = async () => {
  if (!isAuthenticated.value) {
    navigateToLogin()
    return
  }
  if (!recipe.value?.id) return
  likePending.value = true
  try {
    const result = await likesApi.toggleLike(recipe.value.id)
    liked.value = result.liked
    likesCount.value = result.likesCount
  } catch (err) {
    console.error('Ошибка при изменении лайка:', err)
  } finally {
    likePending.value = false
  }
}

const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    navigateToLogin()
    return
  }
  if (!recipe.value?.id) return
  favoritePending.value = true
  try {
    const result = await favoritesApi.toggleFavorite(recipe.value.id)
    isFavorite.value = result.isFavorite
    toast.add({
      title: result.isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      color: 'success'
    })
  } catch (err) {
    console.error('Ошибка при изменении избранного:', err)
  } finally {
    favoritePending.value = false
  }
}

// Комментарии
const loadComments = async (page: number) => {
  if (!recipe.value?.id) return
  commentsLoading.value = true
  try {
    const response = await commentsApi.getComments(recipe.value.id, page, 10)
    if (response && typeof response === 'object') {
      if (Array.isArray(response.items)) {
        comments.value = response.items
        commentsTotal.value = response.total || response.items.length
        commentsTotalPages.value = response.pages || 1
        currentCommentsPage.value = response.page || page
      } else if (Array.isArray(response)) {
        comments.value = response
        commentsTotal.value = response.length
        commentsTotalPages.value = 1
        currentCommentsPage.value = page
      } else {
        comments.value = []
        commentsTotal.value = 0
        commentsTotalPages.value = 1
      }
    } else {
      comments.value = []
      commentsTotal.value = 0
      commentsTotalPages.value = 1
    }
  } catch (err) {
    console.error('Ошибка загрузки комментариев:', err)
    comments.value = []
    commentsTotal.value = 0
    commentsTotalPages.value = 1
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async (text: string) => {
  if (!recipe.value?.id) return
  commentPending.value = true
  try {
    await commentsApi.createComment(recipe.value.id, text)
    await loadComments(1)
  } catch (err) {
    console.error('Ошибка при отправке комментария:', err)
  } finally {
    commentPending.value = false
  }
}

const updateComment = async (commentId: string, text: string) => {
  if (!recipe.value?.id) return
  editPending.value = true
  try {
    await commentsApi.updateComment(recipe.value.id, commentId, text)
    await loadComments(currentCommentsPage.value)
  } catch (err) {
    console.error('Ошибка при обновлении комментария:', err)
  } finally {
    editPending.value = false
  }
}

const deleteComment = async (commentId: string) => {
  if (!recipe.value?.id) return
  if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
    try {
      await commentsApi.deleteComment(recipe.value.id, commentId)
      await loadComments(currentCommentsPage.value)
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err)
    }
  }
}

// Список покупок
const addToShoppingList = async (items: Array<{ name: string; amount: number; unit: string }>) => {
  if (!isAuthenticated.value) {
    navigateToLogin()
    return
  }
  try {
    await shoppingListsApi.createList({
      name: `Ингредиенты для "${recipe.value?.title}"`,
      items: items.map(item => ({
        name: item.name,
        quantity: item.amount,
        unit: item.unit
      }))
    })
    toast.add({
      title: 'Добавлено в список покупок',
      description: `Добавлено ${items.length} ингредиентов`,
      color: 'success'
    })
  } catch (err) {
    console.error('Ошибка при добавлении в список покупок:', err)
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось добавить в список покупок',
      color: 'error'
    })
  }
}

// Навигация
const goBack = () => {
  router.back()
}

const refreshRecipe = () => {
  window.location.reload()
}

const navigateToLogin = () => {
  router.push('/login')
}

const shareRecipe = async () => {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({
        title: recipe.value?.title,
        text: recipe.value?.description || undefined,
        url: url,
      })
    } catch (err) {
      console.log('Отмена шаринга')
    }
  } else {
    await navigator.clipboard.writeText(url)
    toast.add({
      title: 'Ссылка скопирована',
      description: 'Ссылка на рецепт скопирована в буфер обмена',
      color: 'success'
    })
  }
}

const handleServingsChange = (value: number) => {
  servings.value = value
}

// Доступ к рецепту
const canViewRecipe = computed(() => {
  if (!recipe.value) return false
  const status = recipe.value.status
  if (status === 'public') return true
  if (!isAuthenticated.value) return false
  const isOwner = user.value?.id === recipe.value.author?.id
  const isAdminOrModerator = user.value?.role === 'admin' || user.value?.role === 'moderator'
  return isOwner || isAdminOrModerator
})

const accessDeniedMessage = computed(() => {
  if (!recipe.value) return ''
  const statusMap: Record<string, string> = {
    draft: 'черновик',
    private: 'приватный',
    pending: 'на модерации',
    rejected: 'отклонен'
  }
  const statusText = statusMap[recipe.value.status] || recipe.value.status
  if (!isAuthenticated.value) {
    return `Этот рецепт находится в статусе "${statusText}" и доступен только автору. Пожалуйста, войдите в аккаунт.`
  }
  return `Этот рецепт находится в статусе "${statusText}" и доступен только автору, модераторам и администраторам.`
})

// Инициализация
onMounted(async () => {
  if (process.client && recipe.value) {
    servings.value = recipe.value.servings || 1
    likesCount.value = recipe.value.likes || 0

    if (recipe.value.ingredients?.length) {
      await loadUnitsForIngredients(recipe.value.ingredients)
    }

    if (isAuthenticated.value) {
      await Promise.all([
        loadLikeStatus(),
        loadFavoriteStatus()
      ])
    }
    await loadComments(1)
  }
})

// Следим за авторизацией
watch(isAuthenticated, async (newVal) => {
  if (process.client && newVal && recipe.value?.id && !liked.value && !isFavorite.value) {
    await Promise.all([
      loadLikeStatus(),
      loadFavoriteStatus()
    ])
  }
})
</script>
