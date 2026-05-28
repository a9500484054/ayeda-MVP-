<template>
  <UModal
    :open="open"
    :ui="{
      overlay: 'bg-black/50 backdrop-blur-sm',
      container: 'flex items-center justify-center p-4',
      content: contentClass
    }"
    @update:open="handleClose"
  >
    <template #content>
      <div class="p-6">
        <slot />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  open: boolean
  closeOnOverlay?: boolean
  size?: ModalSize
  /** Кастомный класс для контента */
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true,
  size: 'md',
  contentClass: ''
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] w-full'
}

const handleClose = (value: boolean) => {
  if (!value && props.closeOnOverlay) {
    emit('update:open', false)
  }
}

const contentClass = computed(() => {
  const baseClass = 'bg-white rounded-xl shadow-xl dark:bg-darkMode-100'
  const sizeClass = sizeClasses[props.size]

  if (props.contentClass) {
    return `${baseClass} ${sizeClass} ${props.contentClass}`
  }
  return `${baseClass} ${sizeClass}`
})
</script>
