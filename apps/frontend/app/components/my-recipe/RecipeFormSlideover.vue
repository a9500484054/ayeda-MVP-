<!-- components/recipe/RecipeFormSlideover.vue -->
<template>
  <USlideover
    :open="open"
    @update:open="handleClose"
    :ui="{ content: 'max-w-4xl w-full overflow-y-auto' }"
  >
    <template #content>
      <div class="flex flex-col max-h-[100vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between bg-emerald-600 text-white">
          <h2 class="text-2xl font-semibold">
            {{ modalTitle }}
          </h2>
          <Button
            @click="handleClose"
            variant="ghost"
            color="neutral"
            size="xs"
          >
            <UIcon name="i-lucide-x" class="h-5 w-5" />
          </Button>
        </div>

        <!-- Body -->
        <form class="flex-1 overflow-y-auto" @submit.prevent="handleSubmit">
          <div class="p-6">
            <!-- Media -->
            <div class="rounded-2xl border p-5 space-y-4 mb-5">
              <h3 class="text-lg font-medium">Обложка рецепта</h3>

              <UFormField label="Фото">
                <div class="space-y-3">
                  <UButton
                    block
                    @click="mainFileInput?.click()"
                    color="neutral"
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

                  <div v-if="formData.photo?.src" class="rounded-xl overflow-hidden border max-h-48 max-w-sm mx-auto">
                    <img :src="getImageUrl(formData.photo.src)" class="w-full h-auto object-cover" />
                  </div>
                </div>
              </UFormField>
            </div>

            <div class="lg:col-span-2 space-y-6 mb-5">
              <!-- Basic Info -->
              <div class="rounded-2xl border p-5 space-y-4">
                <h3 class="text-lg font-medium">Основная информация</h3>

                <UFormField label="Название" required :error="errors.title">
                  <UInput
                    v-model="formData.title"
                    placeholder="Введите название рецепта"
                    class="w-full"
                    @input="onTitleChange"
                  />
                </UFormField>

                <UFormField label="Описание" :error="errors.description">
                  <UTextarea v-model="formData.description" :rows="5" placeholder="Введите описание рецепта" class="w-full"/>
                </UFormField>
              </div>

              <!-- Categories -->
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

            <!-- Right Column (1/3) -->
            <div class="space-y-6">
              <!-- Parameters -->
              <div class="rounded-2xl border p-5 space-y-4">
                <h3 class="text-lg font-medium">Параметры</h3>

                <div class="grid grid-cols-3 gap-4">
                  <UFormField label="Время (мин)" :error="errors.cookingTime">
                    <UInput v-model.number="formData.cookingTime" type="number" min="1" />
                  </UFormField>

                  <UFormField label="Порции" :error="errors.servings">
                    <UInput v-model.number="formData.servings" type="number" min="1" />
                  </UFormField>

                  <UFormField label="Калории (ккал)" :error="errors.calories">
                    <UInput v-model.number="formData.calories" type="number" min="0" />
                  </UFormField>
                </div>
              </div>

              <!-- Media Extra -->
              <div class="rounded-2xl border p-5">
                <h3 class="text-lg font-medium mb-5">Медиа</h3>
                <UFormField label="Видео">
                  <UInput
                    v-model="formData.video"
                    placeholder="https://youtube.com/..."
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <!-- Ingredients -->
            <div class="rounded-2xl border p-5 mt-6">
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

            <!-- Steps -->
            <div class="rounded-2xl border p-5 mt-6">
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
          </div>

          <!-- Sticky Footer -->
          <div class="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur px-6 py-4">
            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="ghost" @click="handleClose">Отмена</UButton>
              <UButton type="submit" color="primary" :loading="isSubmitting" :disabled="!isFormValid">
                {{ mode === 'edit' ? 'Сохранить изменения' : 'Создать рецепт' }}
              </UButton>
            </div>
          </div>
        </form>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeResponse, CreateRecipeDto, UpdateRecipeDto } from '~/composables/useRecipesApi'
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
  return !!(formData.value.title &&
    formData.value.categoryIds.length > 0 &&
    formData.value.ingredients.length > 0 &&
    formData.value.steps.length > 0)
})

const categoryItems = computed(() => {
  return searchCategories.value.map(cat => ({ label: cat.name, value: cat.id }))
})

const ingredientItems = computed(() => {
  if (!allIngredients.value || !Array.isArray(allIngredients.value)) return []
  return allIngredients.value.map(i => ({ label: i.name, value: i.id }))
})

const unitItems = computed(() => {
  if (!props.units || !Array.isArray(props.units)) {
    console.warn('units is not an array:', props.units)
    return []
  }
  return props.units.map(u => ({
    label: u.shortName || u.name,
    value: u.id
  }))
})

const difficultyItems = [
  { label: 'Легко', value: 'easy' },
  { label: 'Средне', value: 'medium' },
  { label: 'Сложно', value: 'hard' }
]

// Methods
const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}

const getCategoryName = (id: string) => {
  if (!props.categories || !Array.isArray(props.categories)) return id
  const cat = props.categories.find(c => c.id === id)
  return cat?.name || id
}

const setStepFileInputRef = (el: any, idx: number) => {
  if (el) stepFileInputs.value[idx] = el
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

// Form actions
const onTitleChange = () => {
  if (!formData.value.title) return
  // Just for SEO title generation if needed elsewhere, but we're not showing it
}

// Categories
const addCategory = () => {
  if (selectedCategory.value && !formData.value.categoryIds.includes(selectedCategory.value) && formData.value.categoryIds.length < 5) {
    formData.value.categoryIds.push(selectedCategory.value)
    selectedCategory.value = null
  }
}

const removeCategory = (id: string) => {
  formData.value.categoryIds = formData.value.categoryIds.filter(c => c !== id)
}

// Ingredients
const addIngredient = () => {
  formData.value.ingredients.push({
    ingredientId: '',
    amount: 1,
    unitId: '',
    notes: ''
  })
}

const removeIngredient = (index: number) => {
  formData.value.ingredients.splice(index, 1)
}

// Обработчик поиска ингредиентов
const handleIngredientSearch = (query: string) => {
  console.log('Searching ingredients with query:', query)
  loadIngredients(query)
}

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

// Steps
const addStep = () => {
  stepUploading.value.push(false)
  stepFileInputs.value.push(null)
  formData.value.steps.push({
    sort: formData.value.steps.length + 1,
    text: '',
    image: ''
  })
}

const removeStep = (index: number) => {
  formData.value.steps.splice(index, 1)
  stepUploading.value.splice(index, 1)
  stepFileInputs.value.splice(index, 1)
  formData.value.steps.forEach((step, idx) => { step.sort = idx + 1 })
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

  if (!formData.value.title) newErrors.title = 'Название обязательно'
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
      if (!step.text) {
        newErrors.steps = 'Заполните текст шага'
        break
      }
    }
  }

  errors.value = newErrors

  if (Object.keys(newErrors).length > 0) {
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
    return // Не закрываем форму
  }

  isSubmitting.value = true

  const submitData = {
    title: formData.value.title,
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
      text: step.text,
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
    // Закрываем форму ТОЛЬКО при успехе
    handleClose()
  } catch (error: any) {
    // Ошибка уже обработана в родителе, просто логируем
    console.error('Error in handleSubmit:', error)
    // НЕ закрываем форму
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}

// Обработчик поиска категорий
const handleCategorySearch = (query: string) => {
  console.log('Searching categories with query:', query)
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
