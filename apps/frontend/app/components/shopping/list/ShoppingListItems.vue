<!-- apps\frontend\app\components\shopping\list\ShoppingListItems.vue -->
<template>
  <div class="space-y-1">
    <ShoppingListItem
      v-for="item in filteredItems"
      :key="item.id"
      :item="item"
      @click="emit('editItem', item)"
      @edit="emit('editItem', item)"
      @delete="emit('deleteItem', item.id)"
      @toggle="emit('toggleItem', item.id)"
    />

    <!-- Пустое состояние -->
    <div
      v-if="filteredItems.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <UIcon name="i-lucide-shopping-cart" class="h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p class="mt-3 text-gray-500 dark:text-gray-400">
        {{ searchQuery ? 'Ничего не найдено' : 'Список пуст' }}
      </p>
      <p v-if="!searchQuery" class="text-sm text-gray-400">
        Добавьте продукты
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem as ShoppingListItemType } from '~/shared/types/shopping.types';
import ShoppingListItem from './ShoppingListItem.vue';

const props = defineProps<{
  items: ShoppingListItemType[];
  filterType: 'all' | 'checked' | 'unchecked';
  sortBy: 'name' | 'category' | 'status' | 'order';
  searchQuery: string;
}>();

const emit = defineEmits<{
  editItem: [item: ShoppingListItemType];
  deleteItem: [itemId: string];
  toggleItem: [itemId: string];
}>();

const filteredItems = computed(() => {
  let result = [...props.items];

  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(query));
  }

  if (props.filterType === 'checked') {
    result = result.filter(item => item.isChecked);
  } else if (props.filterType === 'unchecked') {
    result = result.filter(item => !item.isChecked);
  }

  switch (props.sortBy) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'category':
      result.sort((a, b) => {
        const catA = a.category?.name || '';
        const catB = b.category?.name || '';
        return catA.localeCompare(catB);
      });
      break;
    case 'status':
      result.sort((a, b) => Number(a.isChecked) - Number(b.isChecked));
      break;
    case 'order':
      result.sort((a, b) => a.sortOrder - b.sortOrder);
      break;
  }

  return result;
});
</script>
