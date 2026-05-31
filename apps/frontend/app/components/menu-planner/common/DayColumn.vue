<template>
  <div class="day-column flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
    <!-- Заголовок дня -->
    <div class="p-2">
      <div class="flex items-center justify-between gap-2">
        <h3 class="flex-1 truncate text-sm font-medium text-zinc-900">
          {{ day.title }}
        </h3>

        <!-- Меню с действиями -->
        <UDropdownMenu
          :items="menuItems"
          :ui="{ content: 'w-48' }"
          :content="{
            align: 'start',
            side: 'bottom',
            sideOffset: 8
          }"
        >
          <button
            class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 cursor-pointer"
            @click.stop
          >
            <UIcon name="i-lucide-more-vertical" class="h-4 w-4 text-zinc-500" />
          </button>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Слоты приемов пищи с вертикальным скроллом -->
    <div class="flex-1 overflow-y-auto divide-y divide-zinc-100" :style="{ maxHeight: columnHeight + 'px' }">
      <!-- Завтрак -->
      <div
        class="p-3 meal-slot-container"
        :data-day-id="day.id"
        :data-meal-type="'breakfast'"
        @dragover.prevent="handleSlotContainerDragOver"
        @dragleave="handleSlotContainerDragLeave"
        @drop.prevent="handleSlotContainerDrop($event, 'breakfast')"
      >
        <MealSlot
          :slot-id="breakfastSlot?.id"
          :items="breakfastSlot?.items"
          meal-type="breakfast"
          :is-drag-over="dragOverStates.breakfast"
          @add-recipe="(recipeId) => handleAddRecipe(recipeId, 'breakfast', breakfastSlot?.id)"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
          @drag-over-state="(state) => handleDragOverState('breakfast', state)"
        />
      </div>

      <!-- Обед -->
      <div
        class="p-3 meal-slot-container"
        :data-day-id="day.id"
        :data-meal-type="'lunch'"
        @dragover.prevent="handleSlotContainerDragOver"
        @dragleave="handleSlotContainerDragLeave"
        @drop.prevent="handleSlotContainerDrop($event, 'lunch')"
      >
        <MealSlot
          :slot-id="lunchSlot?.id"
          :items="lunchSlot?.items"
          meal-type="lunch"
          :is-drag-over="dragOverStates.lunch"
          @add-recipe="(recipeId) => handleAddRecipe(recipeId, 'lunch', lunchSlot?.id)"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
          @drag-over-state="(state) => handleDragOverState('lunch', state)"
        />
      </div>

      <!-- Ужин -->
      <div
        class="p-3 meal-slot-container"
        :data-day-id="day.id"
        :data-meal-type="'dinner'"
        @dragover.prevent="handleSlotContainerDragOver"
        @dragleave="handleSlotContainerDragLeave"
        @drop.prevent="handleSlotContainerDrop($event, 'dinner')"
      >
        <MealSlot
          :slot-id="dinnerSlot?.id"
          :items="dinnerSlot?.items"
          meal-type="dinner"
          :is-drag-over="dragOverStates.dinner"
          @add-recipe="(recipeId) => handleAddRecipe(recipeId, 'dinner', dinnerSlot?.id)"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
          @drag-over-state="(state) => handleDragOverState('dinner', state)"
        />
      </div>

      <!-- Перекус -->
      <div
        class="p-3 meal-slot-container"
        :data-day-id="day.id"
        :data-meal-type="'snack'"
        @dragover.prevent="handleSlotContainerDragOver"
        @dragleave="handleSlotContainerDragLeave"
        @drop.prevent="handleSlotContainerDrop($event, 'snack')"
      >
        <MealSlot
          :slot-id="snackSlot?.id"
          :items="snackSlot?.items"
          meal-type="snack"
          :is-drag-over="dragOverStates.snack"
          @add-recipe="(recipeId) => handleAddRecipe(recipeId, 'snack', snackSlot?.id)"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
          @drag-over-state="(state) => handleDragOverState('snack', state)"
        />
      </div>
    </div>

    <!-- Модалка переименования -->
    <PromptModal
      v-model:open="isRenameModalOpen"
      title="Переименовать день"
      label="Название дня"
      placeholder="Введите новое название"
      :initial-value="day?.title || ''"
      confirm-text="Сохранить"
      :validate="validateDayName"
      @confirm="handleRenameConfirm"
    />

    <!-- Модалка подтверждения удаления -->
    <ConfirmModal
      :open="isDeleteModalOpen"
      title="Удалить день?"
      :description="`Вы уверены, что хотите удалить день ${day?.title}? Все рецепты в этом дне также будут удалены.`"
      confirm-text="Удалить"
      confirm-color="danger"
      @update:open="isDeleteModalOpen = $event"
      @confirm="confirmDelete"
    />

    <!-- Модальное окно предпросмотра для дня -->
    <ShoppingListPreviewModal
      v-model:open="showDayPreviewModal"
      :ingredients="dayIngredients"
      @confirm="handleDayConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuDay, MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import MealSlot from './MealSlot.vue';
