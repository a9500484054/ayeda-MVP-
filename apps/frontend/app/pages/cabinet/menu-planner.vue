<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 overflow-hidden">
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
          @add-recipe="handleAddRecipe"
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
      <div v-else>
        <EmptyState
          title="Нет активного списка меню"
          description="Создайте новый список или выберите существующий"
          icon="i-lucide-calendar"
        />
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
import Button from '~/shared/ui/button/Button.vue';
import MenuListModal from '~/components/menu-planner/modals/MenuListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';
import { useShoppingListsStore } from '~/stores/shoppingListsStore';
import EmptyState from '~/shared/ui/emptyState/EmptyState.vue';

definePageMeta({ layout: 'cabinet' });

useHead({
  title: 'Планировщик меню',
  meta: [
    { name: 'description', content: 'Составляйте меню на дни, календарь или банкет. Планируйте питание и создавайте списки покупок.', key: 'description' },
    { name: 'robots', content: 'noindex, follow', key: 'robots' },
    // OG теги для соцсетей
    { property: 'og:title', content: 'Планировщик меню | AyEda', key: 'og:title' },
    { property: 'og:description', content: 'Составляйте меню на дни, календарь или банкет. Планируйте питание и создавайте списки покупок.', key: 'og:description' },
    { property: 'og:type', content: 'website', key: 'og:type' },
    { property: 'og:image', content: 'https://ayeda.ru/logo.png', key: 'og:image' },
    { property: 'og:image:alt', content: 'Планировщик меню на AyEda', key: 'og:image:alt' },
    { property: 'og:url', content: 'https://ayeda.ru/cabinet/menu-planner', key: 'og:url' },
    { property: 'og:site_name', content: 'AyEda', key: 'og:site_name' },
  ],
})

const store = useMenuPlannerStore();
const storeShoppingList = useShoppingListsStore();
const toast = useToast();

// Modal states
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingList = ref<MenuList | null>(null);
const deletingList = ref<MenuList | null>(null);

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

// ============ Обработчик добавления рецепта (для DaysView) ============
async function handleAddRecipe(dayId: string, mealType: MealType, slotId: string | undefined, recipeId: string) {
  console.log('Parent handleAddRecipe:', { dayId, mealType, slotId, recipeId });

  if (!recipeId) {
    console.error('No recipeId provided');
    toast.add({
      title: 'Ошибка',
      description: 'Рецепт не выбран',
      color: 'error',
    });
    return;
  }

  try {
    // Ищем существующий слот
    const existingSlot = store.slots.find(
      slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
    );

    if (existingSlot) {
      console.log('Existing slot found:', existingSlot.id);
      await store.addRecipeToSlot(existingSlot.id, recipeId);
    } else {
      console.log('Creating new slot with recipe');
      await store.createSlotWithRecipe({
        slotType: 'day',
        dayId,
        mealType,
        recipeId,
      });
    }

    await store.fetchSlots();

    toast.add({
      title: 'Успех',
      description: 'Рецепт добавлен в меню',
      color: 'success',
    });
  } catch (error: any) {
    console.error('Failed to add recipe:', error);

    if (error.message?.includes('already exists') || error.code === '23505') {
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

// ============ Обработчик добавления рецепта (для CalendarView) ============
async function handleAddRecipeByDate(date: Date, mealType: MealType, recipeId: string, notes?: string) {
  const slotDate = date.toISOString().split('T')[0];

  try {
    const existingSlot = store.slots.find(
      slot => slot.slotDate === slotDate && slot.mealType === mealType && slot.slotType === 'calendar'
    );

    if (existingSlot) {
      await store.addRecipeToSlot(existingSlot.id, recipeId, notes);
    } else {
      await store.createSlotWithRecipe({
        slotType: 'calendar',
        slotDate,
        mealType,
        recipeId,
        notes,
      });
    }

    await store.fetchSlots();

    toast.add({
      title: 'Успех',
      description: 'Рецепт добавлен в меню',
      color: 'success',
    });
  } catch (error: any) {
    console.error('Failed to add recipe:', error);
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось добавить рецепт',
      color: 'error',
    });
  }
}

// ============ Обработчик добавления рецепта (для BanquetView) ============
async function handleAddBanquetItem(recipeId: string, notes?: string) {
  try {
    await store.addBanquetItem(recipeId, notes);
    await store.fetchSlots();

    toast.add({
      title: 'Успех',
      description: 'Рецепт добавлен в банкет',
      color: 'success',
    });
  } catch (error: any) {
    console.error('Failed to add banquet item:', error);
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось добавить рецепт',
      color: 'error',
    });
  }
}

