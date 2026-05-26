<!-- apps\frontend\app\components\my-recipe\DeleteConfirmationModal.vue -->
<template>
  <UModal
    :open="open"
    @update:open="$emit('update:open', $event)"
    :title="`Удалить рецепт «${recipeTitle}»?`"
    description="Это действие нельзя отменить."
  >
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="$emit('update:open', false)"
        >
          Отмена
        </UButton>

        <UButton
          color="red"
          :loading="loading"
          @click="$emit('confirm')"
        >
          Удалить
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  recipeTitle: string
  loading?: boolean
}>()

defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()
</script>
