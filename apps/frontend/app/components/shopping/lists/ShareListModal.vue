<template>
  <UModal v-model:open="isOpen">
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Поделиться списком
        </h3>
        <Button
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          icon-only
          class="-my-1"
          @click="closeModal"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>

      {{ list }}
      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ссылка для доступа
          </label>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <UIcon
                name="i-lucide-link"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="shareUrl"
                readonly
                type="text"
                class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 outline-none cursor-text dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700"
              />
            </div>
            <Button
              icon="i-lucide-copy"
              color="primary"
              variant="outline"
              size="md"
              @click="copyToClipboard"
            >
              Копировать
            </Button>
          </div>
        </div>
        <div class="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
          <div class="flex items-start gap-2 text-sm">
            <UIcon name="i-lucide-share-2" class="mt-0.5 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <p class="text-gray-700 dark:text-gray-300">
              Поделитесь этой ссылкой с друзьями. Они смогут просматривать список, но не редактировать его.
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end items-center gap-3 w-full">
        <Button
          v-if="list?.shareToken"
          icon="i-lucide-link-2-off"
          color="danger"
          variant="ghost"
          size="md"
          :loading="isRevoking"
          @click="handleRevoke"
        >
          Отозвать ссылку
        </Button>

        <div class="flex flex-1 justify-end">
          <Button
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="md"
            @click="closeModal"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
import Button from '~/shared/ui/button/Button.vue';

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
