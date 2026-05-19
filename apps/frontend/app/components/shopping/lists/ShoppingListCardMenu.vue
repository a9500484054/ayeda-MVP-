<template>
  <UDropdownMenu :items="menuItems" :ui="{ content: 'w-48' }">
    <button
      class="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-200 dark:text-darkMode-900 dark:hover:bg-darkMode-200 cursor-pointer flex-shrink-0"
      @click.stop
    >
      <UIcon name="i-lucide-more-vertical" class="h-4 w-4" />
    </button>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';

const props = defineProps<{
  list: ShoppingList;
}>();

const emit = defineEmits<{
  rename: [list: ShoppingList];
  share: [list: ShoppingList];
  copy: [list: ShoppingList];
  delete: [list: ShoppingList];
}>();

const menuItems = computed(() => [
  [
    {
      label: 'Переименовать',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('rename', props.list),
    },
    {
      label: 'Поделиться',
      icon: 'i-lucide-share-2',
      onSelect: () => emit('share', props.list),
    },
    {
      label: 'Копировать',
      icon: 'i-lucide-copy',
      onSelect: () => emit('copy', props.list),
    },
  ],
  [
    {
      label: 'Удалить',
      icon: 'i-lucide-trash-2',
      class: 'text-red-600',
      iconClass: 'text-red-600',
      onSelect: () => emit('delete', props.list),
    },
  ],
]);
</script>
