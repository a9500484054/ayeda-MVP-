// stores/menuPlannerStore.ts (исправленный)
import { defineStore } from 'pinia';
import { useMenuPlannerApi, type MenuList, type MenuSlot, type MenuSlotItem, type MealType } from '~/composables/useMenuPlannerApi';

export const useMenuPlannerStore = defineStore('menuPlanner', () => {
  const api = useMenuPlannerApi();
  const toast = useToast();

  // ==================== State ====================
  const menuLists = ref<MenuList[]>([]);
  const activeMenuListId = ref<string | null>(null);
  const slots = ref<MenuSlot[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ==================== Getters ====================
  const activeMenuList = computed(() => {
    return menuLists.value.find(list => list.id === activeMenuListId.value);
  });

  const isDaysView = computed(() => {
    return activeMenuList.value?.displayType === 'days';
  });

  const isCalendarView = computed(() => {
    return activeMenuList.value?.displayType === 'calendar';
  });

  // ==================== Actions ====================

  async function fetchMenuLists() {
    isLoading.value = true;
    error.value = null;
    try {
      menuLists.value = await api.getMenuLists();
      if (activeMenuListId.value && !menuLists.value.find(l => l.id === activeMenuListId.value)) {
        activeMenuListId.value = null;
      }
      if (!activeMenuListId.value && menuLists.value.length > 0) {
        activeMenuListId.value = menuLists.value[0].id;
        await fetchSlots();
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch menu lists:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSlots() {
    if (!activeMenuListId.value) {
      slots.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      slots.value = await api.getSlotsByMenuList(activeMenuListId.value);
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch slots:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createMenuList(data: { title: string; displayType?: 'days' | 'calendar'; icon?: string }) {
    isLoading.value = true;
    try {
      const newList = await api.createMenuList({
        title: data.title,
        icon: data.icon,
        displayType: data.displayType || 'days',
        isActive: true,
      });
      menuLists.value.push(newList);
      activeMenuListId.value = newList.id;
      await fetchSlots();
      toast.add({
        title: 'Успех',
        description: 'Список меню создан',
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

  async function updateMenuList(id: string, data: Partial<UpdateMenuListDto>) {
    isLoading.value = true;
    try {
      const updated = await api.updateMenuList(id, data);
      const index = menuLists.value.findIndex(l => l.id === id);
      if (index !== -1) {
        menuLists.value[index] = updated;
      }
      if (activeMenuListId.value === id) {
        await fetchSlots();
      }
      toast.add({
        title: 'Успех',
        description: 'Список меню обновлен',
        color: 'success',
      });
      return updated;
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

  async function deleteMenuList(id: string) {
    isLoading.value = true;
    try {
      await api.deleteMenuList(id);
      menuLists.value = menuLists.value.filter(l => l.id !== id);
      if (activeMenuListId.value === id) {
        activeMenuListId.value = menuLists.value[0]?.id || null;
        await fetchSlots();
      }
      toast.add({
        title: 'Успех',
        description: 'Список меню удален',
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

  // НОВЫЙ МЕТОД: Создает слот и сразу добавляет рецепт
  async function createSlotWithRecipe(data: {
    slotDate?: string;
    dayOrder?: number;
    mealType: MealType;
    recipeId: string;
    notes?: string;
  }) {
    if (!activeMenuListId.value) {
      throw new Error('No active menu list');
    }

    isLoading.value = true;
    try {
      // Создаем слот
      const newSlot = await api.createSlot({
        menuListId: activeMenuListId.value,
        slotDate: data.slotDate,
        mealType: data.mealType,
      });

      slots.value.push(newSlot);

      // Добавляем рецепт в созданный слот
      const newItem = await api.addRecipeToSlot(newSlot.id, {
        recipeId: data.recipeId,
        notes: data.notes
      });

      // Обновляем items в слоте
      if (!newSlot.items) {
        newSlot.items = [];
      }
      newSlot.items.push(newItem);

      toast.add({
        title: 'Успех',
        description: 'Рецепт добавлен в меню',
        color: 'success',
      });

      return { slot: newSlot, item: newItem };
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить рецепт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Существующий метод для добавления рецепта в существующий слот
  async function addRecipeToSlot(slotId: string, recipeId: string, notes?: string) {
    isLoading.value = true;
    try {
      const newItem = await api.addRecipeToSlot(slotId, { recipeId, notes });
      const slotIndex = slots.value.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        if (!slots.value[slotIndex].items) {
          slots.value[slotIndex].items = [];
        }
        slots.value[slotIndex].items!.push(newItem);
        slots.value[slotIndex].items!.sort((a, b) => a.order - b.order);
      }
      toast.add({
        title: 'Успех',
        description: 'Рецепт добавлен в меню',
        color: 'success',
      });
      return newItem;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить рецепт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeRecipeFromSlot(itemId: string) {
    isLoading.value = true;
    try {
      await api.removeRecipeFromSlot(itemId);
      for (const slot of slots.value) {
        const itemIndex = slot.items?.findIndex(i => i.id === itemId);
        if (itemIndex !== undefined && itemIndex !== -1) {
          slot.items?.splice(itemIndex, 1);
          break;
        }
      }
      toast.add({
        title: 'Успех',
        description: 'Рецепт удален из меню',
        color: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось удалить рецепт',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function reorderSlotItems(slotId: string, items: { id: string; order: number }[]) {
    try {
      const reordered = await api.reorderSlotItems(slotId, { items });
      const slotIndex = slots.value.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        slots.value[slotIndex].items = reordered;
      }
    } catch (err: any) {
      console.error('Failed to reorder items:', err);
    }
  }

  async function setActiveMenuList(id: string | null) {
    activeMenuListId.value = id;
    if (id) {
      await fetchSlots();
    } else {
      slots.value = [];
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    menuLists,
    activeMenuListId,
    slots,
    isLoading,
    error,
    activeMenuList,
    isDaysView,
    isCalendarView,
    fetchMenuLists,
    fetchSlots,
    createMenuList,
    updateMenuList,
    deleteMenuList,
    createSlotWithRecipe,  // Новый метод
    addRecipeToSlot,       // Исправленный метод
    removeRecipeFromSlot,
    reorderSlotItems,
    setActiveMenuList,
    clearError,
  };
});
