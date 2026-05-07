<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import transliterateRussian from '~/shared/utils/transliterateRussian'
import { useApi } from '~/composables/useApi'
import { useFileUpload } from '~/composables/useFileUpload'

definePageMeta({
  layout: 'admin',
  title: 'Рецепты'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const api = useApi()
const { upload, isUploading: isFileUploading } = useFileUpload()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string>('')
const difficultyFilter = ref<string>('')
const typeFilter = ref<string>('')

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const isDeleteModalOpen = ref(false)
const isViewModalOpen = ref(false)

const selectedRecipe = ref<any>(null)
const isLoading = ref(false)
const ingredientsLoading = ref(false)
const categoriesLoading = ref(false)

// Данные
const recipes = ref<any[]>([])
const totalRecipesCount = ref(0)
const categories = ref<any[]>([])
const ingredients = ref<any[]>([])
const units = ref<any[]>([])
const ingredientSearchResults = ref<any[]>([])

// Refs для файлов
const mainFileInput = ref<HTMLInputElement>()
const stepFileInputs = ref<(HTMLInputElement | null)[]>([])

// Форма - правильная структура для API
const formData = ref({
  title: '',
  description: '',
  categoryIds: [] as string[],
  cookingTime: 30,
  servings: 4,
  calories: 0,
  photo: { id: '', src: '' }, // Объект с id и src
  video: '',
  ingredients: [] as any[],
  steps: [] as any[],
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  type: 'personal' as 'personal' | 'community',
  srcPath: ''
})

// Вычисляемые свойства
const modalTitle = computed(() =>
  modalMode.value === 'edit' ? 'Редактировать рецепт' : 'Добавить рецепт'
)

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

    const response = await api('/recipes', {
      method: 'GET',
      params
    })

    recipes.value = response.data || response.recipes || []
    totalRecipesCount.value = response.total || response.pagination?.total || 0
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

// Загрузка категорий
const loadCategories = async () => {
  categoriesLoading.value = true
  try {
    const response = await api('/categories', { method: 'GET', params: { limit: 100 } })
    categories.value = response.data || response.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    categoriesLoading.value = false
  }
}

// Поиск ингредиентов
const searchIngredients = async (query: string) => {
  ingredientsLoading.value = true
  try {
    if (query && query.length > 0) {
      const response = await api('/ingredients/search', {
        method: 'GET',
        params: { q: query, limit: 20 }
      })
      ingredientSearchResults.value = response.data || response.ingredients || []
    } else {
      ingredientSearchResults.value = ingredients.value
    }
  } catch (error) {
    console.error('Error searching ingredients:', error)
    ingredientSearchResults.value = ingredients.value
  } finally {
    ingredientsLoading.value = false
  }
}

// Загрузка всех ингредиентов для выбора
const loadAllIngredients = async () => {
  try {
    const response = await api('/ingredients', {
      method: 'GET',
      params: { page: 1, limit: 100 }
    })
    ingredients.value = response.data || response.ingredients || []
    ingredientSearchResults.value = ingredients.value
  } catch (error) {
    console.error('Error loading ingredients:', error)
  }
}

// Загрузка единиц измерения
const loadUnits = async () => {
  try {
    const response = await api('/units', { method: 'GET', params: { limit: 100 } })
    units.value = response.data || response.units || []
  } catch (error) {
    console.error('Error loading units:', error)
  }
}

// Обработка изменения ингредиента
const onIngredientChange = (index: number) => {
  const selectedIngredient = ingredientSearchResults.value.find(i => i.id === formData.value.ingredients[index].ingredientId)
  if (selectedIngredient && selectedIngredient.unit) {
    formData.value.ingredients[index].unitId = selectedIngredient.unit.id
    formData.value.ingredients[index].unitName = selectedIngredient.unit.short || selectedIngredient.unit.code
  }
}

// Добавление ингредиента
const addIngredient = () => {
  formData.value.ingredients.push({
    ingredientId: '',
    amount: 0,
    unitId: '',
    unitName: '',
    notes: ''
  })
}

// Удаление ингредиента
const removeIngredient = (index: number) => {
  formData.value.ingredients.splice(index, 1)
}

// Добавление шага
const addStep = () => {
  formData.value.steps.push({
    sort: formData.value.steps.length + 1,
    text: '',
    image: ''
  })
  stepFileInputs.value.push(null)
}

// Удаление шага
const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  // Обновляем сортировку шагов
  formData.value.steps.forEach((step, idx) => {
    step.sort = idx + 1
  })
  stepFileInputs.value.splice(index, 1)
}

// Удаление фото шага
const removeStepPhoto = (index: number) => {
  formData.value.steps[index].image = ''
}

// Загрузка главного фото
const handleMainPhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!beforeUpload(file)) return

  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.photo = {
        id: response.id || '',
        src: response.url
      }
      toast.add({
        title: 'Успех',
        description: 'Фото загружено',
        color: 'success'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить фото',
      color: 'error'
    })
  }

  target.value = ''
}

