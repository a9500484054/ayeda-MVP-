<!-- apps/frontend/app/pages/cabinet/menu-planner.vue (исправленный) -->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Планировщик меню
        </h1>
        <p class="mt-1 text-sm text-zinc-500">
          Составляйте меню на дни или календарь, добавляйте рецепты
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
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipeByDay"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @create-day="handleCreateDay"
        />

        <!-- Тип "Календарь" -->
        <CalendarView
          v-else
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipeByDate"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
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
      @update:open="(v) => isCreateModalOpen = v"
      @created="handleListCreated"
    />

    <MenuListModal
      v-model:open="isEditModalOpen"
      :list="editingList"
      @update:open="(v) => isEditModalOpen = v"
      @updated="handleListUpdated"
    />

    <DeleteConfirmationModal
      :open="isDeleteModalOpen"
      title="Удалить список?"
      :description="deleteDescription"
      @update:open="(v) => isDeleteModalOpen = v"
      @confirm="handleConfirmDelete"
    />

    <!-- Модалка поиска рецептов -->
    <RecipeSearchModal
      :open="isRecipeSearchOpen"
      :slot-id="selectedSlotId"
      @update:open="(v) => isRecipeSearchOpen = v"
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
import RecipeSearchModal from '~/components/menu-planner/modals/RecipeSearchModal.vue';
import Button from '~/shared/ui/button/Button.vue';
import MenuListModal from '~/components/menu-planner/modals/MenuListModal.vue';
import DeleteConfirmationModal from '~/components/menu-planner/modals/DeleteConfirmationModal.vue';

definePageMeta({ layout: 'cabinet' });

const store = useMenuPlannerStore();

// Modal states
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isRecipeSearchOpen = ref(false);
const editingList = ref<MenuList | null>(null);
const deletingList = ref<MenuList | null>(null);

// Состояние для добавления рецепта
const pendingRecipeData = ref<{
  type: 'day' | 'date';
  dayOrder?: number;
  date?: Date;
  mealType: MealType;
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

// Новая логика для Days view
function handleAddRecipeByDay(dayOrder: number, mealType: string) {
  // Сохраняем данные для создания слота после выбора рецепта
  pendingRecipeData.value = {
    type: 'day',
    dayOrder,
    mealType: mealType as MealType,
  };
  // Открываем модалку поиска рецептов
  isRecipeSearchOpen.value = true;
}

// Новая логика для Calendar view
function handleAddRecipeByDate(date: Date, mealType: string) {
  pendingRecipeData.value = {
    type: 'date',
    date,
    mealType: mealType as MealType,
  };
  isRecipeSearchOpen.value = true;
}

// Обработка заметок
function handleEditNotes(itemId: string, notes: string) {
  // TODO: Implement edit notes API call
  console.log('Edit notes:', itemId, notes);
}

// Конвертация dayOrder в дату (для Days view)
function getDateFromDayOrder(dayOrder: number): string {
  const date = new Date();
  date.setDate(date.getDate() + (dayOrder - 1));
  return date.toISOString().split('T')[0];
}

// Главный обработчик - вызывается когда выбран рецепт в модалке
async function handleRecipeAdded(recipeId: string) {
  if (!pendingRecipeData.value) {
    console.error('No pending recipe data');
    isRecipeSearchOpen.value = false;
    return;
  }

  try {
    const { type, dayOrder, date, mealType } = pendingRecipeData.value;

    // Проверяем, существует ли уже слот
    let existingSlot = null;

    if (type === 'day' && dayOrder !== undefined) {
      const slotDate = getDateFromDayOrder(dayOrder);
      existingSlot = store.slots.find(
        slot => slot.slotDate === slotDate && slot.mealType === mealType
      );
    } else if (type === 'date' && date) {
      const slotDate = date.toISOString().split('T')[0];
      existingSlot = store.slots.find(
        slot => slot.slotDate === slotDate && slot.mealType === mealType
      );
    }

    if (existingSlot) {
      // Слот существует - просто добавляем рецепт
      await store.addRecipeToSlot(existingSlot.id, recipeId);
    } else {
      // Слота нет - создаем слот и добавляем рецепт одной операцией
      if (type === 'day' && dayOrder !== undefined) {
        const slotDate = getDateFromDayOrder(dayOrder);
        await store.createSlotWithRecipe({
          slotDate,
          mealType,
          recipeId,
        });
      } else if (type === 'date' && date) {
        const slotDate = date.toISOString().split('T')[0];
        await store.createSlotWithRecipe({
          slotDate,
          mealType,
          recipeId,
        });
      }
    }

    // Очищаем состояние и закрываем модалку
    pendingRecipeData.value = null;
    isRecipeSearchOpen.value = false;
  } catch (error) {
    console.error('Failed to add recipe:', error);
  }
}

// Новая функция для создания пустого дня
async function handleCreateDay(dayOrder: number) {
  try {
    // Создаем пустой день (без слотов)
    // В store можно добавить метод createEmptyDay
    // Пока просто логируем
    console.log('Creating empty day:', dayOrder);

    // TODO: Если нужно хранить информацию о созданных днях в БД,
    // добавить метод в API и store
  } catch (error) {
    console.error('Failed to create day:', error);
  }
}

// Load data
onMounted(() => {
  store.fetchMenuLists();
});
</script>
