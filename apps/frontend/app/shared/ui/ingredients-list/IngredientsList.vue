<template>
  <div class="space-y-3">
    <!-- Заголовок -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <label class="text-sm font-medium" :class="labelClass">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
    </div>

    <!-- Список ингредиентов -->
    <div class="space-y-2">
      <div
        v-for="(ingredient, index) in localIngredients"
        :key="ingredient.id || index"
        class="rounded-xl bg-white p-3 sm:p-4 dark:bg-darkMode-100"
        :class="{
          'border border-red-200 dark:border-red-800': !ingredient.ingredientId && ingredient.amount > 0,
          'opacity-50': disabled
        }"
      >
        <!-- Мобильная версия - вертикальная -->
        <div class="flex flex-col sm:hidden gap-2">
          <!-- Поиск ингредиента -->
          <div class="w-full">
            <Select
              :key="`select-${index}-${ingredient.ingredientId || 'empty'}`"
              :ref="(el) => setSelectRef(el, index)"
              :model-value="ingredient.ingredientId"
              :options="getOptionsForIndex(index)"
              :placeholder="ingredientPlaceholder"
              :disabled="disabled"
              :loading="isLoadingIngredients"
              searchable
              size="sm"
              class="w-full"
              @update:model-value="(val) => selectIngredientById(val, index)"
              @search="(query) => handleSearch(query, index)"
              @focus="() => handleFocus(index)"
              @open="() => handleOpen(index)"
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

          <!-- Количество и единица измерения -->
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <Input
                v-model.number="ingredient.amount"
                type="number"
                placeholder="Кол-во"
                class="w-full"
                :min="0"
                :max="9999"
                :disabled="disabled"
                size="sm"
                @update:model-value="emitUpdate"
              />
            </div>
            <div class="flex-1 min-w-[80px] rounded-lg px-2 py-1.5 text-sm text-gray-500 dark:text-darkMode-500 bg-gray-50 dark:bg-darkMode-200">
              {{ ingredient.unitName || '—' }}
            </div>
            <Button
              v-if="!disabled"
              color="danger"
              variant="ghost"
              icon="i-lucide-trash-2"
              icon-only
              size="sm"
              @click="removeIngredient(index)"
            />
          </div>

        </div>

        <!-- Десктопная версия - горизонтальная -->
        <div class="hidden sm:flex sm:gap-2 items-start">
          <div class="flex-1">
            <Select
              :key="`select-${index}-${ingredient.ingredientId || 'empty'}`"
              :ref="(el) => setSelectRef(el, index)"
              :model-value="ingredient.ingredientId"
              :options="getOptionsForIndex(index)"
              :placeholder="ingredientPlaceholder"
              :disabled="disabled"
              :loading="isLoadingIngredients"
              searchable
              @update:model-value="(val) => selectIngredientById(val, index)"
              @search="(query) => handleSearch(query, index)"
              @focus="() => handleFocus(index)"
              @open="() => handleOpen(index)"
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

          <Input
            v-model.number="ingredient.amount"
            type="number"
            placeholder="0"
            class="w-24"
            :min="0"
            :max="9999"
            :disabled="disabled"
            @update:model-value="emitUpdate"
          />

          <div class="flex min-w-[80px] items-center rounded-lg px-2 text-sm text-gray-500 dark:text-darkMode-500">
            {{ ingredient.unitName || '—' }}
          </div>

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

      <!-- Пустое состояние -->
      <div
        v-if="localIngredients.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <UIcon name="i-lucide-package" class="h-10 w-10 text-gray-300 dark:text-darkMode-400" />
        <p class="mt-2 text-sm text-gray-400">Добавьте ингредиенты</p>
        <p class="text-xs text-gray-300 dark:text-darkMode-400">Нажмите кнопку "Добавить ингредиент"</p>
      </div>
    </div>

    <!-- Подсказки -->
    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>

    <Button
      v-if="!disabled"
      size="sm"
      variant="ghost"
      class="w-full sm:w-auto justify-center"
      @click="addIngredient"
    >
      + Добавить ингредиент
    </Button>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDebounceFn } from '@vueuse/core'
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
  ingredientPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Ингредиенты',
  hint: '',
  required: false,
  disabled: false,
  ingredientPlaceholder: 'Поиск ингредиента...'
})

