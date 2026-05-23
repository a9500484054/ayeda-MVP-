<!-- apps\frontend\app\components\shopping\lists\CreateListModal.vue -->
<template>
  <UModal v-model:open="isOpen" title="Создать новый список">
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
          Создать
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  created: [title: string];
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
  if (!title.value.trim()) return;

  isLoading.value = true;
  try {
    await emit('created', title.value.trim());
    closeModal();
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.open, (newVal) => {
  if (!newVal) {
    title.value = '';
  }
});
</script>
