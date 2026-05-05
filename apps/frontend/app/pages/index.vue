<script setup lang="ts">
import { demoRecipes } from "~/composables/useDemoContent";

useHead({
  title: "Ayeda - планирование питания и рецепты",
  meta: [{ name: "description", content: "SaaS-сервис для рецептов, меню на неделю и списков покупок." }],
});
</script>

<template>
  <section class="container-page grid gap-10 py-12 lg:grid-cols-[1fr_440px] lg:items-center">
    <div class="grid gap-6">
      <h1 class="max-w-3xl text-5xl font-black leading-tight">План питания, рецепты и покупки в одном рабочем пространстве</h1>
      <p class="max-w-2xl text-lg text-gray-700">Ayeda помогает собрать рецепты, разложить их по дням и получить список покупок с агрегированными ингредиентами.</p>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/recipes" class="btn-primary">Смотреть рецепты</NuxtLink>
        <NuxtLink to="/register" class="btn-secondary">Создать аккаунт</NuxtLink>
      </div>
    </div>
    <img :src="demoRecipes[1]?.imageUrl" alt="Готовое блюдо" class="aspect-[4/3] w-full rounded-lg object-cover">
  </section>
  <section class="container-page grid gap-5 md:grid-cols-3">
    <div class="panel p-5"><h2 class="font-bold">CRUD рецептов</h2><p class="mt-2 text-gray-700">Черновики, модерация, публикация и медиа.</p></div>
    <div class="panel p-5"><h2 class="font-bold">Меню на неделю</h2><p class="mt-2 text-gray-700">Сетки по дням и приемам пищи.</p></div>
    <div class="panel p-5"><h2 class="font-bold">Списки покупок</h2><p class="mt-2 text-gray-700">Группировка по категориям и чекбоксы.</p></div>
  </section>
  <section class="container-page mt-12">
    <h2 class="mb-5 text-3xl font-black">Последние рецепты</h2>
    <div class="grid gap-5 md:grid-cols-2">
      <RecipeCard v-for="recipe in demoRecipes" :key="recipe.id" :recipe="recipe" />
    </div>
  </section>
</template>
