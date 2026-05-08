<template>
  <div class="relative">
    <!-- Оригинальный InputTags -->
    <UInputTags
      ref="inputTagsRef"
      class="w-full"
      v-model="selectedTags"
      :placeholder="placeholder"
      :max="max"
      :ui="{ tag: 'max-w-full' }"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter.prevent="handleEnterKey"
    >
      <template #item-text="{ item }">
        {{ getLabelByValue(item) }}
      </template>
    </UInputTags>

    <!-- Выпадающий список подсказок -->
    <div
      v-if="showSuggestions && (filteredSuggestions.length > 0 || isLoadingSuggestions)"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <!-- Состояние загрузки -->
      <div
        v-if="isLoadingSuggestions"
        class="px-3 py-2 text-sm text-gray-400 flex items-center gap-2"
      >
        <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        Загрузка категорий...
      </div>

      <!-- Список подсказок -->
      <button
        v-for="suggestion in filteredSuggestions"
        v-else
        :key="suggestion.value"
        type="button"
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
        @click="addSuggestion(suggestion)"
      >
        <span>{{ suggestion.label }}</span>
        <span class="text-xs text-gray-400"> Enter </span>
      </button>

      <!-- Нет результатов -->
      <div
        v-if="!isLoadingSuggestions && filteredSuggestions.length === 0 && inputValue.length >= minQueryLength"
        class="px-3 py-2 text-sm text-gray-400"
      >
        Категории не найдены
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

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
const inputTagsRef = ref<any>()
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let blurTimeout: ReturnType<typeof setTimeout> | null = null

// Получить label по value
const getLabelByValue = (value: string) => {
  const suggestion = props.suggestions?.find(s => s.value === value)
  return suggestion?.label || value
}

// Проверка на максимальное количество
const isMaxReached = computed(() => selectedTags.value.length >= props.max)

// Синхронизация с родителем
watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(selectedTags.value) !== JSON.stringify(newVal)) {
    selectedTags.value = [...newVal]
  }
}, { deep: true })

// Отправка изменений родителю
watch(selectedTags, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// Фильтрация подсказок (исключаем уже выбранные)
const filteredSuggestions = computed(() => {
  if (!props.suggestions) return []

  const query = inputValue.value.toLowerCase()
  return props.suggestions.filter(suggestion => {
    const matchesQuery = suggestion.label.toLowerCase().includes(query)
    const notSelected = !selectedTags.value.includes(suggestion.value)
    return matchesQuery && notSelected
  })
})

// Очистка ввода
const clearInput = () => {
  if (inputTagsRef.value) {
    const inputElement = inputTagsRef.value.$el?.querySelector('input')
    if (inputElement) {
      inputElement.value = ''
    }
  }
  inputValue.value = ''
}

// Обработка ввода текста
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value || ''

  // Если достигнут максимум, не показываем подсказки
  if (isMaxReached.value) {
    showSuggestions.value = false
    return
  }

  if (inputValue.value.length >= props.minQueryLength) {
    showSuggestions.value = true

    // Дебаунс для поиска
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      emit('search', inputValue.value)
    }, props.debounceDelay)
  } else {
    showSuggestions.value = false
    // Если текст меньше минимальной длины, очищаем результаты поиска
    if (inputValue.value.length === 0) {
      emit('search', '')
    }
  }
}

// Добавление подсказки
const addSuggestion = (suggestion: SuggestionItem) => {
  // Проверяем максимальное количество
  if (selectedTags.value.length >= props.max) {
    showSuggestions.value = false
    clearInput()
    return
  }

  // Проверяем, не выбран ли уже
  if (!selectedTags.value.includes(suggestion.value)) {
    const newTags = [...selectedTags.value, suggestion.value]
    selectedTags.value = newTags
    emit('add', suggestion.value)

    // Очищаем поле ввода
    clearInput()
    showSuggestions.value = false

    // Сбрасываем поиск
    emit('search', '')
  }
}

// Обработка клавиши Enter
const handleEnterKey = () => {
  if (filteredSuggestions.value.length > 0) {
    addSuggestion(filteredSuggestions.value[0])
  }
}

const onFocus = () => {
  // Отменяем таймаут блюра если он был
  if (blurTimeout) {
    clearTimeout(blurTimeout)
    blurTimeout = null
  }

  if (!isMaxReached.value && inputValue.value.length >= props.minQueryLength) {
    showSuggestions.value = true
  }
}

const onBlur = () => {
  // Задержка, чтобы успел сработать клик по подсказке
  blurTimeout = setTimeout(() => {
    // Если есть невыбранный текст, очищаем его
    if (inputValue.value) {
      clearInput()
    }
    showSuggestions.value = false
    // Сбрасываем поиск
    emit('search', '')
  }, 200)
}

// Очистка таймаутов при размонтировании
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  if (blurTimeout) {
    clearTimeout(blurTimeout)
  }
})

// Сброс состояния при монтировании
onMounted(() => {
  // Если есть начальное значение и оно достигло максимума, блокируем добавление
  if (selectedTags.value.length >= props.max) {
    showSuggestions.value = false
  }
})
</script>
