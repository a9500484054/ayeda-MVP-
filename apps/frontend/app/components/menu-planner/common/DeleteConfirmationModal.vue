<template>
  <UModal v-model="isOpen">
    <div class="p-6">
      <div class="flex items-start gap-4">
        <!-- Иконка предупреждения -->
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
          <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-red-600" />
        </div>

        <div class="flex-1">
          <h2 class="text-lg font-semibold text-zinc-900">
            {{ title }}
          </h2>
          <p class="mt-1 text-sm text-zinc-500">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <UButton variant="ghost" @click="closeModal">
          Отмена
        </UButton>
        <UButton color="red" :loading="loading" @click="handleConfirm">
          Удалить
        </UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

function closeModal() {
  isOpen.value = false;
}

function handleConfirm() {
  emit('confirm');
}
</script>
