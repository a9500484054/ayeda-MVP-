<template>
  <div
    class="recipe-card group relative rounded-lg bg-zinc-50 p-2 transition-all hover:bg-zinc-100"
    :class="{ 'cursor-grab active:cursor-grabbing': isDraggable }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="flex items-start gap-2">
      <div v-if="isDraggable" class="cursor-grab text-zinc-400">
        <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
      </div>

      <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200">
        <img
          v-if="item.recipe?.photo?.src"
          :src="`${apiUrl}${item.recipe.photo.src}`"
          :alt="item.recipe.title || 'Рецепт'"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full items-center justify-center text-zinc-400">
          <UIcon name="i-lucide-cooking-pot" class="h-5 w-5" />
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h4 class="truncate text-sm font-medium text-zinc-800">
            {{ item.recipe?.title || 'Рецепт' }}
          </h4>
          <div class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-zinc-600"
              @click.stop="openNotesModal"
            >
              <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-red-500"
              @click.stop="emit('remove')"
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

    <UModal v-model:open="isNotesModalOpen">
      <template #body>
        <div class="p-4">
          <h3 class="mb-4 text-lg font-medium">Заметки к рецепту</h3>
          <UTextarea
            v-model="notesValue"
            placeholder="Добавьте заметки"
            :rows="4"
          />
          <div class="mt-4 flex justify-end gap-2">
            <UButton variant="ghost" @click="isNotesModalOpen = false">Отмена</UButton>
            <UButton color="primary" @click="saveNotes">Сохранить</UButton>
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
  slotId?: string;
  dragIndex?: number;
}>();
const apiUrl = config.public.apiUrl || 'http://localhost:3001'

const emit = defineEmits<{
  remove: [];
  editNotes: [notes: string];
  dragStart: [itemId: string, slotId: string, dragIndex: number];
  dragEnd: [];
  dragOver: [event: DragEvent, index: number];
  drop: [event: DragEvent, index: number];
}>();

const isNotesModalOpen = ref(false);
const notesValue = ref(props.item.notes || '');

function openNotesModal() {
  notesValue.value = props.item.notes || '';
  isNotesModalOpen.value = true;
}

function saveNotes() {
  emit('editNotes', notesValue.value);
  isNotesModalOpen.value = false;
}

function handleDragStart(event: DragEvent) {
  if (!props.isDraggable) {
    event.preventDefault();
    return;
  }
  if (!event.dataTransfer) return;

  const dragData = {
    type: 'slotItem',
    itemId: props.item.id,
    slotId: props.slotId,
    recipeId: props.item.recipeId,
    title: props.item.recipe?.title || 'Рецепт',
    dragIndex: props.dragIndex,
  };

  event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = 'move';
  emit('dragStart', props.item.id, props.slotId!, props.dragIndex!);
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  emit('dragOver', event, props.dragIndex!);
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  emit('drop', event, props.dragIndex!);
}

function handleDragEnd() {
  emit('dragEnd');
}
</script>

<style scoped>
.recipe-card {
  user-select: none;
  transition: all 0.2s ease;
}
.recipe-card:active {
  cursor: grabbing;
}
</style>
