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

      <!-- Кнопка добавления в список покупок -->
      <Button
        color="white"
        @click="openPreviewModal"
        :disabled="days.length === 0 || isLoading"
        :loading="isAddingToShoppingList"
        class="relative transition-all duration-200 hover:scale-[1.02]"
      >
        <UIcon name="i-lucide-shopping-cart" class="h-3.5 w-3.5" />
        <span>Добавить меню в список покупок</span>

        <!-- Бейдж с количеством рецептов -->
        <!-- <span
          v-if="totalRecipesCount > 0 && !isAddingToShoppingList"
          class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-medium text-white"
        >
          {{ totalRecipesCount > 9 ? '9+' : totalRecipesCount }}
        </span> -->
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

    <!-- Модальное окно предпросмотра -->
    <ShoppingListPreviewModal
      v-model:open="showPreviewModal"
      :ingredients="collectedIngredients"
      @confirm="handleCreateShoppingList"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuDay, MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import DayColumn from '../common/DayColumn.vue';
import Button from '~/shared/ui/button/Button.vue';
import ShoppingListPreviewModal from '../modals/ShoppingListPreviewModal.vue';

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
  addToShoppingList: [ingredients: Array<{ id: string; name: string; amount: number; unit: string }>];
}>();

const toast = useToast();

// Состояние для модалки предпросмотра
const showPreviewModal = ref(false);
const isAddingToShoppingList = ref(false);
const collectedIngredients = ref<Array<{ id: string; name: string; amount: number; unit: string }>>([]);

// Высота колонки - вычисляем на основе высоты окна
const columnHeight = ref(600);

function updateColumnHeight() {
  const viewportHeight = window.innerHeight;
  const headerHeight = 200;
  const otherElements = 100;
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

// Подсчет общего количества рецептов
const totalRecipesCount = computed(() => {
  return props.slots.reduce((total, slot) => {
    return total + (slot.items?.length || 0);
  }, 0);
});

// Собираем все ингредиенты из всех рецептов
const allIngredients = computed(() => {
  const ingredients: Array<{ id: string; name: string; amount: number; unit: string }> = [];

  props.slots.forEach((slot) => {
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

            if (ingredient.short) {
              name = ingredient.name;
            } else if (ingredient.ingredient?.name) {
              name = ingredient.ingredient.name;
            }

            if (ingredient.unit) {
              unit = typeof ingredient.unit === 'string'
                ? ingredient.unit
                : ingredient.unit?.short || 'шт';
            } else if (ingredient.ingredient?.unit?.short) {
              unit = ingredient.ingredient.unit.short;
            } else if (ingredient.ingredient?.unit) {
              unit = typeof ingredient.ingredient.unit === 'string'
                ? ingredient.ingredient.unit
                : ingredient.ingredient.unit?.short || 'шт';
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

  return ingredients;
});

// Открытие модалки предпросмотра
function openPreviewModal() {
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

  collectedIngredients.value = allIngredients.value;
  showPreviewModal.value = true;
}

// Создание списка покупок после подтверждения
async function handleCreateShoppingList(ingredients: Array<{ id: string; name: string; amount: number; unit: string }>) {
  isAddingToShoppingList.value = true;

  try {
    emit('addToShoppingList', ingredients);

    toast.add({
      title: 'Успешно!',
      description: `${ingredients.length} ингредиент${getIngredientEnding(ingredients.length)} добавлен${getIngredientEndingVerb(ingredients.length)} в список покупок`,
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

// Вспомогательные функции
function getIngredientEnding(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return '';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'а';
  return 'ов';
}

function getIngredientEndingVerb(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'о';
  return 'ы';
}

// Обработчик добавления всех рецептов дня в список покупок
function handleDayAddToShoppingList(dayId: string) {
  const daySlots = props.slots.filter(slot => slot.dayId === dayId && slot.slotType === 'day');
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
  min-height: 0;
}

.days-grid-wrapper {
  max-width: 60vw;
  width: 100%;
  overflow-x: visible;
}

.days-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 320px;
  gap: 1rem;
  height: 100%;
  padding-bottom: 8px;
}

.days-view::-webkit-scrollbar {
  height: 4px;
}

.days-view::-webkit-scrollbar-track {
  background: transparent;
}

.days-view::-webkit-scrollbar-thumb {
  background: #cbd5e100;
  border-radius: 1px;
}

.days-view::-webkit-scrollbar-thumb:hover {
  background: #94a3b839;
}

/* Для Firefox */
.days-view {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e118 transparent;
}
</style>
