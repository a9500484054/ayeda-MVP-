<!-- apps\frontend\app\pages\cabinet\menu-planner.vue -->
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
      <!-- Selector списков меню -->
      <MenuListSelector
        :lists="store.menuLists"
        :active-id="store.activeMenuListId"
        :is-loading="store.isLoading"
        @select="handleSelectList"
        @edit="handleEditList"
        @delete="handleDeleteList"
        @create="openCreateListModal"
      />

      <!-- Переключатель типа отображения -->
      <!-- <div v-if="store.activeMenuList" class="mt-6">
        <DisplayTypeInfo :display-type="store.activeMenuList.displayType" />
      </div> -->

      <!-- Контент в зависимости от типа -->
      <div v-if="store.activeMenuList" class="mt-6">
        <!-- Тип "Дни" -->
        <DaysView
          v-if="store.isDaysView"
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipe"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @create-slot="handleCreateSlot"
        />

        <!-- Тип "Календарь" -->
        <CalendarView
          v-else
          :slots="store.slots"
          :is-loading="store.isLoading"
          @add-recipe="handleAddRecipe"
          @remove-recipe="store.removeRecipeFromSlot"
          @edit-notes="handleEditNotes"
          @create-slot="handleCreateSlot"
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

    <!-- Для создания нового списка -->
    <MenuListModal
      v-model:open="isCreateModalOpen"
      @update:open="(v) => isCreateModalOpen = v"
      @created="handleListCreated"
    />

    <!-- Для редактирования существующего -->
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
import type { MenuList } from '~/composables/useMenuPlannerApi';

// Components
import MenuListSelector from '~/components/menu-planner/MenuListSelector.vue';
import DisplayTypeInfo from '~/components/menu-planner/DisplayTypeInfo.vue';
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
const selectedSlotId = ref<string | null>(null);

// Computed
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

function handleAddRecipe(slotId: string) {
  selectedSlotId.value = slotId;
  isRecipeSearchOpen.value = true;
}

function handleEditNotes(itemId: string, notes: string) {
  console.log('Edit notes:', itemId, notes);
}

function getDateFromDayOrder(dayOrder: number): string {
  const date = new Date();
  date.setDate(date.getDate() + (dayOrder - 1)); // day-1 = сегодня
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

async function handleCreateSlot(data: { dayOrder?: number; slotDate?: string; mealType: string }) {
  try {
    let slotData: any = { mealType: data.mealType };

    if (data.dayOrder !== undefined) {
      // Конвертируем номер дня в реальную дату
      slotData.slotDate = getDateFromDayOrder(data.dayOrder);
    } else if (data.slotDate) {
      slotData.slotDate = data.slotDate;
    }

    const newSlot = await store.createSlot(slotData);

    if (newSlot) {
      await nextTick();
      handleAddRecipe(newSlot.id);
    }
  } catch (error) {
    console.error('Failed to create slot:', error);
  }
}

async function handleRecipeAdded(recipeId: string) {
  if (selectedSlotId.value) {
    await store.addRecipeToSlot(selectedSlotId.value, recipeId);
  }
  isRecipeSearchOpen.value = false;
  selectedSlotId.value = null;
}

// Load data
onMounted(() => {
  store.fetchMenuLists();
});
</script>
