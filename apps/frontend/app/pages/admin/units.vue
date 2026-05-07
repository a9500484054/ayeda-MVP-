<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useUnitsApi, type Unit, type CreateUnitDto, type UpdateUnitDto } from '~/composables/useUnitsApi'

definePageMeta({
  layout: 'admin',
  title: 'Единицы измерения'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Toast
const toast = useToast()

// API
const unitsApi = useUnitsApi()

// Состояние
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedUnit = ref<Unit | null>(null)
const isLoading = ref(false)

// Данные
const units = ref<Unit[]>([])
const totalUnitsCount = ref(0)

// Форма
const formData = ref({
  code: '',
  name: '',
  short: '',
  type: 'other' as 'mass' | 'volume' | 'count' | 'other'
})

// Загрузка единиц измерения
const loadUnits = async () => {
  isLoading.value = true
  try {
    const response = await unitsApi.getUnits(currentPage.value, pageSize.value)
    units.value = response.data
    totalUnitsCount.value = response.total
  } catch (error: any) {
    console.error('Error loading units:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось загрузить единицы измерения',
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
    accessorKey: 'short',
    header: 'Краткое название',
    cell: ({ row }) => {
      const short = row.getValue('short') as string
      return short || '—'
    }
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const type = row.getValue('type') as string

      const colorMap: Record<string, string> = {
        mass: 'primary',
        volume: 'info',
        count: 'success',
        other: 'neutral'
      }

      const labelMap: Record<string, string> = {
        mass: 'Масса',
        volume: 'Объем',
        count: 'Количество',
        other: 'Другое'
      }

      return h(
        UBadge,
        {
          color: colorMap[type] || 'neutral',
          variant: 'subtle'
        },
        () => labelMap[type] || type
      )
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
      const unit = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => openEditModal(unit)
        }),

        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => openDeleteModal(unit)
        })
      ])
    }
  }
]

// Пагинация
const totalPages = computed(() =>
  Math.ceil(totalUnitsCount.value / pageSize.value)
)

const paginatedUnits = computed(() => units.value)

