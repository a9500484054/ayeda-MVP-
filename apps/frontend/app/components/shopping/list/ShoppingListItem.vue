<!-- apps\frontend\app\components\shopping\list\ShoppingListItem.vue -->
<template>
  <div
    class="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-darkMode-100"
    @click="emit('click', item)"
  >
    <!-- Круглый чекбокс -->
    <button
      class="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 cursor-pointer"
      :class="[
        item.isChecked
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md'
          : 'border-2 border-gray-300 bg-white hover:border-emerald-500 hover:shadow-md dark:border-darkMode-600 dark:bg-darkMode-800'
      ]"
      @click.stop="emit('toggle')"
    >
      <UIcon
        v-if="item.isChecked"
        name="i-lucide-check"
        class="h-3.5 w-3.5 text-white"
      />
    </button>

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
      <Button
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="sm"
        icon-only
        class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-darkMode-200"
        @click.stop="emit('edit')"
      />

      <Button
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        size="sm"
        icon-only
        class="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
        @click.stop="emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '~/shared/types/shopping.types';
import CategoryIcon from './shared/CategoryIcon.vue';
import Button from '~/shared/ui/button/Button.vue';

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
