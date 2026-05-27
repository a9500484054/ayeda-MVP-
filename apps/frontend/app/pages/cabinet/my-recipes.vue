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
      />
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="relative inline-flex bg-zinc-100/80 rounded-xl p-1">
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
            <UIcon :name="tab.icon" class="h-4 w-4" />
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

    <!-- Loading Skeletons -->
    <div v-if="showSkeletons" :class="containerClass">
      <Skeleton v-for="i in 6" :key="i" :view-mode="currentView" />
    </div>

    <!-- Recipes Grid/List -->
    <div v-else-if="recipes.length" :class="containerClass">
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

    <!-- Empty State -->
    <EmptyState
      v-else
      :title="emptyStateTitle"
      :description="emptyStateDescription"
      :icon="emptyStateIcon"
      :action-text="emptyStateActionText"
      @action="emptyStateAction"
    />

    <!-- Load More -->
    <div v-if="hasNext && activeTab === 'my'" class="mt-14 flex justify-center">
      <Button
        @click="loadMore"
        :loading="loadingMore"
        color="neutral"
        variant="outline"
      >
        {{ loadingMore ? 'Загрузка...' : 'Загрузить еще' }}
      </Button>
    </div>

    <div v-else-if="recipes.length && activeTab === 'my'" class="mt-14 flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
      <UIcon name="i-lucide-check-check" class="h-4 w-4" />
      <span>Вы просмотрели все рецепты</span>
    </div>

    <!-- Modals -->
    <RecipeFormSlideover
      :open="isModalOpen"
      :mode="mode"
      :recipe="editingRecipe"
      @update:open="handleModalClose"
      @save="handleSaveRecipe"
    />

    <ConfirmModal
      :open="showDeleteModal"
      title="Удалить рецепт?"
      :description="`Вы уверены, что хотите удалить «${recipeToDelete?.title}»? Это действие нельзя отменить.`"
      confirm-text="Удалить"
      confirm-color="danger"
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
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { getDeclension } from '~/shared/utils/strings'

// Components
import RecipeFilters from '~/components/my-recipe/RecipeFilters.vue'
import RecipeCard from '~/components/my-recipe/RecipeCard.vue'
import Skeleton from '~/shared/ui/skeleton/Skeleton.vue'
import RecipeFormSlideover from '~/components/my-recipe/forms/RecipeFormSlideover.vue'
import SubmitModerationModal from '~/components/my-recipe/modals/SubmitModerationModal.vue'
import MakePrivateModal from '~/components/my-recipe/modals/MakePrivateModal.vue'
import { useRecipesApi, type RecipeResponse } from '~/composables/useRecipesApi'
import Button from '~/shared/ui/button/Button.vue'
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue'
import { useRecipesFavorites } from '~/composables/useRecipesFavorites'
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue'

definePageMeta({ layout: 'cabinet' })

const { isAuthenticated, user } = useAuth()
const toast = useToast()

const recipesApi = useRecipesApi()
const favoritesApi = useRecipesFavorites()

// ==================== State ====================
const recipes = ref<RecipeResponse[]>([])
const favoritesData = ref<RecipeResponse[]>([]) // Хранилище избранного
const loadingMore = ref(false)
const searchQuery = ref('')
const currentView = ref<'grid' | 'list'>('grid')
const page = ref(1)
const hasNext = ref(false)
const pending = ref(false)
const activeTab = ref<'my' | 'favorites'>('my')

// Счётчики
const myRecipesTotal = ref(0)
const favoritesCount = ref(0)

// Состояние для скелетона с задержкой
const showSkeletons = ref(false)
let skeletonTimeout: ReturnType<typeof setTimeout> | null = null

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

const emptyStateIcon = computed(() => {
  if (activeTab.value === 'favorites') return 'i-lucide-star'
  if (searchQuery.value) return 'i-lucide-search'
  return 'i-lucide-cooking-pot'
})

