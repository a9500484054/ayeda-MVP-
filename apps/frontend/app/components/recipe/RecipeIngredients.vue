<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-zinc-900 md:mb-5 md:text-xl">Ингредиенты</h2>
    <div class="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-5">
        <RecipeServingsControl
          :model-value="servings"
          @update:model-value="handleServingsChange"
        />
      </div>

      <!-- Индикатор загрузки единиц измерения -->
      <div v-if="unitsLoading" class="mb-3 flex items-center justify-center gap-2 py-2 text-xs text-zinc-500">
        <Loader size="sm" />
        <span>Загрузка единиц измерения...</span>
      </div>

      <div v-if="ingredients?.length" class="space-y-2 md:space-y-3">
        <div
          v-for="(ing, idx) in adjustedIngredients"
          :key="idx"
          class="flex items-center justify-between border-b border-zinc-100 pb-2 text-sm last:border-0 md:pb-3"
        >
          <div class="flex items-center gap-2 md:gap-3">
            <button
              @click="toggleIngredient(idx)"
              class="flex h-4 w-4 cursor-pointer flex-shrink-0 items-center justify-center rounded border transition-all md:h-5 md:w-5"
              :class="checkedIngredients[idx] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 hover:border-emerald-300'"
            >
              <UIcon v-if="checkedIngredients[idx]" name="i-lucide-check" class="h-2.5 w-2.5 md:h-3 md:w-3" />
            </button>
            <span class="text-xs text-zinc-800 md:text-sm" :class="{ 'line-through text-zinc-400': checkedIngredients[idx] }">
              {{ getIngredientName(ing) }}
            </span>
          </div>
          <span class="ml-2 text-xs text-zinc-500 md:text-sm">
            {{ formatIngredientAmount(ing) }}
          </span>
        </div>
      </div>

      <div v-else class="py-6 text-center text-zinc-400 md:py-8">
        <UIcon name="i-lucide-package" class="mx-auto mb-2 h-8 w-8 md:h-10 md:w-10" />
        <p class="text-xs md:text-sm">Ингредиенты не добавлены</p>
      </div>

      <div class="mt-4">
        <Button
          size="sm"
          variant="solid"
          color="primary"
          :disabled="!ingredients?.length"
          @click="addToShoppingList"
          block
        >
          <UIcon name="i-lucide-shopping-cart" class="h-4 w-4" />
          <span>В список покупок</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from '~/shared/ui/button/Button.vue'
import Loader from '~/shared/ui/loader/Loader.vue'
import RecipeServingsControl from './RecipeServingsControl.vue'

interface Ingredient {
  id?: string
  ingredientId?: string
  ingredient?: { id: string; name: string; unitId?: string }
  name?: string
  amount: number | string
  unitId?: string
  unit?: { id: string; short?: string; name?: string; code?: string }
  notes?: string
}

interface Props {
  ingredients?: Ingredient[]
  baseServings: number
  unitsCache?: Map<string, { id: string; short?: string; name?: string; code?: string }>
  unitsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ingredients: () => [],
  unitsLoading: false,
  unitsCache: () => new Map()
})

const emit = defineEmits<{
  'update:servings': [value: number]
  'add-to-shopping-list': [items: Array<{ name: string; amount: number; unit: string }>]
}>()

const servings = ref(props.baseServings)
const checkedIngredients = ref<boolean[]>([])

// Инициализация чекбоксов
watch(
  () => props.ingredients,
  (newVal) => {
    checkedIngredients.value = new Array(newVal?.length || 0).fill(false)
  },
  { immediate: true }
)

// Пересчитанные ингредиенты с учетом порций
const adjustedIngredients = computed(() => {
  if (!props.ingredients?.length) return []
  const multiplier = servings.value / props.baseServings
  return props.ingredients.map((ing) => ({
    ...ing,
    amount: Math.round((parseFloat(String(ing.amount)) * multiplier) * 10) / 10
  }))
})

const getIngredientName = (ing: Ingredient) => {
  if (ing.ingredient?.name) return ing.ingredient.name
  if (ing.name) return ing.name
  return 'Ингредиент'
}

// Получение единицы измерения из данных
const getUnitDisplay = (ing: Ingredient): string => {
  // Приоритет 1: из вложенного объекта unit (как в ваших данных)
  if (ing.unit?.short) return ing.unit.short
  if (ing.unit?.code) return ing.unit.code
  if (ing.unit?.name) return ing.unit.name

  // Приоритет 2: из кэша по unitId
  if (ing.unitId && props.unitsCache.has(ing.unitId)) {
    const unitObj = props.unitsCache.get(ing.unitId)
    return unitObj?.short || unitObj?.code || unitObj?.name || ''
  }

  // Приоритет 3: unitName из данных (если есть)
  if ((ing as any).unitName) return (ing as any).unitName

  return ''
}

const formatIngredientAmount = (ing: Ingredient) => {
  const amount = parseFloat(String(ing.amount)) || 0
  const unit = getUnitDisplay(ing)
  const notes = ing.notes ? ` (${ing.notes})` : ''
  const amountStr = amount.toString().replace('.', ',')
  console.log('ing', ing);
  if (unit) {
    return `${amountStr} ${unit}${notes}`.trim()
  }
  return `${amountStr}${notes}`.trim()
}

const handleServingsChange = (value: number) => {
  servings.value = value
  emit('update:servings', value)
}

const toggleIngredient = (index: number) => {
  checkedIngredients.value[index] = !checkedIngredients.value[index]
}

const addToShoppingList = () => {
  const items = adjustedIngredients.value.map(ing => ({
    name: getIngredientName(ing),
    amount: ing.amount,
    unit: getUnitDisplay(ing)
  }))
  emit('add-to-shopping-list', items)
}
</script>
