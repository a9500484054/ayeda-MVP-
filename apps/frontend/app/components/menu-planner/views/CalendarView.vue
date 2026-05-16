<template>
  <div class="calendar-view">
    <!-- Навигация по месяцам -->
    <div class="mb-6 flex items-center justify-between">
      <button
        class="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        @click="prevMonth"
      >
        <UIcon name="i-lucide-chevron-left" class="h-5 w-5" />
      </button>

      <div class="text-center">
        <h2 class="text-xl font-semibold text-zinc-800">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
      </div>

      <button
        class="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        @click="nextMonth"
      >
        <UIcon name="i-lucide-chevron-right" class="h-5 w-5" />
      </button>
    </div>

    <!-- Дни недели -->
    <div class="mb-2 grid grid-cols-7 gap-1">
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-2 text-center text-sm font-medium text-zinc-500"
      >
        {{ day }}
      </div>
    </div>

    <!-- Календарная сетка -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="i in startOffset"
        :key="`empty-${i}`"
        class="calendar-day min-h-[100px] rounded-lg bg-zinc-50"
      />

      <CalendarDayCell
        v-for="date in monthDays"
        :key="date.toISOString()"
        :date="date"
        :slots="getSlotsForDate(date)"
        :is-today="isToday(date)"
        :is-loading="isLoading"
        @add-recipe="handleAddRecipe"
        @remove-recipe="handleRemoveRecipe"
        @edit-notes="handleEditNotes"
      />
    </div>

    <div v-if="isLoading" class="mt-4 flex justify-center">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-green-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import CalendarDayCell from '../common/CalendarDayCell.vue';

const props = defineProps<{
  slots: MenuSlot[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [date: Date, mealType: MealType];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
}>();

const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', { month: 'long' });
});

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1);
});

const startOffset = computed(() => {
  let day = firstDayOfMonth.value.getDay();
  day = day === 0 ? 6 : day - 1;
  return day;
});

const monthDays = computed(() => {
  const days: Date[] = [];
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentYear.value, currentMonth.value, i));
  }
  return days;
});

function getSlotsForDate(date: Date): MenuSlot[] {
  const dateStr = date.toISOString().split('T')[0];
  return props.slots.filter(slot => slot.slotDate === dateStr && slot.slotType === 'calendar');
}

function handleAddRecipe(date: Date, mealType: MealType) {
  emit('addRecipe', date, mealType);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

watch([currentYear, currentMonth], () => {
  // Можно перезагрузить данные для нового месяца
  console.log('Month changed');
});
</script>

<style scoped>
.calendar-view {
  min-height: 500px;
}
</style>
