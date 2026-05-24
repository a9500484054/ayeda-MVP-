import { defineStore } from 'pinia';
import { useMenuPlannerApi, type MenuList, type MenuSlot, type MenuSlotItem, type MenuDay, type SlotType, type MealType, type DisplayType, type UpdateMenuListDto } from '~/composables/useMenuPlannerApi';

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

  const getSlotByDayAndMeal = (dayId: string, mealType: MealType): MenuSlot | undefined => {
    return slots.value.find(
      slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
    );
  };

  const getSlotByDateAndMeal = (date: string, mealType: MealType): MenuSlot | undefined => {
    return slots.value.find(
      slot => slot.slotDate === date && slot.mealType === mealType && slot.slotType === 'calendar'
    );
  };

  const getSlotsByDay = (dayId: string): MenuSlot[] => {
    return slots.value.filter(slot => slot.dayId === dayId && slot.slotType === 'day');
  };

  const getSlotsByDate = (date: string): MenuSlot[] => {
    return slots.value.filter(slot => slot.slotDate === date && slot.slotType === 'calendar');
  };

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
        await fetchDataByType();
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('Failed to fetch menu lists:', err);
    } finally {
      isLoading.value = false;
    }
  }

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
      await fetchBanquetItems();
    }
  }

  async function fetchDays() {
    if (!activeMenuListId.value) return;

    try {
      days.value = await api.getDays(activeMenuListId.value);
    } catch (err: any) {
      console.error('Failed to fetch days:', err);
    }
  }

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

  async function createMenuList(data: {
    title: string;
    displayType?: DisplayType;
    icon?: string;
    presetDays?: number;
  }) {
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

      if (newList.displayType === 'days' && data.presetDays) {
        await createDefaultDays(newList.id, data.presetDays);
      } else if (newList.displayType === 'days') {
        await createDefaultDays(newList.id, 7);
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

  async function createDefaultDays(menuListId: string, daysCount: number = 7) {
    try {
      for (let i = 1; i <= daysCount; i++) {
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

  async function deleteDay(dayId: string) {
    try {
      await api.deleteDay(dayId);
      days.value = days.value.filter(d => d.id !== dayId);
      slots.value = slots.value.filter(s => s.dayId !== dayId);

      toast.add({
        title: 'Успех',
        description: 'День удален',
        color: 'success',
      });
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

  async function createSlotWithRecipe(params: {
    slotType: 'day' | 'calendar';
    dayId?: string;
    slotDate?: string;
    mealType: MealType;
    recipeId: string;
    notes?: string;
  }) {
    if (!activeMenuListId.value) {
      throw new Error('No active menu list');
    }

    try {
      console.log('Creating slot with recipe:', params);

      // Проверяем, не существует ли уже слот
      const existingSlot = slots.value.find(slot =>
        slot.slotType === params.slotType &&
        slot.dayId === params.dayId &&
        slot.slotDate === params.slotDate &&
        slot.mealType === params.mealType
      );

      if (existingSlot) {
        console.log('Slot exists, adding recipe to existing slot:', existingSlot.id);
        // Если слот существует, проверяем, нет ли уже такого рецепта
        const recipeExists = existingSlot.items?.some(item => item.recipeId === params.recipeId);
        if (recipeExists) {
          throw new Error('Recipe already exists in this slot');
        }
        // Добавляем рецепт в существующий слот
        return await addRecipeToSlot(existingSlot.id, params.recipeId, params.notes);
      }

      // Создаем новый слот
      console.log('Creating new slot...');
      const slot = await api.createSlot({
        menuListId: activeMenuListId.value,
        slotType: params.slotType,
        dayId: params.dayId,
        slotDate: params.slotDate,
        mealType: params.mealType,
      });

      console.log('Slot created:', slot);

      // Добавляем рецепт в новый слот
      const item = await api.addRecipeToSlot(slot.id, {
        recipeId: params.recipeId,
        notes: params.notes
      });

      console.log('Recipe added to slot:', item);

      // Обновляем локальное состояние
      slot.items = [item];
      slots.value.push(slot);

      // toast.add({
      //   title: 'Успех',
      //   description: 'Рецепт добавлен',
      //   color: 'success',
      // });

      return { slot, item };
    } catch (error: any) {
      console.error('Failed to create slot with recipe:', error);

      if (error.message?.includes('already exists')) {
        toast.add({
          title: 'Рецепт уже есть',
          description: 'Этот рецепт уже добавлен в этот прием пищи',
          color: 'warning',
        });
      } else {
        toast.add({
          title: 'Ошибка',
          description: error.message || 'Не удалось добавить рецепт',
          color: 'error',
        });
      }
      throw error;
    }
  }

  async function addRecipeToSlot(slotId: string, recipeId: string, notes?: string) {
    try {
      // Проверяем, не существует ли уже такой рецепт в слоте
      const slot = slots.value.find(s => s.id === slotId);
      const alreadyExists = slot?.items?.some(item => item.recipeId === recipeId);

      if (alreadyExists) {
        throw new Error('Recipe already exists in this slot');
      }

      const item = await api.addRecipeToSlot(slotId, { recipeId, notes });

      // Обновляем локальное состояние
      const targetSlot = slots.value.find(s => s.id === slotId);
      if (targetSlot) {
        if (!targetSlot.items) targetSlot.items = [];
        targetSlot.items.push(item);
        targetSlot.items.sort((a, b) => a.order - b.order);
      }

      // toast.add({
      //   title: 'Успех',
      //   description: 'Рецепт добавлен',
      //   color: 'success',
      // });

      return item;
    } catch (error: any) {
      console.error('Failed to add recipe to slot:', error);

      if (error.message?.includes('already exists')) {
        toast.add({
          title: 'Рецепт уже есть',
          description: 'Этот рецепт уже добавлен в этот слот',
          color: 'warning',
        });
      } else {
        toast.add({
          title: 'Ошибка',
          description: error.message || 'Не удалось добавить рецепт',
          color: 'error',
        });
      }
      throw error;
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

          // Если слот стал пустым и это не банкет, удаляем слот
          if (slot.items?.length === 0 && slot.slotType !== 'banquet') {
            await deleteSlot(slot.id);
          }
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

  async function deleteSlot(slotId: string) {
    try {
      await api.deleteSlot(slotId);
      slots.value = slots.value.filter(s => s.id !== slotId);
    } catch (err: any) {
      console.error('Failed to delete slot:', err);
    }
  }

  async function reorderSlotItems(slotId: string, items: { id: string; order: number }[]) {
    try {
      const reordered = await api.reorderSlotItems(slotId, items);
      const slotIndex = slots.value.findIndex(s => s.id === slotId);
      if (slotIndex !== -1) {
        slots.value[slotIndex].items = reordered;
      }
    } catch (err: any) {
      console.error('Failed to reorder items:', err);
      toast.add({
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить порядок',
        color: 'error',
      });
    }
  }

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

  async function fetchBanquetItems() {
    if (!activeMenuListId.value) return;

    isLoading.value = true;
    try {
      const items = await api.getBanquetItems(activeMenuListId.value);

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
    } finally {
      isLoading.value = false;
    }
  }

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

  async function setActiveMenuList(id: string | null) {
    activeMenuListId.value = id;
    if (id) {
      await fetchDataByType();
    } else {
      slots.value = [];
      days.value = [];
    }
  }

  function isRecipeInSlot(slotId: string, recipeId: string): boolean {
    const slot = slots.value.find(s => s.id === slotId);
    return slot?.items?.some(item => item.recipeId === recipeId) || false;
  }

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
    deleteSlot,

    // Banquet actions
    addBanquetItem,

    // Other
    setActiveMenuList,
    clearError,
    isRecipeInSlot,
  };
});
