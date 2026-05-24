import type {
  ShoppingList,
  ShoppingListItem,
  CreateShoppingListDto,
  UpdateShoppingListDto,
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
  ShareTokenResponse,
} from '~/shared/types/shopping.types';
import { useApi } from './useApi';

export function useShoppingListsApi() {
  const api = useApi();

  return {
    // Lists
    async getLists(): Promise<ShoppingList[]> {
      return api('/shopping-lists');
    },

    async getList(id: string): Promise<ShoppingList> {
      return api(`/shopping-lists/${id}`);
    },

    async createList(dto: CreateShoppingListDto): Promise<ShoppingList> {
      return api('/shopping-lists', {
        method: 'POST',
        body: dto,
      });
    },

    async updateList(id: string, dto: UpdateShoppingListDto): Promise<ShoppingList> {
      return api(`/shopping-lists/${id}`, {
        method: 'PATCH',
        body: dto,
      });
    },

    async deleteList(id: string): Promise<void> {
      return api(`/shopping-lists/${id}`, {
        method: 'DELETE',
      });
    },

    async copyList(id: string): Promise<ShoppingList> {
      return api(`/shopping-lists/${id}/copy`, {
        method: 'POST',
      });
    },

    async reorderLists(lists: { id: string; sortOrder: number }[]): Promise<ShoppingList[]> {
      return api('/shopping-lists/reorder', {
        method: 'PATCH',
        body: { lists },
      });
    },

    async generateShareToken(id: string): Promise<string> {
      const response = await api<ShareTokenResponse>(`/shopping-lists/${id}/share`, {
        method: 'POST',
      });
      return response.shareToken;
    },

    async revokeShareToken(id: string): Promise<void> {
      return api(`/shopping-lists/${id}/share`, {
        method: 'DELETE',
      });
    },

    // Items
    async addItem(listId: string, dto: CreateShoppingItemDto): Promise<ShoppingListItem> {
      return api(`/shopping-lists/${listId}/items`, {
        method: 'POST',
        body: dto,
      });
    },

    async updateItem(listId: string, itemId: string, dto: UpdateShoppingItemDto): Promise<ShoppingListItem> {
      return api(`/shopping-lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        body: dto,
      });
    },

    async deleteItem(listId: string, itemId: string): Promise<void> {
      return api(`/shopping-lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      });
    },

    async toggleItem(listId: string, itemId: string): Promise<ShoppingListItem> {
      return api(`/shopping-lists/${listId}/items/${itemId}/toggle`, {
        method: 'PATCH',
      });
    },

    async uncheckAll(listId: string): Promise<void> {
      return api(`/shopping-lists/${listId}/items/uncheck-all`, {
        method: 'POST',
      });
    },

    async reorderItems(listId: string, items: { id: string; sortOrder: number }[]): Promise<ShoppingListItem[]> {
      return api(`/shopping-lists/${listId}/items/reorder`, {
        method: 'PATCH',
        body: { items },
      });
    },

    // Public
    async getSharedList(token: string): Promise<ShoppingList> {
      return api(`/shared/${token}`);
    },
  };
}
