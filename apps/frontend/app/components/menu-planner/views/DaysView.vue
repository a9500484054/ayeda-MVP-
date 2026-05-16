<!-- apps\frontend\app\components\menu-planner\views\DaysView.vue -->
<template>
  <div class="days-view">
    <!-- Управление днями -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Выбор количества дней -->
        <div class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1">
          <button
            v-for="preset in dayPresets"
            :key="preset.value"
            class="rounded-lg px-3 py-1.5 text-sm transition-all"
            :class="daysCount === preset.value
              ? 'bg-green-600 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'"
            @click="setDaysCount(preset.value)"
          >
            {{ preset.label }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
            :class="{ 'bg-green-600 text-white': !dayPresets.some(p => p.value === daysCount) }"
            @click="openCustomDaysModal"
          >
            Свои
          </button>
        </div>

        <!-- Кнопка добавить день -->
        <button
          v-if="daysCount < 30"
          class="flex items-center gap-1 rounded-xl border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 transition-all hover:border-green-400 hover:text-green-600"
          @click="addDay"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          Добавить день ({{ daysCount }}/30)
        </button>
      </div>

      <!-- Навигация (если дней больше чем помещается) -->
      <div v-if="totalDays > visibleDays" class="flex items-center gap-2">
        <button
          class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          :disabled="scrollIndex === 0"
          @click="scrollPrev"
        >
          <UIcon name="i-lucide-chevron-left" class="h-5 w-5" />
        </button>
        <span class="text-sm text-zinc-500">
          {{ scrollIndex + 1 }} - {{ Math.min(scrollIndex + visibleDays, totalDays) }} / {{ totalDays }}
        </span>
        <button
          class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          :disabled="scrollIndex + visibleDays >= totalDays"
          @click="scrollNext"
        >
          <UIcon name="i-lucide-chevron-right" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Контейнер с горизонтальным скроллом -->
    <div class="days-scroll-container overflow-x-auto pb-4">
      <div class="flex gap-4" :style="{ minWidth: 'fit-content' }">
        <DayColumn
          v-for="day in visibleDaysRange"
          :key="day"
          :day-number="day"
          :breakfast-slot="getSlotByDayAndMeal(day, 'breakfast')"
          :lunch-slot="getSlotByDayAndMeal(day, 'lunch')"
          :dinner-slot="getSlotByDayAndMeal(day, 'dinner')"
          :snack-slot="getSlotByDayAndMeal(day, 'snack')"
          :is-loading="isLoading"
          @add-recipe="handleAddRecipe"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @create-slot="handleCreateSlot"
        />
      </div>
    </div>

    <!-- Модалка для выбора количества дней -->
    <UModal v-model:open="isCustomDaysModalOpen" title="Количество дней">
      <template #body>
        <div class="flex items-center gap-4">
          <UInput
            v-model.number="customDaysCount"
            type="number"
            min="1"
            max="30"
            class="w-24"
            placeholder="дней"
          />
          <span class="text-sm text-gray-500">дней (макс. 30)</span>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isCustomDaysModalOpen = false">
            Отмена
          </UButton>
          <UButton color="primary" @click="applyCustomDays">
            Применить
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Модалка для Drag & Drop переупорядочивания -->
    <UDragDropReorderModal
      v-if="reorderModalOpen"
      :items="reorderItems"
      :is-open="reorderModalOpen"
      title="Порядок дней"
      description="Перетащите дни для изменения порядка"
      @update:is-open="reorderModalOpen = false"
      @reorder="handleReorder"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot, MenuSlotItem } from '~/composables/useMenuPlannerApi';
import DayColumn from '../common/DayColumn.vue';

