<template>
  <div class="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-darkMode-400 dark:bg-darkMode-50">
    <h3 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
      Добавить продукты
    </h3>

    <!-- Поиск -->
    <UInput
      v-model="searchValue"
      placeholder="Поиск продуктов..."
      icon="i-lucide-search"
      class="mb-4"
      @keyup.enter="handleQuickAdd"
    />

    <!-- Быстрое добавление -->
    <div v-if="showQuickAdd && searchValue.trim()">
      <UButton
        color="primary"
        size="sm"
        class="w-full"
        @click="handleQuickAdd"
      >
        + Добавить "{{ searchValue.trim() }}"
      </UButton>
    </div>

    <!-- Популярные ингредиенты -->
    <div v-else>
      <p class="mb-2 text-xs text-gray-500">Быстрое добавление:</p>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="item in popularItems"
          :key="item.name"
          color="gray"
          class="cursor-pointer hover:bg-gray-200 dark:hover:bg-darkMode-200"
          @click="emit('addPopular', item)"
        >
          {{ item.name }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/shared/ui/button/Button.vue';

const props = defineProps<{
  popularItems: Array<{ name: string; categoryId?: string; unit?: string }>;
}>();

const emit = defineEmits<{
  quickAdd: [name: string];
  addPopular: [item: { name: string; categoryId?: string; unit?: string }];
}>();

const searchValue = ref('');

const showQuickAdd = computed(() => searchValue.value.length > 0);

function handleQuickAdd() {
  if (searchValue.value.trim()) {
    emit('quickAdd', searchValue.value.trim());
    searchValue.value = '';
  }
}
</script>
