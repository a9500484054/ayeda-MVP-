<template>
  <div class="banquet-view">
    <!-- Заголовок банкета -->
    <div class="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-amber-800">Банкетное меню</h2>
          <p class="mt-1 text-sm text-amber-600">
            Добавляйте блюда в порядке подачи. Перетаскивайте для изменения порядка.
          </p>
        </div>
        <button
          class="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white transition-all hover:bg-amber-700"
          @click="handleAddRecipe"
        >
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
          Добавить блюдо
        </button>
      </div>
    </div>

    <!-- Список блюд -->
    <div class="banquet-items space-y-2">
      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="banquet-item group flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3 transition-all hover:shadow-sm"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd"
      >
        <!-- Drag handle -->
        <div class="cursor-grab text-zinc-400 active:cursor-grabbing">
          <UIcon name="i-lucide-grip-vertical" class="h-5 w-5" />
        </div>

        <!-- Порядок -->
        <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700">
          {{ item.order + 1 }}
        </div>

        <!-- Изображение -->
        <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          <img
            v-if="item.recipe?.photo?.src"
            :src="item.recipe.photo.src"
            :alt="item.recipe?.title"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full items-center justify-center">
            <UIcon name="i-lucide-cooking-pot" class="h-5 w-5 text-zinc-400" />
          </div>
        </div>

        <!-- Информация -->
        <div class="min-w-0 flex-1">
          <h4 class="font-medium text-zinc-800">
            {{ item.recipe?.title || 'Рецепт' }}
          </h4>
          <div class="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-clock" class="h-3 w-3" />
              {{ item.recipe?.cookingTime || 0 }} мин
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-users" class="h-3 w-3" />
              {{ item.recipe?.servings || 1 }} порц.
            </span>
          </div>
          <p v-if="item.notes" class="mt-1 truncate text-xs text-amber-600">
            📝 {{ item.notes }}
          </p>
        </div>

        <!-- Действия -->
        <div class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="rounded p-1 text-zinc-400 hover:bg-white hover:text-zinc-600"
            @click="editNotes(item)"
          >
            <UIcon name="i-lucide-file-text" class="h-4 w-4" />
          </button>
          <button
            class="rounded p-1 text-zinc-400 hover:bg-white hover:text-red-500"
            @click="handleRemoveRecipe(item.id)"
          >
            <UIcon name="i-lucide-x" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="sortedItems.length === 0 && !isLoading" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 py-16">
        <UIcon name="i-lucide-utensils" class="h-12 w-12 text-amber-300" />
        <p class="mt-3 text-amber-500">Банкетное меню пусто</p>
        <p class="text-sm text-amber-400">Добавьте первые блюда</p>
      </div>
    </div>

    <!-- Модалка заметок -->
    <UModal v-model:open="isNotesModalOpen">
      <div class="p-4">
        <h3 class="mb-4 text-lg font-medium">Заметки к блюду</h3>
        <UTextarea
          v-model="notesValue"
          placeholder="Добавьте заметки (например, 'без орехов', 'острое')"
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
      :slot-id="null"
      @update:open="isRecipeSearchOpen = false"
      @recipe-added="handleRecipeAdded"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi';
import RecipeSearchModal from '../modals/RecipeSearchModal.vue';

const props = defineProps<{
  items: MenuSlotItem[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  addRecipe: [recipeId: string, notes?: string];
  removeRecipe: [itemId: string];
  editNotes: [itemId: string, notes: string];
  reorder: [items: { id: string; order: number }[]];
}>();

const isNotesModalOpen = ref(false);
const isRecipeSearchOpen = ref(false);
const editingItemId = ref<string | null>(null);
const notesValue = ref('');
const dragItemId = ref<string | null>(null);

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => a.order - b.order);
});

function handleAddRecipe() {
  isRecipeSearchOpen.value = true;
}

function handleRecipeAdded(recipeId: string) {
  emit('addRecipe', recipeId);
  isRecipeSearchOpen.value = false;
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

function handleDragStart(event: DragEvent, item: MenuSlotItem) {
  dragItemId.value = item.id;
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    type: 'banquetItem',
    itemId: item.id,
  }));
  event.dataTransfer!.effectAllowed = 'move';
}

function handleDragEnd() {
  dragItemId.value = null;
}

// Drop zone для переупорядочивания (нужно добавить в template)
// Для полной реализации нужны drop зоны между элементами
</script>

<style scoped>
.banquet-item {
  transition: all 0.2s ease;
}

.banquet-item:hover {
  transform: translateX(4px);
}
</style>
