<!-- components/menu-planner/modals/ShoppingListPreviewModal.vue -->
<template>
  <UModal
    v-model:open="isOpen"
    title="Предпросмотр списка покупок"
    :ui="{
      content: 'sm:max-w-2xl',
      body: 'p-0',
      footer: 'px-4 py-3 bg-zinc-50'
    }"
  >
    <template #body>
      <div class="max-h-[60vh] overflow-y-auto p-4">
        <!-- Количество ингредиентов -->
        <div class="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
          <div class="text-sm text-zinc-500">
            Всего ингредиентов:
            <span class="font-semibold text-zinc-900">{{ editableIngredients.length }}</span>
          </div>

          <!-- Режим редактирования -->
          <div class="flex items-center gap-2">
            <Button
              v-if="!isEditing"
              color="white"
              size="sm"
              @click="startEditing"
            >
              <UIcon name="i-lucide-pencil" class="h-3.5 w-3.5" />
              <span>Редактировать</span>
            </Button>
            <div v-else class="flex gap-2">
              <Button
                color="white"
                size="sm"
                @click="cancelEditing"
              >
                Отмена
              </Button>
              <Button
                color="primary"
                size="sm"
                @click="saveEditing"
                :loading="isSaving"
              >
                <UIcon name="i-lucide-check" class="h-3.5 w-3.5" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        <!-- Список ингредиентов -->
        <div class="space-y-2">
          <!-- Режим просмотра -->
          <div v-if="!isEditing" class="space-y-2">
            <div
              v-for="ingredient in editableIngredients"
              :key="ingredient.key"
              class="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200 hover:shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                  <UIcon name="i-lucide-shopping-basket" class="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p class="font-medium text-zinc-900">
                    {{ ingredient.name }}
                  </p>
                  <p class="text-xs text-zinc-400">
                    {{ ingredient.unit || 'шт' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-green-600">
                  {{ ingredient.amount }}
                </span>
                <span class="text-sm text-zinc-500">
                  {{ ingredient.unit || 'шт' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Режим редактирования -->
          <div v-else class="space-y-3">
            <div
              v-for="(ingredient, index) in editableIngredients"
              :key="ingredient.key"
              class="group rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-green-200"
            >
              <div class="flex items-center gap-3">
                <!-- Drag handle -->
                <div class="cursor-grab text-zinc-400 active:cursor-grabbing">
                  <UIcon name="i-lucide-grip-vertical" class="h-4 w-4" />
                </div>

                <!-- Иконка -->
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                  <UIcon name="i-lucide-shopping-basket" class="h-4 w-4 text-green-600" />
                </div>

                <!-- Название -->
                <div class="flex-1">
                  <UInput
                    v-model="ingredient.name"
                    size="sm"
                    class="font-medium"
                  />
                </div>

                <!-- Количество -->
                <div class="flex w-32 items-center gap-2">
                  <UInput
                    v-model.number="ingredient.amount"
                    type="number"
                    size="sm"
                    step="0.1"
                    min="0"
                    class="w-20 text-center"
                  />
                  <span class="text-sm text-zinc-500">{{ ingredient.unit || 'шт' }}</span>
                </div>

                <!-- Кнопка удаления -->
                <button
                  class="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  @click="removeIngredient(index)"
                >
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button
          color="white"
          @click="closeModal"
        >
          Отмена
        </Button>
        <Button
          color="primary"
          @click="handleConfirm"
          :loading="isCreating"
        >
          Создать список покупок
        </Button>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useDraggable } from '@vueuse/core';
import Button from '~/shared/ui/button/Button.vue';

const props = defineProps<{
  open: boolean;
  ingredients: Array<{ id: string; name: string; amount: number; unit: string }>;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [ingredients: Array<{ id: string; name: string; amount: number; unit: string }>];
}>();

const isCreating = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isIngredientModalOpen = ref(false);
const editingIndex = ref<number | null>(null);

// Состояние для редактируемого ингредиента
const editingIngredient = ref({
  name: '',
  amount: 0,
  unit: '',
  key: ''
});

// Исходные ингредиенты для отмены
let originalIngredients: Array<any> = [];

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) {
      isEditing.value = false;
    }
    emit('update:open', value);
  }
});

// Группировка и редактируемые ингредиенты
const editableIngredients = ref<Array<{
  key: string;
  id: string;
  name: string;
  amount: number;
  unit: string;
}>>([]);

// Инициализация при открытии
watch(() => props.open, (open) => {
  if (open) {
    initIngredients();
  }
});

function initIngredients() {
  const map = new Map<string, {
    key: string;
    id: string;
    name: string;
    amount: number;
    unit: string;
  }>();

  props.ingredients.forEach(ingredient => {
    let amount = 0;
    if (typeof ingredient.amount === 'number') {
      amount = ingredient.amount;
    } else if (typeof ingredient.amount === 'string') {
      amount = parseFloat(ingredient.amount) || 0;
    }

    const key = `${ingredient.name}_${ingredient.unit}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.amount = Number((existing.amount + amount).toFixed(2));
    } else {
      map.set(key, {
        key,
        id: ingredient.id,
        name: ingredient.name,
        amount: amount,
        unit: ingredient.unit || 'шт'
      });
    }
  });

  editableIngredients.value = Array.from(map.values());
}

function startEditing() {
  // Сохраняем копию для отмены
  originalIngredients = JSON.parse(JSON.stringify(editableIngredients.value));
  isEditing.value = true;
}

function cancelEditing() {
  editableIngredients.value = originalIngredients;
  isEditing.value = false;
}

async function saveEditing() {
  isSaving.value = true;
  // Здесь можно добавить валидацию
  await new Promise(resolve => setTimeout(resolve, 300)); // Имитация сохранения
  isEditing.value = false;
  isSaving.value = false;
}

function addNewIngredient() {
  editingIndex.value = null;
  editingIngredient.value = {
    name: '',
    amount: 0,
    unit: 'шт',
    key: ''
  };
  isIngredientModalOpen.value = true;
}

function editIngredient(index: number) {
  editingIndex.value = index;
  const ingredient = editableIngredients.value[index];
  editingIngredient.value = { ...ingredient };
  isIngredientModalOpen.value = true;
}

function saveIngredient() {
  if (!editingIngredient.value.name.trim()) {
    return;
  }

  const newIngredient = {
    key: `${editingIngredient.value.name}_${editingIngredient.value.unit}`,
    id: Date.now().toString(),
    name: editingIngredient.value.name,
    amount: editingIngredient.value.amount || 0,
    unit: editingIngredient.value.unit || 'шт'
  };

  if (editingIndex.value !== null) {
    // Редактируем существующий
    editableIngredients.value[editingIndex.value] = newIngredient;
  } else {
    // Добавляем новый
    editableIngredients.value.push(newIngredient);
  }

  isIngredientModalOpen.value = false;
}

function removeIngredient(index: number) {
  editableIngredients.value.splice(index, 1);
}

function closeModal() {
  isOpen.value = false;
}

async function handleConfirm() {
  isCreating.value = true;
  try {
    // Убираем key из финального результата
    const finalIngredients = editableIngredients.value.map(({ key, ...rest }) => rest);
    emit('confirm', finalIngredients);
    closeModal();
  } finally {
    isCreating.value = false;
  }
}
</script>
