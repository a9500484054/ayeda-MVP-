<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- HEADER -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Рецепты
        </h1>
        <p v-if="totalRecipes > 0" class="mt-2 text-sm text-zinc-500">
          {{ totalRecipes }} {{ getDeclension(totalRecipes, ['рецепт', 'рецепта', 'рецептов']) }}
        </p>
      </div>

      <RecipeFilters
        :search-query="searchQuery"
        :current-view="currentView"
        @update:search-query="handleSearchUpdate"
        @update:current-view="setView"
      />
    </div>

    <!-- Loading Skeletons -->
    <div v-if="isClientLoading && recipes.length === 0" :class="containerClass">
      <RecipeSkeleton v-for="i in 6" :key="i" :view-mode="currentView" />
    </div>

    <!-- Recipes Grid/List -->
    <div v-else-if="recipes.length" :class="containerClass">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
        :view-mode="currentView"
        @open="goToRecipe"
        @favorite="handleFavorite"
        @like="handleLike"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Рецепты не найдены"
      description="Попробуйте изменить поисковый запрос"
      icon="i-lucide-cooking-pot"
      :action-text="searchQuery ? 'Очистить поиск' : ''"
      @action="clearSearch"
    />

    <!-- Load More -->
    <div v-if="hasNext && !isClientLoading" class="mt-14 flex justify-center">
      <Button
        @click="loadMore"
        :loading="loadingMore"
        color="neutral"
        variant="outline"
      >
        {{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}
      </Button>
    </div>

    <!-- End -->
    <div v-else-if="recipes.length && !hasNext" class="mt-14 flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
      <UIcon name="i-lucide-check-check" class="h-4 w-4" />
      <span>Вы просмотрели все рецепты</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecipesApi } from '~/composables/useRecipesApi'
import { useRecipesLikes } from '~/composables/useRecipesLikes'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import Button from '~/shared/ui/button/Button.vue'
import { getDeclension } from '~/shared/utils/strings'
import { useAuth } from '~/composables/useAuth'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import RecipeCard from '~/components/ricepes/RecipeCard.vue'
import RecipeFilters from '~/components/ricepes/RecipeFilters.vue'

definePageMeta({ layout: 'cabinet' })