import ShoppingListPreviewModal from '../modals/ShoppingListPreviewModal.vue';
import Button from '~/shared/ui/button/Button.vue';
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue';
import PromptModal from '~/shared/ui/prompt-modal/PromptModal.vue';

const props = defineProps<{
  day: MenuDay;
  breakfastSlot?: MenuSlot;
  lunchSlot?: MenuSlot;
  dinnerSlot?: MenuSlot;
  snackSlot?: MenuSlot;
  isLoading?: boolean;
  canDelete?: boolean;
  columnHeight?: number;
}>();

const emit = defineEmits<{
  addRecipe: [dayId: string, mealType: MealType, slotId?: string, recipeId?: string, notes?: string];
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  renameDay: [dayId: string, newTitle: string];
  deleteDay: [dayId: string];
  createSlot: [dayId: string, mealType: MealType, recipeId: string, notes?: string];
  addToShoppingList: [ingredients: Array<{ id: string; name: string; amount: number; unit: string }>];
}>();

const toast = useToast();
const isRenameModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const dayToRename = ref<MenuDay | null>(null);
const dayToDelete = ref<MenuDay | null>(null);

// Состояние для модалки предпросмотра дня
const showDayPreviewModal = ref(false);
const dayIngredients = ref<Array<{ id: string; name: string; amount: number; unit: string }>>([]);

// Состояние drag-over для каждого типа приема пищи
const dragOverStates = ref({
  breakfast: false,
  lunch: false,
  dinner: false,
  snack: false,
});

// Валидация названия дня
const validateDayName = (value: string): boolean | string => {
  if (!value.trim()) return 'Название не может быть пустым';
  if (value.length > 50) return 'Название не должно превышать 50 символов';
  return true;
};

// Функция сбора ингредиентов из слотов
function collectIngredientsFromSlots(slots: (MenuSlot | undefined)[]): Array<{ id: string; name: string; amount: number; unit: string }> {
  const ingredients: Array<{ id: string; name: string; amount: number; unit: string }> = [];

  slots.forEach((slot) => {
    if (slot?.items && slot.items.length > 0) {
      slot.items.forEach((item) => {
        if (item.recipe && item.recipe.ingredients) {
          item.recipe.ingredients.forEach((ingredient: any) => {
            let amount = 0;
            if (ingredient.amount) {
              amount = typeof ingredient.amount === 'number'
                ? ingredient.amount
                : parseFloat(ingredient.amount) || 0;
            } else if (ingredient.quantity) {
              amount = typeof ingredient.quantity === 'number'
                ? ingredient.quantity
                : parseFloat(ingredient.quantity) || 0;
            }

            let name = '';
            let unit = '';
            let id = '';

            if (ingredient.name) {
              name = ingredient.name;
            } else if (ingredient.ingredient?.name) {
              name = ingredient.ingredient.name;
            }

            if (ingredient.unit) {
              unit = typeof ingredient.unit === 'string'
                ? ingredient.unit
                : ingredient.unit?.short || 'шт';
            } else if (ingredient.ingredient?.unit?.short) {
              unit = ingredient.ingredient.unit.short;
            } else if (ingredient.ingredient?.unit) {
              unit = typeof ingredient.ingredient.unit === 'string'
                ? ingredient.ingredient.unit
                : ingredient.ingredient.unit?.short || 'шт';
            } else {
              unit = 'шт';
            }

            if (ingredient.id) {
              id = ingredient.id;
            } else if (ingredient.ingredient?.id) {
              id = ingredient.ingredient.id;
            }

            if (name && amount > 0) {
              ingredients.push({ id, name, amount, unit });
            }
          });
        }
      });
    }
  });

  return ingredients;
}

