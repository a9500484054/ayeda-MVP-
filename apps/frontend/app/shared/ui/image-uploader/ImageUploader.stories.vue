<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">ImageUploader - Демонстрация</h1>

      <!-- Описание компонента -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          ImageUploader - компонент для загрузки изображений с превью, валидацией и поддержкой drag & drop.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Возможности:</h3>
          <ul class="text-sm text-gray-600 space-y-1 grid grid-cols-2 gap-2">
            <li>✅ Клик для загрузки</li>
            <li>✅ Drag & Drop</li>
            <li>✅ Превью изображения</li>
            <li>✅ Валидация типа и размера</li>
            <li>✅ Состояния загрузки</li>
            <li>✅ Удаление изображения</li>
          </ul>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Базовый с drag & drop -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📌 Drag & Drop</h3>
          <ImageUploader
            v-model="basicImage"
            label="Обложка"
            hint="Перетащите изображение или нажмите для выбора"
            @upload="handleUpload"
          />
          <p class="text-sm text-gray-500 mt-2">Статус: {{ basicImage ? 'Изображение загружено' : 'Нет изображения' }}</p>
        </div>

        <!-- С превью -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🖼️ С превью</h3>
          <ImageUploader
            v-model="previewImage"
            label="Аватар"
            :image-class="'h-32 w-32 rounded-full object-cover mx-auto'"
            @upload="handleUpload"
          />
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ С ошибкой</h3>
          <ImageUploader
            v-model="errorImage"
            label="Фото профиля"
            error="Неверный формат файла"
            @upload="handleUpload"
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Disabled</h3>
          <ImageUploader
            v-model="disabledImage"
            label="Заблокировано"
            disabled
            @upload="handleUpload"
          />
        </div>

        <!-- Загрузка -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⏳ Состояние загрузки</h3>
          <ImageUploader
            v-model="loadingImage"
            label="Загрузка..."
            :loading="isUploading"
            @upload="simulateUpload"
          />
          <Button
            v-if="!isUploading"
            size="sm"
            class="mt-3"
            @click="simulateUploadStart"
          >
            Симулировать загрузку
          </Button>
        </div>

        <!-- Кастомные размеры -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📐 Кастомные размеры</h3>
          <ImageUploader
            v-model="customSizeImage"
            label="Баннер"
            image-class="h-48 w-full object-cover"
            hint="Рекомендуемый размер: 1200x400"
            @upload="handleUpload"
          />
        </div>
      </div>

      <!-- Лог загрузок -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📋 Лог загрузок</h2>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded text-blue-600"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
          <div v-if="logs.length === 0" class="text-gray-400 text-sm">
            Ничего не загружалось
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
import ImageUploader from './ImageUploader.vue'
import Button from '../button/Button.vue'

// Состояния для разных примеров
const basicImage = ref(null)
const previewImage = ref(null)
const errorImage = ref(null)
const disabledImage = ref({ id: '1', src: 'https://picsum.photos/id/1015/400/300' })
const loadingImage = ref(null)
const customSizeImage = ref(null)

// Состояние загрузки
const isUploading = ref(false)

// Лог
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

// Обработчики загрузки
const handleUpload = (file: File) => {
  addLog(`Загружен файл: ${file.name} (${(file.size / 1024).toFixed(2)} KB) - способ: ${file.type}`)

  // Создаем локальный URL для превью
  const url = URL.createObjectURL(file)

  // Обновляем соответствующее состояние в зависимости от того, какой загрузчик вызвал
  if (basicImage.value === null) {
    basicImage.value = { id: 'temp', src: url }
  } else if (previewImage.value === null) {
    previewImage.value = { id: 'temp', src: url }
  } else if (customSizeImage.value === null) {
    customSizeImage.value = { id: 'temp', src: url }
  }

  addLog(`Превью создано для: ${file.name}`)
}

const simulateUploadStart = () => {
  isUploading.value = true
  addLog('Начата симуляция загрузки...')

  setTimeout(() => {
    isUploading.value = false
    loadingImage.value = { id: 'demo', src: 'https://picsum.photos/id/100/400/300' }
    addLog('Симуляция загрузки завершена')
  }, 2000)
}

const simulateUpload = (file: File) => {
  isUploading.value = true
  addLog(`Загрузка: ${file.name}`)

  setTimeout(() => {
    isUploading.value = false
    loadingImage.value = { id: 'demo', src: URL.createObjectURL(file) }
    addLog(`Загрузка завершена: ${file.name}`)
  }, 2000)
}
</script>
