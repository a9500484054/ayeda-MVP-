<!-- apps/frontend/app/pages/admin/moderate/comments.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useModerationApi, type ModerationComment } from '~/composables/useModerationApi'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  title: 'Модерация комментариев'
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
const comments = ref<ModerationComment[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const filterType = ref<'all' | 'hidden' | 'visible'>('all')

// Модалки
const isViewModalOpen = ref(false)
const selectedComment = ref<ModerationComment | null>(null)

// Загрузка очереди комментариев
const loadCommentsQueue = async () => {
  isLoading.value = true

  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (filterType.value === 'hidden') {
      params.isHidden = true
    } else if (filterType.value === 'visible') {
      params.isHidden = false
    }

    console.log('📤 Sending request with params:', params)

    const response = await moderationApi.getCommentsModerationQueue(params)

    console.log('📥 Full API response:', response)

    if (response && response.data && Array.isArray(response.data)) {
      comments.value = response.data
      totalCount.value = response.total || response.data.length
    } else if (Array.isArray(response)) {
      comments.value = response
      totalCount.value = response.length
    } else {
      comments.value = []
      totalCount.value = 0
    }

    console.log('✅ Comments loaded:', comments.value.length)
  } catch (error: any) {
    console.error('❌ Error loading comments queue:', error)
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message || 'Не удалось загрузить очередь комментариев',
      color: 'error'
    })
    comments.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

// Debounced поиск
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadCommentsQueue()
}, 400)

// Обработчик поиска
const handleSearch = (value: string) => {
  searchQuery.value = value
  debouncedSearch()
}

// Обработчик фильтра
const handleFilter = (value: 'all' | 'hidden' | 'visible') => {
  filterType.value = value
  currentPage.value = 1
  loadCommentsQueue()
}

// Открыть модалку просмотра
const viewComment = (comment: ModerationComment) => {
  selectedComment.value = comment
  isViewModalOpen.value = true
}

// Скрыть комментарий
const hideComment = async (comment: ModerationComment) => {
  if (!confirm('Вы уверены, что хотите скрыть этот комментарий?')) return

  isProcessing.value = true

  try {
    await moderationApi.hideComment(comment.recipeId, comment.id)

    // Обновляем локальное состояние
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], isHidden: true }
    }

    toast.add({
      title: 'Комментарий скрыт',
      color: 'success'
    })

    // Перезагружаем список
    await loadCommentsQueue()
  } catch (error: any) {
    console.error('❌ Error hiding comment:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось скрыть комментарий',
      color: 'error'
    })
  } finally {
    isProcessing.value = false
  }
}

// Показать комментарий
const showComment = async (comment: ModerationComment) => {
  isProcessing.value = true

  try {
    await moderationApi.showComment(comment.recipeId, comment.id)

    // Обновляем локальное состояние
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], isHidden: false }
    }

    toast.add({
      title: 'Комментарий показан',
      color: 'success'
    })

    // Перезагружаем список
    await loadCommentsQueue()
  } catch (error: any) {
    console.error('❌ Error showing comment:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось показать комментарий',
      color: 'error'
    })
  } finally {
    isProcessing.value = false
  }
}

// Удалить комментарий
const deleteComment = async (comment: ModerationComment) => {
  if (!confirm('Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.')) return

  isProcessing.value = true

  try {
    await moderationApi.deleteComment(comment.recipeId, comment.id)

    toast.add({
      title: 'Комментарий удален',
      color: 'success'
    })

    // Перезагружаем список
    await loadCommentsQueue()
  } catch (error: any) {
    console.error('❌ Error deleting comment:', error)
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось удалить комментарий',
      color: 'error'
    })
  } finally {
    isProcessing.value = false
  }
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

// Обрезать текст
const truncateText = (text: string, maxLength: number = 100) => {
  if (!text) return '—'
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Пагинация
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Колонки таблицы
const columns: TableColumn<any>[] = [
  {
    accessorKey: 'text',
    header: 'Комментарий',
    cell: ({ row }) => {
      const comment = row.original
      return h('div', { class: 'max-w-xs' }, [
        h('p', { class: 'text-sm' }, truncateText(comment.text, 80)),
        h('p', { class: 'text-xs text-muted-foreground mt-1' }, `К рецепту: ${comment.recipeTitle}`)
      ])
    }
  },
  {
    accessorKey: 'author',
    header: 'Автор',
    cell: ({ row }) => {
      const comment = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { class: 'text-sm' }, comment.author?.username || '—')
      ])
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
    accessorKey: 'isHidden',
    header: 'Статус',
    cell: ({ row }) => {
      const isHidden = row.getValue('isHidden') as boolean
      return h(UBadge, {
        color: isHidden ? 'warning' : 'success',
        variant: 'subtle'
      }, () => isHidden ? 'Скрыт' : 'Виден')
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: {
      class: {
        th: 'text-right w-40',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const comment = row.original

      return h('div', { class: 'flex justify-end gap-1' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'info',
          variant: 'ghost',
          onClick: () => viewComment(comment)
        }),
        !comment.isHidden
          ? h(UButton, {
              icon: 'i-lucide-eye-off',
              size: 'sm',
              color: 'warning',
              variant: 'ghost',
              onClick: () => hideComment(comment)
            })
          : h(UButton, {
              icon: 'i-lucide-eye',
              size: 'sm',
              color: 'success',
              variant: 'ghost',
              onClick: () => showComment(comment)
            }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => deleteComment(comment)
        })
      ])
    }
  }
]

