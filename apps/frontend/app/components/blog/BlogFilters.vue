<template>
  <div class="flex flex-col md:flex-row gap-4 items-center justify-end max-w-6xl mx-auto w-full">
    <!-- <div class="flex gap-3 w-full md:w-auto">

    </div> -->

    <div class="flex gap-3 w-full md:w-auto w-full md:w-80">
      <Input
        v-model="localSearchQuery"
        placeholder="Поиск статей..."
        icon="i-lucide-search"
        @update:model-value="handleSearchChange"
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
      <Select
        :model-value="category"
        :options="categoryOptions"
        placeholder="Все категории"
        clearable
        class="w-48"
        @update:model-value="handleCategoryChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Select from '~/shared/ui/select/Select.vue'
import Input from '~/shared/ui/input/Input.vue'

interface Props {
  category: string | null
  search: string
  categories: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:category': [value: string | null]
  'update:search': [value: string]
}>()

// Локальное состояние для поиска
const localSearchQuery = ref(props.search)

// Синхронизация с пропсом
watch(() => props.search, (newVal) => {
  localSearchQuery.value = newVal
})

// Опции для Select
const categoryOptions = computed(() => {
  return props.categories.map(cat => ({
    value: cat,
    label: cat
  }))
})

// Обработчики
const handleCategoryChange = (value: string | number | null) => {
  emit('update:category', value as string | null)
}

const debouncedSearch = useDebounceFn((value: string) => {
  emit('update:search', value)
}, 400)

const handleSearchChange = (value: string) => {
  localSearchQuery.value = value
  debouncedSearch(value)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:search', '')
}
</script>
