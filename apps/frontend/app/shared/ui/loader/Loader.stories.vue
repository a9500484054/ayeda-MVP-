<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Loader - Демонстрация</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Размеры -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Размеры</h3>
          <div class="flex items-center gap-6 flex-wrap">
            <Loader size="xs" />
            <Loader size="sm" />
            <Loader size="md" />
            <Loader size="lg" />
            <Loader size="xl" />
            <Loader :size="48" />
          </div>
        </div>

        <!-- Цвета -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Цвета</h3>
          <div class="flex items-center gap-6 flex-wrap">
            <Loader color="primary" />
            <Loader color="secondary" />
            <Loader color="gray" />
            <div class="bg-gray-800 p-2 rounded">
              <Loader color="white" />
            </div>
          </div>
        </div>

        <!-- С текстом -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С текстом</h3>
          <div class="space-y-4">
            <Loader text="Загрузка..." />
            <Loader text="Сохранение..." color="primary" />
          </div>
        </div>

        <!-- На всю ширину -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">На всю ширину</h3>
          <Loader full-width text="Загрузка данных..." />
        </div>

        <!-- Пример с кнопкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm md:col-span-2">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Пример с кнопкой</h3>
          <Button @click="toggleLoading">
            {{ isLoading ? 'Загружено' : 'Загрузить' }}
          </Button>
          <div v-if="isLoading" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <Loader text="Загрузка..." full-width />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Loader from './Loader.vue'
import Button from '../button/Button.vue'

const isLoading = ref(false)

const toggleLoading = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 3000)
}
</script>
