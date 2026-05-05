<script setup lang="ts">
import type { RecipeDto } from "~/shared/types/domain";

const props = defineProps<{
  recipe: RecipeDto;
}>();
</script>

<template>
  <article class="panel overflow-hidden">
    <img :src="props.recipe.imageUrl" :alt="props.recipe.title" class="h-48 w-full object-cover" loading="lazy">
    <div class="grid gap-3 p-4">
      <div class="flex items-center justify-between gap-3 text-sm text-gray-600">
        <span>{{ props.recipe.category.name }}</span>
        <span>{{ props.recipe.cookingTime }} мин</span>
      </div>
      <h3 class="text-xl font-bold">
        <NuxtLink :to="`/recipes/${props.recipe.srcPath}`">{{ props.recipe.title }}</NuxtLink>
      </h3>
      <p class="text-gray-700">{{ props.recipe.description }}</p>
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>{{ props.recipe.servings }} порции</span>
        <span>{{ props.recipe.likesCount }} лайков</span>
      </div>
    </div>
  </article>
</template>
