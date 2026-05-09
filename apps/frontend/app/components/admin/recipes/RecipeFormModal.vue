<template>
  <UModal
    :open="modelValue"
    @update:open="onClose"
    :ui="{ content: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' }"
  >
    <template #content>
      <div class="flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b">
          <h2 class="text-2xl font-semibold">
            {{ modalTitle }}
          </h2>
        </div>

        <!-- Body -->
        <form
          class="flex-1 overflow-y-auto"
          @submit.prevent="handleSubmit"
        >
          <div class="p-6">
            <!-- Основная сетка: левая колонка 2/3, правая 1/3 -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- ЛЕВАЯ КОЛОНКА (2/3 ширины) -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Основное -->
                <div class="rounded-2xl border p-5 space-y-4">
                  <h3 class="text-lg font-medium">
                    Основная информация
                  </h3>

                  <UFormField
                    label="Название"
                    required
                    :error="errors.title"
                  >
                    <UInput
                      v-model="formData.title"
                      placeholder="Введите название рецепта"
                      class="w-full"
                      @input="onTitleChange"
                      :class="{ 'border-red-500': errors.title }"
                    />
                  </UFormField>

                  <UFormField
                    label="Описание"
                    :error="errors.description"
                  >
                    <UTextarea
                      v-model="formData.description"
                      :rows="5"
                      class="w-full"
                      placeholder="Введите описание рецепта"
                    />
                  </UFormField>

                  <UFormField
                    label="URL путь"
                    :error="errors.srcPath"
                  >
                    <UInput
                      v-model="formData.srcPath"
                      placeholder="avtomaticheski-generiruetsya"
                      class="w-full"
                    />

                    <div class="text-xs text-muted-foreground mt-1">
                      Оставьте пустым для автогенерации
                    </div>
                  </UFormField>
                </div>
                <!-- Категории -->
                <div class="rounded-2xl border p-5">
                  <UFormField
                    label="Категории"
                    required
                    :error="errors.categoryIds"
                  >
                    <AutoCompleteTags
                      v-model="formData.categoryIds"
                      :suggestions="categoryItems"
                      :loading="categoriesLoading"
                      :max="5"
                      placeholder="Введите название категории..."
                      :min-query-length="2"
                      @search="handleCategorySearch"
                    />
                    <div class="text-xs text-muted-foreground mt-1">
                      Можно выбрать до 5 категорий
                    </div>
                  </UFormField>
                </div>
              </div>

              <!-- ПРАВАЯ КОЛОНКА (1/3 ширины) -->
              <div class="space-y-6">
                <!-- Медиа -->
                <div class="rounded-2xl border p-5 space-y-4">
                  <h3 class="text-lg font-medium">
                    Медиа
                  </h3>

                  <UFormField label="Фото">
                    <div class="space-y-3">
                      <UButton
                        block
                        @click="mainFileInput?.click()"
                        color="primary"
                        variant="outline"
                        :loading="isFileUploading"
                      >
                        Загрузить фото
                      </UButton>

                      <input
                        ref="mainFileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleMainPhotoUpload"
                      />

                      <div
                        v-if="formData.photo?.src"
                        class="rounded-xl overflow-hidden border"
                      >
                        <img
                          :src="`${API_BASE_URL}${formData.photo.src}`"
                          class="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  </UFormField>
                </div>

                <!-- Параметры -->
                <div class="rounded-2xl border p-5 space-y-4">
                  <h3 class="text-lg font-medium">
                    Параметры
                  </h3>

                  <UFormField
                    label="Сложность"
                    required
                    :error="errors.difficulty"
                  >
                    <USelect
                      v-model="formData.difficulty"
                      :items="difficultyItems"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid grid-cols-2 gap-4">
                    <UFormField
                      label="Время (мин)"
                      :error="errors.cookingTime"
                    >
                      <UInput
                        v-model.number="formData.cookingTime"
                        type="number"
                        min="1"
                      />
                    </UFormField>

                    <UFormField
                      label="Порции"
                      :error="errors.servings"
                    >
                      <UInput
                        v-model.number="formData.servings"
                        type="number"
                        min="1"
                      />
                    </UFormField>
                  </div>

                  <UFormField
                    label="Калории (ккал)"
                    :error="errors.calories"
                  >
                    <UInput
                      v-model.number="formData.calories"
                      type="number"
                      min="0"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Тип">
                    <USelect
                      v-model="formData.type"
                      :items="typeItems"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border p-5 mt-5">
              <UFormField label="Видео">
                <UInput
                  v-model="formData.video"
                  class="w-full"
                  placeholder="https://youtube.com/..."
                />
              </UFormField>
            </div>

            <!-- Ингредиенты -->
            <div class="rounded-2xl border p-5 mt-5">
              <UFormField
                required
                :error="errors.ingredients"
              >
                <IngredientsForm
                  :ingredients="formData.ingredients"
                  :units="units"
                  :ingredients-loading="ingredientsLoading"
                  :ingredient-search-results="searchIngredients"
                  @update:ingredients="formData.ingredients = $event"
                  @search-ingredients="handleIngredientSearch"
                />
              </UFormField>
            </div>

            <!-- Шаги -->
            <div class="rounded-2xl border p-5 mt-5">
              <UFormField
                required
                :error="errors.steps"
              >
                <StepsForm
                  :steps="formData.steps"
                  :is-file-uploading="isFileUploading"
                  @update:steps="formData.steps = $event"
                  @upload-step-photo="handleStepPhotoUpload"
                />
              </UFormField>
            </div>

            <!-- SEO - на всю ширину под сеткой -->
            <SEOForm
              class="mt-4"
              :seo="formData.seo"
              :title="formData.title"
              :src-path="formData.srcPath"
              @update:seo="formData.seo = $event"
            />
          </div>

          <!-- Sticky Footer -->
          <div
            class="sticky bottom-0 z-10 border-t bg-default/95 backdrop-blur px-6 py-4"
          >
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="onClose"
              >
                Отмена
              </UButton>

              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Сохранить рецепт
              </UButton>
            </div>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useDebounceFn } from '@vueuse/core'
