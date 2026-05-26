<!-- components/recipe/RecipeFormSlideover.vue -->
<template>
  <USlideover
    :open="open"
    @update:open="handleClose"
    :ui="{
      content: 'max-w-2xl w-full overflow-y-auto',
      overlay: 'bg-black/80 backdrop-blur-sm',
      base: 'relative',
      container: 'relative'
    }"
  >
    <template #content>
      <div class="flex flex-col max-h-[100vh] bg-gray-50">
        <!-- Header -->
        <div class="px-6 py-4 sticky top-0 z-20 bg-gradient-to-br from-emerald-700 to-teal-800">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">
              {{ modalTitle }}
            </h2>
            <Button
              @click="handleClose"
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-lucide-x"
              icon-only
              class="bg-white hover:bg-white/20"
            />
          </div>
        </div>

        <!-- Body -->
        <form class="flex-1 overflow-y-auto" @submit.prevent="handleSubmit">
          <div class="p-2 space-y-6">
            <!-- Media -->
            <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 class="text-sm font-medium text-gray-900">Обложка рецепта</h3>

              <div class="space-y-3">
                <Button
                  block
                  @click="mainFileInput?.click()"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :loading="isFileUploading"
                  :disabled="isFileUploading"
                >
                  {{ isFileUploading ? 'Загрузка...' : 'Загрузить фото' }}
                </Button>

                <input
                  ref="mainFileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleMainPhotoUpload"
                />

                <div v-if="formData.photo?.src" class="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img :src="getImageUrl(formData.photo.src)" class="w-full h-40 object-cover" />
                </div>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 class="text-sm font-medium text-gray-900">Основная информация</h3>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Название <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="formData.title"
                    placeholder="Например: Паста Карбонара"
                    size="sm"
                    class="w-full"
                    :class="{ 'border-red-500': touched.title && errors.title }"
                    @blur="touched.title = true"
                    @input="touched.title = true"
                  />
                  <p v-if="touched.title && errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <UTextarea
                    v-model="formData.description"
                    :rows="3"
                    placeholder="Расскажите о рецепте..."
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Категории <span class="text-red-500">*</span>
              </label>
              <AutoCompleteTags
                v-model="formData.categoryIds"
                :suggestions="categoryItems"
                :loading="categoriesLoading"
                :max="5"
                placeholder="Введите название категории..."
                :min-query-length="2"
                @search="handleCategorySearch"
                @update:model-value="touched.categoryIds = true"
              />
              <p v-if="touched.categoryIds && errors.categoryIds" class="text-xs text-red-500 mt-1">{{ errors.categoryIds }}</p>
              <p class="text-xs text-gray-500 mt-2">Можно выбрать до 5 категорий</p>
            </div>

            <!-- Parameters -->
            <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 class="text-sm font-medium text-gray-900">Параметры</h3>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    Время (мин)
                  </label>
                  <UInput v-model.number="formData.cookingTime" type="number" min="1" size="sm" />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    Порции
                  </label>
                  <UInput v-model.number="formData.servings" type="number" min="1" size="sm" />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    Калории (ккал)
                  </label>
                  <UInput v-model.number="formData.calories" type="number" min="0" size="sm" />
                </div>
              </div>
            </div>

            <!-- Video -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Видео (YouTube)
              </label>
              <UInput
                v-model="formData.video"
                placeholder="https://youtube.com/..."
                class="w-full"
                size="sm"
              />
            </div>

            <!-- Ingredients -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <IngredientsForm
                :ingredients="formData.ingredients"
                :units="units"
                :ingredients-loading="ingredientsLoading"
                :ingredient-search-results="searchIngredients"
                :error="touched.ingredients && errors.ingredients"
                @update:ingredients="handleIngredientsUpdate"
                @search-ingredients="handleIngredientSearch"
              />
              <p v-if="touched.ingredients && errors.ingredients" class="text-xs text-red-500 mt-2">{{ errors.ingredients }}</p>
            </div>

            <!-- Steps -->
            <div class="bg-white rounded-xl border border-gray-200 p-5">
              <StepsForm
                :steps="formData.steps"
                :is-file-uploading="isFileUploading"
                :error="touched.steps && errors.steps"
                @update:steps="handleStepsUpdate"
                @upload-step-photo="handleStepPhotoUpload"
              />
              <p v-if="touched.steps && errors.steps" class="text-xs text-red-500 mt-2">{{ errors.steps }}</p>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div class="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
            <div class="max-w-xl mx-auto flex justify-end gap-3">
              <Button
                @click="handleClose"
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="isSubmitting"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                color="primary"
                size="sm"
                :loading="isSubmitting"
                :disabled="!isFormValid || isSubmitting"
              >
                {{ mode === 'edit' ? 'Сохранить изменения' : 'Создать рецепт' }}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import { useFileUpload } from '~/composables/useFileUpload'
