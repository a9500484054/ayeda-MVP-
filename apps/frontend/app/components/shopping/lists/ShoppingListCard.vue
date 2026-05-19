<template>
  <div
    class="group relative cursor-grab active:cursor-grabbing"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div
      class="flex flex-col items-stretch justify-center rounded-lg border border-gray-200 bg-white p-6 pt-2.5 transition-all hover:border-primary-200 hover:shadow-md dark:border-darkMode-400 dark:bg-darkMode-50 dark:hover:bg-darkMode-100 pb-4.5"
    >
      <div class="mb-1.5 flex w-auto flex-row items-center justify-between">
        <h5 class="truncate text-lg font-bold tracking-tight text-gray-900 dark:text-darkMode-900">
          {{ list.title }}
        </h5>

        <div class="ml-2 flex w-auto flex-row items-center justify-between gap-2">
          <p class="text-xs font-medium text-gray-500">
            {{ checkedCount }}/{{ totalCount }}
          </p>

          <ShoppingListCardMenu
            :list="list"
            @rename="emit('rename', list)"
            @share="emit('share', list)"
            @copy="emit('copy', list)"
            @delete="emit('delete', list)"
          />
        </div>
      </div>

      <ProgressBar :progress="progress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
import ProgressBar from '../list/shared/ProgressBar.vue';
import ShoppingListCardMenu from './ShoppingListCardMenu.vue';

const props = defineProps<{
  list: ShoppingList;
  index: number;
}>();

const emit = defineEmits<{
  dragStart: [index: number];
  dragEnd: [];
  rename: [list: ShoppingList];
  share: [list: ShoppingList];
  copy: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

const totalCount = computed(() => props.list.items?.length || 0);
const checkedCount = computed(() => props.list.items?.filter(i => i.isChecked).length || 0);
const progress = computed(() => {
  if (totalCount.value === 0) return 0;
  return (checkedCount.value / totalCount.value) * 100;
});

function handleDragStart(event: DragEvent) {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'shoppingList',
    index: props.index,
    id: props.list.id,
  }));
  event.dataTransfer.effectAllowed = 'move';
  emit('dragStart', props.index);
}

function handleDragEnd() {
  emit('dragEnd');
}
</script>
