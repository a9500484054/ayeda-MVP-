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
        <div class="mb-4 border-b border-zinc-100 pb-3">
          <div class="text-sm text-zinc-500">
            Всего ингредиентов:
            <span class="font-semibold text-zinc-900">{{ groupedIngredients.length }}</span>
          </div>
        </div>

        <!-- Список ингредиентов -->
        <div class="space-y-2">
          <div
            v-for="ingredient in groupedIngredients"
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

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

// Группировка одинаковых ингредиентов и суммирование количества
const groupedIngredients = computed(() => {
  const map = new Map<string, {
    key: string;
    id: string;
    name: string;
    amount: number;
    unit: string;
  }>();

  props.ingredients.forEach(ingredient => {
    // Нормализуем количество - убеждаемся что это число
    let amount = 0;
    if (typeof ingredient.amount === 'number') {
      amount = ingredient.amount;
    } else if (typeof ingredient.amount === 'string') {
      amount = parseFloat(ingredient.amount) || 0;
    } else {
      amount = 0;
    }

    const key = `${ingredient.name}_${ingredient.unit}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.amount = Number((existing.amount + amount).toFixed(2)); // Округляем до 2 знаков
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

  return Array.from(map.values());
});

function closeModal() {
  isOpen.value = false;
}

async function handleConfirm() {
  isCreating.value = true;
  try {
    // Передаем сгруппированные ингредиенты с корректными количествами
    emit('confirm', groupedIngredients.value);
    closeModal();
  } finally {
    isCreating.value = false;
  }
}
</script>
