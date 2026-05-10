<template>
  <UFormField
    label="Ингредиенты"
    required
  >
    <div class="space-y-2">
      <!-- Ingredient -->
      <div
        v-for="(ingredient, index) in localIngredients"
        :key="`${index}-${ingredient.ingredientId}`"
        class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2"
      >
        <div class="flex items-start gap-2">
          <!-- Search -->
          <div
            :ref="(el) => setDropdownRef(el, index)"
            class="relative flex-1"
          >
            <UInput
              v-model="searchQueries[index]"
              placeholder="Ингредиент..."
              autocomplete="off"
              class="w-full"
              :ui="{
                base: 'rounded-lg border-0 h-9 text-sm shadow-none'
              }"
              @focus="openDropdown(index)"
              @input="handleSearch(index)"
              @blur="handleBlur"
            >
            </UInput>

            <!-- Dropdown -->
            <Transition name="dropdown">
              <div
                v-if="activeIndex === index && showDropdown"
                class="absolute left-0 top-full z-[9999] mt-1 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
              >
                <div class="max-h-56 overflow-y-auto p-1">
                  <!-- Loading -->
                  <div
                    v-if="ingredientsLoading"
                    class="flex items-center gap-2 px-2.5 py-2 text-sm text-gray-400"
                  >
                    <UIcon
                      name="i-lucide-loader-circle"
                      class="h-4 w-4 animate-spin"
                    />
                    Загрузка...
                  </div>

                  <!-- Suggestions -->
                  <template v-else>
                    <button
                      v-for="item in availableSuggestions(index)"
                      :key="item.id"
                      type="button"
                      class="group/item flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-800"
                      @mousedown.prevent="selectIngredient(item, index)"
                    >
                      <div class="flex flex-col">
                        <span class="text-sm text-gray-800 dark:text-gray-100">
                          {{ item.name }}
                        </span>
                      </div>

                      <UIcon
                        name="i-lucide-plus"
                        class="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover/item:opacity-100"
                      />
                    </button>

                    <!-- Empty -->
                    <div
                      v-if="availableSuggestions(index).length === 0"
                      class="px-3 py-4 text-center"
                    >
                      <div class="text-sm text-gray-400">
                        Ничего не найдено
                      </div>
                    </div>
                  </template>
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
            class="w-20"
            :ui="{
              base: 'rounded-lg border-0 h-9 text-sm shadow-none px-2'
            }"
            @update:model-value="emitUpdate"
          />

          <!-- Unit -->
          <div
            class="flex h-9 min-w-[70px] items-center justify-center rounded-lg px-2 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {{ unitNames[index] || '...' }}
          </div>

          <!-- Delete -->
          <UButton
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            class="h-9 w-9 rounded-lg opacity-50 hover:opacity-100"
            @click="removeIngredient(index)"
          />
        </div>
      </div>

      <!-- Add -->
      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-plus"
        class="rounded-xl px-3 py-2 text-sm"
        @click="addIngredient"
      >
        Добавить ингредиент
      </UButton>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import {
  nextTick,
  ref,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import { useUnitsApi } from '~/composables/useUnitsApi'

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

const props = withDefaults(
  defineProps<Props>(),
  {
    ingredientsLoading: false,
    ingredientSearchResults: () => []
  }
)

const emit = defineEmits<{
  'update:ingredients': [Ingredient[]]
  'search-ingredients': [string]
}>()

const { getUnitById } = useUnitsApi()

const localIngredients = ref<Ingredient[]>([])

const searchQueries = ref<Record<number, string>>({})
const unitNames = ref<Record<number, string>>({})

const activeIndex = ref<number | null>(null)
const showDropdown = ref(false)

const dropdownRefs = ref<Map<number, HTMLElement>>(new Map())
const isClickingInside = ref(false)

const unitsCache = new Map<string, string>()

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Set dropdown ref
const setDropdownRef = (el: any, index: number) => {
  if (el) {
    dropdownRefs.value.set(index, el)
  } else {
    dropdownRefs.value.delete(index)
  }
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (!showDropdown.value || activeIndex.value === null) return

  const currentDropdownRef = dropdownRefs.value.get(activeIndex.value)

  if (currentDropdownRef && !currentDropdownRef.contains(event.target as Node)) {
    // Не закрываем, если клик был внутри дропдауна
    const dropdownElement = currentDropdownRef.querySelector('[class*="absolute"]')
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      closeDropdown()
    }
  }
}

