<!-- components/recipe/SubmitModerationModal.vue -->
<template>
  <UModal :open="modelValue" @update:open="onClose" :ui="{ content: 'max-w-md w-full' }">
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-3 mb-4">
          <div class="rounded-full bg-blue-100 p-2">
            <UIcon name="i-lucide-send" class="h-5 w-5 text-blue-600" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">Отправка на модерацию</h2>
            <p class="text-sm text-zinc-600 mt-1">
              Вы уверены, что хотите отправить рецепт <strong>{{ recipe?.title }}</strong> на модерацию?
            </p>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-3 mb-4">
          <p class="text-sm text-blue-800">
            После отправки рецепт будет проверен модератором. Обычно это занимает до 24 часов.
          </p>
        </div>

        <div v-if="error" class="bg-red-50 rounded-lg p-3 mb-4">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" @click="onClose" :disabled="isLoading">
            Отмена
          </UButton>
          <UButton
            color="primary"
            :loading="isLoading"
            @click="onConfirm"
            class="bg-blue-600 hover:bg-blue-700"
          >
            Отправить
          </UButton>
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
  error?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const onClose = () => {
  if (!props.isLoading) {
    emit('update:modelValue', false)
  }
}

const onConfirm = () => {
  emit('confirm')
}
</script>
