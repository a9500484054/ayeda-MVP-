<template>
  <Slideover
    :open="open"
    :title="modalTitle"
    @update:open="handleClose"
  >
    <template #body>
      <form class="flex-1" @submit.prevent="handleSubmit">
        <div class="space-y-6 p-6">
          <!-- Media -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3 dark:bg-darkMode-100 dark:border-darkMode-300">
            <h3 class="text-sm font-medium text-gray-900 dark:text-darkMode-700">Обложка рецепта</h3>

            <ImageUploader
              v-model="formData.photo"
              label="Обложка"
              image-class="h-40 w-full rounded-lg object-cover"
              :loading="isFileUploading"
              :disabled="isSubmitting"
              @upload="handleMainPhotoUpload"
            />
          </div>

          <!-- Basic Info -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3 dark:bg-darkMode-100 dark:border-darkMode-300">
            <h3 class="text-sm font-medium text-gray-900 dark:text-darkMode-700">Основная информация</h3>

            <Input
              v-model="formData.title"
              label="Название"
              placeholder="Например: Паста Карбонара"
              :error="touched.title && errors.title ? errors.title : ''"
              required
              @blur="touched.title = true"
            />

            <Textarea
              v-model="formData.description"
              label="Описание"
              placeholder="Расскажите о рецепте..."
              :rows="3"
            />
          </div>

          <!-- Categories -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-darkMode-100 dark:border-darkMode-300">
            <CategorySelect
              v-model="formData.categoryIds"
              :suggestions="categoryItems"
              :loading="categoriesLoading"
              :max="5"
              label="Категории"
              placeholder="Введите название категории..."
              :error="touched.categoryIds && errors.categoryIds ? errors.categoryIds : ''"
              hint="Можно выбрать до 5 категорий"
              required
              @search="handleCategorySearch"
              @update:model-value="touched.categoryIds = true"
            />
          </div>

          <!-- Parameters -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-3 dark:bg-darkMode-100 dark:border-darkMode-300">
            <h3 class="text-sm font-medium text-gray-900 dark:text-darkMode-700">Параметры</h3>

            <div class="grid grid-cols-3 gap-3">
              <Input
                v-model.number="formData.cookingTime"
                type="number"
                label="Время (мин)"
                placeholder="30"
              />

              <Input
                v-model.number="formData.servings"
                type="number"
                label="Порции"
                placeholder="4"
              />

              <Input
                v-model.number="formData.calories"
                type="number"
                label="Калории (ккал)"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Video -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-darkMode-100 dark:border-darkMode-300">
            <Input
              v-model="formData.video"
              label="Видео (YouTube)"
              placeholder="https://youtube.com/..."
              :error="videoError"
              @blur="validateVideo"
            />
          </div>

          <!-- Ingredients -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-darkMode-100 dark:border-darkMode-300">
            <IngredientsList
              v-model="formData.ingredients"
              label="Ингредиенты"
              :ingredients="searchIngredients"
              :ingredients-loading="ingredientsLoading"
              :error="touched.ingredients && errors.ingredients ? errors.ingredients : ''"
              required
              @update:model-value="touched.ingredients = true"
              @search-ingredients="handleIngredientSearch"
            />
          </div>

          <!-- Steps -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-darkMode-100 dark:border-darkMode-300">
            <StepsList
              ref="stepsListRef"
              v-model="formData.steps"
              label="Шаги приготовления"
              :error="touched.steps && errors.steps ? errors.steps : ''"
              :image-uploading="isFileUploading"
              required
              @update:model-value="touched.steps = true"
              @upload-image="handleStepImageUpload"
            />
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
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
          @click="handleSubmit"
        >
          {{ mode === 'edit' ? 'Сохранить изменения' : 'Создать рецепт' }}
        </Button>
      </div>
    </template>
  </Slideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
import { useIngredientsApi } from '~/composables/useIngredientsApi'
import { useFileUpload } from '~/composables/useFileUpload'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import Button from '~/shared/ui/button/Button.vue'
import CategorySelect from '~/shared/ui/category-select/CategorySelect.vue'
import ImageUploader from '~/shared/ui/image-uploader/ImageUploader.vue'
import Input from '~/shared/ui/input/Input.vue'
import Slideover from '~/shared/ui/slideover/Slideover.vue'
import StepsList from '~/shared/ui/steps-list/StepsList.vue'
import Textarea from '~/shared/ui/textarea/Textarea.vue'
import { transliterateRussian } from '~/shared/utils/strings'
import { validateYouTubeUrl } from '~/shared/utils/video'
import IngredientsList from '~/shared/ui/ingredients-list/IngredientsList.vue'


