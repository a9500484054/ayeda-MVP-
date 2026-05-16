import { defineStore } from 'pinia';
import { useMenuPlannerApi, type MenuList, type MenuSlot, type MenuSlotItem, type MenuDay, type SlotType, type MealType } from '~/composables/useMenuPlannerApi';

export const useMenuPlannerStore = defineStore('menuPlanner', () => {
  const api = useMenuPlannerApi();
  const toast = useToast();

  // ==================== State ====================

  const menuLists = ref<MenuList[]>([]);
  const activeMenuListId = ref<string | null>(null);
  const slots = ref<MenuSlot[]>([]);
  const days = ref<MenuDay[]>([]);
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

  const isBanquetView = computed(() => {
    return activeMenuList.value?.displayType === 'banquet';
  });

  // Для режима DAYS: получить слот по дню и приему пищи
  const getSlotByDayAndMeal = (dayId: string, mealType: MealType): MenuSlot | undefined => {
    return slots.value.find(
      slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
    );
  };

  // Для режима CALENDAR: получить слот по дате и приему пищи
  const getSlotByDateAndMeal = (date: string, mealType: MealType): MenuSlot | undefined => {
    return slots.value.find(
      slot => slot.slotDate === date && slot.mealType === mealType && slot.slotType === 'calendar'
    );
  };

  // Получить все слоты для конкретного дня (DAYS)
  const getSlotsByDay = (dayId: string): MenuSlot[] => {
    return slots.value.filter(slot => slot.dayId === dayId && slot.slotType === 'day');
  };

  // Получить все слоты для конкретной даты (CALENDAR)
  const getSlotsByDate = (date: string): MenuSlot[] => {
    return slots.value.filter(slot => slot.slotDate === date && slot.slotType === 'calendar');
  };

  // ==================== Actions ====================

  // Загрузить все списки меню
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
        await fetchDataByType();
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch menu lists:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Загрузить данные в зависимости от типа
  async function fetchDataByType() {
    if (!activeMenuListId.value) return;

    const list = activeMenuList.value;
    if (!list) return;

    if (list.displayType === 'days') {
      await fetchDays();
      await fetchSlots();
    } else if (list.displayType === 'calendar') {
      await fetchSlots();
    } else if (list.displayType === 'banquet') {
      // Для банкета загружаем слоты (один слот со всеми блюдами)
      await fetchSlots();
    }
  }

  // Загрузить дни (только для DAYS)
  async function fetchDays() {
    if (!activeMenuListId.value) return;

    try {
      days.value = await api.getDays(activeMenuListId.value);
    } catch (err: any) {
      console.error('Failed to fetch days:', err);
    }
  }

  // Загрузить слоты для активного списка
  async function fetchSlots() {
    if (!activeMenuListId.value) {
      slots.value = [];
      return;
    }

    isLoading.value = true;
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

      // Если создали список DAYS, создаем дни по умолчанию (7 дней)
      if (newList.displayType === 'days') {
        await createDefaultDays(newList.id);
      }

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

  // Создать дни по умолчанию (для DAYS)
  async function createDefaultDays(menuListId: string) {
    try {
      for (let i = 1; i <= 7; i++) {
        await api.createDay(menuListId, {
          dayOrder: i,
          title: `День ${i}`,
        });
      }
      await fetchDays();
    } catch (err) {
      console.error('Failed to create default days:', err);
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
        await fetchDataByType();
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
        await fetchDataByType();
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

  // ==================== Days Actions ====================

  // Создать день (только для DAYS)
  async function createDay(dayOrder: number, title: string) {
    if (!activeMenuListId.value) return;

    try {
      const newDay = await api.createDay(activeMenuListId.value, { dayOrder, title });
      days.value.push(newDay);
      days.value.sort((a, b) => a.dayOrder - b.dayOrder);
      return newDay;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось создать день',
        color: 'error',
      });
      throw err;
    }
  }

  // Обновить день
  async function updateDay(dayId: string, title: string) {
    try {
      const updated = await api.updateDay(dayId, { title });
      const index = days.value.findIndex(d => d.id === dayId);
      if (index !== -1) {
        days.value[index] = updated;
      }
      return updated;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось обновить день',
        color: 'error',
      });
      throw err;
    }
  }

  // Переупорядочить дни
  async function reorderDays(items: { id: string; order: number }[]) {
    if (!activeMenuListId.value) return;

    try {
      const reordered = await api.reorderDays(activeMenuListId.value, items);
      days.value = reordered;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить порядок дней',
        color: 'error',
      });
      throw err;
    }
  }

  // Удалить день
  async function deleteDay(dayId: string) {
    try {
      await api.deleteDay(dayId);
      days.value = days.value.filter(d => d.id !== dayId);

      // Также удаляем слоты этого дня из локального состояния
      slots.value = slots.value.filter(s => s.dayId !== dayId);
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось удалить день',
        color: 'error',
      });
      throw err;
    }
  }

  // ==================== Slot Actions ====================

  // Создать слот (для DAYS или CALENDAR)
  async function createSlot(data: {
    slotType: SlotType;
    dayId?: string;
    slotDate?: string;
    mealType?: MealType;
    order?: number;
  }) {
    if (!activeMenuListId.value) return;

    try {
      const newSlot = await api.createSlot({
        menuListId: activeMenuListId.value,
        ...data,
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

  // Создать слот с рецептом (атомарно)
  async function createSlotWithRecipe(data: {
    slotType: SlotType;
    dayId?: string;
    slotDate?: string;
    mealType?: MealType;
    recipeId: string;
    notes?: string;
  }) {
    if (!activeMenuListId.value) return;

    isLoading.value = true;
    try {
      // Создаем слот
      const newSlot = await api.createSlot({
        menuListId: activeMenuListId.value,
        slotType: data.slotType,
        dayId: data.dayId,
        slotDate: data.slotDate,
        mealType: data.mealType,
      });

      slots.value.push(newSlot);

      // Добавляем рецепт
      const newItem = await api.addRecipeToSlot(newSlot.id, {
        recipeId: data.recipeId,
        notes: data.notes,
      });

      // Обновляем items в слоте
      const slotIndex = slots.value.findIndex(s => s.id === newSlot.id);
      if (slotIndex !== -1) {
        if (!slots.value[slotIndex].items) {
          slots.value[slotIndex].items = [];
        }
        slots.value[slotIndex].items!.push(newItem);
      }

      toast.add({
        title: 'Успех',
        description: 'Рецепт добавлен',
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

  // Добавить рецепт в существующий слот
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
        description: 'Рецепт добавлен',
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

  // Удалить рецепт из слота
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
        description: 'Рецепт удален',
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

  // Обновить порядок рецептов в слоте
  async function reorderSlotItems(slotId: string, items: { id: string; order: number }[]) {
    try {
      const reordered = await api.reorderSlotItems(slotId, items);
      const slotIndex = slots.value.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        slots.value[slotIndex].items = reordered;
      }
    } catch (err: any) {
      console.error('Failed to reorder items:', err);
    }
  }

  // Обновить заметки рецепта
  async function updateSlotItemNotes(itemId: string, notes: string) {
    try {
      const updated = await api.updateSlotItemNotes(itemId, notes);

      for (const slot of slots.value) {
        const itemIndex = slot.items?.findIndex(i => i.id === itemId);
        if (itemIndex !== undefined && itemIndex !== -1 && slot.items) {
          slot.items[itemIndex] = updated;
          break;
        }
      }
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось обновить заметки',
        color: 'error',
      });
      throw err;
    }
  }

  // ==================== Banquet Actions ====================

  // Получить блюда банкета
  async function fetchBanquetItems() {
    if (!activeMenuListId.value) return;

    try {
      const items = await api.getBanquetItems(activeMenuListId.value);
      // Для банкета создаем виртуальный слот с items
      if (items.length > 0) {
        const banquetSlot: MenuSlot = {
          id: 'banquet-slot',
          menuListId: activeMenuListId.value,
          slotType: 'banquet',
          order: 0,
          createdAt: '',
          updatedAt: '',
          items: items,
        };
        slots.value = [banquetSlot];
      } else {
        slots.value = [];
      }
    } catch (err: any) {
      console.error('Failed to fetch banquet items:', err);
    }
  }

  // Добавить блюдо в банкет
  async function addBanquetItem(recipeId: string, notes?: string) {
    if (!activeMenuListId.value) return;

    isLoading.value = true;
    try {
      const newItem = await api.addBanquetItem(activeMenuListId.value, { recipeId, notes });

      if (slots.value.length === 0) {
        slots.value = [{
          id: 'banquet-slot',
          menuListId: activeMenuListId.value,
          slotType: 'banquet',
          order: 0,
          createdAt: '',
          updatedAt: '',
          items: [newItem],
        }];
      } else if (slots.value[0].items) {
        slots.value[0].items.push(newItem);
        slots.value[0].items.sort((a, b) => a.order - b.order);
      }

      toast.add({
        title: 'Успех',
        description: 'Блюдо добавлено в банкет',
        color: 'success',
      });
      return newItem;
    } catch (err: any) {
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось добавить блюдо',
        color: 'error',
      });
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Установить активный список
  async function setActiveMenuList(id: string | null) {
    activeMenuListId.value = id;
    if (id) {
      await fetchDataByType();
    } else {
      slots.value = [];
      days.value = [];
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
    days,
    isLoading,
    error,

    // Getters
    activeMenuList,
    isDaysView,
    isCalendarView,
    isBanquetView,
    getSlotByDayAndMeal,
    getSlotByDateAndMeal,
    getSlotsByDay,
    getSlotsByDate,

    // Actions
    fetchMenuLists,
    fetchSlots,
    fetchDays,
    fetchBanquetItems,
    createMenuList,
    updateMenuList,
    deleteMenuList,

    // Days actions
    createDay,
    updateDay,
    reorderDays,
    deleteDay,

    // Slot actions
    createSlot,
    createSlotWithRecipe,
    addRecipeToSlot,
    removeRecipeFromSlot,
    reorderSlotItems,
    updateSlotItemNotes,

    // Banquet actions
    addBanquetItem,

    // Other
    setActiveMenuList,
    clearError,
  };
});
