<!-- apps/frontend/app/pages/admin/moderate/recipes.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useModerationApi, type ModerationRecipe } from '~/composables/useModerationApi'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  title: 'Модерация рецептов'
})

// Компоненты
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const toast = useToast()
const moderationApi = useModerationApi()
const config = useRuntimeConfig()

// Состояние
const isLoading = ref(false)
const isProcessing = ref(false)
const recipes = ref<ModerationRecipe[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref<'pending' | 'rejected' | 'all'>('pending')

// Модалки
const isViewModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const selectedRecipe = ref<ModerationRecipe | null>(null)
const rejectReason = ref('')

// SEO данные для редактирования
const seoForm = ref({
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [] as string[],
  seoOgImage: '',
  seoCanonicalUrl: ''
})

// Загрузка очереди модерации
const loadModerationQueue = async () => {
  isLoading.value = true

  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    const response = await moderationApi.getModerationQueue(params)

    if (response && response.data && Array.isArray(response.data)) {
      recipes.value = response.data
      totalCount.value = response.total || response.data.length
    } else if (Array.isArray(response)) {
      recipes.value = response
      totalCount.value = response.length
    } else {
      recipes.value = []
      totalCount.value = 0
    }
  } catch (error: any) {
    console.error('❌ Error loading moderation queue:', error)
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message || 'Не удалось загрузить очередь модерации',
      color: 'error'
    })
    recipes.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

// Debounced поиск
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadModerationQueue()
}, 400)

// Обработчик поиска
const handleSearch = (value: string) => {
  searchQuery.value = value
  debouncedSearch()
}

// Обработчик фильтра по статусу
const handleStatusFilter = (value: 'pending' | 'rejected' | 'all') => {
  statusFilter.value = value
  currentPage.value = 1
  loadModerationQueue()
}

// Открыть модалку просмотра
const viewRecipe = (recipe: ModerationRecipe) => {
  selectedRecipe.value = recipe
  seoForm.value = {
    seoTitle: recipe.seo?.title || recipe.title || '',
    seoDescription: recipe.seo?.description || recipe.description || '',
    seoKeywords: recipe.seo?.keywords || [],
  }
  isViewModalOpen.value = true
}

// Одобрить рецепт
const approveRecipe = async () => {
  if (!selectedRecipe.value) return

  isProcessing.value = true

  try {
    await moderationApi.approveRecipe(selectedRecipe.value.id, {
      seoTitle: seoForm.value.seoTitle,
      seoDescription: seoForm.value.seoDescription,
      seoKeywords: seoForm.value.seoKeywords,
    })

    toast.add({
      title: 'Успех',
      description: `Рецепт "${selectedRecipe.value.title}" опубликован`,
      color: 'success'
    })

    isViewModalOpen.value = false
    selectedRecipe.value = null
    await loadModerationQueue()
  } catch (error: any) {
    console.error('❌ Error approving recipe:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось опубликовать рецепт',
      color: 'error'
    })
  } finally {
    isProcessing.value = false
  }
}

// Открыть модалку отклонения
const openRejectModal = (recipe: ModerationRecipe) => {
  selectedRecipe.value = recipe
  rejectReason.value = ''
  isRejectModalOpen.value = true
}

// Отклонить рецепт
const rejectRecipe = async () => {
  if (!selectedRecipe.value) return

  isProcessing.value = true

  try {
    await moderationApi.rejectRecipe(selectedRecipe.value.id, rejectReason.value)

    toast.add({
      title: 'Рецепт отклонен',
      description: `Рецепт "${selectedRecipe.value.title}" отклонен${rejectReason.value ? ': ' + rejectReason.value : ''}`,
      color: 'warning'
    })

    isRejectModalOpen.value = false
    selectedRecipe.value = null
    rejectReason.value = ''
    await loadModerationQueue()
  } catch (error: any) {
    console.error('❌ Error rejecting recipe:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось отклонить рецепт',
      color: 'error'
    })
  } finally {
    isProcessing.value = false
  }
}

// Получить цвет сложности
const getDifficultyColor = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return map[difficulty] || 'neutral'
}

const getDifficultyLabel = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  }
  return map[difficulty] || difficulty
}

