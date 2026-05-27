<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-500"
    :class="isListView ? 'flex flex-col md:flex-row' : 'flex flex-col'"
  >
    <!-- IMAGE SKELETON -->
    <div
      :class="[
        'relative overflow-hidden bg-zinc-200 flex-shrink-0',
        isListView ? 'md:w-60' : 'w-full'
      ]"
    >
      <div :class="isListView ? 'aspect-[4/3] h-full' : 'aspect-[16/10]'">
        <USkeleton class="w-full h-full" />
      </div>
    </div>

    <!-- CONTENT SKELETON -->
    <div
      :class="[
        'flex-1',
        isListView ? 'p-5 md:p-6' : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-5'
      ]"
    >
      <!-- Title -->
      <USkeleton class="h-6 w-3/4 rounded-lg" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />

      <!-- Description -->
      <div class="mt-2 space-y-2">
        <USkeleton class="h-4 w-full rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
        <USkeleton class="h-4 w-2/3 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
      </div>

      <!-- Meta -->
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <USkeleton class="h-4 w-16 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
        <USkeleton class="h-4 w-16 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
        <USkeleton class="h-4 w-16 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
      </div>

      <!-- Categories & Likes -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex flex-wrap gap-1">
          <USkeleton class="h-5 w-16 rounded-md" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
          <USkeleton class="h-5 w-16 rounded-md" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
        </div>
        <div class="flex items-center gap-4">
          <USkeleton class="h-4 w-8 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
          <USkeleton class="h-4 w-8 rounded" :class="isListView ? 'bg-zinc-200' : 'bg-white/20'" />
        </div>
      </div>

      <!-- Bottom bar for list view -->
      <div
        v-if="isListView"
        class="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4"
      >
        <USkeleton class="h-4 w-24 rounded bg-zinc-200" />
        <USkeleton class="h-8 w-32 rounded-lg bg-zinc-200" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  viewMode?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid'
})

const isListView = computed(() => props.viewMode === 'list')
</script>
