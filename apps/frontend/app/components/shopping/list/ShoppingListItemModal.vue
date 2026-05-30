<!-- apps\frontend\app\components\shopping\list\ShoppingListItemModal.vue -->
<template>
  <Modal :open="isOpen" size="md" @update:open="closeModal">
    <div class="space-y-5">
      <!-- Заголовок -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-darkMode-700">
        {{ isEditing ? 'Редактировать продукт' : 'Добавить продукт' }}
      </h3>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Название с анимацией -->
        <div class="group">
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Название
            <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <UIcon
              name="i-lucide-package"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-emerald-500"
            />
            <input
              v-model="form.name"
              type="text"
              placeholder="Например: Помидоры"
              class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-sm placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500 dark:focus:ring-emerald-900/20"
              autofocus
            />
          </div>
        </div>

        <!-- Категория -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Категория
          </label>
          <Select
            v-model="form.categoryId"
            :options="categoryOptions"
            placeholder="Выберите категорию"
            :searchable="false"
            class="w-full"
          />
        </div>

        <!-- Количество и единицы -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Количество
            </label>
            <div class="relative">
              <UIcon
                name="i-lucide-hash"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <input
                :value="form.quantity"
                type="number"
                step="1"
                min="1"
                placeholder="1"
                class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-emerald-900/20"
                @input="handleQuantityInput"
                @blur="validateQuantity"
              />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Единицы
            </label>
            <div class="relative">
              <UIcon
                name="i-lucide-ruler"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="form.unit"
                type="text"
                placeholder="кг, шт, л..."
                class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-emerald-900/20"
              />
            </div>
          </div>
        </div>

        <!-- Цена и итог в одной строке -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Цена за единицу
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₽</span>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              class="h-11 w-full rounded-xl border border-gray-200 pl-8 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-emerald-900/20"
            />
          </div>

          <!-- Расчет итога с анимацией -->
          <Transition name="slide-down">
            <div v-if="form.price && form.quantity" class="mt-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-3 dark:from-emerald-950/20 dark:to-teal-950/20">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-emerald-700 dark:text-emerald-400">Итого:</span>
                <span class="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {{ (form.price * form.quantity).toFixed(2) }} ₽
                </span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Описание с компонентом Textarea -->
        <Textarea
          v-model="form.note"
          label="Описание"
          placeholder="Дополнительная информация..."
          :rows="3"
        />

      </form>

      <!-- Footer с кнопками -->
      <div class="mt-6 flex items-center justify-between gap-3">
        <Button
          v-if="isEditing && itemId"
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
            variant="ghost"
            color="neutral"
            size="md"
            @click="closeModal"
          >
            Отмена
          </Button>
          <Button
            :color="isEditing ? 'primary' : 'success'"
            size="md"
            :loading="isLoading"
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Сохранить' : 'Добавить' }}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { ShoppingCategory, ShoppingListItem } from '~/shared/types/shopping.types';
import Button from '~/shared/ui/button/Button.vue';
import Modal from '~/shared/ui/modal/Modal.vue';
import Select from '~/shared/ui/select/Select.vue';
import Textarea from '~/shared/ui/textarea/Textarea.vue';

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
    value: cat.id,
    label: cat.name,
  }));
});

// Обработчик для количества (только целые положительные числа)
const handleQuantityInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Удаляем всё, кроме цифр
  value = value.replace(/[^\d]/g, '');

  // Преобразуем в число
  let numValue = value === '' ? 1 : parseInt(value, 10);

  // Проверяем, что число положительное
  if (isNaN(numValue) || numValue < 1) {
    numValue = 1;
  }

  form.quantity = numValue;
};

// Валидация при потере фокуса
const validateQuantity = () => {
  if (form.quantity < 1 || isNaN(form.quantity)) {
    form.quantity = 1;
  }
  // Приводим к целому числу
  form.quantity = Math.floor(form.quantity);
};

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

  // Дополнительная проверка количества перед отправкой
  if (form.quantity < 1 || isNaN(form.quantity)) {
    form.quantity = 1;
  }

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

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Убираем стрелки у number input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
}

input[type="number"]:hover::-webkit-inner-spin-button,
input[type="number"]:hover::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
