<!-- apps\frontend\app\shared\ui\confirm-modal\ConfirmModal.vue -->
<template>
  <Modal :open="open" @update:open="$emit('update:open', $event)">
    <div class="flex items-center gap-3 mb-4">
      <div class="rounded-full p-2" :class="iconBgClass">
        <UIcon :name="icon" class="h-5 w-5" :class="iconColorClass" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-darkMode-700">
        {{ title }}
      </h3>
    </div>

    <p class="text-gray-600 dark:text-darkMode-500 mb-6">
      {{ description }}
    </p>

    <div class="flex gap-3 justify-end">
      <Button
        color="neutral"
        variant="ghost"
        :disabled="loading"
        @click="handleClose"
      >
        {{ cancelText }}
      </Button>
      <Button
        :color="confirmColor"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </Button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '../modal/Modal.vue'
import Button from '../button/Button.vue'


interface Props {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'danger' | 'success' | 'warning'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  confirmColor: 'primary',
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const iconMap = {
  primary: { bg: 'bg-blue-100', color: 'text-blue-600', icon: 'i-lucide-info' },
  danger: { bg: 'bg-red-100', color: 'text-red-600', icon: 'i-lucide-alert-triangle' },
  success: { bg: 'bg-green-100', color: 'text-green-600', icon: 'i-lucide-check-circle' },
  warning: { bg: 'bg-amber-100', color: 'text-amber-600', icon: 'i-lucide-alert-circle' }
}

const currentIcon = computed(() => iconMap[props.confirmColor] || iconMap.primary)

const iconBgClass = computed(() => currentIcon.value.bg)
const iconColorClass = computed(() => currentIcon.value.color)
const icon = computed(() => currentIcon.value.icon)

const handleClose = () => {
  if (!props.loading) {
    emit('update:open', false)
  }
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
