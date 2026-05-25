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
            class="h-4 w-4 transition-colors"
            :class="iconClass"
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
        class="w-full rounded-xl border outline-none transition-all placeholder:text-sm disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-darkMode-200"
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
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  readonly: false
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

const inputClass = computed(() => {
  const baseClass = 'h-11 text-sm text-gray-900 dark:text-darkMode-700 focus:ring-2'
  const borderClass = props.error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-600'
    : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:focus:ring-emerald-900/20'

  // Определяем отступы в зависимости от наличия иконок
  let padding = 'px-4'
  if (hasLeftIcon.value) {
    padding = 'pl-9 pr-4'
  }
  if (hasRightIcon.value) {
    padding = padding.replace('pr-4', 'pr-9')
  }

  const disabledClass = props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  const readonlyClass = props.readonly ? 'cursor-pointer' : ''

  return `${baseClass} ${borderClass} ${padding} ${disabledClass} ${readonlyClass}`.trim()
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
</script>