// Загрузка фото для шага
const handleStepPhotoUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!beforeUpload(file)) return

  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.steps[index].image = response.path
      toast.add({
        title: 'Успех',
        description: 'Фото для шага загружено',
        color: 'success'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить фото',
      color: 'error'
    })
  }

  target.value = ''
}

// Перед загрузкой файла
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    toast.add({
      title: 'Ошибка',
      description: 'Можно загружать только изображения',
      color: 'error'
    })
    return false
  }
  if (!isLt5M) {
    toast.add({
      title: 'Ошибка',
      description: 'Размер изображения не должен превышать 5MB',
      color: 'error'
    })
    return false
  }
  return true
}

// Транслитерация названия
const transNameSrc = () => {
  if (formData.value.title) {
    formData.value.srcPath = transliterateRussian(formData.value.title)
  }
}

// Статус рецепта
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'neutral',
    private: 'warning',
    pending: 'info',
    public: 'success',
    rejected: 'error',
    active: 'success'
  }
  return colorMap[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    draft: 'Черновик',
    private: 'Приватный',
    pending: 'На модерации',
    public: 'Опубликован',
    rejected: 'Отклонен',
    active: 'Активен'
  }
  return labelMap[status] || status
}

const getDifficultyColor = (difficulty: string) => {
  const colorMap: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return colorMap[difficulty] || 'neutral'
}

const getDifficultyLabel = (difficulty: string) => {
  const labelMap: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  }
  return labelMap[difficulty] || difficulty
}

const getTypeLabel = (type: string) => {
  return type === 'personal' ? 'Личный' : 'Сообщества'
}

// Таблица
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'photo',
    header: 'Фото',
    cell: ({ row }) => {
      const photo = row.original.photo?.src
      return h('img', {
        src: photo || 'https://placehold.co/50x50?text=No+Image',
        class: 'w-10 h-10 object-cover rounded',
        alt: row.original.title
      })
    },
    meta: { class: { th: 'w-20', td: 'w-20' } }
  },
  {
    accessorKey: 'title',
    header: 'Название',
    meta: { class: { td: 'font-medium' } }
  },
  {
    accessorKey: 'difficulty',
    header: 'Сложность',
    cell: ({ row }) => {
      const difficulty = row.original.difficulty
      if (!difficulty) return '—'
      return h(UBadge, {
        color: getDifficultyColor(difficulty),
        variant: 'subtle'
      }, () => getDifficultyLabel(difficulty))
    }
  },
  {
    accessorKey: 'cookingTime',
    header: 'Время (мин)'
  },
  {
    accessorKey: 'servings',
    header: 'Порции'
  },
  {
    accessorKey: 'calories',
    header: 'Ккал'
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status || 'draft'
      return h(UBadge, {
        color: getStatusColor(status),
        variant: 'subtle'
      }, () => getStatusLabel(status))
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: { class: { th: 'text-right w-32', td: 'text-right' } },
    cell: ({ row }) => {
      const recipe = row.original
      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'neutral',
          variant: 'ghost',
          onClick: () => openViewModal(recipe)
        }),
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(recipe)
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(recipe)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() => Math.ceil(totalRecipesCount.value / pageSize.value))

