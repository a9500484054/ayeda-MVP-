<!-- apps\frontend\app\components\my-recipe\RecipeCard.vue -->
<template>
  <UFormField required>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Шаги приготовления</h3>
        <UButton size="sm" variant="ghost" @click="addStep">+ Добавить шаг</UButton>
      </div>
      <div
        v-for="(step, index) in steps"
        :key="step.id || index"
        class="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-4 last:pb-0"
        :class="{ 'opacity-50': draggingIndex === index }"
      >
        <div class="flex gap-4">
          <!-- Левая часть: Drag handle + Номер + Описание -->
          <div class="flex-1 flex gap-3 items-start">
            <!-- Drag handle -->
            <div
              class="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-700 hover:text-gray-400 dark:hover:text-gray-500 transition-colors pt-1.5"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragend="onDragEnd"
              @dragover.prevent
              @drop="onDrop($event, index)"
            >
              <UIcon name="i-lucide-grip-vertical" class="w-4 h-4" />
            </div>

            <!-- Номер шага -->
            <div class="flex-shrink-0 w-6 text-sm text-gray-400 dark:text-gray-500 pt-1.5">
              {{ index + 1 }}.
            </div>

            <UTextarea
              v-model="step.text"
              placeholder="Описание шага"
              :rows="4"
              size="sm"
              class="flex-1"
              :ui="{
                base: 'resize-none',
                variant: {
                  outline: 'border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600'
                }
              }"
            />
          </div>

          <!-- Правая часть: Фото -->
          <div class="flex-shrink-0 w-20 flex flex-col items-end gap-2">
            <!-- Превью фото -->
            <div v-if="step.image" class="relative group">
              <img
                :src="`${API_BASE_URL}${step.image}`"
                alt="Фото шага"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <button
                @click="removeStepPhoto(index)"
                class="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <UIcon name="i-lucide-x" class="w-3 h-3 text-gray-500" />
              </button>
            </div>

            <!-- Кнопка загрузки -->
            <UButton
              v-else
              @click="triggerFileInput(index)"
              color="primary"
              variant="outline"
              size="xs"
              :loading="isFileUploading"
              class="w-20 h-20 flex flex-col items-center justify-center gap-1 border-dashed"
            >
              <UIcon name="i-lucide-image-plus" class="w-4 h-4" />
              <span class="text-[10px]">Фото</span>
            </UButton>

            <!-- Кнопка удаления шага -->
            <UButton
              color="primary"
              variant="ghost"
              size="xs"
              @click="removeStep(index)"
              class="text-gray-400"
            >
              Удалить
            </UButton>
          </div>

          <input
            :ref="(el) => setFileInputRef(el, index)"
            type="file"
            accept="image/*"
            class="hidden"
            @change="(e) => handleFileUpload(e, index)"
          />
        </div>
      </div>


      <div v-if="steps.length === 0" class="text-center py-8 text-zinc-400">
        <UIcon name="i-lucide-clipboard-list" class="h-10 w-10 mx-auto mb-2" />
        <p class="text-sm">Добавьте шаги приготовления</p>
      </div>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const API_BASE_URL = 'http://localhost:3001'

interface Props {
  steps: any[]
  isFileUploading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:steps': [value: any[]]
  'upload-step-photo': [event: Event, index: number]
}>()

const stepFileInputs = ref<(HTMLInputElement | null)[]>([])
const draggingIndex = ref<number | null>(null)

// Следим за изменениями steps и обновляем sort
watch(
  () => props.steps,
  (newSteps) => {
    // Обновляем sort для каждого шага на основе его индекса
    let needsUpdate = false
    const updatedSteps = newSteps.map((step, index) => {
      if (step.sort !== index + 1) {
        needsUpdate = true
        return { ...step, sort: index + 1 }
      }
      return step
    })

    if (needsUpdate) {
      emit('update:steps', updatedSteps)
    }
  },
  { deep: true, immediate: true }
)

const setFileInputRef = (el: any, index: number) => {
  if (el) {
    stepFileInputs.value[index] = el as HTMLInputElement
  }
}

const triggerFileInput = (index: number) => {
  stepFileInputs.value[index]?.click()
}

const handleFileUpload = (event: Event, index: number) => {
  emit('upload-step-photo', event, index)
}

const onDragStart = (event: DragEvent, index: number) => {
  draggingIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragEnd = () => {
  draggingIndex.value = null
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()

  const sourceIndex = draggingIndex.value
  if (sourceIndex === null || sourceIndex === targetIndex) return

  const newSteps = [...props.steps]
  const [movedStep] = newSteps.splice(sourceIndex, 1)
  newSteps.splice(targetIndex, 0, movedStep)

  // Обновляем sort для всех шагов
  const stepsWithSort = newSteps.map((step, idx) => ({
    ...step,
    sort: idx + 1
  }))

  // Обновляем массив file inputs
  const newFileInputs = [...stepFileInputs.value]
  const [movedInput] = newFileInputs.splice(sourceIndex, 1)
  newFileInputs.splice(targetIndex, 0, movedInput)
  stepFileInputs.value = newFileInputs

  emit('update:steps', stepsWithSort)
  draggingIndex.value = null
}

const addStep = () => {
  const newSteps = [...props.steps, {
    id: Date.now(),
    sort: props.steps.length + 1,
    text: '',
    image: ''
  }]
  emit('update:steps', newSteps)
  stepFileInputs.value.push(null)
}

const removeStep = (index: number) => {
  const newSteps = [...props.steps]
  newSteps.splice(index, 1)

  // Обновляем sort для оставшихся шагов
  const stepsWithSort = newSteps.map((step, idx) => ({
    ...step,
    sort: idx + 1
  }))

  emit('update:steps', stepsWithSort)
  stepFileInputs.value.splice(index, 1)
}

const removeStepPhoto = (index: number) => {
  const newSteps = [...props.steps]
  newSteps[index].image = ''
  emit('update:steps', newSteps)
}
</script>

<style scoped>
[draggable="true"] {
  user-select: none;
}

/* Визуальный индикатор при перетаскивании */
.drag-over {
  border-top: 2px solid #3b82f6;
}
</style>
