<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">CategorySelect - Демонстрация</h1>

      <div class="space-y-6">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Базовый</h3>
          <CategorySelect
            v-model="basicValue"
            :suggestions="categories"
            label="Категории"
          />
          <p class="text-sm text-gray-500 mt-2">Выбрано: {{ basicValue.join(', ') || 'ничего' }}</p>
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С ошибкой</h3>
          <CategorySelect
            v-model="errorValue"
            :suggestions="categories"
            label="Категории"
            error="Выберите хотя бы одну категорию"
            required
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Disabled</h3>
          <CategorySelect
            v-model="disabledValue"
            :suggestions="categories"
            label="Категории"
            disabled
          />
        </div>

        <!-- С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">С подсказкой</h3>
          <CategorySelect
            v-model="hintValue"
            :suggestions="categories"
            label="Категории"
            hint="Выберите до 3 категорий"
            :max="3"
          />
        </div>

        <!-- С поиском -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Поиск</h3>
          <CategorySelect
            v-model="searchValue"
            :suggestions="filteredCategories"
            label="Категории"
            :loading="isSearching"
            @search="handleSearch"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CategorySelect from './CategorySelect.vue'

const basicValue = ref<string[]>([])
const errorValue = ref<string[]>([])
const disabledValue = ref(['tech'])
const hintValue = ref<string[]>([])
const searchValue = ref<string[]>([])

const allCategories = [
  { value: 'tech', label: 'Технологии' },
  { value: 'food', label: 'Еда' },
  { value: 'travel', label: 'Путешествия' },
  { value: 'sports', label: 'Спорт' },
  { value: 'music', label: 'Музыка' },
  { value: 'art', label: 'Искусство' }
]

const categories = ref(allCategories)
const isSearching = ref(false)

const filteredCategories = computed(() => {
  return categories.value
})

const handleSearch = (query: string) => {
  isSearching.value = true
  setTimeout(() => {
    if (!query) {
      categories.value = allCategories
    } else {
      categories.value = allCategories.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    }
    isSearching.value = false
  }, 500)
}
</script>
