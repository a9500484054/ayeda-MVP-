<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium" :class="labelClass">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <Button
        v-if="!disabled"
        size="sm"
        variant="ghost"
        @click="addIngredient"
      >
        + Добавить ингредиент
      </Button>
    </div>

    <div class="space-y-2">
      <div
        v-for="(ingredient, index) in localIngredients"
        :key="ingredient.id || index"
        class="rounded-xl bg-white dark:border-darkMode-300 dark:bg-darkMode-100"
        :class="{ 'opacity-50': disabled }"
      >
        <div class="flex gap-2">
          <!-- Ingredient Select -->
          <div class="flex-1">
            <Select
              :ref="(el) => setSelectRef(el, index)"
              :model-value="ingredient.ingredientId"
              :options="availableIngredientsOptions(index)"
              :placeholder="ingredientPlaceholder"
              :disabled="disabled"
              :loading="ingredientsLoading && activeIngredientIndex === index"
              @update:model-value="(val) => selectIngredientById(val, index)"
              @focus="() => handleSelectFocus(index)"
            >
              <template #options="{ options, isSelected }">
                <button
                  v-for="item in options"
                  :key="item.value"
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-darkMode-200"
                  :class="{ 'bg-emerald-50 dark:bg-emerald-900/20': isSelected(item.value) }"
                  @click="() => selectIngredientFromOption(item, index)"
                >
                  <span class="text-gray-700 dark:text-darkMode-600">{{ item.label }}</span>
                  <UIcon
                    name="i-lucide-plus"
                    class="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              </template>
            </Select>
          </div>

          <!-- Amount -->
          <Input
            v-model.number="ingredient.amount"
            type="number"
            placeholder="0"
            class="w-24"
            :disabled="disabled"
            @update:model-value="emitUpdate"
          />

          <!-- Unit -->
          <div class="flex min-w-[80px] items-center rounded-lg px-2 text-sm text-gray-500 dark:text-darkMode-500">
            {{ ingredient.unitName || '—' }}
          </div>

          <!-- Remove -->
          <Button
            v-if="!disabled"
            color="danger"
            variant="ghost"
            icon="i-lucide-trash-2"
            icon-only
            @click="removeIngredient(index)"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="localIngredients.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <UIcon name="i-lucide-package" class="h-10 w-10 text-gray-300 dark:text-darkMode-400" />
        <p class="mt-2 text-sm text-gray-400">Добавьте ингредиенты</p>
      </div>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import Input from '../input/Input.vue'
import Button from '../button/Button.vue'
import Select from '../select/Select.vue'

export interface IngredientItem {
  id?: string
  ingredientId: string
  ingredient?: { id: string; name: string }
  amount: number
  unitId: string
  unitName: string
  notes?: string
}

export interface SuggestionItem {
  id: string
  name: string
  unitId?: string
  unitName?: string
}

interface Props {
  modelValue: IngredientItem[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  ingredients?: SuggestionItem[]
  ingredientsLoading?: boolean
  ingredientPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Ингредиенты',
  hint: '',
  required: false,
  disabled: false,
  ingredients: () => [],
  ingredientsLoading: false,
  ingredientPlaceholder: 'Поиск ингредиента...'
})

const emit = defineEmits<{
  'update:modelValue': [value: IngredientItem[]]
  'search-ingredients': [query: string]
}>()

const localIngredients = ref<IngredientItem[]>([])
const activeIngredientIndex = ref<number | null>(null)
const selectRefs = ref<Map<number, InstanceType<typeof Select>>>(new Map())

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Sync with props
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue || !Array.isArray(newValue)) {
      localIngredients.value = []
      return
    }
    localIngredients.value = [...newValue]
  },
  { immediate: true, deep: true }
)

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

// Установка ref для Select
const setSelectRef = (el: any, index: number) => {
  if (el) {
    selectRefs.value.set(index, el)
  } else {
    selectRefs.value.delete(index)
  }
}

// Доступные опции для конкретного ингредиента
const availableIngredientsOptions = (index: number) => {
  const selectedIds = localIngredients.value
    .filter((_, i) => i !== index)
    .map(ing => ing.ingredientId)
    .filter(Boolean)

  return props.ingredients
    .filter(item => !selectedIds.includes(item.id))
    .map(item => ({
      value: item.id,
      label: item.name
    }))
}

const selectIngredientById = (value: string | number | null, index: number) => {
  if (!value || typeof value !== 'string') return

  const item = props.ingredients.find(i => i.id === value)
  if (item) {
    selectIngredient(item, index)
  }
}

const selectIngredientFromOption = (option: { value: string; label: string }, index: number) => {
  const item = props.ingredients.find(i => i.id === option.value)
  if (item) {
    selectIngredient(item, index)
  }
}

const selectIngredient = (item: SuggestionItem, index: number) => {
  if (props.disabled) return

  localIngredients.value[index] = {
    ...localIngredients.value[index],
    ingredientId: item.id,
    ingredient: { id: item.id, name: item.name },
    unitId: item.unitId || '',
    unitName: item.unitName || ''
  }

  emitUpdate()

  // Закрываем dropdown после выбора
  const selectRef = selectRefs.value.get(index)
  if (selectRef && selectRef.close) {
    selectRef.close()
  }
}

const addIngredient = () => {
  if (props.disabled) return

  const newIndex = localIngredients.value.length
  localIngredients.value.push({
    ingredientId: '',
    amount: 0,
    unitId: '',
    unitName: ''
  })
  emitUpdate()
}

const removeIngredient = (index: number) => {
  if (props.disabled) return

  localIngredients.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', localIngredients.value)
}

const handleSelectFocus = (index: number) => {
  activeIngredientIndex.value = index
  emit('search-ingredients', '')
}

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>
