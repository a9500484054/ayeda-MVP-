<!-- apps/frontend/app/components/menu-planner/views/DaysView.vue -->
<template>
  <div class="days-view">
    <!-- Управление днями -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Выбор количества дней (только для UI, не создает слоты) -->
        <div class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1">
          <button
            v-for="preset in dayPresets"
            :key="preset.value"
            class="rounded-lg px-3 py-1.5 text-sm transition-all"
            :class="visibleDaysLimit === preset.value
              ? 'bg-green-600 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'"
            @click="setDaysLimit(preset.value)"
          >
            {{ preset.label }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
            :class="{ 'bg-green-600 text-white': !dayPresets.some(p => p.value === visibleDaysLimit) }"
            @click="openCustomDaysModal"
          >
            Свои
          </button>
        </div>

        <!-- Кнопка добавления нового дня -->
        <button
          v-if="createdDays.length < 30"
          class="flex items-center gap-1 rounded-xl border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-all hover:border-green-400 hover:text-green-600"
          @click="addNewDay"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          Добавить день ({{ createdDays.length }}/30)
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
          v-for="dayNumber in displayedDays"
          :key="dayNumber"
          :day-number="dayNumber"
          :has-day="createdDays.includes(dayNumber)"
          :breakfast-slot="getSlotByDayAndMeal(dayNumber, 'breakfast')"
          :lunch-slot="getSlotByDayAndMeal(dayNumber, 'lunch')"
          :dinner-slot="getSlotByDayAndMeal(dayNumber, 'dinner')"
          :snack-slot="getSlotByDayAndMeal(dayNumber, 'snack')"
          :is-loading="isLoading"
          @add-recipe="handleAddRecipe"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
        />
      </div>
    </div>

    <!-- Модалка для выбора количества дней -->
    <UModal v-model:open="isCustomDaysModalOpen" title="Лимит отображаемых дней">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-zinc-600">
            Выберите, сколько дней показывать на экране. Это не удаляет существующие дни.
          </p>
          <div class="flex items-center gap-4">
            <UInput
              v-model.number="customDaysLimit"
              type="number"
              min="1"
              max="30"
              class="w-24"
              placeholder="дней"
            />
            <span class="text-sm text-gray-500">дней (макс. 30)</span>
          </div>
          <p class="text-xs text-zinc-500">
            Всего создано дней: {{ createdDays.length }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isCustomDaysModalOpen = false">
            Отмена
          </UButton>
          <UButton color="primary" @click="applyCustomDaysLimit">
            Применить
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot } from '~/composables/useMenuPlannerApi';
import DayColumn from '../common/DayColumn.vue';

const props = defineProps<{
  slots: MenuSlot[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [dayOrder: number, mealType: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createDay: [dayOrder: number]; // Создание пустого дня
}>();

// Состояния
const visibleDaysLimit = ref(7);
const scrollIndex = ref(0);
const visibleDaysPerPage = ref(5);
const isCustomDaysModalOpen = ref(false);
const customDaysLimit = ref(7);

// Пресеты дней
const dayPresets = [
  { value: 1, label: '1 день' },
  { value: 3, label: '3 дня' },
  { value: 5, label: '5 дней' },
  { value: 7, label: 'Неделя' },
  { value: 14, label: '2 недели' },
  { value: 30, label: 'Месяц' },
];

// Получаем все созданные дни (из слотов)
const createdDays = computed(() => {
  const daysSet = new Set<number>();
  props.slots.forEach(slot => {
    if (slot.dayOrder !== undefined && slot.dayOrder !== null) {
      daysSet.add(slot.dayOrder);
    }
  });
  return Array.from(daysSet).sort((a, b) => a - b);
});

// Дни для отображения (учитываем лимит)
const displayedDays = computed(() => {
  const maxDay = Math.max(visibleDaysLimit.value, ...createdDays.value, 0);
  const days: number[] = [];

  for (let i = 1; i <= maxDay; i++) {
    days.push(i);
  }

  return days;
});

// Получить слот по дню и приему пищи
function getSlotByDayAndMeal(dayOrder: number, mealType: string): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.dayOrder === dayOrder && slot.mealType === mealType
  );
}

// Создание нового пустого дня
async function addNewDay() {
  if (createdDays.value.length >= 30) return;

  // Находим следующий доступный номер дня
  let nextDay = 1;
  while (createdDays.value.includes(nextDay)) {
    nextDay++;
  }

  // Эмитим событие для создания пустого дня
  emit('createDay', nextDay);

  // Если новый день выходит за лимит, увеличиваем лимит
  if (nextDay > visibleDaysLimit.value) {
    visibleDaysLimit.value = nextDay;
  }
}

function handleAddRecipe(dayOrder: number, mealType: string) {
  emit('addRecipe', dayOrder, mealType);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function setDaysLimit(limit: number) {
  visibleDaysLimit.value = limit;
  scrollIndex.value = 0;
}

function openCustomDaysModal() {
  customDaysLimit.value = visibleDaysLimit.value;
  isCustomDaysModalOpen.value = true;
}

function applyCustomDaysLimit() {
  if (customDaysLimit.value >= 1 && customDaysLimit.value <= 30) {
    setDaysLimit(customDaysLimit.value);
  }
  isCustomDaysModalOpen.value = false;
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