// ============ Обработчик добавления в список покупок ============
async function handleAddToShoppingList(ingredients: Array<{ id: string; name: string; amount: number; unit: string }>) {
  try {
    if (!ingredients.length) {
      toast.add({
        title: 'Нет ингредиентов',
        description: 'В меню нет ингредиентов для добавления',
        color: 'warning'
      });
      return;
    }

    // Группируем одинаковые ингредиенты
    const groupedIngredients = new Map<string, { name: string; quantity: number; unit: string }>();

    ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`;
      if (groupedIngredients.has(key)) {
        const existing = groupedIngredients.get(key)!;
        existing.quantity += ingredient.amount;
      } else {
        groupedIngredients.set(key, {
          name: ingredient.name,
          quantity: ingredient.amount,
          unit: ingredient.unit
        });
      }
    });

    const items = Array.from(groupedIngredients.values());

    // Создаем новый список покупок
    const today = new Date();
    const title = `Меню от ${today.toLocaleDateString('ru-RU')}`;

    await storeShoppingList.createMenuShoppingList(title, items);

    toast.add({
      title: 'Список покупок создан',
      description: `${items.length} ингредиент(ов) добавлено в список "${title}"`,
      color: 'success'
    });
  } catch (error: any) {
    console.error('Failed to add to shopping list:', error);
    toast.add({
      title: 'Ошибка',
      description: error.data?.message || 'Не удалось добавить ингредиенты в список покупок',
      color: 'error'
    });
  }
}

// ============ Обработчик заметок ============
async function handleEditNotes(itemId: string, notes: string) {
  await store.updateSlotItemNotes(itemId, notes);
}

// ============ Обработчики для DaysView ============
async function handleCreateDay(dayOrder: number, title: string) {
  await store.createDay(dayOrder, title);
}

async function handleRenameDay(dayId: string, newTitle: string) {
  await store.updateDay(dayId, newTitle);
}

async function handleDeleteDay(dayId: string) {
  await store.deleteDay(dayId);
}

// ============ Обработчик перемещения рецепта ============
async function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  console.log('=== MOVE RECIPE IN PARENT ===');
  console.log('itemId:', itemId);
  console.log('sourceSlotId:', sourceSlotId);
  console.log('targetSlotId:', targetSlotId);

  if (!targetSlotId || targetSlotId === 'undefined' || targetSlotId === 'null') {
    console.error('Invalid target slot ID:', targetSlotId);
    toast.add({
      title: 'Ошибка',
      description: 'Неверный целевой слот',
      color: 'error',
    });
    return;
  }

  // Проверяем существование целевого слота в store
  const targetSlot = store.slots.find(s => s.id === targetSlotId);
  if (!targetSlot) {
    console.error('Target slot not found in store. Available slots:',
      store.slots.map(s => ({ id: s.id, mealType: s.mealType, dayId: s.dayId }))
    );
    toast.add({
      title: 'Ошибка',
      description: 'Целевой слот не найден',
      color: 'error',
    });
    return;
  }

  // Проверяем на одинаковые слоты
  if (sourceSlotId === targetSlotId) {
    console.log('Same slot - skipping move');
    return;
  }

  try {
    // Находим исходный слот и перемещаемый элемент
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
    const alreadyExists = targetSlot.items?.some(i => i.recipeId === movedItem.recipeId);
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
    console.log('Recipe added to target slot');

    // Затем удаляем из исходного
    await store.removeRecipeFromSlot(itemId);
    console.log('Recipe removed from source slot');

    // toast.add({
    //   title: 'Успех',
    //   description: 'Рецепт перемещен',
    //   color: 'success',
    // });
  } catch (error: any) {
    console.error('Failed to move recipe:', error);

    if (error.message?.includes('already exists') || error.code === '23505') {
      toast.add({
        title: 'Нельзя переместить',
        description: 'Этот рецепт уже есть в целевом слоте',
        color: 'warning',
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

// ============ Обработчик изменения порядка рецептов ============
async function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  console.log('Reorder items:', { slotId, items });
  try {
    await store.reorderSlotItems(slotId, items);
  } catch (error) {
    console.error('Failed to reorder:', error);
  }
}

// ============ Обработчик создания слота ============
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

    await store.fetchSlots();
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
