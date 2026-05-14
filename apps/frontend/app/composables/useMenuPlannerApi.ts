import { useApi } from './useApi';

// ==================== Types ====================

export type DisplayType = 'days' | 'calendar';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MenuList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  displayType: DisplayType;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MenuSlot {
  id: string;
  menuListId: string;
  slotDate: string | null;
  mealType: MealType;
  createdAt: string;
  updatedAt: string;
  items?: MenuSlotItem[];
}

export interface MenuSlotItem {
  id: string;
  slotId: string;
  recipeId: string;
  order: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  recipe?: any; // RecipeResponse из useRecipesApi
}

// ==================== DTOs ====================

export interface CreateMenuListDto {
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  displayType?: DisplayType;
}

export interface UpdateMenuListDto {
  title?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  displayType?: DisplayType;
}

export interface CreateMenuSlotDto {
  menuListId: string;
  slotDate?: string;
  mealType: MealType;
}

export interface AddRecipeToSlotDto {
  recipeId: string;
  order?: number;
  notes?: string;
}

export interface ReorderSlotItemsDto {
  items: { id: string; order: number }[];
}

// ==================== API ====================

export function useMenuPlannerApi() {
  const api = useApi();

  return {
    // ==================== Menu Lists ====================

    async getMenuLists(): Promise<MenuList[]> {
      return api('/menu-planner/lists');
    },

    async getMenuList(id: string): Promise<MenuList> {
      return api(`/menu-planner/lists/${id}`);
    },

    async createMenuList(data: CreateMenuListDto): Promise<MenuList> {
      return api('/menu-planner/lists', {
        method: 'POST',
        body: data,
      });
    },

    async updateMenuList(id: string, data: UpdateMenuListDto): Promise<MenuList> {
      return api(`/menu-planner/lists/${id}`, {
        method: 'PATCH',
        body: data,
      });
    },

    async deleteMenuList(id: string): Promise<void> {
      return api(`/menu-planner/lists/${id}`, {
        method: 'DELETE',
      });
    },

    // ==================== Slots ====================

    async getSlotsByMenuList(menuListId: string): Promise<MenuSlot[]> {
      return api(`/menu-planner/lists/${menuListId}/slots`);
    },

    async getSlot(id: string): Promise<MenuSlot> {
      return api(`/menu-planner/slots/${id}`);
    },

    async createSlot(data: CreateMenuSlotDto): Promise<MenuSlot> {
      return api('/menu-planner/slots', {
        method: 'POST',
        body: data,
      });
    },

    async deleteSlot(id: string): Promise<void> {
      return api(`/menu-planner/slots/${id}`, {
        method: 'DELETE',
      });
    },

    // ==================== Slot Items (Recipes) ====================

    async getSlotItems(slotId: string): Promise<MenuSlotItem[]> {
      return api(`/menu-planner/slots/${slotId}/items`);
    },

    async addRecipeToSlot(slotId: string, data: AddRecipeToSlotDto): Promise<MenuSlotItem> {
      return api(`/menu-planner/slots/${slotId}/items`, {
        method: 'POST',
        body: data,
      });
    },

    async removeRecipeFromSlot(itemId: string): Promise<void> {
      return api(`/menu-planner/items/${itemId}`, {
        method: 'DELETE',
      });
    },

    async reorderSlotItems(slotId: string, data: ReorderSlotItemsDto): Promise<MenuSlotItem[]> {
      return api(`/menu-planner/slots/${slotId}/items/reorder`, {
        method: 'POST',
        body: data,
      });
    },

    async updateSlotItemNotes(itemId: string, notes: string): Promise<MenuSlotItem> {
      return api(`/menu-planner/items/${itemId}/notes`, {
        method: 'PATCH',
        body: { notes },
      });
    },

    // ==================== Utility ====================

    async getMenuStructure(menuListId: string): Promise<MenuList> {
      return api(`/menu-planner/lists/${menuListId}/structure`);
    },
  };
}
