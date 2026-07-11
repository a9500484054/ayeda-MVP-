<script setup lang="ts">
import { h, resolveComponent, ref, computed, watch, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useIngredientsApi, type Ingredient, type CreateIngredientDto, type UpdateIngredientDto, type NutritionInfo, type SeoData } from '~/composables/useIngredientsApi'
import { useUnitsApi, type Unit } from '~/composables/useUnitsApi'
import CustomKeywords from '~/components/admin/recipes/CustomKeywords.vue'

definePageMeta({
  layout: 'admin',
  title: 'Ингредиенты'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const ingredientsApi = useIngredientsApi()
const unitsApi = useUnitsApi()
const api = useApi()
const config = useRuntimeConfig()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedIngredient = ref<Ingredient | null>(null)
const isLoading = ref(false)
const isUnitsLoading = ref(false)
const isUploading = ref(false)

// Данные
const ingredients = ref<Ingredient[]>([])
const totalIngredientsCount = ref(0)
const units = ref<Unit[]>([])

// Форма
const formData = ref({
  srcPath: '',
  code: '',
  name: '',
  description: '',
  photo: '',
  unitId: '',
  nutritionInfo: {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0
  } as NutritionInfo,
  seo: {
    title: '',
    description: '',
    keywords: [] as string[],
    ogImage: ''
  } as SeoData
})

// Полный URL изображения (apiUrl + path)
const getFullImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${config.public.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

// Транслитерация для генерации srcPath
const transliterateRussian = (text: string): string => {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  let slug = text
    .toLowerCase()
    .trim()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'ingredient'
}

// Генерация srcPath из названия
const generateSrcPath = (name: string) => {
  if (!name) return ''
  return transliterateRussian(name)
}

// Загрузка единиц измерения
const loadUnits = async () => {
  isUnitsLoading.value = true
  try {
    const response = await unitsApi.getUnits(1, 100)
    units.value = response.data
  } catch (error: any) {
    console.error('Error loading units:', error)
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось загрузить единицы измерения',
      color: 'error'
    })
  } finally {
    isUnitsLoading.value = false
  }
}

// Загрузка ингредиентов
const loadIngredients = async () => {
  isLoading.value = true
  try {
    const response = await ingredientsApi.getIngredients(currentPage.value, pageSize.value)
    ingredients.value = response.data
    totalIngredientsCount.value = response.total
  } catch (error: any) {
    console.error('Error loading ingredients:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить ингредиенты',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Поиск ингредиентов
const searchIngredients = async () => {
  if (!searchQuery.value.trim()) {
    await loadIngredients()
    return
  }

  isLoading.value = true
  try {
    const response = await ingredientsApi.searchIngredients(searchQuery.value, currentPage.value, pageSize.value)
    ingredients.value = response.data
    totalIngredientsCount.value = response.total
  } catch (error: any) {
    console.error('Error searching ingredients:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось выполнить поиск',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Загрузка изображения
const uploadImage = async (file: File): Promise<string | null> => {
  isUploading.value = true
  try {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    const response = await api('/uploads', {
      method: 'POST',
      body: formDataUpload
    })

    return response.path
  } catch (error: any) {
    console.error('Error uploading image:', error)
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message || 'Не удалось загрузить изображение',
      color: 'error'
    })
    return null
  } finally {
    isUploading.value = false
  }
}

// Универсальная функция загрузки
const handleImageUpload = async (callback: (path: string) => void) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const path = await uploadImage(file)
    if (path) callback(path)
  }
  input.click()
}

// Обработчик загрузки фото ингредиента
const handlePhotoUpload = () => {
  handleImageUpload((path) => {
    formData.value.photo = path
    toast.add({
      title: 'Успех',
      description: 'Фото загружено',
      color: 'success',
      timeout: 2000
    })
  })
}

const removePhoto = () => {
  formData.value.photo = ''
}

// Таблица
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'photo',
    header: 'Фото',
    cell: ({ row }) => {
      const photo = row.getValue('photo') as string
      if (photo) {
        return h('img', {
          src: getFullImageUrl(photo),
          alt: 'Ingredient photo',
          class: 'w-10 h-10 rounded-full object-cover',
          onError: (e: Event) => {
            const img = e.target as HTMLImageElement
            img.style.display = 'none'
            const parent = img.parentElement
            if (parent) {
              const fallback = document.createElement('div')
              fallback.className = 'w-10 h-10 rounded-full bg-muted flex items-center justify-center'
              fallback.innerHTML = '<span class="text-muted-foreground text-xs">—</span>'
              parent.appendChild(fallback)
            }
          }
        })
      }
      return h('div', { class: 'w-10 h-10 rounded-full bg-muted flex items-center justify-center' }, [
        h('span', { class: 'text-muted-foreground text-xs' }, '—')
      ])
    },
    meta: {
      class: {
        td: 'w-14'
      }
    }
  },
  {
    accessorKey: 'srcPath',
    header: 'Путь (slug)',
    cell: ({ row }) => {
      const srcPath = row.getValue('srcPath') as string
      return h('span', { class: 'font-mono text-xs text-emerald-600' }, srcPath || '—')
    },
    meta: {
      class: {
        td: 'max-w-[150px] truncate'
      }
    }
  },
  {
    accessorKey: 'code',
    header: 'Код',
    meta: {
      class: {
        td: 'font-mono text-xs font-medium'
      }
    }
  },
  {
    accessorKey: 'name',
    header: 'Название',
    meta: {
      class: {
        td: 'font-medium'
      }
    }
  },
  {
    accessorKey: 'description',
    header: 'Описание',
    cell: ({ row }) => {
      const desc = row.getValue('description') as string
      return desc ? h('span', { class: 'text-sm text-muted-foreground line-clamp-2' }, desc) : '—'
    },
    meta: {
      class: {
        td: 'max-w-xs'
      }
    }
  },
  {
    accessorKey: 'unit',
    header: 'Единица измерения',
    cell: ({ row }) => {
      const unit = row.getValue('unit') as Unit
      return unit ? `${unit.name} (${unit.short || unit.code})` : '—'
    }
  },
  {
    accessorKey: 'nutritionInfo',
    header: 'Пищевая ценность',
    cell: ({ row }) => {
      const nutrition = row.getValue('nutritionInfo') as NutritionInfo
      if (!nutrition || Object.keys(nutrition).length === 0) return '—'

      const parts = []
      if (nutrition.calories) parts.push(`${nutrition.calories} ккал`)
      if (nutrition.proteins) parts.push(`Б: ${nutrition.proteins}г`)
      if (nutrition.fats) parts.push(`Ж: ${nutrition.fats}г`)
      if (nutrition.carbohydrates) parts.push(`У: ${nutrition.carbohydrates}г`)

      return parts.join(' | ') || '—'
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата создания',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return new Date(date).toLocaleDateString('ru-RU')
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: {
      class: {
        th: 'text-right w-28',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const ingredient = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'neutral',
          variant: 'ghost',
          to: `/ingredients/${ingredient.srcPath}`
        }),
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(ingredient)
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(ingredient)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() =>
  Math.ceil(totalIngredientsCount.value / pageSize.value)
)

// Методы
const handleSearch = async (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
  await searchIngredients()
}

const resetForm = () => {
  formData.value = {
    srcPath: '',
    code: '',
    name: '',
    description: '',
    photo: '',
    unitId: '',
    nutritionInfo: {
      calories: 0,
      proteins: 0,
      fats: 0,
      carbohydrates: 0,
      fiber: 0,
      sugar: 0
    },
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: ''
    }
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (ingredient: Ingredient) => {
  selectedIngredient.value = ingredient

  formData.value = {
    srcPath: ingredient.srcPath || '',
    code: ingredient.code,
    name: ingredient.name,
    description: ingredient.description || '',
    photo: ingredient.photo || '',
    unitId: ingredient.unit.id,
    nutritionInfo: {
      calories: ingredient.nutritionInfo?.calories || 0,
      proteins: ingredient.nutritionInfo?.proteins || 0,
      fats: ingredient.nutritionInfo?.fats || 0,
      carbohydrates: ingredient.nutritionInfo?.carbohydrates || 0,
      fiber: ingredient.nutritionInfo?.fiber || 0,
      sugar: ingredient.nutritionInfo?.sugar || 0
    },
    seo: {
      title: ingredient.seo?.title || '',
      description: ingredient.seo?.description || '',
      keywords: Array.isArray(ingredient.seo?.keywords) ? ingredient.seo.keywords : [],
      ogImage: ingredient.seo?.ogImage || ''
    }
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (ingredient: Ingredient) => {
  selectedIngredient.value = ingredient
  isDeleteModalOpen.value = true
}

// Автогенерация srcPath из названия
const onNameChange = () => {
  if (formData.value.name && !formData.value.srcPath) {
    formData.value.srcPath = generateSrcPath(formData.value.name)
  }
  // Автозаполнение SEO title
  if (formData.value.name && !formData.value.seo.title) {
    formData.value.seo.title = formData.value.name
  }
}

// Обновление SEO
const updateSeo = (seo: SeoData) => {
  formData.value.seo = seo
}

// Предпросмотр SEO
const previewTitle = computed(() =>
  formData.value.seo.title || formData.value.name || 'Ингредиент'
)

const previewUrl = computed(() =>
  `https://ayeda.ru/ingredients/${formData.value.srcPath || '...'}`
)

const previewDescription = computed(() =>
  formData.value.seo.description || formData.value.description || 'Описание ингредиента'
)

const createIngredient = async () => {
  if (!formData.value.unitId) {
    toast.add({
      title: 'Ошибка',
      description: 'Выберите единицу измерения',
      color: 'error'
    })
    return
  }

  isLoading.value = true

  try {
    // Если srcPath не указан, генерируем из названия
    let srcPath = formData.value.srcPath
    if (!srcPath && formData.value.name) {
      srcPath = generateSrcPath(formData.value.name)
    }

    const createData: CreateIngredientDto = {
      srcPath: srcPath || undefined,
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description || undefined,
      photo: formData.value.photo || undefined,
      unitId: formData.value.unitId,
      nutritionInfo: {
        calories: formData.value.nutritionInfo.calories,
        proteins: formData.value.nutritionInfo.proteins,
        fats: formData.value.nutritionInfo.fats,
        carbohydrates: formData.value.nutritionInfo.carbohydrates,
        fiber: formData.value.nutritionInfo.fiber || undefined,
        sugar: formData.value.nutritionInfo.sugar || undefined
      },
      seo: {
        title: formData.value.seo.title || undefined,
        description: formData.value.seo.description || undefined,
        keywords: formData.value.seo.keywords.length > 0 ? formData.value.seo.keywords : undefined,
        ogImage: formData.value.seo.ogImage || undefined
      }
    }

    await ingredientsApi.createIngredient(createData)

    isCreateModalOpen.value = false
    await loadIngredients()

    toast.add({
      title: 'Успех',
      description: 'Ингредиент создан',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error creating ingredient:', error)

    let errorMessage = 'Не удалось создать ингредиент'
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      errorMessage = 'Ингредиент с таким кодом или путем уже существует'
    } else if (error.statusCode === 400) {
      errorMessage = 'Единица измерения не найдена'
    }

    toast.add({
      title: 'Ошибка',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const updateIngredient = async () => {
  if (!selectedIngredient.value) return

  isLoading.value = true

  try {
    const updateData: UpdateIngredientDto = {
      srcPath: formData.value.srcPath || undefined,
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description || undefined,
      photo: formData.value.photo || undefined,
      unitId: formData.value.unitId,
      nutritionInfo: {
        calories: formData.value.nutritionInfo.calories,
        proteins: formData.value.nutritionInfo.proteins,
        fats: formData.value.nutritionInfo.fats,
        carbohydrates: formData.value.nutritionInfo.carbohydrates,
        fiber: formData.value.nutritionInfo.fiber || undefined,
        sugar: formData.value.nutritionInfo.sugar || undefined
      },
      seo: {
        title: formData.value.seo.title || undefined,
        description: formData.value.seo.description || undefined,
        keywords: formData.value.seo.keywords.length > 0 ? formData.value.seo.keywords : undefined,
        ogImage: formData.value.seo.ogImage || undefined
      }
    }

    await ingredientsApi.updateIngredient(selectedIngredient.value.id, updateData)

    isEditModalOpen.value = false
    await loadIngredients()

    toast.add({
      title: 'Успех',
      description: 'Ингредиент обновлен',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error updating ingredient:', error)

    let errorMessage = error.message || 'Не удалось обновить ингредиент'
    if (error.statusCode === 409) {
      errorMessage = 'Ингредиент с таким кодом или путем уже существует'
    } else if (error.statusCode === 400) {
      errorMessage = 'Единица измерения не найдена'
    }

    toast.add({
      title: 'Ошибка',
      description: errorMessage,
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const deleteIngredient = async () => {
  if (!selectedIngredient.value) return

  isLoading.value = true

  try {
    await ingredientsApi.deleteIngredient(selectedIngredient.value.id)

    isDeleteModalOpen.value = false
    await loadIngredients()

    toast.add({
      title: 'Успех',
      description: 'Ингредиент удален',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting ingredient:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить ингредиент',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Валидация формы
const isFormValid = computed(() => {
  return !!(formData.value.code && formData.value.name && formData.value.unitId)
})

// Наблюдение за пагинацией
watch([currentPage, pageSize], () => {
  if (searchQuery.value) {
    searchIngredients()
  } else {
    loadIngredients()
  }
})

// Загрузка при монтировании
onMounted(async () => {
  await loadUnits()
  await loadIngredients()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Ингредиенты
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление ингредиентами, их описанием, фото и SEO настройками
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Добавить ингредиент
      </UButton>
    </div>

    <!-- Search -->
    <UCard>
      <div class="flex items-center justify-between gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по коду или названию..."
          icon="i-lucide-search"
          class="max-w-md w-full"
          @update:model-value="handleSearch"
        />

        <div class="text-sm text-muted-foreground whitespace-nowrap">
          Всего: {{ totalIngredientsCount }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="ingredients"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-package" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет данных</p>
            <p class="text-sm text-muted-foreground mt-1">
              Добавьте первый ингредиент
            </p>
          </div>
        </template>
      </UTable>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t px-4 py-4"
      >
        <div class="text-sm text-muted-foreground">
          Показано
          {{ ((currentPage - 1) * pageSize) + 1 }}
          -
          {{ Math.min(currentPage * pageSize, totalIngredientsCount) }}
          из
          {{ totalIngredientsCount }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalIngredientsCount"
        />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal
      v-model:open="isCreateModalOpen"
      :ui="{
        content: 'max-w-3xl w-full max-h-[90vh] overflow-y-auto'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Добавление ингредиента
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              Заполните информацию об ингредиенте
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="createIngredient"
          >
            <!-- Основная информация -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Название" name="name" required>
                <UInput
                  v-model="formData.name"
                  placeholder="Абрикос"
                  description="Полное название ингредиента"
                  @input="onNameChange"
                />
              </UFormField>

              <UFormField label="Код" name="code" required>
                <UInput
                  v-model="formData.code"
                  placeholder="abrikos"
                  description="Уникальный идентификатор"
                />
              </UFormField>
            </div>

            <!-- Путь (srcPath) -->
            <UFormField label="Путь (slug)" name="srcPath">
              <UInput
                v-model="formData.srcPath"
                placeholder="abrikos"
                description="Уникальный путь для URL. Если не указан, генерируется из названия"
              />
              <div class="text-xs text-muted-foreground mt-1">
                Пример: <span class="font-mono">/ingredients/{{ formData.srcPath || 'abrikos' }}</span>
              </div>
            </UFormField>

            <!-- Описание -->
            <UFormField label="Описание" name="description">
              <UTextarea
                v-model="formData.description"
                placeholder="Краткое описание ингредиента..."
                :rows="3"
                description="Необязательное поле"
              />
            </UFormField>

            <!-- Фото -->
            <UFormField label="Фото" name="photo">
              <div class="space-y-3">
                <UButton
                  type="button"
                  color="primary"
                  variant="outline"
                  :loading="isUploading"
                  @click="handlePhotoUpload"
                  block
                >
                  <UIcon name="i-lucide-upload" class="mr-2" />
                  Загрузить фото
                </UButton>

                <div v-if="formData.photo" class="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm">
                  <img
                    :src="getFullImageUrl(formData.photo)"
                    alt="Ingredient photo"
                    class="w-full h-full object-cover"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                  />
                  <button
                    type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    @click="removePhoto"
                  >
                    <UIcon name="i-lucide-x" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </UFormField>

            <!-- Единица измерения -->
            <UFormField label="Единица измерения" name="unitId" required>
              <USelect
                v-model="formData.unitId"
                :items="units.map(unit => ({
                  label: `${unit.name} (${unit.short || unit.code})`,
                  value: unit.id
                }))"
                placeholder="Выберите единицу измерения"
                :loading="isUnitsLoading"
              />
            </UFormField>

            <!-- Пищевая ценность -->
            <div class="border-t pt-4">
              <h3 class="text-sm font-medium mb-3">Пищевая ценность (на 100г/100мл)</h3>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Калории (ккал)" name="calories">
                  <UInput
                    v-model.number="formData.nutritionInfo.calories"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Белки (г)" name="proteins">
                  <UInput
                    v-model.number="formData.nutritionInfo.proteins"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Жиры (г)" name="fats">
                  <UInput
                    v-model.number="formData.nutritionInfo.fats"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Углеводы (г)" name="carbohydrates">
                  <UInput
                    v-model.number="formData.nutritionInfo.carbohydrates"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-4">
                <UFormField label="Клетчатка (г)" name="fiber">
                  <UInput
                    v-model.number="formData.nutritionInfo.fiber"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Сахар (г)" name="sugar">
                  <UInput
                    v-model.number="formData.nutritionInfo.sugar"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>
              </div>
            </div>

            <!-- SEO -->
            <div class="border-t pt-4">
              <h3 class="text-sm font-medium mb-3">SEO настройки</h3>

              <div class="space-y-4">
                <!-- SEO Заголовок -->
                <div class="space-y-2 flex flex-col">
                  <UInput
                    v-model="formData.seo.title"
                    placeholder="SEO заголовок (до 60 символов)"
                    maxlength="60"
                  />
                  <div class="text-xs text-muted-foreground">
                    Осталось символов: {{ 60 - (formData.seo.title?.length || 0) }}
                  </div>
                </div>

                <!-- SEO Описание -->
                <div class="space-y-2 flex flex-col">
                  <label class="text-sm font-medium">SEO описание</label>
                  <UTextarea
                    v-model="formData.seo.description"
                    placeholder="SEO описание (до 160 символов)"
                    :rows="3"
                    maxlength="160"
                  />
                  <div class="text-xs text-muted-foreground">
                    Осталось символов: {{ 160 - (formData.seo.description?.length || 0) }}
                  </div>
                </div>

                <!-- Ключевые слова с CustomKeywords -->
                <CustomKeywords
                  :model-value="formData.seo.keywords"
                  @update:model-value="(val) => formData.seo.keywords = val"
                />

                <!-- OG Изображение -->
                <UFormField label="OG Изображение" name="seoOgImage">
                  <UInput
                    v-model="formData.seo.ogImage"
                    placeholder="https://example.com/og-image.jpg"
                    description="Изображение для соцсетей"
                  />
                </UFormField>

                <!-- Предпросмотр SEO -->
                <div class="mt-4 pt-4 border-t">
                  <label class="text-sm font-medium mb-2 block">Предпросмотр в поисковой выдаче</label>
                  <div class="p-3 border rounded-lg bg-muted/30 space-y-1">
                    <div class="text-sm font-semibold text-primary hover:underline cursor-pointer">
                      {{ previewTitle }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ previewUrl }}
                    </div>
                    <div class="text-xs text-muted-foreground line-clamp-2">
                      {{ previewDescription }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isCreateModalOpen = false"
              >
                Отмена
              </UButton>

              <UButton
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Создать
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal
      v-model:open="isEditModalOpen"
      :ui="{
        content: 'max-w-3xl w-full max-h-[90vh] overflow-y-auto'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Редактирование ингредиента
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              ID: {{ selectedIngredient?.id }}
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="updateIngredient"
          >
            <!-- Основная информация -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Название" name="name" required>
                <UInput v-model="formData.name" placeholder="Абрикос" @input="onNameChange" />
              </UFormField>

              <UFormField label="Код" name="code" required>
                <UInput v-model="formData.code" placeholder="abrikos" />
              </UFormField>
            </div>

            <!-- Путь (srcPath) -->
            <UFormField label="Путь (slug)" name="srcPath">
              <UInput
                v-model="formData.srcPath"
                placeholder="abrikos"
                description="Уникальный путь для URL"
              />
              <div class="text-xs text-muted-foreground mt-1">
                Пример: <span class="font-mono">/ingredients/{{ formData.srcPath || 'abrikos' }}</span>
              </div>
            </UFormField>

            <!-- Описание -->
            <UFormField label="Описание" name="description">
              <UTextarea
                v-model="formData.description"
                placeholder="Краткое описание ингредиента..."
                :rows="3"
              />
            </UFormField>

            <!-- Фото -->
            <UFormField label="Фото" name="photo">
              <div class="space-y-3">
                <UButton
                  type="button"
                  color="primary"
                  variant="outline"
                  :loading="isUploading"
                  @click="handlePhotoUpload"
                  block
                >
                  <UIcon name="i-lucide-upload" class="mr-2" />
                  {{ formData.photo ? 'Заменить фото' : 'Загрузить фото' }}
                </UButton>

                <div v-if="formData.photo" class="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm">
                  <img
                    :src="getFullImageUrl(formData.photo)"
                    alt="Ingredient photo"
                    class="w-full h-full object-cover"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                  />
                  <button
                    type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    @click="removePhoto"
                  >
                    <UIcon name="i-lucide-x" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </UFormField>

            <!-- Единица измерения -->
            <UFormField label="Единица измерения" name="unitId" required>
              <USelect                v-model="formData.unitId"
                :items="units.map(unit => ({
                  label: `${unit.name} (${unit.short || unit.code})`,
                  value: unit.id
                }))"
                placeholder="Выберите единицу измерения"
                :loading="isUnitsLoading"
              />
            </UFormField>

            <!-- Пищевая ценность -->
            <div class="border-t pt-4">
              <h3 class="text-sm font-medium mb-3">Пищевая ценность (на 100г/100мл)</h3>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Калории (ккал)" name="calories">
                  <UInput
                    v-model.number="formData.nutritionInfo.calories"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Белки (г)" name="proteins">
                  <UInput
                    v-model.number="formData.nutritionInfo.proteins"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Жиры (г)" name="fats">
                  <UInput
                    v-model.number="formData.nutritionInfo.fats"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Углеводы (г)" name="carbohydrates">
                  <UInput
                    v-model.number="formData.nutritionInfo.carbohydrates"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-4">
                <UFormField label="Клетчатка (г)" name="fiber">
                  <UInput
                    v-model.number="formData.nutritionInfo.fiber"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>

                <UFormField label="Сахар (г)" name="sugar">
                  <UInput
                    v-model.number="formData.nutritionInfo.sugar"
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </UFormField>
              </div>
            </div>

            <!-- SEO -->
            <div class="border-t pt-4">
              <h3 class="text-sm font-medium mb-3">SEO настройки</h3>

              <div class="space-y-4">
                <!-- SEO Заголовок -->
                <div class="space-y-2 flex flex-col">
                  <UInput
                    v-model="formData.seo.title"
                    placeholder="SEO заголовок (до 60 символов)"
                    maxlength="60"
                  />
                  <div class="text-xs text-muted-foreground">
                    Осталось символов: {{ 60 - (formData.seo.title?.length || 0) }}
                  </div>
                </div>

                <!-- SEO Описание -->
                <div class="space-y-2 flex flex-col">
                  <label class="text-sm font-medium">SEO описание</label>
                  <UTextarea
                    v-model="formData.seo.description"
                    placeholder="SEO описание (до 160 символов)"
                    :rows="3"
                    maxlength="160"
                  />
                  <div class="text-xs text-muted-foreground">
                    Осталось символов: {{ 160 - (formData.seo.description?.length || 0) }}
                  </div>
                </div>

                <!-- Ключевые слова с CustomKeywords -->
                <CustomKeywords
                  :model-value="formData.seo.keywords"
                  @update:model-value="(val) => formData.seo.keywords = val"
                />

                <!-- OG Изображение -->
                <UFormField label="OG Изображение" name="seoOgImage">
                  <UInput
                    v-model="formData.seo.ogImage"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </UFormField>

                <!-- Предпросмотр SEO -->
                <div class="mt-4 pt-4 border-t">
                  <label class="text-sm font-medium mb-2 block">Предпросмотр в поисковой выдаче</label>
                  <div class="p-3 border rounded-lg bg-muted/30 space-y-1">
                    <div class="text-sm font-semibold text-primary hover:underline cursor-pointer">
                      {{ previewTitle }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ previewUrl }}
                    </div>
                    <div class="text-xs text-muted-foreground line-clamp-2">
                      {{ previewDescription }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isEditModalOpen = false"
              >
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
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      :ui="{
        content: 'max-w-md w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-full bg-error/10">
              <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-error" />
            </div>
            <h2 class="text-xl font-semibold">
              Подтверждение удаления
            </h2>
          </div>

          <p class="text-muted-foreground">
            Вы уверены, что хотите удалить ингредиент
            <strong class="text-foreground">{{ selectedIngredient?.name }}</strong>?
          </p>

          <p class="text-sm text-muted-foreground mt-2">
            Код: <strong>{{ selectedIngredient?.code }}</strong>
          </p>
          <p class="text-sm text-muted-foreground">
            Путь: <strong class="font-mono">{{ selectedIngredient?.srcPath }}</strong>
          </p>

          <div class="bg-muted p-3 rounded-md mt-4">
            <p class="text-sm text-muted-foreground">
              ⚠️ Это действие нельзя отменить. Удаление ингредиента может повлиять на связанные рецепты.
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-6">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isDeleteModalOpen = false"
            >
              Отмена
            </UButton>

            <UButton
              color="error"
              :loading="isLoading"
              @click="deleteIngredient"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
