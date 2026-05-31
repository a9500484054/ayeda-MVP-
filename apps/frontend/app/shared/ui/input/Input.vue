<template>
  <div class="group">
    <label v-if="label" class="mb-1.5 block text-sm font-medium" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <!-- Левый слот для иконки -->
      <div v-if="hasLeftIcon" class="absolute left-3 top-1/2 -translate-y-1/2">
        <slot name="leftIcon">
          <UIcon
            v-if="icon"
            :name="icon"
            class="transition-colors"
            :class="[iconSizeClass, iconClass]"
          />
        </slot>
      </div>

      <!-- Правый слот для иконки -->
      <div v-if="hasRightIcon" class="absolute right-3 top-1/2 -translate-y-1/2">
        <slot name="rightIcon" />
      </div>

      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        class="w-full rounded-xl  border outline-none transition-all placeholder:text-sm disabled:cursor-not-allowed bg-white disabled:bg-gray-100 dark:disabled:bg-darkMode-200"
        :class="inputClass"
        @input="handleInput"
        @blur="handleBlur"
        @click="$emit('click')"
        v-bind="$attrs"
      />
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

type InputSize = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
  modelValue: string | number
  label?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  placeholder?: string
  icon?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: InputSize
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'click': []
}>()

const slots = useSlots()

const hasLeftIcon = computed(() => {
  return !!(props.icon || slots.leftIcon)
})

const hasRightIcon = computed(() => {
  return !!slots.rightIcon
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleBlur = () => {
  emit('blur')
}

// Размеры для инпута
const sizeClasses: Record<InputSize, string> = {
  xs: 'h-8 text-xs',
  sm: 'h-9 text-sm',
  md: 'h-11 text-sm',
  lg: 'h-12 text-base'
}

// Размеры для иконок
const iconSizeClasses: Record<InputSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
}

// Отступы для разных размеров
const paddingClasses = computed(() => {
  const paddingMap: Record<InputSize, { left: string; right: string }> = {
    xs: { left: 'pl-7', right: 'pr-7' },
    sm: { left: 'pl-8', right: 'pr-8' },
    md: { left: 'pl-9', right: 'pr-9' },
    lg: { left: 'pl-10', right: 'pr-10' }
  }

  const defaultPadding = { left: 'pl-4', right: 'pr-4' }
  const padding = paddingMap[props.size]

  let leftPadding = defaultPadding.left
  let rightPadding = defaultPadding.right

  if (hasLeftIcon.value && padding) {
    leftPadding = padding.left
  }
  if (hasRightIcon.value && padding) {
    rightPadding = padding.right
  }

  return `${leftPadding} ${rightPadding}`
})

const inputClass = computed(() => {
  const baseClass = `w-full rounded-xl border outline-none transition-all placeholder:text-sm disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-darkMode-200 ${sizeClasses[props.size]}`
  const borderClass = props.error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-600'
    : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:focus:ring-emerald-900/20'

  const disabledClass = props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  const readonlyClass = props.readonly ? 'cursor-pointer' : ''

  return `${baseClass} ${borderClass} ${paddingClasses.value} ${disabledClass} ${readonlyClass}`.trim()
})

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

const iconClass = computed(() => {
  return props.error
    ? 'text-red-500 group-focus-within:text-red-500'
    : 'text-gray-400 group-focus-within:text-emerald-500'
})

const iconSizeClass = computed(() => {
  return iconSizeClasses[props.size]
})
</script>
