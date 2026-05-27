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
              ref="categorySelectRef"
              v-model="formData.categoryIds"
              :max="5"
              label="Категории"
              placeholder="Введите название категории..."
              :error="touched.categoryIds && errors.categoryIds ? errors.categoryIds : ''"
              hint="Можно выбрать до 5 категорий"
              required
              :fetch-by-ids="fetchCategoriesByIds"
              @update:model-value="touched.categoryIds = true"
              @search="handleCategorySearch"
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
              label="Видео"
              placeholder="https://youtube.com/watch?v=... или vk.com/video-... или rutube.ru/video/..."
              :error="videoError"
              hint="Поддерживаются YouTube, VK Video, Rutube"
              @blur="validateVideo"
            />

            <!-- Предпросмотр видео (если URL корректен) -->
            <div v-if="formData.video && !videoError && videoEmbedUrl" class="mt-3">
              <div class="text-xs text-gray-500 mb-2">Предпросмотр:</div>
              <div class="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  :src="videoEmbedUrl"
                  class="absolute inset-0 w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
              </div>
            </div>
          </div>

          <!-- Ingredients -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 dark:bg-darkMode-100 dark:border-darkMode-300">
            <IngredientsList
              ref="ingredientsListRef"
              v-model="formData.ingredients"
              label="Ингредиенты"
              :error="touched.ingredients && errors.ingredients ? errors.ingredients : ''"
              required
              @update:model-value="touched.ingredients = true"
              @search="handleIngredientSearch"
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
import IngredientsList from '~/shared/ui/ingredients-list/IngredientsList.vue'
import { transliterateRussian } from '~/shared/utils/strings'
import { validateVideoUrl, getEmbedUrl, detectVideoPlatform } from '~/shared/utils/video'

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

// Refs for child components
const categorySelectRef = ref<InstanceType<typeof CategorySelect> | null>(null)
const ingredientsListRef = ref<InstanceType<typeof IngredientsList> | null>(null)
const stepsListRef = ref<InstanceType<typeof StepsList> | null>(null)

// Computed
const modalTitle = computed(() => props.mode === 'edit' ? 'Редактировать рецепт' : 'Создать рецепт')

const isFormValid = computed(() => {
  return !!(formData.value.title?.trim() &&
    formData.value.categoryIds.length > 0 &&
    formData.value.ingredients.length > 0 &&
    formData.value.steps.length > 0)
})

// ==================== Categories Handlers ====================
const handleCategorySearch = async (query: string) => {
  console.log('Category search:', query)
  categoriesLoading.value = true

  try {
    let suggestions: { label: string; value: string }[] = []

    if (!query || query.length < 2) {
      // Загружаем первые 10 категорий
      const response = await categoriesApi.getCategories(1, 10)
      suggestions = (response.data || []).map((cat: any) => ({
        label: cat.name,
        value: cat.id
      }))
    } else {
      // Поиск категорий
      const response = await categoriesApi.searchCategories(query, { limit: 20 })
      const data = response.data || response.categories || []
      suggestions = data.map((cat: any) => ({
        label: cat.name,
        value: cat.id
      }))
    }

    categorySelectRef.value?.setSuggestions(suggestions)
  } catch (error) {
    console.error('Error in category search:', error)
  } finally {
    categoriesLoading.value = false
  }
}

// ==================== Ingredients Handlers ====================
const handleIngredientSearch = async (query: string, index: number) => {
  console.log('RecipeFormSlideover handleIngredientSearch:', query, 'for index:', index)
  ingredientsLoading.value = true

  try {
    let suggestions: { id: string; name: string; unitId: string; unitName: string }[] = []

    if (!query || query.length < 2) {
      console.log('Loading initial ingredients...')
      const response = await ingredientsApi.getIngredients(1, 10)
      console.log('Initial ingredients loaded:', response.data || 0)
      suggestions = (response.data || []).map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        unitId: ing.unitId || '',
        unitName: ing.unit.name || ''
      }))
    } else {
      console.log('Searching ingredients for:', query)
      const response = await ingredientsApi.searchIngredients(query, 1, 20)
      suggestions = (response.data || []).map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        unitId: ing.unitId || '',
        unitName: ing.unit.name || ''
      }))
    }

    console.log('Ingredients suggestions count:', suggestions.length)
    ingredientsListRef.value?.setSuggestions(suggestions)
  } catch (error) {
    console.error('Error in ingredient search:', error)
  } finally {
    ingredientsLoading.value = false
  }
}

// Methods
const videoEmbedUrl = ref('')

const validateVideo = () => {
  const url = formData.value.video
  if (!url) {
    videoError.value = ''
    videoEmbedUrl.value = ''
    return
  }

  if (!validateVideoUrl(url)) {
    const platform = detectVideoPlatform(url)
    if (platform === 'vk') {
      videoError.value = 'Некорректная ссылка VK Video. Попробуйте скопировать ссылку из адресной строки браузера.'
    } else if (platform === 'rutube') {
      videoError.value = 'Некорректная ссылка Rutube.'
    } else if (platform === 'youtube') {
      videoError.value = 'Некорректная ссылка YouTube.'
    } else {
      videoError.value = 'Введите корректную ссылку на видео (YouTube, VK Video, Rutube)'
    }
    videoEmbedUrl.value = ''
    return
  }

  videoError.value = ''
  videoEmbedUrl.value = getEmbedUrl(url) || ''
}


// Вызываем валидацию при монтировании (если есть ссылка)
watch(() => formData.value.video, () => {
  if (formData.value.video) validateVideo()
}, { immediate: true })

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
      unitName: ing.unit?.short || ing.unit?.name || ing.unitName || '',
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

// Добавьте функцию для загрузки категорий по ID
const fetchCategoriesByIds = async (ids: string[]) => {
  if (!ids.length) return []

  console.log('Fetching categories by IDs:', ids)
  try {
    // Загружаем все категории и фильтруем по ID
    const response = await categoriesApi.getCategories(1, 100)
    const allCategories = response.data || []
    return allCategories
      .filter((cat: any) => ids.includes(cat.id))
      .map((cat: any) => ({
        label: cat.name,
        value: cat.id
      }))
  } catch (error) {
    console.error('Error fetching categories by IDs:', error)
    return []
  }
}
</script>
