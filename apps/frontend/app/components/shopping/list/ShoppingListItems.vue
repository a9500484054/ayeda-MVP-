<template>
  <div class="space-y-1">
    <ShoppingListItem
      v-for="item in filteredItems"
      :key="item.id"
      :item="item"
      @click="(item) => emit('editItem', item)"
      @edit="() => emit('editItem', item)"
      @delete="() => emit('deleteItem', item.id)"
      @toggle="() => emit('toggleItem', item.id)"
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
        Добавьте продукты через форму ниже
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListItem } from '~/shared/types/shopping.types';
import ShoppingListItem from './ShoppingListItem.vue';

const props = defineProps<{
  items: ShoppingListItem[];
  filterType: 'all' | 'checked' | 'unchecked';
  sortBy: 'name' | 'category' | 'status' | 'order';
  searchQuery: string;
}>();

const emit = defineEmits<{
  editItem: [item: ShoppingListItem];
  deleteItem: [itemId: string];
  toggleItem: [itemId: string];
}>();

function getFilteredItems() {
  let result = [...props.items];

  // Поиск
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(query));
  }

  // Фильтр по статусу
  if (props.filterType === 'checked') {
    result = result.filter(item => item.isChecked);
  } else if (props.filterType === 'unchecked') {
    result = result.filter(item => !item.isChecked);
  }

  // Сортировка
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
}

const filteredItems = computed(() => getFilteredItems());
</script>
