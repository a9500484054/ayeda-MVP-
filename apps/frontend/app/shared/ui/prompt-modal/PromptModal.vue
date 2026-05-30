<template>
  <Modal
    :open="open"
    :size="size"
    @update:open="handleClose"
  >
    <div class="flex flex-col bg-white dark:bg-darkMode-100 rounded-2xl">
      <!-- Header -->
      <div class="flex  mb-3 items-center justify-between">
        <h2 class="text-xl font-semibold">
          {{ title }}
        </h2>
        <Button
          @click="handleClose"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-x"
          icon-only
          class="hover:bg-white/20"
        />
      </div>

      <!-- Body -->
      <div class="">
        <Input
          v-model="inputValue"
          :placeholder="placeholder"
          :label="label"
          :error="error"
          autofocus
          @keyup.enter="handleConfirm"
        />
      </div>

      <!-- Footer -->
      <div class="dark:border-darkMode-300 bg-white dark:bg-darkMode-100 mt-3">
        <div class="flex justify-end gap-3">
          <Button
            variant="ghost"
            @click="handleClose"
          >
            Отмена
          </Button>
          <Button
            color="primary"
            :disabled="!isValid"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '~/shared/ui/modal/Modal.vue'
import Button from '~/shared/ui/button/Button.vue'
import Input from '~/shared/ui/input/Input.vue'

interface Props {
  open: boolean
  title: string
  label?: string
  placeholder?: string
  initialValue?: string
  confirmText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  validate?: (value: string) => boolean | string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  initialValue: '',
  confirmText: 'Сохранить',
  size: 'md',
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [value: string]
}>()

const inputValue = ref(props.initialValue)
const error = ref('')

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    inputValue.value = props.initialValue
    error.value = ''
  }
})

const isValid = computed(() => {
  if (!inputValue.value.trim()) return false
  if (props.validate) {
    const result = props.validate(inputValue.value)
    if (typeof result === 'string') {
      error.value = result
      return false
    }
    if (result === false) return false
  }
  error.value = ''
  return true
})

const handleClose = () => {
  if (!props.loading) {
    emit('update:open', false)
  }
}

const handleConfirm = () => {
  if (isValid.value && !props.loading) {
    emit('confirm', inputValue.value.trim())
    handleClose()
  }
}
</script>
