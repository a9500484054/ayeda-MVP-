<template>
  <div
    class="group relative drag-handle w-full"
    :data-id="list.id"
    :class="{ 'cursor-grabbing': isDragging }"
  >
    <!-- Основная карточка -->
    <div
      class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/70 bg-white/90 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100/40 dark:border-darkMode-400/60 dark:bg-darkMode-50/90 dark:hover:border-emerald-500/40 dark:hover:bg-darkMode-100 w-full"
      :class="{ 'cursor-pointer': !isDragging }"
      @click="!isDragging && emit('click', list.id)"
    >
      <!-- Свечение -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-500/10"
      />

      <!-- Верхняя часть - адаптивная -->
      <div class="relative z-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <!-- Drag Handle - уменьшен для мобильных -->
            <div
              class="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 cursor-grab items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg transition-all hover:scale-105 active:cursor-grabbing"
            >
              <UIcon name="i-lucide-shopping-basket" class="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>

            <div class="min-w-0 flex-1">
              <h5
                class="break-words text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-white line-clamp-2"
                :title="list.title"
              >
                {{ list.title }}
              </h5>

              <p class="text-xs text-gray-500 dark:text-darkMode-700">
                Список покупок
              </p>
            </div>
          </div>
        </div>

        <!-- Правая часть с действиями - адаптивная -->
        <div class="flex flex-shrink-0 items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
          <!-- Бейдж прогресса -->
          <div
            class="rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 text-center shadow-sm dark:border-darkMode-300 dark:bg-darkMode-100"
          >
            <p class="whitespace-nowrap text-xs font-semibold text-gray-700 dark:text-darkMode-900">
              {{ checkedCount }}/{{ totalCount }}
            </p>
          </div>

          <!-- Меню -->
          <div @click.stop class="flex-shrink-0">
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
      <div class="relative z-10 mt-4 sm:mt-5">
        <div class="mb-1.5 sm:mb-2 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-500 dark:text-darkMode-700">
            Прогресс
          </span>

          <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {{ Math.round(progress) }}%
          </span>
        </div>

        <div class="h-1.5 sm:h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-darkMode-200">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Нижнее декоративное размытие -->
      <div
        class="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-100/40 blur-3xl dark:bg-emerald-500/10"
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
  isDragging?: boolean;
}>();

const emit = defineEmits<{
  click: [listId: string];
  rename: [list: ShoppingList];
  share: [list: ShoppingList];
  copy: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

const totalCount = computed(() => props.list.totalItems || 0);

const checkedCount = computed(() => props.list.checkedItems || 0);

const progress = computed(() => {
  if (+props.list.totalItems === 0) return 0;
  return (+props.list.checkedItems / +props.list.totalItems) * 100;
});
</script>

<style scoped>
.drag-handle {
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Запрещаем выделение текста при перетаскивании */
.group:active {
  user-select: none;
}

/* Адаптивные улучшения для мобильных */
@media (max-width: 640px) {
  .drag-handle {
    touch-action: pan-y pinch-zoom;
  }
}

/* Обрезка длинного текста на мобильных */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
