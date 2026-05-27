<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-7xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Loader - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          Loader - компонент для отображения состояния загрузки карточек рецептов.
          Поддерживает два режима отображения: сетка (grid) и список (list).
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">viewMode</code> - режим отображения: 'grid' или 'list'</li>
          </ul>
        </div>
      </div>

      <!-- Переключатель режимов -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700">Режим отображения:</span>
          <ViewToggle
            v-model="viewMode"
            :options="viewOptions"
            size="md"
          />
        </div>
        <div class="text-sm text-gray-500">
          Текущий режим: {{ viewMode === 'grid' ? 'Сетка' : 'Список' }}
        </div>
      </div>

      <!-- Демонстрация скелетонов -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {{ viewMode === 'grid' ? 'Сетка (Grid)' : 'Список (List)' }}
        </h2>
        <div :class="viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'"
        >
          <Loader
            v-for="i in 6"
            :key="i"
            :view-mode="viewMode"
          />
        </div>
      </div>

      <!-- Сравнение с реальными карточками -->
      <div class="mt-12">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Сравнение с реальными карточками</h2>
        <p class="text-gray-500 text-sm mb-4">
          Слева - скелетон, справа - реальная карточка с данными
        </p>

        <div :class="viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
          : 'space-y-4'"
        >
          <!-- Скелетон -->
          <Loader :view-mode="viewMode" />

          <!-- Реальная карточка -->
          <RecipeCard
            :recipe="sampleRecipe"
            :active-tab="'my'"
            :view-mode="viewMode"
          />
        </div>
      </div>

      <!-- Пример с кнопкой переключения -->
      <div class="mt-12 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Интерактивный пример</h2>
        <p class="text-gray-500 text-sm mb-4">
          Нажмите кнопку "Загрузить", чтобы увидеть скелетон во время загрузки
        </p>

        <div class="flex gap-3 mb-6">
          <Button @click="startLoading" :loading="isLoading">
            {{ isLoading ? 'Загрузка...' : 'Загрузить' }}
          </Button>
          <Button v-if="isLoading" variant="ghost" @click="cancelLoading">
            Отмена
          </Button>
        </div>

        <div v-if="isLoading" :class="viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'"
        >
          <Loader v-for="i in 3" :key="i" :view-mode="viewMode" />
        </div>

        <div v-else-if="loadedData.length > 0" :class="viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'"
        >
          <RecipeCard
            v-for="recipe in loadedData"
            :key="recipe.id"
            :recipe="recipe"
            :active-tab="'my'"
            :view-mode="viewMode"
          />
        </div>
      </div>

      <!-- Лог действий -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📋 Информация</h2>
        <div class="space-y-2">
          <div class="text-sm p-2 bg-gray-50 rounded text-gray-600">
            💡 Скелетон визуально повторяет структуру реальной карточки рецепта
          </div>
          <div class="text-sm p-2 bg-gray-50 rounded text-gray-600">
            💡 При переключении режима меняется layout скелетона
          </div>
          <div class="text-sm p-2 bg-gray-50 rounded text-gray-600">
            💡 Используется компонент USkeleton из Nuxt UI
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RecipeCard from '~/components/my-recipe/RecipeCard.vue'
import Button from '~/shared/ui/button/Button.vue'
import ViewToggle from '~/shared/ui/view-toggle/ViewToggle.vue'
import type { RecipeResponse } from '~/composables/useRecipesApi'

const viewMode = ref<'grid' | 'list'>('grid')
const isLoading = ref(false)
const loadedData = ref<RecipeResponse[]>([])

const viewOptions = [
  { value: 'grid', label: 'Сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', label: 'Список', icon: 'i-lucide-list' }
]

// Пример рецепта для сравнения
const sampleRecipe: RecipeResponse = {
  id: 'sample-1',
  title: 'Паста Карбонара',
  description: 'Классическая итальянская паста с беконом и яйцом',
  cookingTime: 25,
  servings: 4,
  calories: 850,
  difficulty: 'medium',
  status: 'public',
  type: 'personal',
  photo: { id: '1', src: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600' },
  video: null,
  steps: [],
  srcPath: 'pasta-carbonara',
  likes: 128,
  author: {
    id: '1',
    email: 'user@example.com',
    username: 'User',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  ingredients: [],
  categories: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString()
}

// Симуляция загрузки данных
let timeoutId: ReturnType<typeof setTimeout> | null = null

const startLoading = () => {
  isLoading.value = true
  loadedData.value = []

  timeoutId = setTimeout(() => {
    // Имитируем загруженные данные
    loadedData.value = [sampleRecipe, sampleRecipe, sampleRecipe]
    isLoading.value = false
    timeoutId = null
  }, 3000)
}

const cancelLoading = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isLoading.value = false
}
</script>
