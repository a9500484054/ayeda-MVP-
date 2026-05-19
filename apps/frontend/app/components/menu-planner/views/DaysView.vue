<template>
  <div>
    <!-- Управление днями -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Кнопка добавления нового дня -->
        <Button
          color="white"
          v-if="days.length < 30"
          @click="addNewDay"
        >
          <UIcon name="i-lucide-plus" class="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
          <span>Добавить день ({{ days.length }}/30)</span>
        </Button>
      </div>
    </div>
    <div class="days-view">
      <!-- Контейнер с днями -->
      <div class="days-grid-wrapper">
        <div class="days-grid">
          <DayColumn
            v-for="day in days"
            :key="day.id"
            :day="day"
            :breakfast-slot="getSlotByMeal('breakfast', day.id)"
            :lunch-slot="getSlotByMeal('lunch', day.id)"
            :dinner-slot="getSlotByMeal('dinner', day.id)"
            :snack-slot="getSlotByMeal('snack', day.id)"
            :is-loading="isLoading"
            :can-delete="days.length > 1"
            @add-recipe="handleAddRecipe"
            @move-recipe="handleMoveRecipe"
            @remove-recipe="handleRemoveRecipe"
            @edit-notes="handleEditNotes"
            @rename-day="handleRenameDay"
            @delete-day="handleDeleteDay"
            @reorder="handleReorder"
            @create-slot="handleCreateSlot"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuDay, MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import DayColumn from '../common/DayColumn.vue';
import Button from '~/shared/ui/button/Button.vue';

const props = defineProps<{
  days: MenuDay[];
  slots: MenuSlot[];
  isLoading?: boolean;
}>();
const toast = useToast()

const emit = defineEmits<{
  addRecipe: [dayId: string, mealType: MealType];
  moveRecipe: [itemId: string, sourceSlotId: string, targetDayId: string, targetMealType: MealType];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createDay: [dayOrder: number, title: string];
  renameDay: [dayId: string, newTitle: string];
  deleteDay: [dayId: string];
  createSlot: [dayId: string, mealType: MealType, recipeId: string, notes?: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
}>();

function getSlotByMeal(mealType: MealType, dayId: string): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
  );
}

function handleAddRecipe(dayId: string, mealType: MealType) {
  emit('addRecipe', dayId, mealType);
}

function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  console.log('DaysView move recipe:', { itemId, sourceSlotId, targetSlotId });
  emit('moveRecipe', itemId, sourceSlotId, targetSlotId);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleRenameDay(dayId: string, newTitle: string) {
  emit('renameDay', dayId, newTitle);
}

function handleDeleteDay(dayId: string) {
  emit('deleteDay', dayId);
}

function handleCreateSlot(dayId: string, mealType: MealType, recipeId: string, notes?: string) {
  emit('createSlot', dayId, mealType, recipeId, notes);
}

function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  emit('reorder', slotId, items);
}

function addNewDay() {
  const existingOrders = props.days.map(d => d.dayOrder);
  const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
  const nextOrder = maxOrder + 1;

  if (nextOrder <= 30) {
    emit('createDay', nextOrder, `День ${nextOrder}`);
  } else {
    toast.add({
      title: 'Лимит дней',
      description: 'Нельзя добавить больше 30 дней',
      color: 'warning',
    });
  }
}
</script>

<style scoped>
.days-view {
  width: 100%;
  overflow-x: auto;
}

.days-grid-wrapper {
  max-width: 60vw;
  width: 100%;
  overflow-x: visible;
}

.days-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 280px;
  gap: 1rem; /* 16px */
  width: 100%;
}

/* Убедимся, что DayColumn не расширяет родителя */
:deep(.day-column) {
  width: 100%;
  min-width: 0; /* Важно для правильной работы с grid */
}
</style>
