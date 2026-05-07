<script setup lang="ts">
import { h, resolveComponent, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useIngredientsApi, type Ingredient, type CreateIngredientDto, type UpdateIngredientDto } from '~/composables/useIngredientsApi'
import { useUnitsApi, type Unit } from '~/composables/useUnitsApi'

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

// Данные
const ingredients = ref<Ingredient[]>([])
const totalIngredientsCount = ref(0)
const units = ref<Unit[]>([])

// Форма
const formData = ref({
  code: '',
  name: '',
  unitId: '',
  nutritionInfo: {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0
  }
})

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
    accessorKey: 'unit',
    header: 'Единица измерения',
    cell: ({ row }) => {
      const unit = row.getValue('unit') as Unit
      return unit ? `${unit.name} (${unit.short || unit.code})` : '—'
    }
  },
  {
    accessorKey: 'nutritionInfo',
    header: 'Пищевая ценность (на 100г/100мл)',
    cell: ({ row }) => {
      const nutrition = row.getValue('nutritionInfo') as any
      if (!nutrition) return '—'

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
    code: '',
    name: '',
    unitId: '',
    nutritionInfo: {
      calories: 0,
      proteins: 0,
      fats: 0,
      carbohydrates: 0
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
    code: ingredient.code,
    name: ingredient.name,
    unitId: ingredient.unit.id,
    nutritionInfo: {
      calories: ingredient.nutritionInfo?.calories || 0,
      proteins: ingredient.nutritionInfo?.proteins || 0,
      fats: ingredient.nutritionInfo?.fats || 0,
      carbohydrates: ingredient.nutritionInfo?.carbohydrates || 0
    }
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (ingredient: Ingredient) => {
  selectedIngredient.value = ingredient
  isDeleteModalOpen.value = true
}

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
    const createData: CreateIngredientDto = {
      code: formData.value.code,
      name: formData.value.name,
      unitId: formData.value.unitId,
      nutritionInfo: {
        calories: formData.value.nutritionInfo.calories,
        proteins: formData.value.nutritionInfo.proteins,
        fats: formData.value.nutritionInfo.fats,
        carbohydrates: formData.value.nutritionInfo.carbohydrates
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
      errorMessage = 'Ингредиент с таким кодом уже существует'
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
      code: formData.value.code,
      name: formData.value.name,
      unitId: formData.value.unitId,
      nutritionInfo: {
        calories: formData.value.nutritionInfo.calories,
        proteins: formData.value.nutritionInfo.proteins,
        fats: formData.value.nutritionInfo.fats,
        carbohydrates: formData.value.nutritionInfo.carbohydrates
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
      errorMessage = 'Ингредиент с таким кодом уже существует'
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
          Управление ингредиентами и их пищевой ценностью
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
        content: 'max-w-2xl w-full'
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
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Код" name="code" required>
                <UInput
                  v-model="formData.code"
                  placeholder="milk"
                  description="Уникальный идентификатор"
                />
              </UFormField>

              <UFormField label="Название" name="name" required>
                <UInput
                  v-model="formData.name"
                  placeholder="Молоко"
                  description="Полное название ингредиента"
                />
              </UFormField>
            </div>

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
        content: 'max-w-2xl w-full'
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
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Код" name="code" required>
                <UInput v-model="formData.code" placeholder="milk" />
              </UFormField>

              <UFormField label="Название" name="name" required>
                <UInput v-model="formData.name" placeholder="Молоко" />
              </UFormField>
            </div>

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