const emptyStateActionText = computed(() => {
  if (activeTab.value === 'my' && searchQuery.value) return 'Очистить поиск'
  if (activeTab.value === 'my' && !searchQuery.value) return 'Создать первый рецепт'
  return ''
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
const switchTab = (tab: 'my' | 'favorites') => {
  activeTab.value = tab
}

// Управление отображением скелетона с задержкой
const startSkeletonTimer = () => {
  if (skeletonTimeout) clearTimeout(skeletonTimeout)
  showSkeletons.value = false

  skeletonTimeout = setTimeout(() => {
    if (pending.value && page.value === 1) {
      showSkeletons.value = true
    }
  }, 300)
}

const stopSkeletonTimer = () => {
  if (skeletonTimeout) {
    clearTimeout(skeletonTimeout)
    skeletonTimeout = null
  }
  showSkeletons.value = false
}

// Fetch Recipes в зависимости от активной вкладки
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
    if (reset || page.value === 1) {
      startSkeletonTimer()
    }
  }

  try {
    let response

    if (activeTab.value === 'favorites') {
      // Поиск по избранным рецептам
      if (searchQuery.value && searchQuery.value.trim()) {
        response = await recipesApi.searchFavoritesRecipes(searchQuery.value, {
          page: page.value,
          limit: 12,
        })
      } else {
        // Если нет поиска, показываем все избранные (пагинация на клиенте)
        const start = (page.value - 1) * 12
        const end = start + 12
        const paginatedData = favoritesData.value.slice(start, end)

        response = {
          data: paginatedData,
          total: favoritesCount.value,
          page: page.value,
          limit: 12,
          pages: Math.ceil(favoritesCount.value / 12),
          hasNext: end < favoritesCount.value,
          hasPrev: page.value > 1
        }
      }
    } else {
      // Мои рецепты
      if (searchQuery.value && searchQuery.value.trim()) {
        response = await recipesApi.searchMyRecipes(searchQuery.value, {
          page: page.value,
          limit: 12,
        })
      } else {
        response = await recipesApi.getRecipes({
          page: page.value,
          limit: 12,
          authorId: user.value?.id,
        })
      }
    }

    if (reset || page.value === 1) {
      recipes.value = response.data
    } else {
      recipes.value.push(...response.data)
    }

    if (activeTab.value === 'favorites') {
      favoritesCount.value = response.total
    } else {
      myRecipesTotal.value = response.total
    }

    hasNext.value = response.hasNext
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    loadingMore.value = false
    pending.value = false
    stopSkeletonTimer()
  }
}

// Fetch Favorites - загружает все избранное для кэша
const fetchFavorites = async () => {
  if (!isAuthenticated.value || !user.value?.id) return

  try {
    const favorites = await favoritesApi.getUserFavorites(user.value.id)
    const favoriteItems = favorites.data || favorites || []

    const recipesList: RecipeResponse[] = []

    favoriteItems.forEach((item: any) => {
      const recipe = item?.recipe
      if (recipe?.id) {
        recipesList.push(recipe)
      }
    })

    favoritesData.value = recipesList
    favoritesCount.value = recipesList.length
  } catch (error) {
    console.error('Error fetching favorites:', error)
    favoritesData.value = []
    favoritesCount.value = 0
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasNext.value) return
  page.value++
  await fetchRecipes(false)
}

// Handlers
const handleSearchUpdate = (value: string) => {
  searchQuery.value = value
  page.value = 1
  fetchRecipes(true)
}

const setView = (view: 'grid' | 'list') => {
  currentView.value = view
  if (process.client) localStorage.setItem('recipesView', view)
}

const goToRecipe = (recipe: RecipeResponse) => {
  navigateTo(recipe.srcPath ? `/recipes/${recipe.srcPath}` : `/recipes/${recipe.id}`)
}

