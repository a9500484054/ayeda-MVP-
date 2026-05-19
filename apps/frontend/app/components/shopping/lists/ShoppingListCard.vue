<template>
  <div class="group relative">
    <!-- Кликабельная область для перехода -->
    <div
      class="flex flex-col items-stretch justify-center rounded-lg border border-gray-200 bg-white p-6 pt-2.5 transition-all hover:border-primary-200 hover:shadow-md dark:border-darkMode-400 dark:bg-darkMode-50 dark:hover:bg-darkMode-100 pb-4.5 cursor-pointer"
      @click="emit('click', list.id)"
    >
      <div class="mb-1.5 flex w-auto flex-row items-center justify-between">
        <h5 class="truncate text-lg font-bold tracking-tight text-gray-900 dark:text-darkMode-900">
          {{ list.title }}
        </h5>

        <div class="ml-2 flex w-auto flex-row items-center justify-between gap-2">
          <p class="text-xs font-medium text-gray-500">
            {{ checkedCount }}/{{ totalCount }}
          </p>

          <!-- Меню не должно триггерить переход -->
          <div @click.stop>
            <ShoppingListCardMenu
              :list="list"
              @rename="emit('rename', list)"
              @share="emit('share', list)"
              @copy="emit('copy', list)"
              @delete="emit('delete', list)"
            />
          </div>
        </div>
      </div>

      <ProgressBar :progress="progress" />
    </div>

    <!-- Область для захвата drag (ручка с тремя полосками) -->
    <div
      class="drag-handle absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <UIcon name="i-lucide-grip-vertical" class="h-5 w-5 text-gray-400" />
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
  click: [listId: string];
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

  // Убираем ghost-копию
  event.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'shoppingList',
    index: props.index,
    id: props.list.id,
  }));
  event.dataTransfer.effectAllowed = 'move';

  // Скрываем ghost-изображение
  const dragImage = document.createElement('div');
  dragImage.style.opacity = '0';
  document.body.appendChild(dragImage);
  event.dataTransfer.setDragImage(dragImage, 0, 0);
  setTimeout(() => {
    document.body.removeChild(dragImage);
  }, 0);

  // Добавляем класс для скрытия оригинальной карточки
  const target = event.target as HTMLElement;
  const card = target.closest('.group');
  if (card) {
    card.classList.add('dragging-original');
  }

  emit('dragStart', props.index);
}

function handleDragEnd() {
  // Убираем класс скрытия
  const draggingElements = document.querySelectorAll('.dragging-original');
  draggingElements.forEach(el => {
    el.classList.remove('dragging-original');
  });

  emit('dragEnd');
}
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Скрываем оригинальную карточку при перетаскивании */
.dragging-original {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}
</style>
