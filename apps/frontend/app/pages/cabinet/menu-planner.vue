<!-- pages/cabinet/menu-planner.vue -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Планировщик меню
        </h1>
        <p class="mt-1 text-sm text-zinc-500">
          Составляйте меню на дни, календарь или банкет
        </p>
      </div>

      <Button size="md" variant="solid" color="primary" @click="openCreateListModal">
        <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" />
        Новый список
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading && store.menuLists.length === 0" class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      <p class="mt-4 text-sm text-zinc-500">Загрузка...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <MenuListSelector
        :lists="store.menuLists"
        :active-id="store.activeMenuListId"
        :is-loading="store.isLoading"
        @select="handleSelectList"
        @edit="handleEditList"
        @delete="handleDeleteList"
        @create="openCreateListModal"
      />

      <div v-if="store.activeMenuList" class="mt-6">
        <!-- Тип "Дни" -->
        <DaysView
          v-if="store.isDaysView"
          :days="store.days"
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipeByDay"
          @move-recipe="handleMoveRecipe"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @create-day="handleCreateDay"
          @rename-day="handleRenameDay"
          @delete-day="handleDeleteDay"
          @reorder="handleReorder"
          @create-slot="handleCreateSlot"
          @add-to-shopping-list="handleAddToShoppingList"
        />

        <!-- Тип "Календарь" -->
        <CalendarView
          v-else-if="store.isCalendarView"
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipeByDate"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @add-to-shopping-list="handleAddToShoppingList"
        />

        <!-- Тип "Банкет" -->
        <BanquetView
          v-else-if="store.isBanquetView"
          :items="store.slots[0]?.items || []"
          :is-loading="store.isLoading"
          @add-recipe="handleAddBanquetItem"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @add-to-shopping-list="handleAddToShoppingList"
        />
      </div>

      <!-- Пустое состояние -->
      <div v-else class="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16">
        <UIcon name="i-lucide-calendar" class="h-12 w-12 text-zinc-300" />
        <p class="mt-3 text-zinc-500">Нет активного списка меню</p>
        <p class="text-sm text-zinc-400">Создайте новый список или выберите существующий</p>
      </div>
    </template>

    <!-- Модалки -->
    <MenuListModal
      v-model:open="isCreateModalOpen"
      @update:open="isCreateModalOpen = v"
      @created="handleListCreated"
    />

    <MenuListModal
      v-model:open="isEditModalOpen"
      :list="editingList"
      @update:open="isEditModalOpen = v"
      @updated="handleListUpdated"
    />

    <DeleteConfirmationModal
      :open="isDeleteModalOpen"
      title="Удалить список?"
      :description="deleteDescription"
      @update:open="isDeleteModalOpen = v"
      @confirm="handleConfirmDelete"
    />

    <!-- Модалка поиска рецептов -->
    <RecipeSearchModal
      :open="isRecipeSearchOpen"
      :slot-id="selectedSlotId"
      @update:open="isRecipeSearchOpen = v"
      @recipe-added="handleRecipeAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMenuPlannerStore } from '~/stores/menuPlannerStore';
import type { MenuList, MealType } from '~/composables/useMenuPlannerApi';

// Components
import MenuListSelector from '~/components/menu-planner/MenuListSelector.vue';
import DaysView from '~/components/menu-planner/views/DaysView.vue';
import CalendarView from '~/components/menu-planner/views/CalendarView.vue';
import BanquetView from '~/components/menu-planner/views/BanquetView.vue';
import RecipeSearchModal from '~/components/menu-planner/modals/RecipeSearchModal.vue';
import Button from '~/shared/ui/button/Button.vue';
import MenuListModal from '~/components/menu-planner/modals/MenuListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';

definePageMeta({ layout: 'cabinet' });

const store = useMenuPlannerStore();
const toast = useToast()

// Modal states
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isRecipeSearchOpen = ref(false);
const editingList = ref<MenuList | null>(null);
const deletingList = ref<MenuList | null>(null);

// Состояние для добавления рецепта
const pendingRecipeData = ref<{
  type: 'day' | 'date' | 'banquet';
  dayId?: string;
  date?: Date;
  mealType?: MealType;
} | null>(null);

const selectedSlotId = ref<string | null>(null);

const deleteDescription = computed(() => {
  return `Вы уверены, что хотите удалить список "${deletingList.value?.title}"? Все рецепты в нем будут удалены.`;
});

