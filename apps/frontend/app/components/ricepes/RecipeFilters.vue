<template>
  <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
    <!-- Search -->
    <Input
      v-model="localSearchQuery"
      placeholder="Поиск рецептов..."
      icon="i-lucide-search"
      class="min-w-[280px]"
      @update:model-value="handleSearch"
    >
      <template #rightIcon>
        <button
          v-if="localSearchQuery"
          type="button"
          class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-darkMode-200"
          @click="clearSearch"
        >
          <UIcon name="i-lucide-x" class="h-3 w-3 text-gray-400" />
        </button>
      </template>
    </Input>

    <!-- View Switch -->
    <div class="hidden sm:block ml-auto">
      <ViewToggle
        :model-value="currentView"
        :options="viewOptions"
        size="md"
        @update:model-value="handleViewChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Input from '~/shared/ui/input/Input.vue'
import ViewToggle from '~/shared/ui/view-toggle/ViewToggle.vue'

interface Props {
  searchQuery: string
  currentView: 'grid-large' | 'grid-small' | 'list'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:currentView': [value: 'grid-large' | 'grid-small' | 'list']
}>()

// Локальное состояние для мгновенного обновления UI
const localSearchQuery = ref(props.searchQuery)

// Синхронизация с пропсом
watch(() => props.searchQuery, (newVal) => {
  localSearchQuery.value = newVal
})

// Опции для переключателя видов
const viewOptions = [
  { value: 'grid-small', title: 'Компактная сетка', icon: 'i-lucide-grid-3x3' },
  { value: 'grid-large', title: 'Большая сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', title: 'Список', icon: 'i-lucide-list' }
]

// Debounced search
const debouncedEmit = useDebounceFn((value: string) => {
  emit('update:searchQuery', value)
}, 400)

const handleSearch = (value: string) => {
  localSearchQuery.value = value
  debouncedEmit(value)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:searchQuery', '')
}

const handleViewChange = (value: 'grid-large' | 'grid-small' | 'list') => {
  emit('update:currentView', value)
}
</script>