// Меню с действиями
const menuItems = computed(() => {
  const items: any[] = [];

  // В список покупок - собираем ингредиенты и открываем модалку
  items.push({
    label: 'В список покупок',
    icon: 'i-lucide-shopping-cart',
    onSelect: () => {
      const allSlots = [props.breakfastSlot, props.lunchSlot, props.dinnerSlot, props.snackSlot];
      const ingredients = collectIngredientsFromSlots(allSlots);

      if (ingredients.length === 0) {
        toast.add({
          title: 'Нет ингредиентов',
          description: 'В этом дне нет ингредиентов для добавления',
          color: 'warning',
        });
        return;
      }

      dayIngredients.value = ingredients;
      showDayPreviewModal.value = true;
    },
  });

  // Редактировать
  items.push({
    label: 'Редактировать',
    icon: 'i-lucide-pencil',
    onSelect: () => openRenameModal(),
  });

  // Разделитель
  items.push({
    label: '',
    type: 'separator' as const,
  });

  // Удалить
  items.push({
    label: 'Удалить',
    icon: 'i-lucide-trash-2',
    class: 'text-red-600',
    iconClass: 'text-red-600',
    onSelect: () => openDeleteModal(),
    disabled: !props.canDelete,
  });

  return [items];
});

// ============ Методы для модалок ============

// Переименование
function openRenameModal() {
  dayToRename.value = props.day;
  isRenameModalOpen.value = true;
}

function handleRenameConfirm(newTitle: string) {
  if (dayToRename.value) {
    emit('renameDay', dayToRename.value.id, newTitle);
    dayToRename.value = null;
  }
  isRenameModalOpen.value = false;
}

// Удаление
function openDeleteModal() {
  if (!props.canDelete) {
    toast.add({
      title: 'Нельзя удалить',
      description: 'Должен остаться хотя бы один день',
      color: 'warning',
    });
    return;
  }
  dayToDelete.value = props.day;
  isDeleteModalOpen.value = true;
}

function confirmDelete() {
  if (dayToDelete.value) {
    emit('deleteDay', dayToDelete.value.id);
    dayToDelete.value = null;
  }
  isDeleteModalOpen.value = false;
}

// Обработчик подтверждения из модалки дня
function handleDayConfirm(ingredients: Array<{ id: string; name: string; amount: number; unit: string }>) {
  emit('addToShoppingList', ingredients);
  showDayPreviewModal.value = false;
}

// ============ Drag and Drop методы ============

function handleSlotContainerDragOver(event: DragEvent) {
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  const mealType = target.dataset.mealType as MealType;
  if (mealType) {
    dragOverStates.value[mealType] = true;
  }
}

function handleSlotContainerDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement;
  const mealType = target.dataset.mealType as MealType;
  if (mealType) {
    dragOverStates.value[mealType] = false;
  }
}

function getDragData(event: DragEvent) {
  if (!event.dataTransfer) return null;
  const raw = event.dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function handleSlotContainerDrop(event: DragEvent, mealType: MealType) {
  event.preventDefault();
  dragOverStates.value[mealType] = false;

  const dragData = getDragData(event);
  if (!dragData?.itemId || !dragData?.slotId) return;

  const targetSlot = getSlotByMeal(mealType);

  if (targetSlot?.id) {
    emit('moveRecipe', dragData.itemId, dragData.slotId, targetSlot.id);
  } else {
    emit('createSlot', props.day.id, mealType, dragData.recipeId, dragData.notes);
    setTimeout(() => {
      emit('removeRecipe', dragData.itemId);
    }, 100);
  }
}

function getSlotByMeal(mealType: MealType): MenuSlot | undefined {
  switch (mealType) {
    case 'breakfast': return props.breakfastSlot;
    case 'lunch': return props.lunchSlot;
    case 'dinner': return props.dinnerSlot;
    case 'snack': return props.snackSlot;
    default: return undefined;
  }
}

// ============ Обработчики событий от MealSlot ============

// ✅ Функция-прослойка для добавления рецепта
function handleAddRecipe(recipeId: string, mealType: MealType, slotId?: string) {
  console.log('DayColumn handleAddRecipe:', { recipeId, mealType, slotId, dayId: props.day.id });
  emit('addRecipe', props.day.id, mealType, slotId, recipeId);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  emit('moveRecipe', itemId, sourceSlotId, targetSlotId);
}

function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  emit('reorder', slotId, items);
}

function handleCreateSlot(dayId: string, mealType: MealType, recipeId: string, notes?: string) {
  emit('createSlot', dayId, mealType, recipeId, notes);
}

function handleDragOverState(mealType: MealType, state: boolean) {
  dragOverStates.value[mealType] = state;
}
</script>

<style scoped>
.day-column {
  height: 100%;
  min-height: 500px;
}

.meal-slot-container {
  transition: all 0.2s ease;
  border-radius: 0.75rem;
}

.meal-slot-container:has(.meal-slot.drag-over) {
  background-color: #f0fdf4;
}

/* Стили для скролла */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 2px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 20px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