useHead({
  title: 'Рецепты',
  meta: [
    { name: 'description', content: 'Коллекция кулинарных рецептов на AyEda. Готовьте с удовольствием, делитесь рецептами и открывайте новые блюда.', key: 'description' },
    { name: 'robots', content: 'index, follow', key: 'robots' },
    { property: 'og:title', content: 'Рецепты | AyEda', key: 'og:title' },
    { property: 'og:description', content: 'Коллекция кулинарных рецептов на AyEda', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/og-recipes.jpg', key: 'og:image' },
    { property: 'og:image:alt', content: 'Рецепты на AyEda', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/recipes', key: 'og:url' },
    { property: 'og:site_name', content: 'AyEda', key: 'og:site_name' },
  ],
})

const config = useRuntimeConfig()
const recipesApi = useRecipesApi()
const likesApi = useRecipesLikes()
const favoritesApi = useRecipesFavorites()
const { isAuthenticated, user } = useAuth()
const toast = useToast()

// Начальный вид по умолчанию
const currentView = ref<'grid-large' | 'grid-small' | 'list'>('grid-large')
const isClientLoading = ref(false)
const pending = ref(false)

// State
const recipes = ref<any[]>([])
const loadingMore = ref(false)
const searchQuery = ref('')
const page = ref(1)
const totalRecipes = ref(0)
const hasNext = ref(false)

// Computed
const containerClass = computed(() => {
  if (currentView.value === 'list') {
    return 'grid grid-cols-1 gap-4 md:grid-cols-2'
  }
  if (currentView.value === 'grid-small') {
    return 'grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4'
  }
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-3'
})

// SSR данные
const { data: ssrData } = await useAsyncData(
  'recipes-public',
  async () => {
    const api = useRecipesApi()
    const response = await api.getRecipes({
      status: 'public',
      page: 1,
      limit: 12,
    })
    return response
  },
  {
    server: true,
    lazy: false,
  }
)

// Инициализируем данные из SSR
if (ssrData.value) {
  recipes.value = ssrData.value.data
  totalRecipes.value = ssrData.value.total
  hasNext.value = ssrData.value.hasNext
  page.value = ssrData.value.page
}

// Fetch recipes (клиентские запросы)
const fetchRecipes = async (reset = false) => {
  if (reset) {
    page.value = 1
    recipes.value = []
  }

  const isLoadingMore = !reset && page.value > 1

  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    pending.value = true
    isClientLoading.value = true
  }

  try {
    const params: any = {
      page: page.value,
      limit: 12,
      status: 'public',
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await recipesApi.getRecipes(params)

    if (reset || page.value === 1) {
      recipes.value = response.data
    } else {
      recipes.value.push(...response.data)
    }

    totalRecipes.value = response.total
    hasNext.value = response.hasNext

    // Загружаем статусы лайков и избранного для каждого рецепта
    if (isAuthenticated.value && recipes.value.length) {
      await loadRecipesStatuses()
    }
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    pending.value = false
    isClientLoading.value = false
    if (isLoadingMore) {
      loadingMore.value = false
    }
  }
}

// Загрузка статусов лайков и избранного для всех рецептов
const loadRecipesStatuses = async () => {
  for (const recipe of recipes.value) {
    try {
      // Загружаем статус лайка
      const likeStatus = await likesApi.getLikesStatus(recipe.id)
      recipe.isLiked = likeStatus.liked
      recipe.likes = likeStatus.likesCount

      // Загружаем статус избранного
      const favStatus = await favoritesApi.getFavoriteStatus(recipe.id)
      recipe.isFavorited = favStatus.isFavorite
      recipe.favorites = favStatus.favoritesCount || recipe.favorites
    } catch (error) {
      console.error(`Error loading status for recipe ${recipe.id}:`, error)
    }
  }
}

// Лайк рецепта
const handleLike = async (recipe: any, state: boolean) => {
  if (!isAuthenticated.value) {
    toast.add({
      title: 'Требуется авторизация',
      description: 'Войдите в аккаунт, чтобы ставить лайки',
      color: 'warning'
    })
    return
  }

  try {
    const result = await likesApi.toggleLike(recipe.id)
    recipe.isLiked = result.liked
    recipe.likes = result.likesCount

    toast.add({
      title: result.liked ? 'Лайк добавлен' : 'Лайк удален',
      color: 'success'
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось изменить лайк',
      color: 'error'
    })
  }
}

// Избранное
const handleFavorite = async (recipe: any, state: boolean) => {
  if (!isAuthenticated.value) {
    toast.add({
      title: 'Требуется авторизация',
      description: 'Войдите в аккаунт, чтобы добавлять в избранное',
      color: 'warning'
    })
    return
  }

  try {
    const result = await favoritesApi.toggleFavorite(recipe.id)
    recipe.isFavorited = result.isFavorite

    toast.add({
      title: result.isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      color: 'success'
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось изменить избранное',
      color: 'error'
    })
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value) return
  page.value++
  await fetchRecipes(false)
}

const handleSearchUpdate = (value: string) => {
  searchQuery.value = value
  fetchRecipes(true)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchRecipes(true)
}

const setView = (view: 'grid-large' | 'grid-small' | 'list') => {
  currentView.value = view
}

const goToRecipe = (recipe: any) => {
  if (recipe.srcPath) {
    navigateTo(`/recipes/${recipe.srcPath}`)
  } else {
    navigateTo(`/recipes/${recipe.id}`)
  }
}

// Initial load
onMounted(() => {
  if (recipes.value.length === 0) {
    fetchRecipes(true)
  } else if (isAuthenticated.value) {
    loadRecipesStatuses()
  }
})
</script>
