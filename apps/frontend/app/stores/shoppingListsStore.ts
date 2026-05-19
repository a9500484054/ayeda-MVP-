import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
  ReorderListsDto,
  ReorderItemsDto,
  ShareTokenResponse,
} from '~/shared/types/shopping.types';

export const useShoppingListsStore = defineStore('shoppingLists', () => {
  const api = useApi();
  const toast = useToast();

  // ==================== State ====================

  const lists = ref<ShoppingList[]>([]);
  const currentList = ref<ShoppingList | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ==================== Getters ====================

  const currentItems = computed(() => currentList.value?.items || []);

  const totalItemsCount = computed(() => currentItems.value.length);

  const checkedItemsCount = computed(() => currentItems.value.filter(item => item.isChecked).length);

  const progressPercentage = computed(() => {
    if (totalItemsCount.value === 0) return 0;
    return (checkedItemsCount.value / totalItemsCount.value) * 100;
  });

  // ==================== Lists Actions ====================

  async function fetchLists() {
    isLoading.value = true;
    error.value = null;
    try {
      lists.value = await api<ShoppingList[]>('/shopping-lists');
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch shopping lists:', err);
      toast.add({
        title: 'Ошибка',
        description: 'Не удалось загрузить списки покупок',
        color: 'error',
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchList(id: string) {
    isLoading.value = true;
    error.value = null;
    try {
      currentList.value = await api<ShoppingList>(`/shopping-lists/${id}`);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch shopping list:', err);
      toast.add({
        title: 'Ошибка',
        description: 'Не удалось загрузить список покупок',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createList(title: string): Promise<ShoppingList> {
    isLoading.value = true;
    try {
      const newList = await api<ShoppingList>('/shopping-lists', {
        method: 'POST',
        body: { title } as CreateShoppingListDto,
      });
      lists.value.push(newList);
      toast.add({
        title: 'Успех',
        description: `Список "${title}" создан`,
        color: 'success',
      });
      return newList;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось создать список',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateList(id: string, dto: UpdateShoppingListDto) {
    isLoading.value = true;
    try {
      const updated = await api<{ id: string; title: string; shareToken: string | null; sortOrder: number; updatedAt: string }>(`/shopping-lists/${id}`, {
        method: 'PATCH',
        body: dto,
      });

      // Обновляем в массиве lists, сохраняя существующие items
      const index = lists.value.findIndex(l => l.id === id);
      if (index !== -1) {
        lists.value[index] = {
          ...lists.value[index],
          title: updated.title,
          shareToken: updated.shareToken,
          sortOrder: updated.sortOrder,
          updatedAt: updated.updatedAt,
        };
      }

      // Обновляем текущий список, сохраняя items
      if (currentList.value?.id === id) {
        currentList.value = {
          ...currentList.value,
          title: updated.title,
          shareToken: updated.shareToken,
          sortOrder: updated.sortOrder,
          updatedAt: updated.updatedAt,
          // Важно: сохраняем существующие items
          items: currentList.value.items,
        };
      }

      toast.add({
        title: 'Успех',
        description: 'Список обновлен',
        color: 'success',
      });
      return updated as ShoppingList;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось обновить список',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteList(id: string) {
    isLoading.value = true;
    try {
      await api(`/shopping-lists/${id}`, { method: 'DELETE' });
      lists.value = lists.value.filter(l => l.id !== id);
      if (currentList.value?.id === id) {
        currentList.value = null;
      }
      toast.add({
        title: 'Успех',
        description: 'Список удален',
        color: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось удалить список',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function copyList(id: string): Promise<ShoppingList> {
    isLoading.value = true;
    try {
      const copied = await api<ShoppingList>(`/shopping-lists/${id}/copy`, {
        method: 'POST',
      });
      lists.value.push(copied);
      toast.add({
        title: 'Успех',
        description: `Список "${copied.title}" скопирован`,
        color: 'success',
      });
      return copied;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось скопировать список',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function reorderLists(items: { id: string; sortOrder: number }[]) {
    isLoading.value = true;
    try {
      const reordered = await api<ShoppingList[]>('/shopping-lists/reorder', {
        method: 'PATCH',
        body: { lists: items } as ReorderListsDto,
      });
      lists.value = reordered;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить порядок списков',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function generateShareToken(id: string): Promise<string> {
    try {
      const response = await api<ShareTokenResponse>(`/shopping-lists/${id}/share`, {
        method: 'POST',
      });
      return response.shareToken;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось создать ссылку для шаринга',
        color: 'error',
      });
      throw err;
    }
  }

  async function revokeShareToken(id: string) {
    try {
      await api(`/shopping-lists/${id}/share`, { method: 'DELETE' });
      if (currentList.value?.id === id) {
        currentList.value.shareToken = null;
      }
      const list = lists.value.find(l => l.id === id);
      if (list) {
        list.shareToken = null;
      }
      toast.add({
        title: 'Успех',
        description: 'Ссылка для шаринга отозвана',
        color: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось отозвать ссылку',
        color: 'error',
      });
      throw err;
    }
  }

  // ==================== Items Actions ====================

  async function addItem(listId: string, dto: CreateShoppingItemDto): Promise<ShoppingListItem> {
    isLoading.value = true;
    try {
      const newItem = await api<ShoppingListItem>(`/shopping-lists/${listId}/items`, {
        method: 'POST',
        body: dto,
      });
      if (currentList.value?.id === listId) {
        if (!currentList.value.items) currentList.value.items = [];
        currentList.value.items.push(newItem);
        currentList.value.items.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      toast.add({
        title: 'Успех',
        description: `"${dto.name}" добавлен в список`,
        color: 'success',
      });
      return newItem;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить продукт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateItem(listId: string, itemId: string, dto: UpdateShoppingItemDto) {
    isLoading.value = true;
    try {
      const updated = await api<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        body: dto,
      });
      if (currentList.value?.id === listId && currentList.value.items) {
        const index = currentList.value.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
          currentList.value.items[index] = updated;
          currentList.value.items.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      }
      toast.add({
        title: 'Успех',
        description: 'Продукт обновлен',
        color: 'success',
      });
      return updated;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось обновить продукт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteItem(listId: string, itemId: string) {
    isLoading.value = true;
    try {
      await api(`/shopping-lists/${listId}/items/${itemId}`, { method: 'DELETE' });
      if (currentList.value?.id === listId && currentList.value.items) {
        currentList.value.items = currentList.value.items.filter(i => i.id !== itemId);
      }
      toast.add({
        title: 'Успех',
        description: 'Продукт удален',
        color: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось удалить продукт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleItem(listId: string, itemId: string) {
    try {
      const toggled = await api<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}/toggle`, {
        method: 'PATCH',
      });
      if (currentList.value?.id === listId && currentList.value.items) {
        const index = currentList.value.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
          currentList.value.items[index] = toggled;
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить статус',
        color: 'error',
      });
      throw err;
    }
  }

  async function uncheckAll(listId: string) {
    isLoading.value = true;
    try {
      await api(`/shopping-lists/${listId}/items/uncheck-all`, { method: 'POST' });
      if (currentList.value?.id === listId && currentList.value.items) {
        currentList.value.items.forEach(item => {
          item.isChecked = false;
        });
      }
      toast.add({
        title: 'Успех',
        description: 'Все отметки сняты',
        color: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось снять отметки',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function reorderItems(listId: string, items: { id: string; sortOrder: number }[]) {
    isLoading.value = true;
    try {
      const reordered = await api<ShoppingListItem[]>(`/shopping-lists/${listId}/items/reorder`, {
        method: 'PATCH',
        body: { items } as ReorderItemsDto,
      });
      if (currentList.value?.id === listId) {
        currentList.value.items = reordered;
      }
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить порядок продуктов',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ==================== Public Access ====================

  async function fetchSharedList(token: string): Promise<ShoppingList> {
    isLoading.value = true;
    try {
      const list = await api<ShoppingList>(`/shared/${token}`);
      return list;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось загрузить общий список',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clearCurrentList() {
    currentList.value = null;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    lists,
    currentList,
    currentItems,
    isLoading,
    error,

    // Getters
    totalItemsCount,
    checkedItemsCount,
    progressPercentage,

    // Lists Actions
    fetchLists,
    fetchList,
    createList,
    updateList,
    deleteList,
    copyList,
    reorderLists,
    generateShareToken,
    revokeShareToken,

    // Items Actions
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    uncheckAll,
    reorderItems,

    // Public
    fetchSharedList,
    clearCurrentList,
    clearError,
  };
});
