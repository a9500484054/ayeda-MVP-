<template>
  <nav class="mb-4 flex items-center gap-2 text-sm md:mb-6">
    <Button
      variant="ghost"
      size="sm"
      @click="$emit('back')"
    >
      <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
      <span class="hidden sm:inline">Рецепты</span>
    </Button>
    <UIcon name="i-lucide-chevron-right" class="hidden h-4 w-4 text-zinc-300 sm:block" />
    <span class="truncate font-medium text-zinc-900">{{ title || 'Загрузка...' }}</span>
  </nav>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue'

interface Props {
  title?: string
}

defineProps<Props>()

defineEmits<{
  back: []
}>()
</script>
