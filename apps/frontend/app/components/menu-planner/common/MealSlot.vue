<template>
  <div
    class="meal-slot min-h-[100px] rounded-xl border p-2 transition-all"
    :class="{
      'border-zinc-200 bg-white': !localDragOver && !isEmpty,
      'border-dashed border-zinc-300 bg-zinc-50': !localDragOver && isEmpty,
      'border-green-500 bg-green-50 ring-2 ring-green-300': localDragOver,
    }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="mb-2 flex items-center justify-between border-b border-zinc-100 pb-1">
      <span class="text-xs font-medium text-zinc-500">{{ mealLabel }}</span>
      <span v-if="itemsLength > 0" class="text-xs text-zinc-400">{{ itemsLength }}/{{ MAX_RECIPES }}</span>
    </div>

    <!-- Список рецептов -->
    <div v-if="!isEmpty" class="space-y-2">
      <div
        v-for="(item, index) in sortedItems"
        :key="item.id"
        class="recipe-item"
        :data-index="index"
      >
        <RecipeCardInSlot
          :item="item"
          :is-draggable="true"
          :slot-id="slotId"
          :drag-index="index"
          :max-items="MAX_RECIPES"
          @remove="emit('removeRecipe', item.id)"
          @edit-notes="(notes) => emit('editNotes', item.id, notes)"
          @drag-start="handleChildDragStart"
          @drag-end="handleChildDragEnd"
          @drag-over="handleItemDragOver"
          @drop="(event, idx) => handleItemDrop(event, idx)"
        />
      </div>
    </div>

    <!-- Пустой слот -->
    <div v-if="isEmpty && !isSearchMode" class="flex min-h-[60px] flex-col items-center justify-center">
      <button
        class="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-emerald-600 cursor-pointer"
        @click="startSearch"
      >
        <UIcon name="i-lucide-plus-circle" class="h-6 w-6" />
        <span class="text-xs">Добавить рецепт</span>
      </button>
    </div>

    <!-- Кнопка добавления -->
    <button
      v-if="!isEmpty && !isSearchMode && itemsLength < MAX_RECIPES"
      class="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 cursor-pointer"
      @click="startSearch"
    >
      <UIcon name="i-lucide-plus" class="h-3 w-3" />
      Добавить рецепт
    </button>

    <!-- Режим поиска -->
    <div v-if="isSearchMode" ref="searchContainerRef" class="mt-2">
      <Select
        ref="selectRef"
        v-model="selectedRecipeId"
        :options="recipeOptions"
        placeholder="Поиск рецептов..."
        searchable
        :loading="isSearching"
        @search="handleSearch"
        @close="handleSelectClose"
        @open="handleSelectOpen"
      >
        <template #options="{ options }">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
            @click="() => selectRecipe(option)"
          >
            <div class="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              <img
                v-if="option.image"
                :src="option.image"
                class="h-full w-full object-cover"
              />
              <UIcon v-else name="i-lucide-cooking-pot" class="h-full w-full p-1.5 text-zinc-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate font-medium text-zinc-900">{{ option.label }}</p>
              <p class="text-xs text-zinc-500">
                {{ option.cookingTime }} мин • {{ option.servings }} порц
              </p>
            </div>
            <div v-if="isRecipeAlreadyAdded(option.value)" class="text-emerald-600">
              <UIcon name="i-lucide-check" class="h-4 w-4" />
            </div>
          </button>
        </template>

        <template #empty>
          <div class="py-4 text-center">
            <p class="text-xs text-zinc-400">Ничего не найдено</p>
          </div>
        </template>
      </Select>
    </div>

    <!-- Лимит -->
    <div v-if="itemsLength >= MAX_RECIPES && !isSearchMode" class="mt-1 text-center text-xs text-orange-500">
      Максимум {{ MAX_RECIPES }} рецептов
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi'
import type { RecipeResponse } from '~/composables/useRecipesApi'
import RecipeCardInSlot from './RecipeCardInSlot.vue'
import Select from '~/shared/ui/select/Select.vue'
import type { SelectOption } from '~/shared/ui/select/Select.vue'

const MAX_RECIPES = 5

const props = defineProps<{
  slotId?: string
  items?: MenuSlotItem[]
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  isDragOver?: boolean
}>()

const emit = defineEmits<{
  addRecipe: [recipeId: string, notes?: string]
  removeRecipe: [itemId: string]
  editNotes: [itemId: string, notes: string]
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string]
  reorder: [slotId: string, items: { id: string; order: number }[]]
  requestCreateSlot: [dayId: string, mealType: string, recipeId: string, notes?: string]
  dragOverState: [state: boolean]
}>()

const config = useRuntimeConfig()
const selectRef = ref<InstanceType<typeof Select> | null>(null)
const searchContainerRef = ref<HTMLElement | null>(null)

const isSearchMode = ref(false)
const searchQuery = ref('')
const searchResults = ref<RecipeResponse[]>([])
const isSearching = ref(false)
const selectedRecipeId = ref<string | null>(null)
const localDragOver = ref(false)

const mealLabels: Record<string, string> = {
  breakfast: '🍳 Завтрак',
  lunch: '🍲 Обед',
  dinner: '🍽️ Ужин',
  snack: '🍎 Перекус',
}

