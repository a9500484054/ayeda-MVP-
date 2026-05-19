<template>
  <UModal
    v-model:open="isModalOpen"
    title="Добавить рецепты"
    :ui="{
      content: 'sm:max-w-xl overflow-visible',
      body: 'overflow-visible',
      footer: 'overflow-visible'
    }"
  >
    <template #body>
      <div class="space-y-5 overflow-visible">
        <!-- SEARCH -->
        <div
          ref="searchContainer"
          class="relative z-50"
        >
          <UIcon
            name="i-lucide-search"
            class="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-zinc-400"
          />

          <UInput
            ref="searchInput"
            v-model="searchQuery"
            size="xl"
            placeholder="Найти рецепты..."
            :loading="isLoadingRecipes"
            class="w-full"
            :ui="{
              base: `
                pl-11
                rounded-2xl
                border-zinc-200
                bg-white/90
                backdrop-blur
                shadow-sm
                transition-all
                focus:border-green-500
                focus:ring-green-500
              `
            }"
            @focus="handleFocus"
            @input="handleSearchInput"
          />

          <!-- DROPDOWN -->
          <Transition name="dropdown">
            <div
              v-if="isRecipesVisible"
              class="
                absolute
                left-0
                right-0
                top-[calc(100%+12px)]
                z-[9999]
                rounded-3xl
                border
                border-zinc-200
                bg-white
                shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                backdrop-blur-xl
                overflow-hidden
              "
            >
              <div class="max-h-[400px] overflow-y-auto overflow-x-hidden">
                <!-- LOADING -->
                <div
                  v-if="isLoadingRecipes"
                  class="flex flex-col items-center justify-center py-14"
                >
                  <div
                    class="
                      h-9
                      w-9
                      animate-spin
                      rounded-full
                      border-2
                      border-zinc-200
                      border-t-green-600
                    "
                  />

                  <p class="mt-4 text-sm text-zinc-500">
                    Поиск рецептов...
                  </p>
                </div>

                <!-- RECIPES -->
                <div
                  v-else-if="recipes.length"
                  class="p-2"
                >
                  <div class="space-y-2">
                    <RecipeSearchCard
                      v-for="recipe in recipes"
                      :key="recipe.id"
                      :recipe="recipe"
                      :is-selected="selectedRecipeIds.includes(recipe.id)"
                      :is-disabled="isRecipeDisabled(recipe.id)"
                      class="
                        cursor-pointer
                        rounded-2xl
                        transition-all
                        duration-200
                        hover:scale-[1.01]
                        hover:bg-zinc-50
                        w-full
                      "
                      @mousedown.prevent="toggleRecipe(recipe)"
                    />
                  </div>
                </div>

                <!-- EMPTY -->
                <div
                  v-else
                  class="flex flex-col items-center justify-center py-16"
                >
                  <UIcon
                    name="i-lucide-chef-hat"
                    class="h-14 w-14 text-zinc-300"
                  />

                  <p class="mt-4 text-sm font-medium text-zinc-600">
                    Ничего не найдено
                  </p>

                  <p class="mt-1 text-xs text-zinc-400">
                    Попробуйте изменить запрос
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- SELECTED -->
        <div v-if="selectedRecipes.length" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-zinc-700">
              Выбранные рецепты
            </h3>

            <UBadge
              v-if="selectedRecipeIds.length === MAX_RECIPES"
              color="warning"
              variant="soft"
              size="sm"
            >
              Достигнут лимит
            </UBadge>
          </div>

          <TransitionGroup
            name="selected"
            tag="div"
            class="grid gap-3 sm:grid-cols-2"
          >
            <div
              v-for="recipe in selectedRecipes"
              :key="recipe.id"
              class="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-green-200
                bg-green-50
                p-4
                overflow-hidden
              "
            >
              <div class="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div
                  class="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center  
                    justify-center
                    rounded-xl
                    bg-green-100
                  "
                >
                  <UIcon
                    name="i-lucide-check"
                    class="h-5 w-5 text-green-600"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-zinc-900">
                    {{ recipe.title }}
                  </p>

                  <p class="text-xs text-zinc-500">
                    Выбран рецепт
                  </p>
                </div>
              </div>

              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                class="shrink-0 ml-2"
                @click="removeRecipe(recipe.id)"
              />
            </div>
          </TransitionGroup>
        </div>

        <!-- LIMIT -->
        <div class="flex items-center justify-between">
          <p class="text-sm text-zinc-500">
            Выбрано:
            <span class="font-semibold text-zinc-900">
              {{ selectedRecipeIds.length }}/{{ MAX_RECIPES }}
            </span>
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="soft"
          color="neutral"
          @click="closeModal"
        >
          Отмена
        </UButton>

        <UButton
          color="primary"
          size="lg"
          :disabled="!selectedRecipeIds.length"
          :loading="isAdding"
          class="rounded-xl px-6"
          @click="addRecipes"
        >
          Добавить {{ selectedRecipeIds.length }} рецепт{{ selectedRecipeIds.length === 1 ? '' : 'а' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useDebounceFn, onClickOutside } from '@vueuse/core';

import type { RecipeResponse } from '~/composables/useRecipesApi';
import { useMenuPlannerStore } from '~/stores/menuPlannerStore';

import RecipeSearchCard from '../common/RecipeSearchCard.vue';

const MAX_RECIPES = 4;

const props = defineProps<{
  open: boolean;
  slotId: string | null;
}>();

const emit = defineEmits<{
  'update:open': [boolean];
  'recipe-added': [recipeId: string];
}>();

const toast = useToast();
const store = useMenuPlannerStore();

const searchContainer = ref();
const searchInput = ref();

const searchQuery = ref('');
const recipes = ref<RecipeResponse[]>([]);

const selectedRecipeIds = ref<string[]>([]);

const isLoadingRecipes = ref(false);
const isAdding = ref(false);
const isRecipesVisible = ref(false);

const isModalOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value);

    if (!value) {
      resetModal();
    }
  }
});

