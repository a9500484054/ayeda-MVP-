<template>
  <UModal v-model:open="isOpen" title="Поделиться списком">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Поделитесь этой ссылкой с друзьями. Они смогут просматривать список, но не редактировать его.
        </p>

        <div class="flex items-center gap-2">
          <UInput
            v-model="shareUrl"
            readonly
            class="flex-1"
            :ui="{ input: 'cursor-text' }"
          />
          <UButton
            variant="ghost"
            @click="copyToClipboard"
          >
            <UIcon name="i-lucide-copy" class="h-4 w-4" />
          </UButton>
        </div>

        <div v-if="list?.shareToken" class="flex justify-end">
          <UButton
            variant="ghost"
            color="red"
            size="sm"
            :loading="isRevoking"
            @click="handleRevoke"
          >
            Отозвать ссылку
          </UButton>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton variant="ghost" @click="closeModal">
          Закрыть
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
  generate: [id: string];
  revoke: [id: string];
}>();

const isRevoking = ref(false);
const toast = useToast();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const shareUrl = computed(() => {
  if (!props.list?.shareToken) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${props.list.shareToken}`;
});

function closeModal() {
  isOpen.value = false;
}

async function copyToClipboard() {
  if (!shareUrl.value) return;
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    toast.add({
      title: 'Скопировано',
      description: 'Ссылка скопирована в буфер обмена',
      color: 'success',
    });
  } catch {
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось скопировать ссылку',
      color: 'error',
    });
  }
}

async function handleRevoke() {
  if (!props.list) return;
  isRevoking.value = true;
  try {
    await emit('revoke', props.list.id);
    toast.add({
      title: 'Успех',
      description: 'Ссылка отозвана',
      color: 'success',
    });
  } finally {
    isRevoking.value = false;
  }
}
</script>
