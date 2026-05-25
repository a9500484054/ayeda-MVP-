<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">EmptyState - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          EmptyState - компонент для отображения пустого состояния (нет данных, ничего не найдено и т.д.)
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">title</code> - заголовок (обязательно)</li>
            <li><code class="bg-gray-200 px-1 rounded">description</code> - описание</li>
            <li><code class="bg-gray-200 px-1 rounded">icon</code> - иконка (по умолчанию i-lucide-inbox)</li>
            <li><code class="bg-gray-200 px-1 rounded">actionText</code> - текст кнопки действия</li>
            <li><code class="bg-gray-200 px-1 rounded">@action</code> - событие при клике на кнопку</li>
          </ul>
        </div>
      </div>

      <!-- Примеры -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Стандартный -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">Стандартный</h3>
            <p class="text-sm text-gray-500">Базовая версия без кнопки</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Нет данных"
              description="Здесь пока ничего нет. Добавьте первый элемент."
            />
          </div>
        </div>

        <!-- С иконкой -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">Кастомная иконка</h3>
            <p class="text-sm text-gray-500">Своя иконка вместо стандартной</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Нет рецептов"
              description="У вас пока нет рецептов. Создайте свой первый рецепт!"
              icon="i-lucide-cooking-pot"
            />
          </div>
        </div>

        <!-- С кнопкой действия -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">С кнопкой действия</h3>
            <p class="text-sm text-gray-500">С призывом к действию</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Нет избранных рецептов"
              description="Добавляйте рецепты в избранное, чтобы они появлялись здесь"
              icon="i-lucide-star"
              action-text="Смотреть рецепты"
              @action="handleAction('избранное')"
            />
          </div>
        </div>

        <!-- Поиск не дал результатов -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">Поиск не дал результатов</h3>
            <p class="text-sm text-gray-500">При поиске и фильтрации</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Рецепты не найдены"
              description="Попробуйте изменить поисковый запрос или фильтры"
              icon="i-lucide-search"
              action-text="Очистить поиск"
              @action="handleAction('очистить поиск')"
            />
          </div>
        </div>

        <!-- Ошибка -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">Ошибка</h3>
            <p class="text-sm text-gray-500">При ошибке загрузки данных</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Ошибка загрузки"
              description="Не удалось загрузить данные. Попробуйте позже."
              icon="i-lucide-alert-circle"
              action-text="Повторить попытку"
              @action="handleAction('повторить попытку')"
            />
          </div>
        </div>

        <!-- С кастомным слотом -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <h3 class="font-semibold text-gray-900">Кастомный слот</h3>
            <p class="text-sm text-gray-500">С произвольным содержимым вместо кнопки</p>
          </div>
          <div class="p-4">
            <EmptyState
              title="Приглашаем к сотрудничеству"
              description="Станьте частью нашего сообщества"
              icon="i-lucide-users"
            >
              <template #actions>
                <div class="flex gap-3 mt-6">
                  <Button size="sm" variant="outline" @click="handleAction('узнать больше')">
                    Узнать больше
                  </Button>
                  <Button size="sm" color="primary" @click="handleAction('присоединиться')">
                    Присоединиться
                  </Button>
                </div>
              </template>
            </EmptyState>
          </div>
        </div>
      </div>

      <!-- Лог действий -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог действий</h2>
        <div class="space-y-2">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не выбрано
          </div>
        </div>
        <Button v-if="logs.length" size="sm" variant="ghost" class="mt-4" @click="clearLogs">
          Очистить лог
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from './EmptyState.vue'
import Button from '../button/Button.vue'

interface Log {
  id: number
  message: string
}

const logs = ref<Log[]>([])
let nextId = 1

const handleAction = (action: string) => {
  logs.value.unshift({
    id: nextId++,
    message: `[${new Date().toLocaleTimeString()}] Нажата кнопка: ${action}`
  })

  // Ограничиваем лог 20 записями
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}
</script>
