<template>
  <UModal v-model:open="isOpen">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-zinc-900">Создать список меню</h2>
      <p class="mt-1 text-sm text-zinc-500">
        Создайте новый список для планирования питания
      </p>

      <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
        <!-- Название -->
        <div>
          <label class="mb-1 block text-sm font-medium text-zinc-700">
            Название <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="form.title"
            placeholder="Например: Семейное меню, Диета, Праздник"
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
          <p class="mt-1 text-xs text-zinc-400">
            Можно использовать любой эмодзи
          </p>
        </div>

        <!-- Тип отображения -->
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
              <span class="text-xs text-zinc-400">До 30 дней, без привязки к датам</span>
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
              <span class="text-xs text-zinc-400">Привязка к реальным датам</span>
            </button>
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
            Создать
          </UButton>
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import type { DisplayType } from '~/composables/useMenuPlannerApi';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  created: [];
}>();

const isSubmitting = ref(false);

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
  if (!validate()) return;

  isSubmitting.value = true;

  try {
    const { useMenuPlannerStore } = await import('~/stores/menuPlannerStore');
    const store = useMenuPlannerStore();

    await store.createMenuList({
      title: form.title.trim(),
      icon: form.icon || undefined,
      description: form.description || undefined,
      displayType: form.displayType,
    });

    // Сброс формы
    form.title = '';
    form.icon = '';
    form.description = '';
    form.displayType = 'days';

    emit('created');
    closeModal();
  } catch (error) {
    console.error('Failed to create menu list:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function closeModal() {
  emit('update:open', false);
}

// Сброс формы при открытии
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.title = '';
    form.icon = '';
    form.description = '';
    form.displayType = 'days';
    errors.title = '';
  }
});
</script>
