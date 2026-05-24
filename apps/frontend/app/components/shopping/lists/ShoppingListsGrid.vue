<!-- apps/frontend/app/components/shopping/lists/ShoppingListsGrid.vue -->
<template>
  <div
    ref="containerRef"
    class="flex flex-col gap-4"
  >
    <ShoppingListCard
      v-for="(list, idx) in lists"
      :key="list.id"
      :list="list"
      :index="idx"
      :is-dragging="isDragging"
      @click="handleCardClick"
      @rename="emit('rename', $event)"
      @share="emit('share', $event)"
      @copy="emit('copy', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

/**
 * Локальная копия массива
 * нужна для SortableJS
 */
const localLists = ref<ShoppingList[]>([...props.lists]);

watch(
  () => props.lists,
  (value) => {
    localLists.value = [...value];
  },
  { deep: true }
);

/**
 * Блокируем клик во время drag
 */
function handleCardClick(listId: string) {
  if (isDragging.value) return;

  emit('navigate', listId);
}

/**
 * Sortable
 */
useSortable(containerRef, localLists, {
  animation: 220,

  handle: '.drag-handle',

  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  dragClass: 'sortable-drag',

  /**
   * Очень важно:
   * убирает дергание и мерцание
   */
  forceFallback: false,
  fallbackOnBody: true,

  /**
   * Чтобы обычный тап
   * не превращался в drag
   */
  delayOnTouchOnly: true,
  delay: 120,
  fallbackTolerance: 5,

  /**
   * Более плавное поведение
   */
  easing: 'cubic-bezier(0.2, 0, 0, 1)',

  onStart() {
    isDragging.value = true;

    document.body.classList.add('dragging-shopping-list');
  },

  onEnd(evt) {
    requestAnimationFrame(() => {
      isDragging.value = false;

      document.body.classList.remove('dragging-shopping-list');
    });

    const { oldIndex, newIndex } = evt;

    if (
      oldIndex !== undefined &&
      newIndex !== undefined &&
      oldIndex !== newIndex
    ) {
      emit('reorder', oldIndex, newIndex);
    }
  },
});
</script>

<style scoped>
/**
 * Контейнер
 */
.sortable-ghost {
  opacity: 1 !important;
}

/**
 * Карточка которую взяли
 */
.sortable-chosen {
  opacity: 1 !important;
}

/**
 * Карточка которую реально таскаем
 */
.sortable-drag {
  opacity: 0 !important;
  transform: scale(1.02) rotate(1deg);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.18),
    0 12px 24px rgba(0, 0, 0, 0.12);

  z-index: 9999 !important;

  cursor: grabbing !important;
}

/**
 * Плавное перемещение остальных карточек
 */
:global(.sortable-anim) {
  transition: transform 220ms cubic-bezier(0.2, 0, 0, 1) !important;
}

/**
 * Отключаем выделение текста
 */
:global(.dragging-shopping-list) {
  user-select: none;
  cursor: grabbing !important;
}

/**
 * Убираем синий tap highlight на mobile
 */
* {
  -webkit-tap-highlight-color: transparent;
}
</style>
