<template>
  <UModal v-model:open="isOpen">
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title || 'Подтверждение удаления' }}
        </h3>
        <Button
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          icon-only
          class="-my-1 rounded-full hover:bg-gray-100 dark:hover:bg-darkMode-100"
          @click="closeModal"
        />
      </div>
    </template>
    <!-- Body -->
    <template #body>
      <div class="">
        <div class="flex items-start gap-3">
          <!-- Иконка предупреждения -->
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>

          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ description || 'Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.' }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          color="neutral"
          variant="ghost"
          size="md"
          @click="closeModal"
        >
          Отмена
        </Button>
        <Button
          color="danger"
          size="md"
          :icon="loading ? undefined : 'i-lucide-trash-2'"
          :loading="loading"
          @click="handleConfirm"
        >
          Удалить
        </Button>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';

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