import transliterateRussian from '~/shared/utils/transliterateRussian'
import { useFileUpload } from '~/composables/useFileUpload'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
import { useIngredientsApi } from '~/composables/useIngredientsApi'
import StepsForm from './StepsForm.vue'
import SEOForm from './SEOForm.vue'
import IngredientsForm from './IngredientsForm.vue'
import AutoCompleteTags from './AutoCompleteTags.vue'

const API_BASE_URL = 'http://localhost:3001'

interface Props {
  modelValue: boolean
  mode: 'create' | 'edit'
  recipe?: any | null
  units?: any[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  units: () => [],
  isLoading: false,
  recipe: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
}>()

const toast = useToast()
const { upload, isUploading: isFileUploading } = useFileUpload()
const categoriesApi = useCategoriesApi()
const ingredientsApi = useIngredientsApi()

const mainFileInput = ref<HTMLInputElement>()

// Состояние для категорий
const searchCategories = ref<any[]>([])
const categoriesLoading = ref(false)

// Состояние для ингредиентов
const searchIngredients = ref<any[]>([])
const ingredientsLoading = ref(false)

// Флаг для предотвращения рекурсии
const isClosing = ref(false)
const isValidating = ref(false)

// Zod схема валидации
const recipeSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Название не должно превышать 200 символов'),
  description: z.string().max(5000, 'Описание не должно превышать 5000 символов').optional(),
  srcPath: z.string().max(200, 'URL путь не должен превышать 200 символов')
    .regex(/^[a-z0-9-]*$/, 'URL путь может содержать только латинские буквы, цифры и дефисы')
    .optional(),
  categoryIds: z.array(z.string()).min(1, 'Выберите хотя бы одну категорию').max(5, 'Максимум 5 категорий'),
  cookingTime: z.number().int('Время должно быть целым числом').min(1, 'Время приготовления должно быть не менее 1 минуты').max(1440, 'Время не должно превышать 24 часов').optional(),
  servings: z.number().int('Количество порций должно быть целым числом').min(1, 'Минимум 1 порция').max(100, 'Максимум 100 порций').optional(),
  calories: z.number().int('Калории должны быть целым числом').min(0, 'Калории не могут быть отрицательными').max(10000, 'Калории не должны превышать 10000').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard'], { required_error: 'Выберите сложность' }),
  type: z.enum(['personal', 'community']).optional(),
  photo: z.object({
    id: z.string(),
    src: z.string()
  }).optional(),
  video: z.string().url('Введите корректный URL видео').or(z.literal('')).optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Выберите ингредиент'),
    amount: z.number().positive('Количество должно быть положительным'),
    unitId: z.string().optional(),
    unitName: z.string().optional(),
    notes: z.string().optional()
  })).min(1, 'Добавьте хотя бы один ингредиент'),
  steps: z.array(z.object({
    sort: z.number(),
    text: z.string().min(1, 'Текст шага не может быть пустым'),
    image: z.string().optional()
  })).min(1, 'Добавьте хотя бы один шаг приготовления'),
  seo: z.object({
    title: z.string().max(70, 'SEO заголовок не должен превышать 70 символов').optional(),
    description: z.string().max(160, 'SEO описание не должно превышать 160 символов').optional(),
    keywords: z.array(z.string()).max(10, 'Не более 10 ключевых слов').optional()
  }).optional()
}).partial({
  cookingTime: true,
  servings: true,
  calories: true,
  type: true,
  photo: true,
  video: true,
  seo: true,
  description: true,
  srcPath: true
})

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
  type: 'personal' as 'personal' | 'community',
  srcPath: '',
  seo: {
    title: '',
    description: '',
    keywords: [] as string[]
  }
})