const selectedRecipes = computed(() => {
  return selectedRecipeIds.value
    .map(id => recipes.value.find(r => r.id === id))
    .filter(Boolean) as RecipeResponse[];
});

onClickOutside(searchContainer, () => {
  isRecipesVisible.value = false;
});

function isRecipeAlreadyAdded(recipeId: string) {
  if (!props.slotId) return false;

  const slot = store.slots.find(s => s.id === props.slotId);

  return slot?.items?.some(i => i.recipeId === recipeId) || false;
}

function isRecipeDisabled(recipeId: string) {
  return (
    isRecipeAlreadyAdded(recipeId) ||
    (
      selectedRecipeIds.value.length >= MAX_RECIPES &&
      !selectedRecipeIds.value.includes(recipeId)
    )
  );
}

async function fetchRecipes(query?: string) {
  isLoadingRecipes.value = true;

  try {
    const { useRecipesApi } = await import('~/composables/useRecipesApi');

    const api = useRecipesApi();

    const result = query?.trim()
      ? await api.searchRecipes(query, {
          page: 1,
          limit: 20
        })
      : await api.getRecipes({
          page: 1,
          limit: 20
        });

    let recipesData: RecipeResponse[] = [];

    if (result && result.data && Array.isArray(result.data)) {
      recipesData = result.data;
    } else if (result && result.items && Array.isArray(result.items)) {
      recipesData = result.items;
    } else if (Array.isArray(result)) {
      recipesData = result;
    }

    recipes.value = recipesData;
  } catch (error) {
    console.error(error);

    recipes.value = [];

    toast.add({
      title: 'Ошибка',
      description: 'Не удалось загрузить рецепты',
      color: 'error'
    });
  } finally {
    isLoadingRecipes.value = false;
  }
}

const debouncedSearch = useDebounceFn(async () => {
  await fetchRecipes(searchQuery.value);
}, 400);

async function handleFocus() {
  isRecipesVisible.value = true;

  if (!recipes.value.length) {
    await fetchRecipes();
  }
}

function handleSearchInput() {
  isRecipesVisible.value = true;
  debouncedSearch();
}

function toggleRecipe(recipe: RecipeResponse) {
  if (isRecipeDisabled(recipe.id)) {
    if (selectedRecipeIds.value.length >= MAX_RECIPES && !selectedRecipeIds.value.includes(recipe.id)) {
      toast.add({
        title: 'Лимит рецептов',
        description: `Можно выбрать максимум ${MAX_RECIPES} рецепта`,
        color: 'warning'
      });
    }
    return;
  }

  const exists = selectedRecipeIds.value.includes(recipe.id);

  if (exists) {
    selectedRecipeIds.value =
      selectedRecipeIds.value.filter(id => id !== recipe.id);
  } else {
    selectedRecipeIds.value.push(recipe.id);
    isRecipesVisible.value = false;
  }
}

function removeRecipe(recipeId: string) {
  selectedRecipeIds.value =
    selectedRecipeIds.value.filter(id => id !== recipeId);
}

async function addRecipes() {
  if (!selectedRecipeIds.value.length) return;

  isAdding.value = true;

  try {
    for (const recipeId of selectedRecipeIds.value) {
      emit('recipe-added', recipeId);
    }

    toast.add({
      title: 'Успешно',
      description: `Добавлено рецептов: ${selectedRecipeIds.value.length}`,
      color: 'success'
    });

    closeModal();
  } catch (error) {
    console.error('Failed to add recipes:', error);
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось добавить рецепты',
      color: 'error'
    });
  } finally {
    isAdding.value = false;
  }
}

function closeModal() {
  isModalOpen.value = false;
}

function resetModal() {
  searchQuery.value = '';
  recipes.value = [];
  selectedRecipeIds.value = [];
  isRecipesVisible.value = false;
}

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick();
    searchInput.value?.inputRef?.focus?.();
  }
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.selected-enter-active,
.selected-leave-active {
  transition: all 0.2s ease;
}

.selected-enter-from,
.selected-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Только вертикальный скролл */
.overflow-y-auto {
  scrollbar-width: thin;
  overflow-x: hidden !important;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Принудительное отключение горизонтального скролла */
* {
  overflow-x: visible;
}

.max-h-\[400px\] {
  overflow-x: hidden !important;
}
</style>
