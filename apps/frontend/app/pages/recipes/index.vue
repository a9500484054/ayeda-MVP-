<script setup lang="ts">
import { demoRecipes } from "~/composables/useDemoContent";

definePageMeta({ layout: "cabinet" });

const query = ref("");
const recipes = computed(() =>
  demoRecipes.filter((recipe) => recipe.title.toLowerCase().includes(query.value.toLowerCase())),
);

useHead({
  title: "Каталог рецептов - Ayeda",
  meta: [{ name: "description", content: "Каталог рецептов с поиском, фильтрами и сортировкой." }],
});
</script>

<template>
  <section class="container-page py-8">
    <h1 class="text-4xl font-black">Каталог рецептов</h1>
    <div class="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <FiltersSidebar />
      <div class="grid gap-5">
        <SearchBar v-model="query" />
        <div class="grid gap-5 md:grid-cols-2">
          <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
        </div>
        <Pagination />
      </div>
    </div>
  </section>
</template>
