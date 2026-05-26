<template>
  <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
    <!-- Search -->
    <Input
      v-model="localSearchQuery"
      placeholder="Поиск моих рецептов..."
      icon="i-lucide-search"
      class="min-w-[280px]"
      @update:model-value="handleSearchUpdate"
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
        v-if="viewOptions.length"
        :model-value="currentView"
        :options="viewOptions"
        size="md"
        @update:model-value="handleViewUpdate"
      />
    </div>

    <!-- Create Button -->
    <Button color="success" size="sm" @click="handleCreate">
      <UIcon name="i-lucide-plus" class="h-4 w-4" />
      <span>Создать рецепт</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Input from '~/shared/ui/input/Input.vue';
import ViewToggle from '~/shared/ui/view-toggle/ViewToggle.vue';
import Button from '~/shared/ui/button/Button.vue';

interface Props {
  searchQuery: string
  currentView: 'grid' | 'list'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:currentView': [value: 'grid' | 'list']
  'create': []
}>()

// Опции для ViewToggle
const viewOptions = [
  { value: 'grid', title: 'Сетка', icon: 'i-lucide-grid-2x2' },
  { value: 'list', title: 'Список', icon: 'i-lucide-list' }
]

// Локальное состояние для мгновенного обновления UI
const localSearchQuery = ref(props.searchQuery)

// Синхронизация с пропсом
watch(() => props.searchQuery, (newVal) => {
  localSearchQuery.value = newVal
})

// Debounced emit
const debouncedEmit = useDebounceFn((value: string) => {
  emit('update:searchQuery', value)
}, 400)

const handleSearchUpdate = (value: string) => {
  localSearchQuery.value = value
  debouncedEmit(value)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:searchQuery', '')
}

const handleViewUpdate = (value: 'grid' | 'list') => {
  emit('update:currentView', value)
}

const handleCreate = () => {
  emit('create')
}
</script>
