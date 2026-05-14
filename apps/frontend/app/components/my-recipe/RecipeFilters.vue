<!-- components/recipe/RecipeFilters.vue -->
<template>
  <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
    <!-- Search -->
    <div class="relative min-w-[280px]">
      <UIcon name="i-lucide-search" class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        :value="searchQuery"
        type="text"
        placeholder="Поиск моих рецептов..."
        class="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-900"
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        @click="clearSearch"
      >
        <UIcon name="i-lucide-x" class="h-4 w-4" />
      </button>
    </div>

    <!-- View Switch -->
    <div class="hidden sm:block ml-auto">
      <div class="flex h-11 items-center rounded-2xl border border-zinc-200 bg-white p-1">
        <button
          v-for="view in views"
          :key="view.value"
          class="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
          :class="currentView === view.value ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800' : 'text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600'"
          :title="view.title"
          @click="$emit('update:currentView', view.value)"
        >
          <UIcon :name="view.icon" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Create Button -->
    <Button color="success" size="sm" @click="$emit('create')">
      <UIcon name="i-lucide-plus" class="h-4 w-4" />
      <span>Создать рецепт</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';

const props = defineProps<{
  searchQuery: string
  currentView: 'grid' | 'list'
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:currentView': [value: 'grid' | 'list']
  'create': []
  'clear-search': []
}>()

const views = [
  { value: 'grid', title: 'Большая сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', title: 'Список', icon: 'i-lucide-list' }
]

let searchDebounceTimer: NodeJS.Timeout | null = null

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    emit('update:searchQuery', target.value)
  }, 400)
}

const clearSearch = () => {
  emit('update:searchQuery', '')
  emit('clear-search')
}
</script>
