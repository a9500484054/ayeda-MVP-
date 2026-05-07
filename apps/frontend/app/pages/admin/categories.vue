<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useCategoriesApi, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '~/composables/useCategoriesApi'

definePageMeta({
  layout: 'admin',
  title: 'Категории'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const categoriesApi = useCategoriesApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedCategory = ref<Category | null>(null)
const isLoading = ref(false)

// Данные
const categories = ref<Category[]>([])
const totalCategoriesCount = ref(0)

// Форма
const formData = ref({
  code: '',
  name: '',
  description: ''
})

// Загрузка категорий
const loadCategories = async () => {
  isLoading.value = true
  try {
    const response = await categoriesApi.getCategories(currentPage.value, pageSize.value)
    categories.value = response.data
    totalCategoriesCount.value = response.total
  } catch (error: any) {
    console.error('Error loading categories:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить категории',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Таблица
const columns: TableColumn<any>[] = [
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
      const description = row.getValue('description') as string
      return description || '—'
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
    accessorKey: 'updatedAt',
    header: 'Дата обновления',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as string
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
      const category = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(category)
        }),

        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(category)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() =>
  Math.ceil(totalCategoriesCount.value / pageSize.value)
)

const paginatedCategories = computed(() => categories.value)

// Фильтрация на клиенте
const filteredCategories = computed(() => {
  if (!searchQuery.value) return paginatedCategories.value

  const query = searchQuery.value.toLowerCase()

  return paginatedCategories.value.filter(
    category =>
      category.code.toLowerCase().includes(query) ||
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
  )
})

// Методы
const handleSearch = (value: string) => {
  searchQuery.value = value
}

const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    description: ''
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (category: Category) => {
  selectedCategory.value = category

  formData.value = {
    code: category.code,
    name: category.name,
    description: category.description || ''
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (category: Category) => {
  selectedCategory.value = category
  isDeleteModalOpen.value = true
}

const createCategory = async () => {
  isLoading.value = true

  try {
    const createData: CreateCategoryDto = {
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description || undefined
    }

    await categoriesApi.createCategory(createData)

    isCreateModalOpen.value = false
    await loadCategories()

    toast.add({
      title: 'Успех',
      description: 'Категория создана',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error creating category:', error)

    let errorMessage = 'Не удалось создать категорию'
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      errorMessage = 'Категория с таким кодом или названием уже существует'
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

const updateCategory = async () => {
  if (!selectedCategory.value) return

  isLoading.value = true

  try {
    const updateData: UpdateCategoryDto = {
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description || undefined
    }

    await categoriesApi.updateCategory(selectedCategory.value.id, updateData)

    isEditModalOpen.value = false
    await loadCategories()

    toast.add({
      title: 'Успех',
      description: 'Категория обновлена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error updating category:', error)

    let errorMessage = error.message || 'Не удалось обновить категорию'
    if (error.statusCode === 409) {
      errorMessage = 'Категория с таким кодом или названием уже существует'
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

const deleteCategory = async () => {
  if (!selectedCategory.value) return

  isLoading.value = true

  try {
    await categoriesApi.deleteCategory(selectedCategory.value.id)

    isDeleteModalOpen.value = false
    await loadCategories()

    toast.add({
      title: 'Успех',
      description: 'Категория удалена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить категорию',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Валидация формы
const isFormValid = computed(() => {
  return !!(formData.value.code && formData.value.name)
})

// Наблюдение за пагинацией
watch([currentPage, pageSize], () => {
  loadCategories()
})

// Загрузка при монтировании
onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Категории
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление категориями блюд и продуктов
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Добавить категорию
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
          Всего: {{ totalCategoriesCount }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="filteredCategories"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-folder-open" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет данных</p>
            <p class="text-sm text-muted-foreground mt-1">
              Добавьте первую категорию
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
          {{ Math.min(currentPage * pageSize, totalCategoriesCount) }}
          из
          {{ totalCategoriesCount }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalCategoriesCount"
        />
      </div>
    </UCard>

    <!-- Create Modal -->
    <UModal
      v-model:open="isCreateModalOpen"
      :ui="{
        content: 'max-w-lg w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Добавление категории
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              Заполните информацию о новой категории
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="createCategory"
          >
            <UFormField label="Код" name="code" required>
              <UInput
                v-model="formData.code"
                placeholder="soups"
                description="Уникальный идентификатор (латиница, цифры, подчеркивания)"
              />
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput
                v-model="formData.name"
                placeholder="Супы"
                description="Полное название категории"
              />
            </UFormField>

            <UFormField label="Описание" name="description">
              <UTextarea
                v-model="formData.description"
                placeholder="Введите описание категории"
                description="Необязательное поле"
                :rows="3"
              />
            </UFormField>

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
        content: 'max-w-lg w-full'
      }"
    >
      <template #content>
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Редактирование категории
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              ID: {{ selectedCategory?.id }}
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="updateCategory"
          >
            <UFormField label="Код" name="code" required>
              <UInput
                v-model="formData.code"
                placeholder="soups"
              />
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput
                v-model="formData.name"
                placeholder="Супы"
              />
            </UFormField>

            <UFormField label="Описание" name="description">
              <UTextarea
                v-model="formData.description"
                placeholder="Введите описание категории"
                :rows="3"
              />
            </UFormField>

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
            Вы уверены, что хотите удалить категорию
            <strong class="text-foreground">{{ selectedCategory?.name }}</strong>?
          </p>

          <p class="text-sm text-muted-foreground mt-2">
            Код: <strong>{{ selectedCategory?.code }}</strong>
          </p>

          <div class="bg-muted p-3 rounded-md mt-4">
            <p class="text-sm text-muted-foreground">
              ⚠️ Это действие нельзя отменить. Удаление категории может повлиять на связанные рецепты.
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
              @click="deleteCategory"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