const mealLabel = computed(() => mealLabels[props.mealType])

const sortedItems = computed(() => {
  if (!props.items) return []
  return [...props.items].sort((a, b) => a.order - b.order)
})

const itemsLength = computed(() => props.items?.length || 0)
const isEmpty = computed(() => itemsLength.value === 0)

const recipeOptions = computed<SelectOption[]>(() => {
  return searchResults.value.map(recipe => ({
    value: recipe.id,
    label: recipe.title,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    image: getImageUrl(recipe),
  }))
})

watch(() => props.isDragOver, (newValue) => {
  localDragOver.value = newValue
})

const getImageUrl = (recipe: RecipeResponse) => {
  const src = recipe.photo?.src
  if (!src) return ''
  if (src.startsWith('http')) return src
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  if (src.startsWith('/')) return `${apiUrl}${src}`
  return `${apiUrl}/${src}`
}


const isRecipeAlreadyAdded = (recipeId: string) => {
  return props.items?.some(item => item.recipeId === recipeId) || false
}

// Загрузка популярных рецептов
const loadPopularRecipes = async () => {
  if (searchResults.value.length > 0) return

  isSearching.value = true
  try {
    const { useRecipesApi } = await import('~/composables/useRecipesApi')
    const api = useRecipesApi()
    const result = await api.getRecipes({ page: 1, limit: 10 })

    let recipesData: RecipeResponse[] = []
    if (result?.data && Array.isArray(result.data)) {
      recipesData = result.data
    } else if (Array.isArray(result)) {
      recipesData = result
    }

    searchResults.value = recipesData
  } catch (error) {
    console.error('Error loading popular recipes:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// При открытии дропдауна
const handleSelectOpen = () => {
  if (searchResults.value.length === 0 && !searchQuery.value) {
    loadPopularRecipes()
  }
}

const searchRecipes = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true

  try {
    const { useRecipesApi } = await import('~/composables/useRecipesApi')
    const api = useRecipesApi()
    const result = await api.searchAllRecipes(searchQuery.value, { page: 1, limit: 10 })

    let recipesData: RecipeResponse[] = []
    if (result?.data && Array.isArray(result.data)) {
      recipesData = result.data
    } else if (Array.isArray(result)) {
      recipesData = result
    }

    searchResults.value = recipesData
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 400)

const handleSearch = (query: string) => {
  searchQuery.value = query
  searchRecipes()
}

const handleSelectClose = () => {
  if (isSearchMode.value) {
    cancelSearch()
  }
}

const cancelSearch = () => {
  isSearchMode.value = false
  searchQuery.value = ''
  searchResults.value = []
  selectedRecipeId.value = null
  isSearching.value = false
}

const startSearch = () => {
  isSearchMode.value = true
  searchQuery.value = ''
  searchResults.value = []

  nextTick(() => {
    selectRef.value?.open()
  })
}

const selectRecipe = (option: SelectOption) => {
  const recipeId = option.value as string
  if (isRecipeAlreadyAdded(recipeId)) return
  if (itemsLength.value >= MAX_RECIPES) return

  emit('addRecipe', recipeId)
  selectedRecipeId.value = null
  cancelSearch()
}

onClickOutside(searchContainerRef, () => {
  if (isSearchMode.value) {
    cancelSearch()
  }
})

function getDragData(event: DragEvent) {
  if (!event.dataTransfer) return null
  const raw = event.dataTransfer.getData('text/plain')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function handleItemDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  const target = event.currentTarget as HTMLElement
  target.classList.add('drag-over')
}

function handleItemDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault()
  event.stopPropagation()
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')

  const dragData = getDragData(event)
  if (!dragData || !props.slotId) return

  if (dragData.slotId !== props.slotId) {
    emit('moveRecipe', dragData.itemId, dragData.slotId, props.slotId)
    return
  }

  if (dragData.slotId === props.slotId && dragData.dragIndex !== undefined) {
    const fromIndex = dragData.dragIndex
    if (fromIndex === targetIndex) return

    const newItems = [...sortedItems.value]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(targetIndex, 0, movedItem)

    const reorderedItems = newItems.map((item, idx) => ({
      id: item.id,
      order: idx,
    }))

    emit('reorder', props.slotId!, reorderedItems)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  localDragOver.value = true
  emit('dragOverState', true)
}

function handleDragLeave(event: DragEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  if (relatedTarget && (event.currentTarget as HTMLElement).contains(relatedTarget)) {
    return
  }
  localDragOver.value = false
  emit('dragOverState', false)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  localDragOver.value = false
  emit('dragOverState', false)

  const dragData = getDragData(event)
  if (!dragData || !props.slotId) return
  event.stopPropagation()

  if (dragData.slotId !== props.slotId) {
    emit('moveRecipe', dragData.itemId, dragData.slotId, props.slotId)
  }
}

function handleChildDragStart() {}
function handleChildDragEnd() {
  setTimeout(() => {
    localDragOver.value = false
    emit('dragOverState', false)
  }, 100)
}
</script>

<style scoped>
.meal-slot {
  position: relative;
  transition: all 0.2s ease;
  min-height: 100px;
}

.recipe-item {
  transition: all 0.2s ease;
}

.recipe-item.drag-over {
  transform: translateY(4px);
  border-top: 2px solid #22c55e;
}
</style>
