<template>
  <UCard>
    <div class="space-y-4">
      <UInput
        :model-value="searchQuery"
        placeholder="Поиск рецептов..."
        icon="i-lucide-search"
        @update:model-value="onSearchChange"
      />
      <div class="flex flex-wrap gap-4">
        <USelect
          :model-value="statusFilter"
          placeholder="Все статусы"
          :items="statusItems"
          class="w-48"
          clearable
          @update:model-value="onStatusChange"
        />

        <USelect
          :model-value="difficultyFilter"
          placeholder="Сложность"
          :items="difficultyItems"
          class="w-48"
          clearable
          @update:model-value="onDifficultyChange"
        />

        <USelect
          :model-value="typeFilter"
          placeholder="Тип"
          :items="typeItems"
          class="w-48"
          clearable
          @update:model-value="onTypeChange"
        />

        <div class="text-sm text-muted-foreground ml-auto">
          Всего: {{ totalRecipesCount }}
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  searchQuery: string
  statusFilter: string
  difficultyFilter: string
  typeFilter: string
  totalRecipesCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: string]
  'update:difficultyFilter': [value: string]
  'update:typeFilter': [value: string]
  'search': []
}>()

const statusItems = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Активен', value: 'active' },
  { label: 'Приватный', value: 'private' },
  { label: 'На модерации', value: 'pending' }
]

const difficultyItems = [
  { label: 'Легко', value: 'easy' },
  { label: 'Средне', value: 'medium' },
  { label: 'Сложно', value: 'hard' }
]

const typeItems = [
  { label: 'Личный', value: 'personal' },
  { label: 'Сообщества', value: 'community' }
]

const onSearchChange = (value: string) => {
  emit('update:searchQuery', value)
  emit('search')
}

const onStatusChange = (value: string) => {
  emit('update:statusFilter', value)
}

const onDifficultyChange = (value: string) => {
  emit('update:difficultyFilter', value)
}

const onTypeChange = (value: string) => {
  emit('update:typeFilter', value)
}
</script>
