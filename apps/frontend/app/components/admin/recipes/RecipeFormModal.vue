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

                  <UFormField label="Название" required>
                    <UInput
                      v-model="formData.title"
                      placeholder="Введите название рецепта"
                      class="w-full"
                      @input="onTitleChange"
                    />
                  </UFormField>

                  <UFormField label="Описание">
                    <UTextarea
                      v-model="formData.description"
                      :rows="5"
                      class="w-full"
                      placeholder="Введите описание рецепта"
                    />
                  </UFormField>

                  <UFormField label="URL путь">
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
                  <UFormField label="Категории" required>
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

                  <UFormField label="Видео">
                    <UInput
                      v-model="formData.video"
                      class="w-full"
                      placeholder="https://youtube.com/..."
                    />
                  </UFormField>
                </div>

                <!-- Параметры -->
                <div class="rounded-2xl border p-5 space-y-4">
                  <h3 class="text-lg font-medium">
                    Параметры
                  </h3>

                  <UFormField label="Сложность" required>
                    <USelect
                      v-model="formData.difficulty"
                      :items="difficultyItems"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Время">
                      <UInput
                        v-model.number="formData.cookingTime"
                        type="number"
                        min="1"
                      />
                    </UFormField>

                    <UFormField label="Порции">
                      <UInput
                        v-model.number="formData.servings"
                        type="number"
                        min="1"
                      />
                    </UFormField>
                  </div>

                  <UFormField label="Калории">
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

            <!-- Ингредиенты -->
            <div class="rounded-2xl border p-5 mt-5">
              <IngredientsForm
                :ingredients="formData.ingredients"
                :units="units || []"
                :ingredients-loading="ingredientsLoading"
                :ingredient-search-results="ingredientSearchResults || []"
                @update:ingredients="formData.ingredients = $event"
                @search-ingredients="onSearchIngredients"
              />
            </div>

            <!-- Шаги -->
            <div class="rounded-2xl border p-5 mt-5">
              <StepsForm
                :steps="formData.steps"
                :is-file-uploading="isFileUploading"
                @update:steps="formData.steps = $event"
                @upload-step-photo="handleStepPhotoUpload"
              />
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
import transliterateRussian from '~/shared/utils/transliterateRussian'
import { useFileUpload } from '~/composables/useFileUpload'
import { useCategoriesApi } from '~/composables/useCategoriesApi'
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
  ingredientSearchResults?: any[]
  ingredientsLoading?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  units: () => [],
  ingredientSearchResults: () => [],
  ingredientsLoading: false,
  isLoading: false,
  recipe: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
  'search-ingredients': [query: string]
}>()

const toast = useToast()
const { upload, isUploading: isFileUploading } = useFileUpload()
const categoriesApi = useCategoriesApi()

const mainFileInput = ref<HTMLInputElement>()

// Состояние для категорий
const searchCategories = ref<any[]>([])
const categoriesLoading = ref(false)

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
  if (!searchQuery || searchQuery.length < 2) {
    searchCategories.value = []
    return
  }

  categoriesLoading.value = true
  try {
    const response = await categoriesApi.searchCategories(searchQuery, { limit: 20 })
    searchCategories.value = response.data || response.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
    searchCategories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

// Обработчик поиска категорий
const handleCategorySearch = (query: string) => {
  loadCategories(query)
}

// Наблюдение за открытием модалки
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.recipe) {
      loadRecipeToForm()
    } else if (props.mode === 'create') {
      resetForm()
    }
  } else {
    // Сбрасываем поиск при закрытии
    searchCategories.value = []
  }
})

const loadRecipeToForm = () => {
  if (!props.recipe) return

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
      ingredientId: ing.ingredientId || ing.id,
      amount: ing.amount,
      unitId: ing.unitId || '',
      unitName: ing.unitName || '',
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
    srcPath: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  }
  searchCategories.value = []
}

const onTitleChange = () => {
  if (formData.value.title) {
    formData.value.srcPath = transliterateRussian(formData.value.title)
    if (!formData.value.seo.title) {
      formData.value.seo.title = formData.value.title
    }
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

const onSearchIngredients = (query: string) => {
  emit('search-ingredients', query)
}

const handleSubmit = () => {
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
  emit('update:modelValue', false)
  resetForm()
}
</script>
