<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-6xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">ViewToggle - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          ViewToggle - универсальный компонент для переключения между вариантами отображения (сетка/список, день/неделя/месяц и т.д.)
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">modelValue</code> - текущее значение (обязательно)</li>
            <li><code class="bg-gray-200 px-1 rounded">options</code> - массив опций (value, title, label, icon, disabled)</li>
            <li><code class="bg-gray-200 px-1 rounded">size</code> - размер (sm, md, lg)</li>
            <li><code class="bg-gray-200 px-1 rounded">showLabels</code> - показывать текстовые метки</li>
            <li><code class="bg-gray-200 px-1 rounded">disabled</code> - отключить весь компонент</li>
          </ul>
        </div>
      </div>

      <!-- Примеры -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 1. Стандартный (сетка/список) -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Стандартный</h3>
          <p class="text-gray-500 text-sm mb-4">Сетка / Список</p>
          <ViewToggle
            v-model="viewMode"
            :options="viewOptions"
          />
          <p class="text-sm text-gray-500 mt-3">Текущий режим: {{ viewMode }}</p>
        </div>

        <!-- 2. С текстовыми метками -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">С метками</h3>
          <p class="text-gray-500 text-sm mb-4">Показывает текст вместо иконок</p>
          <ViewToggle
            v-model="viewWithLabels"
            :options="viewOptionsWithLabels"
            show-labels
          />
          <p class="text-sm text-gray-500 mt-3">Выбрано: {{ viewWithLabels }}</p>
        </div>

        <!-- 3. Размеры -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Размеры</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">Small (sm)</p>
              <ViewToggle
                v-model="sizeSmall"
                :options="viewOptions"
                size="sm"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Medium (md) - по умолчанию</p>
              <ViewToggle
                v-model="sizeMedium"
                :options="viewOptions"
                size="md"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Large (lg)</p>
              <ViewToggle
                v-model="sizeLarge"
                :options="viewOptions"
                size="lg"
              />
            </div>
          </div>
        </div>

        <!-- 4. Отключенный -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Отключенный</h3>
          <p class="text-gray-500 text-sm mb-4">Весь компонент disabled</p>
          <ViewToggle
            v-model="disabledValue"
            :options="viewOptions"
            disabled
          />
        </div>

        <!-- 5. С отключенной опцией -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">С отключенной опцией</h3>
          <p class="text-gray-500 text-sm mb-4">Опция "Список" отключена</p>
          <ViewToggle
            v-model="disabledOptionValue"
            :options="viewOptionsWithDisabled"
          />
          <p class="text-sm text-gray-500 mt-3">Текущий режим: {{ disabledOptionValue }}</p>
        </div>

        <!-- 6. Три опции (день/неделя/месяц) -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Три опции</h3>
          <p class="text-gray-500 text-sm mb-4">День / Неделя / Месяц</p>
          <ViewToggle
            v-model="periodMode"
            :options="periodOptions"
          />
          <p class="text-sm text-gray-500 mt-3">Выбран период: {{ periodMode }}</p>
        </div>

        <!-- 7. Четыре опции -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Четыре опции</h3>
          <p class="text-gray-500 text-sm mb-4">Сортировка по: названию, дате, популярности, рейтингу</p>
          <ViewToggle
            v-model="sortMode"
            :options="sortOptions"
            show-labels
          />
          <p class="text-sm text-gray-500 mt-3">Сортировка: {{ sortMode }}</p>
        </div>

        <!-- 8. Кастомные цвета -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Кастомные цвета</h3>
          <p class="text-gray-500 text-sm mb-4">Синяя цветовая схема</p>
          <ViewToggle
            v-model="customColorValue"
            :options="viewOptions"
            active-button-class="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800"
          />
        </div>

        <!-- 9. С только иконками и большими -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Только иконки, крупные</h3>
          <p class="text-gray-500 text-sm mb-4">Large размер, без меток</p>
          <ViewToggle
            v-model="largeIconValue"
            :options="viewOptions"
            size="lg"
          />
        </div>

        <!-- 10. Кастомный компонент (свой набор) -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Кастомные опции</h3>
          <p class="text-gray-500 text-sm mb-4">Редактировать / Просмотр / Администрирование</p>
          <ViewToggle
            v-model="customMode"
            :options="customOptions"
            show-labels
            size="lg"
          />
          <p class="text-sm text-gray-500 mt-3">Режим: {{ customMode }}</p>
        </div>
      </div>

      <!-- Пример использования в реальном контексте -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Пример в реальном контексте</h2>

        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Вид:</span>
            <ViewToggle
              v-model="demoViewMode"
              :options="viewOptions"
              size="sm"
            />
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Сортировка:</span>
            <ViewToggle
              v-model="demoSortMode"
              :options="demoSortOptions"
              show-labels
              size="sm"
            />
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Период:</span>
            <ViewToggle
              v-model="demoPeriodMode"
              :options="demoPeriodOptions"
              size="sm"
            />
          </div>
        </div>

        <!-- Контент -->
        <div class="space-y-4">
          <div class="text-sm text-gray-600">
            <p>Текущие настройки:</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Режим отображения: <strong>{{ demoViewMode === 'grid' ? 'Сетка' : 'Список' }}</strong></li>
              <li>Сортировка: <strong>{{ demoSortMode === 'name' ? 'По названию' : demoSortMode === 'date' ? 'По дате' : 'По рейтингу' }}</strong></li>
              <li>Период: <strong>{{ demoPeriodMode === 'day' ? 'День' : demoPeriodMode === 'week' ? 'Неделя' : 'Месяц' }}</strong></li>
            </ul>
          </div>

          <!-- Демо-сетка -->
          <div :class="demoViewMode === 'grid' ? 'grid grid-cols-3 gap-3' : 'space-y-2'">
            <div
              v-for="i in 6"
              :key="i"
              class="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-600"
            >
              Элемент {{ i }}
            </div>
          </div>
        </div>
      </div>

      <!-- Лог событий -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог событий</h2>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded"
            :class="{
              'text-blue-600': log.type === 'change',
              'text-green-600': log.type === 'click'
            }"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не происходило
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
import { ref, watch } from 'vue'
import ViewToggle from './ViewToggle.vue'
import Button from '../button/Button.vue'

