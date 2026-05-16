<!-- apps\frontend\app\components\menu-planner\common\RecipeCardInSlot.vue -->
<template>
  <div
    class="recipe-card group relative rounded-lg bg-zinc-50 p-2 transition-all hover:bg-zinc-100"
    :class="{ 'cursor-grab active:cursor-grabbing': isDraggable }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="flex items-start gap-2">
      <div v-if="isDraggable" class="cursor-grab text-zinc-400">
        <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
      </div>

      <!-- Recipe image placeholder с проверкой -->
      <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200">
        <img
          v-if="item.recipe && item.recipe.photo && item.recipe.photo.src"
          :src="`${apiUrl}${item.recipe.photo.src}`"
          :alt="item.recipe.title || 'Рецепт'"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full items-center justify-center text-zinc-400">
          <UIcon name="i-lucide-cooking-pot" class="h-5 w-5" />
        </div>
      </div>

      <!-- Recipe info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h4 class="truncate text-sm font-medium text-zinc-800">
            {{ item.recipe?.title || 'Рецепт' }}
          </h4>
          <div class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-zinc-600"
              @click="openNotesModal"
            >
              <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-red-500"
              @click="emit('remove')"
            >
              <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p v-if="item.notes" class="mt-1 truncate text-xs text-zinc-500">
          📝 {{ item.notes }}
        </p>
      </div>
    </div>

    <!-- Modal для заметок -->
    <UModal v-model:open="isNotesModalOpen">
      <template #body>
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
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi';
const config = useRuntimeConfig()

const props = defineProps<{
  item: MenuSlotItem;
  isDraggable?: boolean;
}>();

const apiUrl = config.public.apiUrl || 'http://localhost:3001'

const emit = defineEmits<{
  remove: [];
  editNotes: [itemId: string, notes: string];
  dragStart: [itemId: string];
  dragEnd: [];
}>();

const isNotesModalOpen = ref(false);
const notesValue = ref(props.item.notes || '');

function openNotesModal() {
  notesValue.value = props.item.notes || '';
  isNotesModalOpen.value = true;
}

function saveNotes() {
  emit('editNotes', props.item.id, notesValue.value);
  isNotesModalOpen.value = false;
}

function handleDragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', JSON.stringify({
    type: 'recipe',
    recipeId: props.item.recipeId,
  }));
  event.dataTransfer!.effectAllowed = 'copy';
  emit('dragStart', props.item.id);
}

function handleDragEnd() {
  emit('dragEnd');
}
</script>
