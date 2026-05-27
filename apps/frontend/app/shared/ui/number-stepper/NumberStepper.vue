<template>
  <div class="flex items-center gap-2">
    <!-- Десятичные/целые кнопки (опционально) -->
    <div
      v-if="showIntegerToggle && !readonly"
      class="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 mr-1"
    >
      <button
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100"
        :class="{ 'bg-zinc-100 text-emerald-600': !allowDecimal }"
        @click="setIntegerMode(true)"
      >
        <span class="text-xs font-medium">1</span>
      </button>
      <button
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100"
        :class="{ 'bg-zinc-100 text-emerald-600': allowDecimal }"
        @click="setIntegerMode(false)"
      >
        <span class="text-xs font-medium">1.5</span>
      </button>
    </div>

    <!-- Stepper controls -->
    <div
      class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-0.5 md:rounded-xl"
      :class="{
        'opacity-50 cursor-not-allowed': disabled,
        'border-red-300': error
      }"
    >
      <button
        :disabled="disabled || (min !== undefined && value <= min)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:w-8"
        :class="{ 'hover:bg-red-50 hover:text-red-600': value <= (min ?? 0) + 1 }"
        @click="decrement"
      >
        <UIcon name="i-lucide-minus" class="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>

      <!-- Input field -->
      <input
        v-if="editable && !readonly"
        :value="displayValue"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        :disabled="disabled"
        class="min-w-[60px] text-center text-xs font-medium outline-none focus:ring-0 disabled:bg-transparent md:min-w-[80px] md:text-sm"
        :class="{
          'text-zinc-900': !disabled,
          'text-zinc-400': disabled,
          'border-red-500': error
        }"
        @input="handleInput"
        @blur="handleBlur"
      />

      <span
        v-else
        class="min-w-[60px] text-center text-xs font-medium text-zinc-900 md:min-w-[80px] md:text-sm"
      >
        {{ displayValue }} {{ unit }}
      </span>

      <button
        :disabled="disabled || (max !== undefined && value >= max)"
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed md:h-8 md:w-8"
        :class="{ 'hover:bg-emerald-50 hover:text-emerald-600': value >= (max ?? Infinity) - 1 }"
        @click="increment"
      >
        <UIcon name="i-lucide-plus" class="h-3.5 w-3.5 md:h-4 md:w-4" />
      </button>
    </div>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  /** Текущее значение */
  modelValue: number
  /** Метка/единица измерения */
  unit?: string
  /** Минимальное значение */
  min?: number
  /** Максимальное значение */
  max?: number
  /** Шаг изменения */
  step?: number
  /** Разрешить десятичные числа */
  allowDecimal?: boolean
  /** Режим редактирования (можно вводить число) */
  editable?: boolean
  /** Только для чтения */
  readonly?: boolean
  /** Отключен */
  disabled?: boolean
  /** Ошибка */
  error?: string
  /** Показывать переключатель целые/десятичные */
  showIntegerToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  min: 1,
  max: 99,
  step: 1,
  allowDecimal: false,
  editable: true,
  readonly: false,
  disabled: false,
  error: '',
  showIntegerToggle: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'change': [value: number]
}>()

const isIntegerMode = ref(!props.allowDecimal)
const localValue = ref(props.modelValue)

// Синхронизация с пропсом
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

// Отображаемое значение
const displayValue = computed(() => {
  if (!props.allowDecimal && isIntegerMode.value) {
    return Math.round(localValue.value).toString()
  }
  return localValue.value.toString()
})

// Текущий шаг
const currentStep = computed(() => {
  if (!props.allowDecimal && isIntegerMode.value) {
    return 1
  }
  return props.step
})

// Установить режим целых чисел
const setIntegerMode = (integer: boolean) => {
  isIntegerMode.value = integer
  if (integer) {
    const newValue = Math.round(localValue.value)
    if (newValue !== localValue.value) {
      updateValue(newValue)
    }
  }
}

// Уменьшить значение
const decrement = () => {
  const step = currentStep.value
  let newValue = localValue.value - step

  if (props.min !== undefined && newValue < props.min) {
    newValue = props.min
  }

  updateValue(newValue)
}

// Увеличить значение
const increment = () => {
  const step = currentStep.value
  let newValue = localValue.value + step

  if (props.max !== undefined && newValue > props.max) {
    newValue = props.max
  }

  updateValue(newValue)
}

// Обработка ввода с клавиатуры
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let rawValue = target.value

  // Заменяем запятую на точку
  rawValue = rawValue.replace(',', '.')

  let newValue = parseFloat(rawValue)

  if (isNaN(newValue)) {
    newValue = props.min ?? 0
  }

  // Если режим целых чисел - округляем
  if (!props.allowDecimal && isIntegerMode.value) {
    newValue = Math.round(newValue)
  }

  // Ограничиваем min/max
  if (props.min !== undefined && newValue < props.min) {
    newValue = props.min
  }
  if (props.max !== undefined && newValue > props.max) {
    newValue = props.max
  }

  updateValue(newValue)
}

// Обработка потери фокуса
const handleBlur = () => {
  // Приводим к допустимому формату
  let newValue = localValue.value

  if (!props.allowDecimal && isIntegerMode.value) {
    newValue = Math.round(newValue)
  }

  if (props.min !== undefined && newValue < props.min) {
    newValue = props.min
  }
  if (props.max !== undefined && newValue > props.max) {
    newValue = props.max
  }

  updateValue(newValue)
}

// Обновление значения
const updateValue = (newValue: number) => {
  // Округляем до 2 знаков после запятой для десятичных
  if (props.allowDecimal && !isIntegerMode.value) {
    newValue = Math.round(newValue * 100) / 100
  }

  if (localValue.value !== newValue) {
    localValue.value = newValue
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }
}

// Expose методы для родительского компонента
defineExpose({
  reset: () => updateValue(props.min ?? 1),
  setValue: (value: number) => updateValue(value)
})
</script>

<style scoped>
/* Убираем стрелки у input type="number" */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
