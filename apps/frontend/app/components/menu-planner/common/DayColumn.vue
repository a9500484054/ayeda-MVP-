<template>
  <div class="day-column w-[280px] flex-shrink-0 rounded-xl border border-zinc-200 bg-white shadow-sm">
    <!-- Заголовок дня -->
    <div class="border-b border-zinc-100 p-3 text-center">
      <div class="flex items-center justify-center gap-2">
        <h3 class="font-medium text-zinc-800">{{ day.title }}</h3>
        <button
          class="rounded p-0.5 text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-green-600 group-hover:opacity-100"
          @click="openRenameModal"
        >
          <UIcon name="i-lucide-pencil" class="h-3 w-3" />
        </button>
        <button
          v-if="canDelete"
          class="rounded p-0.5 text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100"
          @click="openDeleteModal"
        >
          <UIcon name="i-lucide-trash-2" class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- Слоты приемов пищи -->
    <div class="divide-y divide-zinc-100">
      <div class="p-3">
        <MealSlot
          :slot-id="breakfastSlot?.id"
          :items="breakfastSlot?.items"
          meal-type="breakfast"
          @add-recipe="() => emit('addRecipe', day.id, 'breakfast')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
        />
      </div>

      <div class="p-3">
        <MealSlot
          :slot-id="lunchSlot?.id"
          :items="lunchSlot?.items"
          meal-type="lunch"
          @add-recipe="() => emit('addRecipe', day.id, 'lunch')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
        />
      </div>

      <div class="p-3">
        <MealSlot
          :slot-id="dinnerSlot?.id"
          :items="dinnerSlot?.items"
          meal-type="dinner"
          @add-recipe="() => emit('addRecipe', day.id, 'dinner')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
        />
      </div>

      <div class="p-3">
        <MealSlot
          :slot-id="snackSlot?.id"
          :items="snackSlot?.items"
          meal-type="snack"
          @add-recipe="() => emit('addRecipe', day.id, 'snack')"
          @remove-recipe="handleRemoveRecipe"
          @edit-notes="handleEditNotes"
          @move-recipe="handleMoveRecipe"
          @reorder="handleReorder"
        />
      </div>
    </div>

    <!-- Модалка переименования -->
    <UModal v-model:open="isRenameModalOpen" title="Переименовать день">
      <template #body>
        <UInput v-model="newTitle" placeholder="Название дня" autofocus />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isRenameModalOpen = false">Отмена</UButton>
          <UButton color="primary" @click="saveRename">Сохранить</UButton>
        </div>
      </template>
    </UModal>

    <!-- Модалка подтверждения удаления -->
    <UModal v-model:open="isDeleteModalOpen" title="Удалить день?">
      <template #body>
        <p class="text-sm text-zinc-600">
          Вы уверены, что хотите удалить день "{{ day.title }}"? Все рецепты в этом дне также будут удалены.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isDeleteModalOpen = false">Отмена</UButton>
          <UButton color="red" @click="confirmDelete">Удалить</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MenuDay, MenuSlot, MealType } from '~/composables/useMenuPlannerApi';
import MealSlot from './MealSlot.vue';

const props = defineProps<{
  day: MenuDay;
  breakfastSlot?: MenuSlot;
  lunchSlot?: MenuSlot;
  dinnerSlot?: MenuSlot;
  snackSlot?: MenuSlot;
  isLoading?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [dayId: string, mealType: MealType];
  moveRecipe: [itemId: string, sourceSlotId: string, targetSlotId: string];
  reorder: [slotId: string, items: { id: string; order: number }[]];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  renameDay: [dayId: string, newTitle: string];
  deleteDay: [dayId: string];
}>();

const isRenameModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const newTitle = ref('');

function openRenameModal() {
  newTitle.value = props.day.title;
  isRenameModalOpen.value = true;
}

function saveRename() {
  if (newTitle.value.trim() && newTitle.value !== props.day.title) {
    emit('renameDay', props.day.id, newTitle.value.trim());
  }
  isRenameModalOpen.value = false;
}

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function confirmDelete() {
  emit('deleteDay', props.day.id);
  isDeleteModalOpen.value = false;
}

function handleRemoveRecipe(itemId: string) {
  emit('removeRecipe', itemId);
}

function handleEditNotes(itemId: string, notes: string) {
  emit('editNotes', itemId, notes);
}

function handleMoveRecipe(itemId: string, sourceSlotId: string, targetSlotId: string) {
  emit('moveRecipe', itemId, sourceSlotId, targetSlotId);
}

function handleReorder(slotId: string, items: { id: string; order: number }[]) {
  emit('reorder', slotId, items);
}
</script>

<style scoped>
.day-column {
  transition: all 0.2s ease;
}
.day-column:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