const emptyStateAction = () => {
  if (activeTab.value === 'my' && searchQuery.value) {
    searchQuery.value = ''
    fetchRecipes(true)
  } else if (activeTab.value === 'my' && !searchQuery.value) {
    openCreateModal()
  } else if (activeTab.value === 'favorites' && searchQuery.value) {
    searchQuery.value = ''
    fetchRecipes(true)
  }
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

const handleSaveRecipe = async (data: any, modeType: string, id?: string) => {
  try {
    if (modeType === 'edit' && id) {
      await recipesApi.updateRecipe(id, data)
    } else {
      await recipesApi.createRecipe(data)
    }

    await fetchRecipes(true)
    await fetchFavorites()

    toast.add({
      title: 'Успех',
      description: modeType === 'edit' ? 'Рецепт успешно обновлен' : 'Рецепт успешно создан',
      color: 'success'
    })

    isModalOpen.value = false

    return { success: true }
  } catch (error: any) {
    console.error('Error saving recipe:', error)

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

    toast.add({
      title: 'Ошибка',
      description: errorMessage,
      color: 'error'
    })

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
    await fetchFavorites()
    recipeToDelete.value = null

    toast.add({
      title: 'Успех',
      description: 'Рецепт удален',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Ошибка при удалении рецепта',
      color: 'error'
    })
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

    const index = recipes.value.findIndex(r => r.id === selectedRecipe.value?.id)
    if (index !== -1) {
      recipes.value[index] = { ...recipes.value[index], status: 'pending' }
    }

    await fetchRecipes(true)
    await fetchFavorites()

    toast.add({
      title: 'Успех',
      description: 'Рецепт отправлен на модерацию',
      color: 'success'
    })
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

    const index = recipes.value.findIndex(r => r.id === selectedRecipe.value?.id)
    if (index !== -1) {
      recipes.value[index] = { ...recipes.value[index], status: 'private' }
    }

    await fetchRecipes(true)
    await fetchFavorites()

    toast.add({
      title: 'Успех',
      description: 'Рецепт сделан приватным',
      color: 'success'
    })
  } catch (error: any) {
    makePrivateError.value = error.message || 'Ошибка при изменении статуса рецепта'
    console.error('Error making private:', error)
  } finally {
    isMakePrivateLoading.value = false
  }
}

const removeFromFavorites = async (recipe: RecipeResponse) => {
  if (!isAuthenticated.value || !user.value?.id) return

  try {
    await favoritesApi.toggleFavorite(recipe.id)

    toast.add({
      title: 'Успех',
      description: 'Рецепт удален из избранного',
      color: 'success'
    })

    await fetchFavorites()

    if (activeTab.value === 'favorites') {
      await fetchRecipes(true)
    }
  } catch (error: any) {
    console.error('Error removing from favorites:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить рецепт из избранного',
      color: 'error'
    })
  }
}

// ==================== Watchers ====================
watch(activeTab, (newTab) => {
  searchQuery.value = ''
  page.value = 1
  fetchRecipes(true)
})

// ==================== Tab Animation ====================
const tabButtons = ref<HTMLButtonElement[]>([])
const activeTabWidth = ref(0)
const activeTabLeft = ref(0)

const updateIndicatorPosition = () => {
  if (!tabButtons.value.length) return

  const activeIndex = tabs.value.findIndex(tab => tab.value === activeTab.value)
  const activeButton = tabButtons.value[activeIndex]

  if (activeButton) {
    activeTabWidth.value = activeButton.offsetWidth
    activeTabLeft.value = activeButton.offsetLeft
  }
}

// ==================== Mounted ====================
onMounted(async () => {
  const savedView = localStorage.getItem('recipesView') as any
  if (['grid', 'list'].includes(savedView)) {
    currentView.value = savedView
  }

  // Параллельная загрузка рецептов и избранного
  await Promise.all([
    fetchRecipes(true),
    fetchFavorites()
  ])

  nextTick(() => {
    updateIndicatorPosition()
  })

  window.addEventListener('resize', updateIndicatorPosition)
})

watch(activeTab, () => {
  nextTick(() => {
    updateIndicatorPosition()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIndicatorPosition)
  stopSkeletonTimer()
})
</script>
