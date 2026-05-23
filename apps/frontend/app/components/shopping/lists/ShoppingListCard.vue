<template>
  <div
    class="group relative drag-handle"
    :data-id="list.id"
    :class="{ 'cursor-grabbing': isDragging }"
  >
    <!-- Основная карточка -->
    <div
      class="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100/40 dark:border-darkMode-400/60 dark:bg-darkMode-50/90 dark:hover:border-emerald-500/40 dark:hover:bg-darkMode-100"
      :class="{ 'cursor-pointer': !isDragging }"
      @click="!isDragging && emit('click', list.id)"
    >
      <!-- Свечение -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-500/10"
      />

      <!-- Верхняя часть -->
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <!-- Drag Handle - только эта область захватывается для перетаскивания -->
            <div
              class="flex h-12 w-12 cursor-grab items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg transition-all hover:scale-105 active:cursor-grabbing"
            >
              <UIcon name="i-lucide-shopping-basket" class="h-6 w-6 text-white" />
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

          <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {{ Math.round(progress) }}%
          </span>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-darkMode-200">
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
</style>
