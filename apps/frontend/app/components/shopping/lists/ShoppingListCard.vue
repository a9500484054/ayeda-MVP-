<!-- apps\frontend\app\components\shopping\lists\ShoppingListCard.vue -->
<template>
  <div class="group relative">
    <!-- Основная карточка -->
    <div
      class="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/90 p-5 backdrop-blur-xl transition-all duration-300  hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-100/40 dark:border-darkMode-400/60 dark:bg-darkMode-50/90 dark:hover:border-primary-500/40 dark:hover:bg-darkMode-100 cursor-pointer"
      @click="emit('click', list.id)"
    >
      <!-- Свечение -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-primary-500/10"
      />

      <!-- Верхняя часть -->
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-sm dark:bg-primary-500/15 dark:text-primary-400"
            >
              <UIcon name="i-lucide-shopping-cart" class="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <h5
                class="truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
              >
                {{ list.title }}
              </h5>

              <p class="text-xs text-gray-500 dark:text-darkMode-700">
                Список покупок
              </p>
            </div>
          </div>
        </div>

        <!-- Правая часть с действиями -->
        <div class="flex items-center gap-3">
          <!-- Бейдж прогресса -->
          <div
            class="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-center shadow-sm dark:border-darkMode-300 dark:bg-darkMode-100"
          >
            <p class="text-xs font-semibold text-gray-700 dark:text-darkMode-900">
              {{ checkedCount }}/{{ totalCount }}
            </p>
          </div>

          <!-- Меню -->
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

      <!-- Прогресс -->
      <div class="relative z-10 mt-5">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500 dark:text-darkMode-700">
            Прогресс
          </span>

          <span
            class="text-xs font-semibold text-primary-600 dark:text-primary-400"
          >
            {{ Math.round(progress) }}%
          </span>
        </div>

        <div
          class="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-darkMode-200"
        >
          <div
            class="h-full rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Нижнее декоративное размытие -->
      <div
        class="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-500/10"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
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

const checkedCount = computed(
  () => props.list.items?.filter(i => i.isChecked).length || 0,
);

const progress = computed(() => {
  if (totalCount.value === 0) return 0;
  return (checkedCount.value / totalCount.value) * 100;
});

function handleDragStart(event: DragEvent) {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      type: 'shoppingList',
      index: props.index,
      id: props.list.id,
    }),
  );

  event.dataTransfer.effectAllowed = 'move';

  // Скрываем призрачное изображение
  const dragImage = document.createElement('div');
  dragImage.style.opacity = '0';

  document.body.appendChild(dragImage);

  event.dataTransfer.setDragImage(dragImage, 0, 0);

  setTimeout(() => {
    document.body.removeChild(dragImage);
  }, 0);

  // Затемняем оригинальную карточку
  const target = event.target as HTMLElement;
  const card = target.closest('.group');

  if (card) {
    card.classList.add('dragging-original');
  }

  emit('dragStart', props.index);
}

function handleDragEnd() {
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

.dragging-original {
  opacity: 0.35;
  transform: scale(0.98);
  transition: all 0.2s ease;
}
</style>
