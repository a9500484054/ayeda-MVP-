<!-- apps\frontend\app\components\my-recipe\AutoCompleteTags.vue -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- HEADER -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Мои рецепты
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
        @create="openCreateModal"
        @clear-search="clearSearch"
      />
    </div>

    <!-- Tabs - Упрощенная версия с плавной анимацией -->
    <div class="mb-6">
      <div class="relative inline-flex bg-zinc-100/80 rounded-xl p-1">
        <!-- Анимированный фон -->
        <div
          class="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
          :style="{
            width: `${activeTabWidth}px`,
            transform: `translateX(${activeTabLeft}px)`
          }"
        />

        <button
          v-for="tab in tabs"
          :key="tab.value"
          ref="tabButtons"
          class="relative z-10 px-5 py-2 text-sm font-medium transition-all duration-200 rounded-lg cursor-pointer"
          :class="activeTab === tab.value
            ? 'text-green-700'
            : 'text-zinc-500 hover:text-zinc-700'"
          @click="switchTab(tab.value)"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="tab.icon"
              class="h-4 w-4 transition-all duration-200"
              :class="activeTab === tab.value ? 'text-green-600' : ''"
            />
            <span class="whitespace-nowrap">{{ tab.label }}</span>
            <span
              v-if="tab.count !== undefined"
              class="text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center"
              :class="activeTab === tab.value
                ? 'bg-green-100 text-green-700'
                : 'bg-white/60 text-zinc-500'"
            >
              {{ tab.count }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending && page === 1" class="flex flex-col items-center justify-center py-28">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      <p class="mt-4 text-sm text-zinc-500">Загрузка рецептов...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="recipes.length === 0"
         class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-24 min-h-[70vh]">
      <UIcon
        :name="activeTab === 'favorites' ? 'i-lucide-star' : 'i-lucide-cooking-pot'"
        class="h-16 w-16 text-zinc-300"
      />
      <h2 class="mt-5 text-xl font-semibold text-zinc-900">
        {{ emptyStateTitle }}
      </h2>
      <p class="mt-2 text-sm text-zinc-500">
        {{ emptyStateDescription }}
      </p>

      <Button
        v-if="activeTab === 'my' && searchQuery"
        size="md"
        variant="solid"
        color="primary"
        class="mt-6"
        @click="clearSearch"
      >
        Очистить поиск
      </Button>

      <Button
        v-if="activeTab === 'my' && !searchQuery"
        size="md"
        variant="solid"
        color="primary"
        class="mt-6"
        @click="openCreateModal"
      >
        Создать первый рецепт
      </Button>
    </div>

    <!-- Recipes Grid/List -->
    <div v-else :class="containerClass">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
        :active-tab="activeTab"
        :view-mode="currentView"
        @click="goToRecipe"
        @edit="openEditModal"
        @delete="confirmDelete"
        @submit-moderation="openSubmitModerationModal"
        @make-private="openMakePrivateModal"
        @remove-from-favorites="removeFromFavorites"
      />
    </div>

    <!-- Load More -->
    <div v-if="hasNext" class="mt-14 flex justify-center">
      <button
        class="flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-800 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <UIcon v-if="loadingMore" name="i-lucide-loader-circle" class="h-4 w-4 animate-spin" />
        <span>{{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}</span>
      </button>
    </div>

    <div v-else-if="recipes.length" class="mt-14 flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
      <UIcon name="i-lucide-check-check" class="h-4 w-4" />
      <span>Вы просмотрели все рецепты</span>
    </div>

    <!-- Modals -->
    <RecipeFormSlideover
      :open="isModalOpen"
      :mode="mode"
      :recipe="editingRecipe"
      :categories="categories"
      :units="units"
      @update:open="handleModalClose"
      @save="handleSaveRecipe"
    />

    <DeleteConfirmationModal
      :open="showDeleteModal"
      :recipe-title="recipeToDelete?.title || ''"
      :loading="isDeleting"
      @update:open="showDeleteModal = false"
      @confirm="deleteRecipe"
    />

    <SubmitModerationModal
      :open="isSubmitModerationModalOpen"
      :recipe="selectedRecipe"
      :loading="isModerationLoading"
      :error="moderationError"
      @update:open="isSubmitModerationModalOpen = false"
      @confirm="handleSubmitModeration"
    />

    <MakePrivateModal
      :open="isMakePrivateModalOpen"
      :recipe="selectedRecipe"
      :loading="isMakePrivateLoading"
      :error="makePrivateError"
      @update:open="isMakePrivateModalOpen = false"
      @confirm="handleMakePrivate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRecipesApi, type RecipeResponse, type CreateRecipeDto, type UpdateRecipeDto } from '~/composables/useRecipesApi'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
import { useUnitsApi, type Unit } from '~/composables/useUnitsApi'

import RecipeFilters from '~/components/my-recipe/RecipeFilters.vue'
import RecipeCard from '~/components/my-recipe/RecipeCard.vue'
import RecipeFormSlideover from '~/components/my-recipe/RecipeFormSlideover.vue'
import DeleteConfirmationModal from '~/components/my-recipe/DeleteConfirmationModal.vue'
import SubmitModerationModal from '~/components/my-recipe/SubmitModerationModal.vue'
import MakePrivateModal from '~/components/my-recipe/MakePrivateModal.vue'
import Button from '~/shared/ui/button/Button.vue'

definePageMeta({ layout: 'cabinet' })

const { isAuthenticated, user } = useAuth()

const toast = useToast()

const recipesApi = useRecipesApi()
const favoritesApi = useRecipesFavorites()
const categoriesApi = useCategoriesApi()
const unitsApi = useUnitsApi()

// ==================== State ====================
const recipes = ref<RecipeResponse[]>([])
const loadingMore = ref(false)
const searchQuery = ref('')
const currentView = ref<'grid' | 'list'>('grid')
const page = ref(1)
const hasNext = ref(false)
const pending = ref(false)
const activeTab = ref<'my' | 'favorites'>('my')

const favoriteIds = ref<Set<string>>(new Set())
const favoriteRecipesMap = ref<Map<string, RecipeResponse>>(new Map())

// Счётчики
const myRecipesTotal = ref(0)
const favoritesCount = ref(0)

// Modal
const isModalOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editingRecipe = ref<RecipeResponse | null>(null)

// Delete
const showDeleteModal = ref(false)
const recipeToDelete = ref<RecipeResponse | null>(null)
const isDeleting = ref(false)

// Moderation
const isSubmitModerationModalOpen = ref(false)
const isMakePrivateModalOpen = ref(false)
const selectedRecipe = ref<RecipeResponse | null>(null)
const isModerationLoading = ref(false)
const isMakePrivateLoading = ref(false)
const moderationError = ref<string | null>(null)
const makePrivateError = ref<string | null>(null)

// Data
const categories = ref<any[]>([])
const units = ref<Unit[]>([])

// ==================== Computed ====================
const totalRecipes = computed(() =>
  activeTab.value === 'favorites' ? favoritesCount.value : myRecipesTotal.value
)

const containerClass = computed(() => {
  if (currentView.value === 'list') return 'grid grid-cols-1 gap-4 xl:grid-cols-2'
  return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-3'
})

const emptyStateTitle = computed(() => {
  if (activeTab.value === 'favorites') return 'Нет избранных рецептов'
  if (searchQuery.value) return 'Рецепты не найдены'
  return 'У вас пока нет рецептов'
})

const emptyStateDescription = computed(() => {
  if (activeTab.value === 'favorites') return 'Добавляйте рецепты в избранное, чтобы они появлялись здесь'
  if (searchQuery.value) return 'Попробуйте изменить поисковый запрос'
  return 'Создайте свой первый рецепт и поделитесь им с сообществом'
})

const tabs = computed(() => [
  {
    value: 'my' as const,
    label: 'Мои рецепты',
    icon: 'i-lucide-book-open',
    count: myRecipesTotal.value
  },
  {
    value: 'favorites' as const,
    label: 'Избранное',
    icon: 'i-lucide-star',
    count: favoritesCount.value
  }
])

// ==================== Methods ====================
const getDeclension = (count: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2]
  return words[count % 100 > 4 && count % 100 < 20 ? 2 : cases[count % 10 < 5 ? count % 10 : 5]]
}

const switchTab = (tab: 'my' | 'favorites') => {
  activeTab.value = tab
}

// Fetch My Recipes
const fetchRecipes = async (reset = false) => {
  if (reset) {
    page.value = 1
    recipes.value = []
  }

  const isLoadingMore = !reset && page.value > 1
  if (isLoadingMore) loadingMore.value = true
  else pending.value = true

  try {
    const response = await recipesApi.getRecipes({
      page: page.value,
      limit: 12,
      authorId: user.value?.id,
      search: searchQuery.value || undefined,
    })

    if (reset || page.value === 1) {
      recipes.value = response.data
    } else {
      recipes.value.push(...response.data)
    }

    myRecipesTotal.value = response.total
    hasNext.value = response.hasNext

    // Загружаем статусы избранного для рецептов
    await loadFavoriteIds()
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    loadingMore.value = false
    pending.value = false
  }
}

// Fetch Favorites
const fetchFavorites = async () => {
  if (!isAuthenticated.value || !user.value?.id) return

  pending.value = true
  try {
    const favorites = await favoritesApi.getUserFavorites(user.value.id)
    const favoriteItems = favorites.data || favorites || []

    const newMap = new Map<string, RecipeResponse>()
    const newIds = new Set<string>()

    favoriteItems.forEach((item: any) => {
      const recipe = item?.recipe
      if (recipe?.id) {
        newMap.set(recipe.id, recipe)
        newIds.add(recipe.id)
      }
    })

    favoriteRecipesMap.value = newMap
    favoriteIds.value = newIds
    recipes.value = Array.from(newMap.values())
    favoritesCount.value = recipes.value.length
    hasNext.value = false
  } catch (error) {
    console.error('Error fetching favorites:', error)
    recipes.value = []
    favoritesCount.value = 0
  } finally {
    pending.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value || activeTab.value === 'favorites') return
  page.value++
  await fetchRecipes(false)
}

const loadFavoriteIds = async () => {
  if (!isAuthenticated.value || !user.value?.id) return

  try {
    const favorites = await favoritesApi.getUserFavorites(user.value.id)
    const favoriteItems = favorites.data || favorites || []

    const ids = new Set<string>()
    const map = new Map<string, RecipeResponse>()

    favoriteItems.forEach((item: any) => {
      const recipe = item?.recipe
      if (recipe?.id) {
        ids.add(recipe.id)
        map.set(recipe.id, recipe)
      }
    })

    favoriteIds.value = ids
    favoriteRecipesMap.value = map
    favoritesCount.value = favoriteItems.length
  } catch (error) {
    console.error('Error loading favorite IDs:', error)
  }
}

// Handlers
const handleSearchUpdate = (value: string) => {
  searchQuery.value = value
  fetchRecipes(true)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchRecipes(true)
}

const setView = (view: 'grid' | 'list') => {
  currentView.value = view
  if (process.client) localStorage.setItem('recipesView', view)
}

const goToRecipe = (recipe: RecipeResponse) => {
  navigateTo(recipe.srcPath ? `/recipes/${recipe.srcPath}` : `/recipes/${recipe.id}`)
}

// Modal handlers
const openCreateModal = () => {
  mode.value = 'create'
  editingRecipe.value = null
  isModalOpen.value = true
}

const openEditModal = (recipe: RecipeResponse) => {
  mode.value = 'edit'
  editingRecipe.value = recipe
  isModalOpen.value = true
}

const handleModalClose = (open: boolean) => {
  if (!open) isModalOpen.value = false
}

// const handleSaveRecipe = async (data: any, modeType: string, id?: string) => {
//   try {
//     if (modeType === 'edit' && id) {
//       await recipesApi.updateRecipe(id, data as UpdateRecipeDto)
//     } else {
//       await recipesApi.createRecipe(data as CreateRecipeDto)
//     }
//     await fetchRecipes(true)
//     await loadFavoriteIds()
//   } catch (error: any) {
//     console.error('Error saving recipe:', error)
//     throw error
//   }
// }

const handleSaveRecipe = async (data: any, modeType: string, id?: string) => {
  try {
    if (modeType === 'edit' && id) {
      await recipesApi.updateRecipe(id, data as UpdateRecipeDto)
    } else {
      await recipesApi.createRecipe(data as CreateRecipeDto)
    }

    // Обновляем списки только после успешного сохранения
    await fetchRecipes(true)
    await loadFavoriteIds()

    // Показываем только один тостер успеха
    toast.add({
      title: 'Успех',
      description: modeType === 'edit' ? 'Рецепт успешно обновлен' : 'Рецепт успешно создан',
      color: 'success'
    })

    // Возвращаем успех
    return { success: true }
  } catch (error: any) {
    console.error('Error saving recipe:', error)

    // Извлекаем сообщение об ошибке
    let errorMessage = 'Ошибка при сохранении рецепта'

    if (error.data?.message) {
      if (Array.isArray(error.data.message)) {
        errorMessage = error.data.message.join(', ')
      } else if (typeof error.data.message === 'string') {
        errorMessage = error.data.message
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    // Показываем тостер ошибки
    toast.add({
      title: 'Ошибка',
      description: errorMessage,
      color: 'error'
    })

    // Пробрасываем ошибку дальше, чтобы форма знала, что произошла ошибка
    throw error
  }
}

// Delete handlers
const confirmDelete = (recipe: RecipeResponse) => {
  recipeToDelete.value = recipe
  showDeleteModal.value = true
}

const deleteRecipe = async () => {
  if (!recipeToDelete.value) return
  isDeleting.value = true

  try {
    await recipesApi.deleteRecipe(recipeToDelete.value.id)
    showDeleteModal.value = false
    await fetchRecipes(true)
    await loadFavoriteIds()
    recipeToDelete.value = null
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    alert(error.message || 'Ошибка при удалении рецепта')
  } finally {
    isDeleting.value = false
  }
}

// Moderation handlers
const openSubmitModerationModal = (recipe: RecipeResponse) => {
  selectedRecipe.value = recipe
  isSubmitModerationModalOpen.value = true
  moderationError.value = null
}

const openMakePrivateModal = (recipe: RecipeResponse) => {
  selectedRecipe.value = recipe
  isMakePrivateModalOpen.value = true
  makePrivateError.value = null
}

const handleSubmitModeration = async () => {
  if (!selectedRecipe.value) return

  isModerationLoading.value = true
  moderationError.value = null

  try {
    await recipesApi.submitForModeration(selectedRecipe.value.id)
    isSubmitModerationModalOpen.value = false

    // Обновляем статус рецепта в локальном списке
    const updatedRecipe = { ...selectedRecipe.value, status: 'pending' }
    const index = recipes.value.findIndex(r => r.id === selectedRecipe.value?.id)
    if (index !== -1) {
      recipes.value[index] = updatedRecipe
    }

    // Обновляем общий список
    await fetchRecipes(true)
  } catch (error: any) {
    moderationError.value = error.message || 'Ошибка при отправке на модерацию'
    console.error('Error submitting for moderation:', error)
  } finally {
    isModerationLoading.value = false
  }
}

const handleMakePrivate = async () => {
  if (!selectedRecipe.value) return

  isMakePrivateLoading.value = true
  makePrivateError.value = null

  try {
    await recipesApi.makePrivate(selectedRecipe.value.id)
    isMakePrivateModalOpen.value = false

    // Обновляем статус рецепта в локальном списке
    const updatedRecipe = { ...selectedRecipe.value, status: 'private' }
    const index = recipes.value.findIndex(r => r.id === selectedRecipe.value?.id)
    if (index !== -1) {
      recipes.value[index] = updatedRecipe
    }

    // Обновляем общий список
    await fetchRecipes(true)
  } catch (error: any) {
    makePrivateError.value = error.message || 'Ошибка при изменении статуса рецепта'
    console.error('Error making private:', error)
  } finally {
    isMakePrivateLoading.value = false
  }
}



// ==================== Watchers ====================
watch(activeTab, (newTab) => {
  if (newTab === 'favorites') {
    fetchFavorites()
  } else {
    fetchRecipes(true)
  }
})

// ==================== Mounted ====================
onMounted(async () => {
  const savedView = localStorage.getItem('recipesView') as any
  if (['grid','list'].includes(savedView)) {
    currentView.value = savedView
  }

  await loadFavoriteIds()
  await fetchRecipes(true)
})
// ==================== Tab Animation Refs ====================
const tabButtons = ref<HTMLButtonElement[]>([])
const activeTabWidth = ref(0)
const activeTabLeft = ref(0)

// Обновление позиции индикатора
const updateIndicatorPosition = () => {
  if (!tabButtons.value.length) return

  const activeIndex = tabs.value.findIndex(tab => tab.value === activeTab.value)
  const activeButton = tabButtons.value[activeIndex]

  if (activeButton) {
    activeTabWidth.value = activeButton.offsetWidth
    activeTabLeft.value = activeButton.offsetLeft
  }
}

// Добавить в script секцию
const removeFromFavorites = async (recipe: RecipeResponse) => {
  if (!isAuthenticated.value || !user.value?.id) return

  try {
    await favoritesApi.toggleFavorite(recipe.id)

    // Показываем уведомление об успехе
    toast.add({
      title: 'Успех',
      description: 'Рецепт удален из избранного',
      color: 'success'
    })

    // Обновляем список избранного
    await fetchFavorites()

    // Также обновляем favoriteIds для корректного отображения в других местах
    await loadFavoriteIds()
  } catch (error: any) {
    console.error('Error removing from favorites:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить рецепт из избранного',
      color: 'error'
    })
  }
}

// Обновляем при изменении activeTab и после рендера
watch(activeTab, () => {
  nextTick(() => {
    updateIndicatorPosition()
  })
})

// Обновляем при ресайзе окна
onMounted(() => {
  nextTick(() => {
    updateIndicatorPosition()
  })
  window.addEventListener('resize', updateIndicatorPosition)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicatorPosition)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
