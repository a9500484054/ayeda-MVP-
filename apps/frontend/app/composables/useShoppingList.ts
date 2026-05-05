import type { ShoppingListDto } from "~/shared/types/domain";

export function useShoppingList(list: Ref<ShoppingListDto | null>) {
  const groupedItems = computed(() => {
    const groups = new Map<string, ShoppingListDto["items"]>();

    for (const item of list.value?.items ?? []) {
      const group = groups.get(item.categoryName) ?? [];
      group.push(item);
      groups.set(item.categoryName, group);
    }

    return Array.from(groups.entries()).map(([categoryName, items]) => ({
      categoryName,
      items,
    }));
  });

  function toggleItem(itemId: string) {
    const item = list.value?.items.find((entry) => entry.id === itemId);
    if (item) {
      item.checked = !item.checked;
    }
  }

  return { groupedItems, toggleItem };
}
