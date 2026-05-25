<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">IngredientsList - Демонстрация</h1>

      <div class="space-y-6">
        <!-- Базовый -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📌 Базовый</h3>
          <IngredientsList
            v-model="ingredients"
            :ingredients="suggestions"
            @search-ingredients="handleSearch"
          />
          <p class="text-sm text-gray-500 mt-2">Ингредиентов: {{ ingredients.length }}</p>
          <pre class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">{{ JSON.stringify(ingredients, null, 2) }}</pre>
        </div>

        <!-- С ошибкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ С ошибкой</h3>
          <IngredientsList
            v-model="errorIngredients"
            :ingredients="suggestions"
            error="Добавьте хотя бы один ингредиент"
            required
          />
        </div>

        <!-- Disabled -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔒 Disabled</h3>
          <IngredientsList
            v-model="disabledIngredients"
            :ingredients="suggestions"
            disabled
          />
        </div>

        <!-- С подсказкой -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 С подсказкой</h3>
          <IngredientsList
            v-model="hintIngredients"
            :ingredients="suggestions"
            hint="Укажите все необходимые ингредиенты"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IngredientsList from '~/shared/ui/ingredients-list/IngredientsList.vue'

const ingredients = ref([])
const errorIngredients = ref([])
const hintIngredients = ref([])
const disabledIngredients = ref([
  { ingredientId: '1', ingredient: { id: '1', name: 'Мука' }, amount: 500, unitId: 'g', unitName: 'г' },
  { ingredientId: '2', ingredient: { id: '2', name: 'Сахар' }, amount: 200, unitId: 'g', unitName: 'г' }
])

const suggestions = ref([
  { id: '1', name: 'Мука', unitId: 'g', unitName: 'г' },
  { id: '2', name: 'Сахар', unitId: 'g', unitName: 'г' },
  { id: '3', name: 'Яйца', unitId: 'pcs', unitName: 'шт' },
  { id: '4', name: 'Молоко', unitId: 'ml', unitName: 'мл' },
  { id: '5', name: 'Масло сливочное', unitId: 'g', unitName: 'г' },
  { id: '6', name: 'Соль', unitId: 'g', unitName: 'г' },
  { id: '7', name: 'Перец', unitId: 'g', unitName: 'г' }
])

const handleSearch = (query: string) => {
  console.log('Searching:', query)
  // Здесь можно фильтровать suggestions
}
</script>
