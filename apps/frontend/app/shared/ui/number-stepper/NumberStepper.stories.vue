<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">NumberStepper - Демонстрация</h1>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📌 Базовый</h3>
          <NumberStepper v-model="basicValue" unit="порций" />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ basicValue }}</p>
        </div>

        <!-- С кастомными границами -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 С границами</h3>
          <NumberStepper v-model="boundedValue" :min="2" :max="10" unit="шт" />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ boundedValue }} (мин 2, макс 10)</p>
        </div>

        <!-- С шагом 0.5 -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚡ С шагом 0.5</h3>
          <NumberStepper v-model="stepValue" :step="0.5" :allow-decimal="true" unit="кг" />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ stepValue }}</p>
        </div>

        <!-- Режим только чтение -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Только чтение</h3>
          <NumberStepper v-model="readonlyValue" :readonly="true" unit="порций" />
        </div>

        <!-- Отключенный -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⛔ Отключенный</h3>
          <NumberStepper v-model="disabledValue" :disabled="true" unit="порций" />
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ С ошибкой</h3>
          <NumberStepper v-model="errorValue" unit="порций" error="Значение должно быть в диапазоне" />
        </div>

        <!-- Режим редактирования -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">✏️ Режим редактирования</h3>
          <NumberStepper v-model="editableValue" :editable="true" unit="порций" />
          <p class="text-sm text-gray-500 mt-2">Можно ввести число в поле</p>
        </div>

        <!-- С переключателем целые/десятичные -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔄 Целые/Десятичные</h3>
          <NumberStepper v-model="toggleValue" :show-integer-toggle="true" :allow-decimal="true" unit="кг" />
          <p class="text-sm text-gray-500 mt-2">Значение: {{ toggleValue }}</p>
        </div>
      </div>

      <!-- Пример с порциями рецепта -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">🍳 Пример: Регулировка порций</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600">Количество порций:</p>
            <NumberStepper v-model="servings" unit="порций" :min="1" :max="20" />
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Ингредиенты будут пересчитаны</p>
            <p class="text-emerald-600 font-medium">Множитель: {{ multiplier }}x</p>
          </div>
        </div>

        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600">Исходный рецепт (4 порции):</p>
          <ul class="mt-2 space-y-1 text-sm">
            <li>Мука: 500г → {{ (500 * multiplier).toFixed(0) }}г</li>
            <li>Сахар: 200г → {{ (200 * multiplier).toFixed(0) }}г</li>
            <li>Яйца: 3шт → {{ (3 * multiplier).toFixed(0) }}шт</li>
          </ul>
        </div>
      </div>

      <!-- Лог изменений -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📋 Лог изменений</h2>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не изменялось
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
import { ref, computed, watch } from 'vue'
import NumberStepper from './NumberStepper.vue'
import Button from '../button/Button.vue'

const basicValue = ref(4)
const boundedValue = ref(5)
const stepValue = ref(1.5)
const readonlyValue = ref(3)
const disabledValue = ref(2)
const errorValue = ref(0)
const editableValue = ref(4)
const toggleValue = ref(1.5)
const servings = ref(4)

const multiplier = computed(() => servings.value / 4)

interface Log {
  id: number
  message: string
  timestamp: string
}
const logs = ref<Log[]>([])
let nextId = 1

const addLog = (message: string) => {
  logs.value.unshift({
    id: nextId++,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
  if (logs.value.length > 20) {
    logs.value.pop()
  }
}

const clearLogs = () => {
  logs.value = []
}

watch(basicValue, (val) => addLog(`Базовый изменён: ${val}`))
watch(boundedValue, (val) => addLog(`С границами изменён: ${val}`))
watch(stepValue, (val) => addLog(`С шагом 0.5 изменён: ${val}`))
watch(editableValue, (val) => addLog(`Редактируемый изменён: ${val}`))
watch(toggleValue, (val) => addLog(`С переключателем изменён: ${val}`))
watch(servings, (val) => addLog(`Порции изменены: ${val}`))
</script>
