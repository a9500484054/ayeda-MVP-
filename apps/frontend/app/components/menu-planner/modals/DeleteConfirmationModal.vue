<template>
  <ConfirmModal
    :open="open"
    title="Подтверждение удаления"
    :description="description"
    confirm-text="Удалить"
    confirm-color="danger"
    :loading="loading"
    @update:open="$emit('update:open', $event)"
    @confirm="$emit('confirm')"
  />
</template>

<script setup lang="ts">
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue'

defineProps<{
  open: boolean
  description: string
  loading?: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()
</script>
