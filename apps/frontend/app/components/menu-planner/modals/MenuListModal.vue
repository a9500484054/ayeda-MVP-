<template>
  <UModal v-model:open="isOpen" :title="isEditing ? 'Редактировать список меню' : 'Создать список меню'">
    <template #body>
      <div class="space-y-4">
        <!-- Название -->
        <UInput
          v-model="form.title"
          placeholder="Название"
          :color="errors.title ? 'error' : 'neutral'"
        />
        <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>

        <!-- Иконка -->
        <UInput
          v-model="form.icon"
          placeholder="Иконка (эмодзи, например 🍕)"
          maxlength="2"
        />

        <!-- Тип отображения -->
        <div class="flex gap-2">
          <button
            v-for="type in displayTypeOptions"
            :key="type.value"
            class="flex-1 rounded-lg border p-2 text-center text-sm transition-all"
            :class="form.displayType === type.value
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'"
            @click="onDisplayTypeChange(type.value)"
          >
            <div class="flex items-center justify-center gap-1">
              <UIcon :name="type.icon" class="h-4 w-4" />
              <span>{{ type.label }}</span>
            </div>
          </button>
        </div>

        <!-- Шаблоны дней (только для создания и только для DAYS) -->
        <div v-if="!isEditing && form.displayType === 'days'" class="space-y-2">
          <label class="text-sm font-medium text-zinc-700">Шаблон дней</label>
          <div class="flex gap-2">
            <button
              v-for="preset in dayPresets"
              :key="preset.days"
              type="button"
              class="flex-1 rounded-lg border p-2 text-center text-sm transition-all"
              :class="selectedPreset === preset.days
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'"
              @click="selectPreset(preset.days)"
            >
              <div class="font-medium">{{ preset.days }}</div>
              <div class="text-xs text-zinc-500">{{ preset.label }}</div>
            </button>
          </div>
          <p class="text-xs text-zinc-500">
            Будет создано {{ selectedPreset }} дней. Дни можно будет добавить или удалить позже.
          </p>
        </div>

        <!-- Предупреждение при смене типа (только для редактирования) -->
        <p
          v-if="isEditing && originalDisplayType !== form.displayType"
          class="flex items-center gap-1 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700"
        >
          <UIcon name="i-lucide-alert-triangle" class="h-3 w-3" />
          Изменение типа отображения может повлиять на существующие рецепты
        </p>

        <!-- Описание -->
        <UTextarea
          v-model="form.description"
          placeholder="Описание (необязательно)"
          :rows="2"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal">Отмена</UButton>
        <UButton :loading="isSubmitting" @click="handleSubmit">
          {{ isEditing ? 'Сохранить' : 'Создать' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { MenuList, DisplayType } from '~/composables/useMenuPlannerApi';

const props = defineProps<{
  open: boolean;
  list?: MenuList | null;
}>();

const emit = defineEmits<{
  'update:open': [boolean];
  'updated': [];
  'created': [MenuList];
}>();

const isSubmitting = ref(false);
const originalDisplayType = ref<DisplayType>('days');
const selectedPreset = ref(7); // по умолчанию 7 дней

const dayPresets = [
  { days: 1, label: '1 день' },
  { days: 3, label: '3 дня' },
  { days: 7, label: 'Неделя' },
  { days: 14, label: '2 недели' },
  { days: 30, label: 'Месяц' },
];

const isEditing = computed(() => !!props.list);

const displayTypeOptions = [
  { value: 'days', label: 'Дни', icon: 'i-lucide-calendar-days' },
  { value: 'calendar', label: 'Календарь', icon: 'i-lucide-calendar' },
  { value: 'banquet', label: 'Банкет', icon: 'i-lucide-utensils' },
];

const form = reactive({
  title: '',
  icon: '',
  description: '',
  displayType: 'days' as DisplayType,
});

const errors = reactive({
  title: '',
});

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

function onDisplayTypeChange(type: DisplayType) {
  form.displayType = type;
}

function selectPreset(days: number) {
  selectedPreset.value = days;
}

const validate = (): boolean => {
  errors.title = '';

  if (!form.title.trim()) {
    errors.title = 'Обязательное поле';
    return false;
  }

  if (form.title.length > 100) {
    errors.title = 'Название не должно превышать 100 символов';
    return false;
  }

  return true;
};

const closeModal = () => {
  isOpen.value = false;
  errors.title = '';

  if (!isEditing.value) {
    form.title = '';
    form.icon = '';
    form.description = '';
    form.displayType = 'days';
    selectedPreset.value = 7;
  }
};

const handleSubmit = async () => {
  if (!validate()) return;

  isSubmitting.value = true;

  try {
    const { useMenuPlannerStore } = await import('~/stores/menuPlannerStore');
    const store = useMenuPlannerStore();

    if (isEditing.value && props.list) {
      await store.updateMenuList(props.list.id, {
        title: form.title.trim(),
        icon: form.icon || undefined,
        description: form.description || undefined,
        displayType: form.displayType,
      });
      emit('updated');
    } else {
      const newList = await store.createMenuList({
        title: form.title.trim(),
        icon: form.icon || undefined,
        displayType: form.displayType,
        presetDays: form.displayType === 'days' ? selectedPreset.value : undefined,
      });
      emit('created', newList);
    }

    closeModal();
  } catch (error) {
    console.error(`Failed to ${isEditing.value ? 'update' : 'create'} menu list:`, error);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.list) {
      form.title = props.list.title;
      form.icon = props.list.icon || '';
      form.description = props.list.description || '';
      form.displayType = props.list.displayType;
      originalDisplayType.value = props.list.displayType;
    } else {
      form.title = '';
      form.icon = '';
      form.description = '';
      form.displayType = 'days';
      selectedPreset.value = 7;
    }
    errors.title = '';
  }
}, { immediate: true });
</script>
