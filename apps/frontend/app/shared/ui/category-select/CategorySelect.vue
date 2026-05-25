<template>
  <div class="space-y-2">
    <label v-if="label" class="mb-1.5 block text-sm font-medium" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Select для выбора категорий -->
      <Select
        :model-value="selectedValues"
        :options="availableOptions"
        :placeholder="placeholder"
        :disabled="disabled || isMaxReached"
        :error="error"
        multiple
        @update:model-value="handleSelectChange"
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
          <Button
            v-if="!disabled"
            color="primary"
            variant="ghost"
            size="xs"
            icon="i-lucide-x"
            icon-only
            class="!p-0.5 !h-4 !w-4 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800"
            @click="removeTag(tag.value)"
          />
        </span>
      </div>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Select from '../select/Select.vue'
import Button from '../button/Button.vue'

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
  suggestions?: CategoryItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Категории',
  placeholder: 'Выберите категории...',
  hint: 'Можно выбрать до 5 категорий',
  max: 5,
  suggestions: () => [],
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'search': [query: string]
  'add': [value: CategoryItem]
  'remove': [value: string]
}>()

const selectedTags = ref<CategoryItem[]>([])

// Текущие выбранные значения
const selectedValues = computed(() => {
  return selectedTags.value.map(tag => tag.value)
})

// Доступные опции (исключая уже выбранные)
const availableOptions = computed(() => {
  const selectedValuesSet = new Set(selectedTags.value.map(t => t.value))
  return props.suggestions
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

// Sync selected tags from modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    const newTags = newValue
      .map(val => {
        const found = props.suggestions.find(s => s.value === val)
        return found ? { label: found.label, value: found.value } : { label: val, value: val }
      })
      .filter(tag => tag.label)

    if (JSON.stringify(selectedTags.value.map(t => t.value)) !== JSON.stringify(newTags.map(t => t.value))) {
      selectedTags.value = newTags
    }
  },
  { immediate: true, deep: true }
)

// Handle select change
const handleSelectChange = (value: string | number | string[] | null) => {
  if (!value || typeof value === 'string' || typeof value === 'number') return

  const newValue = value as string[]
  const currentValues = selectedTags.value.map(t => t.value)

  // Find added values
  const addedValues = newValue.filter(v => !currentValues.includes(v))

  // Find removed values
  const removedValues = currentValues.filter(v => !newValue.includes(v))

  // Handle additions
  for (const val of addedValues) {
    if (!isMaxReached.value) {
      const suggestion = props.suggestions.find(s => s.value === val)
      if (suggestion) {
        selectedTags.value = [...selectedTags.value, suggestion]
        emit('add', suggestion)
      }
    }
  }

  // Handle removals
  for (const val of removedValues) {
    selectedTags.value = selectedTags.value.filter(tag => tag.value !== val)
    emit('remove', val)
  }
}

const removeTag = (value: string) => {
  if (props.disabled) return
  selectedTags.value = selectedTags.value.filter(tag => tag.value !== value)
  emit('remove', value)
}

// Search handler for Select
const handleSearch = (query: string) => {
  emit('search', query)
}

// Expose methods
defineExpose({
  clear: () => {
    selectedTags.value = []
  },
  addTag: (tag: CategoryItem) => {
    if (!isMaxReached.value && !selectedTags.value.some(t => t.value === tag.value)) {
      selectedTags.value = [...selectedTags.value, tag]
    }
  }
})
</script>
