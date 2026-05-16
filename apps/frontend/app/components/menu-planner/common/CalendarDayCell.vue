<!-- apps\frontend\app\components\menu-planner\common\CalendarDayCell.vue -->
<template>
  <div
    class="calendar-day-cell min-h-[120px] rounded-lg border p-2 transition-all"
    :class="{
      'border-green-300 bg-green-50': isToday,
      'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm': !isToday,
    }"
  >
    <!-- Дата -->
    <div class="mb-2 flex items-center justify-between">
      <span
        class="text-sm font-medium"
        :class="isToday ? 'text-green-700' : 'text-zinc-600'"
      >
        {{ date.getDate() }}
      </span>
      <button
        class="rounded p-0.5 text-zinc-300 opacity-0 transition-all hover:bg-zinc-100 hover:text-green-600 group-hover:opacity-100"
        :class="{ 'opacity-100': isToday }"
        @click="openAddMenu"
      >
        <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Слоты приемов пищи -->
    <div class="space-y-2">
      <div
        v-for="meal in mealTypes"
        :key="meal.value"
        class="meal-row cursor-pointer rounded p-1 transition-colors hover:bg-zinc-50"
        @click="openAddRecipe(meal.value)"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-500">{{ meal.label }}</span>
          <span v-if="getItemsCount(meal.value) > 0" class="text-zinc-400">
            {{ getItemsCount(meal.value) }}
          </span>
        </div>

        <!-- Первый рецепт (кратко) -->
        <div v-if="firstRecipe(meal.value)" class="mt-0.5 truncate text-xs text-zinc-700">
          {{ firstRecipe(meal.value) }}
        </div>

        <!-- Индикатор дополнительных рецептов -->
        <div v-if="getItemsCount(meal.value) > 1" class="mt-0.5 text-[10px] text-green-600">
          +{{ getItemsCount(meal.value) - 1 }}
        </div>
      </div>
    </div>

    <!-- Модалка для добавления/редактирования -->
    <UModal v-model:open="isDetailModalOpen">
      <div class="max-h-[80vh] w-[500px] overflow-y-auto p-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-medium">
            {{ formatDate(date) }}
          </h3>
          <button class="rounded p-1 hover:bg-zinc-100" @click="isDetailModalOpen = false">
            <UIcon name="i-lucide-x" class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="meal in mealTypes"
            :key="meal.value"
            class="rounded-lg border border-zinc-100 p-3"
          >
            <div class="mb-2 flex items-center justify-between">
              <h4 class="font-medium text-zinc-800">{{ meal.label }}</h4>
              <button
                class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                @click="handleAddToMeal(meal.value)"
              >
                <UIcon name="i-lucide-plus" class="h-3 w-3" />
                Добавить
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="item in getItems(meal.value)"
                :key="item.id"
                class="flex items-center justify-between rounded bg-zinc-50 p-2 text-sm"
              >
                <div class="flex-1 truncate">
                  {{ item.recipe?.title || 'Рецепт' }}
                  <span v-if="item.notes" class="ml-1 text-xs text-zinc-400">
                    📝
                  </span>
                </div>
                <div class="flex gap-1">
                  <button
                    class="rounded p-1 text-zinc-400 hover:bg-white hover:text-zinc-600"
                    @click="editNotes(item)"
                  >
                    <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
                  </button>
                  <button
                    class="rounded p-1 text-zinc-400 hover:bg-white hover:text-red-500"
                    @click="handleRemoveRecipe(item.id)"
                  >
                    <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div v-if="getItemsCount(meal.value) === 0" class="py-4 text-center text-sm text-zinc-400">
                Нет рецептов
              </div>
            </div>
          </div>
        </div>
      </div>
    </UModal>

    <!-- Модалка для заметок -->
    <UModal v-model:open="isNotesModalOpen">
      <div class="p-4">
        <h3 class="mb-4 text-lg font-medium">Заметки к рецепту</h3>
        <UTextarea
          v-model="notesValue"
          placeholder="Добавьте заметки (например, 'заменить на рис', 'без соли')"
          :rows="4"
        />
        <div class="mt-4 flex justify-end gap-2">
          <UButton variant="ghost" @click="isNotesModalOpen = false">
            Отмена
          </UButton>
          <UButton color="primary" @click="saveNotes">
            Сохранить
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Модалка поиска рецептов -->
    <RecipeSearchModal
      :open="isRecipeSearchOpen"
      :slot-id="editingSlotId"
      @update:open="isRecipeSearchOpen = false"
      @recipe-added="handleRecipeAddedToMeal"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuSlot, MenuSlotItem } from '~/composables/useMenuPlannerApi';
import RecipeSearchModal from '../modals/RecipeSearchModal.vue';

const props = defineProps<{
  date: Date;
  slots: MenuSlot[];
  isToday?: boolean;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [date: Date, mealType: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createSlot: [data: { slotDate: string; mealType: string }];
}>();

const mealTypes = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

const isDetailModalOpen = ref(false);
const isNotesModalOpen = ref(false);
const isRecipeSearchOpen = ref(false);
const selectedMealType = ref<string>('');
const editingSlotId = ref<string | null>(null);
const editingItemId = ref<string | null>(null);
const notesValue = ref('');

// Получить слот для конкретного приема пищи
function getSlot(mealType: string): MenuSlot | undefined {
  const dateStr = props.date.toISOString().split('T')[0];
  return props.slots.find(s => s.slotDate === dateStr && s.mealType === mealType);
}

// Получить все рецепты в слоте
function getItems(mealType: string): MenuSlotItem[] {
  const slot = getSlot(mealType);
  if (!slot?.items) return [];
  return [...slot.items].sort((a, b) => a.order - b.order);
}

// Получить количество рецептов
function getItemsCount(mealType: string): number {
  return getItems(mealType).length;
}

// Получить первый рецепт
function firstRecipe(mealType: string): string | null {
  const items = getItems(mealType);
  if (items.length === 0) return null;
  return items[0].recipe?.title || 'Рецепт';
}

// Форматирование даты
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('ru-RU', options);
}

// Открыть модалку для добавления
function openAddMenu() {
  isDetailModalOpen.value = true;
}

function openAddRecipe(mealType: string) {
  const slot = getSlot(mealType);
  if (slot) {
    editingSlotId.value = slot.id;
    isRecipeSearchOpen.value = true;
  } else {
    // Создаем слот
    emit('createSlot', {
      slotDate: props.date.toISOString().split('T')[0],
      mealType,
    });
    // TODO: После создания слота открыть модалку
  }
}

function handleAddToMeal(mealType: string) {
  openAddRecipe(mealType);
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function editNotes(item: MenuSlotItem) {
  editingItemId.value = item.id;
  notesValue.value = item.notes || '';
  isNotesModalOpen.value = true;
}

function saveNotes() {
  if (editingItemId.value) {
    emit('editNotes', editingItemId.value, notesValue.value);
  }
  isNotesModalOpen.value = false;
  editingItemId.value = null;
  notesValue.value = '';
}

function handleRecipeAddedToMeal() {
  isRecipeSearchOpen.value = false;
  editingSlotId.value = null;
}
</script>

<style scoped>
.calendar-day-cell {
  transition: all 0.2s ease;
  min-height: 120px;
}

.group:hover .opacity-0 {
  opacity: 1;
}
</style>
