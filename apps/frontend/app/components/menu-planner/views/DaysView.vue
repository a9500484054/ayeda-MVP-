<template>
  <div class="days-view">
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

      <!-- Навигация -->
      <div v-if="displayedDays.length > visibleDaysPerPage" class="flex items-center gap-2">
        <button
          class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          :disabled="scrollIndex === 0"
          @click="scrollPrev"
        >
          <UIcon name="i-lucide-chevron-left" class="h-5 w-5" />
        </button>
        <span class="text-sm text-zinc-500">
          {{ scrollIndex + 1 }} - {{ Math.min(scrollIndex + visibleDaysPerPage, displayedDays.length) }} / {{ displayedDays.length }}
        </span>
        <button
          class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          :disabled="scrollIndex + visibleDaysPerPage >= displayedDays.length"
          @click="scrollNext"
        >
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Контейнер с днями -->
    <div class="days-scroll-wrapper">
      <div class="days-flex-wrapper">
        <DayColumn
          v-for="day in paginatedDays"
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

const scrollIndex = ref(0);
const visibleDaysPerPage = ref(5);

const displayedDays = computed(() => props.days);

// Отображаем только видимые дни
const paginatedDays = computed(() => {
  const start = scrollIndex.value;
  const end = Math.min(scrollIndex.value + visibleDaysPerPage.value, displayedDays.value.length);
  return displayedDays.value.slice(start, end);
});

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

function scrollPrev() {
  scrollIndex.value = Math.max(0, scrollIndex.value - visibleDaysPerPage.value);
}

function scrollNext() {
  const maxIndex = Math.max(0, displayedDays.value.length - visibleDaysPerPage.value);
  scrollIndex.value = Math.min(maxIndex, scrollIndex.value + visibleDaysPerPage.value);
}

function updateVisibleDaysPerPage() {
  const width = window.innerWidth;
  // Ширина колонки 280px + gap 16px = 296px
  const columnWidth = 296;
  const availableWidth = width - 64; // Отступы по бокам

  const calculatedDays = Math.floor(availableWidth / columnWidth);
  visibleDaysPerPage.value = Math.max(1, Math.min(calculatedDays, 5));
}

onMounted(() => {
  updateVisibleDaysPerPage();
  window.addEventListener('resize', updateVisibleDaysPerPage);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleDaysPerPage);
});
</script>

<style scoped>
.days-view {
  width: 100%;
  overflow-x: hidden;
}

.days-scroll-wrapper {
  width: 100%;
  overflow-x: visible;
}

.days-flex-wrapper {
  display: flex;
  gap: 1rem; /* 16px */
  width: 100%;
  flex-wrap: nowrap;
}

/* Убедимся, что DayColumn не расширяет родителя */
:deep(.day-column) {
  flex-shrink: 0;
  width: 280px;
}
</style>