import { useIngredientsApi } from '~/composables/useIngredientsApi'
import transliterateRussian from '~/shared/utils/transliterateRussian'
import AutoCompleteTags from './AutoCompleteTags.vue'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
import IngredientsForm from './IngredientsForm.vue'
import StepsForm from './StepsForm.vue'
import Button from '~/shared/ui/button/Button.vue'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  recipe: RecipeResponse | null
  categories: any[]
  units: any[]
}>()

const toast = useToast()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any, mode: 'create' | 'edit', id?: string): void
}>()

const { upload, isUploading: isFileUploading } = useFileUpload()
const ingredientsApi = useIngredientsApi()
const categoriesApi = useCategoriesApi()

const API_BASE_URL = 'http://localhost:3001'

// Form data
const formData = ref({
  title: '',
  description: '',
  categoryIds: [] as string[],
  cookingTime: 30,
  servings: 4,
  calories: 0,
  photo: { id: '', src: '' },
  video: '',
  ingredients: [] as any[],
  steps: [] as any[],
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  status: 'private' as 'draft' | 'private' | 'pending' | 'public' | 'rejected'
})

// Состояние "тронутости" полей
const touched = ref({
  title: false,
  categoryIds: false,
  ingredients: false,
  steps: false
})

const categoriesLoading = ref(false)
const searchCategories = ref<any[]>([])

// Состояние для ингредиентов
const searchIngredients = ref<any[]>([])
const ingredientsLoading = ref(false)

const errors = ref<Record<string, string>>({})
const selectedCategory = ref<string | null>(null)
const isSubmitting = ref(false)

// Ingredients state
const allIngredients = ref<any[]>([])

// Step upload refs
const stepFileInputs = ref<(HTMLInputElement | null)[]>([])
const stepUploading = ref<boolean[]>([])
const mainFileInput = ref<HTMLInputElement>()

// Computed
const modalTitle = computed(() => props.mode === 'edit' ? 'Редактировать рецепт' : 'Создать рецепт')

const isFormValid = computed(() => {
  return !!(formData.value.title?.trim() &&
    formData.value.categoryIds.length > 0 &&
    formData.value.ingredients.length > 0 &&
    formData.value.steps.length > 0)
})

const categoryItems = computed(() => {
  return searchCategories.value.map(cat => ({ label: cat.name, value: cat.id }))
})

// Methods
const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
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
    status: 'private'
  }
  errors.value = {}
  touched.value = {
    title: false,
    categoryIds: false,
    ingredients: false,
    steps: false
  }
  selectedCategory.value = null
  stepUploading.value = []
  stepFileInputs.value = []
}

const loadRecipeToForm = (recipe: RecipeResponse) => {
  formData.value = {
    title: recipe.title || '',
    description: recipe.description || '',
    categoryIds: recipe.categories?.map(c => c.id) || [],
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    calories: recipe.calories || 0,
    photo: recipe.photo || { id: '', src: '' },
    video: recipe.video || '',
    ingredients: recipe.ingredients?.map((ing: any) => ({
      ingredientId: ing.ingredient.id || null,
      ingredient: ing.ingredient || null,
      amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 0),
      unitId: ing.unitId || ing.ingredient?.unitId,
      notes: ing.notes || '',
      unitName: ing.unitName || ing.ingredient?.unit?.shortName || ''
    })) || [],
    steps: recipe.steps?.map((step: any, idx: number) => ({
      sort: step.sort || idx + 1,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: recipe.difficulty || 'medium',
    status: recipe.status || 'private'
  }
  // Сбрасываем touched при загрузке рецепта
  touched.value = {
    title: false,
    categoryIds: false,
    ingredients: false,
    steps: false
  }
}

// Watchers
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.recipe) {
      loadRecipeToForm(props.recipe)
    } else {
      resetForm()
    }
  }
})

