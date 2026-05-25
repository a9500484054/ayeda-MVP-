<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">StepsList - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          StepsList - компонент для управления шагами приготовления с поддержкой drag & drop, изображений и валидации.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Возможности:</h3>
          <ul class="text-sm text-gray-600 space-y-1 grid grid-cols-2 gap-2">
            <li>✅ Добавление/удаление шагов</li>
            <li>✅ Drag & drop для сортировки</li>
            <li>✅ Загрузка изображений для шага</li>
            <li>✅ Автоматическая нумерация</li>
            <li>✅ Состояния ошибок</li>
            <li>✅ Отключенное состояние</li>
          </ul>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📌 Базовый</h3>
          <StepsList
            v-model="basicSteps"
            label="Шаги приготовления"
            hint="Перетаскивайте шаги для изменения порядка"
          />
          <p class="text-sm text-gray-500 mt-2">Шагов: {{ basicSteps.length }}</p>
        </div>

        <!-- С предзаполненными шагами -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 С шагами</h3>
          <StepsList
            v-model="prefilledSteps"
            label="Рецепт пасты"
          />
        </div>

        <!-- С изображениями -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🖼️ С изображениями</h3>
          <StepsList
            v-model="stepsWithImages"
            label="Шаги с фото"
            @upload-image="handleImageUpload"
          />
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ С ошибкой</h3>
          <StepsList
            v-model="errorSteps"
            label="Шаги"
            error="Добавьте хотя бы один шаг"
            required
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Disabled</h3>
          <StepsList
            v-model="disabledSteps"
            label="Заблокированные шаги"
            disabled
          />
        </div>

        <!-- С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 С подсказкой</h3>
          <StepsList
            v-model="hintSteps"
            label="Приготовление"
            hint="Опишите каждый шаг подробно"
          />
        </div>
      </div>

      <!-- Реальный пример - рецепт -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">🍝 Реальный пример - Паста Карбонара</h2>
        <StepsList
          v-model="recipeSteps"
          label="Шаги приготовления"
          @upload-image="handleRecipeImageUpload"
        />

        <div class="mt-4 pt-4 border-t border-gray-200">
          <h3 class="font-medium text-gray-700 mb-2">Текущие шаги:</h3>
          <div class="space-y-2">
            <div v-for="(step, idx) in recipeSteps" :key="idx" class="text-sm text-gray-600">
              <span class="font-medium">{{ idx + 1 }}.</span> {{ step.text?.substring(0, 100) }}...
            </div>
          </div>
        </div>
      </div>

      <!-- Лог событий -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📋 Лог событий</h2>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded"
            :class="{
              'text-blue-600': log.type === 'add',
              'text-red-600': log.type === 'remove',
              'text-green-600': log.type === 'reorder',
              'text-purple-600': log.type === 'image'
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
import { ref } from 'vue'
import StepsList from './StepsList.vue'
import Button from '../button/Button.vue'

// Базовые шаги
const basicSteps = ref([])

// Предзаполненные шаги
const prefilledSteps = ref([
  { id: 1, sort: 1, text: 'Вскипятить воду в большой кастрюле' },
  { id: 2, sort: 2, text: 'Добавить соль и пасту, варить согласно инструкции' },
  { id: 3, sort: 3, text: 'Пока варится паста, приготовить соус' }
])

// Шаги с изображениями
const stepsWithImages = ref([
  { id: 1, sort: 1, text: 'Подготовить ингредиенты', image: 'https://picsum.photos/id/127/200/200' },
  { id: 2, sort: 2, text: 'Нарезать овощи', image: null }
])

// Ошибка
const errorSteps = ref([])

// Disabled
const disabledSteps = ref([
  { id: 1, sort: 1, text: 'Шаг 1: Подготовка' },
  { id: 2, sort: 2, text: 'Шаг 2: Приготовление' }
])

// Подсказка
const hintSteps = ref([])

// Реальный рецепт
const recipeSteps = ref([
  { id: 1, sort: 1, text: 'Поставьте кастрюлю с водой на огонь. Доведите до кипения.' },
  { id: 2, sort: 2, text: 'Добавьте соль (1 столовая ложка на литр воды) и пасту.' },
  { id: 3, sort: 3, text: 'Пока варится паста, нарежьте бекон/гуанчиале мелкими кубиками.' },
  { id: 4, sort: 4, text: 'Обжарьте бекон на сухой сковороде до хрустящей корочки.' },
  { id: 5, sort: 5, text: 'В миске смешайте яйца, тертый сыр Пармезан, черный перец.' },
  { id: 6, sort: 6, text: 'Слейте воду из пасты, оставив немного (около стакана).' },
  { id: 7, sort: 7, text: 'Смешайте пасту с беконом, затем добавьте яичную смесь.' },
  { id: 8, sort: 8, text: 'Быстро перемешайте, добавляя немного воды от пасты.' },
  { id: 9, sort: 9, text: 'Подавайте сразу, посыпав дополнительным сыром и перцем.' }
])

// Лог
interface Log {
  id: number
  message: string
  timestamp: string
  type: 'add' | 'remove' | 'reorder' | 'image'
}
const logs = ref<Log[]>([])
let nextId = 1

const addLog = (message: string, type: Log['type'] = 'add') => {
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

// Обработчики загрузки изображений
const handleImageUpload = (file: File, index: number) => {
  addLog(`Загружено изображение для шага ${index + 1}: ${file.name}`, 'image')

  // Создаем локальный URL для превью
  const url = URL.createObjectURL(file)

  // В реальном приложении здесь был бы запрос к API
  // Имитируем обновление
  setTimeout(() => {
    stepsWithImages.value[index].image = url
    addLog(`Изображение добавлено к шагу ${index + 1}`, 'image')
  }, 500)
}

const handleRecipeImageUpload = (file: File, index: number) => {
  addLog(`[Рецепт] Загружено изображение для шага ${index + 1}: ${file.name}`, 'image')
  const url = URL.createObjectURL(file)
  recipeSteps.value[index].image = url
}

// Watch для отслеживания изменений (можно добавить в реальном приложении)
// watch(basicSteps, (newVal, oldVal) => {
//   if (newVal.length > oldVal.length) {
//     addLog(`Добавлен шаг. Всего: ${newVal.length}`, 'add')
//   } else if (newVal.length < oldVal.length) {
//     addLog(`Удален шаг. Всего: ${newVal.length}`, 'remove')
//   }
// })
</script>