// Состояние ошибок
const errors = ref<Record<string, string>>({})

// Функция валидации формы
const validateForm = () => {
  if (isValidating.value) return false

  isValidating.value = true

  try {
    recipeSchema.parse(formData.value)
    errors.value = {}
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        newErrors[path] = err.message
      })
      errors.value = newErrors
    }
    return false
  } finally {
    isValidating.value = false
  }
}

// Debounced версия валидации
const debouncedValidate = useDebounceFn(() => {
  if (props.modelValue && !isClosing.value) {
    validateForm()
  }
}, 300)

// Валидация отдельного поля
const validateField = (fieldName: string) => {
  try {
    const fieldSchema = recipeSchema.shape[fieldName as keyof typeof recipeSchema.shape]
    if (fieldSchema) {
      fieldSchema.parse(formData.value[fieldName as keyof typeof formData.value])
      const newErrors = { ...errors.value }
      delete newErrors[fieldName]
      errors.value = newErrors
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {
        ...errors.value,
        [fieldName]: error.errors[0].message
      }
    }
  }
}

// Watch для автоматической валидации при изменениях
watch(
  formData,
  () => {
    if (!props.modelValue || isClosing.value) return
    debouncedValidate()
  },
  { deep: true }
)

const modalTitle = computed(() =>
  props.mode === 'edit' ? 'Редактировать рецепт' : 'Добавить рецепт'
)

const isFormValid = computed(() => {
  return !!(formData.value.title &&
            formData.value.categoryIds.length > 0 &&
            formData.value.ingredients.length > 0 &&
            formData.value.steps.length > 0)
})

const categoryItems = computed(() => {
  return searchCategories.value.map(cat => ({ label: cat.name, value: cat.id }))
})

const difficultyItems = [
  { label: 'Легко', value: 'easy' },
  { label: 'Средне', value: 'medium' },
  { label: 'Сложно', value: 'hard' }
]

const typeItems = [
  { label: 'Личный', value: 'personal' },
  { label: 'Сообщества', value: 'community' }
]

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