interface Props {
  open: boolean
  mode: 'create' | 'edit'
  recipe: RecipeResponse | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any, mode: 'create' | 'edit', id?: string): Promise<void>
}>()

const toast = useToast()
const { upload, isUploading: isFileUploading } = useFileUpload()
const ingredientsApi = useIngredientsApi()
const categoriesApi = useCategoriesApi()

// Form data
const formData = ref({
  title: '',
  description: '',
  categoryIds: [] as string[],
  cookingTime: 30,
  servings: 4,
  calories: 0,
  photo: null as { id: string; src: string } | null,
  video: '',
  ingredients: [] as any[],
  steps: [] as any[],
  difficulty: 'medium' as 'easy' | 'medium' | 'hard'
})

// Validation state
const touched = ref({
  title: false,
  categoryIds: false,
  ingredients: false,
  steps: false
})

const errors = ref<Record<string, string>>({})
const videoError = ref('')

// Loading states
const categoriesLoading = ref(false)
const ingredientsLoading = ref(false)
const isSubmitting = ref(false)

// Data
const searchCategories = ref<any[]>([])
const searchIngredients = ref<any[]>([])

// Refs
const stepsListRef = ref<InstanceType<typeof StepsList> | null>(null)

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
const validateVideo = () => {
  if (!formData.value.video) {
    videoError.value = ''
    return
  }

  if (!validateYouTubeUrl(formData.value.video)) {
    videoError.value = 'Введите корректную YouTube ссылку'
  } else {
    videoError.value = ''
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    categoryIds: [],
    cookingTime: 30,
    servings: 4,
    calories: 0,
    photo: null,
    video: '',
    ingredients: [],
    steps: [],
    difficulty: 'medium'
  }
  errors.value = {}
  videoError.value = ''
  touched.value = {
    title: false,
    categoryIds: false,
    ingredients: false,
    steps: false
  }
}

const loadRecipeToForm = (recipe: RecipeResponse) => {
  formData.value = {
    title: recipe.title || '',
    description: recipe.description || '',
    categoryIds: recipe.categories?.map(c => c.id) || [],
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    calories: recipe.calories || 0,
    photo: recipe.photo || null,
    video: recipe.video || '',
    ingredients: recipe.ingredients?.map((ing: any) => ({
      ingredientId: ing.ingredient?.id || '',
      ingredient: ing.ingredient || null,
      amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 0),
      unitId: ing.unitId || ing.ingredient?.unitId || '',
      notes: ing.notes || '',
      unitName: ing.unitName || ing.ingredient?.unit?.shortName || ''
    })) || [],
    steps: recipe.steps?.map((step: any, idx: number) => ({
      sort: step.sort || idx + 1,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: recipe.difficulty || 'medium'
  }
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

// Handlers
const handleIngredientSearch = (query: string) => {
  loadIngredients(query)
}

const loadIngredients = async (searchQuery: string = '') => {
  ingredientsLoading.value = true

  try {
    if (!searchQuery || searchQuery.length < 2) {
      const response = await ingredientsApi.getIngredients(1, 50)
      searchIngredients.value = response.data || []
      return
    }

    const response = await ingredientsApi.searchIngredients(searchQuery, 1, 20)
    searchIngredients.value = response.data || []
  } catch (error) {
    console.error('Error loading ingredients:', error)
    searchIngredients.value = []
  } finally {
    ingredientsLoading.value = false
  }
}

const handleCategorySearch = (query: string) => {
  loadCategories(query)
}

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

// File uploads
const beforeUpload = (file: File): boolean => {
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

const handleMainPhotoUpload = async (file: File) => {
  if (!beforeUpload(file)) return

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
}

const handleStepImageUpload = async (file: File, index: number) => {
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
}

// Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!formData.value.title?.trim()) {
    newErrors.title = 'Название обязательно'
  }

  if (formData.value.categoryIds.length === 0) {
    newErrors.categoryIds = 'Выберите хотя бы одну категорию'
  }

  if (formData.value.ingredients.length === 0) {
    newErrors.ingredients = 'Добавьте хотя бы один ингредиент'
  } else {
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
    type: 'personal',
    photo: formData.value.photo || undefined,
    video: formData.value.video || undefined,
    srcPath: transliterateRussian(formData.value.title),
    steps: formData.value.steps.map((step: any) => ({
      sort: step.sort,
      text: step.text.trim(),
      image: step.image || undefined
    })),
    ingredients: formData.value.ingredients.map((ing: any) => ({
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
  if (!isSubmitting.value) {
    emit('update:open', false)
  }
}

// Initial load
loadIngredients()
loadCategories('')
</script>
