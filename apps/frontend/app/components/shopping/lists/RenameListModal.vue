<!-- apps\frontend\app\components\shopping\lists\RenameListModal.vue -->
<template>
  <UModal v-model:open="isOpen" title="Переименовать список">
    <template #body>
      <UInput
        v-model="title"
        placeholder="Название списка"
        autofocus
        :disabled="isLoading"
        @keyup.enter="handleSubmit"
      />
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal" :disabled="isLoading">
          Отмена
        </UButton>
        <UButton color="primary" :loading="isLoading" @click="handleSubmit">
          Сохранить
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';

const props = defineProps<{
  open: boolean;
  list: ShoppingList | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  renamed: [id: string, title: string];
}>();

const title = ref('');
const isLoading = ref(false);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

function closeModal() {
  isOpen.value = false;
  title.value = '';
}

async function handleSubmit() {
  if (!title.value.trim() || !props.list) return;

  isLoading.value = true;
  try {
    await emit('renamed', props.list.id, title.value.trim());
    closeModal();
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.open, (newVal) => {
  if (newVal && props.list) {
    title.value = props.list.title;
  } else {
    title.value = '';
  }
});
</script>
