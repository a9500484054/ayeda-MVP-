<template>
  <UCard>
    <!-- Заголовок -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-medium text-gray-900 dark:text-darkMode-900">
        Добавить продукты
      </h1>
    </div>

    <!-- Поле ввода -->
    <div class="relative flex w-full flex-col">
      <textarea
        id="product"
        v-model="searchValue"
        placeholder="например, молоко"
        class="relative resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-900 outline-none placeholder:text-sm placeholder:text-gray-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-darkMode-300 dark:bg-darkMode-100 dark:text-darkMode-700 dark:placeholder:text-darkMode-500"
        rows="1"
        autocomplete="off"
        @keyup.enter="handleQuickAdd"
      />
    </div>

    <!-- Список продуктов (без табов) -->
    <div class="flex-1 overflow-y-auto pt-3 max-h-[80vh]">
      <div class="space-y-1">
        <div
          v-for="item in filteredItems"
          :key="item.name"
          class="group flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-darkMode-100"
        >
          <div class="flex flex-1 cursor-pointer items-center gap-2 truncate" @click="emit('addPopular', item)">
            <!-- Иконка категории -->
            <div class="flex h-6 w-6 items-center justify-center text-gray-400 group-hover:text-primary-500">
              <UIcon :name="getCategoryIcon(item.categoryId)" class="h-4 w-4" />
            </div>
            <span class="truncate text-sm font-medium text-gray-700 dark:text-darkMode-600">
              {{ item.name }}
            </span>
          </div>

          <!-- Кнопка добавления -->
          <div class="flex items-center gap-1">
            <span v-if="item.count && item.count > 1" class="text-xs text-gray-400">
              {{ item.count }}
            </span>
            <button
              class="rounded-lg p-1 text-primary-500 transition-all hover:bg-primary-100 hover:text-primary-600"
              @click.stop="emit('addPopular', item)"
            >
              <UIcon name="i-lucide-plus" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="filteredItems.length === 0" class="py-8 text-center">
          <UIcon name="i-lucide-package" class="mx-auto h-8 w-8 text-gray-300" />
          <p class="mt-2 text-sm text-gray-400">Нет продуктов</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  popularItems: Array<{ name: string; categoryId?: string; unit?: string; count?: number }>;
}>();

const emit = defineEmits<{
  quickAdd: [name: string];
  addPopular: [item: { name: string; categoryId?: string; unit?: string }];
}>();

const searchValue = ref('');

// Стейт для недавних продуктов
const RECENT_STORAGE_KEY = 'shopping_recent_items';
const recentItems = ref<Array<{ name: string; categoryId?: string; unit?: string; count?: number }>>([]);

// Загрузка недавних продуктов
function loadRecentItems() {
  if (process.client) {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) {
      try {
        recentItems.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse recent items:', e);
      }
    }
  }
}

// Сохранение недавних продуктов
function saveRecentItems() {
  if (process.client) {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentItems.value.slice(0, 20)));
  }
}

// Добавление продукта в недавние
function addToRecent(item: { name: string; categoryId?: string; unit?: string }) {
  const existingIndex = recentItems.value.findIndex(i => i.name === item.name);
  if (existingIndex !== -1) {
    // Перемещаем в начало
    const [existing] = recentItems.value.splice(existingIndex, 1);
    existing.count = (existing.count || 0) + 1;
    recentItems.value.unshift(existing);
  } else {
    recentItems.value.unshift({ ...item, count: 1 });
  }

  // Ограничиваем список 20 элементами
  if (recentItems.value.length > 20) {
    recentItems.value.pop();
  }

  saveRecentItems();
}

// Объединенный список: сначала популярные, потом недавние (без дубликатов)
const filteredItems = computed(() => {
  // Поиск
  let searchResult = [...props.popularItems];
  if (searchValue.value.trim()) {
    const query = searchValue.value.toLowerCase();
    searchResult = searchResult.filter(item => item.name.toLowerCase().includes(query));
  }

  // Если есть поиск или нет недавних, показываем только популярные
  if (searchValue.value.trim() || recentItems.value.length === 0) {
    return searchResult;
  }

  // Объединяем популярные и недавние, убирая дубликаты
  const popularNames = new Set(props.popularItems.map(i => i.name));
  const uniqueRecent = recentItems.value.filter(item => !popularNames.has(item.name));

  return [...searchResult, ...uniqueRecent];
});

// Получение иконки категории
function getCategoryIcon(categoryId?: string): string {
  if (!categoryId) return 'i-lucide-package';
  return 'i-lucide-package';
}

function handleQuickAdd() {
  if (searchValue.value.trim()) {
    const name = searchValue.value.trim();
    emit('quickAdd', name);
    addToRecent({ name });
    searchValue.value = '';
  }
}

// Инициализация
onMounted(() => {
  loadRecentItems();
});
</script>

<style scoped>
textarea {
  resize: none;
  overflow: hidden;
  min-height: 42px;
}

/* Стили для скроллбара */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}
</style>