// Handlers
function openCreateListModal() {
  isCreateModalOpen.value = true;
}

function handleSelectList(id: string) {
  store.setActiveMenuList(id);
}

function handleEditList(list: MenuList) {
  editingList.value = list;
  isEditModalOpen.value = true;
}

function handleDeleteList(list: MenuList) {
  deletingList.value = list;
  isDeleteModalOpen.value = true;
}

async function handleConfirmDelete() {
  if (deletingList.value) {
    await store.deleteMenuList(deletingList.value.id);
    isDeleteModalOpen.value = false;
    deletingList.value = null;
  }
}

async function handleListCreated() {
  isCreateModalOpen.value = false;
  await store.fetchMenuLists();
}

async function handleListUpdated() {
  isEditModalOpen.value = false;
  editingList.value = null;
  await store.fetchMenuLists();
}

// Обработчик добавления ингредиентов в список покупок
async function handleAddToShoppingList(ingredients: Array<{ id: string; name: string; amount: number; unit: string }>) {
  if (!ingredients.length) {
    toast.add({
      title: 'Нет ингредиентов',
      description: 'В меню нет ингредиентов для добавления',
      color: 'warning'
    });
    return;
  }

  try {
    // Выводим в консоль для проверки
    console.log('=== Ингредиенты для добавления в список покупок ===');
    console.log(`Всего ингредиентов: ${ingredients.length}`);
    console.log(`Объект ингредиентов:`, ingredients);

    ingredients.forEach((ingredient, index) => {
      console.log(`${index + 1}. ${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`);
    });

    // Здесь будет логика добавления в список покупок через API
    toast.add({
      title: 'Добавлено в список покупок',
      description: `${ingredients.length} ингредиент${getIngredientEnding(ingredients.length)} добавлен${getIngredientEndingVerb(ingredients.length)} в список`,
      color: 'success'
    });
  } catch (error) {
    console.error('Failed to add to shopping list:', error);
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось добавить ингредиенты в список покупок',
      color: 'error'
    });
  }
}

// Вспомогательные функции для правильных окончаний
function getIngredientEnding(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return '';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'а';
  return 'ов';
}

function getIngredientEndingVerb(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'о';
  return 'ы';
}

// Логика для Days view
function handleAddRecipeByDay(dayId: string, mealType: MealType) {
  pendingRecipeData.value = {
    type: 'day',
    dayId,
    mealType,
  };
  isRecipeSearchOpen.value = true;
}

// Логика для Calendar view
function handleAddRecipeByDate(date: Date, mealType: MealType) {
  pendingRecipeData.value = {
    type: 'date',
    date,
    mealType,
  };
  isRecipeSearchOpen.value = true;
}

// Логика для Banquet
function handleAddBanquetItem(recipeId: string, notes?: string) {
  store.addBanquetItem(recipeId, notes);
}

// Обработка заметок
async function handleEditNotes(itemId: string, notes: string) {
  await store.updateSlotItemNotes(itemId, notes);
}

// Создание дня
async function handleCreateDay(dayOrder: number, title: string) {
  await store.createDay(dayOrder, title);
}

// Переименование дня
async function handleRenameDay(dayId: string, newTitle: string) {
  await store.updateDay(dayId, newTitle);
}

async function handleDeleteDay(dayId: string) {
  await store.deleteDay(dayId);
}

// Главный обработчик - вызывается когда выбран рецепт в модалке
async function handleRecipeAdded(recipeId: string) {
  if (!pendingRecipeData.value) {
    console.error('No pending recipe data');
    isRecipeSearchOpen.value = false;
    return;
  }

  try {
    const { type, dayId, date, mealType } = pendingRecipeData.value;

    if (type === 'day' && dayId && mealType) {
      // Ищем существующий слот
      const existingSlot = store.slots.find(
        slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
      );

      if (existingSlot) {
        await store.addRecipeToSlot(existingSlot.id, recipeId);
      } else {
        await store.createSlotWithRecipe({
          slotType: 'day',
          dayId,
          mealType,
          recipeId,
        });
      }
    } else if (type === 'date' && date && mealType) {
      const slotDate = date.toISOString().split('T')[0];
      const existingSlot = store.slots.find(
        slot => slot.slotDate === slotDate && slot.mealType === mealType && slot.slotType === 'calendar'
      );

      if (existingSlot) {
        await store.addRecipeToSlot(existingSlot.id, recipeId);
      } else {
        await store.createSlotWithRecipe({
          slotType: 'calendar',
          slotDate,
          mealType,
          recipeId,
        });
      }
    }

    pendingRecipeData.value = null;
    isRecipeSearchOpen.value = false;
  } catch (error) {
    console.error('Failed to add recipe:', error);
  }
}

