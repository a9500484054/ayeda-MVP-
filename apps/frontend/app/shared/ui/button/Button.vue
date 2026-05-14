<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <!-- Иконка слева или спиннер при загрузке -->
    <UIcon
      v-if="loading && iconPosition === 'left' && !iconOnly"
      name="i-lucide-loader-2"
      :class="[iconClasses, 'animate-spin']"
    />
    <UIcon
      v-else-if="icon && iconPosition === 'left' && !loading"
      :name="icon"
      :class="iconClasses"
    />

    <!-- Текст или слот -->
    <span v-if="!iconOnly && !loading && text">{{ text }}</span>
    <span v-else-if="!iconOnly && loading && !text">Загрузка...</span>
    <slot v-else-if="!iconOnly && !text" />

    <!-- Иконка справа -->
    <UIcon
      v-if="icon && iconPosition === 'right' && !loading && !iconOnly"
      :name="icon"
      :class="iconClasses"
    />
    <UIcon
      v-if="loading && iconPosition === 'right' && !iconOnly"
      name="i-lucide-loader-2"
      :class="[iconClasses, 'animate-spin']"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

interface Props {
  // Основное содержимое
  text?: string
  // Иконка (Lucide icon name)
  icon?: string
  // Позиция иконки
  iconPosition?: IconPosition
  // Цвет кнопки
  color?: ButtonColor
  // Размер кнопки
  size?: ButtonSize
  // Вариант стиля
  variant?: 'solid' | 'outline' | 'ghost'
  // Показывать только иконку (без текста)
  iconOnly?: boolean
  // Блок (100% ширина)
  block?: boolean
  // Состояние загрузки
  loading?: boolean
  // Отключена
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  icon: undefined,
  iconPosition: 'left',
  color: 'primary',
  size: 'md',
  variant: 'solid',
  iconOnly: false,
  block: false,
  loading: false,
  disabled: false
})

// Базовые классы
const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none'

// Размеры для обычных кнопок
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl'
}

// Размеры для iconOnly кнопок
const iconOnlySizeClasses: Record<ButtonSize, string> = {
  xs: 'p-1 rounded-md',
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-lg',
  lg: 'p-2.5 rounded-xl'
}

// Размеры иконок
const iconSizeClasses: Record<ButtonSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
}

// Цветовые схемы
const colorClasses: Record<ButtonColor, Record<'solid' | 'outline' | 'ghost', string>> = {
  primary: {
    solid: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500',
    ghost: 'text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
  },
  secondary: {
    solid: 'bg-zinc-600 text-white hover:bg-zinc-700 focus:ring-zinc-500 active:bg-zinc-800',
    outline: 'border-2 border-zinc-600 text-zinc-600 hover:bg-zinc-50 focus:ring-zinc-500',
    ghost: 'text-zinc-600 hover:bg-zinc-50 focus:ring-zinc-500'
  },
  danger: {
    solid: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-red-600 hover:bg-red-50 focus:ring-red-500'
  },
  success: {
    solid: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500',
    ghost: 'text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500'
  },
  warning: {
    solid: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 active:bg-amber-800',
    outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50 focus:ring-amber-500',
    ghost: 'text-amber-600 hover:bg-amber-50 focus:ring-amber-500'
  },
  info: {
    solid: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  },
  neutral: {
    solid: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500 active:bg-zinc-300',
    outline: 'border-2 border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500',
    ghost: 'text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500'
  }
}

const buttonClasses = computed(() => {
  const colorScheme = colorClasses[props.color][props.variant]
  const sizeClass = props.iconOnly ? iconOnlySizeClasses[props.size] : sizeClasses[props.size]
  const blockClass = props.block ? 'w-full' : ''
  const loadingClass = props.loading ? 'cursor-wait' : ''

  return [
    baseClasses,
    colorScheme,
    sizeClass,
    blockClass,
    loadingClass
  ].filter(Boolean).join(' ')
})

const iconClasses = computed(() => {
  const baseIconClasses = 'flex-shrink-0'
  const sizeClass = iconSizeClasses[props.size]

  return [baseIconClasses, sizeClass].filter(Boolean).join(' ')
})
</script>
