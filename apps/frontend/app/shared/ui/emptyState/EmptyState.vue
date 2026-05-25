<!-- apps\frontend\app\shared\ui\emptyState\EmptyState.vue -->
<template>
  <div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-24 min-h-[70vh] dark:border-darkMode-300 dark:bg-darkMode-100">
    <UIcon :name="icon" class="h-16 w-16 text-gray-300 dark:text-darkMode-400" />
    <h2 class="mt-5 text-xl font-semibold text-gray-900 dark:text-darkMode-700">
      {{ title }}
    </h2>
    <p class="mt-2 text-sm text-gray-500 dark:text-darkMode-500">
      {{ description }}
    </p>
    <slot name="actions">
      <Button
        v-if="actionText"
        size="md"
        variant="solid"
        color="primary"
        class="mt-6"
        @click="$emit('action')"
      >
        {{ actionText }}
      </Button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import Button from '../button/Button.vue';


interface Props {
  title: string
  description?: string
  icon?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  icon: 'i-lucide-inbox',
  actionText: ''
})

defineEmits<{
  action: []
}>()
</script>
