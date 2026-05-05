import type { ShoppingListDto } from "~/shared/types/domain";

export const useShoppingListsStore = defineStore("shoppingLists", () => {
  const lists = ref<ShoppingListDto[]>([]);
  const activeListId = ref<string | null>(null);
  const activeList = computed(
    () => lists.value.find((list) => list.id === activeListId.value) ?? null,
  );

  function addList(list: ShoppingListDto) {
    lists.value.unshift(list);
    activeListId.value = list.id;
  }

  function archiveList(id: string) {
    const list = lists.value.find((entry) => entry.id === id);
    if (list) {
      list.archived = true;
    }
  }

  return { lists, activeListId, activeList, addList, archiveList };
});