// Перемещение рецепта между слотами
async function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  console.log('Parent move recipe:', { itemId, sourceSlotId, targetSlotId });

  if (!targetSlotId || targetSlotId === 'undefined') {
    console.error('Invalid target slot ID');
    toast.add({
      title: 'Ошибка',
      description: 'Неверный целевой слот',
      color: 'error',
    });
    return;
  }

  // Проверка на одинаковые слоты
  if (sourceSlotId === targetSlotId) {
    console.log('Same slot - skipping move');
    return;
  }

  try {
    const sourceSlot = store.slots.find(s => s.id === sourceSlotId);
    const movedItem = sourceSlot?.items?.find(i => i.id === itemId);

    if (!movedItem) {
      console.error('Recipe not found in source slot');
      toast.add({
        title: 'Ошибка',
        description: 'Рецепт не найден в исходном слоте',
        color: 'error',
      });
      return;
    }

    // Проверяем, нет ли уже такого рецепта в целевом слоте
    const targetSlot = store.slots.find(s => s.id === targetSlotId);
    const alreadyExists = targetSlot?.items?.some(i => i.recipeId === movedItem.recipeId);

    if (alreadyExists) {
      toast.add({
        title: 'Нельзя переместить',
        description: 'Этот рецепт уже есть в целевом слоте',
        color: 'warning',
      });
      return;
    }

    // Сначала добавляем рецепт в целевой слот
    await store.addRecipeToSlot(targetSlotId, movedItem.recipeId, movedItem.notes);

    // Затем удаляем из исходного
    await store.removeRecipeFromSlot(itemId);

    toast.add({
      title: 'Успех',
      description: 'Рецепт перемещен',
      color: 'success',
    });
  } catch (error: any) {
    console.error('Failed to move recipe:', error);

    // Более детальная обработка ошибок
    if (error.message?.includes('duplicate') || error.code === '23505' || error.statusCode === 409) {
      toast.add({
        title: 'Нельзя переместить',
        description: 'Этот рецепт уже есть в целевом слоте',
        color: 'warning',
      });
    } else if (error.statusCode === 500) {
      toast.add({
        title: 'Ошибка сервера',
        description: 'Попробуйте обновить страницу',
        color: 'error',
      });
    } else {
      toast.add({
        title: 'Ошибка',
        description: error.message || 'Не удалось переместить рецепт',
        color: 'error',
      });
    }
  }
}

async function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  console.log('Reorder items:', { slotId, items });
  try {
    await store.reorderSlotItems(slotId, items);
    toast.add({
      title: 'Успех',
      description: 'Порядок рецептов изменен',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to reorder:', error);
  }
}

async function handleCreateSlot(dayId: string, mealType: MealType, recipeId: string, notes?: string) {
  try {
    // Проверяем, существует ли уже слот с таким же рецептом в этом дне
    const existingSlot = store.slots.find(
      slot => slot.dayId === dayId && slot.mealType === mealType
    );

    if (existingSlot) {
      // Если слот существует, проверяем наличие рецепта
      const alreadyExists = existingSlot.items?.some(item => item.recipeId === recipeId);
      if (alreadyExists) {
        toast.add({
          title: 'Рецепт уже есть',
          description: 'Этот рецепт уже добавлен в этот прием пищи',
          color: 'warning',
        });
        return;
      }

      // Добавляем в существующий слот
      await store.addRecipeToSlot(existingSlot.id, recipeId, notes);
    } else {
      // Создаем новый слот с рецептом
      await store.createSlotWithRecipe({
        slotType: 'day',
        dayId,
        mealType,
        recipeId,
        notes,
      });
    }

    toast.add({
      title: 'Успех',
      description: 'Рецепт добавлен',
      color: 'success',
    });
  } catch (error: any) {
    console.error('Failed to create slot with recipe:', error);

    if (error.message?.includes('duplicate') || error.code === '23505') {
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
  }
}

// Load data
onMounted(() => {
  store.fetchMenuLists();
});
</script>
