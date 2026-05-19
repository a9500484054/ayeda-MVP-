<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <ShoppingListCard
      v-for="(list, idx) in lists"
      :key="list.id"
      :list="list"
      :index="idx"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
      @rename="emit('rename', $event)"
      @share="emit('share', $event)"
      @copy="emit('copy', $event)"
      @delete="emit('delete', $event)"
      @drop="(e) => handleDrop(e, idx)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
import ShoppingListCard from './ShoppingListCard.vue';

const props = defineProps<{
  lists: ShoppingList[];
}>();

const emit = defineEmits<{
  reorder: [dragIndex: number, dropIndex: number];
  rename: [list: ShoppingList];
  share: [list: ShoppingList];
  copy: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

let dragStartIndex = -1;

function handleDragStart(index: number) {
  dragStartIndex = index;
}

function handleDragEnd() {
  dragStartIndex = -1;
}

function handleDrop(event: DragEvent, dropIndex: number) {
  event.preventDefault();
  if (dragStartIndex !== -1 && dragStartIndex !== dropIndex) {
    emit('reorder', dragStartIndex, dropIndex);
  }
  dragStartIndex = -1;
}
</script>
