<template>
  <div
    class="rounded-xl border border-zinc-200/80 bg-white overflow-hidden"
    :class="containerClass"
  >
    <!-- Image skeleton -->
    <div :class="imageContainerClass">
      <USkeleton class="w-full h-full" />
    </div>

    <!-- Content skeleton -->
    <div class="p-3" :class="contentClass">
      <!-- Title -->
      <USkeleton class="h-4 w-3/4 rounded" />

      <!-- Description -->
      <div class="mt-2 space-y-1">
        <USkeleton class="h-3 w-full rounded" />
        <USkeleton class="h-3 w-2/3 rounded" />
      </div>

      <!-- Categories -->
      <div class="mt-2 flex gap-1">
        <USkeleton class="h-5 w-12 rounded" />
        <USkeleton class="h-5 w-12 rounded" />
      </div>

      <!-- Meta info -->
      <div class="mt-2 flex items-center justify-between">
        <div class="flex gap-2">
          <USkeleton class="h-3 w-10 rounded" />
          <USkeleton class="h-3 w-10 rounded" />
        </div>
        <div class="flex gap-2">
          <USkeleton class="h-3 w-6 rounded" />
          <USkeleton class="h-3 w-6 rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  viewMode?: 'grid-large' | 'grid-small' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid-large'
})

const containerClass = computed(() => {
  if (props.viewMode === 'list') {
    return 'flex flex-col md:flex-row'
  }
  return 'flex flex-col'
})

const imageContainerClass = computed(() => {
  if (props.viewMode === 'list') {
    return 'md:w-[200px] md:flex-shrink-0 aspect-[3/2]'
  }
  return 'w-full aspect-[3/2]'
})

const contentClass = computed(() => {
  if (props.viewMode === 'list') {
    return 'flex-1'
  }
  return ''
})
</script>