const props = defineProps<{
  slots: MenuSlot[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [slotId: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createSlot: [data: { dayOrder: number; mealType: string }];
}>();

// Состояние
const daysCount = ref(7);
const scrollIndex = ref(0);
const visibleDays = ref(5); // Количество видимых дней (можно сделать responsive)
const isCustomDaysModalOpen = ref(false);
const customDaysCount = ref(7);
const reorderModalOpen = ref(false);
const reorderItems = ref<{ id: number; title: string }[]>([]);

// Пресеты дней
const dayPresets = [
  { value: 1, label: '1 день' },
  { value: 3, label: '3 дня' },
  { value: 5, label: '5 дней' },
  { value: 7, label: 'Неделя' },
  { value: 14, label: '2 недели' },
  { value: 30, label: 'Месяц' },
];

// Получить уникальные номера дней из слотов
const dayOrders = computed(() => {
  const orders = new Set<number>();
  props.slots.forEach(slot => {
    if (slot.order !== undefined && slot.order !== null) {
      orders.add(slot.order);
    }
  });
  return Array.from(orders).sort((a, b) => a - b);
});

const totalDays = computed(() => {
  if (dayOrders.value.length > 0) {
    return Math.max(daysCount.value, Math.max(...dayOrders.value));
  }
  return daysCount.value;
});

// Видимые дни
const visibleDaysRange = computed(() => {
  const start = scrollIndex.value + 1;
  const end = Math.min(scrollIndex.value + visibleDays.value, totalDays.value);
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

// Получить слот по дню и приему пищи
function getSlotByDayAndMeal(dayOrder: number, mealType: string): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.order === dayOrder && slot.mealType === mealType
  );
}

// Создать слот, если его нет
async function ensureSlotExists(dayOrder: number, mealType: string): Promise<string | null> {
  const existingSlot = getSlotByDayAndMeal(dayOrder, mealType);
  if (existingSlot) {
    return existingSlot.id;
  }

  // Эмитим событие для создания слота
  return new Promise((resolve) => {
    emit('createSlot', { dayOrder, mealType });
    // TODO: Нужно дождаться ответа от родителя
    // Пока возвращаем null
    resolve(null);
  });
}

// Обработчики
function handleAddRecipe(dayOrder: number, mealType: string) {
  const slot = getSlotByDayAndMeal(dayOrder, mealType);
  if (slot) {
    emit('addRecipe', slot.id);
  } else {
    // Сначала создаем слот
    emit('createSlot', { dayOrder, mealType });
    // TODO: После создания слота открыть модалку добавления
  }
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleCreateSlot(data: { dayOrder: number; mealType: string }) {
  emit('createSlot', data);
}

// Управление днями
function setDaysCount(count: number) {
  daysCount.value = count;
  scrollIndex.value = 0;
  // TODO: Создать недостающие дни/слоты
}

function openCustomDaysModal() {
  customDaysCount.value = daysCount.value;
  isCustomDaysModalOpen.value = true;
}

function applyCustomDays() {
  if (customDaysCount.value >= 1 && customDaysCount.value <= 30) {
    setDaysCount(customDaysCount.value);
  }
  isCustomDaysModalOpen.value = false;
}

function addDay() {
  if (daysCount.value < 30) {
    setDaysCount(daysCount.value + 1);
  }
}

// Навигация
function scrollPrev() {
  scrollIndex.value = Math.max(0, scrollIndex.value - visibleDays.value);
}

function scrollNext() {
  scrollIndex.value = Math.min(
    totalDays.value - visibleDays.value,
    scrollIndex.value + visibleDays.value
  );
}

// Reorder (для будущей реализации)
function openReorderModal() {
  reorderItems.value = dayOrders.value.map(order => ({
    id: order,
    title: `День ${order}`,
  }));
  reorderModalOpen.value = true;
}

function handleReorder(items: { id: number; order: number }[]) {
  // TODO: Обновить порядок дней
  console.log('Reorder days:', items);
}

// Адаптивная ширина
function updateVisibleDays() {
  const width = window.innerWidth;
  if (width < 640) {
    visibleDays.value = 1;
  } else if (width < 768) {
    visibleDays.value = 2;
  } else if (width < 1024) {
    visibleDays.value = 3;
  } else if (width < 1280) {
    visibleDays.value = 4;
  } else {
    visibleDays.value = 5;
  }
}

onMounted(() => {
  updateVisibleDays();
  window.addEventListener('resize', updateVisibleDays);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleDays);
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
