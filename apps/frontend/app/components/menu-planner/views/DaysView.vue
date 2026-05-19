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

        <!-- Кнопка добавления в список покупок -->
        <Button
          color="white"
          @click="addToShoppingList"
          :disabled="days.length === 0 || isLoading"
          :loading="isAddingToShoppingList"
          class="relative transition-all duration-200 hover:scale-[1.02]"
        >
          <UIcon name="i-lucide-shopping-cart" class="h-3.5 w-3.5" />
          <span>В список покупок</span>

          <!-- Бейдж с количеством рецептов -->
          <span
            v-if="totalRecipesCount > 0 && !isAddingToShoppingList"
            class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-medium text-white"
          >
            {{ totalRecipesCount > 9 ? '9+' : totalRecipesCount }}
          </span>
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

const toast = useToast();
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
  addToShoppingList: [ingredients: Array<{ id: string; name: string; quantity: number; unit: string }>];
}>();

const isAddingToShoppingList = ref(false);

function getSlotByMeal(mealType: MealType, dayId: string): MenuSlot | undefined {
  return props.slots.find(
    slot => slot.dayId === dayId && slot.mealType === mealType && slot.slotType === 'day'
  );
}

// Собираем все ингредиенты из всех рецептов
const allIngredients = computed(() => {
  const ingredientsMap = new Map<string, { id: string; name: string; quantity: number; unit: string }>();

  props.slots.forEach(slot => {
    if (slot.items && slot.items.length > 0) {
      slot.items.forEach(item => {
        if (item.recipe && item.recipe.ingredients) {
          item.recipe.ingredients.forEach((ingredient: any) => {
            const key = `${ingredient.name}_${ingredient.unit || ''}`;

            if (ingredientsMap.has(key)) {
              // Суммируем количество если ингредиент уже есть
              const existing = ingredientsMap.get(key)!;
              existing.quantity += ingredient.quantity || 0;
            } else {
              ingredientsMap.set(key, {
                id: ingredient.id,
                name: ingredient.name,
                quantity: ingredient.quantity || 0,
                unit: ingredient.unit || ''
              });
            }
          });
        }
      });
    }
  });

  return Array.from(ingredientsMap.values());
});

// Подсчет общего количества рецептов
const totalRecipesCount = computed(() => {
  return props.slots.reduce((total, slot) => {
    return total + (slot.items?.length || 0);
  }, 0);
});

// Функция добавления всех ингредиентов в список покупок
async function addToShoppingList() {
  if (props.days.length === 0) {
    toast.add({
      title: 'Нет дней',
      description: 'Добавьте хотя бы один день в меню',
      color: 'warning'
    });
    return;
  }

  if (allIngredients.value.length === 0) {
    toast.add({
      title: 'Нет ингредиентов',
      description: 'В рецептах нет ингредиентов для добавления',
      color: 'warning'
    });
    return;
  }

  isAddingToShoppingList.value = true;

  try {
    // Эмитим событие с массивом ингредиентов
    emit('addToShoppingList', allIngredients.value);

    // Выводим в консоль для проверки
    console.log('Ингредиенты для добавления в список покупок:', allIngredients.value);

    toast.add({
      title: 'Успешно!',
      description: `${allIngredients.value.length} ингредиент${getIngredientEnding(allIngredients.value.length)} добавлен${getIngredientEndingVerb(allIngredients.value.length)} в список покупок`,
      color: 'success'
    });
  } catch (error) {
    console.error('Failed to add to shopping list:', error);
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось добавить ингредиенты в список покупок',
      color: 'error'
    });
  } finally {
    isAddingToShoppingList.value = false;
  }
}

// Вспомогательные функции для правильных окончаний
function getIngredientEnding(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return '';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'а';
  return 'ов';
}

function getIngredientEndingVerb(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'о';
  return 'ы';
}

// Остальные обработчики
function handleAddRecipe(dayId: string, mealType: MealType) {
  emit('addRecipe', dayId, mealType);
}

function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  const targetSlot = props.slots.find(slot => slot.id === targetSlotId);
  if (targetSlot) {
    emit('moveRecipe', itemId, sourceSlotId, targetSlot.dayId!, targetSlot.mealType);
  }
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
  gap: 1rem;
  width: 100%;
}

:deep(.day-column) {
  width: 100%;
  min-width: 0;
}
</style>
