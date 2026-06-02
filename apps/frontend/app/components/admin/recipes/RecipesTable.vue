<template>
  <UCard class="overflow-hidden">
    <UTable
      :data="recipes"
      :columns="columns"
      :loading="isLoading"
      class="w-full"
    >
      <template #empty-state>
        <div class="text-center py-8">
          <UIcon name="i-lucide-chef-hat" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p class="text-muted-foreground">Нет данных</p>
          <p class="text-sm text-muted-foreground mt-1">
            Добавьте первый рецепт
          </p>
        </div>
      </template>
    </UTable>

    <div v-if="totalPages > 1" class="flex items-center justify-between border-t px-4 py-4">
      <div class="text-sm text-muted-foreground">
        Показано {{ ((currentPage - 1) * pageSize) + 1 }} -
        {{ Math.min(currentPage * pageSize, totalRecipesCount) }} из {{ totalRecipesCount }}
      </div>
      <UPagination :page="currentPage" :items-per-page="pageSize" :total="totalRecipesCount" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const config = useRuntimeConfig()

const API_BASE_URL = config.public.apiBase

interface Props {
  recipes: any[]
  isLoading: boolean
  currentPage: number
  pageSize: number
  totalRecipesCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
  'edit': [recipe: any]
  'delete': [recipe: any]
  'view': [recipe: any]
}>()

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'neutral',
    private: 'warning',
    pending: 'info',
    public: 'success',
    rejected: 'error',
    active: 'success'
  }
  return colorMap[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    draft: 'Черновик',
    private: 'Приватный',
    pending: 'На модерации',
    public: 'Опубликован',
    rejected: 'Отклонен',
    active: 'Активен'
  }
  return labelMap[status] || status
}

const getDifficultyColor = (difficulty: string) => {
  const colorMap: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return colorMap[difficulty] || 'neutral'
}

const getDifficultyLabel = (difficulty: string) => {
  const labelMap: Record<string, string> = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно'
  }
  return labelMap[difficulty] || difficulty
}

const columns: TableColumn<any>[] = [
  {
    accessorKey: 'photo',
    header: 'Фото',
    cell: ({ row }) => {
      const photo = `${API_BASE_URL}${row.original.photo?.src}`
      return h('img', {
        src: photo || 'https://placehold.co/50x50?text=No+Image',
        class: 'w-10 h-10 object-cover rounded',
        alt: row.original.title
      })
    },
    meta: { class: { th: 'w-20', td: 'w-20' } }
  },
  {
    accessorKey: 'title',
    header: 'Название',
    meta: { class: { td: 'font-medium' } }
  },
  {
    accessorKey: 'difficulty',
    header: 'Сложность',
    cell: ({ row }) => {
      const difficulty = row.original.difficulty
      if (!difficulty) return '—'
      return h(UBadge, {
        color: getDifficultyColor(difficulty),
        variant: 'subtle'
      }, () => getDifficultyLabel(difficulty))
    }
  },
  {
    accessorKey: 'cookingTime',
    header: 'Время (мин)'
  },
  {
    accessorKey: 'servings',
    header: 'Порции'
  },
  {
    accessorKey: 'calories',
    header: 'Ккал'
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status || 'draft'
      return h(UBadge, {
        color: getStatusColor(status),
        variant: 'subtle'
      }, () => getStatusLabel(status))
    }
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: { class: { th: 'text-right w-32', td: 'text-right' } },
    cell: ({ row }) => {
      const recipe = row.original
      return h('div', { class: 'flex justify-end gap-2' }, [
        h(UButton, {
          icon: 'i-lucide-eye',
          size: 'sm',
          color: 'neutral',
          variant: 'ghost',
          onClick: () => emit('view', recipe)
        }),
        h(UButton, {
          icon: 'i-lucide-pencil',
          size: 'sm',
          color: 'primary',
          variant: 'ghost',
          onClick: () => emit('edit', recipe)
        }),
        h(UButton, {
          icon: 'i-lucide-trash-2',
          size: 'sm',
          color: 'error',
          variant: 'ghost',
          onClick: () => emit('delete', recipe)
        })
      ])
    }
  }
]

const totalPages = computed(() => Math.ceil(props.totalRecipesCount / props.pageSize))
</script>