// Фильтрация на клиенте
const filteredUnits = computed(() => {
  if (!searchQuery.value) return paginatedUnits.value

  const query = searchQuery.value.toLowerCase()

  return paginatedUnits.value.filter(
    unit =>
      unit.code.toLowerCase().includes(query) ||
      unit.name.toLowerCase().includes(query) ||
      (unit.short && unit.short.toLowerCase().includes(query))
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
    short: '',
    type: 'other'
  }
}

const openCreateModal = () => {
  resetForm()
  isCreateModalOpen.value = true
}

const openEditModal = (unit: Unit) => {
  selectedUnit.value = unit

  formData.value = {
    code: unit.code,
    name: unit.name,
    short: unit.short || '',
    type: unit.type
  }

  isEditModalOpen.value = true
}

const openDeleteModal = (unit: Unit) => {
  selectedUnit.value = unit
  isDeleteModalOpen.value = true
}

const createUnit = async () => {
  isLoading.value = true

  try {
    const createData: CreateUnitDto = {
      code: formData.value.code,
      name: formData.value.name,
      short: formData.value.short,
      type: formData.value.type
    }

    await unitsApi.createUnit(createData)

    isCreateModalOpen.value = false
    await loadUnits()

    toast.add({
      title: 'Успех',
      description: 'Единица измерения создана',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error creating unit:', error)

    let errorMessage = 'Не удалось создать единицу измерения'
    if (error.message?.includes('already exists') || error.statusCode === 409) {
      errorMessage = 'Единица измерения с таким кодом уже существует'
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

const updateUnit = async () => {
  if (!selectedUnit.value) return

  isLoading.value = true

  try {
    const updateData: UpdateUnitDto = {
      code: formData.value.code,
      name: formData.value.name,
      short: formData.value.short,
      type: formData.value.type
    }

    await unitsApi.updateUnit(selectedUnit.value.id, updateData)

    isEditModalOpen.value = false
    await loadUnits()

    toast.add({
      title: 'Успех',
      description: 'Единица измерения обновлена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error updating unit:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось обновить единицу измерения',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const deleteUnit = async () => {
  if (!selectedUnit.value) return

  isLoading.value = true

  try {
    await unitsApi.deleteUnit(selectedUnit.value.id)

    isDeleteModalOpen.value = false
    await loadUnits()

    toast.add({
      title: 'Успех',
      description: 'Единица измерения удалена',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error deleting unit:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить единицу измерения',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Валидация формы
const isFormValid = computed(() => {
  return !!(formData.value.code && formData.value.name && formData.value.type)
})

// Наблюдение за пагинацией
watch([currentPage, pageSize], () => {
  loadUnits()
})

// Загрузка при монтировании
onMounted(() => {
  loadUnits()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Единицы измерения
        </h1>

        <p class="text-sm text-muted-foreground mt-1">
          Управление единицами измерения продукции
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Добавить единицу
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
          Всего: {{ totalUnitsCount }}
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :data="filteredUnits"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-package" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет данных</p>
            <p class="text-sm text-muted-foreground mt-1">
              Добавьте первую единицу измерения
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
          {{ Math.min(currentPage * pageSize, totalUnitsCount) }}
          из
          {{ totalUnitsCount }}
        </div>

        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalUnitsCount"
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
              Добавление единицы измерения
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              Заполните информацию о новой единице измерения
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="createUnit"
          >
            <UFormField label="Код" name="code" required>
              <UInput
                v-model="formData.code"
                placeholder="kg"
                description="Уникальный идентификатор"
              />
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput
                v-model="formData.name"
                placeholder="Килограмм"
                description="Полное название единицы измерения"
              />
            </UFormField>

            <UFormField label="Краткое название" name="short">
              <UInput
                v-model="formData.short"
                placeholder="кг"
                description="Сокращенное название (необязательно)"
              />
            </UFormField>

            <UFormField label="Тип" name="type" required>
              <USelect
                v-model="formData.type"
                :items="[
                  { label: 'Масса', value: 'mass' },
                  { label: 'Объем', value: 'volume' },
                  { label: 'Количество', value: 'count' },
                  { label: 'Другое', value: 'other' }
                ]"
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
              Редактирование единицы измерения
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              ID: {{ selectedUnit?.id }}
            </p>
          </div>

          <UForm
            :state="formData"
            class="space-y-4"
            @submit="updateUnit"
          >
            <UFormField label="Код" name="code" required>
              <UInput
                v-model="formData.code"
                placeholder="kg"
              />
            </UFormField>

            <UFormField label="Название" name="name" required>
              <UInput
                v-model="formData.name"
                placeholder="Килограмм"
              />
            </UFormField>

            <UFormField label="Краткое название" name="short">
              <UInput
                v-model="formData.short"
                placeholder="кг"
              />
            </UFormField>

            <UFormField label="Тип" name="type" required>
              <USelect
                v-model="formData.type"
                :items="[
                  { label: 'Масса', value: 'mass' },
                  { label: 'Объем', value: 'volume' },
                  { label: 'Количество', value: 'count' },
                  { label: 'Другое', value: 'other' }
                ]"
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
            Вы уверены, что хотите удалить единицу измерения
            <strong class="text-foreground">{{ selectedUnit?.name }}</strong>?
          </p>

          <p class="text-sm text-muted-foreground mt-2">
            Код: <strong>{{ selectedUnit?.code }}</strong>
          </p>

          <div class="bg-muted p-3 rounded-md mt-4">
            <p class="text-sm text-muted-foreground">
              ⚠️ Это действие нельзя отменить. Удаление единицы измерения может повлиять на связанные продукты.
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
              @click="deleteUnit"
            >
              Удалить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
