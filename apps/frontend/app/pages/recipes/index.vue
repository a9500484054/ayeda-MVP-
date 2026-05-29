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

    <!-- Loading Skeletons (показываем только при клиентской загрузке) -->
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
import RecipeCard from '~/components/ricepes/RecipeCard.vue'
import RecipeFilters from '~/components/ricepes/RecipeFilters.vue'
import RecipeSkeleton from '~/components/ricepes/RecipeSkeleton.vue'
import { useRecipesApi } from '~/composables/useRecipesApi'
import { useRecipesSearch } from '~/composables/useRecipesSearch'
import Button from '~/shared/ui/button/Button.vue'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'
import { getDeclension } from '~/shared/utils/strings'

definePageMeta({ layout: 'cabinet' })

const config = useRuntimeConfig()

// Начальный вид по умолчанию
const currentView = ref<'grid-large' | 'grid-small' | 'list'>('grid-large')
const isClientLoading = ref(false)

// Используем composable
const {
  recipes,
  loadingMore,
  searchQuery,
  page,
  hasNext,
  totalRecipes,
  fetchRecipes,
  loadMore,
  resetSearch,
} = useRecipesSearch()

// Computed
const containerClass = computed(() => {
  if (currentView.value === 'list') {
    return 'grid grid-cols-1 gap-4 md:grid-cols-2'
  }
  if (currentView.value === 'grid-small') {
    return 'grid grid-cols-1 gap-5 sm:grid-cols-3 xl:grid-cols-4'
  }
  return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-3'
})

// SSR данные
const { data: ssrData, pending: ssrPending } = await useAsyncData(
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

// Methods
const handleSearchUpdate = (value: string) => {
  searchQuery.value = value
  isClientLoading.value = true
  fetchRecipes(true).finally(() => {
    isClientLoading.value = false
  })
}

const clearSearch = () => {
  resetSearch()
  isClientLoading.value = true
  fetchRecipes(true).finally(() => {
    isClientLoading.value = false
  })
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

const handleFavorite = async (recipe: any, state: boolean) => {
  console.log('Favorite:', recipe.id, state)
}

const handleLike = async (recipe: any, state: boolean) => {
  console.log('Like:', recipe.id, state)
}
</script>
