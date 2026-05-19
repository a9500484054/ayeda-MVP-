<template>
  <div
    class="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-darkMode-100"
    @click="emit('click', item)"
  >
    <!-- Чекбокс -->
    <UCheckbox
      :model-value="item.isChecked"
      @update:model-value="emit('toggle')"
      @click.stop
    />

    <!-- Иконка категории -->
    <CategoryIcon :category="item.category" />

    <!-- Название -->
    <div class="flex-1 min-w-0">
      <span
        class="text-gray-900 dark:text-darkMode-900"
        :class="{ 'line-through text-gray-400 dark:text-gray-500': item.isChecked }"
      >
        {{ item.name }}
      </span>

      <!-- Количество -->
      <span class="ml-2 text-sm text-gray-400">
        {{ item.quantity }} {{ item.unit }}
      </span>

      <!-- Цена -->
      <span v-if="item.price" class="ml-2 text-sm text-gray-500">
        {{ item.price }} ₽
      </span>

      <!-- Заметка -->
      <div v-if="item.note" class="mt-1 text-xs text-gray-400">
        📝 {{ item.note }}
      </div>
    </div>

    <!-- Действия при ховере -->
    <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-darkMode-200"
        @click.stop="emit('edit')"
      >
        <UIcon name="i-lucide-pencil" class="h-4 w-4" />
      </button>
      <button
        class="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
        @click.stop="emit('delete')"
      >
        <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '~/shared/types/shopping.types';
import CategoryIcon from './shared/CategoryIcon.vue';

const props = defineProps<{
  item: ShoppingListItem;
}>();

const emit = defineEmits<{
  click: [item: ShoppingListItem];
  edit: [];
  delete: [];
  toggle: [];
}>();
</script>