// Методы
const handleSearch = () => {
  currentPage.value = 1
  loadRecipes()
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    categoryIds: [],
    cookingTime: 30,
    servings: 4,
    calories: 0,
    photo: { id: '', src: '' },
    video: '',
    ingredients: [],
    steps: [],
    difficulty: 'medium',
    type: 'personal',
    srcPath: ''
  }
  stepFileInputs.value = []
}

const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  isModalOpen.value = true
}

const openViewModal = (recipe: any) => {
  selectedRecipe.value = recipe
  isViewModalOpen.value = true
}

const openEditModal = (recipe: any) => {
  modalMode.value = 'edit'
  selectedRecipe.value = recipe

  // Трансформируем данные из API в форму
  formData.value = {
    title: recipe.title || '',
    description: recipe.description || '',
    categoryIds: recipe.categoryIds || [],
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    calories: recipe.calories || 0,
    photo: recipe.photo || { id: '', src: '' },
    video: recipe.video || '',
    ingredients: recipe.ingredients?.map((ing: any) => ({
      ingredientId: ing.ingredientId || ing.id,
      amount: ing.amount,
      unitId: ing.unitId || '',
      unitName: ing.unitName || '',
      notes: ing.notes || ''
    })) || [],
    steps: recipe.steps?.map((step: any) => ({
      sort: step.sort,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: recipe.difficulty || 'medium',
    type: recipe.type === 'community' ? 'community' : 'personal',
    srcPath: recipe.srcPath || ''
  }

  stepFileInputs.value = new Array(formData.value.steps.length).fill(null)
  isModalOpen.value = true
}

const openDeleteModal = (recipe: any) => {
  selectedRecipe.value = recipe
  isDeleteModalOpen.value = true
}

// Валидация формы
const isFormValid = computed(() => {
  return !!(formData.value.title &&
            formData.value.categoryIds.length > 0 &&
            formData.value.ingredients.length > 0 &&
            formData.value.steps.length > 0)
})

// CRUD операции
const createRecipe = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Ошибка',
      description: 'Заполните все обязательные поля',
      color: 'error'
    })
    return
  }

  // Подготавливаем данные для отправки
  const submitData = {
    title: formData.value.title,
    description: formData.value.description,
    categoryIds: formData.value.categoryIds,
    cookingTime: formData.value.cookingTime,
    servings: formData.value.servings,
    calories: formData.value.calories,
    difficulty: formData.value.difficulty,
    type: formData.value.type,
    photo: formData.value.photo.path ? formData.value.photo : undefined,
    video: formData.value.video || undefined,
    steps: formData.value.steps.map(step => ({
      sort: step.sort,
      text: step.text,
      image: step.image || undefined
    })),
    srcPath: formData.value.srcPath || undefined,
    ingredients: formData.value.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount,
      unitId: ing.unitId || undefined,
      notes: ing.notes || undefined
    }))
  }

  isLoading.value = true
  try {
    await api('/recipes', { method: 'POST', body: submitData })
    isModalOpen.value = false
    await loadRecipes()
    toast.add({ title: 'Успех', description: 'Рецепт создан', color: 'success' })
  } catch (error: any) {
    console.error('Create error:', error)
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось создать рецепт', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const updateRecipe = async () => {
  if (!selectedRecipe.value) return

  // Подготавливаем данные для отправки
  const submitData = {
    title: formData.value.title,
    description: formData.value.description,
    categoryIds: formData.value.categoryIds,
    cookingTime: formData.value.cookingTime,
    servings: formData.value.servings,
    calories: formData.value.calories,
    difficulty: formData.value.difficulty,
    type: formData.value.type,
    photo: formData.value.photo.path ? formData.value.photo : undefined,
    video: formData.value.video || undefined,
    steps: formData.value.steps.map(step => ({
      sort: step.sort,
      text: step.text,
      image: step.image || undefined
    })),
    srcPath: formData.value.srcPath || undefined,
    ingredients: formData.value.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount,
      unitId: ing.unitId || undefined,
      notes: ing.notes || undefined
    }))
  }

  isLoading.value = true
  try {
    await api(`/recipes/${selectedRecipe.value.id}`, { method: 'PATCH', body: submitData })
    isModalOpen.value = false
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
    await api(`/recipes/${selectedRecipe.value.id}`, { method: 'DELETE' })
    isDeleteModalOpen.value = false
    await loadRecipes()
    toast.add({ title: 'Успех', description: 'Рецепт удален', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Ошибка', description: error.message || 'Не удалось удалить рецепт', color: 'error' })
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  if (modalMode.value === 'edit') {
    updateRecipe()
  } else {
    createRecipe()
  }
}

// Наблюдение
watch([currentPage, pageSize, statusFilter, difficultyFilter, typeFilter], () => {
  loadRecipes()
})

// Загрузка
onMounted(() => {
  loadRecipes()
  loadCategories()
  loadAllIngredients()
  loadUnits()
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
    <UCard>
      <div class="space-y-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск рецептов..."
          icon="i-lucide-search"
          @update:model-value="handleSearch"
        />
        <div class="flex flex-wrap gap-4">
          <USelect
            v-model="statusFilter"
            placeholder="Все статусы"
            :items="[
              { label: 'Черновик', value: 'draft' },
              { label: 'Активен', value: 'active' },
              { label: 'Приватный', value: 'private' },
              { label: 'На модерации', value: 'pending' }
            ]"
            class="w-48"
            clearable
          />

          <USelect
            v-model="difficultyFilter"
            placeholder="Сложность"
            :items="[
              { label: 'Легко', value: 'easy' },
              { label: 'Средне', value: 'medium' },
              { label: 'Сложно', value: 'hard' }
            ]"
            class="w-48"
            clearable
          />

          <USelect
            v-model="typeFilter"
            placeholder="Тип"
            :items="[
              { label: 'Личный', value: 'personal' },
              { label: 'Сообщества', value: 'community' }
            ]"
            class="w-48"
            clearable
          />

          <div class="text-sm text-muted-foreground ml-auto">
            Всего: {{ totalRecipesCount }}
          </div>
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="recipes"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-chef-hat" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет данных</p>
            <p class="text-sm text-muted-foreground mt-1">
              Добавьте первый рецепт
            </p>
          </div>
        </template>
      </UTable>

      <div v-if="totalPages > 1" class="flex items-center justify-between border-t px-4 py-4">
        <div class="text-sm text-muted-foreground">
          Показано {{ ((currentPage - 1) * pageSize) + 1 }} -
          {{ Math.min(currentPage * pageSize, totalRecipesCount) }} из {{ totalRecipesCount }}
        </div>
        <UPagination v-model:page="currentPage" :items-per-page="pageSize" :total="totalRecipesCount" />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal
      v-model:open="isModalOpen"
      :ui="{ content: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' }"
      @close="resetForm"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">{{ modalTitle }}</h2>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Название Рецепта -->
            <UFormField label="Название" required>
              <UInput
                v-model="formData.title"
                placeholder="Введите название рецепта"
                @input="transNameSrc"
              />
            </UFormField>

            <!-- Описание Рецепта -->
            <UFormField label="Описание">
              <UTextarea
                v-model="formData.description"
                placeholder="Введите описание рецепта"
                :rows="3"
              />
            </UFormField>

            <!-- Категории -->
            <UFormField label="Категории" required>
              <USelect
                v-model="formData.categoryIds"
                :items="categories.map(cat => ({ label: cat.name, value: cat.id }))"
                placeholder="Выберите категории"
                multiple
                :loading="categoriesLoading"
              />
            </UFormField>

            <!-- Сложность -->
            <UFormField label="Сложность" required>
              <USelect
                v-model="formData.difficulty"
                :items="[
                  { label: 'Легко', value: 'easy' },
                  { label: 'Средне', value: 'medium' },
                  { label: 'Сложно', value: 'hard' }
                ]"
              />
            </UFormField>

            <!-- Время готовки и Порции -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Время готовки (мин)" required>
                <UInput
                  v-model.number="formData.cookingTime"
                  type="number"
                  min="1"
                />
              </UFormField>

              <UFormField label="Порции" required>
                <UInput
                  v-model.number="formData.servings"
                  type="number"
                  min="1"
                />
              </UFormField>
            </div>

            <!-- Калории -->
            <UFormField label="Калории (на порцию)" required>
              <UInput
                v-model.number="formData.calories"
                type="number"
                min="0"
              />
            </UFormField>

            <!-- Фото -->
            <UFormField label="Фото">
              <div class="space-y-3">
                <UButton
                  @click="mainFileInput?.click()"
                  color="primary"
                  variant="outline"
                  :loading="isFileUploading"
                >
                  Загрузить фото рецепта
                </UButton>
                <input
                  ref="mainFileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainPhotoUpload"
                />
                <div v-if="formData.photo.src" class="mt-2">
                  <img :src="formData.photo.src" alt="Фото рецепта" class="max-w-[200px] h-auto rounded" />
                </div>
              </div>
            </UFormField>

            <!-- Видео -->
            <UFormField label="Видео (ссылка)">
              <UInput v-model="formData.video" placeholder="https://youtube.com/..." />
            </UFormField>

            <!-- Ингредиенты -->
            <UFormField label="Ингредиенты" required>
              <div class="space-y-3">
                <div
                  v-for="(ingredient, index) in formData.ingredients"
                  :key="index"
                  class="flex flex-col gap-2 p-3 border rounded-lg"
                >
                  <div class="flex gap-2">
                    <USelect
                      v-model="ingredient.ingredientId"
                      :items="ingredientSearchResults.map(i => ({ label: i.name, value: i.id }))"
                      placeholder="Выберите ингредиент"
                      class="flex-1"
                      @update:model-value="() => onIngredientChange(index)"
                      searchable
                      :loading="ingredientsLoading"
                    />

                    <UInput
                      v-model.number="ingredient.amount"
                      type="number"
                      placeholder="Кол-во"
                      class="w-32"
                      min="0"
                      step="0.5"
                    />

                    <USelect
                      v-model="ingredient.unitId"
                      :items="units.map(u => ({ label: u.short || u.code, value: u.id }))"
                      placeholder="Ед. изм."
                      class="w-40"
                    />

                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      @click="removeIngredient(index)"
                    />
                  </div>

                  <UInput
                    v-model="ingredient.notes"
                    placeholder="Примечание (по вкусу, опционально)"
                    class="text-sm"
                  />
                </div>

                <UButton @click="addIngredient" color="primary" variant="outline" size="sm">
                  Добавить ингредиент
                </UButton>
              </div>
            </UFormField>

            <!-- Шаги -->
            <UFormField label="Шаги" required>
              <div class="space-y-4">
                <div
                  v-for="(step, index) in formData.steps"
                  :key="index"
                  class="p-4 border rounded-lg space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Шаг {{ step.sort || index + 1 }}</span>
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-x"
                      size="sm"
                      @click="removeStep(index)"
                    />
                  </div>

                  <UTextarea
                    v-model="step.text"
                    placeholder="Подробное описание шага"
                    :rows="3"
                    required
                  />

                  <div v-if="step.image" class="flex items-start gap-3">
                    <img :src="step.image" alt="Фото шага" class="w-32 h-32 object-cover rounded" />
                    <UButton
                      color="error"
                      variant="outline"
                      size="sm"
                      @click="removeStepPhoto(index)"
                    >
                      Удалить фото
                    </UButton>
                  </div>

                  <UButton
                    v-else
                    @click="stepFileInputs[index]?.click()"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    :loading="isFileUploading"
                  >
                    Загрузить фото для шага
                  </UButton>

                  <input
                    :ref="(el) => { if (el && stepFileInputs) stepFileInputs[index] = el as HTMLInputElement }"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="(e) => handleStepPhotoUpload(e, index)"
                  />
                </div>

                <UButton @click="addStep" color="primary" variant="outline" size="sm">
                  Добавить шаг
                </UButton>
              </div>
            </UFormField>

            <!-- Тип -->
            <UFormField label="Тип">
              <USelect
                v-model="formData.type"
                :items="[
                  { label: 'Личный', value: 'personal' },
                  { label: 'Сообщества', value: 'community' }
                ]"
              />
            </UFormField>

            <!-- Ссылка -->
            <UFormField label="URL путь">
              <UInput v-model="formData.srcPath" placeholder="avtomaticheski-generiruetsya" />
              <div class="text-xs text-muted-foreground mt-1">Оставьте пустым для автоматической генерации</div>
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton color="neutral" variant="ghost" @click="isModalOpen = false">
                Отмена
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Сохранить
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="isDeleteModalOpen" :ui="{ content: 'max-w-md w-full' }">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Подтверждение удаления</h2>
          <p>Вы уверены, что хотите удалить рецепт <strong>{{ selectedRecipe?.title }}</strong>?</p>
          <p class="text-sm text-muted-foreground mt-2">Это действие нельзя отменить.</p>
          <div class="flex justify-end gap-2 pt-6">
            <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">Отмена</UButton>
            <UButton color="error" :loading="isLoading" @click="deleteRecipe">Удалить</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- View Modal -->
    <UModal v-model:open="isViewModalOpen" :ui="{ content: 'max-w-2xl w-full max-h-[80vh] overflow-y-auto' }">
      <template #content>
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-xl font-semibold">{{ selectedRecipe?.title }}</h2>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isViewModalOpen = false" />
          </div>

          <div class="space-y-4">
            <div v-if="selectedRecipe?.photo?.src">
              <img :src="selectedRecipe.photo.src" :alt="selectedRecipe.title" class="w-full max-h-64 object-cover rounded" />
            </div>

            <p class="text-muted-foreground">{{ selectedRecipe?.description }}</p>

            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="p-2 bg-muted rounded">
                <div class="text-sm text-muted-foreground">Сложность</div>
                <div class="font-semibold">{{ getDifficultyLabel(selectedRecipe?.difficulty) }}</div>
              </div>
              <div class="p-2 bg-muted rounded">
                <div class="text-sm text-muted-foreground">Время</div>
                <div class="font-semibold">{{ selectedRecipe?.cookingTime }} мин</div>
              </div>
              <div class="p-2 bg-muted rounded">
                <div class="text-sm text-muted-foreground">Порции</div>
                <div class="font-semibold">{{ selectedRecipe?.servings }}</div>
              </div>
              <div class="p-2 bg-muted rounded">
                <div class="text-sm text-muted-foreground">Калории</div>
                <div class="font-semibold">{{ selectedRecipe?.calories }} ккал</div>
              </div>
            </div>

            <div>
              <h3 class="font-semibold mb-2">Ингредиенты</h3>
              <ul class="list-disc list-inside space-y-1">
                <li v-for="(ing, idx) in selectedRecipe?.ingredients" :key="idx">
                  {{ ing.name }} - {{ ing.amount }} {{ ing.unitName || ing.unit }}
                  <span v-if="ing.notes" class="text-muted-foreground"> ({{ ing.notes }})</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold mb-2">Приготовление</h3>
              <ol class="list-decimal list-inside space-y-2">
                <li v-for="(step, idx) in selectedRecipe?.steps" :key="idx">
                  {{ step.text }}
                  <div v-if="step.image" class="mt-2">
                    <img :src="step.image" alt="Фото шага" class="max-w-xs h-auto rounded" />
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
