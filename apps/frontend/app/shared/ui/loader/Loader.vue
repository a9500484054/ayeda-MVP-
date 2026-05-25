<template>
  <div
    class="inline-flex items-center justify-center"
    :class="[
      containerClass,
      { 'w-full': fullWidth }
    ]"
  >
    <div
      class="animate-spin rounded-full border-2 border-current border-t-transparent"
      :class="[
        sizeClass,
        colorClass
      ]"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderWidth}px`
      }"
    />
    <span v-if="text" class="ml-3" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  text?: string
  textClass?: string
  fullWidth?: boolean
  borderWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  text: '',
  textClass: 'text-gray-500',
  fullWidth: false,
  borderWidth: 2
})

const sizeMap: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40
}

const sizeValue = computed(() => {
  return typeof props.size === 'number' ? props.size : sizeMap[props.size]
})

const sizeClass = computed(() => {
  const size = sizeValue.value
  return `w-${size / 4} h-${size / 4}`
})

const colorClass = computed(() => {
  const colorMap = {
    primary: 'text-emerald-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  }
  return colorMap[props.color]
})

const containerClass = computed(() => {
  return props.fullWidth ? 'flex justify-center py-4' : ''
})
</script>
