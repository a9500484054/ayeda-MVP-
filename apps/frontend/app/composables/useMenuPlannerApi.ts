import { useApi } from './useApi';

// ==================== Types ====================

export type DisplayType = 'days' | 'calendar' | 'banquet';
export type SlotType = 'day' | 'calendar' | 'banquet';
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

export interface MenuDay {
  id: string;
  menuListId: string;
  dayOrder: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  slots?: MenuSlot[];
}

export interface MenuSlot {
  id: string;
  menuListId: string;
  slotType: SlotType;
  dayId?: string;
  slotDate?: string;
  mealType?: MealType;
  order: number;
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
  recipe?: any;
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
  slotType: SlotType;
  dayId?: string;
  slotDate?: string;
  mealType?: MealType;
  order?: number;
}

export interface CreateDayDto {
  dayOrder: number;
  title: string;
}

export interface UpdateDayDto {
  title?: string;
}

export interface ReorderDaysDto {
  items: { id: string; order: number }[];
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

    // ==================== Days (только для DAYS) ====================

    async getDays(menuListId: string): Promise<MenuDay[]> {
      return api(`/menu-planner/lists/${menuListId}/days`);
    },

    async createDay(menuListId: string, data: CreateDayDto): Promise<MenuDay> {
      return api(`/menu-planner/lists/${menuListId}/days`, {
        method: 'POST',
        body: data,
      });
    },

    async updateDay(dayId: string, data: UpdateDayDto): Promise<MenuDay> {
      return api(`/menu-planner/days/${dayId}`, {
        method: 'PATCH',
        body: data,
      });
    },

    async reorderDays(menuListId: string, items: { id: string; order: number }[]): Promise<MenuDay[]> {
      return api(`/menu-planner/lists/${menuListId}/days/reorder`, {
        method: 'POST',
        body: { items },
      });
    },

    async deleteDay(dayId: string): Promise<void> {
      return api(`/menu-planner/days/${dayId}`, {
        method: 'DELETE',
      });
    },

    // ==================== Slots ====================

    async getSlotsByMenuList(menuListId: string): Promise<MenuSlot[]> {
      return api(`/menu-planner/lists/${menuListId}/slots`);
    },

    async getSlot(slotId: string): Promise<MenuSlot> {
      return api(`/menu-planner/slots/${slotId}`);
    },

    async createSlot(data: CreateMenuSlotDto): Promise<MenuSlot> {
      return api('/menu-planner/slots', {
        method: 'POST',
        body: data,
      });
    },

    async deleteSlot(slotId: string): Promise<void> {
      return api(`/menu-planner/slots/${slotId}`, {
        method: 'DELETE',
      });
    },

    // ==================== Slot Items (Recipes) ====================

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

    async reorderSlotItems(slotId: string, items: { id: string; order: number }[]): Promise<MenuSlotItem[]> {
      return api(`/menu-planner/slots/${slotId}/items/reorder`, {
        method: 'POST',
        body: { items },
      });
    },

    async updateSlotItemNotes(itemId: string, notes: string): Promise<MenuSlotItem> {
      return api(`/menu-planner/items/${itemId}/notes`, {
        method: 'PATCH',
        body: { notes },
      });
    },

    async getSlotItems(slotId: string): Promise<MenuSlotItem[]> {
      return api(`/menu-planner/slots/${slotId}/items`);
    },

    // ==================== Banquet ====================

    async getBanquetItems(menuListId: string): Promise<MenuSlotItem[]> {
      return api(`/menu-planner/lists/${menuListId}/banquet/items`);
    },

    async addBanquetItem(menuListId: string, data: AddRecipeToSlotDto): Promise<MenuSlotItem> {
      return api(`/menu-planner/lists/${menuListId}/banquet/items`, {
        method: 'POST',
        body: data,
      });
    },

    // ==================== Utility ====================

    async getMenuStructure(menuListId: string): Promise<MenuList> {
      return api(`/menu-planner/lists/${menuListId}/structure`);
    },

    async getSlotsByDateRange(menuListId: string, startDate: string, endDate: string): Promise<MenuSlot[]> {
      return api(`/menu-planner/lists/${menuListId}/slots/range?startDate=${startDate}&endDate=${endDate}`);
    },
  };
}
