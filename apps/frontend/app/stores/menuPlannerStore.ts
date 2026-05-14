import { defineStore } from 'pinia';
import { useMenuPlannerApi, type MenuList, type MenuSlot, type MenuSlotItem } from '~/composables/useMenuPlannerApi';

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

  // Получить слот по дате и приему пищи (для calendar view)
  const getSlotByDateAndMeal = (date: string, mealType: string): MenuSlot | undefined => {
    return slots.value.find(
      slot => slot.slotDate === date && slot.mealType === mealType
    );
  };

  // Получить слоты по дате (все приемы пищи для одного дня)
  const getSlotsByDate = (date: string): MenuSlot[] => {
    return slots.value.filter(slot => slot.slotDate === date);
  };

  // Получить слоты по дню (для days view, где order = день)
  const getSlotsByDay = (dayOrder: number): MenuSlot[] => {
    return slots.value.filter(slot => slot.order === dayOrder);
  };

  // Получить все уникальные дни (для days view)
  const getDayOrders = computed(() => {
    const orders = new Set<number>();
    slots.value.forEach(slot => {
      if (slot.order !== undefined) {
        orders.add(slot.order);
      }
    });
    return Array.from(orders).sort((a, b) => a - b);
  });

  // ==================== Actions ====================

  // Загрузить все списки меню
  async function fetchMenuLists() {
    isLoading.value = true;
    error.value = null;
    try {
      menuLists.value = await api.getMenuLists();
      // Если есть активный список, но его нет в списке — сбросить
      if (activeMenuListId.value && !menuLists.value.find(l => l.id === activeMenuListId.value)) {
        activeMenuListId.value = null;
      }
      // Если нет активного и есть списки — выбрать первый
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

  // Загрузить слоты для активного списка
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

  // Создать новый список меню
  async function createMenuList(data: { title: string; displayType?: DisplayType; icon?: string }) {
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

  // Обновить список меню
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

  // Удалить список меню
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

  // Создать слот
  async function createSlot(data: { slotDate?: string; mealType: MealType }) {
    if (!activeMenuListId.value) return;

    try {
      const newSlot = await api.createSlot({
        menuListId: activeMenuListId.value,
        slotDate: data.slotDate,
        mealType: data.mealType,
      });
      slots.value.push(newSlot);
      return newSlot;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось создать слот',
        color: 'error',
      });
      throw err;
    }
  }

  // Добавить рецепт в слот
  async function addRecipeToSlot(slotId: string, recipeId: string, notes?: string) {
    try {
      const newItem = await api.addRecipeToSlot(slotId, { recipeId, notes });
      // Обновить слот в сторе
      const slotIndex = slots.value.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        if (!slots.value[slotIndex].items) {
          slots.value[slotIndex].items = [];
        }
        slots.value[slotIndex].items!.push(newItem);
        // Сортировка по order
        slots.value[slotIndex].items!.sort((a, b) => a.order - b.order);
      }
      return newItem;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить рецепт',
        color: 'error',
      });
      throw err;
    }
  }

  // Удалить рецепт из слота
  async function removeRecipeFromSlot(itemId: string) {
    try {
      await api.removeRecipeFromSlot(itemId);
      // Найти и удалить из стора
      for (const slot of slots.value) {
        const itemIndex = slot.items?.findIndex(i => i.id === itemId);
        if (itemIndex !== undefined && itemIndex !== -1) {
          slot.items?.splice(itemIndex, 1);
          break;
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось удалить рецепт',
        color: 'error',
      });
      throw err;
    }
  }

  // Обновить порядок рецептов в слоте
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

  // Установить активный список
  async function setActiveMenuList(id: string | null) {
    activeMenuListId.value = id;
    if (id) {
      await fetchSlots();
    } else {
      slots.value = [];
    }
  }

  // Очистить ошибку
  function clearError() {
    error.value = null;
  }

  return {
    // State
    menuLists,
    activeMenuListId,
    slots,
    isLoading,
    error,

    // Getters
    activeMenuList,
    isDaysView,
    isCalendarView,
    getSlotByDateAndMeal,
    getSlotsByDate,
    getSlotsByDay,
    getDayOrders,

    // Actions
    fetchMenuLists,
    fetchSlots,
    createMenuList,
    updateMenuList,
    deleteMenuList,
    createSlot,
    addRecipeToSlot,
    removeRecipeFromSlot,
    reorderSlotItems,
    setActiveMenuList,
    clearError,
  };
});
