<!-- apps\frontend\app\pages\recipes\index.vue -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- HEADER -->
    <div
      class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Рецепты
        </h1>

        <p
          v-if="totalRecipes > 0"
          class="mt-2 text-sm text-zinc-500"
        >
          {{ totalRecipes }}
          {{ getDeclension(totalRecipes, ['рецепт', 'рецепта', 'рецептов']) }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
        <!-- Search -->
        <div class="relative min-w-[280px]">
          <UIcon
            name="i-lucide-search"
            class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск рецептов..."
            class="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900"
            @input="onSearchInput"
          />

          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            @click="clearSearch"
          >
            <UIcon
              name="i-lucide-x"
              class="h-4 w-4"
            />
          </button>
        </div>

        <!-- View Switch -->
        <div class="hidden sm:block ml-auto">
          <div
            class="flex h-11 items-center rounded-2xl border border-zinc-200 bg-white p-1"
          >
            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="
                currentView === 'grid-small'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'
              "
              title="Компактная сетка"
              @click="setView('grid-small')"
            >
              <UIcon
                name="i-lucide-grid-3x3"
                class="h-4 w-4"
              />
            </button>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="
                currentView === 'grid-large'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'
              "
              title="Большая сетка"
              @click="setView('grid-large')"
            >
              <UIcon
                name="i-lucide-grid-2x2"
                class="h-4 w-4"
              />
            </button>

            <button
              class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
              :class="
                currentView === 'list'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-green-50 hover:text-green-600'
              "
              title="Список"
              @click="setView('list')"
            >
              <UIcon
                name="i-lucide-list"
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="pending && page === 1"
      class="flex flex-col items-center justify-center py-28"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"
      />

      <p class="mt-4 text-sm text-zinc-500">
        Загрузка рецептов...
      </p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="recipes.length === 0"
      class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24"
    >
      <UIcon
        name="i-lucide-cooking-pot"
        class="h-16 w-16 text-zinc-300"
      />

      <h2 class="mt-5 text-xl font-semibold text-zinc-900">
        Рецепты не найдены
      </h2>

      <p class="mt-2 text-sm text-zinc-500">
        Попробуйте изменить поисковый запрос
      </p>

      <button
        v-if="searchQuery"
        class="mt-6 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        @click="clearSearch"
      >
        Очистить поиск
      </button>
    </div>

    <!-- Recipes -->
    <div
      v-else
      :class="containerClass"
    >
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
        :view-mode="currentView === 'list' ? 'list' : 'grid'"
        :compact="currentView === 'grid-small'"
        class="transition-transform duration-200 hover:-translate-y-1"
        @click="goToRecipe(recipe)"
      />
    </div>

    <!-- Load More -->
    <div
      v-if="hasNext"
      class="mt-14 flex justify-center"
    >
      <button
        class="flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-800 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <UIcon
          v-if="loadingMore"
          name="i-lucide-loader-circle"
          class="h-4 w-4 animate-spin"
        />

        <span>
          {{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}
        </span>
      </button>
    </div>

    <!-- End -->
    <div
      v-else-if="recipes.length"
      class="mt-14 flex items-center justify-center gap-2 py-8 text-sm text-zinc-400"
    >
      <UIcon
        name="i-lucide-check-check"
        class="h-4 w-4"
      />

      <span>Вы просмотрели все рецепты</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useRecipesApi,
  type RecipeResponse,
} from '~/composables/useRecipesApi'

definePageMeta({
  layout: 'cabinet',
})

const recipesApi = useRecipesApi()

const getInitialView = (): 'grid-large' | 'grid-small' | 'list' => {
  if (process.client) {
    const saved = localStorage.getItem('recipesView')

    if (
      saved === 'grid-large' ||
      saved === 'grid-small' ||
      saved === 'list'
    ) {
      return saved
    }
  }

  return 'grid-large'
}

// State
const recipes = ref<RecipeResponse[]>([])
const loadingMore = ref(false)
const searchQuery = ref('')
const currentView = ref<'grid-large' | 'grid-small' | 'list'>(
  getInitialView(),
)

const page = ref(1)
const total = ref(0)
const hasNext = ref(false)

let searchDebounceTimer: NodeJS.Timeout | null = null

// SSR
const { data, pending } = await useAsyncData(
  'recipes',
  async () => {
    const response = await recipesApi.getRecipes({
      page: 1,
      limit: 12,
    })

    return response
  },
  {
    server: true,
    lazy: false,
  },
)

// Init data
if (data.value) {
  recipes.value = data.value.data
  total.value = data.value.total
  hasNext.value = data.value.hasNext
}

// Computed
const totalRecipes = computed(() => total.value)

const containerClass = computed(() => {
  if (currentView.value === 'list') {
    return 'grid grid-cols-1 gap-4 md:grid-cols-2'
  }

  if (currentView.value === 'grid-small') {
    return 'grid grid-cols-1 gap-5 sm:grid-cols-3 xl:grid-cols-4'
  }

  return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-3'
})

// Methods
const getDeclension = (
  count: number,
  words: [string, string, string],
): string => {
  const cases = [2, 0, 1, 1, 1, 2]

  return words[
    count % 100 > 4 && count % 100 < 20
      ? 2
      : cases[count % 10 < 5 ? count % 10 : 5]
  ]
}

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
  }

  try {
    const response = await recipesApi.getRecipes({
      page: page.value,
      limit: 12,
      search: searchQuery.value || undefined,
    })

    if (reset || page.value === 1) {
      recipes.value = response.data
    } else {
      recipes.value.push(...response.data)
    }

    total.value = response.total
    hasNext.value = response.hasNext
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    if (isLoadingMore) {
      loadingMore.value = false
    } else {
      pending.value = false
    }
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value) {
    return
  }

  page.value++

  await fetchRecipes(false)
}

const onSearchInput = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    fetchRecipes(true)
  }, 400)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchRecipes(true)
}

const setView = (
  view: 'grid-large' | 'grid-small' | 'list',
) => {
  currentView.value = view

  if (process.client) {
    localStorage.setItem('recipesView', view)
  }
}

const goToRecipe = (recipe: RecipeResponse) => {
  if (recipe.srcPath) {
    navigateTo(`/recipes/${recipe.srcPath}`)
  } else {
    navigateTo(`/recipes/${recipe.id}`)
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
