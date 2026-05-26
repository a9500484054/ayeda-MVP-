<template>
  <ConfirmModal
    :open="open"
    :title="'Отправка на модерацию'"
    :description="`Вы уверены, что хотите отправить рецепт «${recipe?.title}» на модерацию?`"
    confirm-text="Отправить"
    confirm-color="primary"
    :loading="loading"
    @update:open="$emit('update:open', $event)"
    @confirm="$emit('confirm')"
  >
    <template #description>
      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-darkMode-500">
          Вы уверены, что хотите отправить рецепт <strong>{{ recipe?.title }}</strong> на модерацию?
        </p>
        <div class="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <UIcon name="i-lucide-info" class="h-4 w-4 inline mr-1" />
            После отправки рецепт будет проверен модератором. Обычно это занимает до 24 часов.
          </p>
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </p>
      </div>
    </template>
  </ConfirmModal>
</template>

<script setup lang="ts">
import ConfirmModal from '~/shared/ui/confirm-modal/ConfirmModal.vue';


interface Props {
  open: boolean
  recipe: any | null
  loading?: boolean
  error?: string | null
}

defineProps<Props>()

defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()
</script>
