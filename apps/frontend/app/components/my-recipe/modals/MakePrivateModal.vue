<template>
  <ConfirmModal
    :open="open"
    :title="'Сделать приватным'"
    :description="`Вы уверены, что хотите сделать рецепт «${recipe?.title}» приватным?`"
    confirm-text="Сделать приватным"
    confirm-color="warning"
    :loading="loading"
    @update:open="$emit('update:open', $event)"
    @confirm="$emit('confirm')"
  >
    <template #description>
      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-darkMode-500">
          Вы уверены, что хотите сделать рецепт <strong>{{ recipe?.title }}</strong> приватным?
        </p>
        <div class="bg-amber-50 rounded-lg p-3 dark:bg-amber-900/20">
          <p class="text-sm text-amber-800 dark:text-amber-300">
            <UIcon name="i-lucide-lock" class="h-4 w-4 inline mr-1" />
            Приватный рецепт будет виден только вам. Вы всегда сможете отправить его на модерацию позже.
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
