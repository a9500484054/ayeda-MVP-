<template>
  <UModal v-model:open="isOpen" :title="title">
    <template #body>
      <p class="text-sm text-zinc-500">
        {{ description }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal">
          Отмена
        </UButton>
        <UButton color="red" :loading="loading" @click="handleConfirm">
          Удалить
        </UButton>
      </div>
    </template>
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

const closeModal = () => {
  isOpen.value = false;
};

const handleConfirm = () => {
  emit('confirm');
};
</script>
