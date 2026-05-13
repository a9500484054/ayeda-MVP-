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
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h2 class="text-2xl font-semibold">
            {{ modalTitle }}
          </h2>
          <button
            class="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
            @click="handleClose"
          >
            <UIcon name="i-lucide-x" class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <form class="flex-1 overflow-y-auto" @submit.prevent="handleSubmit">
          <div class="p-6">
            <!-- Media -->
            <div class="rounded-2xl border p-5 space-y-4">
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

            <!-- Main Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <!-- Left Column (2/3) -->
              <div class="lg:col-span-2 space-y-6">
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
                    <UTextarea v-model="formData.description" :rows="5" placeholder="Введите описание рецепта" />
                  </UFormField>

                  <UFormField label="URL путь" :error="errors.srcPath">
                    <UInput v-model="formData.srcPath" placeholder="автоматически генерируется" />
                    <div class="text-xs text-zinc-400 mt-1">Оставьте пустым для автогенерации</div>
                  </UFormField>
                </div>

                <!-- Categories -->
                <div class="rounded-2xl border p-5">
                  <UFormField label="Категории" required :error="errors.categoryIds">
                    <div class="space-y-2">
                      <USelect
                        v-model="selectedCategory"
                        :items="categoryItems"
                        placeholder="Выберите категорию..."
                        class="w-full"
                        @update:model-value="addCategory"
                      />
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="catId in formData.categoryIds"
                          :key="catId"
                          class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                        >
                          {{ getCategoryName(catId) }}
                          <button type="button" @click="removeCategory(catId)" class="hover:text-green-900">
                            <UIcon name="i-lucide-x" class="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    </div>
                    <div class="text-xs text-zinc-400 mt-1">Можно выбрать до 5 категорий</div>
                  </UFormField>
                </div>
              </div>

              <!-- Right Column (1/3) -->
              <div class="space-y-6">
                <!-- Parameters -->
                <div class="rounded-2xl border p-5 space-y-4">
                  <h3 class="text-lg font-medium">Параметры</h3>

                  <UFormField label="Сложность" required :error="errors.difficulty">
                    <USelect v-model="formData.difficulty" :items="difficultyItems" />
                  </UFormField>

                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Время (мин)" :error="errors.cookingTime">
                      <UInput v-model.number="formData.cookingTime" type="number" min="1" />
                    </UFormField>

                    <UFormField label="Порции" :error="errors.servings">
                      <UInput v-model.number="formData.servings" type="number" min="1" />
                    </UFormField>
                  </div>

                  <UFormField label="Калории (ккал)" :error="errors.calories">
                    <UInput v-model.number="formData.calories" type="number" min="0" />
                  </UFormField>

                  <UFormField label="Тип">
                    <USelect v-model="formData.type" :items="typeItems" />
                  </UFormField>

                  <UFormField label="Статус" required :error="errors.status">
                    <USelect v-model="formData.status" :items="statusItems" />
                  </UFormField>
                </div>

                <!-- Media Extra -->
                <div class="rounded-2xl border p-5">
                  <h3 class="text-lg font-medium mb-5">Медиа</h3>
                  <UFormField label="Видео">
                    <UInput v-model="formData.video" placeholder="https://youtube.com/..." />
                  </UFormField>
                </div>
              </div>
            </div>

            <!-- Ingredients -->
            <div class="rounded-2xl border p-5 mt-6">
              <UFormField required :error="errors.ingredients">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">Ингредиенты</h3>
                    <UButton size="sm" variant="ghost" @click="addIngredient">+ Добавить ингредиент</UButton>
                  </div>

                  <div v-for="(ing, idx) in formData.ingredients" :key="idx" class="flex flex-wrap gap-3 items-end p-3 bg-zinc-50 rounded-lg">
                    <div class="flex-1 min-w-[150px]">
                      <label class="text-xs font-medium text-zinc-600">Ингредиент</label>
                      <USelect
                        v-model="ing.ingredientId"
                        :items="ingredientItems"
                        placeholder="Выберите ингредиент"
                        @search="handleIngredientSearch"
                        searchable
                      />
                    </div>
                    <div class="w-24">
                      <label class="text-xs font-medium text-zinc-600">Кол-во</label>
                      <UInput v-model.number="ing.amount" type="number" step="0.1" />
                    </div>
                    <div class="w-24">
                      <label class="text-xs font-medium text-zinc-600">Ед. изм.</label>
                      <USelect v-model="ing.unitId" :items="unitItems" placeholder="Ед." />
                    </div>
                    <div class="flex-1 min-w-[120px]">
                      <label class="text-xs font-medium text-zinc-600">Примечание</label>
                      <UInput v-model="ing.notes" placeholder="по желанию" />
                    </div>
                    <UButton size="sm" color="neutral" variant="ghost" @click="removeIngredient(idx)">
                      <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                    </UButton>
                  </div>

                  <div v-if="formData.ingredients.length === 0" class="text-center py-8 text-zinc-400">
                    <UIcon name="i-lucide-package" class="h-10 w-10 mx-auto mb-2" />
                    <p class="text-sm">Добавьте ингредиенты</p>
                  </div>
                </div>
              </UFormField>
            </div>

            <!-- Steps -->
            <div class="rounded-2xl border p-5 mt-6">
              <UFormField required :error="errors.steps">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium">Шаги приготовления</h3>
                    <UButton size="sm" variant="ghost" @click="addStep">+ Добавить шаг</UButton>
                  </div>

                  <div v-for="(step, idx) in formData.steps" :key="idx" class="p-4 border rounded-lg space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="font-medium">Шаг {{ idx + 1 }}</span>
                      <UButton size="sm" color="neutral" variant="ghost" @click="removeStep(idx)">
                        <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                      </UButton>
                    </div>
                    <UTextarea v-model="step.text" :rows="3" placeholder="Опишите шаг приготовления..." />
                    <div>
                      <UButton size="sm" variant="outline" @click="stepFileInputs[idx]?.click()" :loading="stepUploading[idx]">
                        {{ step.image ? 'Изменить фото' : 'Добавить фото' }}
                      </UButton>
                      <input
                        :ref="el => setStepFileInputRef(el, idx)"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleStepPhotoUpload($event, idx)"
                      />
                      <div v-if="step.image" class="mt-2 rounded-lg overflow-hidden max-h-32 w-32">
                        <img :src="getImageUrl(step.image)" class="w-full h-auto object-cover" />
                      </div>
                    </div>
                  </div>

                  <div v-if="formData.steps.length === 0" class="text-center py-8 text-zinc-400">
                    <UIcon name="i-lucide-clipboard-list" class="h-10 w-10 mx-auto mb-2" />
                    <p class="text-sm">Добавьте шаги приготовления</p>
                  </div>
                </div>
              </UFormField>
            </div>

            <!-- SEO -->
            <div class="rounded-2xl border p-5 mt-6">
              <h3 class="text-lg font-medium mb-4">SEO настройки</h3>
              <UFormField label="SEO заголовок">
                <UInput v-model="formData.seo.title" placeholder="Заголовок для поисковых систем" />
                <div class="text-xs text-zinc-400 mt-1">Максимум 70 символов</div>
              </UFormField>
              <UFormField label="SEO описание" class="mt-4">
                <UTextarea v-model="formData.seo.description" :rows="2" placeholder="Описание для поисковых систем" />
                <div class="text-xs text-zinc-400 mt-1">Максимум 160 символов</div>
              </UFormField>
              <UFormField label="Ключевые слова" class="mt-4">
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(keyword, idx) in formData.seo.keywords"
                      :key="idx"
                      class="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-sm"
                    >
                      {{ keyword }}
                      <button type="button" @click="removeKeyword(idx)" class="hover:text-zinc-700">
                        <UIcon name="i-lucide-x" class="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <UInput v-model="newKeyword" placeholder="Добавить ключевое слово" @keyup.enter="addKeyword" />
                    <UButton @click="addKeyword">Добавить</UButton>
                  </div>
                </div>
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

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  recipe: RecipeResponse | null
  categories: any[]
  units: any[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: any, mode: 'create' | 'edit', id?: string): void
}>()