// Загрузка при монтировании
onMounted(() => {
  loadCommentsQueue()
})

// Обработчик изменения страницы
watch([currentPage, pageSize, filterType], () => {
  loadCommentsQueue()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Модерация комментариев</h1>
        <p class="text-muted-foreground mt-1">
          Управление комментариями пользователей
          <span v-if="totalCount > 0" class="ml-2 text-sm">
            ({{ totalCount }} на модерации)
          </span>
        </p>
      </div>

      <UButton
        color="primary"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="isLoading"
        @click="loadCommentsQueue"
      >
        Обновить
      </UButton>
    </div>

    <!-- Фильтры -->
    <UCard>
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Поиск по тексту или автору..."
          icon="i-lucide-search"
          class="flex-1"
          @update:model-value="handleSearch"
        />

        <USelect
          :model-value="filterType"
          :items="[
            { label: 'Все', value: 'all' },
            { label: 'Скрытые', value: 'hidden' },
            { label: 'Видимые', value: 'visible' }
          ]"
          class="w-48"
          @update:model-value="handleFilter"
        />
      </div>
    </UCard>

    <!-- Таблица -->
    <UCard>
      <UTable
        :data="comments"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="text-center py-8">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">Нет комментариев на модерации</p>
            <p class="text-sm text-muted-foreground mt-1">Все комментарии проверены</p>
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

    <!-- Модалка просмотра комментария -->
    <UModal
      v-model:open="isViewModalOpen"
      :ui="{ content: 'max-w-lg w-full' }"
    >
      <template #content>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Просмотр комментария</h2>
            <UButton
              variant="ghost"
              icon="i-lucide-x"
              @click="isViewModalOpen = false"
            />
          </div>

          <div v-if="selectedComment" class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">Автор</h3>
              <div class="flex items-center gap-2 mt-1">
                <UAvatar
                  :src="selectedComment.author?.avatar ? `${config.public.apiUrl}${selectedComment.author.avatar}` : undefined"
                  :alt="selectedComment.author?.username"
                  size="sm"
                />
                <span class="font-medium">{{ selectedComment.author?.username }}</span>
                <span class="text-sm text-muted-foreground">({{ selectedComment.author?.email }})</span>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-muted-foreground">Рецепт</h3>
              <p class="text-sm mt-1">{{ selectedComment.recipeTitle || '—' }}</p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-muted-foreground">Текст комментария</h3>
              <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-sm whitespace-pre-wrap">{{ selectedComment.text }}</p>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-muted-foreground">Статус</h3>
              <UBadge
                :color="selectedComment.isHidden ? 'warning' : 'success'"
                variant="subtle"
                class="mt-1"
              >
                {{ selectedComment.isHidden ? 'Скрыт' : 'Виден' }}
              </UBadge>
            </div>

            <div>
              <h3 class="text-sm font-medium text-muted-foreground">Дата создания</h3>
              <p class="text-sm mt-1">{{ formatDate(selectedComment.createdAt) }}</p>
            </div>

            <!-- Действия -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isViewModalOpen = false"
              >
                Закрыть
              </UButton>

              <UButton
                v-if="!selectedComment.isHidden"
                color="warning"
                variant="outline"
                :loading="isProcessing"
                @click="hideComment(selectedComment); isViewModalOpen = false"
              >
                Скрыть
              </UButton>

              <UButton
                v-if="selectedComment.isHidden"
                color="success"
                :loading="isProcessing"
                @click="showComment(selectedComment); isViewModalOpen = false"
              >
                Показать
              </UButton>

              <UButton
                color="error"
                variant="outline"
                :loading="isProcessing"
                @click="deleteComment(selectedComment); isViewModalOpen = false"
              >
                Удалить
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