// Handle blur event from input
const handleBlur = (event: FocusEvent) => {
  // Даём время на то, чтобы клик по элементу дропдауна сработал
  setTimeout(() => {
    if (!isClickingInside.value) {
      closeDropdown()
    }
    isClickingInside.value = false
  }, 150)
}

// Close dropdown
const closeDropdown = () => {
  showDropdown.value = false
  activeIndex.value = null
}

// Add event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Load unit name with cache
const loadUnitName = async (
  unitId: string
): Promise<string> => {
  if (!unitId) {
    return ''
  }

  // CACHE
  if (unitsCache.has(unitId)) {
    return unitsCache.get(unitId)!
  }

  try {
    const unit = await getUnitById(unitId)

    const name =
      unit.short ||
      unit.code ||
      unit.name ||
      ''

    // SAVE CACHE
    unitsCache.set(unitId, name)

    return name
  } catch (error) {
    console.error(
      'Ошибка загрузки единицы измерения:',
      error
    )

    return ''
  }
}

// Sync ingredients
watch(
  () => props.ingredients,
  async (val) => {
    localIngredients.value = [...val]

    for (const [index, ingredient] of val.entries()) {
      // Search query
      if (!searchQueries.value[index]) {
        searchQueries.value[index] =
          ingredient.unitName || ''
      }

      // Unit name
      if (
        ingredient.unitId &&
        !unitNames.value[index]
      ) {
        const name = await loadUnitName(
          ingredient.unitId
        )

        unitNames.value[index] = name
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
)

const emitUpdate = () => {
  emit(
    'update:ingredients',
    [...localIngredients.value]
  )
}

const getUnitLabel = (unit: any) => {
  return (
    unit?.short ||
    unit?.code ||
    unit?.name ||
    ''
  )
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
  activeIndex.value = index
  showDropdown.value = true

  emit(
    'search-ingredients',
    searchQueries.value[index] || ''
  )
}

const availableSuggestions = (
  index: number
) => {
  return props.ingredientSearchResults.filter(
    (item: any) => {
      const alreadySelected =
        localIngredients.value.some(
          (ing, i) =>
            i !== index &&
            ing.ingredientId === item.id
        )

      return !alreadySelected
    }
  )
}

const selectIngredient = async (
  item: any,
  index: number
) => {
  isClickingInside.value = true

  const unitId =
    item.unit?.id || ''

  const unitName =
    getUnitLabel(item.unit)

  localIngredients.value[index] = {
    ...localIngredients.value[index],
    ingredientId: item.id,
    amount:
      localIngredients.value[index]
        .amount || 0,
    unitId,
    unitName
  }

  // Load unit once
  if (unitId) {
    const name = await loadUnitName(
      unitId
    )

    unitNames.value[index] = name
  }

  searchQueries.value[index] =
    item.name

  emitUpdate()

  closeDropdown()
}

const addIngredient = () => {
  const newIndex =
    localIngredients.value.length

  localIngredients.value.push({
    ingredientId: '',
    amount: 0,
    unitId: '',
    unitName: '',
    notes: ''
  })

  searchQueries.value[newIndex] = ''
  unitNames.value[newIndex] = ''

  emitUpdate()
}

const removeIngredient = (
  index: number
) => {
  localIngredients.value.splice(
    index,
    1
  )

  delete searchQueries.value[index]
  delete unitNames.value[index]

  // Reindex
  const newQueries: Record<
    number,
    string
  > = {}

  const newUnits: Record<
    number,
    string
  > = {}

  Object.keys(searchQueries.value).forEach(
    key => {
      const numKey = Number(key)

      if (numKey > index) {
        newQueries[numKey - 1] =
          searchQueries.value[numKey]
      } else if (numKey < index) {
        newQueries[numKey] =
          searchQueries.value[numKey]
      }
    }
  )

  Object.keys(unitNames.value).forEach(
    key => {
      const numKey = Number(key)

      if (numKey > index) {
        newUnits[numKey - 1] =
          unitNames.value[numKey]
      } else if (numKey < index) {
        newUnits[numKey] =
          unitNames.value[numKey]
      }
    }
  )

  searchQueries.value = newQueries
  unitNames.value = newUnits

  emitUpdate()
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
