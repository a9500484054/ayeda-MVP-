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
            <!-- Ссылка на ингредиент -->
            <NuxtLink
              :to="getIngredientLink(ing)"
              class="text-xs text-zinc-800 hover:text-emerald-600 hover:underline transition-colors md:text-sm"
              :class="{ 'line-through text-zinc-400 hover:text-zinc-400': checkedIngredients[idx] }"
              @click.stop
            >
              {{ getIngredientName(ing) }}
            </NuxtLink>
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

      <!-- Кнопки действий -->
      <div class="mt-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="solid"
          color="primary"
          :disabled="!ingredients?.length"
          @click="openConfirmModal"
          block
        >
          <UIcon name="i-lucide-shopping-cart" class="h-4 w-4" />
          <span>В список покупок</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          color="primary"
          :disabled="!ingredients?.length"
          @click="openPartnersModal"
          block
        >
          <UIcon name="i-lucide-truck" class="h-4 w-4" />
          <span>Заказать у партнеров</span>
        </Button>
      </div>
    </div>

    <!-- Модальное окно подтверждения для списка покупок -->
    <AddToShoppingListModal
      v-model:open="showConfirmModal"
      :items="shoppingItems"
      :recipe-title="recipeTitle"
      :loading="isAddingToList"
      @confirm="handleAddToShoppingList"
    />

    <!-- Модальное окно партнеров -->
    <PartnersModal
      v-model:open="showPartnersModal"
      :recipe-title="recipeTitle"
      :ingredients="shoppingItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from '~/shared/ui/button/Button.vue'
import Loader from '~/shared/ui/loader/Loader.vue'
import RecipeServingsControl from './RecipeServingsControl.vue'
import AddToShoppingListModal from './AddToShoppingListModal.vue'
import PartnersModal from './PartnersModal.vue'

interface Ingredient {
  id?: string
  ingredientId?: string
  ingredient?: {
    id: string;
    name: string;
    unitId?: string;
    srcPath?: string;
  }
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
  recipeTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  ingredients: () => [],
  unitsLoading: false,
  unitsCache: () => new Map(),
  recipeTitle: 'Рецепт'
})

const emit = defineEmits<{
  'update:servings': [value: number]
  'add-to-shopping-list': [items: Array<{ name: string; quantity: number; unit: string }>]
}>()

const toast = useToast()
const servings = ref(props.baseServings)
const checkedIngredients = ref<boolean[]>([])
const showConfirmModal = ref(false)
const showPartnersModal = ref(false)
const isAddingToList = ref(false)

// Формируем список товаров для модалки
const shoppingItems = computed(() => {
  return adjustedIngredients.value.map(ing => ({
    name: getIngredientName(ing),
    quantity: ing.amount,
    unit: getUnitDisplay(ing)
  }))
})

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

// Получение ссылки на ингредиент
const getIngredientLink = (ing: Ingredient): string => {
  if (ing.ingredient?.srcPath) {
    return `/ingredients/${ing.ingredient.srcPath}`
  }
  if (ing.ingredient?.id) {
    return `/ingredients/${ing.ingredient.id}`
  }
  if (ing.id) {
    return `/ingredients/${ing.id}`
  }
  return '#'
}

// Получение единицы измерения из данных
const getUnitDisplay = (ing: Ingredient): string => {
  if (ing.unit?.short) return ing.unit.short
  if (ing.unit?.code) return ing.unit.code
  if (ing.unit?.name) return ing.unit.name

  if (ing.unitId && props.unitsCache.has(ing.unitId)) {
    const unitObj = props.unitsCache.get(ing.unitId)
    return unitObj?.short || unitObj?.code || unitObj?.name || ''
  }

  if ((ing as any).unitName) return (ing as any).unitName
  return ''
}

const formatIngredientAmount = (ing: Ingredient) => {
  const amount = parseFloat(String(ing.amount)) || 0
  const unit = getUnitDisplay(ing)
  const notes = ing.notes ? ` (${ing.notes})` : ''
  const amountStr = amount.toString().replace('.', ',')

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

const openConfirmModal = () => {
  if (!props.ingredients?.length) {
    toast.add({
      title: 'Нет ингредиентов',
      description: 'В этом рецепте нет ингредиентов для добавления в список покупок',
      color: 'warning'
    })
    return
  }
  showConfirmModal.value = true
}

const openPartnersModal = () => {
  if (!props.ingredients?.length) {
    toast.add({
      title: 'Нет ингредиентов',
      description: 'В этом рецепте нет ингредиентов для заказа',
      color: 'warning'
    })
    return
  }
  showPartnersModal.value = true
}

const handleAddToShoppingList = () => {
  isAddingToList.value = true

  // Эмитим событие с товарами
  emit('add-to-shopping-list', shoppingItems.value)

  // Закрываем модалку после отправки
  setTimeout(() => {
    showConfirmModal.value = false
    isAddingToList.value = false
  }, 100)
}
</script>
