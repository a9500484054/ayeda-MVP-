<template>
  <div class="add-item-block">
    <!-- Заголовок -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-medium text-gray-900 dark:text-darkMode-900">
        Добавить продукты
      </h1>
      <div v-if="searchValue" class="text-xs text-gray-400">
        {{ filteredIngredients.length }} найдено
      </div>
    </div>

    <!-- Поле ввода -->
    <div class="relative flex w-full flex-col">
      <SearchInput
        size="xs"
        v-model="searchValue"
        placeholder="например, молоко"
        id="product-search"
        @enter="handleQuickAdd"
      />
    </div>

    <!-- Контент с фиксированной высотой -->
    <div class="mt-4 min-h-[400px]">
      <!-- Состояние загрузки с анимацией -->
      <Transition name="fade" mode="out-in">
        <div v-if="showLoader" class="flex flex-col items-center justify-center py-12">
          <div class="relative">
            <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
            <div class="absolute inset-0 h-10 w-10 animate-pulse rounded-full bg-primary-500/5" />
          </div>
          <p class="mt-3 text-sm text-gray-400 animate-pulse">
            {{ loadingText }}
          </p>
        </div>

        <!-- Список продуктов с анимацией -->
        <div v-else class="overflow-y-auto overflow-x-hidden scrollbar-custom" :class="{ 'max-h-[400px]': filteredIngredients.length > 0 }">
          <TransitionGroup name="list" tag="div" class="space-y-1">
            <div
              v-for="ingredient in filteredIngredients"
              :key="ingredient.id"
              class="group flex items-center justify-between rounded-lg px-2 py-2 transition-all duration-200 hover:bg-gray-50 hover:pl-3 dark:hover:bg-darkMode-100"
            >
              <div
                class="flex flex-1 cursor-pointer items-center gap-3 truncate"
                @click="handleAddPopular(mapIngredientToItem(ingredient))"
              >
                <div class="flex flex-col truncate">
                  <span class="truncate text-sm font-medium text-gray-700 dark:text-darkMode-600">
                    {{ ingredient.name }}
                  </span>
                  <!-- <span class="text-xs text-gray-400">
                    {{ ingredient.unit.short || ingredient.unit.name }}
                  </span> -->
                </div>
              </div>

              <!-- Кнопка добавления с анимацией -->
              <Button
                size="sm"
                color="primary"
                variant="ghost"
                @click.stop="handleAddPopular(mapIngredientToItem(ingredient))"
              >
                <UIcon name="i-lucide-plus" class="h-4 w-4" />
              </Button>
            </div>
          </TransitionGroup>

          <!-- Пустое состояние с анимацией -->
          <Transition name="fade">
            <div v-if="filteredIngredients.length === 0 && !showLoader" class="py-12 text-center">
              <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-darkMode-100">
                <UIcon :name="searchValue.trim() ? 'i-lucide-search-x' : 'i-lucide-shopping-bag'" class="h-8 w-8 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500">
                {{ searchValue.trim() ? 'Ничего не найдено' : 'Начните вводить название продукта' }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                Нажмите Enter для быстрого добавления
              </p>
            </div>
          </Transition>
        </div>
      </Transition>
    </div>

    <!-- Недавние добавления -->
    <Transition name="slide-up">
      <div
        v-if="recentItems.length > 0 && !searchValue.trim() && !showLoader"
        class="mt-4 border-t border-gray-100 pt-4 dark:border-darkMode-200"
      >
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-medium text-gray-400">
            <UIcon name="i-lucide-clock" class="mr-1 inline h-3 w-3" />
            Недавние
          </p>
          <button
            class="text-xs text-gray-400 transition-colors hover:text-red-500 cursor-pointer"
            @click="clearRecent"
          >
            Очистить
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <TransitionGroup name="list">
            <button
              v-for="item in recentItems.slice(0, 5)"
              :key="item.name"
              class="group relative overflow-hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 transition-all duration-200 hover:bg-primary-100 hover:text-primary-600 hover:shadow-sm dark:bg-darkMode-100 dark:text-darkMode-500 cursor-pointer"
              @click="handleAddPopular(item)"
            >
              <span class="relative z-10">{{ item.name }}</span>
              <div class="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-primary-200/50 to-transparent transition-transform duration-300 group-hover:translate-x-0" />
            </button>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useIngredientsApi, type Ingredient } from '~/composables/useIngredientsApi';
