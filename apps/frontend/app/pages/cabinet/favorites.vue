<script setup lang="ts">
import { demoRecipes } from "~/composables/useDemoContent";

definePageMeta({ layout: "cabinet" });
</script>

<template>
  <section class="grid gap-5">
    <h1 class="text-3xl font-black">Избранное</h1>
    <div class="grid gap-5 md:grid-cols-2">
      <RecipeCard v-for="recipe in demoRecipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </section>
</template>
