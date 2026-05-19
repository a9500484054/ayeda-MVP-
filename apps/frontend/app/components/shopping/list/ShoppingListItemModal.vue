<template>
  <UModal v-model:open="isOpen" :title="isEditing ? 'Редактировать продукт' : 'Добавить продукт'">
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Название -->
        <UFormField label="Название" required>
          <UInput
            v-model="form.name"
            placeholder="Например: Помидоры"
            autofocus
          />
        </UFormField>

        <!-- Категория -->
        <UFormField label="Категория">
          <USelect
            v-model="form.categoryId"
            :items="categoryOptions"
            placeholder="Выберите категорию"
            clearable
          />
        </UFormField>

        <!-- Количество и единицы -->
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Количество">
            <UInput
              v-model.number="form.quantity"
              type="number"
              step="0.01"
              placeholder="1"
            />
          </UFormField>

          <UFormField label="Единицы">
            <UInput
              v-model="form.unit"
              placeholder="кг, шт, л..."
            />
          </UFormField>
        </div>

        <!-- Цена -->
        <UFormField label="Цена за единицу">
          <UInput
            v-model.number="form.price"
            type="number"
            step="0.01"
            placeholder="0"
          >
            <template #trailing>
              <span class="text-gray-400">₽</span>
            </template>
          </UInput>
        </UFormField>

        <!-- Расчет итога -->
        <div v-if="form.price && form.quantity" class="text-sm text-gray-500">
          Итого: {{ (form.price * form.quantity).toFixed(2) }} ₽
        </div>

        <!-- Описание -->
        <UFormField label="Описание">
          <UTextarea
            v-model="form.note"
            placeholder="Дополнительная информация..."
            :rows="2"
          />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-between gap-2">
        <UButton
          v-if="isEditing && itemId"
          variant="ghost"
          color="red"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Удалить
        </UButton>

        <div class="flex flex-1 justify-end gap-2">
          <UButton variant="ghost" @click="closeModal">
            Отмена
          </UButton>
          <UButton color="primary" :loading="isLoading" @click="handleSubmit">
            {{ isEditing ? 'Сохранить' : 'Добавить' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ShoppingCategory, ShoppingListItem } from '~/shared/types/shopping.types';

const props = defineProps<{
  open: boolean;
  item: ShoppingListItem | null;
  categories: ShoppingCategory[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [data: {
    name: string;
    categoryId?: string | null;
    quantity: number;
    unit: string;
    price?: number | null;
    note?: string | null;
  }];
  delete: [];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const isEditing = computed(() => !!props.item);

const itemId = computed(() => props.item?.id);

const isLoading = ref(false);
const isDeleting = ref(false);

const form = reactive({
  name: '',
  categoryId: null as string | null,
  quantity: 1,
  unit: 'шт',
  price: null as number | null,
  note: null as string | null,
});

const categoryOptions = computed(() => {
  return props.categories.map(cat => ({
    label: cat.name,
    value: cat.id,
  }));
});

function resetForm() {
  if (props.item) {
    form.name = props.item.name;
    form.categoryId = props.item.category?.id || null;
    form.quantity = props.item.quantity;
    form.unit = props.item.unit;
    form.price = props.item.price;
    form.note = props.item.note;
  } else {
    form.name = '';
    form.categoryId = null;
    form.quantity = 1;
    form.unit = 'шт';
    form.price = null;
    form.note = null;
  }
}

function closeModal() {
  isOpen.value = false;
}

async function handleSubmit() {
  if (!form.name.trim()) return;

  isLoading.value = true;
  try {
    await emit('save', {
      name: form.name.trim(),
      categoryId: form.categoryId,
      quantity: form.quantity,
      unit: form.unit,
      price: form.price,
      note: form.note,
    });
    closeModal();
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete() {
  isDeleting.value = true;
  try {
    await emit('delete');
    closeModal();
  } finally {
    isDeleting.value = false;
  }
}

watch(() => props.open, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>
