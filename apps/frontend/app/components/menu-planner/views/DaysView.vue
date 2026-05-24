<!-- components/menu-planner/views/DaysView.vue -->
<template>
  <div class="days-view-container">
    <!-- Управление днями -->
    <div class="mb-4 flex items-center justify-between">
      <Button
        color="white"
        v-if="days.length < 30"
        @click="addNewDay"
      >
        <UIcon name="i-lucide-plus" class="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
        <span>Добавить день ({{ days.length }}/30)</span>
      </Button>
    </div>

    <div class="days-view">
      <div class="days-grid-wrapper">
        <div class="days-grid">
          <DayColumn
            v-for="day in days"
            :key="day.id"
            :day="day"
            :breakfast-slot="getSlotByDayAndMeal(day.id, 'breakfast')"
            :lunch-slot="getSlotByDayAndMeal(day.id, 'lunch')"
            :dinner-slot="getSlotByDayAndMeal(day.id, 'dinner')"
            :snack-slot="getSlotByDayAndMeal(day.id, 'snack')"
            :can-delete="days.length > 1"
            :column-height="columnHeight"
            @add-recipe="(dayId, mealType, slotId) => emit('addRecipe', dayId, mealType, slotId)"
            @move-recipe="(itemId, sourceSlotId, targetSlotId) => emit('moveRecipe', itemId, sourceSlotId, targetSlotId)"
            @reorder="(slotId, items) => emit('reorder', slotId, items)"
            @remove-recipe="(itemId) => emit('removeRecipe', itemId)"
            @edit-notes="(itemId, notes) => emit('editNotes', itemId, notes)"
            @rename-day="(dayId, newTitle) => emit('renameDay', dayId, newTitle)"
            @delete-day="(dayId) => emit('deleteDay', dayId)"
            @create-slot="(dayId, mealType, recipeId, notes) => emit('createSlot', dayId, mealType, recipeId, notes)"
            @add-to-shopping-list="handleDayAddToShoppingList"
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

const emit = defineEmits<{
  addRecipe: [dayId: string, mealType: MealType, slotId?: string];
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  createDay: [dayOrder: number, title: string];
  renameDay: [dayId: string, newTitle: string];
  deleteDay: [dayId: string];
  createSlot: [dayId: string, mealType: MealType, recipeId: string, notes?: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
  addToShoppingList: [dayId: string]; // Добавляем событие для дня
}>();

const toast = useToast();

// Высота колонки - вычисляем на основе высоты окна
const columnHeight = ref(600);

function updateColumnHeight() {
  // Вычисляем доступную высоту
  const viewportHeight = window.innerHeight;
  const headerHeight = 200; // Примерная высота хедера
  const otherElements = 100; // Отступы и другие элементы
  columnHeight.value = viewportHeight - headerHeight - otherElements;
}

onMounted(() => {
  updateColumnHeight();
  window.addEventListener('resize', updateColumnHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnHeight);
});

function getSlotByDayAndMeal(dayId: string, mealType: MealType): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
  );
}

// Обработчик добавления всех рецептов дня в список покупок
function handleDayAddToShoppingList(dayId: string) {
  // Находим все слоты дня
  const daySlots = props.slots.filter(slot => slot.dayId === dayId && slot.slotType === 'day');

  // Собираем все ингредиенты из всех рецептов дня
  const ingredients: Array<{ id: string; name: string; amount: number; unit: string }> = [];

  daySlots.forEach((slot) => {
    if (slot.items && slot.items.length > 0) {
      slot.items.forEach((item) => {
        if (item.recipe && item.recipe.ingredients) {
          item.recipe.ingredients.forEach((ingredient: any) => {
            let amount = 0;
            if (ingredient.amount) {
              amount = typeof ingredient.amount === 'number'
                ? ingredient.amount
                : parseFloat(ingredient.amount) || 0;
            } else if (ingredient.quantity) {
              amount = typeof ingredient.quantity === 'number'
                ? ingredient.quantity
                : parseFloat(ingredient.quantity) || 0;
            }

            let name = '';
            let unit = '';
            let id = '';

            if (ingredient.name) {
              name = ingredient.name;
            } else if (ingredient.ingredient?.name) {
              name = ingredient.ingredient.name;
            }

            if (ingredient.unit) {
              unit = typeof ingredient.unit === 'string'
                ? ingredient.unit
                : ingredient.unit?.name || 'шт';
            } else if (ingredient.ingredient?.unit?.name) {
              unit = ingredient.ingredient.unit.name;
            } else if (ingredient.ingredient?.unit) {
              unit = typeof ingredient.ingredient.unit === 'string'
                ? ingredient.ingredient.unit
                : ingredient.ingredient.unit?.name || 'шт';
            } else {
              unit = 'шт';
            }

            if (ingredient.id) {
              id = ingredient.id;
            } else if (ingredient.ingredient?.id) {
              id = ingredient.ingredient.id;
            }

            if (name && amount > 0) {
              ingredients.push({ id, name, amount, unit });
            }
          });
        }
      });
    }
  });

  if (ingredients.length === 0) {
    toast.add({
      title: 'Нет ингредиентов',
      description: 'В этом дне нет ингредиентов для добавления',
      color: 'warning',
    });
    return;
  }

  // Эмитим событие с массивом ингредиентов
  emit('addToShoppingList', ingredients);
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
.days-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.days-view {
  flex: 1;
  width: 100%;
  overflow-x: auto;
  min-height: 0; /* Важно для правильной работы flex */
}

.days-grid-wrapper {
  max-width: 60vw;
  width: 100%;
  overflow-x: visible;
}

.days-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 320px; /* Увеличил ширину колонки */
  gap: 1rem;
  height: 100%;
  padding-bottom: 8px;
}

/* Стили для горизонтального скролла */
.days-view::-webkit-scrollbar {
  height: 8px;
}

.days-view::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.days-view::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.days-view::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
