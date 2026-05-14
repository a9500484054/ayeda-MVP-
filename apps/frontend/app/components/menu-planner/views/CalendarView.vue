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
      <!-- Пустые ячейки для начала месяца -->
      <div
        v-for="i in startOffset"
        :key="`empty-${i}`"
        class="calendar-day min-h-[100px] rounded-lg bg-zinc-50"
      />

      <!-- Ячейки дней -->
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

    <!-- Модалка для добавления рецепта -->
    <RecipeSearchModal
      :open="isRecipeSearchOpen"
      :slot-id="selectedSlotId"
      @update:open="isRecipeSearchOpen = false"
      @recipe-added="handleRecipeAdded"
    />

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="mt-4 flex justify-center">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-green-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot, MenuSlotItem } from '~/composables/useMenuPlannerApi';
import CalendarDayCell from '../common/CalendarDayCell.vue';
import RecipeSearchModal from '../modals/RecipeSearchModal.vue';

const props = defineProps<{
  slots: MenuSlot[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [slotId: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createSlot: [data: { slotDate: string; mealType: string }];
}>();

// Текущая дата
const currentDate = ref(new Date());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

// Название месяца
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', { month: 'long' });
});

// Дни недели
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Получить первый день месяца
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1);
});

// Смещение для первого дня (0 = воскресенье, поэтому корректируем)
const startOffset = computed(() => {
  let day = firstDayOfMonth.value.getDay();
  // Преобразуем воскресенье (0) в 6, понедельник (1) в 0 и т.д.
  day = day === 0 ? 6 : day - 1;
  return day;
});

// Все дни месяца
const monthDays = computed(() => {
  const days: Date[] = [];
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentYear.value, currentMonth.value, i));
  }
  return days;
});

// Состояние модалки
const isRecipeSearchOpen = ref(false);
const selectedSlotId = ref<string | null>(null);
const selectedDate = ref<Date | null>(null);
const selectedMealType = ref<string>('');

// Получить слоты для конкретной даты
function getSlotsForDate(date: Date): MenuSlot[] {
  const dateStr = date.toISOString().split('T')[0];
  return props.slots.filter(slot => slot.slotDate === dateStr);
}

// Получить или создать слот
async function getOrCreateSlot(date: Date, mealType: string): Promise<string | null> {
  const dateStr = date.toISOString().split('T')[0];
  let slot = props.slots.find(
    s => s.slotDate === dateStr && s.mealType === mealType
  );

  if (slot) {
    return slot.id;
  }

  // Эмитим событие для создания слота
  return new Promise((resolve) => {
    emit('createSlot', { slotDate: dateStr, mealType });
    // TODO: Нужно дождаться ответа от родителя
    resolve(null);
  });
}

// Навигация
function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}

// Проверка, сегодня ли день
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Обработчики
function handleAddRecipe(date: Date, mealType: string) {
  selectedDate.value = date;
  selectedMealType.value = mealType;

  const slot = props.slots.find(
    s => s.slotDate === date.toISOString().split('T')[0] && s.mealType === mealType
  );

  if (slot) {
    selectedSlotId.value = slot.id;
    isRecipeSearchOpen.value = true;
  } else {
    // Сначала создаем слот
    emit('createSlot', {
      slotDate: date.toISOString().split('T')[0],
      mealType,
    });
    // TODO: После создания слота открыть модалку
  }
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleRecipeAdded(recipeId: string) {
  if (selectedSlotId.value) {
    // Рецепт уже добавлен через parent
    console.log('Recipe added:', recipeId);
  }
  isRecipeSearchOpen.value = false;
  selectedSlotId.value = null;
  selectedDate.value = null;
  selectedMealType.value = '';
}

// Обновление при смене месяца (можно перезагрузить данные)
watch([currentYear, currentMonth], () => {
  // TODO: Перезагрузить слоты для нового месяца
  console.log('Month changed, reload slots');
});
</script>

<style scoped>
.calendar-view {
  min-height: 500px;
}
</style>
