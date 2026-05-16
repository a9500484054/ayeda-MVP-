<template>
  <UModal v-model:open="isModalOpen" title="Добавить рецепт">
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
          <div v-if="isLoadingRecipes" class="flex flex-col items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-green-600" />
            <p class="mt-3 text-sm text-zinc-500">Поиск рецептов...</p>
          </div>

          <div v-else-if="!isLoadingRecipes && recipes.length === 0 && searchQuery" class="py-12 text-center">
            <UIcon name="i-lucide-cooking-pot" class="mx-auto h-12 w-12 text-zinc-300" />
            <p class="mt-3 text-sm text-zinc-500">Рецепты не найдены</p>
          </div>

          <div v-else-if="recipes.length > 0" class="space-y-2">
            <RecipeSearchCard
              v-for="recipe in recipes"
              :key="recipe.id"
              :recipe="recipe"
              :is-selected="selectedRecipeId === recipe.id"
              :is-disabled="isRecipeAlreadyAdded(recipe.id)"
              @select="selectRecipe"
            />
          </div>

          <div v-else class="py-12 text-center">
            <UIcon name="i-lucide-search" class="mx-auto h-12 w-12 text-zinc-300" />
            <p class="mt-3 text-sm text-zinc-500">Начните вводить название рецепта</p>
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
          :disabled="!selectedRecipeId || isRecipeAlreadyAdded(selectedRecipeId)"
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
import { useMenuPlannerStore } from '~/stores/menuPlannerStore';
import RecipeSearchCard from '../common/RecipeSearchCard.vue';

const props = defineProps<{
  open: boolean;
  slotId: string | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'recipe-added': [recipeId: string];
}>();

const store = useMenuPlannerStore();
const searchQuery = ref('');
const recipes = ref<RecipeResponse[]>([]);
const isLoadingRecipes = ref(false);
const selectedRecipeId = ref<string | null>(null);
const isAdding = ref(false);
let searchTimeout: NodeJS.Timeout;

const isModalOpen = computed({
  get: () => props.open,
  set: (value) => {
    if (!value) resetModal();
    emit('update:open', value);
  }
});

// Проверка, добавлен ли уже рецепт в текущий слот
function isRecipeAlreadyAdded(recipeId: string): boolean {
  if (!props.slotId) return false;

  const slot = store.slots.find(s => s.id === props.slotId);
  return slot?.items?.some(item => item.recipeId === recipeId) || false;
}

async function searchRecipes() {
  if (!searchQuery.value.trim()) {
    recipes.value = [];
    return;
  }

  isLoadingRecipes.value = true;

  try {
    const { useRecipesApi } = await import('~/composables/useRecipesApi');
    const api = useRecipesApi();

    const result = await api.searchRecipes(searchQuery.value, {
      page: 1,
      limit: 20
    });

    recipes.value = result.items || result.data || [];
  } catch (error) {
    console.error('Failed to search recipes:', error);
    recipes.value = [];
  } finally {
    isLoadingRecipes.value = false;
  }
}

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchRecipes();
  }, 500);
}

function selectRecipe(recipe: RecipeResponse) {
  selectedRecipeId.value = recipe.id;
}

async function addRecipe() {
  if (!selectedRecipeId.value) return;

  // Дополнительная проверка перед отправкой
  if (isRecipeAlreadyAdded(selectedRecipeId.value)) {
    toast.add({
      title: 'Рецепт уже добавлен',
      description: 'Этот рецепт уже есть в данном приеме пищи',
      color: 'warning',
    });
    closeModal();
    return;
  }

  isAdding.value = true;

  try {
    emit('recipe-added', selectedRecipeId.value);
    closeModal();
  } catch (error) {
    console.error('Failed to add recipe:', error);
  } finally {
    isAdding.value = false;
  }
}

function resetModal() {
  searchQuery.value = '';
  recipes.value = [];
  selectedRecipeId.value = null;
  clearTimeout(searchTimeout);
}

function closeModal() {
  isModalOpen.value = false;
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetModal();
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  }
});
</script>