// Типы опций
interface Log {
  id: number
  message: string
  timestamp: string
  type: 'change' | 'click'
}

// Лог
const logs = ref<Log[]>([])
let nextId = 1

const addLog = (message: string, type: 'change' | 'click' = 'change') => {
  logs.value.unshift({
    id: nextId++,
    message,
    timestamp: new Date().toLocaleTimeString(),
    type
  })
  if (logs.value.length > 30) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

// 1. Стандартный
const viewMode = ref('grid')
const viewOptions = [
  { value: 'grid', title: 'Сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', title: 'Список', icon: 'i-lucide-list' },
  { value: 'list1', title: 'Список', icon: 'i-lucide-list' },
  { value: 'list2', title: 'Список', icon: 'i-lucide-list' },
]

// 2. С метками
const viewWithLabels = ref('grid')
const viewOptionsWithLabels = [
  { value: 'grid', label: 'Сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', label: 'Список', icon: 'i-lucide-list' }
]

// 3. Размеры
const sizeSmall = ref('grid')
const sizeMedium = ref('grid')
const sizeLarge = ref('grid')

// 4. Отключенный
const disabledValue = ref('grid')

// 5. С отключенной опцией
const disabledOptionValue = ref('grid')
const viewOptionsWithDisabled = [
  { value: 'grid', title: 'Сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', title: 'Список', icon: 'i-lucide-list', disabled: true }
]

// 6. Три опции (период)
const periodMode = ref('week')
const periodOptions = [
  { value: 'day', title: 'День', icon: 'i-lucide-sun' },
  { value: 'week', title: 'Неделя', icon: 'i-lucide-calendar-days' },
  { value: 'month', title: 'Месяц', icon: 'i-lucide-calendar-month' }
]

// 7. Четыре опции (сортировка)
const sortMode = ref('name')
const sortOptions = [
  { value: 'name', label: 'Названию', icon: 'i-lucide-sort-asc' },
  { value: 'date', label: 'Дате', icon: 'i-lucide-calendar' },
  { value: 'popular', label: 'Популярности', icon: 'i-lucide-trending-up' },
  { value: 'rating', label: 'Рейтингу', icon: 'i-lucide-star' }
]

// 8. Кастомные цвета
const customColorValue = ref('grid')

// 9. Крупные иконки
const largeIconValue = ref('grid')

// 10. Кастомные опции
const customMode = ref('view')
const customOptions = [
  { value: 'edit', label: 'Редактировать', icon: 'i-lucide-edit-2' },
  { value: 'view', label: 'Просмотр', icon: 'i-lucide-eye' },
  { value: 'admin', label: 'Админ', icon: 'i-lucide-shield' }
]

// Демо-пример
const demoViewMode = ref('grid')
const demoSortMode = ref('name')
const demoPeriodMode = ref('week')

const demoSortOptions = [
  { value: 'name', label: 'Названию' },
  { value: 'date', label: 'Дате' },
  { value: 'rating', label: 'Рейтингу' }
]

const demoPeriodOptions = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' }
]

// Watch для логирования
watch(viewMode, (val) => addLog(`Режим отображения изменён: ${val}`))
watch(periodMode, (val) => addLog(`Период изменён: ${val === 'day' ? 'День' : val === 'week' ? 'Неделя' : 'Месяц'}`))
watch(sortMode, (val) => addLog(`Сортировка изменена: ${sortOptions.find(o => o.value === val)?.label}`))
watch(customMode, (val) => addLog(`Режим работы изменён: ${val}`))
watch(demoViewMode, (val) => addLog(`Демо-режим отображения: ${val}`))
watch(demoSortMode, (val) => addLog(`Демо-сортировка: ${demoSortOptions.find(o => o.value === val)?.label}`))
watch(demoPeriodMode, (val) => addLog(`Демо-период: ${val}`))
</script>
