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
    <div class="flex items-center gap-2">
      <div v-if="isDraggable" class="cursor-grab text-zinc-400">
        <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
      </div>

      <div
        class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200 cursor-pointer transition-opacity hover:opacity-80"
        @click.stop="openRecipe"
      >
        <img
          v-if="item.recipe?.photo?.src"
          :src="getImageUrl(item.recipe.photo.src)"
          :alt="item.recipe.title || 'Рецепт'"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full items-center justify-center text-zinc-400">
          <UIcon name="i-lucide-cooking-pot" class="h-5 w-5" />
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h4
            class="truncate text-sm font-medium text-zinc-800 cursor-pointer hover:text-green-600 transition-colors"
            @click.stop="openRecipe"
          >
            {{ item.recipe?.title || 'Рецепт' }}
          </h4>
          <div class="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-zinc-600 cursor-pointer"
              @click.stop="openNotesModal"
              title="Заметки"
            >
              <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-blue-600 cursor-pointer"
              @click.stop="openRecipe"
              title="Открыть рецепт"
            >
              <UIcon name="i-lucide-external-link" class="h-3.5 w-3.5" />
            </button>
            <button
              class="rounded p-1 text-zinc-400 hover:bg-white hover:text-red-500 cursor-pointer"
              @click.stop="emit('remove')"
              title="Удалить"
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

    <!-- Модалка заметок к рецепту -->
    <UModal v-model:open="isNotesModalOpen">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-semibold text-zinc-900">
            Заметки к рецепту
          </h3>
          <Button
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            icon-only
            class="-my-1 rounded-full hover:bg-zinc-100"
            @click="isNotesModalOpen = false"
          />
        </div>
      </template>

      <template #body>
        <div class="">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <UIcon name="i-lucide-file-text" class="h-5 w-5 text-blue-600" />
            </div>

            <div class="flex-1">
              <p class="mb-3 text-sm text-zinc-600">
                Добавьте заметки к рецепту "{{ item.recipe?.title || 'Рецепт' }}"
              </p>
              <UTextarea
                v-model="notesValue"
                placeholder="Например: добавить больше соли, заменить курицу на индейку..."
                :rows="4"
                class="w-full"
                :ui="{
                  base: 'rounded-lg border-zinc-200 focus:border-blue-500 focus:ring-blue-500',
                  placeholder: 'text-zinc-400'
                }"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <Button
            color="neutral"
            variant="ghost"
            size="md"
            @click="isNotesModalOpen = false"
          >
            Отмена
          </Button>
          <Button
            color="primary"
            size="md"
            icon="i-lucide-save"
            @click="saveNotes"
          >
            Сохранить
          </Button>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi';
import Button from '~/shared/ui/button/Button.vue';

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl || 'http://localhost:3001';
const router = useRouter();

const getImageUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return `${apiUrl}${src}`;
  return `${apiUrl}/${src}`;
};

const props = defineProps<{
  item: MenuSlotItem;
  isDraggable?: boolean;
  slotId?: string;
  dragIndex?: number;
}>();

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

function openRecipe() {
  if (props.item.recipe?.id) {
    // Открываем в новой вкладке
    const route = router.resolve(`/recipes/${props.item.recipe.srcPath}`);
    window.open(route.href, '_blank');
  }
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
    notes: props.item.notes,
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: all 0.2s ease;
  -webkit-touch-callout: none;
  -webkit-user-drag: element;
}

.recipe-card * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.recipe-card img {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
  pointer-events: none;
}

.recipe-card:active {
  cursor: grabbing;
}
</style>
