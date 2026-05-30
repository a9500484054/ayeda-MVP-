<!-- apps/frontend/app/components/shopping/lists/ListFormModal.vue -->
<template>
  <Modal :open="isOpen" size="md" @update:open="closeModal">
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-darkMode-700">
          {{ isEditing ? 'Редактировать список' : 'Создать новый список' }}
        </h3>
        <Button
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          icon-only
          @click="closeModal"
        />
      </div>

      <!-- Body -->
      <div class="space-y-4">
        <!-- Поле ввода названия -->
        <div class="group">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Название списка
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <UIcon
              name="i-lucide-shopping-basket"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-emerald-500"
            />
            <input
              v-model="title"
              type="text"
              placeholder="Например: Продукты на неделю"
              class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-sm placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500 dark:focus:ring-emerald-900/20"
              autofocus
              @keyup.enter="handleSubmit"
            />
          </div>
        </div>

        <!-- Подсказка -->
        <div class="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
          <div class="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
            <UIcon name="i-lucide-lightbulb" class="h-4 w-4" />
            <span>Совет: Используйте понятные названия для легкого поиска</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-3 pt-2">
        <Button
          v-if="isEditing && listId"
          icon="i-lucide-trash-2"
          color="danger"
          variant="ghost"
          size="md"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Удалить
        </Button>

        <div class="flex flex-1 justify-end gap-2">
          <Button
            color="neutral"
            variant="ghost"
            size="md"
            @click="closeModal"
          >
            Отмена
          </Button>
          <Button
            color="primary"
            size="md"
            :loading="isLoading"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { ShoppingList } from '~/shared/types/shopping.types';
import Button from '~/shared/ui/button/Button.vue';
import Modal from '~/shared/ui/modal/Modal.vue';

const props = defineProps<{
  open: boolean;
  list: ShoppingList | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'submit': [title: string];
  'delete': [id: string];
}>();

const title = ref('');
const isLoading = ref(false);
const isDeleting = ref(false);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const isEditing = computed(() => !!props.list);
const listId = computed(() => props.list?.id);

function closeModal() {
  isOpen.value = false;
  title.value = '';
}

async function handleSubmit() {
  if (!title.value.trim()) return;

  isLoading.value = true;
  try {
    await emit('submit', title.value.trim());
    closeModal();
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete() {
  if (!listId.value) return;

  isDeleting.value = true;
  try {
    await emit('delete', listId.value);
    closeModal();
  } finally {
    isDeleting.value = false;
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
