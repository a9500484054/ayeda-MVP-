
<template>
  <div class="space-y-8">
    <!-- Приветствие -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p class="text-muted mt-1">
          Добро пожаловать в панель управления АуЕда
          <span v-if="dashboardData" class="text-xs text-muted ml-2">
            (обновлено: {{ new Date().toLocaleTimeString('ru-RU') }})
          </span>
        </p>
      </div>
      <UButton
        color="primary"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="isRefreshing"
        :disabled="isLoading"
        @click="fetchDashboardData(false)"
        class="whitespace-nowrap"
      >
        {{ isRefreshing ? 'Обновление...' : 'Обновить данные' }}
      </UButton>
    </div>

    <!-- Статистика -->
    <div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <!-- Скелетон загрузки -->
      <UCard
        v-for="i in 6"
        :key="`skeleton-${i}`"
        v-if="isLoading && !dashboardData"
        class="animate-pulse"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-2">
            <USkeleton class="h-4 w-20 rounded" />
            <USkeleton class="h-8 w-12 rounded" />
            <USkeleton class="h-3 w-8 rounded" />
          </div>
          <USkeleton class="h-8 w-8 rounded" />
        </div>
      </UCard>

      <!-- Реальные данные -->
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-muted truncate">{{ stat.label }}</span>
            <span class="text-2xl font-bold">{{ stat.value }}</span>
            <UTrend :value="stat.trend" class="text-xs" />
          </div>
          <UIcon :name="stat.icon" class="size-8 text-muted flex-shrink-0" />
        </div>
      </UCard>
    </div>

    <!-- Ошибка -->
    <UAlert
      v-if="error && !isLoading"
      color="error"
      variant="solid"
      title="Ошибка загрузки"
      :description="error"
      icon="i-lucide-alert-circle"
      class="mb-4"
      close-button
      @close="error = null"
    />

    <!-- Последние рецепты на модерации -->
    <UCard>
      <template #header>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            Рецепты на модерации
            <span v-if="dashboardData" class="text-sm font-normal text-muted">
              ({{ dashboardData.pendingModeration || 0 }} на проверке)
            </span>
          </h2>
          <UButton to="/admin/moderate/recipes" variant="link" size="sm">
            Все рецепты
            <UIcon name="i-lucide-arrow-right" class="ms-1 size-3" />
          </UButton>
        </div>
      </template>

      <!-- Скелетон таблицы -->
      <div v-if="isLoading" class="space-y-3">
        <USkeleton v-for="i in 3" :key="`table-skeleton-${i}`" class="h-12 w-full rounded" />
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="recentRecipes.length === 0" class="py-12 text-center">
        <UIcon name="i-lucide-inbox" class="h-12 w-12 text-muted mx-auto mb-3" />
        <p class="text-muted font-medium">Нет рецептов на модерации</p>
        <p class="text-sm text-muted mt-1">Все рецепты проверены</p>
      </div>

      <!-- Таблица -->
      <UTable
        v-else
        :rows="recentRecipes"
        :columns="columns"
        class="w-full"
      >
        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            variant="subtle"
          >
            {{ getStatusLabel(row.status) }}
          </UBadge>
        </template>

        <template #date-data="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </UTable>
    </UCard>

    <!-- Дополнительная информация (краткие итоги) -->
    <div v-if="dashboardData" class="grid gap-4 grid-cols-1 md:grid-cols-3">
      <UCard class="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-800">
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-2.5">
            <UIcon name="i-lucide-users" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p class="text-sm text-muted">Пользователей</p>
            <p class="text-xl font-bold">{{ dashboardData.totalUsers || 0 }}</p>
          </div>
        </div>
      </UCard>

      <UCard class="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800">
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2.5">
            <UIcon name="i-lucide-utensils" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-muted">Всего рецептов</p>
            <p class="text-xl font-bold">{{ dashboardData.totalRecipes || 0 }}</p>
          </div>
        </div>
      </UCard>

      <UCard class="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800">
        <div class="flex items-center gap-3">
          <div class="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2.5">
            <UIcon name="i-lucide-message-circle" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-muted">Комментариев</p>
            <p class="text-xl font-bold">{{ dashboardData.totalComments || 0 }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<!-- apps/frontend/app/pages/admin/index.vue -->
<script setup lang="ts">
import { useDashboardApi, type DashboardData } from '~/composables/useDashboardApi'

definePageMeta({
  layout: 'admin',
  title: 'Дашборд'
})

const toast = useToast()
const dashboardApi = useDashboardApi()

// Состояние
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref<string | null>(null)
const dashboardData = ref<DashboardData | null>(null)

// Колонки для таблицы
const columns = [
  { id: 'title', key: 'title', label: 'Название' },
  { id: 'author', key: 'author', label: 'Автор' },
  { id: 'date', key: 'date', label: 'Дата' },
  { id: 'status', key: 'status', label: 'Статус' },
]

// Загрузка данных дашборда
const fetchDashboardData = async (showLoading = true) => {
  if (showLoading) {
    isLoading.value = true
  } else {
    isRefreshing.value = true
  }

  error.value = null

  try {
    const data = await dashboardApi.getDashboard()
    dashboardData.value = data

    console.log('✅ Dashboard data loaded:', data)
  } catch (err: any) {
    console.error('❌ Error loading dashboard:', err)
    error.value = err.message || 'Не удалось загрузить данные дашборда'

    // Показываем тост только при ошибке
    toast.add({
      title: 'Ошибка загрузки',
      description: error.value,
      color: 'error',
      timeout: 5000
    })
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Получение цвета статуса для бейджа
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    moderation: 'warning',
    published: 'success',
    draft: 'neutral',
    rejected: 'error'
  }
  return map[status] || 'neutral'
}

// Получение текста статуса
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    moderation: 'На модерации',
    published: 'Опубликован',
    draft: 'Черновик',
    rejected: 'Отклонен'
  }
  return map[status] || status
}

// Статистика для отображения
const stats = computed(() => {
  if (!dashboardData.value) return []

  const data = dashboardData.value

  // Используем stats из API если есть, иначе собираем из других полей
  if (data.stats && data.stats.length > 0) {
    return data.stats
  }

  // Fallback - собираем статистику из отдельных полей
  return [
    {
      label: 'Рецептов на модерации',
      value: data.pendingModeration || 0,
      icon: 'i-lucide-clock',
      trend: '+0',
      color: 'warning'
    },
    {
      label: 'Всего рецептов',
      value: data.totalRecipes || 0,
      icon: 'i-lucide-utensils',
      trend: '+0',
      color: 'info'
    },
    {
      label: 'Пользователей',
      value: data.totalUsers || 0,
      icon: 'i-lucide-users',
      trend: '+0',
      color: 'success'
    },
    {
      label: 'Комментариев',
      value: data.totalComments || 0,
      icon: 'i-lucide-message-circle',
      trend: '+0',
      color: 'secondary'
    },
    {
      label: 'Ингредиентов',
      value: data.totalIngredients || 0,
      icon: 'i-lucide-carrot',
      trend: '+0',
      color: 'primary'
    },
    {
      label: 'Категорий',
      value: data.totalCategories || 0,
      icon: 'i-lucide-tags',
      trend: '+0',
      color: 'neutral'
    }
  ]
})

// Последние рецепты
const recentRecipes = computed(() => {
  return dashboardData.value?.recentRecipes || []
})

// Загрузка данных при монтировании
onMounted(() => {
  fetchDashboardData(true)
})

// Автообновление каждые 60 секунд
let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!isLoading.value && !isRefreshing.value) {
      fetchDashboardData(false)
    }
  }, 60000) // 60 секунд
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})
</script>

