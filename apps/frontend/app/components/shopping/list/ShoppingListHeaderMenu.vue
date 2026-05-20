<template>
  <UDropdownMenu :items="menuItems" :ui="{ content: 'w-56' }">
    <UButton
      variant="ghost"
      size="md"
      class="!rounded-xl !px-3 !py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-darkMode-100 dark:text-darkMode-700 dark:hover:bg-darkMode-200"
    >
      <UIcon name="i-lucide-more-vertical" class="h-4 w-4" />
      <!-- <span class="ml-1.5 hidden sm:inline">Действия</span> -->
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';

const props = defineProps<{
  list?: ShoppingList;
  filterType?: 'all' | 'checked' | 'unchecked';
  sortBy?: 'name' | 'category' | 'status' | 'order';
  hasCheckedItems?: boolean;
}>();

const emit = defineEmits<{
  rename?: [list: ShoppingList];
  share?: [];
  copy?: [list: ShoppingList];
  delete?: [];
  uncheckAll?: [];
  print?: [];
  filterChange?: [type: 'all' | 'checked' | 'unchecked'];
  sortChange?: [by: 'name' | 'category' | 'status' | 'order'];
}>();

const menuItems = computed(() => {
  const items: any[] = [];

  // Фильтры
  items.push([
    {
      label: `Фильтр: ${getFilterLabel()}`,
      icon: 'i-lucide-filter',
      children: [
        { label: 'Все', onSelect: () => emit('filterChange', 'all') },
        { label: 'Не купленные', onSelect: () => emit('filterChange', 'unchecked') },
        { label: 'Купленные', onSelect: () => emit('filterChange', 'checked') },
      ],
    },
    {
      label: `Сортировка: ${getSortLabel()}`,
      icon: 'i-lucide-arrow-up-down',
      children: [
        { label: 'По порядку', onSelect: () => emit('sortChange', 'order') },
        { label: 'По названию', onSelect: () => emit('sortChange', 'name') },
        { label: 'По категории', onSelect: () => emit('sortChange', 'category') },
        { label: 'По статусу', onSelect: () => emit('sortChange', 'status') },
      ],
    },
  ]);

  // Действия
  items.push([
    {
      label: 'Снять отметки',
      icon: 'i-lucide-check-square',
      onSelect: () => emit('uncheckAll'),
      disabled: !props.hasCheckedItems,
    },
    {
      label: 'Распечатать',
      icon: 'i-lucide-printer',
      onSelect: () => emit('print'),
    },
  ]);

  items.push([
    {
      label: 'Удалить список',
      icon: 'i-lucide-trash-2',
      class: 'text-red-600',
      iconClass: 'text-red-600',
      onSelect: () => emit('delete'),
    },
  ]);

  return items;
});

function getFilterLabel(): string {
  switch (props.filterType) {
    case 'all': return 'Все';
    case 'checked': return 'Купленные';
    case 'unchecked': return 'Не купленные';
    default: return 'Все';
  }
}

function getSortLabel(): string {
  switch (props.sortBy) {
    case 'name': return 'По названию';
    case 'category': return 'По категории';
    case 'status': return 'По статусу';
    case 'order': return 'По порядку';
    default: return 'По порядку';
  }
}
</script>
