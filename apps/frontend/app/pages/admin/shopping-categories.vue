<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useShoppingCategoriesApi, type ShoppingCategory, type CreateShoppingCategoryDto, type UpdateShoppingCategoryDto } from '~/composables/useShoppingCategoriesApi'

definePageMeta({
  layout: 'admin',
  title: 'Категории покупок'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const categoriesApi = useShoppingCategoriesApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedCategory = ref<ShoppingCategory | null>(null)
const isLoading = ref(false)

// Данные
const categories = ref<ShoppingCategory[]>([])
const totalCategoriesCount = ref(0)

// Форма
const formData = ref({
  code: '',
  name: '',
  icon: '',
  sortOrder: 0,
  isActive: true
})

// Доступные иконки (популярные иконки из lucide для категорий)
const availableIcons = [
  { label: '🍎 Apple', value: 'apple' },
  { label: '🥕 Carrot', value: 'carrot' },
  { label: '🥛 Milk', value: 'milk' },
  { label: '🍞 Bread', value: 'bread' },
  { label: '🥩 Meat', value: 'meat' },
  { label: '🐟 Fish', value: 'fish' },
  { label: '🧀 Cheese', value: 'cheese' },
  { label: '🥚 Egg', value: 'egg' },
  { label: '🍅 Tomato', value: 'tomato' },
  { label: '🥒 Cucumber', value: 'cucumber' },
  { label: '🥬 Leaf', value: 'leaf' },
  { label: '🍊 Orange', value: 'orange' },
  { label: '🍌 Banana', value: 'banana' },
  { label: '🍓 Strawberry', value: 'strawberry' },
  { label: '🧅 Onion', value: 'onion' },
  { label: '🧄 Garlic', value: 'garlic' },
  { label: '🥔 Potato', value: 'potato' },
  { label: '🍚 Rice', value: 'rice' },
  { label: '🍝 Pasta', value: 'pasta' },
  { label: '🥫 Can', value: 'can' },
  { label: '🧂 Salt', value: 'salt' },
  { label: '🍯 Honey', value: 'honey' },
  { label: '☕ Coffee', value: 'coffee' },
  { label: '🍵 Tea', value: 'tea' },
  { label: '🧴 Oil', value: 'oil' },
  { label: '🥄 Spoon', value: 'spoon' },
  { label: '📦 Package', value: 'package' },
  { label: '🛒 Shopping-cart', value: 'shopping-cart' },
  { label: '🏠 Home', value: 'home' },
  { label: '🎂 Cake', value: 'cake' },
]

// Загрузка категорий
const loadCategories = async () => {
  isLoading.value = true
  try {
    // Для админки получаем все категории (включая неактивные)
    const response = await categoriesApi.getAllForAdmin()
    categories.value = response
    totalCategoriesCount.value = response.length
  } catch (error: any) {
    console.error('Error loading shopping categories:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить категории покупок',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Таблица
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'icon',
    header: 'Иконка',
    cell: ({ row }) => {
      const icon = row.getValue('icon') as string
      return h('div', { class: 'text-2xl' }, [
        h('i', { class: `i-lucide-${icon} w-6 h-6` })
      ])
    },
    meta: {
      class: {
        td: 'w-16'
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
    accessorKey: 'sortOrder',
    header: 'Порядок',
    meta: {
      class: {
        td: 'text-center w-24'
      }
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Статус',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return h(UBadge, {
        color: isActive ? 'success' : 'neutral',
        variant: 'subtle'
      }, () => isActive ? 'Активна' : 'Неактивна')
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
          onClick: () => openDeleteModal(category),
          disabled: category.code === 'other'
        })
      ])
    }
  }
]

// Пагинация (клиентская, так как получаем все данные)
const totalPages = computed(() =>
  Math.ceil(filteredCategories.value.length / pageSize.value)
)

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCategories.value.slice(start, end)
})

// Фильтрация на клиенте
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value

  const query = searchQuery.value.toLowerCase()

  return categories.value.filter(
    category =>
      category.code.toLowerCase().includes(query) ||
      category.name.toLowerCase().includes(query)
  )
})