// Получить цвет статуса
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    public: 'success',
    rejected: 'error',
    draft: 'neutral',
    private: 'neutral'
  }
  return map[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'На модерации',
    public: 'Опубликован',
    rejected: 'Отклонен',
    draft: 'Черновик',
    private: 'Приватный'
  }
  return map[status] || status
}

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Пагинация
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Колонки таблицы с правильной структурой для UTable
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'title',
    header: 'Название',
    cell: ({ row }) => {
      const recipe = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        recipe.photo?.src
          ? h('img', {
              src: `${config.public.apiUrl}${recipe.photo.src}`,
              class: 'w-10 h-10 rounded object-cover',
              onError: (e: Event) => (e.target as HTMLImageElement).style.display = 'none'
            })
          : null,
        h('div', [
          h('p', { class: 'font-medium' }, recipe.title),
          recipe.description
            ? h('p', { class: 'text-xs text-muted truncate max-w-xs' }, recipe.description)
            : null
        ])
      ])
    }
  },
  {
    accessorKey: 'author',
    header: 'Автор',
    cell: ({ row }) => {
      const recipe = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm' }, recipe.author?.username || '—')
      ])
    }
  },
  {
    accessorKey: 'difficulty',
    header: 'Сложность',
    cell: ({ row }) => {
      const difficulty = row.getValue('difficulty') as string
      return h(UBadge, {
        color: getDifficultyColor(difficulty),
        variant: 'subtle'
      }, () => getDifficultyLabel(difficulty))
    }
  },
  {
    accessorKey: 'cookingTime',
    header: 'Время',
    cell: ({ row }) => {
      const time = row.getValue('cookingTime') as number
      return `${time} мин`
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return formatDate(date)
    }
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return h(UBadge, {
        color: getStatusColor(status),
        variant: 'subtle'
      }, () => getStatusLabel(status))
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: {
      class: {
        th: 'text-right w-32',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const recipe = row.original

      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => viewRecipe(recipe)
        }),
        recipe.status === 'pending'
          ? h(UButton, {
              icon: 'i-lucide-check',
              size: 'sm',
              color: 'success',
              variant: 'ghost',
              onClick: () => viewRecipe(recipe)
            })
          : null,
        recipe.status === 'pending'
          ? h(UButton, {
              icon: 'i-lucide-x',
              size: 'sm',
              color: 'error',
              variant: 'ghost',
              onClick: () => openRejectModal(recipe)
            })
          : null
      ])
    }
  }
]

// Загрузка при монтировании
onMounted(() => {
  loadModerationQueue()
})

