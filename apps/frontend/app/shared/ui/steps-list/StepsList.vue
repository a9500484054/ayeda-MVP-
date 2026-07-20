<template>
  <div class="space-y-3">
    <!-- Заголовок -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <label class="text-sm font-medium" :class="labelClass">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>

    </div>

    <!-- Список шагов -->
    <div class="space-y-4">
      <div
        v-for="(step, index) in localSteps"
        :key="step.id || index"
        class="border-b border-gray-200 pb-4 last:border-0 dark:border-darkMode-300"
        :class="{
          'opacity-50': draggingIndex === index || disabled,
          'bg-gray-50 dark:bg-darkMode-100/50 rounded-lg p-3 sm:p-4': index === draggingIndex
        }"
        :draggable="!disabled"
        @dragstart="onDragStart($event, index)"
        @dragend="onDragEnd"
        @dragover.prevent
        @drop="onDrop($event, index)"
      >
        <!-- Мобильная версия - вертикальная -->
        <div class="flex flex-col sm:hidden gap-3">
          <!-- Drag handle + номер + удалить -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <!-- Drag handle -->
              <div
                v-if="!disabled"
                class="cursor-grab text-gray-300 transition-colors hover:text-gray-400 active:cursor-grabbing dark:text-darkMode-400 touch-manipulation"
                :class="{ 'cursor-grabbing': draggingIndex === index }"
              >
                <UIcon name="i-lucide-grip-vertical" class="h-5 w-5" />
              </div>
              <div v-else class="w-5" />

              <!-- Step number -->
              <span class="text-sm font-medium text-gray-400 dark:text-darkMode-500">
                Шаг {{ index + 1 }}
              </span>
            </div>

            <!-- Удалить на мобильных - иконка -->
            <Button
              v-if="!disabled"
              color="danger"
              variant="ghost"
              icon="i-lucide-trash-2"
              icon-only
              size="sm"
              class="touch-manipulation"
              @click="removeStep(index)"
            />
          </div>

          <!-- Текст шага -->
          <Textarea
            v-model="step.text"
            :placeholder="`Введите описание шага ${index + 1}`"
            :rows="3"
            class="w-full"
            :disabled="disabled"
            @update:model-value="emitUpdate"
          />

          <!-- Изображение (мобильная версия - растянуто на всю ширину) -->
          <div class="w-full">
            <ImageUploader
              v-model="step.image"
              :compact="true"
              compact-size="md"
              compact-text="Фото"
              image-class="w-full h-32 sm:h-40 rounded-lg object-cover"
              :disabled="disabled"
              :loading="imageUploading && activeUploadIndex === index"
              @upload="(file) => handleImageUpload(file, index)"
              @update:model-value="() => emitUpdate()"
              @focus="activeUploadIndex = index"
            />
          </div>
        </div>

        <!-- Десктопная версия - горизонтальная -->
        <div class="hidden sm:flex sm:gap-4">
          <!-- Left side -->
          <div class="flex-1 flex gap-3 items-start">
            <!-- Drag handle -->
            <div
              v-if="!disabled"
              class="flex-shrink-0 cursor-grab pt-1.5 text-gray-300 transition-colors hover:text-gray-400 active:cursor-grabbing dark:text-darkMode-400"
            >
              <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
            </div>
            <div v-else class="flex-shrink-0 w-4" />

            <!-- Step number -->
            <div class="flex-shrink-0 w-6 pt-1.5 text-sm font-medium text-gray-400 dark:text-darkMode-500">
              {{ index + 1 }}.
            </div>

            <!-- Step text -->
            <Textarea
              v-model="step.text"
              :placeholder="`Шаг ${index + 1}`"
              :rows="3"
              class="flex-1"
              :disabled="disabled"
              @update:model-value="emitUpdate"
            />
          </div>

          <!-- Right side: image uploader (compact mode) -->
          <div class="flex-shrink-0">
            <ImageUploader
              v-model="step.image"
              :compact="true"
              compact-size="md"
              compact-text="Фото"
              image-class="h-20 w-20 rounded-lg object-cover"
              :disabled="disabled"
              :loading="imageUploading && activeUploadIndex === index"
              @upload="(file) => handleImageUpload(file, index)"
              @update:model-value="() => emitUpdate()"
              @focus="activeUploadIndex = index"
            />
          </div>

          <!-- Remove button (десктоп) -->
          <div v-if="!disabled" class="flex-shrink-0 pt-1">
            <Button
              color="danger"
              variant="ghost"
              icon="i-lucide-x"
              icon-only
              size="sm"
              @click="removeStep(index)"
            />
          </div>
        </div>

        <!-- Кнопка удалить (только на мобильных, уже есть выше) -->
        <div v-if="!disabled" class="mt-2 flex justify-end sm:hidden">
          <Button
            color="danger"
            variant="ghost"
            size="xs"
            class="w-full"
            @click="removeStep(index)"
          >
            Удалить шаг
          </Button>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="localSteps.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <UIcon name="i-lucide-clipboard-list" class="h-10 w-10 text-gray-300 dark:text-darkMode-400" />
        <p class="mt-2 text-sm text-gray-400">Добавьте шаги приготовления</p>
        <p class="text-xs text-gray-300 dark:text-darkMode-400">Нажмите "Добавить шаг"</p>
      </div>
    </div>

    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>

    <Button
      v-if="!disabled"
      size="sm"
      variant="ghost"
      class="w-full sm:w-auto justify-center"
      @click="addStep"
    >
      + Добавить шаг
    </Button>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Textarea from '../textarea/Textarea.vue'
