<!-- DayColumn.vue - обновленная версия -->
<template>
  <div class="day-column  flex-shrink-0 rounded-xl border border-zinc-200 bg-white shadow-sm">
    <!-- Заголовок дня -->
    <div class="border-b border-zinc-100 p-3 text-center">
      <div class="flex items-center justify-center gap-2">
        <h3 class="font-medium text-zinc-800">{{ day.title }}</h3>
        <button
          class="rounded p-0.5 text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-green-600 group-hover:opacity-100"
          @click="openRenameModal"
        >
          <UIcon name="i-lucide-pencil" class="h-3 w-3" />
        </button>
        <button
          v-if="canDelete"
          class="rounded p-0.5 text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100"
          @click="openDeleteModal"
        >
          <UIcon name="i-lucide-trash-2" class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Слоты приемов пищи -->
    <div class="divide-y divide-zinc-100">
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
          @add-recipe="() => emit('addRecipe', day.id, 'breakfast')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
        />
      </div>

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
          @add-recipe="() => emit('addRecipe', day.id, 'lunch')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
        />
      </div>

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
          @add-recipe="() => emit('addRecipe', day.id, 'dinner')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
        />
      </div>

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
          @add-recipe="() => emit('addRecipe', day.id, 'snack')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
          @request-create-slot="handleCreateSlot"
        />
      </div>
    </div>

        <!-- Модалка переименования -->
    <UModal v-model:open="isRenameModalOpen" title="Переименовать день">
      <template #body>
        <UInput v-model="newTitle" placeholder="Название дня" autofocus />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isRenameModalOpen = false">Отмена</UButton>
          <UButton color="primary" @click="saveRename">Сохранить</UButton>
        </div>
      </template>
    </UModal>

    <!-- Модалка подтверждения удаления -->
    <UModal v-model:open="isDeleteModalOpen" title="Удалить день?">
      <template #body>
        <p class="text-sm text-zinc-600">
          Вы уверены, что хотите удалить день "{{ day.title }}"? Все рецепты в этом дне также будут удалены.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isDeleteModalOpen = false">Отмена</UButton>
          <UButton color="red" @click="confirmDelete">Удалить</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MenuDay, MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import MealSlot from './MealSlot.vue';

const props = defineProps<{
  day: MenuDay;
  breakfastSlot?: MenuSlot;
  lunchSlot?: MenuSlot;
  dinnerSlot?: MenuSlot;
  snackSlot?: MenuSlot;
  isLoading?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [dayId: string, mealType: MealType];
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  renameDay: [dayId: string, newTitle: string];
  deleteDay: [dayId: string];
  createSlot: [dayId: string, mealType: MealType, recipeId: string, notes?: string];
}>();

const isRenameModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const newTitle = ref('');

// Состояние drag-over для каждого типа приема пищи
const dragOverStates = ref({
  breakfast: false,
  lunch: false,
  dinner: false,
  snack: false,
});

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
  if (!dragData) return;

  const targetSlot = getSlotByMeal(mealType);
  const sourceSlotId = dragData.slotId;

  // Если слот существует - перемещаем как обычно
  if (targetSlot) {
    emit('moveRecipe', dragData.itemId, sourceSlotId, targetSlot.id);
    return;
  }

  // Если слота нет - создаем новый слот с рецептом
  const recipeId = dragData.recipeId;
  if (recipeId) {
    emit('createSlot', props.day.id, mealType, recipeId, dragData.notes);

    // Удаляем рецепт из исходного слота после успешного создания
    // Небольшая задержка, чтобы дать время на создание слота
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

function handleCreateSlot(dayId: string, mealType: MealType, recipeId: string, notes?: string) {
  emit('createSlot', dayId, mealType, recipeId, notes);
}

// Остальные методы без изменений
function openRenameModal() {
  newTitle.value = props.day.title;
  isRenameModalOpen.value = true;
}

function saveRename() {
  if (newTitle.value.trim() && newTitle.value !== props.day.title) {
    emit('renameDay', props.day.id, newTitle.value.trim());
  }
  isRenameModalOpen.value = false;
}

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function confirmDelete() {
  emit('deleteDay', props.day.id);
  isDeleteModalOpen.value = false;
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
</script>

<style scoped>
.meal-slot-container {
  transition: all 0.2s ease;
  border-radius: 0.75rem;
}

.meal-slot-container:has(.meal-slot.drag-over) {
  background-color: #f0fdf4;
}
</style>
