<template>
  <div
    class="flex items-center rounded-2xl border border-gray-200 bg-white p-1 dark:border-darkMode-300 dark:bg-darkMode-100"
    :class="containerClass"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
      :class="[
        getButtonClass(option.value),
        sizeClass,
        option.value === modelValue ? activeButtonClass : inactiveButtonClass
      ]"
      :title="option.title"
      :disabled="disabled || option.disabled"
      @click="handleClick(option.value)"
    >
      <UIcon
        v-if="option.icon"
        :name="option.icon"
        class="h-4 w-4"
        :class="option.value === modelValue ? activeIconClass : inactiveIconClass"
      />
      <span v-if="option.label && showLabels" class="ml-2 text-sm">
        {{ option.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ToggleOption<T = string> {
  value: T
  title?: string
  label?: string
  icon?: string
  disabled?: boolean
}

interface Props<T = string> {
  modelValue: T
  options: ToggleOption<T>[]
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  disabled?: boolean
  // Кастомные классы для стилизации
  containerClass?: string
  activeButtonClass?: string
  inactiveButtonClass?: string
  activeIconClass?: string
  inactiveIconClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabels: false,
  disabled: false,
  containerClass: '',
  activeButtonClass: '',
  inactiveButtonClass: '',
  activeIconClass: '',
  inactiveIconClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
}>()

// Размеры кнопок
const sizeClasses: Record<string, string> = {
  sm: 'h-7 w-7 min-w-[28px]',
  md: 'h-9 w-9 min-w-[36px]',
  lg: 'h-11 w-11 min-w-[44px]'
}

const sizeClass = computed(() => sizeClasses[props.size])

// Стандартные классы для активного состояния
const defaultActiveButtonClass = 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800'
const defaultInactiveButtonClass = 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-darkMode-500 dark:hover:bg-emerald-900/20'
const defaultActiveIconClass = 'text-white'
const defaultInactiveIconClass = 'text-gray-500 group-hover:text-emerald-600'

const getButtonClass = (value: any) => {
  const isActive = props.modelValue === value
  const baseClass = sizeClass.value

  if (isActive) {
    const activeClass = props.activeButtonClass || defaultActiveButtonClass
    return `${baseClass} ${activeClass}`
  } else {
    const inactiveClass = props.inactiveButtonClass || defaultInactiveButtonClass
    return `${baseClass} ${inactiveClass}`
  }
}

const handleClick = (value: any) => {
  if (props.disabled) return

  const option = props.options.find(opt => opt.value === value)
  if (option?.disabled) return

  if (props.modelValue !== value) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}
</script>
