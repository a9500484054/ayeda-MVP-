<!-- apps/frontend/app/components/menu-planner/common/MealSlot.vue -->
<template>
  <div
    class="meal-slot min-h-[100px] rounded-xl border p-2 transition-all"
    :class="{
      'border-zinc-200 bg-white': !isDragOver && !isEmpty && isDayCreated,
      'border-dashed border-zinc-300 bg-zinc-50': !isDragOver && (isEmpty || !isDayCreated),
      'border-green-300 bg-green-50': isDragOver,
      'opacity-60': !isDayCreated,
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Заголовок приема пищи -->
    <div class="mb-2 flex items-center justify-between border-b border-zinc-100 pb-1">
      <span class="text-xs font-medium text-zinc-500">
        {{ mealLabel }}
      </span>
      <span v-if="itemsLength > 0" class="text-xs text-zinc-400">
        {{ itemsLength }}/10
      </span>
    </div>

    <!-- Если день не создан -->
    <div v-if="!isDayCreated" class="flex min-h-[60px] flex-col items-center justify-center">
      <div class="text-center text-xs text-zinc-400">
        День не создан
      </div>
    </div>

    <!-- Пустой слот -->
    <div v-else-if="isEmpty" class="flex min-h-[60px] flex-col items-center justify-center">
      <button
        class="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-green-600"
        @click="emit('addRecipe')"
      >
        <UIcon name="i-lucide-plus-circle" class="h-6 w-6" />
        <span class="text-xs">Добавить рецепт</span>
      </button>
    </div>

    <!-- Рецепты в слоте -->
    <div v-else class="space-y-2">
      <RecipeCardInSlot
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        :is-draggable="itemsLength > 1"
        @remove="emit('removeRecipe', item.id)"
        @edit-notes="emit('editNotes', item.id, item.notes)"
        @drag-start="handleItemDragStart($event, item)"
        @drag-end="handleItemDragEnd"
      />

      <!-- Кнопка добавить еще -->
      <button
        v-if="itemsLength < 10"
        class="mt-1 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
        @click="emit('addRecipe')"
      >
        <UIcon name="i-lucide-plus" class="h-3 w-3" />
        Добавить рецепт
      </button>

      <!-- Предупреждение о лимите -->
      <div v-if="itemsLength >= 10" class="mt-1 text-center text-xs text-orange-500">
        Максимум 10 рецептов
      </div>
    </div>

    <!-- Индикатор перетаскивания -->
    <div v-if="isDragOver" class="absolute inset-0 flex items-center justify-center rounded-xl bg-green-500/10">
      <UIcon name="i-lucide-copy" class="h-6 w-6 text-green-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi';
import RecipeCardInSlot from './RecipeCardInSlot.vue';

const props = defineProps<{
  slotId?: string;
  items?: MenuSlotItem[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isDragOver?: boolean;
  isDayCreated?: boolean; // Добавляем проп для проверки, создан ли день
}>();

const emit = defineEmits<{
  addRecipe: [];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  dragStart: [slotId: string];
  dragOver: [];
  dragLeave: [];
  drop: [recipeId: string];
  itemDragStart: [itemId: string, slotId: string];
  itemDragEnd: [];
}>();

const mealLabels: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

const mealLabel = computed(() => mealLabels[props.mealType]);
const sortedItems = computed(() => {
  if (!props.items) return [];
  return [...props.items].sort((a, b) => a.order - b.order);
});
const itemsLength = computed(() => props.items?.length || 0);
const isEmpty = computed(() => itemsLength.value === 0);

function handleDragStart(event: DragEvent) {
  if (props.slotId) {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'slot',
      slotId: props.slotId,
    }));
    event.dataTransfer!.effectAllowed = 'copy';
    emit('dragStart', props.slotId);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  emit('dragOver');
}

function handleDragLeave() {
  emit('dragLeave');
}

function handleDrop(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'recipe' && parsed.recipeId) {
        emit('drop', parsed.recipeId);
      }
    } catch (e) {
      console.error('Failed to parse drag data:', e);
    }
  }
  emit('dragLeave');
}

function handleItemDragStart(event: DragEvent, item: MenuSlotItem) {
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    type: 'slotItem',
    itemId: item.id,
    slotId: props.slotId,
    recipeId: item.recipeId,
  }));
  event.dataTransfer!.effectAllowed = 'move';
  emit('itemDragStart', item.id, props.slotId!);
}

function handleItemDragEnd() {
  emit('itemDragEnd');
}
</script>

<style scoped>
.meal-slot {
  position: relative;
  transition: all 0.2s ease;
}

.meal-slot.dragover {
  border-color: rgb(34 197 94);
  background-color: rgb(240 253 244);
}
</style>