// Обработчики обновления
const handleIngredientsUpdate = (newIngredients: any[]) => {
  formData.value.ingredients = newIngredients
  // Автоматически помечаем как touched при изменении
  if (!touched.value.ingredients && newIngredients.length > 0) {
    touched.value.ingredients = true
  }
}

const handleStepsUpdate = (newSteps: any[]) => {
  formData.value.steps = newSteps
  // Автоматически помечаем как touched при изменении
  if (!touched.value.steps && newSteps.length > 0) {
    touched.value.steps = true
  }
}

// Обработчик поиска ингредиентов
const handleIngredientSearch = (query: string) => {
  loadIngredients(query)
}

const loadIngredients = async (searchQuery: string = '') => {
  ingredientsLoading.value = true

  try {
    let response

    if (!searchQuery || searchQuery.length < 2) {
      response = await ingredientsApi.getIngredients(1, 50)
      searchIngredients.value = response.data || []
      return
    }

    response = await ingredientsApi.searchIngredients(searchQuery, 1, 20)
    searchIngredients.value = response.data || []

  } catch (error) {
    console.error('Error loading ingredients:', error)
    searchIngredients.value = []
  } finally {
    ingredientsLoading.value = false
  }
}

// File uploads
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

const handleMainPhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !beforeUpload(file)) return

  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.photo = {
        id: response.id || '',
        src: response.path
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

const handleStepPhotoUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!beforeUpload(file)) return

  try {
    const response = await upload(file)
    if (response && response.url) {
      const newSteps = [...formData.value.steps]
      newSteps[index].image = response.path
      formData.value.steps = newSteps
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

// Validation
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  if (!formData.value.title?.trim()) newErrors.title = 'Название обязательно'
  if (formData.value.categoryIds.length === 0) newErrors.categoryIds = 'Выберите хотя бы одну категорию'
  if (formData.value.ingredients.length === 0) newErrors.ingredients = 'Добавьте хотя бы один ингредиент'

  for (const ing of formData.value.ingredients) {
    if (!ing.ingredientId) {
      newErrors.ingredients = 'Выберите ингредиент'
      break
    }
    if (!ing.amount || ing.amount <= 0) {
      newErrors.ingredients = 'Укажите количество'
      break
    }
  }

  if (formData.value.steps.length === 0) {
    newErrors.steps = 'Добавьте хотя бы один шаг'
  } else {
    for (const step of formData.value.steps) {
      if (!step.text?.trim()) {
        newErrors.steps = 'Заполните текст шага'
        break
      }
    }
  }

  errors.value = newErrors

  if (Object.keys(newErrors).length > 0) {
    // Помечаем все поля как touched при ошибке валидации
    touched.value = {
      title: true,
      categoryIds: true,
      ingredients: true,
      steps: true
    }

    toast.add({
      title: 'Ошибка валидации',
      description: 'Пожалуйста, заполните все обязательные поля',
      color: 'error'
    })
    return false
  }

  return true
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const submitData = {
    title: formData.value.title.trim(),
    description: formData.value.description || undefined,
    categoryIds: formData.value.categoryIds,
    cookingTime: formData.value.cookingTime,
    servings: formData.value.servings,
    calories: formData.value.calories || undefined,
    difficulty: formData.value.difficulty,
    status: 'private',
    type: "personal",
    photo: formData.value.photo.src ? formData.value.photo : undefined,
    video: formData.value.video || undefined,
    srcPath: transliterateRussian(formData.value.title),
    steps: formData.value.steps.map(step => ({
      sort: step.sort,
      text: step.text.trim(),
      image: step.image || undefined
    })),
    ingredients: formData.value.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount,
      unitId: ing.unitId || undefined,
      notes: ing.notes || undefined
    }))
  }

  try {
    await emit('save', submitData, props.mode, props.recipe?.id)
    handleClose()
  } catch (error: any) {
    console.error('Error in handleSubmit:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}

// Обработчик поиска категорий
const handleCategorySearch = (query: string) => {
  loadCategories(query)
}

// Загрузка категорий
const loadCategories = async (searchQuery: string) => {
  categoriesLoading.value = true

  try {
    if (!searchQuery || searchQuery.length < 2) {
      const response = await categoriesApi.getCategories(1, 50)
      searchCategories.value = response.data || []
      return
    }

    const response = await categoriesApi.searchCategories(searchQuery, { limit: 20 })
    searchCategories.value = response.data || response.categories || []

  } catch (error) {
    console.error('Error loading categories:', error)
    searchCategories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

loadIngredients()
</script>
