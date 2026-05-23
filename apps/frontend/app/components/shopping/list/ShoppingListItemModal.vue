<!-- apps\frontend\app\components\shopping\list\ShoppingListItemModal.vue -->
<template>
  <UModal v-model:open="isOpen" :title="isEditing ? 'Редактировать продукт' : 'Добавить продукт'">
    <template #body>
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
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500"
            />
            <input
              v-model="form.name"
              type="text"
              placeholder="Например: Помидоры"
              class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-sm placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500 dark:focus:ring-primary-900/20"
              autofocus
            />
          </div>
        </div>

        <!-- Категория -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Категория
          </label>
          <USelect
            v-model="form.categoryId"
            :items="categoryOptions"
            placeholder="Выберите категорию"
            clearable
            class="w-full"
            :ui="{
              wrapper: 'w-full',
              base: 'w-full rounded-xl border-gray-200 dark:border-darkMode-300 dark:bg-darkMode-100',
              input: 'h-11 text-sm'
            }"
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
                v-model.number="form.quantity"
                type="number"
                step="0.01"
                placeholder="1"
                class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-primary-900/20"
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
                class="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-primary-900/20"
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
              placeholder="0"
              class="h-11 w-full rounded-xl border border-gray-200 pl-8 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:focus:ring-primary-900/20"
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

        <!-- Описание -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Описание
          </label>
          <textarea
            v-model="form.note"
            rows="3"
            placeholder="Дополнительная информация..."
            class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-sm placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500 dark:focus:ring-primary-900/20"
          />
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex items-center justify-between gap-3 w-full">
        <Button
          v-if="isEditing && itemId"
          icon="i-lucide-trash-2"
          color="danger"
          variant="ghost"
          size="md"
          :loading="isDeleting"
          class="hover:bg-red-50 dark:hover:bg-red-900/20"
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
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ShoppingCategory, ShoppingListItem } from '~/shared/types/shopping.types';
import Button from '~/shared/ui/button/Button.vue';

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