// Методы
const handleSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    icon: 'package',
    sortOrder: 0,
    isActive: true
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (category: ShoppingCategory) => {
  selectedCategory.value = category

  formData.value = {
    code: category.code,
    name: category.name,
    icon: category.icon,
    sortOrder: category.sortOrder,
    isActive: category.isActive
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (category: ShoppingCategory) => {
  selectedCategory.value = category
  isDeleteModalOpen.value = true
}

const createCategory = async () => {
  isLoading.value = true

  try {
    const createData: CreateShoppingCategoryDto = {
      code: formData.value.code,
      name: formData.value.name,
      icon: formData.value.icon,
      sortOrder: formData.value.sortOrder
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
    console.error('Error creating shopping category:', error)

    let errorMessage = 'Не удалось создать категорию'
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      errorMessage = 'Категория с таким кодом уже существует'
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
    const updateData: UpdateShoppingCategoryDto = {
      code: formData.value.code,  // 👈 Добавляем code в обновление
      name: formData.value.name,
      icon: formData.value.icon,
      sortOrder: formData.value.sortOrder,
      isActive: formData.value.isActive
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
    console.error('Error updating shopping category:', error)

    let errorMessage = error.message || 'Не удалось обновить категорию'
    if (error.statusCode === 409) {
      errorMessage = 'Категория с таким кодом уже существует'
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
    console.error('Error deleting shopping category:', error)
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
  return !!(formData.value.code && formData.value.name && formData.value.icon)
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
          Категории покупок
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление категориями для списка покупок
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
          Всего: {{ filteredCategories.length }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="paginatedCategories"
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
          {{ Math.min(currentPage * pageSize, filteredCategories.length) }}
          из
          {{ filteredCategories.length }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="filteredCategories.length"
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
              Заполните информацию о новой категории для списка покупок
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
                placeholder="vegetables"
                description="Уникальный идентификатор (латиница, цифры, подчеркивания)"
              />
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput
                v-model="formData.name"
                placeholder="Овощи"
                description="Полное название категории"
              />
            </UFormField>

            <UFormField label="Иконка" name="icon" required>
              <USelect
                v-model="formData.icon"
                :items="availableIcons"
                placeholder="Выберите иконку"
              />
              <div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Предпросмотр:</span>
                <i :class="`i-lucide-${formData.icon} w-5 h-5`" />
              </div>
            </UFormField>

            <UFormField label="Порядок сортировки" name="sortOrder">
              <UInput
                v-model.number="formData.sortOrder"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                description="Чем меньше число, тем выше в списке"
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
                placeholder="vegetables"
                description="Уникальный идентификатор (латиница, цифры, подчеркивания)"
                :disabled="selectedCategory?.code === 'other'"
              />
              <p v-if="selectedCategory?.code === 'other'" class="text-xs text-warning mt-1">
                ⚠️ Системную категорию "other" нельзя переименовывать
              </p>
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput v-model="formData.name" placeholder="Овощи" />
            </UFormField>

            <UFormField label="Иконка" name="icon" required>
              <USelect
                v-model="formData.icon"
                :items="availableIcons"
                placeholder="Выберите иконку"
              />
              <div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Предпросмотр:</span>
                <i :class="`i-lucide-${formData.icon} w-5 h-5`" />
              </div>
            </UFormField>

            <UFormField label="Порядок сортировки" name="sortOrder">
              <UInput
                v-model.number="formData.sortOrder"
                type="number"
                step="1"
                min="0"
                placeholder="0"
              />
            </UFormField>

            <UFormField label="Статус" name="isActive">
              <div class="flex items-center gap-2">
                <USwitch v-model="formData.isActive" />
                <span class="text-sm text-muted-foreground">
                  {{ formData.isActive ? 'Активна' : 'Неактивна' }}
                </span>
              </div>
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
              ⚠️ Это действие нельзя отменить. Категория "other" не может быть удалена.
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
