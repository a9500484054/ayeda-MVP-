<template>
  <UFormField label="Ингредиенты" required>
    <div class="space-y-3">
      <div
        v-for="(ingredient, index) in ingredients"
        :key="index"
        class="flex flex-col gap-2 p-3 border rounded-lg"
      >
        <div class="flex gap-2">
          <!-- Поиск ингредиентов с автодополнением -->
          <div class="flex-1 relative">
            <UInput
              :model-value="getIngredientName(ingredient.ingredientId)"
              @update:model-value="(val) => onSearchInput(val, index)"
              placeholder="Поиск ингредиента..."
              class="w-full"
              :loading="ingredientsLoading && searchIndex === index"
            />

            <!-- Выпадающий список подсказок -->
            <div
              v-if="searchResults[index]?.length && activeSearchIndex === index"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <button
                v-for="item in searchResults[index]"
                :key="item.id"
                type="button"
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                @click="selectIngredient(item, index)"
              >
                <div class="flex flex-col">
                  <span>{{ item.name }}</span>
                  <span v-if="item.unit" class="text-xs text-gray-400">
                    Ед. изм.: {{ item.unit.short || item.unit.name }}
                  </span>
                </div>
                <UIcon name="i-lucide-plus" class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <UInput
            v-model.number="ingredient.amount"
            type="number"
            placeholder="Кол-во"
            class="w-32"
            min="0"
            step="0.5"
          />

          <USelect
            v-model="ingredient.unitId"
            :items="unitItems"
            placeholder="Ед. изм."
            class="w-40"
          />

          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            @click="removeIngredient(index)"
          />
        </div>

        <!-- <UInput
          v-model="ingredient.notes"
          placeholder="Примечание (по вкусу, опционально)"
          class="text-sm"
        /> -->
      </div>

      <UButton @click="addIngredient" color="primary" variant="outline" size="sm">
        Добавить ингредиент
      </UButton>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  ingredients: any[]
  units: any[]
  ingredientsLoading?: boolean
  ingredientSearchResults?: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:ingredients': [value: any[]]
  'search-ingredients': [query: string]
}>()

// Состояние для поиска
const searchQuery = ref<Record<number, string>>({})
const searchResults = ref<Record<number, any[]>>({})
const activeSearchIndex = ref<number | null>(null)
const searchIndex = ref<number | null>(null)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const ingredientItems = computed(() =>
  (props.ingredientSearchResults || []).map(i => ({ label: i.name, value: i.id }))
)

const unitItems = computed(() =>
  props.units.map(u => ({ label: u.short || u.code || u.name, value: u.id }))
)

// Получить название ингредиента по ID
const getIngredientName = (ingredientId: string) => {
  if (!ingredientId) return ''
  const ingredient = props.ingredientSearchResults?.find(i => i.id === ingredientId)
  return ingredient?.name || ''
}

// Обработка ввода поиска
const onSearchInput = (value: string, index: number) => {
  searchQuery.value[index] = value

  if (searchTimeout) clearTimeout(searchTimeout)

  if (value.length >= 2) {
    searchIndex.value = index
    activeSearchIndex.value = index

    searchTimeout = setTimeout(() => {
      emit('search-ingredients', value)
    }, 500)
  } else {
    searchResults.value[index] = []
    searchIndex.value = null
    activeSearchIndex.value = null
  }
}

// Выбор ингредиента
const selectIngredient = (item: any, index: number) => {
  const newIngredients = [...props.ingredients]
  newIngredients[index] = {
    ...newIngredients[index],
    ingredientId: item.id,
    unitId: item.unit?.id || '',
    unitName: item.unit?.short || item.unit?.code || '',
    notes: newIngredients[index].notes || ''
  }
  emit('update:ingredients', newIngredients)

  // Очищаем поиск
  searchQuery.value[index] = ''
  searchResults.value[index] = []
  activeSearchIndex.value = null
  searchIndex.value = null
}

// Обновление результатов поиска из родителя
const updateSearchResults = () => {
  if (searchIndex.value !== null && props.ingredientSearchResults) {
    searchResults.value[searchIndex.value] = [...props.ingredientSearchResults]
  }
}

// Следим за результатами поиска
watch(() => props.ingredientSearchResults, () => {
  updateSearchResults()
}, { deep: true })

const addIngredient = () => {
  const newIngredients = [...props.ingredients, {
    ingredientId: '',
    amount: 0,
    unitId: '',
    unitName: '',
    notes: ''
  }]
  emit('update:ingredients', newIngredients)
}

const removeIngredient = (index: number) => {
  const newIngredients = [...props.ingredients]
  newIngredients.splice(index, 1)
  emit('update:ingredients', newIngredients)
  // Очищаем поиск по этому индексу
  delete searchQuery.value[index]
  delete searchResults.value[index]
}
</script>
