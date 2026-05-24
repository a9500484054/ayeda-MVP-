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
    <!-- Заголовок -->
    <div class="mb-2 flex items-center justify-between border-b border-zinc-100 pb-1">
      <span class="text-xs font-medium text-zinc-500">{{ mealLabel }}</span>
      <span v-if="itemsLength > 0" class="text-xs text-zinc-400">{{ itemsLength }}/10</span>
    </div>

    <!-- Пустой слот -->
    <div v-if="isEmpty" class="flex min-h-[60px] flex-col items-center justify-center">
      <button
        class="flex flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-green-600 cursor-pointer"
        @click="emit('addRecipe')"
      >
        <UIcon name="i-lucide-plus-circle" class="h-6 w-6" />
        <span class="text-xs">Добавить рецепт</span>
      </button>
    </div>

    <!-- Рецепты -->
    <div v-else class="space-y-2">
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
          @remove="emit('removeRecipe', item.id)"
          @edit-notes="(notes) => emit('editNotes', item.id, notes)"
          @drag-start="handleChildDragStart"
          @drag-end="handleChildDragEnd"
          @drag-over="handleItemDragOver"
          @drop="(event, idx) => handleItemDrop(event, idx)"
        />
      </div>
    </div>

    <!-- Кнопка добавления (для непустого слота) -->
    <button
      v-if="!isEmpty && itemsLength < 10"
      class="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 cursor-pointer"
      @click="emit('addRecipe')"
    >
      <UIcon name="i-lucide-plus" class="h-3 w-3" />
      Добавить рецепт
    </button>

    <div v-if="itemsLength >= 10" class="mt-1 text-center text-xs text-orange-500">
      Максимум 10 рецептов
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
}>();

const emit = defineEmits<{
  addRecipe: [];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
  requestCreateSlot: [dayId: string, mealType: string, recipeId: string, notes?: string];
  dragOverState: [state: boolean];
}>();

const mealLabels: Record<string, string> = {
  breakfast: '🍳 Завтрак',
  lunch: '🍲 Обед',
  dinner: '🍽️ Ужин',
  snack: '🍎 Перекус',
};

const mealLabel = computed(() => mealLabels[props.mealType]);

const sortedItems = computed(() => {
  if (!props.items) return [];
  return [...props.items].sort((a, b) => a.order - b.order);
});

const itemsLength = computed(() => props.items?.length || 0);
const isEmpty = computed(() => itemsLength.value === 0);

// Локальное состояние drag-over для анимации
const localDragOver = ref(false);

// Следим за внешним состоянием
watch(() => props.isDragOver, (newValue) => {
  localDragOver.value = newValue;
});

function getDragData(event: DragEvent) {
  if (!event.dataTransfer) return null;
  const raw = event.dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Обработчики для переупорядочивания (drop на рецепт)
function handleItemDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  const target = event.currentTarget as HTMLElement;
  target.classList.add('drag-over');
}

function handleItemDrop(event: DragEvent, targetIndex: number) {
  event.preventDefault();
  event.stopPropagation();
  const target = event.currentTarget as HTMLElement;
  target.classList.remove('drag-over');

  const dragData = getDragData(event);
  if (!dragData || !props.slotId) return;

  if (dragData.slotId !== props.slotId) {
    emit('moveRecipe', dragData.itemId, dragData.slotId, props.slotId);
    return;
  }

  // Только переупорядочивание внутри одного слота
  if (dragData.slotId === props.slotId && dragData.dragIndex !== undefined) {
    const fromIndex = dragData.dragIndex;
    if (fromIndex === targetIndex) return;

    const newItems = [...sortedItems.value];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    const reorderedItems = newItems.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    emit('reorder', props.slotId!, reorderedItems);
  }
}

// Обработчики для перемещения между слотами (drop на сам слот)
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  localDragOver.value = true;
  emit('dragOverState', true);
}

function handleDragLeave(event: DragEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (relatedTarget && (event.currentTarget as HTMLElement).contains(relatedTarget)) {
    return;
  }
  localDragOver.value = false;
  emit('dragOverState', false);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  localDragOver.value = false;
  emit('dragOverState', false);

  const dragData = getDragData(event);
  if (!dragData || !props.slotId) return;
  event.stopPropagation();

  // Перемещение между слотами (только если source и target разные)
  if (dragData.slotId !== props.slotId) {
    console.log('Moving recipe via MealSlot drop:', {
      itemId: dragData.itemId,
      sourceSlotId: dragData.slotId,
      targetSlotId: props.slotId
    });
    emit('moveRecipe', dragData.itemId, dragData.slotId, props.slotId);
  }
}

// Обработчики от дочернего компонента
function handleChildDragStart() {
  // Можно добавить логику при начале перетаскивания
}

function handleChildDragEnd() {
  // Убеждаемся, что после перетаскивания фон сбрасывается
  setTimeout(() => {
    localDragOver.value = false;
    emit('dragOverState', false);
  }, 100);
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
