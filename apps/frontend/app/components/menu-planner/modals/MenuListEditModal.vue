<template>
  <UModal v-model:open="isOpen">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-zinc-900">Редактировать список</h2>
      <p class="mt-1 text-sm text-zinc-500">
        Измените название, иконку или тип отображения
      </p>

      <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
        <!-- Название -->
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">
            Название <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="form.title"
            placeholder="Название списка"
            :class="{ 'border-red-500': errors.title }"
          />
          <p v-if="errors.title" class="mt-1 text-xs text-red-500">
            {{ errors.title }}
          </p>
        </div>

        <!-- Иконка -->
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">
            Иконка
          </label>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-2xl">
              {{ form.icon || '📋' }}
            </div>
            <UInput
              v-model="form.icon"
              placeholder="Введите эмодзи (например, 🍕, 🥗, 🎉)"
              maxlength="2"
              class="flex-1"
            />
          </div>
        </div>

        <!-- Тип отображения (предупреждение при смене) -->
        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-700">
            Тип отображения
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
              :class="form.displayType === 'days'
                ? 'border-green-400 bg-green-50 ring-2 ring-green-400'
                : 'border-zinc-200 hover:border-zinc-300'"
              @click="form.displayType = 'days'"
            >
              <UIcon name="i-lucide-calendar-days" class="h-6 w-6" :class="form.displayType === 'days' ? 'text-green-600' : 'text-zinc-400'" />
              <span class="font-medium" :class="form.displayType === 'days' ? 'text-green-700' : 'text-zinc-600'">Дни</span>
              <span class="text-xs text-zinc-400">До 30 дней, без дат</span>
            </button>

            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
              :class="form.displayType === 'calendar'
                ? 'border-green-400 bg-green-50 ring-2 ring-green-400'
                : 'border-zinc-200 hover:border-zinc-300'"
              @click="form.displayType = 'calendar'"
            >
              <UIcon name="i-lucide-calendar" class="h-6 w-6" :class="form.displayType === 'calendar' ? 'text-green-600' : 'text-zinc-400'" />
              <span class="font-medium" :class="form.displayType === 'calendar' ? 'text-green-700' : 'text-zinc-600'">Календарь</span>
              <span class="text-xs text-zinc-400">Привязка к датам</span>
            </button>
          </div>

          <div v-if="originalDisplayType !== form.displayType" class="mt-2 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700">
            <UIcon name="i-lucide-alert-triangle" class="mr-1 inline h-3 w-3" />
            Изменение типа отображения может повлиять на существующие рецепты
          </div>
        </div>

        <!-- Описание -->
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">
            Описание (необязательно)
          </label>
          <UTextarea
            v-model="form.description"
            placeholder="Краткое описание списка меню"
            :rows="3"
          />
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton variant="ghost" @click="closeModal">
            Отмена
          </UButton>
          <UButton type="submit" color="primary" :loading="isSubmitting">
            Сохранить
          </UButton>
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { MenuList, DisplayType } from '~/composables/useMenuPlannerApi';

const props = defineProps<{
  open: boolean;
  list: MenuList | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  updated: [];
}>();

const isSubmitting = ref(false);
const originalDisplayType = ref<DisplayType>('days');

const form = reactive({
  title: '',
  icon: '',
  description: '',
  displayType: 'days' as DisplayType,
});

const errors = reactive({
  title: '',
});

function validate(): boolean {
  errors.title = '';

  if (!form.title.trim()) {
    errors.title = 'Название обязательно';
    return false;
  }

  if (form.title.length > 100) {
    errors.title = 'Название не должно превышать 100 символов';
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validate() || !props.list) return;

  isSubmitting.value = true;

  try {
    const { useMenuPlannerStore } = await import('~/stores/menuPlannerStore');
    const store = useMenuPlannerStore();

    await store.updateMenuList(props.list.id, {
      title: form.title.trim(),
      icon: form.icon || undefined,
      description: form.description || undefined,
      displayType: form.displayType,
    });

    emit('updated');
    closeModal();
  } catch (error) {
    console.error('Failed to update menu list:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  emit('update:open', false);
}

// Заполнить форму при открытии
watch(() => props.open, (isOpen) => {
  if (isOpen && props.list) {
    form.title = props.list.title;
    form.icon = props.list.icon || '';
    form.description = props.list.description || '';
    form.displayType = props.list.displayType;
    originalDisplayType.value = props.list.displayType;
    errors.title = '';
  }
});
</script>
