<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">ConfirmModal - Демонстрация</h1>

      <!-- Описание -->
      <div class="bg-white rounded-xl p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">О компоненте</h2>
        <p class="text-gray-600 mb-2">
          ConfirmModal - универсальное модальное окно для подтверждения действий.
        </p>
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">Параметры:</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><code class="bg-gray-200 px-1 rounded">open</code> - открыто/закрыто</li>
            <li><code class="bg-gray-200 px-1 rounded">title</code> - заголовок</li>
            <li><code class="bg-gray-200 px-1 rounded">description</code> - описание</li>
            <li><code class="bg-gray-200 px-1 rounded">confirmColor</code> - цвет кнопки (primary, danger, success, warning)</li>
            <li><code class="bg-gray-200 px-1 rounded">confirmText/cancelText</code> - текст кнопок</li>
            <li><code class="bg-gray-200 px-1 rounded">loading</code> - состояние загрузки</li>
          </ul>
        </div>
      </div>

      <!-- Примеры -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Primary -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Primary (по умолчанию)</h3>
          <p class="text-gray-600 text-sm mb-4">Для обычных подтверждений</p>
          <Button @click="openPrimaryModal">Открыть primary модалку</Button>
        </div>

        <!-- Danger -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Danger (опасное действие)</h3>
          <p class="text-gray-600 text-sm mb-4">Для удаления или необратимых действий</p>
          <Button color="danger" @click="openDangerModal">Открыть danger модалку</Button>
        </div>

        <!-- Success -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Success (успех)</h3>
          <p class="text-gray-600 text-sm mb-4">Для подтверждения позитивных действий</p>
          <Button color="success" @click="openSuccessModal">Открыть success модалку</Button>
        </div>

        <!-- Warning -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Warning (предупреждение)</h3>
          <p class="text-gray-600 text-sm mb-4">Для действий, требующих внимания</p>
          <Button color="warning" @click="openWarningModal">Открыть warning модалку</Button>
        </div>

        <!-- С кастомными текстами -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Кастомные тексты</h3>
          <p class="text-gray-600 text-sm mb-4">Свои тексты для кнопок</p>
          <Button @click="openCustomTextModal">Открыть с кастомными текстами</Button>
        </div>

        <!-- С загрузкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Состояние загрузки</h3>
          <p class="text-gray-600 text-sm mb-4">Кнопка становится disabled и показывает спиннер</p>
          <Button @click="openLoadingModal">Открыть с загрузкой</Button>
        </div>
      </div>

      <!-- Лог действий -->
      <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Лог действий</h2>
        <div class="space-y-2">
          <div
            v-for="log in logs"
            :key="log.id"
            class="text-sm p-2 bg-gray-50 rounded"
            :class="{
              'text-green-600': log.type === 'confirm',
              'text-red-600': log.type === 'cancel'
            }"
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

    <!-- Модальные окна -->
    <ConfirmModal
      :open="primaryModalOpen"
      title="Подтверждение"
      description="Вы уверены, что хотите выполнить это действие?"
      @update:open="primaryModalOpen = false"
      @confirm="handleConfirm('primary')"
    />

    <ConfirmModal
      :open="dangerModalOpen"
      title="Удаление"
      description="Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить."
      confirm-color="danger"
      confirm-text="Удалить"
      @update:open="dangerModalOpen = false"
      @confirm="handleConfirm('danger')"
    />

    <ConfirmModal
      :open="successModalOpen"
      title="Подтверждение"
      description="Вы уверены, что хотите опубликовать этот рецепт?"
      confirm-color="success"
      confirm-text="Опубликовать"
      @update:open="successModalOpen = false"
      @confirm="handleConfirm('success')"
    />

    <ConfirmModal
      :open="warningModalOpen"
      title="Внимание"
      description="Это действие может повлиять на другие данные. Продолжить?"
      confirm-color="warning"
      confirm-text="Продолжить"
      @update:open="warningModalOpen = false"
      @confirm="handleConfirm('warning')"
    />

    <ConfirmModal
      :open="customTextModalOpen"
      title="Сохранение"
      description="Вы уверены, что хотите сохранить изменения?"
      confirm-text="Да, сохранить"
      cancel-text="Нет, отменить"
      @update:open="customTextModalOpen = false"
      @confirm="handleConfirm('custom')"
    />

    <ConfirmModal
      :open="loadingModalOpen"
      title="Долгое действие"
      description="Это действие может занять некоторое время. Продолжить?"
      :loading="isLoading"
      @update:open="handleLoadingModalClose"
      @confirm="handleLoadingConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModal from './ConfirmModal.vue'
import Button from '../button/Button.vue'

interface Log {
  id: number
  message: string
  type: 'confirm' | 'cancel'
}

const logs = ref<Log[]>([])
let nextId = 1

// Primary
const primaryModalOpen = ref(false)
const openPrimaryModal = () => { primaryModalOpen.value = true }

// Danger
const dangerModalOpen = ref(false)
const openDangerModal = () => { dangerModalOpen.value = true }

// Success
const successModalOpen = ref(false)
const openSuccessModal = () => { successModalOpen.value = true }

// Warning
const warningModalOpen = ref(false)
const openWarningModal = () => { warningModalOpen.value = true }

// Custom text
const customTextModalOpen = ref(false)
const openCustomTextModal = () => { customTextModalOpen.value = true }

// Loading
const loadingModalOpen = ref(false)
const isLoading = ref(false)

const openLoadingModal = () => {
  loadingModalOpen.value = true
  isLoading.value = false
}

const handleLoadingModalClose = (value: boolean) => {
  if (!isLoading.value) {
    loadingModalOpen.value = value
  }
}

const handleLoadingConfirm = () => {
  isLoading.value = true

  // Симулируем асинхронное действие
  setTimeout(() => {
    addLog('Долгое действие выполнено (success)', 'confirm')
    isLoading.value = false
    loadingModalOpen.value = false
  }, 2000)
}

const handleConfirm = (type: string) => {
  addLog(`Подтверждено: ${type}`, 'confirm')

  // Закрываем все модалки
  primaryModalOpen.value = false
  dangerModalOpen.value = false
  successModalOpen.value = false
  warningModalOpen.value = false
  customTextModalOpen.value = false
}

const addLog = (message: string, type: 'confirm' | 'cancel') => {
  logs.value.unshift({
    id: nextId++,
    message: `[${new Date().toLocaleTimeString()}] ${message}`,
    type
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