const { upload, isUploading: isFileUploading } = useFileUpload()
const ingredientsApi = useIngredientsApi()

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
  type: 'personal' as 'personal' | 'community',
  status: 'private' as 'draft' | 'private' | 'pending' | 'public' | 'rejected',
  srcPath: '',
  seo: {
    title: '',
    description: '',
    keywords: [] as string[]
  }
})

const errors = ref<Record<string, string>>({})
const selectedCategory = ref<string | null>(null)
const newKeyword = ref('')
const isSubmitting = ref(false)

// Ingredients state
const allIngredients = ref<any[]>([])
const ingredientsLoading = ref(false)

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

// Защита от undefined/null - используем !props.categories? или Array.isArray
const categoryItems = computed(() => {
  if (!props.categories || !Array.isArray(props.categories)) return []
  return props.categories.map(c => ({ label: c.name, value: c.id }))
})

const ingredientItems = computed(() => {
  if (!allIngredients.value || !Array.isArray(allIngredients.value)) return []
  return allIngredients.value.map(i => ({ label: i.name, value: i.id }))
})

const unitItems = computed(() => {
  // Исправление: проверяем, что units - это массив
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

const typeItems = [
  { label: 'Личный', value: 'personal' },
  { label: 'Сообщества', value: 'community' }
]

const statusItems = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Приватный', value: 'private' },
  { label: 'На модерации', value: 'pending' },
  { label: 'Опубликован', value: 'public' },
  { label: 'Отклонен', value: 'rejected' }
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
    type: 'personal',
    status: 'private',
    srcPath: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
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
      ingredientId: ing.ingredient?.id || ing.ingredientId,
      amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) : (ing.amount || 0),
      unitId: ing.unitId || ing.ingredient?.unitId,
      notes: ing.notes || ''
    })) || [],
    steps: recipe.steps?.map((step: any, idx: number) => ({
      sort: step.sort || idx + 1,
      text: step.text,
      image: step.image || ''
    })) || [],
    difficulty: recipe.difficulty || 'medium',
    type: recipe.type === 'community' ? 'community' : 'personal',
    status: recipe.status || 'private',
    srcPath: recipe.srcPath || '',
    seo: recipe.seo || {
      title: '',
      description: '',
      keywords: []
    }
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
  if (formData.value.title && props.mode === 'create') {
    formData.value.srcPath = transliterateRussian(formData.value.title)
    if (!formData.value.seo.title) {
      formData.value.seo.title = formData.value.title
    }
  }
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

