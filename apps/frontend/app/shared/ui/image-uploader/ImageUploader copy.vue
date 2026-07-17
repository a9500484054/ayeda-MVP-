<template>
  <div class="space-y-3">
    <label v-if="label && !compact" class="mb-1.5 block text-sm font-medium" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Upload area with drag & drop -->
    <div
      class="relative rounded-xl transition-all"
      :class="[containerClass, { 'inline-block': compact }]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <!-- Image preview (compact mode) -->
      <div v-if="modelValue" class="relative group" :class="{ 'inline-block': compact }">
        <img
          :src="imageUrl"
          :alt="label || 'Изображение'"
          class="rounded-xl object-cover"
          :class="[imageClass, { 'cursor-pointer': compact }]"
          @error="handleImageError"
          @click="compact ? triggerFileInput() : undefined"
        />
        <button
          v-if="removable && !disabled"
          type="button"
          class="absolute -top-2 -right-2 rounded-full bg-white p-1 shadow-md transition hover:bg-gray-100 dark:bg-darkMode-100"
          :class="{ 'scale-75': compact }"
          @click="removeImage"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <!-- Upload button (compact mode) -->
      <button
        v-else-if="compact"
        type="button"
        class="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition"
        :class="compactClassComputed"
        :disabled="disabled || loading"
        @click="triggerFileInput"
      >
        <Loader v-if="loading" :size="compact ? 'sm' : 'md'" color="primary" />
        <template v-else>
          <UIcon :name="icon" class="h-6 w-6" :class="iconClass" />
          <span v-if="compactText" class="text-[10px]" :class="textClass">{{ compactText }}</span>
        </template>
      </button>

      <!-- Upload button (full mode) -->
      <button
        v-else-if="!compact"
        type="button"
        class="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition"
        :class="uploadClassComputed"
        :disabled="disabled || loading"
        @click="triggerFileInput"
      >
        <Loader v-if="loading" size="md" color="primary" />
        <template v-else>
          <UIcon :name="icon" class="h-8 w-8" :class="iconClass" />
          <div class="text-sm" :class="textClass">
            <span class="font-medium" :class="accentClass">Нажмите для загрузки</span> или перетащите
          </div>
          <p class="text-xs" :class="hintClass">{{ hint }}</p>
        </template>
      </button>

      <!-- Drag overlay - только для full режима -->
      <div
        v-if="!compact && isDragOver && !disabled && !loading && !modelValue"
        class="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-500/10 backdrop-blur-sm border-2 border-emerald-500 border-dashed"
      >
        <div class="text-center">
          <UIcon name="i-lucide-cloud-upload" class="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <p class="text-sm font-medium text-emerald-600">Отпустите файл для загрузки</p>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileUpload"
    />

    <p v-if="error && !compact" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Loader from '../loader/Loader.vue'

interface Props {
  modelValue: { id: string; src: string } | string | null
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  removable?: boolean
  loading?: boolean
  imageClass?: string
  icon?: string
  // Compact mode
  compact?: boolean
  compactText?: string
  compactSize?: 'sm' | 'md' | 'lg'
  // Custom classes
  uploadClass?: string
  containerClass?: string
  iconClass?: string
  textClass?: string
  hintClass?: string
  accentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: 'PNG, JPG до 5MB',
  removable: true,
  loading: false,
  disabled: false,
  imageClass: 'h-40 w-full',
  icon: 'i-lucide-image-plus',
  containerClass: '',
  uploadClass: '',
  iconClass: 'text-gray-400',
  textClass: 'text-gray-500',
  hintClass: 'text-gray-400',
  accentClass: 'text-emerald-600',
  // Compact defaults
  compact: false,
  compactText: 'Фото',
  compactSize: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: { id: string; src: string } | null]
  'upload': [file: File]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

const config = useRuntimeConfig()


const API_BASE_URL = config.public.apiUrl || 'http://localhost:3001'
const imageUrl = computed(() => {
  if (!props.modelValue) return ''

  if (typeof props.modelValue === 'string') {
    return props.modelValue.startsWith('http')
      ? props.modelValue
      : `${API_BASE_URL}${props.modelValue}`
  }

  const src = props.modelValue.src
  return src.startsWith('http') ? src : `${API_BASE_URL}${src}`
})

const labelClass = computed(() => {
  return props.error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-700 dark:text-gray-300'
})

const compactSizeMap = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-28 w-28'
}

const compactClassComputed = computed(() => {
  const sizeClass = compactSizeMap[props.compactSize]

  if (props.uploadClass) return `${sizeClass} ${props.uploadClass}`
  if (props.disabled) return `${sizeClass} cursor-not-allowed bg-gray-100 border-gray-300`
  if (props.loading) return `${sizeClass} cursor-wait border-gray-300`
  if (isDragOver.value) return `${sizeClass} cursor-grab border-emerald-500 bg-emerald-50`
  return `${sizeClass} cursor-pointer border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 dark:border-darkMode-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10`
})

const uploadClassComputed = computed(() => {
  if (props.uploadClass) return props.uploadClass

  if (props.disabled) return 'h-40 cursor-not-allowed bg-gray-100 border-gray-300'
  if (props.loading) return 'h-40 cursor-wait border-gray-300'
  if (isDragOver.value) return 'h-40 cursor-grab border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
  return 'h-40 cursor-pointer border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/10'
})

const triggerFileInput = () => {
  if (!props.disabled && !props.loading) {
    fileInput.value?.click()
  }
}

const validateFile = (file: File): boolean => {
  if (!file.type.startsWith('image/')) {
    console.warn('Invalid file type:', file.type)
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    console.warn('File too large:', file.size)
    return false
  }
  return true
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && validateFile(file)) {
    emit('upload', file)
  }
  target.value = ''
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled && !props.loading && !props.modelValue) {
    isDragOver.value = true
  }
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!target.contains(relatedTarget)) {
    isDragOver.value = false
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (props.disabled || props.loading || props.modelValue) return

  const files = event.dataTransfer?.files
  if (files?.length) {
    const file = files[0]
    if (validateFile(file)) {
      emit('upload', file)
    }
  }
}

const removeImage = () => {
  if (!props.disabled) {
    emit('update:modelValue', null)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://placehold.co/400x300?text=No+Image'
}
</script>
