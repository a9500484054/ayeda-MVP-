<template>
  <div class="day-column w-[280px] flex-shrink-0 rounded-xl border border-zinc-200 bg-white shadow-sm">
    <!-- Заголовок дня -->
    <div class="border-b border-zinc-100 p-3 text-center">
      <h3 class="font-medium text-zinc-800">День {{ dayNumber }}</h3>
      <p v-if="date" class="mt-0.5 text-xs text-zinc-400">
        {{ formatDate(date) }}
      </p>
    </div>

    <!-- Слоты приемов пищи -->
    <div class="divide-y divide-zinc-100">
      <!-- Завтрак -->
      <div class="p-3">
        <MealSlot
          :slot-id="breakfastSlot?.id"
          :items="breakfastSlot?.items"
          meal-type="breakfast"
          :is-drag-over="dragOverMeal === 'breakfast'"
          @add-recipe="() => emit('addRecipe', dayNumber, 'breakfast')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @drag-start="() => {}"
          @drag-over="dragOverMeal = 'breakfast'"
          @drag-leave="dragOverMeal = null"
          @drop="(recipeId) => handleDrop(recipeId, 'breakfast')"
        />
      </div>

      <!-- Обед -->
      <div class="p-3">
        <MealSlot
          :slot-id="lunchSlot?.id"
          :items="lunchSlot?.items"
          meal-type="lunch"
          :is-drag-over="dragOverMeal === 'lunch'"
          @add-recipe="() => emit('addRecipe', dayNumber, 'lunch')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @drag-start="() => {}"
          @drag-over="dragOverMeal = 'lunch'"
          @drag-leave="dragOverMeal = null"
          @drop="(recipeId) => handleDrop(recipeId, 'lunch')"
        />
      </div>

      <!-- Ужин -->
      <div class="p-3">
        <MealSlot
          :slot-id="dinnerSlot?.id"
          :items="dinnerSlot?.items"
          meal-type="dinner"
          :is-drag-over="dragOverMeal === 'dinner'"
          @add-recipe="() => emit('addRecipe', dayNumber, 'dinner')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @drag-start="() => {}"
          @drag-over="dragOverMeal = 'dinner'"
          @drag-leave="dragOverMeal = null"
          @drop="(recipeId) => handleDrop(recipeId, 'dinner')"
        />
      </div>

      <!-- Перекус -->
      <div class="p-3">
        <MealSlot
          :slot-id="snackSlot?.id"
          :items="snackSlot?.items"
          meal-type="snack"
          :is-drag-over="dragOverMeal === 'snack'"
          @add-recipe="() => emit('addRecipe', dayNumber, 'snack')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @drag-start="() => {}"
          @drag-over="dragOverMeal = 'snack'"
          @drag-leave="dragOverMeal = null"
          @drop="(recipeId) => handleDrop(recipeId, 'snack')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot } from '~/composables/useMenuPlannerApi';
import MealSlot from './MealSlot.vue';

const props = defineProps<{
  dayNumber: number;
  date?: Date;
  breakfastSlot?: MenuSlot;
  lunchSlot?: MenuSlot;
  dinnerSlot?: MenuSlot;
  snackSlot?: MenuSlot;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [dayNumber: number, mealType: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createSlot: [data: { dayOrder: number; mealType: string }];
}>();

const dragOverMeal = ref<string | null>(null);

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('ru-RU', options);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleDrop(recipeId: string, mealType: string) {
  console.log(`Drop recipe ${recipeId} to day ${props.dayNumber}, meal ${mealType}`);
  // TODO: Добавить рецепт в слот
  dragOverMeal.value = null;
}
</script>

<style scoped>
.day-column {
  transition: all 0.2s ease;
}

.day-column:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
