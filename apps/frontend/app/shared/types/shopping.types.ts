// Категория
export interface ShoppingCategory {
  id: string;
  code: string;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Позиция списка
export interface ShoppingListItem {
  id: string;
  name: string;
  category: ShoppingCategory | null;
  quantity: number;
  unit: string;
  price: number | null;
  isChecked: boolean;
  sortOrder: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// Список покупок
export interface ShoppingList {
  id: string;
  title: string;
  shareToken: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items?: ShoppingListItem[];
}

// DTOs
export interface CreateShoppingListDto {
  title: string;
}

export interface UpdateShoppingListDto {
  title?: string;
  sortOrder?: number;
}

export interface CreateShoppingItemDto {
  name: string;
  categoryId?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  note?: string;
}

export interface UpdateShoppingItemDto {
  name?: string;
  categoryId?: string | null;
  quantity?: number;
  unit?: string;
  price?: number;
  isChecked?: boolean;
  note?: string;
}

export interface ReorderListsDto {
  lists: { id: string; sortOrder: number }[];
}

export interface ReorderItemsDto {
  items: { id: string; sortOrder: number }[];
}

export interface ShareTokenResponse {
  shareToken: string;
}
