<template>
  <div
    v-if="recipe && recipe.id"
    class="recipe-search-card flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all"
    :class="{
      'border-green-400 bg-green-50 ring-2 ring-green-400': isSelected,
      'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50': !isSelected && !isDisabled,
      'border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed': isDisabled,
    }"
    @click="!isDisabled && handleClick()"
  >
    <!-- Изображение -->
    <div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
      <img
        v-if="recipe.photo && recipe.photo.src"
        :src="recipeImage"
        :alt="recipe.title || 'Рецепт'"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full items-center justify-center">
        <UIcon name="i-lucide-cooking-pot" class="h-6 w-6 text-zinc-400" />
      </div>
    </div>
    <!-- Информация -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h4 class="truncate font-medium" :class="isDisabled ? 'text-zinc-500' : 'text-zinc-800'">
          {{ recipe.title || 'Без названия' }}
        </h4>
        <span v-if="isDisabled" class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
          <UIcon name="i-lucide-check" class="mr-0.5 h-3 w-3" />
          Добавлен
        </span>
      </div>
      <div class="mt-1 flex flex-wrap gap-3 text-xs" :class="isDisabled ? 'text-zinc-400' : 'text-zinc-500'">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="h-3 w-3" />
          {{ recipe.cookingTime || 0 }} мин
        </span>
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-users" class="h-3 w-3" />
          {{ recipe.servings || 1 }} порц.
        </span>
        <span v-if="recipe.calories" class="flex items-center gap-1">
          <UIcon name="i-lucide-flame" class="h-3 w-3" />
          {{ recipe.calories }} ккал
        </span>
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-star" class="h-3 w-3" />
          {{ getDifficultyText(recipe.difficulty) }}
        </span>
      </div>
    </div>

    <!-- Индикатор выбора -->
    <div v-if="isSelected" class="flex-shrink-0">
      <UIcon name="i-lucide-check-circle" class="h-5 w-5 text-green-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeResponse } from '~/composables/useRecipesApi';

const props = defineProps<{
  recipe: RecipeResponse | null | undefined;
  isSelected: boolean;
  isDisabled?: boolean;
}>();

const emit = defineEmits<{
  select: [recipe: RecipeResponse];
}>();

const config = useRuntimeConfig()

function getDifficultyText(difficulty: string | undefined): string {
  if (difficulty === 'easy') return 'Легко';
  if (difficulty === 'medium') return 'Средне';
  if (difficulty === 'hard') return 'Сложно';
  return 'Средне';
}

function handleClick() {
  emit('select', props.recipe!);
}

const recipeImage = computed(() => {
  if (props.recipe.photo?.src) {
    return config.public.apiUrl + props.recipe.photo.src
  }
  return '/images/placeholder-recipe.jpg'
})
</script>

<style scoped>
.recipe-search-card {
  transition: all 0.2s ease;
}

.recipe-search-card:not(.opacity-50):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
