<template>
  <UFormField label="Ингредиенты" required>
    <div class="space-y-3">
      <div
        v-for="(ingredient, index) in localIngredients"
        :key="`${index}-${ingredient.ingredientId}`"
        class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-start">
          <!-- Search -->
          <div class="relative flex-1">
            <UInput
              v-model="searchQueries[index]"
              placeholder="Ингредиент..."
              autocomplete="off"
              class="w-full"
              @focus="openDropdown(index)"
              @input="handleSearch(index)"
            />

            <!-- Dropdown -->
            <Transition name="fade">
              <div
                v-if="activeIndex === index && showDropdown"
                class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
              >
                <div class="max-h-64 overflow-y-auto py-1">
                  <!-- Loading -->
                  <div
                    v-if="ingredientsLoading"
                    class="flex items-center gap-2 px-3 py-3 text-sm text-gray-400"
                  >
                    <UIcon
                      name="i-lucide-loader-circle"
                      class="h-4 w-4 animate-spin"
                    />
                    Загрузка...
                  </div>

                  <!-- Results -->
                  <button
                    v-for="item in availableSuggestions(index)"
                    v-else
                    :key="item.id"
                    type="button"
                    class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    @mousedown.prevent="selectIngredient(item, index)"
                  >
                    <div class="flex flex-col">
                      <span class="text-gray-900 dark:text-gray-100">
                        {{ item.name }}
                      </span>

                      <span
                        v-if="item.unit"
                        class="text-xs text-gray-400"
                      >

                        {{ getUnitLabel(item.unit) }}
                      </span>
                    </div>

                    <UIcon
                      name="i-lucide-plus"
                      class="h-4 w-4 text-gray-400"
                    />
                  </button>

                  <!-- Empty -->
                  <div
                    v-if="
                      !ingredientsLoading &&
                      availableSuggestions(index).length === 0
                    "
                    class="px-3 py-3 text-sm text-gray-400"
                  >
                    Ничего не найдено
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Amount -->
          <UInput
            v-model.number="ingredient.amount"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            class="w-full md:w-28"
            @update:model-value="emitUpdate"
          />

          <!-- Unit -->
          <div
            class="flex h-10 min-w-[90px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm text-gray-600 dark:text-gray-300"
          >
            {{ ingredient }}
            {{ ingredient.unitName || '—' }}
          </div>

          <!-- Delete -->
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            @click="removeIngredient(index)"
          />
        </div>
      </div>

      <!-- Add -->
      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-plus"
        @click="addIngredient"
      >
        Добавить ингредиент
      </UButton>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

interface Ingredient {
  ingredientId: string
  amount: number
  unitId: string
  unitName: string
  notes?: string
}

interface Props {
  ingredients: Ingredient[]
  units: any[]
  ingredientsLoading?: boolean
  ingredientSearchResults?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  ingredientsLoading: false,
  ingredientSearchResults: () => []
})

const emit = defineEmits<{
  'update:ingredients': [Ingredient[]]
  'search-ingredients': [string]
}>()

const localIngredients = ref<Ingredient[]>([])
const searchQueries = ref<Record<number, string>>({})

const activeIndex = ref<number | null>(null)
const showDropdown = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
let blurTimeout: ReturnType<typeof setTimeout> | null = null

// Sync ingredients
watch(
  () => props.ingredients,
  (val) => {
    localIngredients.value = [...val]

    val.forEach((item, index) => {
      if (!searchQueries.value[index]) {
        searchQueries.value[index] = item.unitName || ''
      }
    })
  },
  {
    immediate: true,
    deep: true
  }
)

const emitUpdate = () => {
  emit('update:ingredients', [...localIngredients.value])
}

const getUnitLabel = (unit: any) => {
  return unit?.short || unit?.code || unit?.name || ''
}

const handleSearch = (index: number) => {
  activeIndex.value = index
  showDropdown.value = true

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    emit(
      'search-ingredients',
      searchQueries.value[index] || ''
    )
  }, 300)
}

const openDropdown = (index: number) => {
  if (blurTimeout) {
    clearTimeout(blurTimeout)
  }

  activeIndex.value = index
  showDropdown.value = true

  emit(
    'search-ingredients',
    searchQueries.value[index] || ''
  )
}

const availableSuggestions = (index: number) => {
  return props.ingredientSearchResults.filter((item: any) => {
    const alreadySelected = localIngredients.value.some(
      (ing, i) =>
        i !== index && ing.ingredientId === item.id
    )

    return !alreadySelected
  })
}

const selectIngredient = (item: any, index: number) => {
  const unitId = item.unit?.id || ''
  const unitName = getUnitLabel(item.unit)

  localIngredients.value[index] = {
    ...localIngredients.value[index],
    ingredientId: item.id,
    amount: localIngredients.value[index].amount || 0,
    unitId,
    unitName
  }

  searchQueries.value[index] = item.name

  emitUpdate()

  showDropdown.value = false
}

const addIngredient = () => {
  localIngredients.value.push({
    ingredientId: '',
    amount: 0,
    unitId: '',
    unitName: '',
    notes: ''
  })

  emitUpdate()
}

const removeIngredient = (index: number) => {
  localIngredients.value.splice(index, 1)

  delete searchQueries.value[index]

  emitUpdate()
}

const closeDropdown = () => {
  blurTimeout = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (blurTimeout) {
    clearTimeout(blurTimeout)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
