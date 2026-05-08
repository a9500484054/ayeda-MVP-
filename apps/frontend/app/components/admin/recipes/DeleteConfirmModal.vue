<template>
  <UModal :open="modelValue" @update:open="onClose" :ui="{ content: 'max-w-md w-full' }">
    <template #content>
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить рецепт <strong>{{ recipe?.title }}</strong>?</p>
        <p class="text-sm text-muted-foreground mt-2">Это действие нельзя отменить.</p>
        <div class="flex justify-end gap-2 pt-6">
          <UButton color="neutral" variant="ghost" @click="onClose">Отмена</UButton>
          <UButton color="error" :loading="isLoading" @click="onConfirm">Удалить</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  recipe: any | null
  isLoading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const onClose = () => {
  emit('update:modelValue', false)
}

const onConfirm = () => {
  emit('confirm')
}
</script>
