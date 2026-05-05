<script setup lang="ts">
import { demoRecipes } from "~/composables/useDemoContent";

definePageMeta({ layout: "cabinet" });
const statuses = ["Все", "Черновик", "На модерации", "Опубликован"];
</script>

<template>
  <section class="grid gap-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-black">Мои рецепты</h1>
      <button class="btn-primary" type="button">Создать рецепт</button>
    </div>
    <div class="flex flex-wrap gap-2">
      <button v-for="status in statuses" :key="status" class="btn-secondary" type="button">{{ status }}</button>
    </div>
    <div class="grid gap-5 md:grid-cols-2">
      <RecipeCard v-for="recipe in demoRecipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </section>
</template>
