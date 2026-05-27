<template>
  <div class="space-y-2">
    <label v-if="label" class="mb-1.5 block text-sm font-medium" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <Select
        ref="selectRef"
        :model-value="selectedValues"
        :options="availableOptions"
        :placeholder="placeholder"
        :disabled="disabled || isMaxReached"
        :error="error"
        multiple
        searchable
        @update:model-value="handleSelectChange"
        @search="handleSearch"
        @open="handleOpen"
      >
        <template #header>
          <div class="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 dark:border-darkMode-200">
            Выберите категории (макс. {{ max }})
          </div>
        </template>

        <template #options="{ options, isSelected, selectOption }">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-darkMode-200"
            :class="{ 'bg-emerald-50 dark:bg-emerald-900/20': isSelected(option.value) }"
            @click="selectOption(option)"
          >
            <span class="text-gray-700 dark:text-darkMode-600">{{ option.label }}</span>
            <UIcon
              v-if="isSelected(option.value)"
              name="i-lucide-check"
              class="h-4 w-4 text-emerald-600"
            />
          </button>
        </template>
      </Select>

      <!-- Selected tags -->
      <div v-if="selectedTags.length > 0" class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="tag in selectedTags"
          :key="tag.value"
          class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        >
          {{ tag.label }}
          <button
            v-if="!disabled"
            type="button"
            class="rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800"
            @click="removeTag(tag.value)"
          >
            <UIcon name="i-lucide-x" class="h-3 w-3" />
          </button>
        </span>
      </div>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Select from '../select/Select.vue'

export interface CategoryItem {
  label: string
  value: string
}

interface Props {
  modelValue: string[]
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  max?: number
  /** Функция для загрузки категорий по ID (для отображения выбранных) */
  fetchByIds?: (ids: string[]) => Promise<CategoryItem[]>
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Категории',
  placeholder: 'Выберите категории...',
  hint: 'Можно выбрать до 5 категорий',
  max: 5,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'search': [query: string]
}>()

const selectedTags = ref<CategoryItem[]>([])
const localSuggestions = ref<CategoryItem[]>([])
const isLoading = ref(false)
const selectRef = ref()
const hasLoadedInitial = ref(false)

// Текущие выбранные значения
const selectedValues = computed(() => {
  return selectedTags.value.map(tag => tag.value)
})

// Доступные опции
const availableOptions = computed(() => {
  const selectedValuesSet = new Set(selectedTags.value.map(t => t.value))
  return localSuggestions.value
    .filter(suggestion => !selectedValuesSet.has(suggestion.value))
    .map(suggestion => ({
      value: suggestion.value,
      label: suggestion.label
    }))
})

const isMaxReached = computed(() => selectedTags.value.length >= props.max)

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

// Загрузка выбранных категорий по ID
const loadSelectedCategories = async (ids: string[]) => {
  if (!props.fetchByIds || ids.length === 0) return

  console.log('Loading selected categories by IDs:', ids)
  try {
    const categories = await props.fetchByIds(ids)
    selectedTags.value = categories
  } catch (error) {
    console.error('Error loading selected categories:', error)
  }
}

// Sync selected tags from modelValue
watch(
  () => props.modelValue,
  async (newValue) => {
    if (!newValue || !Array.isArray(newValue)) {
      selectedTags.value = []
      return
    }

    // Если есть fetchByIds и localSuggestions пуст, загружаем выбранные категории
    if (props.fetchByIds && localSuggestions.value.length === 0 && newValue.length > 0) {
      await loadSelectedCategories(newValue)
    } else {
      // Ищем в localSuggestions
      const newTags = newValue
        .map(val => {
          const found = localSuggestions.value.find(s => s.value === val)
          return found ? { label: found.label, value: found.value } : { label: val, value: val }
        })
        .filter(tag => tag.label)

      if (JSON.stringify(selectedTags.value.map(t => t.value)) !== JSON.stringify(newTags.map(t => t.value))) {
        selectedTags.value = newTags
      }
    }
  },
  { immediate: true, deep: true }
)

// Handle select change
const handleSelectChange = (value: string | number | string[] | null) => {
  if (!value || typeof value === 'string' || typeof value === 'number') return

  const newValue = value as string[]
  const currentValues = selectedTags.value.map(t => t.value)

  const addedValues = newValue.filter(v => !currentValues.includes(v))
  const removedValues = currentValues.filter(v => !newValue.includes(v))

  for (const val of addedValues) {
    if (!isMaxReached.value) {
      const suggestion = localSuggestions.value.find(s => s.value === val)
      if (suggestion) {
        selectedTags.value = [...selectedTags.value, suggestion]
      }
    }
  }

  for (const val of removedValues) {
    selectedTags.value = selectedTags.value.filter(tag => tag.value !== val)
  }

  emit('update:modelValue', selectedTags.value.map(t => t.value))
}

const removeTag = (value: string) => {
  if (props.disabled) return
  selectedTags.value = selectedTags.value.filter(tag => tag.value !== value)
  emit('update:modelValue', selectedTags.value.map(t => t.value))
}

// Debounced search
const debouncedSearch = useDebounceFn(async (query: string) => {
  console.log('CategorySelect debounced search:', query)
  emit('search', query)
}, 300)

const handleSearch = (query: string) => {
  console.log('CategorySelect handleSearch:', query)
  debouncedSearch(query)
}

// При открытии дропдауна загружаем начальные данные
const handleOpen = () => {
  console.log('CategorySelect opened, hasLoadedInitial:', hasLoadedInitial.value)
  if (!hasLoadedInitial.value) {
    hasLoadedInitial.value = true
    emit('search', '')
  }
}

// Обработка внешних данных
const setSuggestions = (suggestions: CategoryItem[]) => {
  console.log('CategorySelect setSuggestions:', suggestions.length)
  localSuggestions.value = suggestions
}

defineExpose({
  setSuggestions,
  loadSelectedCategories
})
</script>
