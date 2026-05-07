<!-- apps/frontend/app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Дашборд' });

// Данные для статистики (заменить на реальные API запросы)
const stats = ref([
  { label: 'Рецептов на модерации', value: 12, icon: 'i-lucide-clock', trend: '+2', color: 'warning' },
  { label: 'Всего рецептов', value: 245, icon: 'i-lucide-utensils', trend: '+15', color: 'info' },
  { label: 'Пользователей', value: 1280, icon: 'i-lucide-users', trend: '+48', color: 'success' },
  { label: 'Комментариев', value: 892, icon: 'i-lucide-message-circle', trend: '+67', color: 'secondary' },
  { label: 'Ингредиентов', value: 1560, icon: 'i-lucide-carrot', trend: '+23', color: 'primary' },
  { label: 'Категорий', value: 24, icon: 'i-lucide-tags', trend: '+3', color: 'neutral' },
]);

// Последние рецепты (заглушка)
const recentRecipes = ref([
  { id: 1, title: 'Борщ с пампушками', author: 'Анна Петрова', status: 'moderation', date: '2024-01-15' },
  { id: 2, title: 'Оливье по-домашнему', author: 'Иван Сидоров', status: 'published', date: '2024-01-14' },
  { id: 3, title: 'Салат Цезарь', author: 'Мария Иванова', status: 'moderation', date: '2024-01-14' },
]);

// Исправленное определение колонок с уникальными id
const columns = [
  { id: 'title', key: 'title', label: 'Название' },
  { id: 'author', key: 'author', label: 'Автор' },
  { id: 'date', key: 'date', label: 'Дата' },
  { id: 'status', key: 'status', label: 'Статус' },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Приветствие -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p class="text-muted mt-1">Добро пожаловать в панель управления Ayeda</p>
      </div>
      <UButton color="primary" variant="outline" icon="i-lucide-download">
        Экспорт отчета
      </UButton>
    </div>

    <!-- Статистика -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <UCard v-for="stat in stats" :key="stat.label" class="hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-sm text-muted">{{ stat.label }}</span>
            <span class="text-2xl font-bold">{{ stat.value }}</span>
            <UTrend :value="stat.trend" class="text-xs" />
          </div>
          <UIcon :name="stat.icon" class="size-8 text-muted" />
        </div>
      </UCard>
    </div>

    <!-- Последние рецепты на модерации -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Рецепты на модерации</h2>
          <UButton to="/admin/moderation" variant="link" size="sm">
            Все рецепты
            <UIcon name="i-lucide-arrow-right" class="ms-1 size-3" />
          </UButton>
        </div>
      </template>

      <UTable
        :rows="recentRecipes"
        :columns="columns"
      >
        <template #status-data="{ row }">
          <UBadge :color="row.status === 'moderation' ? 'warning' : 'success'" variant="subtle">
            {{ row.status === 'moderation' ? 'На модерации' : 'Опубликован' }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
