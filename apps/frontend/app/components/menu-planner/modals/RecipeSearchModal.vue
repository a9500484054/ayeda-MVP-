<!-- apps/frontend/app/components/menu-planner/modals/RecipeSearchModal.vue -->
<template>
  <UModal v-model:open="isModalOpen" :title="title">
    <template #body>
      <div class="flex flex-col gap-4">
        <!-- Поиск -->
        <div class="relative">
          <UIcon
            name="i-lucide-search"
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <UInput
            v-model="searchQuery"
            type="text"
            placeholder="Поиск рецептов..."
            class="pl-9"
            :loading="isLoadingRecipes"
            @input="handleSearchInput"
          />
        </div>

        <!-- Список рецептов -->
        <div class="max-h-[500px] overflow-y-auto">
          <!-- Загрузка -->
          <div v-if="isLoadingRecipes" class="flex flex-col items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-green-600" />
            <p class="mt-3 text-sm text-zinc-500">Поиск рецептов...</p>
          </div>

          <!-- Нет результатов -->
          <div v-else-if="!isLoadingRecipes && recipes.length === 0 && searchQuery" class="py-12 text-center">
            <UIcon name="i-lucide-cooking-pot" class="mx-auto h-12 w-12 text-zinc-300" />
            <p class="mt-3 text-sm text-zinc-500">Рецепты не найдены</p>
            <p class="text-xs text-zinc-400">Попробуйте изменить поисковый запрос</p>
          </div>

          <!-- Список рецептов -->
          <div v-else-if="recipes.length > 0" class="space-y-2">
            <RecipeSearchCard
              v-for="recipe in recipes"
              :key="recipe.id"
              :recipe="recipe"
              :is-selected="selectedRecipeId === recipe.id"
              @select="selectRecipe"
            />
          </div>

          <!-- Пустое состояние без поиска -->
          <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-search" class="mx-auto h-12 w-12 text-zinc-300" />
            <p class="mt-3 text-sm text-zinc-500">Начните вводить название рецепта</p>
            <p class="text-xs text-zinc-400">Например: "Борщ", "Салат Цезарь", "Омлет"</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="closeModal">
          Отмена
        </UButton>
        <UButton
          color="primary"
          :disabled="!selectedRecipeId"
          :loading="isAdding"
          @click="addRecipe"
        >
          Добавить рецепт
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { RecipeResponse } from '~/composables/useRecipesApi';
import RecipeSearchCard from '../common/RecipeSearchCard.vue';

const props = defineProps<{
  open: boolean;
  slotId: string | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'recipe-added': [recipeId: string];
}>();

// Состояния
const searchQuery = ref('');
const recipes = ref<RecipeResponse[]>([]);
const isLoadingRecipes = ref(false);
const selectedRecipeId = ref<string | null>(null);
const isAdding = ref(false);

// Таймер для debounce
let searchTimeout: NodeJS.Timeout;

// Computed для v-model модалки
const isModalOpen = computed({
  get: () => {
    console.log('🔍 RecipeSearchModal: open =', props.open);
    return props.open;
  },
  set: (value) => {
    console.log('🔍 RecipeSearchModal: setting open to', value);
    if (!value) {
      resetModal();
    }
    emit('update:open', value);
  }
});

const title = computed(() => {
  return props.slotId ? 'Добавить рецепт' : 'Выбор рецепта';
});

// Поиск рецептов
async function searchRecipes() {
  if (!searchQuery.value.trim()) {
    recipes.value = [];
    return;
  }

  isLoadingRecipes.value = true;

  try {
    const { useRecipesApi } = await import('~/composables/useRecipesApi');
    const api = useRecipesApi();

    // Используем правильный метод searchRecipes, а не getRecipes
    const result = await api.searchRecipes(searchQuery.value, {
      page: 1,
      limit: 20
    });

    recipes.value = result.items || result.data || [];
    console.log(`📚 Found ${recipes.value.length} recipes`);
  } catch (error) {
    console.error('Failed to search recipes:', error);
    recipes.value = [];
  } finally {
    isLoadingRecipes.value = false;
  }
}

// Debounced search
function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchRecipes();
  }, 500);
}

// Выбор рецепта
function selectRecipe(recipe: RecipeResponse) {
  console.log('📖 Recipe selected:', recipe.id, recipe.title);
  selectedRecipeId.value = recipe.id;
}

// Добавление рецепта
async function addRecipe() {
  if (!selectedRecipeId.value) return;

  isAdding.value = true;

  try {
    console.log('✅ Adding recipe:', selectedRecipeId.value);
    emit('recipe-added', selectedRecipeId.value);
    closeModal();
  } catch (error) {
    console.error('Failed to add recipe:', error);
  } finally {
    isAdding.value = false;
  }
}

// Сброс состояния при закрытии
function resetModal() {
  searchQuery.value = '';
  recipes.value = [];
  selectedRecipeId.value = null;
  clearTimeout(searchTimeout);
}

function closeModal() {
  isModalOpen.value = false;
}

// Сброс при открытии
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetModal();
    // Фокусируемся на поле поиска
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  }
});
</script>

<style scoped>
/* Стили для скролла */
:deep(.overflow-y-auto)::-webkit-scrollbar {
  width: 6px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

:deep(.overflow-y-auto)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
