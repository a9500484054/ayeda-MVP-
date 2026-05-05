<script setup lang="ts">
import { demoComments, demoRecipes } from "~/composables/useDemoContent";

const route = useRoute();
const recipe = computed(() => demoRecipes.find((item) => item.srcPath === route.params.srcPath));

if (!recipe.value) {
  throw createError({ statusCode: 404, statusMessage: "Recipe not found" });
}

useHead({
  title: `${recipe.value.title} - Ayeda`,
  meta: [{ name: "description", content: recipe.value.description }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.value.title,
        image: recipe.value.imageUrl,
        description: recipe.value.description,
        recipeYield: `${recipe.value.servings} порции`,
        totalTime: `PT${recipe.value.cookingTime}M`,
      }),
    },
  ],
});
</script>

<template>
  <article v-if="recipe" class="container-page grid gap-8 py-8">
    <img :src="recipe.imageUrl" :alt="recipe.title" class="max-h-[520px] w-full rounded-lg object-cover">
    <div class="grid gap-4">
      <p class="font-semibold text-green-800">{{ recipe.category.name }} · {{ recipe.cookingTime }} мин</p>
      <h1 class="text-4xl font-black">{{ recipe.title }}</h1>
      <p class="max-w-3xl text-lg text-gray-700">{{ recipe.description }}</p>
    </div>
    <section class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div class="panel p-5">
        <h2 class="text-2xl font-bold">Ингредиенты</h2>
        <ul class="mt-4 grid gap-2">
          <li v-for="item in recipe.ingredients" :key="item.ingredient.id">
            {{ item.ingredient.name }} - {{ item.amount }} {{ item.ingredient.unit.shortName }}
          </li>
        </ul>
      </div>
      <div class="panel p-5">
        <h2 class="text-2xl font-bold">Шаги</h2>
        <ol class="mt-4 grid gap-3">
          <li v-for="step in recipe.steps" :key="step.id">
            <strong>{{ step.order }}.</strong> {{ step.text }}
          </li>
        </ol>
      </div>
    </section>
    <CommentForm />
    <CommentList :comments="demoComments" />
  </article>
</template>