// Обработчик изменения страницы
watch([currentPage, pageSize, statusFilter], () => {
  loadModerationQueue()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Модерация рецептов</h1>
        <p class="text-muted mt-1">
          Проверка и публикация рецептов
          <span v-if="totalCount > 0" class="ml-2 text-sm">
            ({{ totalCount }} на модерации)
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :loading="isLoading"
          @click="loadModerationQueue"
        >
          Обновить
        </UButton>
      </div>
    </div>

    <!-- Фильтры -->
    <UCard>
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по названию или автору..."
          icon="i-lucide-search"
          class="flex-1"
          @update:model-value="handleSearch"
        />

        <USelect
          :model-value="statusFilter"
          :items="[
            { label: 'На модерации', value: 'pending' },
            { label: 'Отклоненные', value: 'rejected' },
            { label: 'Все', value: 'all' }
          ]"
          class="w-48"
          @update:model-value="handleStatusFilter"
        />
      </div>
    </UCard>

    <!-- Таблица -->
    <UCard>
      <UTable
        :data="recipes"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет рецептов на модерации</p>
            <p class="text-sm text-muted-foreground mt-1">Все рецепты проверены</p>
          </div>
        </template>
      </UTable>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t px-4 py-4">
        <div class="text-sm text-muted-foreground">
          Показано {{ ((currentPage - 1) * pageSize) + 1 }} -
          {{ Math.min(currentPage * pageSize, totalCount) }} из {{ totalCount }}
        </div>
        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="totalCount"
        />
      </div>
    </UCard>

    <!-- Модалка просмотра и одобрения -->
    <UModal
      v-model:open="isViewModalOpen"
      :ui="{ content: 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' }"
    >
      <template #content>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Модерация рецепта</h2>
            <UButton
              variant="ghost"
              icon="i-lucide-x"
              @click="isViewModalOpen = false"
            />
          </div>

          <div v-if="selectedRecipe" class="space-y-6">
            <!-- Основная информация -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-muted-foreground">Название</h3>
                  <p class="text-lg font-semibold">{{ selectedRecipe.title }}</p>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground">Автор</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <UAvatar
                      :src="selectedRecipe.author?.avatar ? `${config.public.apiUrl}${selectedRecipe.author.avatar}` : undefined"
                      :alt="selectedRecipe.author?.username"
                      size="sm"
                    />
                    <span>{{ selectedRecipe.author?.username }}</span>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground">Описание</h3>
                  <p class="text-sm">{{ selectedRecipe.description || '—' }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <h3 class="text-sm font-medium text-muted-foreground">Сложность</h3>
                    <UBadge :color="getDifficultyColor(selectedRecipe.difficulty)">
                      {{ getDifficultyLabel(selectedRecipe.difficulty) }}
                    </UBadge>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-muted-foreground">Время</h3>
                    <p>{{ selectedRecipe.cookingTime }} мин</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-muted-foreground">Порции</h3>
                    <p>{{ selectedRecipe.servings }}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-muted-foreground">Калории</h3>
                    <p>{{ selectedRecipe.calories || '—' }} ккал</p>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground">Категории</h3>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <UBadge
                      v-for="cat in selectedRecipe.categories"
                      :key="cat.id"
                      variant="subtle"
                      size="sm"
                    >
                      {{ cat.name }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-medium text-muted-foreground mb-2">Фото</h3>
                <div class="rounded-lg overflow-hidden border bg-gray-50">
                  <img
                    v-if="selectedRecipe.photo?.src"
                    :src="`${config.public.apiUrl}${selectedRecipe.photo.src}`"
                    class="w-full object-cover max-h-80"
                  />
                  <div v-else class="flex items-center justify-center h-40 text-muted-foreground">
                    <UIcon name="i-lucide-image" class="h-12 w-12" />
                  </div>
                </div>

                <div v-if="selectedRecipe.video" class="mt-2">
                  <h3 class="text-sm font-medium text-muted-foreground">Видео</h3>
                  <a
                    :href="selectedRecipe.video"
                    target="_blank"
                    class="text-sm text-primary hover:underline"
                  >
                    {{ selectedRecipe.video }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Ингредиенты -->
            <div>
              <h3 class="text-sm font-medium text-muted-foreground mb-2">Ингредиенты</h3>
              <div class="border rounded-lg divide-y max-h-60 overflow-y-auto">
                <div
                  v-for="(ing, idx) in selectedRecipe.ingredients"
                  :key="idx"
                  class="flex justify-between items-center px-4 py-2 text-sm"
                >
                  <span>{{ ing.ingredient?.name || ing.ingredientId || '—' }}</span>
                  <span>{{ ing.amount }} {{ ing.unit?.short || ing.unitId || '' }}</span>
                </div>
              </div>
            </div>

            <!-- Шаги -->
            <div>
              <h3 class="text-sm font-medium text-muted-foreground mb-2">Шаги приготовления</h3>
              <div class="space-y-4 max-h-60 overflow-y-auto">
                <div
                  v-for="step in selectedRecipe.steps"
                  :key="step.sort"
                  class="border rounded-lg p-4"
                >
                  <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                      {{ step.sort }}
                    </span>
                    <div class="flex-1">
                      <p class="text-sm">{{ step.text }}</p>
                      <img
                        v-if="step.image"
                        :src="`${config.public.apiUrl}${step.image}`"
                        class="mt-2 max-h-40 rounded object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEO данные -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold mb-4">SEO настройки</h3>

              <div class="space-y-4">
                <UFormField label="SEO Заголовок">
                  <UInput
                    v-model="seoForm.seoTitle"
                    placeholder="Заголовок для поисковых систем"
                    maxlength="70"
                  />
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ seoForm.seoTitle?.length || 0 }}/70 символов
                  </div>
                </UFormField>

                <UFormField label="SEO Описание">
                  <UTextarea
                    v-model="seoForm.seoDescription"
                    placeholder="Описание для поисковых систем"
                    :rows="3"
                    maxlength="160"
                  />
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ seoForm.seoDescription?.length || 0 }}/160 символов
                  </div>
                </UFormField>

                <UFormField label="Ключевые слова">
                  <UInput
                    v-model="seoForm.seoKeywords"
                    placeholder="Введите ключевые слова через запятую"
                  />
                  <div class="text-xs text-muted-foreground mt-1">
                    Введите слова через запятую
                  </div>
                </UFormField>


                <!-- Предпросмотр SEO -->
                <div class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 class="text-sm font-medium mb-2">Предпросмотр в поиске</h4>
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-primary-700 dark:text-primary-400">
                      {{ seoForm.seoTitle || selectedRecipe.title }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ config.public.baseUrl || 'https://ayeda.ru' }}/recipes/{{ selectedRecipe.srcPath }}
                    </p>
                    <p class="text-xs text-muted-foreground line-clamp-2">
                      {{ seoForm.seoDescription || selectedRecipe.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Действия -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isViewModalOpen = false"
              >
                Отмена
              </UButton>

              <UButton
                color="error"
                variant="outline"
                @click="openRejectModal(selectedRecipe)"
              >
                Отклонить
              </UButton>

              <UButton
                color="success"
                :loading="isProcessing"
                @click="approveRecipe"
              >
                <UIcon name="i-lucide-check" class="mr-1" />
                Опубликовать
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Модалка отклонения -->
    <UModal
      v-model:open="isRejectModalOpen"
      :ui="{ content: 'max-w-md w-full' }"
    >
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold mb-4">Отклонить рецепт</h2>

          <p class="text-sm text-muted-foreground mb-4">
            Вы уверены, что хотите отклонить рецепт
            <strong>{{ selectedRecipe?.title }}</strong>?
          </p>

          <UFormField label="Причина отклонения (необязательно)">
            <UTextarea
              v-model="rejectReason"
              placeholder="Укажите причину отклонения..."
              :rows="3"
            />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isRejectModalOpen = false"
            >
              Отмена
            </UButton>
            <UButton
              color="error"
              :loading="isProcessing"
              @click="rejectRecipe"
            >
              Отклонить
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