import Button from '../button/Button.vue'
import ImageUploader from '../image-uploader/ImageUploader.vue'

export interface StepItem {
  id?: string | number
  sort: number
  text: string
  image?: string | null
}

interface Props {
  modelValue: StepItem[]
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  imageUploading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Шаги приготовления',
  hint: '',
  required: false,
  disabled: false,
  imageUploading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: StepItem[]]
  'upload-image': [file: File, index: number]
}>()

const localSteps = ref<StepItem[]>([])
const draggingIndex = ref<number | null>(null)
const activeUploadIndex = ref<number | null>(null)

// Sync with props
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue || !Array.isArray(newValue)) {
      localSteps.value = []
      return
    }

    const stepsWithSort = newValue.map((step, idx) => ({
      ...step,
      sort: step.sort || idx + 1
    }))

    if (JSON.stringify(localSteps.value) !== JSON.stringify(stepsWithSort)) {
      localSteps.value = stepsWithSort
    }
  },
  { immediate: true, deep: true }
)

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

const emitUpdate = () => {
  const stepsWithSort = localSteps.value.map((step, idx) => ({
    ...step,
    sort: idx + 1
  }))
  emit('update:modelValue', stepsWithSort)
}

const addStep = () => {
  if (props.disabled) return

  localSteps.value.push({
    id: Date.now(),
    sort: localSteps.value.length + 1,
    text: '',
    image: null
  })
  emitUpdate()
}

const removeStep = (index: number) => {
  if (props.disabled) return

  localSteps.value.splice(index, 1)
  emitUpdate()
}

const handleImageUpload = (file: File, index: number) => {
  if (props.disabled) return
  activeUploadIndex.value = index
  emit('upload-image', file, index)
}

// Drag and drop
const onDragStart = (event: DragEvent, index: number) => {
  if (props.disabled) return

  draggingIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(index))
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDragEnd = () => {
  draggingIndex.value = null
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  if (props.disabled) return

  event.preventDefault()

  const sourceIndex = draggingIndex.value
  if (sourceIndex === null || sourceIndex === targetIndex) return

  const newSteps = [...localSteps.value]
  const [movedStep] = newSteps.splice(sourceIndex, 1)
  newSteps.splice(targetIndex, 0, movedStep)

  localSteps.value = newSteps
  emitUpdate()
  draggingIndex.value = null
}

// Expose method for parent to reset upload state
const resetUploadState = () => {
  activeUploadIndex.value = null
}

defineExpose({
  resetUploadState
})
</script>

<style scoped>
[draggable="true"] {
  user-select: none;
}

/* Мобильные улучшения */
@media (max-width: 640px) {
  /* Увеличиваем область касания для мобильных */
  button {
    min-height: 44px;
  }

  /* Улучшаем скролл на мобильных */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }

  /* Улучшаем drag на мобильных */
  .touch-manipulation {
    touch-action: manipulation;
  }

  /* Тень для перетаскиваемого элемента */
  .bg-gray-50.dark\:bg-darkMode-100\/50 {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Для iOS - улучшаем инпуты */
input[type="number"] {
  -webkit-appearance: none;
  appearance: none;
}

/* Убираем стрелки у number input на мобильных */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Анимация для drag */
.bg-gray-50 {
  transition: background-color 0.2s ease;
}

/* Улучшаем видимость на мобильных */
@media (max-width: 640px) {
  textarea {
    font-size: 16px !important; /* Предотвращает автоматический зум на iOS */
  }
}
</style>