const handleIngredientSearch = async (query: string) => {
  if (!query || query.length < 2) return
  ingredientsLoading.value = true
  try {
    const response = await ingredientsApi.searchIngredients(query, 1, 20)
    allIngredients.value = response.data || []
  } catch (error) {
    console.error('Error searching ingredients:', error)
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

// Keywords
const addKeyword = () => {
  if (newKeyword.value.trim() && formData.value.seo.keywords.length < 10) {
    formData.value.seo.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
  }
}

const removeKeyword = (index: number) => {
  formData.value.seo.keywords.splice(index, 1)
}

// File uploads
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    alert('Можно загружать только изображения')
    return false
  }
  if (!isLt5M) {
    alert('Размер изображения не должен превышать 5MB')
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
    }
  } catch (error: any) {
    alert(error.message || 'Не удалось загрузить фото')
  }
  target.value = ''
}

const handleStepPhotoUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !beforeUpload(file)) return

  stepUploading.value[index] = true
  try {
    const response = await upload(file)
    if (response && response.url) {
      formData.value.steps[index].image = response.path
    }
  } catch (error: any) {
    alert(error.message || 'Не удалось загрузить фото')
  } finally {
    stepUploading.value[index] = false
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
  return Object.keys(newErrors).length === 0
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
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
    type: formData.value.type,
    status: formData.value.status,
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
    seo: {
      title: formData.value.seo.title || undefined,
      description: formData.value.seo.description || undefined,
      keywords: formData.value.seo.keywords.length > 0 ? formData.value.seo.keywords : undefined
    }
  }

  try {
    await emit('save', submitData, props.mode, props.recipe?.id)
    handleClose()
  } catch (error: any) {
    console.error('Error saving recipe:', error)
    alert(error.message || 'Ошибка при сохранении рецепта')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:open', false)
}

// Initial load of ingredients
const loadIngredients = async () => {
  try {
    const ingredientsResponse = await ingredientsApi.getIngredients(1, 100)
    allIngredients.value = ingredientsResponse.data || []
  } catch (error) {
    console.error('Error loading ingredients:', error)
  }
}

loadIngredients()
</script>