// Загрузка ингредиентов
const loadIngredients = async (searchQuery: string) => {
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

// Обработчик поиска категорий
const handleCategorySearch = (query: string) => {
  console.log('Searching categories with query:', query)
  loadCategories(query)
}

// Обработчик поиска ингредиентов
const handleIngredientSearch = (query: string) => {
  console.log('Searching ingredients with query:', query)
  loadIngredients(query)
}

// Watch с проверкой на закрытие
watch(() => props.modelValue, (isOpen, wasOpen) => {
  if (isClosing.value) return

  if (isOpen) {
    if (props.mode === 'edit' && props.recipe) {
      loadRecipeToForm()
    } else if (props.mode === 'create') {
      resetForm()
    }
  } else if (wasOpen && !isOpen) {
    searchCategories.value = []
    searchIngredients.value = []
    debouncedValidate.cancel?.()
  }
})

// Функция загрузки рецепта
const loadRecipeToForm = () => {
  if (!props.recipe) return
  console.log('props.recipe', props.recipe)

  isValidating.value = true

  formData.value = {
    title: props.recipe.title || '',
    description: props.recipe.description || '',
    categoryIds: props.recipe.categoryIds || props.recipe.categories?.map((c: any) => c.id) || [],
    cookingTime: props.recipe.cookingTime || 30,
    servings: props.recipe.servings || 4,
    calories: props.recipe.calories || 0,
    photo: props.recipe.photo || { id: '', src: '' },
    video: props.recipe.video || '',
    ingredients: props.recipe.ingredients?.map((ing: any) => ({
      ingredientId: ing.ingredient.id,
      amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 0),
      unitId: ing.ingredient.unitId,
      unitName: ing.ingredient.name || '',
      notes: ing.notes || ''
    })) || [],
    steps: props.recipe.steps?.map((step: any) => ({
      sort: step.sort,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: props.recipe.difficulty || 'medium',
    type: props.recipe.type === 'community' ? 'community' : 'personal',
    srcPath: props.recipe.srcPath || '',
    seo: props.recipe.seo || {
      title: '',
      description: '',
      keywords: []
    }
  }

  isValidating.value = false
  validateForm()
  console.log('Загруженные ингредиенты в форму:', formData.value.ingredients)
}

const resetForm = () => {
  if (isClosing.value) return

  isValidating.value = true

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
    srcPath: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  }

  errors.value = {}
  isValidating.value = false
}

const onTitleChange = () => {
  if (formData.value.title) {
    formData.value.srcPath = transliterateRussian(formData.value.title)
    if (!formData.value.seo.title) {
      formData.value.seo.title = formData.value.title
    }
    validateField('title')
    validateField('srcPath')
  }
}

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

const handleSubmit = () => {
  if (!validateForm()) {
    toast.add({
      title: 'Ошибка валидации',
      description: 'Пожалуйста, исправьте ошибки в форме',
      color: 'error'
    })
    return
  }

  const submitData = {
    title: formData.value.title,
    description: formData.value.description,
    categoryIds: formData.value.categoryIds,
    cookingTime: formData.value.cookingTime,
    servings: formData.value.servings,
    calories: formData.value.calories,
    difficulty: formData.value.difficulty,
    type: formData.value.type,
    photo: formData.value.photo.src ? formData.value.photo : undefined,
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
    })),
    seo: formData.value.seo
  }

  emit('submit', submitData)
}

const onClose = () => {
  if (isClosing.value) return

  isClosing.value = true
  emit('update:modelValue', false)

  debouncedValidate.cancel?.()

  setTimeout(() => {
    if (props.mode === 'create') {
      resetForm()
    }
    searchCategories.value = []
    searchIngredients.value = []
    errors.value = {}
    isClosing.value = false
  }, 150)
}

onUnmounted(() => {
  debouncedValidate.cancel?.()
  searchCategories.value = []
  searchIngredients.value = []
  isClosing.value = false
})
</script>
