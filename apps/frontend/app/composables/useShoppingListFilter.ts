import type { ShoppingListItem } from '~/shared/types/shopping.types';

interface FilterOptions {
  filterType: 'all' | 'checked' | 'unchecked';
  sortBy: 'name' | 'category' | 'status' | 'order';
  searchQuery: string;
}

export function useShoppingListFilter(items: Ref<ShoppingListItem[]>, options: Ref<FilterOptions>) {
  const filteredItems = computed(() => {
    let result = [...items.value];

    // Поиск
    if (options.value.searchQuery) {
      const query = options.value.searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }

    // Фильтр по статусу
    switch (options.value.filterType) {
      case 'checked':
        result = result.filter(item => item.isChecked);
        break;
      case 'unchecked':
        result = result.filter(item => !item.isChecked);
        break;
      case 'all':
      default:
        break;
    }

    // Сортировка
    switch (options.value.sortBy) {
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
      default:
        result.sort((a, b) => a.sortOrder - b.sortOrder);
        break;
    }

    return result;
  });

  return {
    filteredItems,
  };
}
