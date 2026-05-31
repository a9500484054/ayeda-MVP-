<template>
  <div
    class="recipe-card group relative rounded-lg bg-zinc-50 p-2 transition-all hover:bg-zinc-100"
    :class="{ 'cursor-grab active:cursor-grabbing': isDraggable }"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <div class="flex items-center gap-2">
      <!-- Drag handle -->
      <div v-if="isDraggable" class="cursor-grab text-zinc-400">
        <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
      </div>

      <!-- Image -->
      <div
        class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200 cursor-pointer transition-opacity hover:opacity-80"
        @click.stop="openRecipe"
      >
        <img
          v-if="item.recipe.photo?.src"
          :src="getImageUrl(item.recipe.photo.src)"
          :alt="item.recipe?.title || 'Рецепт'"
          class="h-full w-full object-cover"
          @error="handleImageError"
        />
        <div v-else class="flex h-full items-center justify-center text-zinc-400">
          <UIcon name="i-lucide-cooking-pot" class="h-5 w-5" />
        </div>
      </div>

      <!-- Content -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h4 class="truncate text-sm font-medium text-zinc-800">
            {{ item.recipe?.title || 'Рецепт' }}
          </h4>

          <!-- Actions -->
          <div class="flex flex-shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-file-text"
              icon-only
              class="!p-1 !h-6 !w-6 text-zinc-400 hover:text-emerald-600"
              title="Заметки"
              @click.stop="openNotesModal"
            />
            <Button
              variant="ghost"
              color="info"
              size="xs"
              icon="i-lucide-external-link"
              icon-only
              class="!p-1 !h-6 !w-6"
              title="Открыть рецепт"
              @click.stop="openRecipe"
            />
            <div class="relative">
              <Button
                variant="ghost"
                color="danger"
                size="xs"
                icon="i-lucide-x"
                icon-only
                class="!p-1 !h-6 !w-6 text-zinc-400 hover:text-red-500"
                title="Удалить"
                @click.stop="showConfirmPopover = true"
              />

              <!-- Popover подтверждения -->
              <div
                v-if="showConfirmPopover"
                class="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-lg bg-white p-3 shadow-lg border border-zinc-200"
                @click.stop
              >
                <p class="text-sm text-zinc-700 mb-3">Удалить этот элемент?</p>
                <div class="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="xs"
                    @click.stop="showConfirmPopover = false"
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="solid"
                    color="danger"
                    size="xs"
                    @click.stop="handleConfirmRemove"
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes preview -->
        <p v-if="item.notes" class="mt-1 truncate text-xs text-zinc-500">
          <UIcon name="i-lucide-file-text" class="inline h-3 w-3 mr-0.5" />
          {{ item.notes }}
        </p>
      </div>
    </div>

    <!-- Модалка заметок -->
    <PromptModal
      v-model:open="isNotesModalOpen"
      title="Заметки к рецепту"
      :description="`Добавьте заметки к рецепту ${item.recipe?.title || 'Рецепт'}`"
      :initial-value="notesValue"
      placeholder="Например: добавить больше соли, заменить курицу на индейку..."
      confirm-text="Сохранить"
      :validate="validateNotes"
      @confirm="saveNotes"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSlotItem } from '~/composables/useMenuPlannerApi'
import Button from '~/shared/ui/button/Button.vue'
import PromptModal from '~/shared/ui/prompt-modal/PromptModal.vue'

const config = useRuntimeConfig()
const apiUrl = config.public.apiBase || 'http://localhost:3001'
const router = useRouter()

const props = defineProps<{
  item: MenuSlotItem
  isDraggable?: boolean
  slotId?: string
  dragIndex?: number
  maxItems?: number
}>()

const emit = defineEmits<{
  remove: []
  editNotes: [notes: string]
  dragStart: [itemId: string, slotId: string, dragIndex: number]
  dragEnd: []
  dragOver: [event: DragEvent, index: number]
  drop: [event: DragEvent, index: number]
}>()


const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const apiUrl = config.public.apiUrl || 'http://localhost:3001'
  if (path.startsWith('/')) return `${apiUrl}${path}`
  return `${apiUrl}/${path}`
}

const isNotesModalOpen = ref(false)
const notesValue = ref(props.item.notes || '')

const validateNotes = (value: string): boolean | string => {
  if (value.length > 500) return 'Заметки не должны превышать 500 символов'
  return true
}

function openNotesModal() {
  notesValue.value = props.item.notes || ''
  isNotesModalOpen.value = true
}

function saveNotes(notes: string) {
  emit('editNotes', notes)
  isNotesModalOpen.value = false
}

function openRecipe() {
  if (props.item.recipe?.id) {
    const route = router.resolve(`/recipes/${props.item.recipe.srcPath}`)
    window.open(route.href, '_blank')
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    const fallback = document.createElement('div')
    fallback.className = 'flex h-full items-center justify-center text-zinc-400'
    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12 2a10 10 0 0 0-3.16 19.47 10 10 0 0 0 6.32 0A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/><circle cx="12" cy="16" r="1"/></svg>'
    parent.appendChild(fallback)
    img.remove()
  }
}

function handleDragStart(event: DragEvent) {
  if (!props.isDraggable) {
    event.preventDefault()
    return
  }
  if (!event.dataTransfer) return

  const dragData = {
    type: 'slotItem',
    itemId: props.item.id,
    slotId: props.slotId,
    recipeId: props.item.recipeId,
    notes: props.item.notes,
    title: props.item.recipe?.title || 'Рецепт',
    dragIndex: props.dragIndex,
  }

  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'

  const dragIcon = document.createElement('div')
  dragIcon.textContent = '📦'
  dragIcon.style.position = 'absolute'
  dragIcon.style.top = '-1000px'
  document.body.appendChild(dragIcon)
  event.dataTransfer.setDragImage(dragIcon, 0, 0)
  setTimeout(() => document.body.removeChild(dragIcon), 0)

  emit('dragStart', props.item.id, props.slotId!, props.dragIndex!)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  emit('dragOver', event, props.dragIndex!)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  emit('drop', event, props.dragIndex!)
}

function handleDragEnd() {
  emit('dragEnd')
}

const showConfirmPopover = ref(false)

const handleConfirmRemove = () => {
  showConfirmPopover.value = false
  emit('remove')
}

// Закрытие при клике вне
const handleClickOutside = (event: MouseEvent) => {
  if (showConfirmPopover.value) {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showConfirmPopover.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.recipe-card {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: all 0.2s ease;
  -webkit-touch-callout: none;
}

.recipe-card[draggable="true"] {
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