const emit = defineEmits<{
  'update:modelValue': [value: IngredientItem[]]
  'search': [query: string, index: number]
}>()

const localIngredients = ref<IngredientItem[]>([])
const selectRefs = ref<Map<number, InstanceType<typeof Select>>>(new Map())
const localSuggestions = ref<SuggestionItem[]>([])
const isLoadingIngredients = ref(false)

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

// Получение опций для конкретного индекса
const getOptionsForIndex = (index: number) => {
  const currentIngredient = localIngredients.value[index]
  const currentIngredientId = currentIngredient?.ingredientId

  const selectedIds = new Set(
    localIngredients.value
      .filter((_, i) => i !== index)
      .map(ing => ing.ingredientId)
      .filter(Boolean)
  )

  const available = localSuggestions.value
    .filter(item => !selectedIds.has(item.id))
    .map(item => ({
      value: item.id,
      label: item.name
    }))

  if (currentIngredientId && currentIngredient.ingredient) {
    const existingIndex = available.findIndex(opt => opt.value === currentIngredientId)
    if (existingIndex === -1) {
      available.unshift({
        value: currentIngredientId,
        label: currentIngredient.ingredient.name
      })
    }
  }

  return available
}

const setSelectRef = (el: any, index: number) => {
  if (el) {
    selectRefs.value.set(index, el)
  } else {
    selectRefs.value.delete(index)
  }
}

// Debounced search
const debouncedSearch = useDebounceFn((query: string, index: number) => {
  if (query && query.length >= 2) {
    emit('search', query, index)
  } else if (!query) {
    emit('search', '', index)
  }
}, 300)

const handleSearch = (query: string, index: number) => {
  debouncedSearch(query, index)
}

const handleFocus = (index: number) => {
  if (localSuggestions.value.length === 0) {
    emit('search', '', index)
  }
}

const handleOpen = (index: number) => {
  if (localSuggestions.value.length === 0) {
    emit('search', '', index)
  }
}

const selectIngredientById = (value: string | number | null, index: number) => {
  if (!value || typeof value !== 'string') return

  const item = localSuggestions.value.find(i => i.id === value)
  if (item) {
    selectIngredient(item, index)
  }
}

const selectIngredientFromOption = (option: { value: string; label: string }, index: number) => {
  const item = localSuggestions.value.find(i => i.id === option.value)
  if (item) {
    selectIngredient(item, index)
  }
}

const selectIngredient = (item: SuggestionItem, index: number) => {
  if (props.disabled) return

  const updatedIngredient = {
    ...localIngredients.value[index],
    ingredientId: item.id,
    ingredient: { id: item.id, name: item.name },
    unitId: item.unitId || '',
    unitName: item.unitName || ''
  }

  const newIngredients = [...localIngredients.value]
  newIngredients[index] = updatedIngredient
  localIngredients.value = newIngredients

  emitUpdate()

  const selectRef = selectRefs.value.get(index)
  if (selectRef && selectRef.close) {
    selectRef.close()
  }
}

const addIngredient = () => {
  if (props.disabled) return

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

const setSuggestions = (suggestions: SuggestionItem[]) => {
  localSuggestions.value = suggestions
  isLoadingIngredients.value = false
}

defineExpose({
  setSuggestions
})
</script>

<style scoped>
/* Мобильные улучшения */
@media (max-width: 640px) {
  .select-dropdown {
    max-height: 200px !important;
  }

  /* Увеличиваем область касания для мобильных */
  button {
    min-height: 44px;
  }

  /* Улучшаем скролл на мобильных */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Для iOS - улучшаем инпуты */
input[type="number"] {
  -webkit-appearance: none;
  appearance: none;
}

/* Убираем стрелки у number input на мобильных */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
