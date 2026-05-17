<template>
  <div class="days-view">
    <!-- Управление днями -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Кнопка добавления нового дня -->
        <button
          v-if="days.length < 30"
          class="flex items-center gap-1 rounded-xl border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-all hover:border-green-400 hover:text-green-600"
          @click="addNewDay"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          Добавить день ({{ days.length }}/30)
        </button>
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
    <div class="days-scroll-container overflow-x-auto pb-4">
      <div class="flex gap-4" :style="{ minWidth: 'fit-content' }">
        <DayColumn
          v-for="day in displayedDays"
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

}>();

function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  console.log('DaysView move recipe:', { itemId, sourceSlotId, targetSlotId });
  emit('moveRecipe', itemId, sourceSlotId, targetSlotId);
}

function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  emit('reorder', slotId, items);
}

const scrollIndex = ref(0);
const visibleDaysPerPage = ref(5);

const displayedDays = computed(() => props.days);

function getSlotByMeal(mealType: MealType, dayId: string): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
  );
}

function handleAddRecipe(dayId: string, mealType: MealType) {
  emit('addRecipe', dayId, mealType);
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

function addNewDay() {
  // Находим максимальный существующий dayOrder
  const existingOrders = props.days.map(d => d.dayOrder);
  const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;

  // Новый порядковый номер = максимальный + 1
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
  scrollIndex.value = Math.min(
    displayedDays.value.length - visibleDaysPerPage.value,
    scrollIndex.value + visibleDaysPerPage.value
  );
}

function updateVisibleDaysPerPage() {
  const width = window.innerWidth;
  if (width < 640) visibleDaysPerPage.value = 1;
  else if (width < 768) visibleDaysPerPage.value = 2;
  else if (width < 1024) visibleDaysPerPage.value = 3;
  else if (width < 1280) visibleDaysPerPage.value = 4;
  else visibleDaysPerPage.value = 5;
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
.days-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.days-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.days-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.days-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.days-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
