<!-- apps\frontend\app\components\shopping\lists\ShoppingListsGrid.vue -->
<template>
  <div ref="containerRef" class="flex flex-col gap-4">
    <ShoppingListCard
      v-for="(list, idx) in lists"
      :key="list.id"
      :list="list"
      :index="idx"
      @click="handleCardClick"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
      @rename="emit('rename', $event)"
      @share="emit('share', $event)"
      @copy="emit('copy', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
import { useSortable } from '@vueuse/integrations/useSortable';
import ShoppingListCard from './ShoppingListCard.vue';

const props = defineProps<{
  lists: ShoppingList[];
}>();

const emit = defineEmits<{
  reorder: [dragIndex: number, dropIndex: number];
  navigate: [listId: string];
  rename: [list: ShoppingList];
  share: [list: ShoppingList];
  copy: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

function handleCardClick(listId: string) {
  if (isDragging.value) return;
  emit('navigate', listId);
}

function handleDragStart() {
  isDragging.value = true;
}

function handleDragEnd() {
  isDragging.value = false;
}

// Используем Sortable для перетаскивания
useSortable(containerRef, {
  animation: 300,
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  dragClass: 'sortable-drag',
  onStart: () => {
    isDragging.value = true;
  },
  onEnd: (evt) => {
    isDragging.value = false;
    const { oldIndex, newIndex } = evt;
    if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
      emit('reorder', oldIndex, newIndex);
    }
  },
});
</script>

<style scoped>
/* Стили для SortableJS */
.sortable-ghost {
  opacity: 0.4;
  background-color: #f3f4f6;
  border: 1px dashed #10b981;
}

.sortable-drag {
  cursor: grabbing;
  opacity: 0.8;
}
</style>
