<!-- apps\frontend\app\components\my-recipe\AutoCompleteTags.vue -->
<template>
  <div class="relative">
    <!-- Input -->
    <UInputTags
      ref="inputTagsRef"
      v-model="selectedTags"
      class="w-full"
      :placeholder="placeholder"
      :max="max"
      :ui="{ tag: 'max-w-full' }"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter.prevent="handleEnterKey"
    >
      <template #item-text="{ item }">
        {{ getLabelByValue(item) }}
      </template>
    </UInputTags>

    <!-- Suggestions -->
    <div
      v-if="showSuggestions"
      class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <!-- Loading -->
      <div
        v-if="isLoadingSuggestions"
        class="px-3 py-2 text-sm text-gray-400 flex items-center gap-2"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="w-4 h-4 animate-spin"
        />
        Загрузка категорий...
      </div>

      <!-- Suggestions -->
      <template v-else>
        <button
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.value"
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer"
          @mousedown.prevent="addSuggestion(suggestion)"
        >
          <span>{{ suggestion.label }}</span>
        </button>

        <!-- Empty -->
        <div
          v-if="filteredSuggestions.length === 0 && !isLoadingSuggestions"
          class="px-3 py-2 text-sm text-gray-400"
        >
          {{ inputValue.length > 0 ? 'Категории не найдены' : 'Нет доступных категорий' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'

export interface SuggestionItem {
  label: string
  value: string
}

interface Props {
  modelValue: string[]
  placeholder?: string
  suggestions?: SuggestionItem[]
  max?: number
  minQueryLength?: number
  debounceDelay?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Введите категорию...',
  max: 5,
  minQueryLength: 1,
  debounceDelay: 300,
  loading: false,
  suggestions: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'search': [query: string]
  'add': [value: string]
  'remove': [value: string]
}>()

const selectedTags = ref<string[]>([...props.modelValue])

const inputValue = ref('')
const showSuggestions = ref(false)
const isLoadingSuggestions = ref(false)

const inputTagsRef = ref<any>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
let blurTimeout: ReturnType<typeof setTimeout> | null = null
let isSearching = ref(false)

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const labelCache = new Map<string, string>()

const updateCache = () => {
  props.suggestions.forEach((item) => {
    labelCache.set(item.value, item.label)
  })
}

const getInputElement = (): HTMLInputElement | null => {
  return inputTagsRef.value?.$el?.querySelector('input') || null
}

const clearInput = async () => {
  inputValue.value = ''

  await nextTick()

  const input = getInputElement()

  if (input) {
    input.value = ''
  }
}

const getLabelByValue = (value: string) => {
  if (labelCache.has(value)) {
    return labelCache.get(value)
  }

  const found = props.suggestions.find(
    item => item.value === value
  )

  if (found) {
    labelCache.set(found.value, found.label)
    return found.label
  }

  return value
}

/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/

const isMaxReached = computed(() => {
  return selectedTags.value.length >= props.max
})

const filteredSuggestions = computed(() => {
  const query = inputValue.value
    .trim()
    .toLowerCase()

  let filtered = props.suggestions.filter((item) => {
    // exclude already selected
    if (selectedTags.value.includes(item.value)) {
      return false
    }

    // no query - show all
    if (!query) {
      return true
    }

    // filter by query
    return item.label
      .toLowerCase()
      .includes(query)
  })

  // limit results for performance
  return filtered.slice(0, 20)
})

/*
|--------------------------------------------------------------------------
| Watchers
|--------------------------------------------------------------------------
*/

// sync parent -> local
watch(
  () => props.modelValue,
  (value) => {
    if (JSON.stringify(selectedTags.value) !== JSON.stringify(value)) {
      selectedTags.value = [...value]
    }
  },
  { deep: true }
)

// sync local -> parent
watch(
  selectedTags,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true }
)

// loading state from parent
watch(
  () => props.loading,
  (value) => {
    isLoadingSuggestions.value = value
    if (!value) {
      isSearching.value = false
    }
  },
  { immediate: true }
)

// update cache when suggestions change
watch(
  () => props.suggestions,
  () => {
    updateCache()

    // turn off loading when we have data
    if (props.suggestions.length > 0) {
      isLoadingSuggestions.value = false
      isSearching.value = false
    }
  },
  {
    immediate: true,
    deep: true
  }
)

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const triggerSearch = (query: string) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Don't trigger if already searching with same query
  if (isSearching.value && query === '') {
    return
  }

  searchTimeout = setTimeout(() => {
    isSearching.value = true
    emit('search', query)
  }, props.debounceDelay)
}

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/

const onFocus = async () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }

  if (isMaxReached.value) {
    showSuggestions.value = false
    return
  }

  showSuggestions.value = true

  // Load all categories on focus if we don't have any
  if (props.suggestions.length === 0 && !isSearching.value) {
    isLoadingSuggestions.value = true
    triggerSearch('')
  }

  // If we already have categories, just show them
  if (props.suggestions.length > 0) {
    isLoadingSuggestions.value = false
  }
}

const onBlur = () => {
  blurTimeout = setTimeout(() => {
    showSuggestions.value = false
    clearInput()
  }, 150)
}

const handleEnterKey = () => {
  if (filteredSuggestions.value.length > 0) {
    addSuggestion(filteredSuggestions.value[0])
  }
}

const addSuggestion = async (suggestion: SuggestionItem) => {
  if (isMaxReached.value) {
    return
  }

  if (selectedTags.value.includes(suggestion.value)) {
    return
  }

  selectedTags.value = [
    ...selectedTags.value,
    suggestion.value
  ]

  emit('add', suggestion.value)

  await clearInput()

  // Keep dropdown opened if we can add more
  if (!isMaxReached.value) {
    showSuggestions.value = true

    // Reload categories to show updated list
    if (props.suggestions.length > 0) {
      // Just use existing suggestions, they will be filtered automatically
      isLoadingSuggestions.value = false
    } else {
      isLoadingSuggestions.value = true
      triggerSearch('')
    }
  }
}

/*
|--------------------------------------------------------------------------
| Input listener
|--------------------------------------------------------------------------
*/

const bindInputListener = () => {
  const input = getInputElement()

  if (!input) return

  input.addEventListener('input', handleInput)
}

const unbindInputListener = () => {
  const input = getInputElement()

  if (!input) return

  input.removeEventListener('input', handleInput)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  inputValue.value = target.value || ''

  if (isMaxReached.value) {
    showSuggestions.value = false
    return
  }

  showSuggestions.value = true

  // Search with query
  if (inputValue.value.length >= props.minQueryLength) {
    isLoadingSuggestions.value = true
    triggerSearch(inputValue.value)
  }

  // Empty query - load all categories
  if (inputValue.value.length === 0) {
    isLoadingSuggestions.value = true
    triggerSearch('')
  }
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  updateCache()

  await nextTick()

  bindInputListener()

  // Initial load of categories
  if (props.suggestions.length === 0) {
    isLoadingSuggestions.value = true
    triggerSearch('')
  }
})

onUnmounted(() => {
  unbindInputListener()

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (blurTimeout) {
    clearTimeout(blurTimeout)
  }
})
</script>
