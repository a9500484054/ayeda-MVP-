<script setup lang="ts">
import RecipesTable from '~/components/admin/recipes/RecipesTable.vue'
import RecipeFilters from '~/components/admin/recipes/RecipeFilters.vue'
import RecipeFormModal from '~/components/admin/recipes/RecipeFormModal.vue'
import DeleteConfirmModal from '~/components/admin/recipes/DeleteConfirmModal.vue'
import { useRecipesApi, type RecipeResponse } from '~/composables/useRecipesApi'

definePageMeta({
  layout: 'admin',
  title: 'Рецепты'
})

const toast = useToast()
const recipesApi = useRecipesApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string>('')
const difficultyFilter = ref<string>('')
const typeFilter = ref<string>('')

const isFormModalOpen = ref(false)
const formModalMode = ref<'create' | 'edit'>('create')
const isDeleteModalOpen = ref(false)

const selectedRecipe = ref<RecipeResponse | null>(null)
const isLoading = ref(false)

// Данные
const recipes = ref<RecipeResponse[]>([])
const totalRecipesCount = ref(0)

// Загрузка рецептов
const loadRecipes = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    if (difficultyFilter.value) params.difficulty = difficultyFilter.value
    if (typeFilter.value) params.type = typeFilter.value

    const response = await recipesApi.getRecipes(params)

    recipes.value = response.data
    totalRecipesCount.value = response.total
  } catch (error: any) {
    console.error('Error loading recipes:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить рецепты',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// CRUD операции
const createRecipe = async (data: any) => {
  isLoading.value = true
  try {
    await recipesApi.createRecipe(data)
    isFormModalOpen.value = false
    await loadRecipes()
    toast.add({ title: 'Успех', description: 'Рецепт создан', color: 'success' })
  } catch (error: any) {
    console.error('Create error:', error)
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось создать рецепт', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const updateRecipe = async (data: any) => {
  if (!selectedRecipe.value) return

  isLoading.value = true
  try {
    await recipesApi.updateRecipe(selectedRecipe.value.id, data)
    isFormModalOpen.value = false
    await loadRecipes()
    toast.add({ title: 'Успех', description: 'Рецепт обновлен', color: 'success' })
  } catch (error: any) {
    console.error('Update error:', error)
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось обновить рецепт', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const deleteRecipe = async () => {
  if (!selectedRecipe.value) return
  isLoading.value = true
  try {
    await recipesApi.deleteRecipe(selectedRecipe.value.id)
    isDeleteModalOpen.value = false
    await loadRecipes()
    toast.add({ title: 'Успех', description: 'Рецепт удален', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось удалить рецепт', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

// Обработчики событий
const handleSearch = () => {
  currentPage.value = 1
  loadRecipes()
}

const openCreateModal = () => {
  formModalMode.value = 'create'
  selectedRecipe.value = null
  isFormModalOpen.value = true
}

const openEditModal = (recipe: RecipeResponse) => {
  formModalMode.value = 'edit'
  selectedRecipe.value = recipe
  isFormModalOpen.value = true
}

const openDeleteModal = (recipe: RecipeResponse) => {
  selectedRecipe.value = recipe
  isDeleteModalOpen.value = true
}

const viewRecipe = (recipe: RecipeResponse) => {
  navigateTo(`/recipe/${recipe.srcPath || recipe.id}`)
}

const handleFormSubmit = (data: any) => {
  if (formModalMode.value === 'edit') {
    updateRecipe(data)
  } else {
    createRecipe(data)
  }
}

// Наблюдение за фильтрами
watch([currentPage, pageSize, statusFilter, difficultyFilter, typeFilter], () => {
  loadRecipes()
})

// Загрузка начальных данных
onMounted(() => {
  loadRecipes()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Рецепты</h1>
        <p class="text-sm text-muted-foreground mt-1">Управление рецептами в системе</p>
      </div>
      <UButton icon="i-lucide-plus" color="primary" @click="openCreateModal">
        Новый рецепт
      </UButton>
    </div>

    <!-- Filters -->
    <RecipeFilters
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:difficulty-filter="difficultyFilter"
      v-model:type-filter="typeFilter"
      :total-recipes-count="totalRecipesCount"
      @search="handleSearch"
    />

    <!-- Table -->
    <RecipesTable
      :recipes="recipes"
      :is-loading="isLoading"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-recipes-count="totalRecipesCount"
      @update:current-page="currentPage = $event"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @view="viewRecipe"
    />

    <!-- Create/Edit Modal -->
    <!-- <RecipeFormModal
      v-model="isFormModalOpen"
      :mode="formModalMode"
      :recipe="selectedRecipe"
      :categories="[]"
      :units="[]"
      :ingredient-search-results="[]"
      :categories-loading="false"
      :ingredients-loading="false"
      :is-loading="isLoading"
      @submit="handleFormSubmit"
      @search-ingredients="() => {}"
    /> -->

    <!-- Create/Edit Modal -->
    <RecipeFormModal
      v-model="isFormModalOpen"
      :mode="formModalMode"
      :recipe="selectedRecipe"
      :is-loading="isLoading"
      @submit="handleFormSubmit"
    />

    <!-- Delete Modal -->
    <DeleteConfirmModal
      v-model="isDeleteModalOpen"
      :recipe="selectedRecipe"
      :is-loading="isLoading"
      @confirm="deleteRecipe"
    />
  </div>
</template>