import Button from '~/shared/ui/button/Button.vue';
import SearchInput from '~/shared/ui/search-input/SearchInput.vue';

const emit = defineEmits<{
  quickAdd: [name: string];
  addPopular: [item: { name: string; categoryId?: string; unit?: string }];
  scrollToBottom: [];
}>();

const searchValue = ref('');
const ingredientsLoading = ref(false);
const showLoader = ref(false);
const searchIngredients = ref<Ingredient[]>([]);

// API
const ingredientsApi = useIngredientsApi();

// Стейт для недавних продуктов
const RECENT_STORAGE_KEY = 'shopping_recent_items';
const recentItems = ref<Array<{ name: string; categoryId?: string; unit?: string }>>([]);

// Текст лоудера
const loadingText = computed(() => {
  if (!searchValue.value) return 'Загрузка продуктов...';
  if (searchValue.value.length < 2) return 'Введите минимум 2 символа...';
  return `Поиск "${searchValue.value}"...`;
});

// Загрузка ингредиентов с debounce
let searchTimeout: NodeJS.Timeout | null = null;
let loaderTimeout: NodeJS.Timeout | null = null;

const loadIngredients = async (searchQuery: string = '') => {
  if (loaderTimeout) clearTimeout(loaderTimeout);
  loaderTimeout = setTimeout(() => {
    if (ingredientsLoading.value) {
      showLoader.value = true;
    }
  }, 150);

  ingredientsLoading.value = true;

  try {
    let response;

    if (!searchQuery || searchQuery.length < 2) {
      response = await ingredientsApi.getIngredients(1, 50);
      searchIngredients.value = response.data || [];
      return;
    }

    response = await ingredientsApi.searchIngredients(searchQuery, 1, 20);
    searchIngredients.value = response.data || [];
  } catch (error) {
    console.error('Error loading ingredients:', error);
    searchIngredients.value = [];
  } finally {
    ingredientsLoading.value = false;
    if (loaderTimeout) clearTimeout(loaderTimeout);
    showLoader.value = false;
  }
};

// Debounced поиск
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    loadIngredients(searchValue.value);
  }, 300);
};

// Очистка поиска
function clearSearch() {
  searchValue.value = '';
  loadIngredients('');
}

// Очистка недавних
function clearRecent() {
  recentItems.value = [];
  saveRecentItems();
}

// Следим за изменением поиска
watch(searchValue, () => {
  debouncedSearch();
}, { immediate: true });

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
    const [existing] = recentItems.value.splice(existingIndex, 1);
    recentItems.value.unshift(existing);
  } else {
    recentItems.value.unshift(item);
  }

  if (recentItems.value.length > 20) {
    recentItems.value.pop();
  }

  saveRecentItems();
}

// Маппинг Ingredient в формат для emit
function mapIngredientToItem(ingredient: Ingredient): { name: string; categoryId?: string; unit?: string } {
  return {
    name: ingredient.name,
    categoryId: undefined,
    unit: ingredient.unit.short || ingredient.unit.name
  };
}

// Обработчик добавления популярного продукта
function handleAddPopular(item: { name: string; categoryId?: string; unit?: string }) {
  emit('addPopular', item);
  addToRecent(item);
  emit('scrollToBottom');
}

const filteredIngredients = computed(() => {
  return searchIngredients.value;
});

function handleQuickAdd() {
  if (searchValue.value.trim()) {
    const name = searchValue.value.trim();
    emit('quickAdd', name);
    addToRecent({ name });
    searchValue.value = '';
    emit('scrollToBottom');
  }
}

// Инициализация
onMounted(() => {
  loadRecentItems();
  loadIngredients();
});

// Cleanup
onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (loaderTimeout) clearTimeout(loaderTimeout);
});
</script>



<style scoped>
.add-item-block {
  transition: all 0.2s ease;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Кастомный скроллбар */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
  transition: background 0.2s;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.dark .scrollbar-custom::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.dark .scrollbar-custom::-webkit-scrollbar-thumb {
  background: #4a4a4a;
}

.dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

/* Анимация для инпута */
input {
  transition: all 0.2s ease;
}

input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Hover эффекты */
.group:hover .group-hover\:pl-3 {
  padding-left: 0.75rem;
}
</style>
